import React from 'react';
import { calculateEstimatedRevenue } from '../game/rules';
import { sound } from '../audio/soundSystem';

export interface AnalyticsDataWeb {
  totalRuns: number;
  totalDistance: number;
  totalCores: number;
  highScore: number;
  rewardedLoads: number;
  rewardedSuccesses: number;
  rewardedCompletions: number;
  actualRewardsGranted: number;
  interstitialLoads: number;
  interstitialImpressions: number;
  adClicks: number;
}

interface AnalyticsModalProps {
  analytics: AnalyticsDataWeb;
  onClose: () => void;
}

export const AnalyticsModal: React.FC<AnalyticsModalProps> = ({ analytics, onClose }) => {
  const totalEligibleImpressions = analytics.rewardedCompletions + analytics.interstitialImpressions;
  const benchmarkEcpm = 15.0;
  const revenueEstimate = calculateEstimatedRevenue(totalEligibleImpressions, benchmarkEcpm);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Performance Analytics & Ads Dashboard"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 select-none font-['Orbitron']"
    >
      <div className="w-full max-w-2xl max-h-[85vh] bg-[#0c111e] border border-cyan-500/40 rounded-3xl p-6 flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h2 className="text-xl font-black text-cyan-400">ANALYTICS & AD INTELLIGENCE</h2>
            <p className="text-xs text-gray-400 font-sans">
              Real-time gameplay metrics and Unity Ads SDK lifecycle tracking.
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

        {/* Analytics Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {/* Section 1: Gameplay Telemetry */}
          <div className="bg-[#141b2e] p-4 rounded-2xl border border-white/5 space-y-2">
            <h3 className="text-xs font-bold text-cyan-400 tracking-wider">GAMEPLAY TELEMETRY</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-1">
              <div className="bg-[#0b101c] p-2.5 rounded-xl border border-white/5">
                <div className="text-[10px] text-gray-400 font-mono">Total Runs</div>
                <div className="text-base font-bold text-white font-mono">{analytics.totalRuns}</div>
              </div>
              <div className="bg-[#0b101c] p-2.5 rounded-xl border border-white/5">
                <div className="text-[10px] text-gray-400 font-mono">Distance Traveled</div>
                <div className="text-base font-bold text-cyan-300 font-mono">{analytics.totalDistance}m</div>
              </div>
              <div className="bg-[#0b101c] p-2.5 rounded-xl border border-white/5">
                <div className="text-[10px] text-gray-400 font-mono">Cores Collected</div>
                <div className="text-base font-bold text-amber-400 font-mono">{analytics.totalCores}</div>
              </div>
              <div className="bg-[#0b101c] p-2.5 rounded-xl border border-white/5">
                <div className="text-[10px] text-gray-400 font-mono">High Score</div>
                <div className="text-base font-bold text-pink-400 font-mono">{analytics.highScore}</div>
              </div>
            </div>
          </div>

          {/* Section 2: Real Unity Ads Lifecycle Tracker */}
          <div className="bg-[#141b2e] p-4 rounded-2xl border border-white/5 space-y-3">
            <h3 className="text-xs font-bold text-amber-400 tracking-wider">
              UNITY ADS SDK LIFECYCLE (TEST MODE)
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="flex justify-between p-2 bg-[#0b101c] rounded-lg">
                <span className="text-gray-400">Rewarded Loads:</span>
                <span className="text-white font-bold">{analytics.rewardedLoads}</span>
              </div>
              <div className="flex justify-between p-2 bg-[#0b101c] rounded-lg">
                <span className="text-gray-400">Rewarded Successes:</span>
                <span className="text-cyan-300 font-bold">{analytics.rewardedSuccesses}</span>
              </div>
              <div className="flex justify-between p-2 bg-[#0b101c] rounded-lg">
                <span className="text-gray-400">Completed Video Plays:</span>
                <span className="text-emerald-400 font-bold">{analytics.rewardedCompletions}</span>
              </div>
              <div className="flex justify-between p-2 bg-[#0b101c] rounded-lg">
                <span className="text-gray-400">Rewards Granted:</span>
                <span className="text-amber-400 font-bold">{analytics.actualRewardsGranted}</span>
              </div>
              <div className="flex justify-between p-2 bg-[#0b101c] rounded-lg">
                <span className="text-gray-400">Interstitial Impressions:</span>
                <span className="text-white font-bold">{analytics.interstitialImpressions}</span>
              </div>
              <div className="flex justify-between p-2 bg-[#0b101c] rounded-lg">
                <span className="text-gray-400">Recorded Ad Clicks:</span>
                <span className="text-pink-400 font-bold">{analytics.adClicks}</span>
              </div>
            </div>
          </div>

          {/* Section 3: Revenue Estimation Benchmark */}
          <div className="bg-gradient-to-br from-[#12201d] to-[#0c1715] p-5 rounded-2xl border border-emerald-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-emerald-400 tracking-wider">
                TRANSPARENT REVENUE ESTIMATE
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                ${benchmarkEcpm.toFixed(2)} eCPM Benchmark
              </span>
            </div>

            <div className="text-2xl font-black text-emerald-400 font-mono">
              ${revenueEstimate.estimatedRevenueUsd.toFixed(4)} USD
            </div>

            <div className="text-xs text-gray-300 font-mono">
              Formula: {revenueEstimate.formula}
            </div>

            <p className="text-[11px] text-gray-400 font-sans leading-relaxed pt-1">
              ⚠️ <strong>Disclaimer:</strong> {revenueEstimate.disclaimer} Official revenue is calculated solely by the Unity Ads Monetization Dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
