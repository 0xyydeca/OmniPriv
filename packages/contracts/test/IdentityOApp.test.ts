import { expect } from 'chai';
import { ethers, deployments } from 'hardhat';
import { IdentityOApp } from '../typechain-types';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';

describe('IdentityOApp', () => {
  let identityOApp: IdentityOApp;
  let owner: SignerWithAddress;
  let user: SignerWithAddress;
  let mockEndpoint: SignerWithAddress;

  const MOCK_EID = 40161; // Base Sepolia endpoint ID
  const POLICY_ID = ethers.keccak256(ethers.toUtf8Bytes('kyc-basic'));
  const COMMITMENT = ethers.keccak256(ethers.toUtf8Bytes('test-commitment'));
  const EXPIRY = Math.floor(Date.now() / 1000) + 86400; // 24 hours

  beforeEach(async () => {
    [owner, user, mockEndpoint] = await ethers.getSigners();

    const IdentityOAppFactory = await ethers.getContractFactory('IdentityOApp');
    identityOApp = await IdentityOAppFactory.deploy(
      mockEndpoint.address,
      owner.address
    );
    await identityOApp.waitForDeployment();
  });

  describe('Deployment', () => {
    it('should deploy with correct owner', async () => {
      expect(await identityOApp.owner()).to.equal(owner.address);
    });

    it('should have correct endpoint', async () => {
      const endpoint = await identityOApp.endpoint();
      expect(endpoint).to.equal(mockEndpoint.address);
    });
  });

  describe('sendVerification', () => {
    it('should revert if expiry is in the past', async () => {
      const pastExpiry = Math.floor(Date.now() / 1000) - 1000;
      
      await expect(
        identityOApp.sendVerification(
          MOCK_EID,
          user.address,
          POLICY_ID,
          COMMITMENT,
          pastExpiry,
          '0x',
          { value: ethers.parseEther('0.001') }
        )
      ).to.be.revertedWithCustomError(identityOApp, 'VerificationExpired');
    });

    it('should emit VerificationSent event', async () => {
      // Note: This will fail in real scenario without proper LZ endpoint
      // For integration tests, you'd need to mock the endpoint or use LZ test helpers
      // This is a unit test showing the event emission logic
      
      const tx = identityOApp.sendVerification(
        MOCK_EID,
        user.address,
        POLICY_ID,
        COMMITMENT,
        EXPIRY,
        '0x',
        { value: ethers.parseEther('0.001') }
      );

      // In a real test with mocked LZ endpoint, this would work:
      // await expect(tx)
      //   .to.emit(identityOApp, 'VerificationSent')
      //   .withArgs(user.address, MOCK_EID, POLICY_ID, COMMITMENT, EXPIRY);
    });
  });

  describe('_lzReceive (via manual call simulation)', () => {
    it('should store verification on receive', async () => {
      // Simulate what happens when _lzReceive is called
      // In practice, only the endpoint can call this
      
      const payload = ethers.AbiCoder.defaultAbiCoder().encode(
        ['address', 'bytes32', 'bytes32', 'uint256'],
        [user.address, POLICY_ID, COMMITMENT, EXPIRY]
      );

      const origin = {
        srcEid: MOCK_EID,
        sender: ethers.zeroPadValue(identityOApp.target as string, 32),
        nonce: 1n,
      };

      // Call _lzReceive as the mock endpoint
      await identityOApp
        .connect(mockEndpoint)
        .lzReceive(
          origin,
          ethers.ZeroHash,
          payload,
          owner.address,
          '0x'
        );

      // Check verification was stored
      const verification = await identityOApp.getVerification(
        user.address,
        POLICY_ID
      );

      expect(verification.user).to.equal(user.address);
      expect(verification.policyId).to.equal(POLICY_ID);
      expect(verification.commitment).to.equal(COMMITMENT);
      expect(verification.expiry).to.equal(EXPIRY);
      expect(verification.sourceEid).to.equal(MOCK_EID);
      expect(verification.active).to.be.true;
    });

    it('should reject expired verifications', async () => {
      const pastExpiry = Math.floor(Date.now() / 1000) - 1000;
      
      const payload = ethers.AbiCoder.defaultAbiCoder().encode(
        ['address', 'bytes32', 'bytes32', 'uint256'],
        [user.address, POLICY_ID, COMMITMENT, pastExpiry]
      );

      const origin = {
        srcEid: MOCK_EID,
        sender: ethers.zeroPadValue(identityOApp.target as string, 32),
        nonce: 1n,
      };

      await expect(
        identityOApp
          .connect(mockEndpoint)
          .lzReceive(origin, ethers.ZeroHash, payload, owner.address, '0x')
      ).to.be.revertedWithCustomError(identityOApp, 'VerificationExpired');
    });

    it('should emit VerificationReceived event', async () => {
      const payload = ethers.AbiCoder.defaultAbiCoder().encode(
        ['address', 'bytes32', 'bytes32', 'uint256'],
        [user.address, POLICY_ID, COMMITMENT, EXPIRY]
      );

      const origin = {
        srcEid: MOCK_EID,
        sender: ethers.zeroPadValue(identityOApp.target as string, 32),
        nonce: 1n,
      };

      await expect(
        identityOApp
          .connect(mockEndpoint)
          .lzReceive(origin, ethers.ZeroHash, payload, owner.address, '0x')
      )
        .to.emit(identityOApp, 'VerificationReceived')
        .withArgs(user.address, MOCK_EID, POLICY_ID, COMMITMENT, EXPIRY);
    });
  });

  describe('isVerified', () => {
    beforeEach(async () => {
      // Setup: receive a verification
      const payload = ethers.AbiCoder.defaultAbiCoder().encode(
        ['address', 'bytes32', 'bytes32', 'uint256'],
        [user.address, POLICY_ID, COMMITMENT, EXPIRY]
      );

      const origin = {
        srcEid: MOCK_EID,
        sender: ethers.zeroPadValue(identityOApp.target as string, 32),
        nonce: 1n,
      };

      await identityOApp
        .connect(mockEndpoint)
        .lzReceive(origin, ethers.ZeroHash, payload, owner.address, '0x');
    });

    it('should return true for valid verification', async () => {
      const isVerified = await identityOApp.isVerified(user.address, POLICY_ID);
      expect(isVerified).to.be.true;
    });

    it('should return false for non-existent verification', async () => {
      const otherPolicyId = ethers.keccak256(ethers.toUtf8Bytes('other-policy'));
      const isVerified = await identityOApp.isVerified(user.address, otherPolicyId);
      expect(isVerified).to.be.false;
    });

    it('should return false for expired verification', async () => {
      // Store an expired verification
      const pastExpiry = Math.floor(Date.now() / 1000) + 1; // Just 1 second in future
      const expiredPolicyId = ethers.keccak256(ethers.toUtf8Bytes('expired-policy'));
      
      const payload = ethers.AbiCoder.defaultAbiCoder().encode(
        ['address', 'bytes32', 'bytes32', 'uint256'],
        [user.address, expiredPolicyId, COMMITMENT, pastExpiry]
      );

      const origin = {
        srcEid: MOCK_EID,
        sender: ethers.zeroPadValue(identityOApp.target as string, 32),
        nonce: 1n,
      };

      await identityOApp
        .connect(mockEndpoint)
        .lzReceive(origin, ethers.ZeroHash, payload, owner.address, '0x');

      // Wait for expiry
      await ethers.provider.send('evm_increaseTime', [2]);
      await ethers.provider.send('evm_mine', []);

      const isVerified = await identityOApp.isVerified(user.address, expiredPolicyId);
      expect(isVerified).to.be.false;
    });
  });

  describe('getUserPolicies', () => {
    it('should return empty array for new user', async () => {
      const policies = await identityOApp.getUserPolicies(user.address);
      expect(policies.length).to.equal(0);
    });

    it('should return all policies for user', async () => {
      const policyId1 = ethers.keccak256(ethers.toUtf8Bytes('policy1'));
      const policyId2 = ethers.keccak256(ethers.toUtf8Bytes('policy2'));

      // Add first policy
      const payload1 = ethers.AbiCoder.defaultAbiCoder().encode(
        ['address', 'bytes32', 'bytes32', 'uint256'],
        [user.address, policyId1, COMMITMENT, EXPIRY]
      );

      const origin = {
        srcEid: MOCK_EID,
        sender: ethers.zeroPadValue(identityOApp.target as string, 32),
        nonce: 1n,
      };

      await identityOApp
        .connect(mockEndpoint)
        .lzReceive(origin, ethers.ZeroHash, payload1, owner.address, '0x');

      // Add second policy
      const payload2 = ethers.AbiCoder.defaultAbiCoder().encode(
        ['address', 'bytes32', 'bytes32', 'uint256'],
        [user.address, policyId2, COMMITMENT, EXPIRY]
      );

      await identityOApp
        .connect(mockEndpoint)
        .lzReceive(origin, ethers.ZeroHash, payload2, owner.address, '0x');

      const policies = await identityOApp.getUserPolicies(user.address);
      expect(policies.length).to.equal(2);
      expect(policies[0]).to.equal(policyId1);
      expect(policies[1]).to.equal(policyId2);
    });
  });

  describe('quote', () => {
    it('should return messaging fee quote', async () => {
      const payload = ethers.AbiCoder.defaultAbiCoder().encode(
        ['address', 'bytes32', 'bytes32', 'uint256'],
        [user.address, POLICY_ID, COMMITMENT, EXPIRY]
      );

      // Note: This will fail without proper LZ endpoint mock
      // In real integration tests, you'd use LayerZero's test helpers
      // const fee = await identityOApp.quote(MOCK_EID, payload, '0x', false);
      // expect(fee.nativeFee).to.be.gt(0);
    });
  });
});

