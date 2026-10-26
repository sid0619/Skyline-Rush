import React from 'react';
import { sound } from '../audio/soundSystem';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onQuit: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({ onResume, onRestart, onQuit }) => {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Pause Menu"
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 select-none font-['Orbitron']"
    >
      <div className="w-full max-w-sm bg-[#0e1422] border border-cyan-500/40 rounded-2xl p-6 text-center space-y-5 shadow-2xl shadow-cyan-950/60">
        <h2 className="text-2xl font-black text-cyan-400 tracking-wider">RUN PAUSED</h2>

        <div className="space-y-3 pt-2">
          <button
            onClick={() => {
              sound.playClick();
              onResume();
            }}
            className="w-full py-3.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-sm tracking-wider uppercase transition-all shadow-lg shadow-cyan-500/20 cursor-pointer"
          >
            RESUME
          </button>
          <button
            onClick={() => {
              sound.playClick();
              onRestart();
            }}
            className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm tracking-wider uppercase transition-all cursor-pointer"
          >
            RESTART RUN
          </button>
          <button
            onClick={() => {
              sound.playClick();
              onQuit();
            }}
            className="w-full py-2.5 rounded-xl text-gray-400 hover:text-white text-xs font-semibold tracking-wider transition-all cursor-pointer"
          >
            RETURN TO MENU
          </button>
        </div>
      </div>
    </div>
  );
};
