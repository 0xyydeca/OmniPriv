'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LockClosedIcon, GlobeAltIcon, BoltIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { CredentialFlowAnimation } from '@/components/CredentialFlowAnimation';

// StepItem component with tooltip
function StepItem({
  step,
  text,
  tooltip,
  isLast,
}: {
  step: number;
  text: string;
  tooltip: string;
  isLast: boolean;
}) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative flex items-start gap-4">
      {/* Stepper Line */}
      {!isLast && (
        <div className="absolute left-5 top-10 w-0.5 h-full max-h-24 bg-gradient-to-b from-blue-300 to-blue-200 dark:from-blue-600 dark:to-blue-700" />
      )}

      {/* Step Circle with Checkmark */}
      <div className="relative flex-shrink-0 z-10">
        <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold shadow-lg ring-4 ring-blue-100 dark:ring-blue-900/50 transition-transform hover:scale-110">
          <CheckCircleIcon className="w-6 h-6 text-white" />
        </div>
        {/* Step Number Badge */}
        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white dark:bg-gray-800 border-2 border-blue-500 flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-400">
          {step}
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 pt-2 relative">
        <p
          className="text-gray-700 dark:text-gray-300 font-medium cursor-help hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          {text}
        </p>

        {/* Tooltip */}
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 top-10 z-20 w-64 sm:w-72 p-3 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg shadow-xl border border-gray-700 pointer-events-none"
          >
            <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 dark:bg-gray-700 transform rotate-45 border-l border-t border-gray-700" />
            <p className="relative z-10 leading-relaxed">{tooltip}</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

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
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent"
          >
            PrivID
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
            className="text-xl md:text-2xl text-gray-600 dark:text-gray-300"
          >
            Privacy-Preserving Cross-Chain Identity
          </motion.p>
        </div>

        {/* Problem Statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700"
        >
          <p className="text-lg text-gray-700 dark:text-gray-300">
            Verify age, country, or rep privately across any chain.
          </p>
        </motion.div>

        {/* Credential Flow Demo Animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6, ease: 'easeOut' }}
          className="flex justify-center w-full"
        >
          <CredentialFlowAnimation />
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
          {/* Zero-Knowledge Proofs Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 p-6 rounded-xl border border-primary-200 dark:border-primary-700 shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer"
          >
            <div className="mb-4">
              <LockClosedIcon className="w-12 h-12 text-primary-600 dark:text-primary-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
              Zero-Knowledge Proofs
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Prove attributes without revealing personal data
            </p>
            <p className="text-xs text-primary-700 dark:text-primary-300 font-medium">
              Powered by Aztec Noir for unbreakable privacy
            </p>
          </motion.div>

          {/* Cross-Chain Ready Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-br from-accent-50 to-accent-100 dark:from-accent-900/20 dark:to-accent-800/20 p-6 rounded-xl border border-accent-200 dark:border-accent-700 shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer"
          >
            <div className="mb-4">
              <GlobeAltIcon className="w-12 h-12 text-accent-600 dark:text-accent-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
              Cross-Chain Ready
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              One identity, verified everywhere via LayerZero
            </p>
            <p className="text-xs text-accent-700 dark:text-accent-300 font-medium">
              Built with LayerZero v2 OApp for seamless bridging
            </p>
          </motion.div>

          {/* Gasless Onboarding Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-6 rounded-xl border border-green-200 dark:border-green-700 shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer"
          >
            <div className="mb-4">
              <BoltIcon className="w-12 h-12 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
              Gasless Onboarding
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Embedded wallets with sponsored transactions
            </p>
            <p className="text-xs text-green-700 dark:text-green-300 font-medium">
              Powered by Privy SDK for instant wallet creation
            </p>
          </motion.div>
        </div>

        {/* User Journey - Stepper Layout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.4 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700"
        >
          <h2 className="text-2xl font-bold mb-8 text-center text-gray-900 dark:text-gray-100">
            How It Works
          </h2>
          <div className="space-y-6">
            {[
              {
                step: 1,
                text: 'Create your embedded wallet (gasless, instant)',
                tooltip: 'Step 1: Sign up with email or social login to get your wallet instantly. No seed phrases, no gas fees.',
              },
              {
                step: 2,
                text: 'Add credentials from trusted issuers',
                tooltip: 'Step 2: Import KYC, age verification, or other credentials from verified issuers. All data encrypted locally.',
              },
              {
                step: 3,
                text: 'Generate zero-knowledge proofs for any dApp',
                tooltip: 'Step 3: Instantly create a ZK proof for seamless DeFi compliance',
              },
              {
                step: 4,
                text: 'Reuse verification across any chain',
                tooltip: 'Step 4: Verify once, use everywhere. Your identity follows you across Base, Celo, and more via LayerZero.',
              },
            ].map(({ step, text, tooltip }, index) => (
              <StepItem
                key={step}
                step={step}
                text={text}
                tooltip={tooltip}
                isLast={index === 3}
              />
            ))}
          </div>
        </motion.div>

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

