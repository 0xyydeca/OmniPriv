// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IVaultAnchor {
    struct Commitment {
        bytes32 commitment;
        uint256 expiry;
        uint256 timestamp;
        bool revoked;
    }

    function addCommitment(bytes32 commitment, uint256 expiry) external;

    function revokeCommitment(bytes32 commitment) external;

    function isCommitmentValid(address user, bytes32 commitment)
        external
        view
        returns (bool);

    function getUserCommitments(address user)
        external
        view
        returns (bytes32[] memory);

    function getCommitment(address user, bytes32 commitment)
        external
        view
        returns (Commitment memory);
}

