import React, { useEffect } from 'react';
import { sound } from '../audio/soundSystem';

interface TitleScreenProps {
  energyCores: number;
  personalBestDistance: number;
  personalBestScore: number;
  onStartGame: () => void;
  onOpenAndroidHub: () => void;
  onOpenMissions: () => void;
  onOpenLocker: () => void;
  onOpenAnalytics: () => void;
  onOpenSettings: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  energyCores,
  personalBestDistance,
  personalBestScore,
  onStartGame,
  onOpenAndroidHub,
  onOpenMissions,
  onOpenLocker,
  onOpenAnalytics,
  onOpenSettings,
}) => {
  // Listen for Enter / Space to start immediately
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onStartGame();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onStartGame]);

  return (
    <div className="fixed inset-0 z-30 flex flex-col justify-between bg-gradient-to-b from-[#050813] via-[#090e1e] to-[#12122b] text-white p-6 select-none overflow-y-auto">
      {/* Top Bar: Energy Balance & Settings & Project Hub */}
      <div className="flex items-center justify-between w-full max-w-5xl mx-auto">
        <div className="flex items-center space-x-2 bg-[#101728]/90 border border-amber-500/30 px-3.5 py-1.5 rounded-xl shadow-lg">
          <span className="text-amber-400 text-sm">◆</span>
          <span className="font-mono font-bold text-amber-300 text-sm tracking-wider">
            {energyCores} CORES
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              sound.playClick();
              onOpenAndroidHub();
            }}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600/30 to-blue-600/30 border border-cyan-400/40 text-cyan-300 hover:text-white text-xs font-bold font-mono tracking-wider transition-all flex items-center gap-1.5 shadow-lg shadow-cyan-950/50 cursor-pointer"
          >
            <span>🤖</span>
            <span>ANDROID STUDIO (.ZIP)</span>
          </button>
          <button
            onClick={() => {
              sound.playClick();
              onOpenSettings();
            }}
            aria-label="Settings"
            className="w-9 h-9 rounded-xl bg-[#101728]/90 border border-white/20 hover:border-cyan-400 flex items-center justify-center text-sm transition-all cursor-pointer"
          >
            ⚙
          </button>
        </div>
      </div>

      {/* Hero Centerpiece: Bespoke SVG Title & Lockup */}
      <div className="flex flex-col items-center justify-center my-auto text-center space-y-6 max-w-lg mx-auto">
        {/* Futuristic SVG Emblem */}
        <div className="relative">
          <svg className="w-24 h-24 mx-auto text-cyan-400 drop-shadow-[0_0_20px_rgba(0,240,255,0.6)]" viewBox="0 0 100 100" fill="none">
            <polygon points="50,5 95,25 95,75 50,95 5,75 5,25" stroke="currentColor" strokeWidth="3" strokeDasharray="6 3" />
            <polygon points="50,20 80,35 80,65 50,80 20,65 20,35" fill="rgba(0,240,255,0.15)" stroke="#FF0055" strokeWidth="2" />
            <path d="M35 50 L65 50 M50 35 L50 65" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>

        {/* Title Lockup */}
        <div className="space-y-1">
          <h1 className="text-4xl md:text-5xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-200 to-cyan-400 font-['Orbitron']">
            SKYLINE RUSH
          </h1>
          <div className="text-sm md:text-base font-bold text-pink-500 tracking-[0.3em] font-['Orbitron']">
            RIFT RUNNER
          </div>
          <div className="text-xs text-gray-400 max-w-sm pt-1">
            2D Endless Rooftop Courier · Compose Canvas · Real Unity Ads SDK
          </div>
        </div>

        {/* Personal Best Stat Tile */}
        <div className="bg-[#121929]/80 border border-cyan-500/20 px-6 py-2.5 rounded-2xl shadow-lg flex items-center space-x-6">
          <div className="text-left">
            <div className="text-[10px] text-gray-400 uppercase tracking-widest font-mono">Personal Best</div>
            <div className="text-base font-black text-cyan-300 font-mono">
              {personalBestDistance} <span className="text-xs text-gray-400">METERS</span>
            </div>
          </div>
          <div className="h-6 w-px bg-white/10" />
          <div className="text-left">
            <div className="text-[10px] text-gray-400 uppercase tracking-widest font-mono">High Score</div>
            <div className="text-base font-black text-white font-mono">
              {personalBestScore} <span className="text-xs text-gray-400">PTS</span>
            </div>
          </div>
        </div>

        {/* Primary Start CTA Button */}
        <button
          data-start="true"
          onClick={() => {
            sound.playPowerUp();
            onStartGame();
          }}
          className="w-full max-w-xs py-4 rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-300 to-cyan-400 hover:from-cyan-300 hover:to-sky-200 text-slate-950 font-black text-base tracking-widest uppercase shadow-xl shadow-cyan-500/30 transition-all transform hover:scale-[1.02] active:scale-[0.98] font-['Orbitron'] cursor-pointer"
        >
          RUN SKYLINE
        </button>
      </div>

      {/* Bottom Dock: Missions, Locker, Stats */}
      <div className="w-full max-w-md mx-auto space-y-3">
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => {
              sound.playClick();
              onOpenMissions();
            }}
            className="py-2.5 rounded-xl bg-[#121929] hover:bg-[#182238] border border-white/10 text-xs font-bold tracking-wider text-gray-200 transition-all cursor-pointer font-['Orbitron']"
          >
            📋 MISSIONS
          </button>
          <button
            onClick={() => {
              sound.playClick();
              onOpenLocker();
            }}
            className="py-2.5 rounded-xl bg-[#121929] hover:bg-[#182238] border border-white/10 text-xs font-bold tracking-wider text-cyan-300 transition-all cursor-pointer font-['Orbitron']"
          >
            👕 LOCKER
          </button>
          <button
            onClick={() => {
              sound.playClick();
              onOpenAnalytics();
            }}
            className="py-2.5 rounded-xl bg-[#121929] hover:bg-[#182238] border border-white/10 text-xs font-bold tracking-wider text-amber-300 transition-all cursor-pointer font-['Orbitron']"
          >
            📊 ANALYTICS
          </button>
        </div>

        {/* Clean control hint */}
        <div className="text-center text-[11px] text-gray-500 font-mono">
          WASD Move · Space Jump · Esc Pause · Enter to Start
        </div>
      </div>
    </div>
  );
};
