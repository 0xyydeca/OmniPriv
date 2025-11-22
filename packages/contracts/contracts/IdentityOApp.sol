// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {OApp, Origin, MessagingFee} from "@layerzerolabs/lz-evm-oapp-v2/contracts/oapp/OApp.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title IdentityOApp
 * @notice Cross-chain verification marker propagation via LayerZero v2
 * @dev Sends minimal verified flags between chains without PII
 */
contract IdentityOApp is OApp {
    // Events
    event VerificationSent(
        address indexed user,
        uint32 indexed dstEid,
        bytes32 policyId,
        bytes32 commitment,
        uint256 expiry
    );
    event VerificationReceived(
        address indexed user,
        uint32 indexed srcEid,
        bytes32 policyId,
        bytes32 commitment,
        uint256 expiry
    );

    // Structs
    struct CrossChainVerification {
        address user;
        bytes32 policyId;
        bytes32 commitment;
        uint256 expiry;
        uint32 sourceEid;
        uint256 timestamp;
        bool active;
    }

    // State
    mapping(address => mapping(bytes32 => CrossChainVerification))
        public verifications;
    mapping(address => bytes32[]) public userPolicies;

    // Errors
    error InvalidMessage();
    error VerificationExpired();

    /**
     * @notice Constructor
     * @param _endpoint LayerZero endpoint address
     * @param _owner Contract owner
     */
    constructor(address _endpoint, address _owner)
        OApp(_endpoint, _owner)
        Ownable(_owner)
    {}

    /**
     * @notice Send verification to another chain
     * @param dstEid Destination chain endpoint ID
     * @param user User address
     * @param policyId Policy identifier
     * @param commitment Credential commitment hash
     * @param expiry Expiration timestamp
     * @param options LayerZero execution options
     */
    function sendVerification(
        uint32 dstEid,
        address user,
        bytes32 policyId,
        bytes32 commitment,
        uint256 expiry,
        bytes calldata options
    ) external payable {
        if (expiry <= block.timestamp) revert VerificationExpired();

        bytes memory payload = abi.encode(
            user,
            policyId,
            commitment,
            expiry
        );

        _lzSend(
            dstEid,
            payload,
            options,
            MessagingFee(msg.value, 0),
            payable(msg.sender)
        );

        emit VerificationSent(user, dstEid, policyId, commitment, expiry);
    }

    /**
     * @notice Internal function to handle receiving messages from LayerZero
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
        (
            address user,
            bytes32 policyId,
            bytes32 commitment,
            uint256 expiry
        ) = abi.decode(message, (address, bytes32, bytes32, uint256));

        if (expiry <= block.timestamp) revert VerificationExpired();

        // Store verification
        verifications[user][policyId] = CrossChainVerification({
            user: user,
            policyId: policyId,
            commitment: commitment,
            expiry: expiry,
            sourceEid: origin.srcEid,
            timestamp: block.timestamp,
            active: true
        });

        // Track user policies
        userPolicies[user].push(policyId);

        emit VerificationReceived(
            user,
            origin.srcEid,
            policyId,
            commitment,
            expiry
        );
    }

    /**
     * @notice Check if user has valid cross-chain verification
     * @param user User address
     * @param policyId Policy identifier
     * @return bool True if valid verification exists
     */
    function isVerified(address user, bytes32 policyId)
        external
        view
        returns (bool)
    {
        CrossChainVerification memory v = verifications[user][policyId];
        return v.active && v.expiry > block.timestamp;
    }

    /**
     * @notice Get verification details
     * @param user User address
     * @param policyId Policy identifier
     */
    function getVerification(address user, bytes32 policyId)
        external
        view
        returns (CrossChainVerification memory)
    {
        return verifications[user][policyId];
    }

    /**
     * @notice Get all policy IDs for a user
     * @param user User address
     */
    function getUserPolicies(address user)
        external
        view
        returns (bytes32[] memory)
    {
        return userPolicies[user];
    }

    /**
     * @notice Quote the fee for sending a message
     * @param dstEid Destination endpoint ID
     * @param message Message payload
     * @param options Execution options
     * @param payInLzToken Whether to pay in LZ token
     */
    function quote(
        uint32 dstEid,
        bytes memory message,
        bytes memory options,
        bool payInLzToken
    ) public view returns (MessagingFee memory fee) {
        return _quote(dstEid, message, options, payInLzToken);
    }
}

