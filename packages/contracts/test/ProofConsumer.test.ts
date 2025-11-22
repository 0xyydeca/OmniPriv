import { expect } from 'chai';
import { ethers } from 'hardhat';
import { VaultAnchor, ProofConsumer } from '../typechain-types';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';

describe('ProofConsumer', function () {
  let vaultAnchor: VaultAnchor;
  let proofConsumer: ProofConsumer;
  let owner: SignerWithAddress;
  let user: SignerWithAddress;

  const testCommitment = ethers.keccak256(ethers.toUtf8Bytes('test_credential'));
  const futureExpiry = Math.floor(Date.now() / 1000) + 86400 * 30;
  const policyId = ethers.keccak256(ethers.toUtf8Bytes('kyc_v1'));

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();

    const VaultAnchorFactory = await ethers.getContractFactory('VaultAnchor');
    vaultAnchor = await VaultAnchorFactory.deploy();
    await vaultAnchor.waitForDeployment();

    const ProofConsumerFactory = await ethers.getContractFactory('ProofConsumer');
    proofConsumer = await ProofConsumerFactory.deploy(await vaultAnchor.getAddress());
    await proofConsumer.waitForDeployment();

    // Add test policy
    await proofConsumer.addPolicy(policyId, 'kyc_v1', [owner.address]);
  });

  describe('Deployment', function () {
    it('should deploy with correct vault anchor', async function () {
      expect(await proofConsumer.vaultAnchor()).to.equal(await vaultAnchor.getAddress());
    });

    it('should have mock verification enabled', async function () {
      expect(await proofConsumer.mockVerificationEnabled()).to.be.true;
    });
  });

  describe('Policy Management', function () {
    it('should add a policy', async function () {
      const newPolicyId = ethers.keccak256(ethers.toUtf8Bytes('age_check'));
      await expect(
        proofConsumer.addPolicy(newPolicyId, 'age_check', [owner.address])
      )
        .to.emit(proofConsumer, 'PolicyAdded')
        .withArgs(newPolicyId, 'age_check', [owner.address]);

      const policy = await proofConsumer.policies(newPolicyId);
      expect(policy.schemaId).to.equal('age_check');
      expect(policy.active).to.be.true;
    });

    it('should only allow owner to add policies', async function () {
      const newPolicyId = ethers.keccak256(ethers.toUtf8Bytes('test'));
      await expect(
        proofConsumer.connect(user).addPolicy(newPolicyId, 'test', [])
      ).to.be.revertedWithCustomError(proofConsumer, 'OwnableUnauthorizedAccount');
    });
  });

  describe('Proof Verification', function () {
    beforeEach(async function () {
      // Add commitment to vault
      await vaultAnchor.connect(user).addCommitment(testCommitment, futureExpiry);
    });

    it('should verify a valid proof (mock mode)', async function () {
      const proof = ethers.toUtf8Bytes('mock_proof_data');
      const nonce = 1;
      const publicSignals = [testCommitment, policyId, ethers.toBeHex(nonce, 32)];

      await expect(
        proofConsumer.connect(user).verifyProof(proof, publicSignals, policyId)
      )
        .to.emit(proofConsumer, 'ProofVerified')
        .withArgs(user.address, policyId, testCommitment, true, await getBlockTimestamp());

      expect(await proofConsumer.isVerified(user.address, policyId)).to.be.true;
    });

    it('should reject proof with invalid commitment', async function () {
      const invalidCommitment = ethers.keccak256(ethers.toUtf8Bytes('invalid'));
      const proof = ethers.toUtf8Bytes('mock_proof');
      const nonce = 1;
      const publicSignals = [invalidCommitment, policyId, ethers.toBeHex(nonce, 32)];

      await expect(
        proofConsumer.connect(user).verifyProof(proof, publicSignals, policyId)
      ).to.be.revertedWithCustomError(proofConsumer, 'CommitmentInvalid');
    });

    it('should reject proof with reused nonce', async function () {
      const proof = ethers.toUtf8Bytes('mock_proof');
      const nonce = 1;
      const publicSignals = [testCommitment, policyId, ethers.toBeHex(nonce, 32)];

      // First verification succeeds
      await proofConsumer.connect(user).verifyProof(proof, publicSignals, policyId);

      // Second verification with same nonce fails
      await expect(
        proofConsumer.connect(user).verifyProof(proof, publicSignals, policyId)
      ).to.be.revertedWithCustomError(proofConsumer, 'NonceAlreadyUsed');
    });

    it('should reject proof for inactive policy', async function () {
      const inactivePolicyId = ethers.keccak256(ethers.toUtf8Bytes('inactive'));
      const proof = ethers.toUtf8Bytes('mock_proof');
      const publicSignals = [testCommitment, inactivePolicyId, ethers.toBeHex(1, 32)];

      await expect(
        proofConsumer.connect(user).verifyProof(proof, publicSignals, inactivePolicyId)
      ).to.be.revertedWithCustomError(proofConsumer, 'PolicyInactive');
    });
  });

  describe('Mock Verification Toggle', function () {
    it('should allow owner to disable mock verification', async function () {
      await proofConsumer.setMockVerificationEnabled(false);
      expect(await proofConsumer.mockVerificationEnabled()).to.be.false;
    });

    it('should not allow non-owner to toggle mock verification', async function () {
      await expect(
        proofConsumer.connect(user).setMockVerificationEnabled(false)
      ).to.be.revertedWithCustomError(proofConsumer, 'OwnableUnauthorizedAccount');
    });
  });
});

async function getBlockTimestamp(): Promise<number> {
  const block = await ethers.provider.getBlock('latest');
  return block!.timestamp;
}

