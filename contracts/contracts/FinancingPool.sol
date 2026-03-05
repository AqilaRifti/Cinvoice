// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./InvoiceNFT.sol";
import "./CreditScoreOracle.sol";

/**
 * @title FinancingPool
 * @notice Manages investment transactions, escrow, and repayment distribution
 * @dev Handles invoice purchases, repayments, and defaults with automated fee collection
 */
contract FinancingPool is ReentrancyGuard {
    // ============ Structs ============

    /**
     * @notice Investment record for an invoice purchase
     * @param investor Address of the investor who purchased the invoice
     * @param purchasePrice Amount paid by investor (discounted price)
     * @param purchaseTimestamp Unix timestamp of purchase
     */
    struct Investment {
        address investor;
        uint256 purchasePrice;
        uint256 purchaseTimestamp;
    }

    // ============ State Variables ============

    /// @notice Mapping of token ID to investment details
    mapping(uint256 => Investment) public investments;

    /// @notice InvoiceNFT contract reference
    InvoiceNFT public invoiceNFT;

    /// @notice CreditScoreOracle contract reference
    CreditScoreOracle public creditOracle;

    /// @notice PlatformGovernance contract address
    address public governance;

    /// @notice Platform fee in basis points (200 = 2%)
    uint256 public platformFeePercent;

    // ============ Events ============

    event InvoicePurchased(
        uint256 indexed tokenId,
        address indexed investor,
        uint256 purchasePrice,
        uint256 faceValue
    );

    event InvoiceRepaid(
        uint256 indexed tokenId,
        uint256 amount,
        uint256 platformFee,
        uint256 investorAmount
    );

    event InvoiceDefaulted(uint256 indexed tokenId, address indexed smb);

    event PlatformFeeUpdated(uint256 oldFee, uint256 newFee);

    // ============ Errors ============

    error InvalidAddress();
    error Unauthorized();
    error InvalidInvoiceState();
    error IncorrectPaymentAmount();
    error InvoiceNotFunded();
    error NotRepaymentTime();
    error AlreadyRepaid();
    error InvalidFeePercent();

    // ============ Modifiers ============

    modifier onlyGovernance() {
        if (msg.sender != governance) revert Unauthorized();
        _;
    }

    // ============ Constructor ============

    constructor(
        address _invoiceNFT,
        address _creditOracle,
        address _governance
    ) {
        if (_invoiceNFT == address(0) || _creditOracle == address(0) || _governance == address(0)) {
            revert InvalidAddress();
        }

        invoiceNFT = InvoiceNFT(_invoiceNFT);
        creditOracle = CreditScoreOracle(_creditOracle);
        governance = _governance;
        platformFeePercent = 200; // 2% default
    }

    // ============ External Functions ============

    /**
     * @notice Calculate purchase price for an invoice
     * @param tokenId ID of the invoice NFT
     * @return Purchase price in wei (face value minus discount)
     */
    function calculatePurchasePrice(uint256 tokenId) public view returns (uint256) {
        InvoiceNFT.Invoice memory invoice = invoiceNFT.getInvoiceDetails(tokenId);
        
        // Get discount rate from credit oracle (in basis points)
        uint256 discountRate = creditOracle.getDiscountRate(invoice.smb);
        
        // Calculate: purchasePrice = faceValue * (1000 - discountRate) / 1000
        uint256 purchasePrice = (invoice.faceValue * (1000 - discountRate)) / 1000;
        
        return purchasePrice;
    }

    /**
     * @notice Purchase an invoice NFT at discounted price
     * @param tokenId ID of the invoice NFT to purchase
     */
    function purchaseInvoice(uint256 tokenId) external payable nonReentrant {
        InvoiceNFT.Invoice memory invoice = invoiceNFT.getInvoiceDetails(tokenId);
        
        // Validate invoice is in Pending state
        if (invoice.state != InvoiceNFT.InvoiceState.Pending) {
            revert InvalidInvoiceState();
        }

        // Calculate purchase price
        uint256 purchasePrice = calculatePurchasePrice(tokenId);
        
        // Verify correct payment amount
        if (msg.value != purchasePrice) {
            revert IncorrectPaymentAmount();
        }

        // Get current owner (SMB)
        address smb = invoiceNFT.ownerOf(tokenId);

        // Transfer NFT from SMB to investor BEFORE updating state
        // Note: SMB must approve FinancingPool before calling purchaseInvoice
        invoiceNFT.transferFrom(smb, msg.sender, tokenId);

        // Update invoice state to Funded after transfer
        invoiceNFT.updateState(tokenId, InvoiceNFT.InvoiceState.Funded);

        // Transfer purchase price to SMB
        (bool success, ) = smb.call{value: purchasePrice}("");
        require(success, "Transfer to SMB failed");

        // Record investment
        investments[tokenId] = Investment({
            investor: msg.sender,
            purchasePrice: purchasePrice,
            purchaseTimestamp: block.timestamp
        });

        emit InvoicePurchased(tokenId, msg.sender, purchasePrice, invoice.faceValue);
    }

    /**
     * @notice Repay an invoice (callable by SMB)
     * @param tokenId ID of the invoice NFT to repay
     */
    function repayInvoice(uint256 tokenId) external payable nonReentrant {
        InvoiceNFT.Invoice memory invoice = invoiceNFT.getInvoiceDetails(tokenId);
        Investment memory investment = investments[tokenId];

        // Validate invoice is in Funded state
        if (invoice.state != InvoiceNFT.InvoiceState.Funded) {
            revert InvalidInvoiceState();
        }

        // Verify caller is the original SMB
        if (msg.sender != invoice.smb) {
            revert Unauthorized();
        }

        // Verify payment amount equals face value
        if (msg.value != invoice.faceValue) {
            revert IncorrectPaymentAmount();
        }

        // Calculate platform fee and investor amount
        uint256 platformFee = (invoice.faceValue * platformFeePercent) / 10000;
        uint256 investorAmount = invoice.faceValue - platformFee;

        // Update invoice state to Repaid
        invoiceNFT.updateState(tokenId, InvoiceNFT.InvoiceState.Repaid);

        // Update credit score (+50 for successful repayment)
        creditOracle.updateCreditScore(invoice.smb, 50);

        // Transfer investor amount to investor
        (bool successInvestor, ) = investment.investor.call{value: investorAmount}("");
        require(successInvestor, "Transfer to investor failed");

        // Transfer platform fee to governance treasury
        (bool successGov, ) = governance.call{value: platformFee}("");
        require(successGov, "Transfer to governance failed");

        emit InvoiceRepaid(tokenId, invoice.faceValue, platformFee, investorAmount);
    }

    /**
     * @notice Mark an invoice as defaulted (callable after repayment date)
     * @param tokenId ID of the invoice NFT
     */
    function markAsDefaulted(uint256 tokenId) external nonReentrant {
        InvoiceNFT.Invoice memory invoice = invoiceNFT.getInvoiceDetails(tokenId);

        // Validate invoice is in Funded state
        if (invoice.state != InvoiceNFT.InvoiceState.Funded) {
            revert InvalidInvoiceState();
        }

        // Verify repayment date has passed
        if (block.timestamp <= invoice.repaymentDate) {
            revert NotRepaymentTime();
        }

        // Update invoice state to Defaulted
        invoiceNFT.updateState(tokenId, InvoiceNFT.InvoiceState.Defaulted);

        // Update credit score (-100 for default)
        creditOracle.updateCreditScore(invoice.smb, -100);

        emit InvoiceDefaulted(tokenId, invoice.smb);
    }

    /**
     * @notice Set platform fee percentage
     * @param newFeePercent New fee in basis points (max 500 = 5%)
     */
    function setPlatformFee(uint256 newFeePercent) external onlyGovernance {
        if (newFeePercent > 500) {
            revert InvalidFeePercent();
        }

        uint256 oldFee = platformFeePercent;
        platformFeePercent = newFeePercent;

        emit PlatformFeeUpdated(oldFee, newFeePercent);
    }

    /**
     * @notice Refund investor (for dispute resolution)
     * @param tokenId ID of the invoice NFT
     * @dev Only callable by governance, funds come from governance treasury
     */
    function refundInvestor(uint256 tokenId) external payable onlyGovernance nonReentrant {
        Investment memory investment = investments[tokenId];
        
        if (investment.investor == address(0)) {
            revert InvoiceNotFunded();
        }

        // Transfer refund to investor
        (bool success, ) = investment.investor.call{value: msg.value}("");
        require(success, "Refund transfer failed");
    }

    /**
     * @notice Get investment details for an invoice
     * @param tokenId ID of the invoice NFT
     * @return Investment struct
     */
    function getInvestment(uint256 tokenId) external view returns (Investment memory) {
        return investments[tokenId];
    }
}
