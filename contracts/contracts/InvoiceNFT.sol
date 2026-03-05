// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./CreditScoreOracle.sol";

/**
 * @title InvoiceNFT
 * @notice ERC-721 NFT contract for tokenized invoices with state management
 * @dev Implements transfer restrictions and state machine for invoice lifecycle
 */
contract InvoiceNFT is ERC721URIStorage, Ownable, ReentrancyGuard {
    // ============ Enums ============

    /**
     * @notice Invoice lifecycle states
     * @param Pending Invoice minted, awaiting investor purchase
     * @param Funded Invoice purchased by investor, awaiting repayment
     * @param Repaid Invoice repaid by SMB
     * @param Defaulted Invoice past due date without repayment
     */
    enum InvoiceState {
        Pending,
        Funded,
        Repaid,
        Defaulted
    }

    // ============ Structs ============

    /**
     * @notice Invoice data structure
     * @param faceValue Original invoice amount in wei
     * @param repaymentDate Unix timestamp for repayment deadline
     * @param smb Address of the SMB that created the invoice
     * @param state Current state of the invoice
     * @param metadataURI IPFS hash containing invoice metadata
     * @param creditScoreAtMinting SMB's credit score when invoice was minted
     */
    struct Invoice {
        uint256 faceValue;
        uint256 repaymentDate;
        address smb;
        InvoiceState state;
        string metadataURI;
        uint256 creditScoreAtMinting;
    }

    // ============ State Variables ============

    /// @notice Mapping of token ID to invoice data
    mapping(uint256 => Invoice) public invoices;

    /// @notice Counter for next token ID
    uint256 public nextTokenId;

    /// @notice Address of the FinancingPool contract
    address public financingPool;

    /// @notice Address of the PlatformGovernance contract
    address public governance;

    /// @notice Address of the CreditScoreOracle contract
    CreditScoreOracle public creditOracle;

    // ============ Events ============

    event InvoiceMinted(
        uint256 indexed tokenId,
        address indexed smb,
        uint256 faceValue,
        uint256 repaymentDate,
        uint256 creditScore
    );

    event InvoiceStateChanged(
        uint256 indexed tokenId,
        InvoiceState oldState,
        InvoiceState newState
    );

    // ============ Errors ============

    error InvalidFaceValue();
    error InvalidRepaymentDate();
    error Unauthorized();
    error InvalidAddress();
    error InvalidStateTransition();
    error TransferRestricted();
    error InvoiceNotFound();

    // ============ Modifiers ============

    modifier onlyFinancingPoolOrGovernance() {
        if (msg.sender != financingPool && msg.sender != governance) {
            revert Unauthorized();
        }
        _;
    }

    // ============ Constructor ============

    constructor() ERC721("Invoice NFT", "INVOICE") Ownable(msg.sender) {
        nextTokenId = 0;
    }

    // ============ External Functions ============

    /**
     * @notice Set the FinancingPool contract address
     * @param _financingPool Address of the FinancingPool contract
     */
    function setFinancingPool(address _financingPool) external onlyOwner {
        if (_financingPool == address(0)) revert InvalidAddress();
        financingPool = _financingPool;
    }

    /**
     * @notice Set the PlatformGovernance contract address
     * @param _governance Address of the PlatformGovernance contract
     */
    function setGovernance(address _governance) external onlyOwner {
        if (_governance == address(0)) revert InvalidAddress();
        governance = _governance;
    }

    /**
     * @notice Set the CreditScoreOracle contract address
     * @param _creditOracle Address of the CreditScoreOracle contract
     */
    function setCreditOracle(address _creditOracle) external onlyOwner {
        if (_creditOracle == address(0)) revert InvalidAddress();
        creditOracle = CreditScoreOracle(_creditOracle);
    }

    /**
     * @notice Mint a new invoice NFT
     * @param metadataURI IPFS hash containing invoice metadata
     * @param faceValue Invoice amount in wei
     * @param repaymentDate Unix timestamp for repayment deadline
     * @return tokenId The ID of the newly minted invoice NFT
     */
    function mintInvoice(
        string memory metadataURI,
        uint256 faceValue,
        uint256 repaymentDate
    ) external nonReentrant returns (uint256) {
        // Validate inputs
        if (faceValue == 0) revert InvalidFaceValue();
        if (repaymentDate <= block.timestamp) revert InvalidRepaymentDate();

        // Check if sender is blacklisted (if governance is set)
        if (governance != address(0)) {
            (bool success, bytes memory data) = governance.staticcall(
                abi.encodeWithSignature("blacklist(address)", msg.sender)
            );
            if (success && data.length > 0) {
                bool isBlacklisted = abi.decode(data, (bool));
                if (isBlacklisted) revert Unauthorized();
            }
        }

        // Get current credit score
        uint256 creditScore = creditOracle.getCreditScore(msg.sender);

        // Mint NFT
        uint256 tokenId = nextTokenId++;
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, metadataURI);

        // Create invoice record
        invoices[tokenId] = Invoice({
            faceValue: faceValue,
            repaymentDate: repaymentDate,
            smb: msg.sender,
            state: InvoiceState.Pending,
            metadataURI: metadataURI,
            creditScoreAtMinting: creditScore
        });

        emit InvoiceMinted(tokenId, msg.sender, faceValue, repaymentDate, creditScore);

        return tokenId;
    }

    /**
     * @notice Update the state of an invoice
     * @param tokenId ID of the invoice NFT
     * @param newState New state to transition to
     * @dev Only callable by FinancingPool or Governance contracts
     */
    function updateState(uint256 tokenId, InvoiceState newState)
        external
        onlyFinancingPoolOrGovernance
    {
        if (tokenId >= nextTokenId) revert InvoiceNotFound();

        Invoice storage invoice = invoices[tokenId];
        InvoiceState oldState = invoice.state;

        // Validate state transition
        if (!_isValidStateTransition(oldState, newState)) {
            revert InvalidStateTransition();
        }

        invoice.state = newState;

        emit InvoiceStateChanged(tokenId, oldState, newState);
    }

    /**
     * @notice Get invoice details
     * @param tokenId ID of the invoice NFT
     * @return Invoice struct containing all invoice data
     */
    function getInvoiceDetails(uint256 tokenId) external view returns (Invoice memory) {
        if (tokenId >= nextTokenId) revert InvoiceNotFound();
        return invoices[tokenId];
    }

    // ============ Internal Functions ============

    /**
     * @notice Validate state transitions
     * @param from Current state
     * @param to New state
     * @return bool True if transition is valid
     */
    function _isValidStateTransition(InvoiceState from, InvoiceState to)
        internal
        pure
        returns (bool)
    {
        // Valid transitions:
        // Pending → Funded
        // Funded → Repaid
        // Funded → Defaulted
        
        if (from == InvoiceState.Pending && to == InvoiceState.Funded) {
            return true;
        }
        if (from == InvoiceState.Funded && (to == InvoiceState.Repaid || to == InvoiceState.Defaulted)) {
            return true;
        }
        
        return false;
    }

    /**
     * @notice Hook called before token transfer
     * @dev Blocks transfers when invoice is in Funded state
     */
    function _update(address to, uint256 tokenId, address auth)
        internal
        override
        returns (address)
    {
        address from = _ownerOf(tokenId);
        
        // Allow minting (from == address(0))
        if (from == address(0)) {
            return super._update(to, tokenId, auth);
        }

        // Check if invoice is in Funded state
        if (tokenId < nextTokenId) {
            Invoice storage invoice = invoices[tokenId];
            if (invoice.state == InvoiceState.Funded) {
                revert TransferRestricted();
            }
        }

        return super._update(to, tokenId, auth);
    }
}
