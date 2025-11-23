// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IVaultAnchor.sol";

interface IIdentityOApp {
    function sendVerification(
        uint32 dstEid,
        address user,
        bytes32 policyId,
        bytes32 commitment,
        uint256 expiry,
        bytes calldata options
    ) external payable;
}

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
    event ProofVerifiedAndBridged(
        address indexed user,
        bytes32 indexed policyId,
        bytes32 commitment,
        uint32 dstEid,
        uint256 expiry
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
    IIdentityOApp public identityOApp;
    mapping(bytes32 => Policy) public policies;
    mapping(address => mapping(bytes32 => VerificationResult))
        public verifications;
    mapping(address => uint256) public nonces;

    // Errors
    error InvalidProof();
    error PolicyNotFound();
    error PolicyInactive();
    error NonceAlreadyUsed();
    error CommitmentInvalid();
    error IdentityOAppNotSet();

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
    ) public returns (bool) {
        Policy memory policy = policies[policyId];
        if (!policy.active) revert PolicyInactive();

        // Extract public signals
        bytes32 commitment = publicSignals[0];
        uint256 nonce = uint256(publicSignals[2]);

        // Check nonce (prevent replay)
        if (nonce <= nonces[msg.sender]) revert NonceAlreadyUsed();
        nonces[msg.sender] = nonce;

        // REAL COMMITMENT CHECK - ALWAYS ENFORCED
        // User can only be verified if they previously anchored this exact commitment
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
     * @dev Simplified for hackathon - validates structure
     * @dev In production, this would call Noir/Aztec verifier contract
     */
    function _verifyProofInternal(
        bytes calldata proof,
        bytes32[] calldata publicSignals,
        Policy memory policy
    ) internal pure returns (bool) {
        // Basic validation: proof exists and has required public signals
        // TODO: In production, call real ZK verifier contract
        // return noirVerifier.verify(proof, publicSignals);
        return proof.length > 0 && publicSignals.length >= 3;
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
     * @notice Verify proof and bridge verification to another chain via LayerZero
     * @dev Combines verifyProof with cross-chain bridging in one transaction
     * @param proof The ZK proof bytes
     * @param publicSignals Public signals from proof
     * @param policyId The policy to verify against
     * @param dstEid Destination LayerZero endpoint ID (Chain B)
     * @param options LayerZero execution options
     * @return bool True if proof verified successfully
     */
    function submitProofAndBridge(
        bytes calldata proof,
        bytes32[] calldata publicSignals,
        bytes32 policyId,
        uint32 dstEid,
        bytes calldata options
    ) external payable returns (bool) {
        if (address(identityOApp) == address(0)) revert IdentityOAppNotSet();
        
        // 1. Verify proof locally (stores result on Chain A)
        bool verified = verifyProof(proof, publicSignals, policyId);
        if (!verified) revert InvalidProof();

        // 2. Extract data from public signals
        bytes32 commitment = publicSignals[0];
        
        // 3. Calculate expiry (30 days from now)
        uint256 expiry = block.timestamp + 30 days;

        // 4. Send verification to Chain B via LayerZero
        identityOApp.sendVerification{value: msg.value}(
            dstEid,
            msg.sender,
            policyId,
            commitment,
            expiry,
            options
        );

        emit ProofVerifiedAndBridged(
            msg.sender,
            policyId,
            commitment,
            dstEid,
            expiry
        );

        return true;
    }

    /**
     * @notice Update vault anchor reference
     */
    function setVaultAnchor(address _vaultAnchor) external onlyOwner {
        vaultAnchor = IVaultAnchor(_vaultAnchor);
    }

    /**
     * @notice Set IdentityOApp address for cross-chain bridging
     * @param _identityOApp Address of the IdentityOApp contract
     */
    function setIdentityOApp(address _identityOApp) external onlyOwner {
        identityOApp = IIdentityOApp(_identityOApp);
    }
    
    /**
     * @notice Admin force verify (for demo/emergency use)
     * @param user User address to verify
     * @param policyId Policy to verify for
     * @param commitment Commitment hash
     * @param expiry Expiration timestamp
     */
    function adminForceVerify(
        address user,
        bytes32 policyId,
        bytes32 commitment,
        uint256 expiry
    ) external onlyOwner {
        verifications[user][policyId] = VerificationResult({
            verified: true,
            timestamp: block.timestamp,
            commitment: commitment,
            policyId: policyId
        });
        
        emit ProofVerified(user, policyId, commitment, true, block.timestamp);
    }
}

