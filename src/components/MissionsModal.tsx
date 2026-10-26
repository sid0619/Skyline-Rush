import React from 'react';
import { DailyMission } from '../game/rules';
import { sound } from '../audio/soundSystem';

interface MissionsModalProps {
  missions: DailyMission[];
  onClaim: (missionId: string, reward: number) => void;
  onClose: () => void;
}

export const MissionsModal: React.FC<MissionsModalProps> = ({ missions, onClaim, onClose }) => {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Daily Missions"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 select-none font-['Orbitron']"
    >
      <div className="w-full max-w-xl max-h-[85vh] bg-[#0c111e] border border-cyan-500/40 rounded-3xl p-6 flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h2 className="text-xl font-black text-cyan-400">DAILY COURIER MISSIONS</h2>
            <p className="text-xs text-gray-400 font-sans">
              Complete skyline maneuvers to earn bonus energy cores. Resets daily.
            </p>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 transition-all text-sm cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Mission List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {missions.map((m) => {
            const progressPct = Math.min(100, Math.round((m.current / m.target) * 100));
            return (
              <div
                key={m.id}
                className="bg-[#141b2e] border border-white/5 p-4 rounded-2xl space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-white text-sm tracking-wide">{m.title}</h3>
                    <p className="text-xs text-gray-400 font-sans">{m.description}</p>
                  </div>
                  <div className="text-amber-400 font-mono font-bold text-sm">
                    ◆ +{m.rewardCores}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-cyan-400 h-full transition-all duration-300"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] font-mono text-gray-400">
                    <span>
                      {m.current} / {m.target}
                    </span>
                    <span>{progressPct}%</span>
                  </div>
                </div>

                {/* Claim or Status */}
                <div className="flex justify-end pt-1">
                  {m.completed ? (
                    <button
                      onClick={() => {
                        sound.playPowerUp();
                        onClaim(m.id, m.rewardCores);
                      }}
                      className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs tracking-wider rounded-xl transition-all shadow-md shadow-amber-500/20 cursor-pointer"
                    >
                      CLAIM REWARD
                    </button>
                  ) : (
                    <span className="text-xs text-cyan-400/70 font-mono tracking-wider">
                      IN PROGRESS...
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
