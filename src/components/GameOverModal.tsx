import React, { useState } from 'react';
import { sound } from '../audio/soundSystem';

interface GameOverModalProps {
  distanceMeters: number;
  score: number;
  coresCollected: number;
  isPersonalBest: boolean;
  canRevive: boolean;
  onRequestRevive: () => void;
  onRequestBonusCores: () => void;
  onRestart: () => void;
  onHome: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  distanceMeters,
  score,
  coresCollected,
  isPersonalBest,
  canRevive,
  onRequestRevive,
  onRequestBonusCores,
  onRestart,
  onHome,
}) => {
  const [bonusClaimed, setBonusClaimed] = useState(false);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Run Terminated Summary"
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 select-none font-['Orbitron']"
    >
      <div className="w-full max-w-md bg-[#0e1422] border border-pink-500/40 rounded-3xl p-6 text-center space-y-5 shadow-2xl shadow-pink-950/40">
        <div className="space-y-1">
          <span className="text-3xl">💥</span>
          <h2 className="text-2xl font-black text-pink-500 tracking-wider">RUN TERMINATED</h2>
          {isPersonalBest && (
            <div className="inline-block px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400 text-xs font-mono font-bold animate-pulse">
              ★ NEW PERSONAL BEST! ★
            </div>
          )}
        </div>

        {/* 3 Metric Tiles */}
        <div className="grid grid-cols-3 gap-2 bg-[#141b2e] p-3.5 rounded-2xl border border-white/5">
          <div className="text-center">
            <div className="text-[10px] text-gray-400 font-mono uppercase">Distance</div>
            <div className="text-lg font-black text-cyan-400 font-mono">{distanceMeters}m</div>
          </div>
          <div className="text-center">
            <div className="text-[10px] text-gray-400 font-mono uppercase">Score</div>
            <div className="text-lg font-black text-white font-mono">{score}</div>
          </div>
          <div className="text-center">
            <div className="text-[10px] text-gray-400 font-mono uppercase">Cores</div>
            <div className="text-lg font-black text-amber-400 font-mono">+{coresCollected}</div>
          </div>
        </div>

        {/* Unity Ads Rewarded Options */}
        <div className="space-y-2">
          {canRevive && (
            <button
              onClick={() => {
                sound.playClick();
                onRequestRevive();
              }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs tracking-wider uppercase transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>▶</span>
              <span>WATCH UNITY AD TO REVIVE (1x)</span>
            </button>
          )}

          {!bonusClaimed && (
            <button
              onClick={() => {
                sound.playClick();
                setBonusClaimed(true);
                onRequestBonusCores();
              }}
              className="w-full py-2.5 rounded-xl bg-[#1c2438] hover:bg-[#232d46] border border-amber-500/30 text-amber-300 font-bold text-xs tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>★</span>
              <span>WATCH UNITY AD: +50 BONUS CORES</span>
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            data-start="true"
            onClick={() => {
              sound.playPowerUp();
              onRestart();
            }}
            className="py-3.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-xs tracking-wider uppercase transition-all shadow-lg shadow-cyan-500/30 cursor-pointer"
          >
            PLAY AGAIN
          </button>
          <button
            onClick={() => {
              sound.playClick();
              onHome();
            }}
            className="py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs tracking-wider uppercase transition-all cursor-pointer"
          >
            MAIN MENU
          </button>
        </div>
      </div>
    </div>
  );
};
