import React, { useState, useEffect } from 'react';
import { sound } from '../audio/soundSystem';

interface UnityAdModalProps {
  placementId: string;
  isRewarded: boolean;
  onAdCompleted: () => void;
  onAdClosed: () => void;
}

export const UnityAdModal: React.FC<UnityAdModalProps> = ({
  placementId,
  isRewarded,
  onAdCompleted,
  onAdClosed,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(isRewarded ? 5 : 3);
  const [canClose, setCanClose] = useState<boolean>(false);
  const [completed, setCompleted] = useState<boolean>(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanClose(true);
          setCompleted(true);
          sound.playPowerUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Unity Ads Simulation"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 select-none"
    >
      <div className="relative w-full max-w-lg bg-[#0e1320] border-2 border-cyan-500/40 rounded-2xl overflow-hidden shadow-2xl shadow-cyan-900/40">
        {/* Top Unity Ads Watermark Bar */}
        <div className="bg-[#151c2e] px-4 py-2 flex items-center justify-between border-b border-white/10 text-xs text-gray-300">
          <div className="flex items-center space-x-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold tracking-wider text-cyan-400">UNITY ADS</span>
            <span className="px-1.5 py-0.5 text-[10px] bg-amber-500/20 text-amber-300 font-mono rounded">
              TEST_MODE
            </span>
          </div>
          <span className="font-mono text-gray-400">{placementId}</span>
        </div>

        {/* Ad Video Simulator Screen */}
        <div className="p-6 text-center space-y-4">
          <div className="relative h-48 rounded-xl bg-gradient-to-br from-indigo-950 via-slate-900 to-cyan-950 border border-cyan-500/20 flex flex-col items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(0,240,255,0.15),transparent_70%)]" />
            
            <div className="relative z-10 space-y-1">
              <span className="text-4xl">⚡</span>
              <h3 className="text-xl font-black text-white tracking-wider font-['Orbitron']">
                HYPERION RIFT GEAR
              </h3>
              <p className="text-xs text-cyan-300 max-w-xs mx-auto">
                Next-Gen Kinetic Couriers · Built for Zero-Friction Skyline Traversal
              </p>
            </div>

            {/* Countdown Badge */}
            <div className="absolute bottom-3 right-3 bg-black/80 px-2.5 py-1 rounded-md text-xs font-mono text-cyan-400 border border-cyan-500/30">
              {secondsRemaining > 0 ? `Reward in ${secondsRemaining}s` : 'Reward Granted!'}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-cyan-400 h-full transition-all duration-1000 ease-linear"
              style={{
                width: `${(( (isRewarded ? 5 : 3) - secondsRemaining) / (isRewarded ? 5 : 3)) * 100}%`,
              }}
            />
          </div>

          <div className="text-xs text-gray-400">
            {completed ? (
              <span className="text-emerald-400 font-semibold flex items-center justify-center gap-1">
                ✓ Unity Ads SDK reported onUnityAdsShowComplete(COMPLETED)
              </span>
            ) : (
              <span>Watching test ad to trigger official reward callback...</span>
            )}
          </div>

          {/* Close Action Button */}
          <button
            onClick={() => {
              sound.playClick();
              if (completed) {
                onAdCompleted();
              }
              onAdClosed();
            }}
            disabled={!canClose}
            className={`w-full py-3 rounded-xl font-bold text-sm tracking-wider uppercase transition-all ${
              canClose
                ? 'bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-lg shadow-cyan-500/30 cursor-pointer'
                : 'bg-gray-800 text-gray-500 cursor-not-allowed opacity-60'
            }`}
          >
            {canClose ? 'Claim & Resume' : `Please wait (${secondsRemaining}s)`}
          </button>
        </div>
      </div>
    </div>
  );
};
