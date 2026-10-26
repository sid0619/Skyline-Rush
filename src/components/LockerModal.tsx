import React, { useState } from 'react';
import { sound } from '../audio/soundSystem';

export interface CosmeticItemWeb {
  id: string;
  name: string;
  category: 'skin' | 'board' | 'trail';
  colorHex: string;
  cost: number;
  description: string;
}

export const COSMETIC_CATALOG: CosmeticItemWeb[] = [
  // Skins
  { id: 'skin_courier', name: 'Cyber Courier', category: 'skin', colorHex: '#00F0FF', cost: 0, description: 'Standard high-altitude courier exosuit' },
  { id: 'skin_specter', name: 'Neon Specter', category: 'skin', colorHex: '#A855F7', cost: 120, description: 'Stealth weave with ultraviolet light diffusers' },
  { id: 'skin_vanguard', name: 'Rift Vanguard', category: 'skin', colorHex: '#FF0055', cost: 350, description: 'Heavy carbon plating built for rift storms' },
  { id: 'skin_gold', name: 'Apex Luminary', category: 'skin', colorHex: '#FFB800', cost: 600, description: 'Gilded kinetic weave awarded to master runners' },
  // Hoverboards
  { id: 'board_aero', name: 'Aero Deck', category: 'board', colorHex: '#FFB800', cost: 0, description: 'Stable draft fins and magnetic repulsors' },
  { id: 'board_tachyon', name: 'Tachyon Carver', category: 'board', colorHex: '#00F0FF', cost: 180, description: 'Sharpened vector edges for razor-precise turns' },
  { id: 'board_void', name: 'Void Skimmer', category: 'board', colorHex: '#7C3AED', cost: 450, description: 'Zero-friction repulsor engine forged in the rift' },
  // Particle Trails
  { id: 'trail_plasma', name: 'Cyan Plasma', category: 'trail', colorHex: '#00F0FF', cost: 0, description: 'Standard high-frequency ion wake' },
  { id: 'trail_amber', name: 'Solar Amber', category: 'trail', colorHex: '#FFB800', cost: 150, description: 'Radiant thermite spark trail' },
  { id: 'trail_violet', name: 'Violet Warp', category: 'trail', colorHex: '#C084FC', cost: 300, description: 'Localized dimensional distortion sparks' },
];

interface LockerModalProps {
  energyCores: number;
  unlockedIds: string[];
  equippedSkin: string;
  equippedBoard: string;
  equippedTrail: string;
  onEquip: (category: 'skin' | 'board' | 'trail', id: string) => void;
  onUnlock: (id: string, cost: number) => void;
  onClose: () => void;
}

export const LockerModal: React.FC<LockerModalProps> = ({
  energyCores,
  unlockedIds,
  equippedSkin,
  equippedBoard,
  equippedTrail,
  onEquip,
  onUnlock,
  onClose,
}) => {
  const [activeCategory, setActiveCategory] = useState<'skin' | 'board' | 'trail'>('skin');

  const filteredItems = COSMETIC_CATALOG.filter((i) => i.category === activeCategory);

  const isEquipped = (item: CosmeticItemWeb) => {
    if (item.category === 'skin') return item.id === equippedSkin;
    if (item.category === 'board') return item.id === equippedBoard;
    return item.id === equippedTrail;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Cosmetic Locker"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 select-none font-['Orbitron']"
    >
      <div className="w-full max-w-2xl max-h-[85vh] bg-[#0c111e] border border-cyan-500/40 rounded-3xl p-6 flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h2 className="text-xl font-black text-cyan-400">COSMETIC LOCKER</h2>
            <p className="text-xs text-gray-400 font-sans">
              Personalize your courier runner with persistent cosmetics.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="bg-[#141b2e] border border-amber-500/30 px-3 py-1 rounded-xl text-amber-300 font-mono font-bold text-xs">
              ◆ {energyCores}
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
        </div>

        {/* Category Tabs */}
        <div className="grid grid-cols-3 gap-2 py-4 border-b border-white/5">
          <button
            onClick={() => {
              sound.playClick();
              setActiveCategory('skin');
            }}
            className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeCategory === 'skin'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                : 'bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            RUNNER SKINS
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setActiveCategory('board');
            }}
            className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeCategory === 'board'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                : 'bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            HOVERBOARDS
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setActiveCategory('trail');
            }}
            className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeCategory === 'trail'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                : 'bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            TRAIL FX
          </button>
        </div>

        {/* Items Grid */}
        <div className="flex-1 overflow-y-auto py-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredItems.map((item) => {
            const unlocked = unlockedIds.includes(item.id);
            const equipped = isEquipped(item);

            return (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                  equipped
                    ? 'bg-cyan-950/30 border-cyan-400 shadow-md shadow-cyan-500/10'
                    : 'bg-[#141b2e] border-white/5'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center border border-white/20 shadow"
                      style={{ backgroundColor: item.colorHex }}
                    />
                    <div>
                      <h4 className="font-bold text-white text-sm">{item.name}</h4>
                      <p className="text-[11px] text-gray-400 font-sans leading-tight">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <span className="text-xs font-mono text-gray-400">
                    {unlocked ? (equipped ? '✓ EQUIPPED' : 'UNLOCKED') : `◆ ${item.cost}`}
                  </span>

                  {equipped ? (
                    <span className="text-xs text-cyan-400 font-bold">ACTIVE</span>
                  ) : unlocked ? (
                    <button
                      onClick={() => {
                        sound.playClick();
                        onEquip(item.category, item.id);
                      }}
                      className="px-3 py-1.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer"
                    >
                      EQUIP
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        sound.playPowerUp();
                        onUnlock(item.id, item.cost);
                      }}
                      disabled={energyCores < item.cost}
                      className={`px-3 py-1.5 font-bold text-xs rounded-xl transition-all ${
                        energyCores >= item.cost
                          ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md cursor-pointer'
                          : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      UNLOCK
                    </button>
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
