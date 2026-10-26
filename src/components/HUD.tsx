import React from 'react';
import { sound } from '../audio/soundSystem';

interface HUDProps {
  distanceMeters: number;
  score: number;
  coresCollected: number;
  powerUps: { shield: boolean; magnet: number; boost: number };
  isMuted: boolean;
  onPause: () => void;
  onToggleMute: () => void;
  onLeft: () => void;
  onRight: () => void;
  onJump: () => void;
  onSlide: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  distanceMeters,
  score,
  coresCollected,
  powerUps,
  isMuted,
  onPause,
  onToggleMute,
  onLeft,
  onRight,
  onJump,
  onSlide,
}) => {
  return (
    <div className="fixed inset-0 pointer-events-none select-none z-20 flex flex-col justify-between p-4 md:p-6 font-['Orbitron']">
      {/* Top Cluster */}
      <div className="flex items-start justify-between w-full">
        {/* Distance & Score readouts */}
        <div className="bg-[#0b101c]/80 border border-cyan-500/30 rounded-xl px-4 py-2.5 backdrop-blur-sm shadow-lg pointer-events-auto">
          <div className="text-2xl md:text-3xl font-black text-cyan-400 tracking-wider font-mono">
            {distanceMeters} <span className="text-xs text-cyan-200">M</span>
          </div>
          <div className="text-xs text-gray-300 font-mono tracking-wider">
            SCORE <span className="text-white font-bold">{score}</span>
          </div>
        </div>

        {/* Center: Energy Cores Counter */}
        <div className="bg-[#0b101c]/80 border border-amber-500/30 rounded-xl px-4 py-2 backdrop-blur-sm shadow-lg flex items-center space-x-2 pointer-events-auto">
          <span className="text-amber-400 text-lg">◆</span>
          <span className="text-lg md:text-xl font-black text-amber-400 font-mono">
            {coresCollected}
          </span>
        </div>

        {/* Top-Right Utility Cluster (Mute, Pause) */}
        <div className="flex items-center space-x-2 pointer-events-auto">
          <button
            onClick={() => {
              sound.playClick();
              onToggleMute();
            }}
            aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            className="w-10 h-10 rounded-xl bg-[#0b101c]/80 border border-white/20 hover:border-cyan-400 text-white flex items-center justify-center text-sm transition-all cursor-pointer"
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
          <button
            onClick={() => {
              sound.playClick();
              onPause();
            }}
            aria-label="Pause Game"
            className="w-10 h-10 rounded-xl bg-[#0b101c]/80 border border-white/20 hover:border-cyan-400 text-white font-bold flex items-center justify-center text-sm transition-all cursor-pointer"
          >
            ⏸
          </button>
        </div>
      </div>

      {/* Active Power-up Overcharge Alerts */}
      <div className="flex flex-col items-center space-y-1.5 self-center">
        {powerUps.shield && (
          <div className="px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400 text-cyan-300 text-xs font-mono font-bold animate-pulse">
            🛡 KINETIC SHIELD ACTIVE
          </div>
        )}
        {powerUps.magnet > 0 && (
          <div className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 text-xs font-mono font-bold">
            🧲 CORE MAGNET: {powerUps.magnet}s
          </div>
        )}
        {powerUps.boost > 0 && (
          <div className="px-3 py-1 rounded-full bg-pink-500/20 border border-pink-400 text-pink-300 text-xs font-mono font-bold">
            ⚡ 2X OVERCHARGE: {powerUps.boost}s
          </div>
        )}
      </div>

      {/* Bottom Area: Accessible Mobile Touch Controls & Keyboard hints */}
      <div className="flex items-end justify-between w-full">
        {/* Left/Right Steer Buttons for Touch */}
        <div className="flex items-center space-x-2 pointer-events-auto">
          <button
            onClick={() => {
              onLeft();
            }}
            aria-label="Steer Left"
            className="w-13 h-13 rounded-2xl bg-[#0b101c]/90 border border-cyan-500/40 active:bg-cyan-500/30 text-cyan-300 font-black text-xl flex items-center justify-center shadow-lg transition-all cursor-pointer"
          >
            ◀
          </button>
          <button
            onClick={() => {
              onRight();
            }}
            aria-label="Steer Right"
            className="w-13 h-13 rounded-2xl bg-[#0b101c]/90 border border-cyan-500/40 active:bg-cyan-500/30 text-cyan-300 font-black text-xl flex items-center justify-center shadow-lg transition-all cursor-pointer"
          >
            ▶
          </button>
        </div>

        {/* Non-interactive control hint */}
        <div className="hidden md:block text-[11px] text-gray-400 tracking-wider uppercase font-mono pb-2">
          WASD / Arrows · Swipe / Tap · Esc Pause
        </div>

        {/* Jump/Slide Action Buttons for Touch */}
        <div className="flex items-center space-x-2 pointer-events-auto">
          <button
            onClick={() => {
              onSlide();
            }}
            aria-label="Slide Down"
            className="w-13 h-13 rounded-2xl bg-[#0b101c]/90 border border-amber-500/40 active:bg-amber-500/30 text-amber-300 font-black text-xs flex flex-col items-center justify-center shadow-lg transition-all cursor-pointer"
          >
            <span>▼</span>
            <span className="text-[9px]">SLIDE</span>
          </button>
          <button
            onClick={() => {
              onJump();
            }}
            aria-label="Jump Up"
            className="w-14 h-14 rounded-2xl bg-cyan-500 text-slate-950 active:bg-cyan-400 font-black text-xs flex flex-col items-center justify-center shadow-lg shadow-cyan-500/30 transition-all cursor-pointer"
          >
            <span>▲</span>
            <span className="text-[10px]">JUMP</span>
          </button>
        </div>
      </div>
    </div>
  );
};
