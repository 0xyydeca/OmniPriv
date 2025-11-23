'use client';

import { VaultRecord } from '@omnipriv/sdk';

interface CredentialListProps {
  credentials: VaultRecord[];
  loading: boolean;
  onRefresh: () => void;
}

export function CredentialList({ credentials, loading, onRefresh }: CredentialListProps) {
  const formatExpiry = (expiry: number) => {
    const date = new Date(expiry * 1000);
    return date.toLocaleDateString();
  };

  const isExpired = (expiry: number) => {
    return expiry < Date.now() / 1000;
  };

  const isExpiringSoon = (expiry: number) => {
    const daysUntilExpiry = (expiry - Date.now() / 1000) / 86400;
    return daysUntilExpiry < 7 && daysUntilExpiry > 0;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse"
          ></div>
        ))}
      </div>
    );
  }

  if (credentials.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📭</div>
        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
          No Credentials Yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Add your first credential to get started with privacy-preserving verification
        </p>
        <button
          onClick={() => {}}
          className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          Add Credential
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Your Credentials</h2>
        <button
          onClick={onRefresh}
          className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
        >
          Refresh
        </button>
      </div>

      {credentials.map((record) => {
        const expired = isExpired(record.credential.expiry);
        const expiringSoon = isExpiringSoon(record.credential.expiry);

        return (
          <div
            key={record.id}
            className={`
              p-5 rounded-lg border-2 transition-all
              ${
                expired
                  ? 'bg-red-50 dark:bg-red-900/10 border-red-300 dark:border-red-700'
                  : expiringSoon
                  ? 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-300 dark:border-yellow-700'
                  : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-700'
              }
            `}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-2xl">
                    {expired ? '✗' : expiringSoon ? '!' : '✓'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      Credential
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      ID: {record.id.slice(0, 16)}...
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Hash:</span>
                    <p className="font-mono text-xs mt-1">
                      {record.credential.credential_hash.slice(0, 20)}...
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Expires:</span>
                    <p className="font-medium mt-1">
                      {formatExpiry(record.credential.expiry)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Added:</span>
                    <p className="font-medium mt-1">
                      {new Date(record.addedAt).toLocaleDateString()}
                    </p>
                  </div>
                  {record.lastUsed && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Last Used:</span>
                      <p className="font-medium mt-1">
                        {new Date(record.lastUsed).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="ml-4">
                {expired ? (
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300">
                    Expired
                  </span>
                ) : expiringSoon ? (
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300">
                    Expiring Soon
                  </span>
                ) : (
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                    Valid
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

