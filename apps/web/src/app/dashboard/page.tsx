'use client';

import { useAccount, useDisconnect } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CredentialList } from '@/components/CredentialList';
import { AddCredential } from '@/components/AddCredential';
import { VerifyProof } from '@/components/VerifyProof';
import { CrossChainBridge } from '@/components/CrossChainBridge';
import { getVault, VaultRecord } from '@omnipriv/sdk';

type Tab = 'credentials' | 'add' | 'verify' | 'bridge';

export default function Dashboard() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('credentials');
  const [credentials, setCredentials] = useState<VaultRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isConnected) {
      router.push('/');
    }
  }, [isConnected, router]);

  useEffect(() => {
    if (isConnected && address) {
      loadCredentials();
    }
  }, [isConnected, address]);

  const loadCredentials = async () => {
    try {
      setLoading(true);
      const vault = getVault();
      await vault.init();
      const creds = await vault.getAllCredentials();
      setCredentials(creds);
    } catch (error) {
      console.error('Failed to load credentials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCredentialAdded = () => {
    loadCredentials();
    setActiveTab('credentials');
  };

  if (!isConnected || !address) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
                OmniPriv
              </h1>
              <span className="text-sm text-gray-400" aria-label="Wallet address">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </span>
            </div>
            <button
              onClick={() => disconnect()}
              className="px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-gray-800"
              aria-label="Disconnect wallet"
            >
              Disconnect
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex -mb-px">
              {[
                { id: 'credentials', label: 'My Credentials', icon: '📁' },
                { id: 'add', label: 'Add Credential', icon: '➕' },
                { id: 'verify', label: 'Verify', icon: '✅' },
                { id: 'bridge', label: 'Cross-Chain', icon: '🌐' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as Tab)}
                  className={`
                    flex-1 py-4 px-6 text-sm font-medium transition-colors
                    ${
                      activeTab === tab.id
                        ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                    }
                  `}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'credentials' && (
              <CredentialList
                credentials={credentials}
                loading={loading}
                onRefresh={loadCredentials}
              />
            )}
            {activeTab === 'add' && (
              <AddCredential onCredentialAdded={handleCredentialAdded} />
            )}
            {activeTab === 'verify' && (
              <VerifyProof credentials={credentials} />
            )}
            {activeTab === 'bridge' && (
              <CrossChainBridge credentials={credentials} />
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">
              {credentials.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Total Credentials
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="text-3xl font-bold text-accent-600 dark:text-accent-400">
              {credentials.filter((c) => c.credential.expiry > Date.now() / 1000).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Valid Credentials
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {credentials.filter((c) => c.lastUsed).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Credentials Used
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

