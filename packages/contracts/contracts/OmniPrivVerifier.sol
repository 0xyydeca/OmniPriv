// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {OApp, Origin} from "@layerzerolabs/lz-evm-oapp-v2/contracts/oapp/OApp.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title OmniPrivVerifier
 * @notice Chain B verifier - receives cross-chain verification flags via LayerZero
 * @dev Simplified receiver-only contract for demo dApps to query
 * Per OmniPriv 2.0 spec section 3: verified[userHash][policyId] = expiry
 */
contract OmniPrivVerifier is OApp {
    // Events
    event ClaimVerified(
        bytes32 indexed userHash,
        bytes32 indexed policyId,
        uint64 expiry,
        uint64 nonce,
        uint32 sourceEid
    );
    
    event NonceUpdated(
        bytes32 indexed userHash,
        bytes32 indexed policyId,
        uint64 oldNonce,
        uint64 newNonce
    );

    // State: verified[userHash][policyId] = expiry (per spec)
    mapping(bytes32 => mapping(bytes32 => uint64)) public verified;
    
    // Nonce tracking per (userHash, policyId) to prevent replay
    mapping(bytes32 => mapping(bytes32 => uint64)) public nonces;

    // Errors
    error InvalidMessage();
    error ExpiredClaim();
    error InvalidNonce();
    error UntrustedRemote();

    /**
     * @notice Constructor
     * @param _endpoint LayerZero endpoint address for this chain
     * @param _owner Contract owner
     */
    constructor(address _endpoint, address _owner)
        OApp(_endpoint, _owner)
        Ownable(_owner)
    {}

    /**
     * @notice Internal function to handle receiving messages from LayerZero
     * @dev Receives: { userHash: bytes32, policyId: bytes32, expiry: uint64, nonce: uint64 }
     * @param origin Message origin details
     * @param message Encoded verification data
     */
    function _lzReceive(
        Origin calldata origin,
        bytes32, /*guid*/
        bytes calldata message,
        address, /*executor*/
        bytes calldata /*extraData*/
    ) internal override {
        // Decode payload per spec section 3
        (
            bytes32 userHash,
            bytes32 policyId,
            uint64 expiry,
            uint64 nonce
        ) = abi.decode(message, (bytes32, bytes32, uint64, uint64));

        // Validation per spec section 3
        if (expiry <= block.timestamp) revert ExpiredClaim();
        
        // Nonce must be strictly increasing (prevent replay)
        uint64 currentNonce = nonces[userHash][policyId];
        if (nonce <= currentNonce) revert InvalidNonce();

        // Update state
        verified[userHash][policyId] = expiry;
        nonces[userHash][policyId] = nonce;

        emit ClaimVerified(userHash, policyId, expiry, nonce, origin.srcEid);
        emit NonceUpdated(userHash, policyId, currentNonce, nonce);
    }

    /**
     * @notice Check if user has valid verification for a policy
     * @dev Primary interface for demo dApps per spec section 3
     * @param userHash User identity hash (not wallet address)
     * @param policyId Policy identifier (e.g., keccak256("AGE18_COUNTRY_ALLOWED"))
     * @return bool True if verified and not expired
     */
    function isVerified(bytes32 userHash, bytes32 policyId)
        external
        view
        returns (bool)
    {
        uint64 expiry = verified[userHash][policyId];
        return expiry > 0 && expiry > block.timestamp;
    }

    /**
     * @notice Get expiry timestamp for a verification
     * @param userHash User identity hash
     * @param policyId Policy identifier
     * @return uint64 Expiry timestamp (0 if not verified)
     */
    function getExpiry(bytes32 userHash, bytes32 policyId)
        external
        view
        returns (uint64)
    {
        return verified[userHash][policyId];
    }

    /**
     * @notice Get current nonce for (userHash, policyId)
     * @param userHash User identity hash
     * @param policyId Policy identifier
     * @return uint64 Current nonce
     */
    function getNonce(bytes32 userHash, bytes32 policyId)
        external
        view
        returns (uint64)
    {
        return nonces[userHash][policyId];
    }
}

