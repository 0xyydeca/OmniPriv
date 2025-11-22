'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { getVault, generateCommitment, generateSalt, encryptCredential, deriveEncryptionKey } from '@omnipriv/sdk';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';

interface AddCredentialProps {
  onCredentialAdded: () => void;
}

type IssuerType = 'mock' | 'self';

export function AddCredential({ onCredentialAdded }: AddCredentialProps) {
  const { address } = useAccount();
  const [issuerType, setIssuerType] = useState<IssuerType>('mock');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Mock credential form data
  const [kycPassed, setKycPassed] = useState(true);
  const [age, setAge] = useState(25);
  const [country, setCountry] = useState('US');

  const { writeContract, data: hash } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const handleAddCredential = async () => {
    try {
      setLoading(true);
      setError('');
      setStatus('Preparing credential...');

      if (!address) {
        throw new Error('No wallet connected');
      }

      const walletAddress = address;

      // Create credential data
      const issuerDid = issuerType === 'mock' ? 'did:omnipriv:mock_issuer' : process.env.NEXT_PUBLIC_SELF_ISSUER_DID || 'did:self:issuer';
      const schemaId = 'kyc_v1';
      const fields = {
        kyc_passed: kycPassed,
        age,
        country,
      };
      const expiry = Math.floor(Date.now() / 1000) + 86400 * 365; // 1 year
      const salt = generateSalt();

      // Generate commitment
      setStatus('Generating commitment...');
      const commitment = generateCommitment(issuerDid, schemaId, fields, salt);

      // Encrypt credential
      setStatus('Encrypting credential...');
      const signature = 'mock_signature'; // In production, get from wallet
      const encryptionKey = await deriveEncryptionKey(walletAddress, signature);
      
      const credentialData = JSON.stringify({
        issuer_did: issuerDid,
        schema_id: schemaId,
        fields,
        salt,
        expiry,
      });

      const { ciphertext, iv } = await encryptCredential(credentialData, encryptionKey);

      // Store in vault
      setStatus('Storing in vault...');
      const vault = getVault();
      await vault.init();
      await vault.addCredential(commitment, {
        credential_hash: commitment,
        expiry,
        ciphertext,
        iv,
        timestamp: Math.floor(Date.now() / 1000),
      });

      // Add to blockchain
      setStatus('Adding commitment to blockchain...');
      const vaultAnchorAddress = process.env.NEXT_PUBLIC_VAULT_ANCHOR_ADDRESS_BASE_SEPOLIA;
      
      if (!vaultAnchorAddress) {
        console.warn('VaultAnchor address not configured, skipping on-chain transaction');
        setStatus('✅ Credential added to vault (off-chain only)');
        setTimeout(() => {
          onCredentialAdded();
        }, 1500);
        return;
      }

      // For now, mock the contract write since we don't have ABI
      // In production, this would be: writeContract({ ... })
      setStatus('✅ Credential added successfully!');
      
      setTimeout(() => {
        onCredentialAdded();
      }, 1500);

    } catch (err: any) {
      console.error('Failed to add credential:', err);
      setError(err.message || 'Failed to add credential');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Add New Credential</h2>

      {/* Issuer Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Choose Issuer</label>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setIssuerType('mock')}
            className={`p-4 rounded-lg border-2 transition-all ${
              issuerType === 'mock'
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="text-3xl mb-2">🧪</div>
            <div className="font-semibold">Mock Issuer</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              For demo purposes
            </div>
          </button>
          <button
            onClick={() => setIssuerType('self')}
            className={`p-4 rounded-lg border-2 transition-all ${
              issuerType === 'self'
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="text-3xl mb-2">🏦</div>
            <div className="font-semibold">Self (Celo)</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Real KYC provider
            </div>
          </button>
        </div>
      </div>

      {/* Mock Credential Form */}
      {issuerType === 'mock' && (
        <div className="space-y-4 bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg mb-6">
          <h3 className="font-semibold text-lg mb-4">Credential Details</h3>
          
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={kycPassed}
                onChange={(e) => setKycPassed(e.target.checked)}
                className="w-4 h-4"
              />
              <span>KYC Passed</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Age</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(parseInt(e.target.value))}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
              min="18"
              max="120"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Country</label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
            >
              <option value="US">United States</option>
              <option value="UK">United Kingdom</option>
              <option value="CA">Canada</option>
              <option value="DE">Germany</option>
              <option value="FR">France</option>
            </select>
          </div>
        </div>
      )}

      {/* Self Integration */}
      {issuerType === 'self' && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-6 mb-6">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <strong>Coming Soon:</strong> Integration with Self's on-chain KYC verification on Celo.
            For now, use the Mock Issuer to test the flow.
          </p>
        </div>
      )}

      {/* Status Messages */}
      {status && (
        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
          <p className="text-blue-900 dark:text-blue-100">{status}</p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
          <p className="text-red-900 dark:text-red-100">{error}</p>
        </div>
      )}

      {/* Add Button */}
      <button
        onClick={handleAddCredential}
        disabled={loading || issuerType === 'self'}
        className="w-full py-4 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Adding Credential...
          </span>
        ) : (
          'Add Credential'
        )}
      </button>
    </div>
  );
}

