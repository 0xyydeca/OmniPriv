'use client';

import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { 
  SparklesIcon, 
  GlobeAltIcon, 
  ShieldCheckIcon, 
  CreditCardIcon,
  DevicePhoneMobileIcon,
  CircleStackIcon,
  ChartBarIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

export default function FutureDirectionsPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-900 pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-4">
              Future Directions
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Beyond the hackathon: our roadmap for production-ready, privacy-preserving omnichain identity
            </p>
          </motion.div>

          {/* Sponsor-Specific Sections */}
          <div className="space-y-12">
            
            {/* LayerZero Enhancements */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-gradient-to-br from-blue-900/40 to-purple-900/30 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <GlobeAltIcon className="w-10 h-10 text-blue-400" />
                <h2 className="text-3xl font-bold text-white">LayerZero: True Omnichain Scale</h2>
              </div>
              
              <div className="space-y-4 text-gray-200">
                <div className="pl-6 border-l-2 border-blue-500/50">
                  <h3 className="text-xl font-semibold text-blue-300 mb-2">Multi-Chain Expansion (150+ Chains)</h3>
                  <p className="text-gray-300 mb-3">
                    Deploy IdentityOApp to all LayerZero-supported chains, enabling true omnichain identity verification. Users verify once on any chain, consume anywhere.
                  </p>
                  <p className="text-sm text-blue-200">
                    <strong>Why it matters:</strong> Demonstrates LayerZero's core value prop - seamless cross-chain communication at massive scale
                  </p>
                </div>

                <div className="pl-6 border-l-2 border-purple-500/50">
                  <h3 className="text-xl font-semibold text-purple-300 mb-2">Dynamic Fee Quoting & Gas Optimization</h3>
                  <p className="text-gray-300 mb-3">
                    Implement production LayerZero fee quoting with <code className="bg-gray-800 px-2 py-1 rounded">quote()</code> function, gas-optimized message payloads, and user-facing fee estimation UI.
                  </p>
                  <p className="text-sm text-purple-200">
                    <strong>Why it matters:</strong> Production-grade UX for cross-chain transactions with transparent costs
                  </p>
                </div>

                <div className="pl-6 border-l-2 border-pink-500/50">
                  <h3 className="text-xl font-semibold text-pink-300 mb-2">Batch Verification Broadcasting</h3>
                  <p className="text-gray-300 mb-3">
                    Send a single verification to multiple destination chains in one transaction, leveraging LayerZero's efficient multi-chain messaging.
                  </p>
                  <p className="text-sm text-pink-200">
                    <strong>Why it matters:</strong> Showcases advanced LayerZero patterns for efficient omnichain state synchronization
                  </p>
                </div>

                <div className="pl-6 border-l-2 border-cyan-500/50">
                  <h3 className="text-xl font-semibold text-cyan-300 mb-2">Verification Expiry & Auto-Refresh</h3>
                  <p className="text-gray-300 mb-3">
                    Automated cross-chain expiry checks and re-verification workflows, keeping identity status synchronized across all chains.
                  </p>
                  <p className="text-sm text-cyan-200">
                    <strong>Why it matters:</strong> Real-world identity management requires lifecycle handling - perfect use case for LayerZero
                  </p>
                </div>
              </div>
            </motion.section>

            {/* Coinbase CDP Enhancements */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-gradient-to-br from-blue-900/40 to-cyan-900/30 backdrop-blur-sm border border-blue-400/30 rounded-2xl p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <ShieldCheckIcon className="w-10 h-10 text-blue-400" />
                <h2 className="text-3xl font-bold text-white">Coinbase: Enterprise-Grade Identity</h2>
              </div>
              
              <div className="space-y-4 text-gray-200">
                <div className="pl-6 border-l-2 border-blue-500/50">
                  <h3 className="text-xl font-semibold text-blue-300 mb-2">Gasless Verification Transactions</h3>
                  <p className="text-gray-300 mb-3">
                    Integrate CDP Paymaster to sponsor gas fees for identity verification transactions, removing all friction from user onboarding.
                  </p>
                  <p className="text-sm text-blue-200">
                    <strong>Why it matters:</strong> Zero-friction UX is critical for mainstream adoption - users shouldn't need to understand gas
                  </p>
                </div>

                <div className="pl-6 border-l-2 border-cyan-500/50">
                  <h3 className="text-xl font-semibold text-cyan-300 mb-2">Smart Wallet Social Recovery</h3>
                  <p className="text-gray-300 mb-3">
                    Leverage CDP Smart Wallets for social recovery of identity credentials, enabling users to recover their verified identity if they lose access.
                  </p>
                  <p className="text-sm text-cyan-200">
                    <strong>Why it matters:</strong> Identity credentials are high-value - need secure, user-friendly recovery mechanisms
                  </p>
                </div>

                <div className="pl-6 border-l-2 border-green-500/50">
                  <h3 className="text-xl font-semibold text-green-300 mb-2">Mobile App (React Native + CDP SDK)</h3>
                  <p className="text-gray-300 mb-3">
                    Native iOS/Android apps with CDP Embedded Wallets, enabling mobile-first identity verification with biometric authentication.
                  </p>
                  <p className="text-sm text-green-200">
                    <strong>Why it matters:</strong> Mobile is where users live - CDP's mobile SDK makes crypto-native identity accessible to billions
                  </p>
                </div>

                <div className="pl-6 border-l-2 border-purple-500/50">
                  <h3 className="text-xl font-semibold text-purple-300 mb-2">Coinbase Verification Integration</h3>
                  <p className="text-gray-300 mb-3">
                    Partner with Coinbase KYC to issue verified credentials directly from Coinbase's compliance infrastructure to OmniPriv vaults.
                  </p>
                  <p className="text-sm text-purple-200">
                    <strong>Why it matters:</strong> Leverage Coinbase's trusted verification infrastructure for instant, compliant identity issuance
                  </p>
                </div>

                <div className="pl-6 border-l-2 border-yellow-500/50">
                  <h3 className="text-xl font-semibold text-yellow-300 mb-2">Base Mainnet Deployment</h3>
                  <p className="text-gray-300 mb-3">
                    Deploy production contracts on Base mainnet as the primary verification chain, benefiting from Base's low fees and Coinbase ecosystem integration.
                  </p>
                  <p className="text-sm text-yellow-200">
                    <strong>Why it matters:</strong> Base is the ideal home for consumer crypto apps - fast, cheap, and Coinbase-aligned
                  </p>
                </div>
              </div>
            </motion.section>

            {/* Aztec Enhancements */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-gradient-to-br from-purple-900/40 to-pink-900/30 backdrop-blur-sm border border-purple-400/30 rounded-2xl p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <SparklesIcon className="w-10 h-10 text-purple-400" />
                <h2 className="text-3xl font-bold text-white">Aztec: Advanced Privacy Primitives</h2>
              </div>
              
              <div className="space-y-4 text-gray-200">
                <div className="pl-6 border-l-2 border-purple-500/50">
                  <h3 className="text-xl font-semibold text-purple-300 mb-2">Production Noir Verifier Deployment</h3>
                  <p className="text-gray-300 mb-3">
                    Deploy full UltraPlonk verifier on-chain for production-grade ZK proof verification (currently using simplified mock for hackathon).
                  </p>
                  <p className="text-sm text-purple-200">
                    <strong>Why it matters:</strong> Complete the zero-knowledge stack with production cryptography - no trust assumptions
                  </p>
                </div>

                <div className="pl-6 border-l-2 border-pink-500/50">
                  <h3 className="text-xl font-semibold text-pink-300 mb-2">Recursive Proof Aggregation</h3>
                  <p className="text-gray-300 mb-3">
                    Use Noir's recursive proving to aggregate multiple credential proofs (age + country + credit score) into a single verification.
                  </p>
                  <p className="text-sm text-pink-200">
                    <strong>Why it matters:</strong> Gas-efficient multi-attribute verification - one proof, unlimited privacy
                  </p>
                </div>

                <div className="pl-6 border-l-2 border-blue-500/50">
                  <h3 className="text-xl font-semibold text-blue-300 mb-2">Private Credential Marketplace</h3>
                  <p className="text-gray-300 mb-3">
                    Build a marketplace where users can prove they have certain credentials without revealing which ones, enabling private credential discovery.
                  </p>
                  <p className="text-sm text-blue-200">
                    <strong>Why it matters:</strong> Novel privacy primitive - "I have a credential matching your requirements" without disclosure
                  </p>
                </div>

                <div className="pl-6 border-l-2 border-cyan-500/50">
                  <h3 className="text-xl font-semibold text-cyan-300 mb-2">Selective Disclosure Proofs</h3>
                  <p className="text-gray-300 mb-3">
                    Advanced Noir circuits for selective attribute disclosure (prove "I'm 25+" instead of exact age, or "I'm in EU" instead of exact country).
                  </p>
                  <p className="text-sm text-cyan-200">
                    <strong>Why it matters:</strong> Granular privacy controls - users reveal only what's necessary, nothing more
                  </p>
                </div>

                <div className="pl-6 border-l-2 border-green-500/50">
                  <h3 className="text-xl font-semibold text-green-300 mb-2">Private Set Intersection for Credentials</h3>
                  <p className="text-gray-300 mb-3">
                    Enable private matching between user credentials and dApp requirements using ZK set membership proofs.
                  </p>
                  <p className="text-sm text-green-200">
                    <strong>Why it matters:</strong> Next-level privacy - both user and dApp can keep requirements private until match
                  </p>
                </div>
              </div>
            </motion.section>

            {/* General Production Features */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-gradient-to-br from-gray-900/60 to-gray-800/40 backdrop-blur-sm border border-gray-600/30 rounded-2xl p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <CircleStackIcon className="w-10 h-10 text-gray-400" />
                <h2 className="text-3xl font-bold text-white">Production Infrastructure</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-200">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <UserGroupIcon className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-blue-300 mb-1">Credential Issuer Network</h3>
                      <p className="text-sm text-gray-300">
                        Partnerships with KYC providers (Coinbase, Persona, Onfido) for real-world credential issuance
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <ChartBarIcon className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-purple-300 mb-1">Additional Policies</h3>
                      <p className="text-sm text-gray-300">
                        Credit score, employment status, accredited investor, geographic restrictions, age-gating
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <DevicePhoneMobileIcon className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-green-300 mb-1">Developer SDK & API</h3>
                      <p className="text-sm text-gray-300">
                        One-line integration for dApps: <code className="bg-gray-800 px-1 rounded text-xs">verifyUser(policy)</code>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CreditCardIcon className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-yellow-300 mb-1">Governance & DAO</h3>
                      <p className="text-sm text-gray-300">
                        Decentralized policy approval, issuer whitelisting, and protocol upgrades via token governance
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <ShieldCheckIcon className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-cyan-300 mb-1">Security Audits</h3>
                      <p className="text-sm text-gray-300">
                        Third-party audits of smart contracts, ZK circuits, and cryptographic implementations
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <GlobeAltIcon className="w-6 h-6 text-pink-400 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-pink-300 mb-1">Compliance Framework</h3>
                      <p className="text-sm text-gray-300">
                        GDPR-compliant data handling, SOC 2 certification, and regulatory engagement
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Vision Statement */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-gradient-to-r from-purple-900/30 via-pink-900/30 to-blue-900/30 backdrop-blur-sm border border-purple-400/30 rounded-2xl p-8 text-center"
            >
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-300 via-pink-300 to-blue-300 bg-clip-text text-transparent mb-4">
                Our Vision
              </h2>
              <p className="text-xl text-gray-200 max-w-4xl mx-auto leading-relaxed">
                Make privacy-preserving identity verification <strong>as simple as connecting a wallet</strong> - 
                powered by Coinbase's best-in-class UX, Aztec's cutting-edge cryptography, and LayerZero's omnichain infrastructure.
              </p>
              <p className="text-lg text-gray-300 mt-6 max-w-3xl mx-auto">
                Every dApp needs identity verification. None should require collecting personal data. 
                <strong className="text-purple-300"> OmniPriv makes that possible.</strong>
              </p>
            </motion.section>

          </div>
        </div>
      </div>
    </>
  );
}

