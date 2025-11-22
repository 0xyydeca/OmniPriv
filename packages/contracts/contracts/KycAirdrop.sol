// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title KycAirdrop
 * @notice Demo dApp that gates airdrop claims using OmniPriv verifications
 * @dev Per OmniPriv 2.0 spec section 1 & 3: demonstrates KYC-gated action on Chain B
 * Example: "Age ≥ 18 and not from blocked country" to claim tokens
 */
contract KycAirdrop is Ownable, ReentrancyGuard {
    // Events
    event AirdropClaimed(
        address indexed user,
        bytes32 indexed userHash,
        uint256 amount,
        bytes32 policyId
    );
    event AirdropConfigured(
        bytes32 indexed policyId,
        uint256 amountPerUser,
        uint256 totalSupply
    );

    // Structs
    struct AirdropConfig {
        bytes32 requiredPolicyId; // e.g., keccak256("AGE18_COUNTRY_ALLOWED")
        uint256 amountPerUser;
        uint256 totalSupply;
        uint256 claimed;
        bool active;
    }

    // State
    address public verifierContract; // OmniPrivVerifier address
    AirdropConfig public airdropConfig;
    mapping(address => bool) public hasClaimed;
    mapping(bytes32 => address) public userHashToAddress; // Track user mapping

    // Errors
    error NotVerified();
    error AlreadyClaimed();
    error AirdropInactive();
    error InsufficientSupply();
    error TransferFailed();
    error InvalidVerifier();

    /**
     * @notice Constructor
     * @param _verifier OmniPrivVerifier contract address
     * @param _owner Contract owner
     */
    constructor(address _verifier, address _owner)
        Ownable(_owner)
    {
        if (_verifier == address(0)) revert InvalidVerifier();
        verifierContract = _verifier;
    }

    /**
     * @notice Configure the airdrop parameters
     * @param policyId Required policy (e.g., "AGE18_COUNTRY_ALLOWED")
     * @param amountPerUser Amount each user can claim
     */
    function configureAirdrop(
        bytes32 policyId,
        uint256 amountPerUser
    ) external payable onlyOwner {
        airdropConfig = AirdropConfig({
            requiredPolicyId: policyId,
            amountPerUser: amountPerUser,
            totalSupply: msg.value,
            claimed: 0,
            active: true
        });

        emit AirdropConfigured(policyId, amountPerUser, msg.value);
    }

    /**
     * @notice Claim airdrop tokens
     * @dev User must have valid verification from OmniPrivVerifier
     * @param userHash User's identity hash (from ZK proof)
     * Per spec section 1: "dApp calls isVerified(userHash, policyId); if true, action proceeds"
     */
    function claim(bytes32 userHash) external nonReentrant {
        if (!airdropConfig.active) revert AirdropInactive();
        if (hasClaimed[msg.sender]) revert AlreadyClaimed();
        
        uint256 remaining = airdropConfig.totalSupply - airdropConfig.claimed;
        if (remaining < airdropConfig.amountPerUser) revert InsufficientSupply();

        // Core verification check per spec
        (bool success, bytes memory data) = verifierContract.staticcall(
            abi.encodeWithSignature(
                "isVerified(bytes32,bytes32)",
                userHash,
                airdropConfig.requiredPolicyId
            )
        );

        if (!success || !abi.decode(data, (bool))) {
            revert NotVerified();
        }

        // Mark as claimed
        hasClaimed[msg.sender] = true;
        userHashToAddress[userHash] = msg.sender;
        airdropConfig.claimed += airdropConfig.amountPerUser;

        // Transfer tokens
        (bool sent, ) = payable(msg.sender).call{value: airdropConfig.amountPerUser}("");
        if (!sent) revert TransferFailed();

        emit AirdropClaimed(
            msg.sender,
            userHash,
            airdropConfig.amountPerUser,
            airdropConfig.requiredPolicyId
        );
    }

    /**
     * @notice Check if user can claim (verified and hasn't claimed yet)
     * @param user User address
     * @param userHash User identity hash
     * @return bool True if can claim
     */
    function canClaim(address user, bytes32 userHash)
        external
        view
        returns (bool)
    {
        if (!airdropConfig.active || hasClaimed[user]) {
            return false;
        }

        uint256 remaining = airdropConfig.totalSupply - airdropConfig.claimed;
        if (remaining < airdropConfig.amountPerUser) {
            return false;
        }

        // Check verification
        (bool success, bytes memory data) = verifierContract.staticcall(
            abi.encodeWithSignature(
                "isVerified(bytes32,bytes32)",
                userHash,
                airdropConfig.requiredPolicyId
            )
        );

        return success && abi.decode(data, (bool));
    }

    /**
     * @notice Update verifier contract address
     * @param _verifier New verifier address
     */
    function setVerifier(address _verifier) external onlyOwner {
        if (_verifier == address(0)) revert InvalidVerifier();
        verifierContract = _verifier;
    }

    /**
     * @notice Pause/unpause airdrop
     * @param active New active state
     */
    function setActive(bool active) external onlyOwner {
        airdropConfig.active = active;
    }

    /**
     * @notice Withdraw remaining funds (owner only)
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        (bool sent, ) = payable(owner()).call{value: balance}("");
        if (!sent) revert TransferFailed();
    }

    /**
     * @notice Get airdrop status
     */
    function getStatus() external view returns (
        uint256 totalSupply,
        uint256 claimed,
        uint256 remaining,
        bool active
    ) {
        return (
            airdropConfig.totalSupply,
            airdropConfig.claimed,
            airdropConfig.totalSupply - airdropConfig.claimed,
            airdropConfig.active
        );
    }

    receive() external payable {}
}

