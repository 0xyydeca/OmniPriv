// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title VaultAnchor
 * @notice Stores commitment hashes for user credentials without revealing PII
 * @dev Each commitment is a Poseidon hash of (issuer_did, schema_id, salted_fields)
 */
contract VaultAnchor is Ownable, ReentrancyGuard {
    // Events
    event CommitmentAdded(
        address indexed user,
        bytes32 indexed commitment,
        uint256 expiry,
        uint256 timestamp
    );
    event CommitmentRevoked(
        address indexed user,
        bytes32 indexed commitment,
        uint256 timestamp
    );

    // Structs
    struct Commitment {
        bytes32 commitment;
        uint256 expiry;
        uint256 timestamp;
        bool revoked;
    }

    // State
    mapping(address => mapping(bytes32 => Commitment)) public commitments;
    mapping(address => bytes32[]) public userCommitments;

    // Errors
    error CommitmentAlreadyExists();
    error CommitmentNotFound();
    error CommitmentExpired();
    error AlreadyRevoked();
    error InvalidExpiry();
    error ZeroCommitment();

    constructor() Ownable(msg.sender) {}

    /**
     * @notice Add a new credential commitment
     * @param commitment The Poseidon hash of the credential
     * @param expiry Unix timestamp when the credential expires
     */
    function addCommitment(bytes32 commitment, uint256 expiry)
        external
        nonReentrant
    {
        if (commitment == bytes32(0)) revert ZeroCommitment();
        if (expiry <= block.timestamp) revert InvalidExpiry();
        if (commitments[msg.sender][commitment].commitment != bytes32(0)) {
            revert CommitmentAlreadyExists();
        }

        commitments[msg.sender][commitment] = Commitment({
            commitment: commitment,
            expiry: expiry,
            timestamp: block.timestamp,
            revoked: false
        });

        userCommitments[msg.sender].push(commitment);

        emit CommitmentAdded(msg.sender, commitment, expiry, block.timestamp);
    }

    /**
     * @notice Revoke a credential commitment
     * @param commitment The commitment hash to revoke
     */
    function revokeCommitment(bytes32 commitment) external nonReentrant {
        Commitment storage c = commitments[msg.sender][commitment];
        if (c.commitment == bytes32(0)) revert CommitmentNotFound();
        if (c.revoked) revert AlreadyRevoked();

        c.revoked = true;

        emit CommitmentRevoked(msg.sender, commitment, block.timestamp);
    }

    /**
     * @notice Check if a commitment is valid (exists, not expired, not revoked)
     * @param user The user address
     * @param commitment The commitment hash
     * @return bool True if valid
     */
    function isCommitmentValid(address user, bytes32 commitment)
        external
        view
        returns (bool)
    {
        Commitment memory c = commitments[user][commitment];
        return
            c.commitment != bytes32(0) &&
            c.expiry > block.timestamp &&
            !c.revoked;
    }

    /**
     * @notice Get all commitments for a user
     * @param user The user address
     * @return bytes32[] Array of commitment hashes
     */
    function getUserCommitments(address user)
        external
        view
        returns (bytes32[] memory)
    {
        return userCommitments[user];
    }

    /**
     * @notice Get commitment details
     * @param user The user address
     * @param commitment The commitment hash
     * @return Commitment struct
     */
    function getCommitment(address user, bytes32 commitment)
        external
        view
        returns (Commitment memory)
    {
        return commitments[user][commitment];
    }
}

