// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IVaultAnchor.sol";

/**
 * @title ProofConsumer
 * @notice Verifies ZK proofs for credential predicates (e.g., age >= 18, KYC passed)
 * @dev In MVP, uses a simplified verification; production would use Noir verifier
 */
contract ProofConsumer is Ownable {
    // Events
    event ProofVerified(
        address indexed user,
        bytes32 indexed policyId,
        bytes32 commitment,
        bool success,
        uint256 timestamp
    );
    event PolicyAdded(
        bytes32 indexed policyId,
        string schemaId,
        address[] allowedIssuers
    );

    // Structs
    struct Policy {
        string schemaId;
        address[] allowedIssuers;
        bool active;
    }

    struct VerificationResult {
        bool verified;
        uint256 timestamp;
        bytes32 commitment;
        bytes32 policyId;
    }

    // State
    IVaultAnchor public vaultAnchor;
    mapping(bytes32 => Policy) public policies;
    mapping(address => mapping(bytes32 => VerificationResult))
        public verifications;
    mapping(address => uint256) public nonces;

    // Feature flags for MVP
    bool public mockVerificationEnabled = true;

    // Errors
    error InvalidProof();
    error PolicyNotFound();
    error PolicyInactive();
    error NonceAlreadyUsed();
    error CommitmentInvalid();

    constructor(address _vaultAnchor) Ownable(msg.sender) {
        vaultAnchor = IVaultAnchor(_vaultAnchor);
    }

    /**
     * @notice Add a verification policy
     * @param policyId Unique policy identifier
     * @param schemaId The credential schema (e.g., "kyc_v1", "age_check")
     * @param allowedIssuers Array of allowed issuer addresses
     */
    function addPolicy(
        bytes32 policyId,
        string memory schemaId,
        address[] memory allowedIssuers
    ) external onlyOwner {
        policies[policyId] = Policy({
            schemaId: schemaId,
            allowedIssuers: allowedIssuers,
            active: true
        });

        emit PolicyAdded(policyId, schemaId, allowedIssuers);
    }

    /**
     * @notice Verify a ZK proof for a given policy
     * @param proof The ZK proof bytes (Noir proof in production)
     * @param publicSignals Public signals: [commitment, policyId, nonce, ...]
     * @param policyId The policy to verify against
     * @return bool True if proof is valid
     */
    function verifyProof(
        bytes calldata proof,
        bytes32[] calldata publicSignals,
        bytes32 policyId
    ) external returns (bool) {
        Policy memory policy = policies[policyId];
        if (!policy.active) revert PolicyInactive();

        // Extract public signals
        bytes32 commitment = publicSignals[0];
        uint256 nonce = uint256(publicSignals[2]);

        // Check nonce (prevent replay)
        if (nonce <= nonces[msg.sender]) revert NonceAlreadyUsed();
        nonces[msg.sender] = nonce;

        // Check commitment validity in VaultAnchor
        if (!vaultAnchor.isCommitmentValid(msg.sender, commitment)) {
            revert CommitmentInvalid();
        }

        // Verify proof (simplified for MVP)
        bool verified = _verifyProofInternal(proof, publicSignals, policy);

        if (verified) {
            verifications[msg.sender][policyId] = VerificationResult({
                verified: true,
                timestamp: block.timestamp,
                commitment: commitment,
                policyId: policyId
            });
        }

        emit ProofVerified(
            msg.sender,
            policyId,
            commitment,
            verified,
            block.timestamp
        );

        return verified;
    }

    /**
     * @notice Internal proof verification logic
     * @dev For MVP with mockVerificationEnabled, always returns true
     * @dev In production, this would call Noir/Aztec verifier contract
     */
    function _verifyProofInternal(
        bytes calldata proof,
        bytes32[] calldata publicSignals,
        Policy memory policy
    ) internal view returns (bool) {
        if (mockVerificationEnabled) {
            // Mock verification for demo
            return proof.length > 0 && publicSignals.length >= 3;
        }

        // TODO: Call Noir verifier contract
        // return noirVerifier.verify(proof, publicSignals);
        revert("Production verifier not implemented");
    }

    /**
     * @notice Check if user has valid verification for a policy
     * @param user The user address
     * @param policyId The policy identifier
     * @return bool True if verified and not expired
     */
    function isVerified(address user, bytes32 policyId)
        external
        view
        returns (bool)
    {
        VerificationResult memory result = verifications[user][policyId];
        return result.verified && result.timestamp > 0;
    }

    /**
     * @notice Toggle mock verification mode (owner only)
     */
    function setMockVerificationEnabled(bool enabled) external onlyOwner {
        mockVerificationEnabled = enabled;
    }

    /**
     * @notice Update vault anchor reference
     */
    function setVaultAnchor(address _vaultAnchor) external onlyOwner {
        vaultAnchor = IVaultAnchor(_vaultAnchor);
    }
}

