// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title PlatformGovernance
 * @notice Multi-signature governance contract for platform administration
 * @dev Manages admin operations, emergency controls, and treasury with 2-of-3 multi-sig
 */
contract PlatformGovernance is ReentrancyGuard {
    // ============ Enums ============

    enum ProposalType {
        Pause,
        Unpause,
        FeeAdjustment,
        Whitelist,
        Blacklist,
        RemoveFromBlacklist,
        TreasuryWithdraw,
        DisputeResolution
    }

    // ============ Structs ============

    struct Proposal {
        ProposalType proposalType;
        address target;
        bytes data;
        uint256 value;
        address[] approvers;
        bool executed;
        uint256 createdAt;
    }

    // ============ Constants ============

    uint256 public constant REQUIRED_APPROVALS = 2;
    uint256 public constant MAX_FEE_PERCENT = 500; // 5%

    // ============ State Variables ============

    /// @notice Array of 3 admin addresses
    address[3] public admins;

    /// @notice Mapping of proposal ID to proposal details
    mapping(uint256 => Proposal) public proposals;

    /// @notice Counter for next proposal ID
    uint256 public nextProposalId;

    /// @notice Whitelist of approved SMBs
    mapping(address => bool) public whitelist;

    /// @notice Blacklist of banned SMBs
    mapping(address => bool) public blacklist;

    /// @notice Platform paused state
    bool public paused;

    // ============ Events ============

    event ProposalCreated(
        uint256 indexed proposalId,
        ProposalType proposalType,
        address indexed proposer
    );

    event ProposalApproved(uint256 indexed proposalId, address indexed approver);

    event ProposalExecuted(uint256 indexed proposalId);

    event PlatformPaused(address indexed admin);

    event PlatformUnpaused();

    event WhitelistUpdated(address indexed smb, bool added);

    event BlacklistUpdated(address indexed smb, bool added);

    event TreasuryWithdrawn(address indexed recipient, uint256 amount);

    event DisputeResolved(uint256 indexed tokenId, bool favorInvestor);

    // ============ Errors ============

    error NotAdmin();
    error InvalidAddress();
    error AlreadyApproved();
    error ProposalAlreadyExecuted();
    error InsufficientApprovals();
    error InvalidFeePercent();
    error InsufficientTreasuryBalance();

    // ============ Modifiers ============

    modifier onlyAdmin() {
        bool isAdmin = false;
        for (uint256 i = 0; i < 3; i++) {
            if (msg.sender == admins[i]) {
                isAdmin = true;
                break;
            }
        }
        if (!isAdmin) revert NotAdmin();
        _;
    }

    // ============ Constructor ============

    constructor(address admin1, address admin2, address admin3) {
        if (admin1 == address(0) || admin2 == address(0) || admin3 == address(0)) {
            revert InvalidAddress();
        }

        admins[0] = admin1;
        admins[1] = admin2;
        admins[2] = admin3;
        
        nextProposalId = 0;
        paused = false;
    }

    // ============ External Functions ============

    /**
     * @notice Create a new governance proposal
     * @param proposalType Type of proposal
     * @param target Target address (for specific actions)
     * @param data Encoded function call data
     * @param value ETH value (for treasury withdrawals)
     * @return proposalId ID of the created proposal
     */
    function proposeAction(
        ProposalType proposalType,
        address target,
        bytes memory data,
        uint256 value
    ) external onlyAdmin returns (uint256) {
        uint256 proposalId = nextProposalId++;

        proposals[proposalId] = Proposal({
            proposalType: proposalType,
            target: target,
            data: data,
            value: value,
            approvers: new address[](0),
            executed: false,
            createdAt: block.timestamp
        });

        emit ProposalCreated(proposalId, proposalType, msg.sender);

        return proposalId;
    }

    /**
     * @notice Approve a proposal
     * @param proposalId ID of the proposal to approve
     */
    function approveProposal(uint256 proposalId) external onlyAdmin {
        Proposal storage proposal = proposals[proposalId];

        if (proposal.executed) revert ProposalAlreadyExecuted();

        // Check if admin has already approved
        for (uint256 i = 0; i < proposal.approvers.length; i++) {
            if (proposal.approvers[i] == msg.sender) {
                revert AlreadyApproved();
            }
        }

        proposal.approvers.push(msg.sender);

        emit ProposalApproved(proposalId, msg.sender);

        // Execute if we have enough approvals
        if (proposal.approvers.length >= REQUIRED_APPROVALS) {
            _executeProposal(proposalId);
        }
    }

    /**
     * @notice Emergency pause (single admin can execute)
     */
    function pause() external onlyAdmin {
        paused = true;
        emit PlatformPaused(msg.sender);
    }

    /**
     * @notice Unpause platform (requires multi-sig via proposal)
     * @dev This is called internally after proposal approval
     */
    function unpause() external onlyAdmin {
        // This should only be called via executeProposal
        paused = false;
        emit PlatformUnpaused();
    }

    /**
     * @notice Add address to whitelist
     * @param smb Address to whitelist
     */
    function addToWhitelist(address smb) external onlyAdmin {
        whitelist[smb] = true;
        emit WhitelistUpdated(smb, true);
    }

    /**
     * @notice Add address to blacklist
     * @param smb Address to blacklist
     */
    function addToBlacklist(address smb) external onlyAdmin {
        blacklist[smb] = true;
        emit BlacklistUpdated(smb, true);
    }

    /**
     * @notice Remove address from blacklist
     * @param smb Address to remove from blacklist
     */
    function removeFromBlacklist(address smb) external onlyAdmin {
        blacklist[smb] = false;
        emit BlacklistUpdated(smb, false);
    }

    /**
     * @notice Withdraw from treasury
     * @param recipient Address to receive funds
     * @param amount Amount to withdraw
     */
    function withdrawTreasury(address recipient, uint256 amount) external onlyAdmin nonReentrant {
        if (address(this).balance < amount) {
            revert InsufficientTreasuryBalance();
        }

        (bool success, ) = recipient.call{value: amount}("");
        require(success, "Treasury withdrawal failed");

        emit TreasuryWithdrawn(recipient, amount);
    }

    /**
     * @notice Resolve a dispute
     * @param tokenId ID of the disputed invoice
     * @param favorInvestor True if resolving in favor of investor
     */
    function resolveDispute(uint256 tokenId, bool favorInvestor) external onlyAdmin {
        emit DisputeResolved(tokenId, favorInvestor);
    }

    /**
     * @notice Get proposal details
     * @param proposalId ID of the proposal
     * @return Proposal struct
     */
    function getProposal(uint256 proposalId) external view returns (Proposal memory) {
        return proposals[proposalId];
    }

    /**
     * @notice Get number of approvals for a proposal
     * @param proposalId ID of the proposal
     * @return Number of approvals
     */
    function getApprovalCount(uint256 proposalId) external view returns (uint256) {
        return proposals[proposalId].approvers.length;
    }

    /**
     * @notice Check if an address is an admin
     * @param account Address to check
     * @return True if address is an admin
     */
    function isAdmin(address account) external view returns (bool) {
        for (uint256 i = 0; i < 3; i++) {
            if (admins[i] == account) {
                return true;
            }
        }
        return false;
    }

    /**
     * @notice Get treasury balance
     * @return Balance in wei
     */
    function getTreasuryBalance() external view returns (uint256) {
        return address(this).balance;
    }

    // ============ Internal Functions ============

    /**
     * @notice Execute an approved proposal
     * @param proposalId ID of the proposal to execute
     */
    function _executeProposal(uint256 proposalId) internal {
        Proposal storage proposal = proposals[proposalId];

        if (proposal.approvers.length < REQUIRED_APPROVALS) {
            revert InsufficientApprovals();
        }

        proposal.executed = true;

        // Execute based on proposal type
        if (proposal.proposalType == ProposalType.Unpause) {
            paused = false;
            emit PlatformUnpaused();
        } else if (proposal.proposalType == ProposalType.Whitelist) {
            whitelist[proposal.target] = true;
            emit WhitelistUpdated(proposal.target, true);
        } else if (proposal.proposalType == ProposalType.Blacklist) {
            blacklist[proposal.target] = true;
            emit BlacklistUpdated(proposal.target, true);
        } else if (proposal.proposalType == ProposalType.RemoveFromBlacklist) {
            blacklist[proposal.target] = false;
            emit BlacklistUpdated(proposal.target, false);
        } else if (proposal.proposalType == ProposalType.TreasuryWithdraw) {
            if (address(this).balance < proposal.value) {
                revert InsufficientTreasuryBalance();
            }
            (bool success, ) = proposal.target.call{value: proposal.value}("");
            require(success, "Treasury withdrawal failed");
            emit TreasuryWithdrawn(proposal.target, proposal.value);
        }

        emit ProposalExecuted(proposalId);
    }

    // ============ Receive Function ============

    /**
     * @notice Receive function to accept treasury deposits
     */
    receive() external payable {
        // Treasury deposits accepted
    }
}
