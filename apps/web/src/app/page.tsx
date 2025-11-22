'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LockClosedIcon, GlobeAltIcon, BoltIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { CredentialFlowAnimation } from '@/components/CredentialFlowAnimation';
import { Navbar } from '@/components/Navbar';

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
    <>
      <Navbar />
      <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 md:p-8 lg:p-24 pt-20 sm:pt-24 md:pt-32">
      <div className="max-w-4xl w-full space-y-6 sm:space-y-8 text-center">
        {/* Hero Section */}
        <div className="space-y-4">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent"
          >
            PrivID
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
            className="text-lg sm:text-xl md:text-2xl text-gray-700 dark:text-gray-200 font-medium"
          >
            Privacy-Preserving Cross-Chain Identity
          </motion.p>
        </div>

        {/* Problem Statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xl border border-gray-200 dark:border-gray-700"
        >
          <p className="text-base sm:text-lg text-gray-800 dark:text-gray-200 font-medium">
            Verify age, country, or rep privately across any chain.
          </p>
        </motion.div>

        {/* Credential Flow Demo Animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6, ease: 'easeOut' }}
          className="flex justify-center w-full px-4"
          aria-label="Credential verification flow demonstration"
        >
          <CredentialFlowAnimation />
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 pt-6 sm:pt-8 w-full">
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
            <h3 className="text-base sm:text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
              Zero-Knowledge Proofs
            </h3>
            <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 mb-3">
              Prove attributes without revealing personal data
            </p>
            <p className="text-xs text-primary-700 dark:text-primary-400 font-medium">
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
            <h3 className="text-base sm:text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
              Cross-Chain Ready
            </h3>
            <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 mb-3">
              One identity, verified everywhere via LayerZero
            </p>
            <p className="text-xs text-accent-700 dark:text-accent-400 font-medium">
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
            <h3 className="text-base sm:text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
              Gasless Onboarding
            </h3>
            <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 mb-3">
              Embedded wallets with sponsored transactions
            </p>
            <p className="text-xs text-green-700 dark:text-green-400 font-medium">
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
          <h2 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8 text-center text-gray-900 dark:text-gray-100">
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.6 }}
          className="pt-8"
        >
          <button
            onClick={handleGetStarted}
            disabled={!ready}
            className="px-8 sm:px-12 py-3 sm:py-4 bg-gradient-to-r from-primary-500 to-accent-500 text-white text-base sm:text-lg font-semibold rounded-full shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none pulse-on-hover focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
            aria-label={ready ? 'Get started with PrivID' : 'Loading PrivID'}
          >
            {!ready ? 'Loading...' : 'Get Started →'}
          </button>
        </motion.div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.8 }}
          className="pt-12 pb-8 w-full"
        >
          <div className="space-y-6">
            {/* Sponsor Logos Row */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 md:gap-8 px-4" role="list" aria-label="Technology sponsors">
              {/* Aztec Network */}
              <a
                href="https://aztec.network"
                target="_blank"
                rel="noopener noreferrer"
                className="group opacity-70 hover:opacity-100 transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded"
                aria-label="Visit Aztec Network website"
                role="listitem"
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#8B5CF6] to-[#EC4899] flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                    <span className="text-white font-bold text-lg">A</span>
                  </div>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Aztec</span>
                </div>
              </a>
              
              {/* LayerZero */}
              <a
                href="https://layerzero.network"
                target="_blank"
                rel="noopener noreferrer"
                className="group opacity-70 hover:opacity-100 transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded"
                aria-label="Visit LayerZero website"
                role="listitem"
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#3B82F6] to-[#06B6D4] flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                    <span className="text-white font-bold text-xs">LZ</span>
                  </div>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">LayerZero</span>
                </div>
              </a>
              
              {/* Privy */}
              <a
                href="https://privy.io"
                target="_blank"
                rel="noopener noreferrer"
                className="group opacity-70 hover:opacity-100 transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded"
                aria-label="Visit Privy website"
                role="listitem"
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                    <span className="text-white font-bold text-base">P</span>
                  </div>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Privy</span>
                </div>
              </a>
              
              {/* Coinbase */}
              <a
                href="https://www.coinbase.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group opacity-70 hover:opacity-100 transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded"
                aria-label="Visit Coinbase website"
                role="listitem"
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0052FF] to-[#1B8FFF] flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 24C5.373 24 0 18.627 0 12S5.373 0 12 0s12 5.373 12 12-5.373 12-12 12zm-1.048-5.5l4-8 4 8h-8zm4.096-9L9 17.5h6.096L15 9.5z"/>
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Coinbase</span>
                </div>
              </a>
            </div>

            {/* Divider */}
            <div className="flex items-center justify-center py-4">
              <div className="w-24 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent" />
            </div>

            {/* ETHGlobal Badge */}
            <div className="flex items-center justify-center">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#8B5CF6] via-[#6366F1] to-[#3B82F6] text-white text-xs font-semibold rounded-full shadow-lg hover:shadow-xl transition-shadow cursor-default">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
                <span>ETHGlobal Buenos Aires 2025</span>
              </div>
            </div>

            {/* Copyright */}
            <p className="text-center text-xs text-gray-500 dark:text-gray-400">
              Built with ❤️ for privacy-preserving identity
            </p>
          </div>
        </motion.footer>
      </div>
    </main>
    </>
  );
}

