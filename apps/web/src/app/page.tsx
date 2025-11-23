'use client';

import { useAccount, useConnect } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CredentialFlowAnimation } from '@/components/CredentialFlowAnimation';
import { Navbar } from '@/components/Navbar';
import { ParticleBackground } from '@/components/ParticleBackground';

export default function Home() {
  const { isConnected } = useAccount();
  const { connect, connectors, error: connectError } = useConnect();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only rendering client-specific content after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isConnected) {
      router.push('/vault');
    }
  }, [isConnected, router]);

  // Log connectors for debugging
  useEffect(() => {
    if (connectors.length > 0) {
      console.log('Available connectors:', connectors.map(c => ({ id: c.id, name: c.name })));
    } else {
      console.warn('No wallet connectors available');
    }
  }, [connectors]);

  const handleGetStarted = () => {
    // Try to connect with Coinbase Wallet first, then fallback to first available connector
    const coinbaseConnector = connectors.find(c => 
      c.id === 'coinbaseWalletSDK' || c.name?.toLowerCase().includes('coinbase')
    );
    const connector = coinbaseConnector || connectors[0];
    if (connector) {
      connect({ connector });
    } else {
      console.error('No wallet connectors available');
    }
  };

  // Show loading state if not mounted yet or if connectors aren't ready
  if (!mounted || connectors.length === 0) {
    return (
      <>
        <Navbar />
        <main className="relative flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 md:p-8 lg:p-24 pt-20 sm:pt-24 md:pt-32 z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading...</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <ParticleBackground />
      <Navbar />
      <main className="relative flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 md:p-8 lg:p-24 pt-20 sm:pt-24 md:pt-32 z-[1]">
      <div className="max-w-6xl w-full space-y-8 sm:space-y-12 text-center">
        {/* Hero Section */}
        <header className="space-y-6">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-purple-600 bg-clip-text text-transparent leading-tight tracking-tight"
          >
            OmniPriv
          </motion.h1>
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent leading-tight"
          >
            Privacy-First Cross-Chain Identity Vault
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
            className="text-xl sm:text-2xl text-white/90 font-light max-w-4xl mx-auto leading-relaxed"
          >
            Verify age, country, or rep privately across any chain
          </motion.p>
        </header>

        {/* Video/Demo Section */}
        <section
          id="demo"
          className="scroll-mt-20 w-full"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
            className="relative w-full max-w-4xl mx-auto rounded-2xl overflow-hidden border-2 border-purple-500/30 shadow-2xl shadow-purple-500/20"
            style={{ aspectRatio: '16/9' }}
          >
            {/* Video Placeholder - Replace with actual video/demo */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center">
              <CredentialFlowAnimation />
            </div>
          </motion.div>
        </section>

        {/* Feature Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto mt-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="p-8 bg-gradient-to-br from-blue-900/40 to-blue-800/20 backdrop-blur-sm border border-blue-500/30 rounded-2xl shadow-lg"
          >
            <svg className="w-12 h-12 mb-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <h3 className="text-2xl font-bold text-white mb-4">Zero-Knowledge Proofs</h3>
            <p className="text-gray-300 mb-4">Prove attributes without revealing personal data</p>
            <p className="text-sm text-blue-400">Powered by Aztec Noir for unbreakable privacy</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="p-8 bg-gradient-to-br from-purple-900/40 to-pink-800/20 backdrop-blur-sm border border-purple-500/30 rounded-2xl shadow-lg"
          >
            <svg className="w-12 h-12 mb-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
            </svg>
            <h3 className="text-2xl font-bold text-white mb-4">Cross-Chain Ready</h3>
            <p className="text-gray-300 mb-4">One identity, verified everywhere via LayerZero</p>
            <p className="text-sm text-purple-400">Built with LayerZero v2 OApp for seamless bridging</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="p-8 bg-gradient-to-br from-green-900/40 to-emerald-800/20 backdrop-blur-sm border border-green-500/30 rounded-2xl shadow-lg"
          >
            <svg className="w-12 h-12 mb-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
            <h3 className="text-2xl font-bold text-white mb-4">Gasless Onboarding</h3>
            <p className="text-gray-300 mb-4">Embedded wallets with sponsored transactions</p>
            <p className="text-sm text-green-400">Powered by Coinbase Wallet for seamless onboarding</p>
          </motion.div>
        </section>

        {/* How It Works */}
        <section className="max-w-4xl mx-auto mt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="p-12 bg-gray-900/60 backdrop-blur-sm border border-gray-700/50 rounded-3xl shadow-2xl"
          >
            <h2 className="text-4xl font-bold text-white text-center mb-12">How It Works</h2>
            <div className="space-y-8">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">1</div>
                <div className="flex-1 pt-2">
                  <p className="text-xl text-gray-200">Sign in with Coinbase Wallet (email login, no seed phrase needed)</p>
                </div>
              </div>
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">2</div>
                <div className="flex-1 pt-2">
                  <p className="text-xl text-gray-200">Add credentials from trusted issuers</p>
                </div>
              </div>
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">3</div>
                <div className="flex-1 pt-2">
                  <p className="text-xl text-gray-200">Generate zero-knowledge proofs for any dApp</p>
                </div>
              </div>
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">4</div>
                <div className="flex-1 pt-2">
                  <p className="text-xl text-gray-200">Reuse verification across any chain</p>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="pt-8"
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => router.push('/vault')}
              className="px-10 sm:px-14 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-base sm:text-lg font-semibold rounded-full shadow-lg shadow-purple-500/30 transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
              aria-label="Launch Vault"
            >
              Launch Vault →
            </button>
            <button
              onClick={() => router.push('/dapp')}
              className="px-10 sm:px-14 py-4 bg-gray-800/80 hover:bg-gray-700/80 backdrop-blur-sm border border-gray-600 text-white text-base sm:text-lg font-semibold rounded-full shadow-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
              aria-label="Try Demo"
            >
              Try Demo →
            </button>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="pt-16 pb-8 w-full"
        >
          <div className="space-y-8">
            {/* Sponsor Logos */}
            <div className="flex flex-wrap items-center justify-center gap-8 px-4">
              <a href="https://aztec.network" target="_blank" rel="noopener noreferrer" className="opacity-60 hover:opacity-100 transition-opacity">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">Aztec</div>
                </div>
              </a>
              <a href="https://layerzero.network" target="_blank" rel="noopener noreferrer" className="opacity-60 hover:opacity-100 transition-opacity">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">LayerZero</div>
                </div>
              </a>
              <a href="https://coinbase.com/developer-platform" target="_blank" rel="noopener noreferrer" className="opacity-60 hover:opacity-100 transition-opacity">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-500">CDP</div>
                </div>
              </a>
            </div>

            {/* Copyright */}
            <p className="text-center text-sm text-gray-500">
              Built for ETHGlobal Buenos Aires 2025
            </p>
          </div>
        </motion.footer>
      </div>
    </main>
    </>
  );
}

