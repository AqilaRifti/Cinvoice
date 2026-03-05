// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CreditScoreOracle
 * @notice On-chain credit scoring system for SMBs in the invoice financing platform
 * @dev Maintains credit scores (300-850 range) and calculates discount rates based on creditworthiness
 */
contract CreditScoreOracle {
    // ============ Structs ============

    /**
     * @notice Credit profile for an SMB
     * @param score Current credit score (300-850)
     * @param lastUpdated Timestamp of last score update
     * @param totalInvoices Total number of invoices minted
     * @param successfulRepayments Number of successful repayments
     * @param defaults Number of defaults
     */
    struct CreditProfile {
        uint256 score;
        uint256 lastUpdated;
        uint256 totalInvoices;
        uint256 successfulRepayments;
        uint256 defaults;
    }

    // ============ Constants ============

    uint256 public constant INITIAL_SCORE = 500;
    uint256 public constant MIN_SCORE = 300;
    uint256 public constant MAX_SCORE = 850;
    uint256 public constant REPAYMENT_BONUS = 50;
    uint256 public constant DEFAULT_PENALTY = 100;

    // ============ State Variables ============

    /// @notice Mapping of SMB address to their credit profile
    mapping(address => CreditProfile) public creditProfiles;

    /// @notice Address of the FinancingPool contract (authorized to update scores)
    address public financingPool;

    /// @notice Address of the Governance contract
    address public governance;

    // ============ Events ============

    event CreditScoreInitialized(address indexed smb, uint256 initialScore);
    event CreditScoreUpdated(
        address indexed smb,
        uint256 oldScore,
        uint256 newScore,
        int256 change
    );

    // ============ Errors ============

    error Unauthorized();
    error InvalidAddress();

    // ============ Modifiers ============

    modifier onlyFinancingPool() {
        if (msg.sender != financingPool) revert Unauthorized();
        _;
    }

    modifier onlyGovernance() {
        if (msg.sender != governance) revert Unauthorized();
        _;
    }

    // ============ Constructor ============

    constructor() {
        // Addresses will be set after deployment
    }

    // ============ External Functions ============

    /**
     * @notice Set the FinancingPool contract address
     * @param _financingPool Address of the FinancingPool contract
     */
    function setFinancingPool(address _financingPool) external {
        if (financingPool != address(0)) revert Unauthorized();
        if (_financingPool == address(0)) revert InvalidAddress();
        financingPool = _financingPool;
    }

    /**
     * @notice Set the Governance contract address
     * @param _governance Address of the Governance contract
     */
    function setGovernance(address _governance) external {
        if (governance != address(0)) revert Unauthorized();
        if (_governance == address(0)) revert InvalidAddress();
        governance = _governance;
    }

    /**
     * @notice Initialize credit score for a new SMB
     * @param smb Address of the SMB
     * @dev Auto-initializes to INITIAL_SCORE (500) on first call
     */
    function initializeCreditScore(address smb) external {
        if (smb == address(0)) revert InvalidAddress();
        
        // Only initialize if not already initialized
        if (creditProfiles[smb].lastUpdated == 0) {
            creditProfiles[smb] = CreditProfile({
                score: INITIAL_SCORE,
                lastUpdated: block.timestamp,
                totalInvoices: 0,
                successfulRepayments: 0,
                defaults: 0
            });

            emit CreditScoreInitialized(smb, INITIAL_SCORE);
        }
    }

    /**
     * @notice Get the credit score for an SMB
     * @param smb Address of the SMB
     * @return Current credit score (returns INITIAL_SCORE if not initialized)
     */
    function getCreditScore(address smb) external view returns (uint256) {
        if (creditProfiles[smb].lastUpdated == 0) {
            return INITIAL_SCORE;
        }
        return creditProfiles[smb].score;
    }

    /**
     * @notice Get the complete credit profile for an SMB
     * @param smb Address of the SMB
     * @return Credit profile struct
     */
    function getCreditProfile(address smb) external view returns (CreditProfile memory) {
        return creditProfiles[smb];
    }

    /**
     * @notice Calculate discount rate based on credit score
     * @param smb Address of the SMB
     * @return Discount rate in basis points (e.g., 550 = 55.0%)
     * @dev Formula: (MAX_SCORE - creditScore) * 1000 / (MAX_SCORE - MIN_SCORE)
     * Score 850 → 0% discount, Score 500 → ~63.6% discount, Score 300 → 100% discount
     */
    function getDiscountRate(address smb) external view returns (uint256) {
        uint256 score = creditProfiles[smb].lastUpdated == 0 
            ? INITIAL_SCORE 
            : creditProfiles[smb].score;
        
        // Calculate discount rate in basis points
        uint256 discountRate = ((MAX_SCORE - score) * 1000) / (MAX_SCORE - MIN_SCORE);
        return discountRate;
    }

    /**
     * @notice Update credit score for an SMB
     * @param smb Address of the SMB
     * @param change Change in credit score (positive or negative)
     * @dev Only callable by FinancingPool contract
     */
    function updateCreditScore(address smb, int256 change) external onlyFinancingPool {
        // Initialize if not already initialized
        if (creditProfiles[smb].lastUpdated == 0) {
            creditProfiles[smb] = CreditProfile({
                score: INITIAL_SCORE,
                lastUpdated: block.timestamp,
                totalInvoices: 0,
                successfulRepayments: 0,
                defaults: 0
            });
        }

        uint256 oldScore = creditProfiles[smb].score;
        int256 newScoreInt = int256(oldScore) + change;

        // Apply bounds: cap at MIN_SCORE and MAX_SCORE
        uint256 newScore;
        if (newScoreInt < int256(MIN_SCORE)) {
            newScore = MIN_SCORE;
        } else if (newScoreInt > int256(MAX_SCORE)) {
            newScore = MAX_SCORE;
        } else {
            newScore = uint256(newScoreInt);
        }

        // Update profile
        creditProfiles[smb].score = newScore;
        creditProfiles[smb].lastUpdated = block.timestamp;

        // Update counters based on change
        if (change > 0) {
            creditProfiles[smb].successfulRepayments++;
        } else if (change < 0) {
            creditProfiles[smb].defaults++;
        }

        emit CreditScoreUpdated(smb, oldScore, newScore, change);
    }

    /**
     * @notice Increment total invoices count for an SMB
     * @param smb Address of the SMB
     * @dev Called when a new invoice is minted
     */
    function incrementTotalInvoices(address smb) external onlyFinancingPool {
        if (creditProfiles[smb].lastUpdated == 0) {
            creditProfiles[smb] = CreditProfile({
                score: INITIAL_SCORE,
                lastUpdated: block.timestamp,
                totalInvoices: 1,
                successfulRepayments: 0,
                defaults: 0
            });
        } else {
            creditProfiles[smb].totalInvoices++;
        }
    }
}
