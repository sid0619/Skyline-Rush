import React, { useState } from 'react';
import { sound } from '../audio/soundSystem';

interface SettingsModalProps {
  sfxEnabled: boolean;
  musicEnabled: boolean;
  hapticsEnabled: boolean;
  reducedMotion: boolean;
  onToggleSfx: (val: boolean) => void;
  onToggleMusic: (val: boolean) => void;
  onToggleHaptics: (val: boolean) => void;
  onToggleReducedMotion: (val: boolean) => void;
  onResetProgress: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  sfxEnabled,
  musicEnabled,
  hapticsEnabled,
  reducedMotion,
  onToggleSfx,
  onToggleMusic,
  onToggleHaptics,
  onToggleReducedMotion,
  onResetProgress,
  onClose,
}) => {
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Settings and Privacy"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 select-none font-['Orbitron']"
    >
      <div className="w-full max-w-xl max-h-[85vh] bg-[#0c111e] border border-cyan-500/40 rounded-3xl p-6 flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h2 className="text-xl font-black text-cyan-400">SETTINGS & PRIVACY</h2>
            <p className="text-xs text-gray-400 font-sans">
              Gameplay preferences, accessibility, and monetization compliance.
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

        {/* Settings Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          <div className="bg-[#141b2e] p-4 rounded-2xl border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-white">Sound Effects (SFX)</div>
                <div className="text-xs text-gray-400 font-sans">Procedural synthesizer jump, slide, and pickup feedback</div>
              </div>
              <input
                type="checkbox"
                checked={sfxEnabled}
                onChange={(e) => {
                  sound.playClick();
                  onToggleSfx(e.target.checked);
                }}
                className="w-5 h-5 accent-cyan-400 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <div>
                <div className="text-sm font-bold text-white">Cyberpunk Synth Music</div>
                <div className="text-xs text-gray-400 font-sans">Rhythmic atmospheric bassline pulses during runs</div>
              </div>
              <input
                type="checkbox"
                checked={musicEnabled}
                onChange={(e) => {
                  sound.playClick();
                  onToggleMusic(e.target.checked);
                }}
                className="w-5 h-5 accent-cyan-400 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <div>
                <div className="text-sm font-bold text-white">Haptic Vibration</div>
                <div className="text-xs text-gray-400 font-sans">Tactile collision and collection impulse on supported devices</div>
              </div>
              <input
                type="checkbox"
                checked={hapticsEnabled}
                onChange={(e) => {
                  sound.playClick();
                  onToggleHaptics(e.target.checked);
                }}
                className="w-5 h-5 accent-cyan-400 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <div>
                <div className="text-sm font-bold text-white">Reduced Motion</div>
                <div className="text-xs text-gray-400 font-sans">Dampens parallax skyline speed for visual comfort</div>
              </div>
              <input
                type="checkbox"
                checked={reducedMotion}
                onChange={(e) => {
                  sound.playClick();
                  onToggleReducedMotion(e.target.checked);
                }}
                className="w-5 h-5 accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>

          {/* Privacy & Compliance Section */}
          <div className="bg-[#141b2e] p-4 rounded-2xl border border-white/5 space-y-2 text-xs font-sans text-gray-300">
            <h3 className="font-bold text-cyan-400 font-['Orbitron']">PRIVACY & SUSTAINABLE MONETIZATION</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-400">
              <li>100% playable offline without accounts or social logins.</li>
              <li>Zero forced video interstitials during gameplay runs or pauses.</li>
              <li>Rewarded ads are voluntary and grant rewards only after verified completion.</li>
              <li>Native Android project integrates official Unity Ads SDK 4.12.5.</li>
            </ul>
            <div className="pt-2 text-[11px] font-mono text-gray-500">
              Version 1.0.0 · Package: com.aizoid.skylinerush
            </div>
          </div>

          {/* Danger Zone: Reset Data */}
          <div className="bg-red-950/20 p-4 rounded-2xl border border-red-500/30 space-y-3">
            <div className="text-xs text-red-300 font-sans">
              Reset all saved energy cores, high scores, missions, and unlocked cosmetics.
            </div>
            {!showConfirmReset ? (
              <button
                onClick={() => {
                  sound.playClick();
                  setShowConfirmReset(true);
                }}
                className="w-full py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-xs font-bold tracking-wider transition-all cursor-pointer"
              >
                RESET LOCAL PROGRESS
              </button>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-amber-300 font-bold">Are you sure? This cannot be undone.</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      sound.playCrash();
                      onResetProgress();
                      setShowConfirmReset(false);
                    }}
                    className="py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs tracking-wider cursor-pointer"
                  >
                    YES, RESET ALL
                  </button>
                  <button
                    onClick={() => {
                      sound.playClick();
                      setShowConfirmReset(false);
                    }}
                    className="py-2 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 font-bold text-xs cursor-pointer"
                  >
                    CANCEL
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
