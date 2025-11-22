'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const TOTAL_DURATION = 15; // Total loop duration in seconds
const STAGE_DURATIONS = {
  ADD_CREDENTIAL: 3,
  GENERATE_PROOF: 4,
  BRIDGE: 4,
  VERIFY: 4,
};

const STAGE_STARTS = {
  ADD_CREDENTIAL: 0,
  GENERATE_PROOF: STAGE_DURATIONS.ADD_CREDENTIAL,
  BRIDGE: STAGE_DURATIONS.ADD_CREDENTIAL + STAGE_DURATIONS.GENERATE_PROOF,
  VERIFY:
    STAGE_DURATIONS.ADD_CREDENTIAL +
    STAGE_DURATIONS.GENERATE_PROOF +
    STAGE_DURATIONS.BRIDGE,
};

export function CredentialFlowAnimation() {
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        const next = prev + 0.1;
        return next >= TOTAL_DURATION ? 0 : next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Determine current stage
  const getCurrentStage = () => {
    if (currentTime < STAGE_STARTS.GENERATE_PROOF) return 'ADD_CREDENTIAL';
    if (currentTime < STAGE_STARTS.BRIDGE) return 'GENERATE_PROOF';
    if (currentTime < STAGE_STARTS.VERIFY) return 'BRIDGE';
    return 'VERIFY';
  };

  const stage = getCurrentStage();
  const stageProgress = (() => {
    if (stage === 'ADD_CREDENTIAL')
      return currentTime / STAGE_DURATIONS.ADD_CREDENTIAL;
    if (stage === 'GENERATE_PROOF')
      return (currentTime - STAGE_STARTS.GENERATE_PROOF) /
        STAGE_DURATIONS.GENERATE_PROOF;
    if (stage === 'BRIDGE')
      return (currentTime - STAGE_STARTS.BRIDGE) / STAGE_DURATIONS.BRIDGE;
    return (currentTime - STAGE_STARTS.VERIFY) / STAGE_DURATIONS.VERIFY;
  })();

  return (
    <div className="w-full max-w-[600px] mx-auto bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 rounded-xl overflow-hidden border border-purple-500/30 shadow-2xl relative" style={{ aspectRatio: '3/2', minHeight: '250px', maxHeight: '400px' }}>
      {/* Stage 1: Adding Credential (0-3s) */}
      {stage === 'ADD_CREDENTIAL' && (
        <AddCredentialStage progress={stageProgress} />
      )}

      {/* Stage 2: Generating ZK Proof (3-7s) */}
      {stage === 'GENERATE_PROOF' && (
        <GenerateProofStage progress={stageProgress} />
      )}

      {/* Stage 3: Cross-Chain Bridging (7-11s) */}
      {stage === 'BRIDGE' && <BridgeStage progress={stageProgress} />}

      {/* Stage 4: Verification (11-15s) */}
      {stage === 'VERIFY' && <VerifyStage progress={stageProgress} />}

      {/* Dark overlay for better contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
    </div>
  );
}

// Stage 1: Adding Credential
function AddCredentialStage({ progress }: { progress: number }) {
  const lockRotation = progress < 0.3 ? progress * 180 : 180;
  const vaultScale = progress < 0.3 ? 0.5 : Math.min(0.5 + (progress - 0.3) * 0.5, 1);
  const passportOpacity = progress < 0.4 ? 0 : Math.min((progress - 0.4) * 3, 1);
  const passportY = progress < 0.4 ? -50 : Math.max(-50 + (progress - 0.4) * 150, 100);
  const lockOpacity = progress < 0.6 ? 1 : Math.max(1 - (progress - 0.6) * 2.5, 0);
  const particlesOpacity = progress < 0.6 ? 0 : Math.min((progress - 0.6) * 2.5, 1);

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {/* Lock turning into vault */}
      <motion.div
        className="absolute"
        style={{
          scale: vaultScale,
          rotateZ: lockRotation,
          opacity: lockOpacity,
        }}
        transition={{ type: 'spring', stiffness: 100 }}
      >
        <svg width="120" height="120" viewBox="0 0 120 120" className="text-purple-400">
          {/* Vault/Safe */}
          <rect
            x="20"
            y="40"
            width="80"
            height="60"
            rx="8"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className={progress > 0.3 ? 'animate-pulse' : ''}
          />
          {/* Lock mechanism */}
          <circle cx="60" cy="50" r="8" fill="currentColor" />
          <rect x="56" y="50" width="8" height="20" fill="currentColor" />
          {/* Glow effect */}
          {progress > 0.3 && (
            <circle
              cx="60"
              cy="70"
              r="30"
              fill="currentColor"
              opacity={0.2}
              className="animate-pulse"
            />
          )}
        </svg>
      </motion.div>

      {/* Passport icon dropping in */}
      <motion.div
        className="absolute"
        style={{
          opacity: passportOpacity,
          y: passportY,
        }}
      >
        <svg width="60" height="60" viewBox="0 0 60 60" className="text-blue-400">
          <rect x="10" y="10" width="40" height="50" rx="4" fill="currentColor" opacity="0.8" />
          <rect x="12" y="15" width="36" height="4" fill="white" />
          <rect x="12" y="22" width="28" height="3" fill="white" opacity="0.7" />
          <rect x="12" y="28" width="32" height="3" fill="white" opacity="0.7" />
        </svg>
      </motion.div>

      {/* Encryption particles */}
      {particlesOpacity > 0 && (
        <div className="absolute inset-0">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-green-400 rounded-full"
              style={{
                left: `${20 + (i % 4) * 20}%`,
                top: `${30 + Math.floor(i / 4) * 20}%`,
                opacity: particlesOpacity,
              }}
              animate={{
                scale: [0, 1.5, 0],
                rotate: [0, 360],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.1,
                ease: 'easeOut',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Stage 2: Generating ZK Proof
function GenerateProofStage({ progress }: { progress: number }) {
  const vaultOpen = progress < 0.25 ? progress * 4 : 1;
  const dataLinesOpacity = progress < 0.25 ? 0 : Math.min((progress - 0.25) * 2, 1);
  const shieldOpacity = progress < 0.4 ? 0 : Math.min((progress - 0.4) * 3, 1);
  const proofBadgeOpacity = progress < 0.6 ? 0 : Math.min((progress - 0.6) * 2.5, 1);
  const proofScale = progress < 0.6 ? 0 : Math.min((progress - 0.6) * 5, 1);

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {/* Vault opening */}
      <motion.div
        className="absolute"
        style={{
          scale: 0.8,
          y: -20,
        }}
      >
        <svg width="120" height="80" viewBox="0 0 120 80" className="text-purple-400">
          <rect
            x="20"
            y="10"
            width="80"
            height="60"
            rx="8"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          />
          <motion.rect
            x="20"
            y="10"
            width="80"
            height={60 * vaultOpen}
            rx="8"
            fill="currentColor"
            opacity="0.2"
          />
        </svg>
      </motion.div>

      {/* Abstract data lines */}
      {dataLinesOpacity > 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-32 h-0.5 bg-purple-400"
              style={{
                opacity: dataLinesOpacity,
                rotate: i * 30,
              }}
              animate={{
                scaleX: [0, 1, 0],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      )}

      {/* Shield with proof */}
      {shieldOpacity > 0 && (
        <motion.div
          className="absolute"
          style={{
            opacity: shieldOpacity,
          }}
        >
          <svg width="100" height="100" viewBox="0 0 100 100" className="text-purple-400">
            <path
              d="M50 10 L20 20 L20 50 Q20 70 50 85 Q80 70 80 50 L80 20 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              className="animate-pulse"
            />
            {/* Math symbols inside */}
            <text
              x="50"
              y="55"
              textAnchor="middle"
              fontSize="20"
              fill="currentColor"
              opacity={proofBadgeOpacity}
            >
              Σ
            </text>
            <text
              x="50"
              y="75"
              textAnchor="middle"
              fontSize="12"
              fill="currentColor"
              opacity={proofBadgeOpacity}
            >
              ZK
            </text>
          </svg>
        </motion.div>
      )}

      {/* Proof badge */}
      {proofBadgeOpacity > 0 && (
        <motion.div
          className="absolute bottom-10"
          style={{
            opacity: proofBadgeOpacity,
            scale: proofScale,
          }}
        >
          <div className="bg-purple-600/80 px-4 py-2 rounded-lg border border-purple-400">
            <div className="flex items-center gap-2 text-white text-sm">
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Proof Generating...</span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// Stage 3: Cross-Chain Bridging
function BridgeStage({ progress }: { progress: number }) {
  const bridgeProgress = progress;
  const packetPosition = 15 + bridgeProgress * 70; // Percentage from left

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      {/* Chain 1 (Ethereum) */}
      <motion.div
        className="absolute"
        style={{
          left: '10%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <svg width="80" height="80" viewBox="0 0 80 80" className="text-blue-400">
          <circle cx="40" cy="40" r="35" fill="none" stroke="currentColor" strokeWidth="3" />
          <path
            d="M40 15 L45 30 L30 25 L40 15 M40 15 L45 30 L30 25 L40 15"
            fill="currentColor"
          />
          <text x="40" y="50" textAnchor="middle" fontSize="10" fill="currentColor">
            ETH
          </text>
        </svg>
      </motion.div>

      {/* Chain 2 (Base) */}
      <motion.div
        className="absolute"
        style={{
          right: '10%',
          top: '50%',
          transform: 'translate(50%, -50%)',
        }}
      >
        <svg width="80" height="80" viewBox="0 0 80 80" className="text-purple-400">
          <rect
            x="5"
            y="5"
            width="70"
            height="70"
            rx="8"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          />
          <text x="40" y="50" textAnchor="middle" fontSize="10" fill="currentColor">
            BASE
          </text>
        </svg>
      </motion.div>

      {/* Bridge line */}
      <div className="absolute left-[10%] right-[10%] top-1/2 h-0.5 bg-purple-500/30" />

      {/* LayerZero packet zipping across */}
      <motion.div
        className="absolute"
        style={{
          left: `${packetPosition}%`,
          top: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <motion.svg
          width="50"
          height="50"
          viewBox="0 0 50 50"
          className="text-purple-400"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 360],
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          {/* Packet shape */}
          <rect x="10" y="10" width="30" height="30" rx="4" fill="currentColor" opacity="0.9" />
          <circle cx="25" cy="25" r="8" fill="white" />
          <text x="25" y="28" textAnchor="middle" fontSize="8" fill="currentColor">
            LZ
          </text>
        </motion.svg>

        {/* Warp effects */}
        {bridgeProgress > 0.2 && bridgeProgress < 0.8 && (
          <>
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-20 h-1 bg-purple-400"
                style={{
                  left: '50%',
                  top: '50%',
                  opacity: 0.3,
                  rotate: i * 45,
                }}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 0, 0.3],
                }}
                transition={{
                  duration: 0.3,
                  repeat: Infinity,
                  delay: i * 0.1,
                }}
              />
            ))}
          </>
        )}
      </motion.div>
    </div>
  );
}

// Stage 4: Verification
function VerifyStage({ progress }: { progress: number }) {
  const scanProgress = progress < 0.3 ? progress / 0.3 : 1;
  const checkmarkOpacity = progress < 0.5 ? 0 : Math.min((progress - 0.5) * 3, 1);
  const checkmarkScale = progress < 0.5 ? 0 : Math.min((progress - 0.5) * 2, 1);
  const glowOpacity = progress < 0.6 ? 0 : Math.min((progress - 0.6) * 2.5, 1);

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {/* Destination chain with proof */}
      <motion.div
        className="absolute"
        style={{
          scale: 0.9,
        }}
      >
        <svg width="120" height="120" viewBox="0 0 120 120" className="text-purple-400">
          <rect
            x="20"
            y="20"
            width="80"
            height="80"
            rx="12"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          />
          {/* Scanning effect */}
          <motion.rect
            x="25"
            y="25"
            width="70"
            height={70 * scanProgress}
            rx="8"
            fill="currentColor"
            opacity="0.2"
          />
        </svg>
      </motion.div>

      {/* Checkmark */}
      {checkmarkOpacity > 0 && (
        <motion.div
          className="absolute"
          style={{
            opacity: checkmarkOpacity,
            scale: checkmarkScale,
          }}
        >
          <motion.svg
            width="100"
            height="100"
            viewBox="0 0 100 100"
            className="text-green-400"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5 }}
          >
            <circle cx="50" cy="50" r="40" fill="currentColor" opacity="0.2" />
            <motion.path
              d="M30 50 L45 65 L70 35"
              fill="none"
              stroke="currentColor"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            />
          </motion.svg>
        </motion.div>
      )}

      {/* Success glow */}
      {glowOpacity > 0 && (
        <motion.div
          className="absolute inset-0"
          style={{
            opacity: glowOpacity,
          }}
        >
          <motion.div
            className="absolute inset-0 bg-green-400/20 rounded-full"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 0, 0.3],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: 'easeOut',
            }}
            style={{
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: '200px',
              height: '200px',
            }}
          />
        </motion.div>
      )}
    </div>
  );
}

