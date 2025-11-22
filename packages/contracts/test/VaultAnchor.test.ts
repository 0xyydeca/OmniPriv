import { expect } from 'chai';
import { ethers } from 'hardhat';
import { VaultAnchor } from '../typechain-types';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';

describe('VaultAnchor', function () {
  let vaultAnchor: VaultAnchor;
  let owner: SignerWithAddress;
  let user: SignerWithAddress;

  const testCommitment = ethers.keccak256(ethers.toUtf8Bytes('test_credential'));
  const futureExpiry = Math.floor(Date.now() / 1000) + 86400 * 30; // 30 days

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();

    const VaultAnchorFactory = await ethers.getContractFactory('VaultAnchor');
    vaultAnchor = await VaultAnchorFactory.deploy();
    await vaultAnchor.waitForDeployment();
  });

  describe('Deployment', function () {
    it('should deploy with correct owner', async function () {
      expect(await vaultAnchor.owner()).to.equal(owner.address);
    });
  });

  describe('Add Commitment', function () {
    it('should add a valid commitment', async function () {
      await expect(
        vaultAnchor.connect(user).addCommitment(testCommitment, futureExpiry)
      )
        .to.emit(vaultAnchor, 'CommitmentAdded')
        .withArgs(user.address, testCommitment, futureExpiry, await getBlockTimestamp());

      const commitment = await vaultAnchor.getCommitment(user.address, testCommitment);
      expect(commitment.commitment).to.equal(testCommitment);
      expect(commitment.expiry).to.equal(futureExpiry);
      expect(commitment.revoked).to.be.false;
    });

    it('should revert on zero commitment', async function () {
      await expect(
        vaultAnchor.connect(user).addCommitment(ethers.ZeroHash, futureExpiry)
      ).to.be.revertedWithCustomError(vaultAnchor, 'ZeroCommitment');
    });

    it('should revert on expired commitment', async function () {
      const pastExpiry = Math.floor(Date.now() / 1000) - 1;
      await expect(
        vaultAnchor.connect(user).addCommitment(testCommitment, pastExpiry)
      ).to.be.revertedWithCustomError(vaultAnchor, 'InvalidExpiry');
    });

    it('should revert on duplicate commitment', async function () {
      await vaultAnchor.connect(user).addCommitment(testCommitment, futureExpiry);
      await expect(
        vaultAnchor.connect(user).addCommitment(testCommitment, futureExpiry)
      ).to.be.revertedWithCustomError(vaultAnchor, 'CommitmentAlreadyExists');
    });
  });

  describe('Revoke Commitment', function () {
    beforeEach(async function () {
      await vaultAnchor.connect(user).addCommitment(testCommitment, futureExpiry);
    });

    it('should revoke a commitment', async function () {
      await expect(vaultAnchor.connect(user).revokeCommitment(testCommitment))
        .to.emit(vaultAnchor, 'CommitmentRevoked')
        .withArgs(user.address, testCommitment, await getBlockTimestamp());

      const commitment = await vaultAnchor.getCommitment(user.address, testCommitment);
      expect(commitment.revoked).to.be.true;
    });

    it('should revert revoking nonexistent commitment', async function () {
      const otherCommitment = ethers.keccak256(ethers.toUtf8Bytes('other'));
      await expect(
        vaultAnchor.connect(user).revokeCommitment(otherCommitment)
      ).to.be.revertedWithCustomError(vaultAnchor, 'CommitmentNotFound');
    });

    it('should revert revoking already revoked commitment', async function () {
      await vaultAnchor.connect(user).revokeCommitment(testCommitment);
      await expect(
        vaultAnchor.connect(user).revokeCommitment(testCommitment)
      ).to.be.revertedWithCustomError(vaultAnchor, 'CommitmentRevoked');
    });
  });

  describe('Commitment Validation', function () {
    it('should return false for nonexistent commitment', async function () {
      expect(
        await vaultAnchor.isCommitmentValid(user.address, testCommitment)
      ).to.be.false;
    });

    it('should return true for valid commitment', async function () {
      await vaultAnchor.connect(user).addCommitment(testCommitment, futureExpiry);
      expect(
        await vaultAnchor.isCommitmentValid(user.address, testCommitment)
      ).to.be.true;
    });

    it('should return false for revoked commitment', async function () {
      await vaultAnchor.connect(user).addCommitment(testCommitment, futureExpiry);
      await vaultAnchor.connect(user).revokeCommitment(testCommitment);
      expect(
        await vaultAnchor.isCommitmentValid(user.address, testCommitment)
      ).to.be.false;
    });
  });

  describe('Get User Commitments', function () {
    it('should return empty array for new user', async function () {
      const commitments = await vaultAnchor.getUserCommitments(user.address);
      expect(commitments).to.have.length(0);
    });

    it('should return all user commitments', async function () {
      const commitment1 = ethers.keccak256(ethers.toUtf8Bytes('cred1'));
      const commitment2 = ethers.keccak256(ethers.toUtf8Bytes('cred2'));

      await vaultAnchor.connect(user).addCommitment(commitment1, futureExpiry);
      await vaultAnchor.connect(user).addCommitment(commitment2, futureExpiry);

      const commitments = await vaultAnchor.getUserCommitments(user.address);
      expect(commitments).to.have.length(2);
      expect(commitments[0]).to.equal(commitment1);
      expect(commitments[1]).to.equal(commitment2);
    });
  });
});

async function getBlockTimestamp(): Promise<number> {
  const block = await ethers.provider.getBlock('latest');
  return block!.timestamp;
}

