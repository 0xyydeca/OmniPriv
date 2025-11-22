'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { ready, authenticated, login } = usePrivy();
  const router = useRouter();

  useEffect(() => {
    if (ready && authenticated) {
      router.push('/dashboard');
    }
  }, [ready, authenticated, router]);

  const handleGetStarted = () => {
    login();
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 md:p-24">
      <div className="max-w-4xl w-full space-y-8 text-center">
        {/* Hero Section */}
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
            PrivID
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300">
            Privacy-Preserving Cross-Chain Identity
          </p>
        </div>

        {/* Problem Statement */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700">
          <p className="text-lg text-gray-700 dark:text-gray-300">
            On-chain apps need to verify user attributes (KYC, age, country, reputation)
            <span className="font-semibold text-primary-600 dark:text-primary-400"> without doxxing users</span> or
            <span className="font-semibold text-accent-600 dark:text-accent-400"> fragmenting identity across chains</span>.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
          <div className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 p-6 rounded-xl border border-primary-200 dark:border-primary-700">
            <div className="text-4xl mb-4">🔐</div>
            <h3 className="text-lg font-semibold mb-2">Zero-Knowledge Proofs</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Prove attributes without revealing personal data
            </p>
          </div>

          <div className="bg-gradient-to-br from-accent-50 to-accent-100 dark:from-accent-900/20 dark:to-accent-800/20 p-6 rounded-xl border border-accent-200 dark:border-accent-700">
            <div className="text-4xl mb-4">🌐</div>
            <h3 className="text-lg font-semibold mb-2">Cross-Chain Ready</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              One identity, verified everywhere via LayerZero
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-6 rounded-xl border border-green-200 dark:border-green-700">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-lg font-semibold mb-2">Gasless Onboarding</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Embedded wallets with sponsored transactions
            </p>
          </div>
        </div>

        {/* User Journey */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700 text-left">
          <h2 className="text-2xl font-bold mb-6 text-center">How It Works</h2>
          <div className="space-y-4">
            {[
              { step: 1, text: 'Create your embedded wallet (gasless, instant)' },
              { step: 2, text: 'Add credentials from trusted issuers' },
              { step: 3, text: 'Generate zero-knowledge proofs for any dApp' },
              { step: 4, text: 'Reuse verification across any chain' },
            ].map(({ step, text }) => (
              <div key={step} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center font-semibold">
                  {step}
                </div>
                <p className="text-gray-700 dark:text-gray-300 pt-1">{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Button */}
        <div className="pt-8">
          <button
            onClick={handleGetStarted}
            disabled={!ready}
            className="px-12 py-4 bg-gradient-to-r from-primary-500 to-accent-500 text-white text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {!ready ? 'Loading...' : 'Get Started →'}
          </button>
        </div>

        {/* Footer */}
        <div className="pt-12 text-sm text-gray-500 dark:text-gray-400">
          <p>Built with Privy, Aztec Noir, LayerZero v2, and ❤️</p>
        </div>
      </div>
    </main>
  );
}

