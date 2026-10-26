import React, { useState, useEffect, useRef } from 'react';
import { GameCanvas, GameCanvasHandle } from './components/GameCanvas';
import { HUD } from './components/HUD';
import { TitleScreen } from './components/TitleScreen';
import { PauseModal } from './components/PauseModal';
import { GameOverModal } from './components/GameOverModal';
import { UnityAdModal } from './components/UnityAdModal';
import { AndroidProjectHub } from './components/AndroidProjectHub';
import { MissionsModal } from './components/MissionsModal';
import { LockerModal, COSMETIC_CATALOG } from './components/LockerModal';
import { AnalyticsModal, AnalyticsDataWeb } from './components/AnalyticsModal';
import { SettingsModal } from './components/SettingsModal';
import { DailyMission, canShowInterstitial } from './game/rules';
import { sound } from './audio/soundSystem';

type AppState = 'title' | 'playing' | 'paused' | 'gameover';

const INITIAL_MISSIONS: DailyMission[] = [
  {
    id: 'm1',
    title: 'Aero Dash',
    description: 'Travel 1,200m across high-altitude rooftops',
    target: 1200,
    current: 0,
    completed: false,
    rewardCores: 50,
    type: 'DISTANCE',
  },
  {
    id: 'm2',
    title: 'Core Harvester',
    description: 'Collect 60 luminous Energy Cores',
    target: 60,
    current: 0,
    completed: false,
    rewardCores: 45,
    type: 'CORES',
  },
  {
    id: 'm3',
    title: 'Acrobat',
    description: 'Perform 10 low slides beneath neon conduits',
    target: 10,
    current: 0,
    completed: false,
    rewardCores: 40,
    type: 'SLIDES',
  },
  {
    id: 'm4',
    title: 'Overcharge',
    description: 'Collect 2 Power-Up spheres during runs',
    target: 2,
    current: 0,
    completed: false,
    rewardCores: 35,
    type: 'POWERUPS',
  },
];

export default function App() {
  const canvasRef = useRef<GameCanvasHandle | null>(null);

  // Core App Flow State
  const [gameState, setGameState] = useState<AppState>('title');

  // Player Stats & Currency
  const [energyCores, setEnergyCores] = useState<number>(() => {
    const saved = localStorage.getItem('sr_cores');
    return saved !== null ? parseInt(saved, 10) : 120;
  });

  const [personalBestDistance, setPersonalBestDistance] = useState<number>(() => {
    const saved = localStorage.getItem('sr_pb_dist');
    return saved !== null ? parseInt(saved, 10) : 0;
  });

  const [personalBestScore, setPersonalBestScore] = useState<number>(() => {
    const saved = localStorage.getItem('sr_pb_score');
    return saved !== null ? parseInt(saved, 10) : 0;
  });

  // Current Live Run Telemetry
  const [currentDistance, setCurrentDistance] = useState<number>(0);
  const [currentScore, setCurrentScore] = useState<number>(0);
  const [currentCores, setCurrentCores] = useState<number>(0);
  const [powerUps, setPowerUps] = useState({ shield: false, magnet: 0, boost: 0 });
  const [hasRevivedThisRun, setHasRevivedThisRun] = useState<boolean>(false);
  const [isNewPersonalBest, setIsNewPersonalBest] = useState<boolean>(false);

  // Cosmetics
  const [unlockedCosmetics, setUnlockedCosmetics] = useState<string[]>(() => {
    const saved = localStorage.getItem('sr_unlocked_cosmetics');
    return saved ? JSON.parse(saved) : ['skin_courier', 'board_aero', 'trail_plasma'];
  });
  const [equippedSkin, setEquippedSkin] = useState<string>(() => localStorage.getItem('sr_skin') || 'skin_courier');
  const [equippedBoard, setEquippedBoard] = useState<string>(() => localStorage.getItem('sr_board') || 'board_aero');
  const [equippedTrail, setEquippedTrail] = useState<string>(() => localStorage.getItem('sr_trail') || 'trail_plasma');

  // Daily Missions
  const [missions, setMissions] = useState<DailyMission[]>(() => {
    const saved = localStorage.getItem('sr_missions');
    return saved ? JSON.parse(saved) : INITIAL_MISSIONS;
  });

  // Preferences
  const [sfxEnabled, setSfxEnabled] = useState<boolean>(() => localStorage.getItem('sr_sfx') !== 'false');
  const [musicEnabled, setMusicEnabled] = useState<boolean>(() => localStorage.getItem('sr_music') !== 'false');
  const [hapticsEnabled, setHapticsEnabled] = useState<boolean>(() => localStorage.getItem('sr_haptics') !== 'false');
  const [reducedMotion, setReducedMotion] = useState<boolean>(() => localStorage.getItem('sr_reduced_motion') === 'true');

  // Ad Analytics & Lifecycle Tracking
  const [analytics, setAnalytics] = useState<AnalyticsDataWeb>(() => {
    const saved = localStorage.getItem('sr_analytics');
    return saved
      ? JSON.parse(saved)
      : {
          totalRuns: 0,
          totalDistance: 0,
          totalCores: 0,
          highScore: 0,
          rewardedLoads: 0,
          rewardedSuccesses: 0,
          rewardedCompletions: 0,
          actualRewardsGranted: 0,
          interstitialLoads: 0,
          interstitialImpressions: 0,
          adClicks: 0,
        };
  });

  // Interstitial Frequency State
  const [runsSinceLastInterstitial, setRunsSinceLastInterstitial] = useState<number>(0);
  const [lastInterstitialTime, setLastInterstitialTime] = useState<number>(Date.now());

  // Active Modals
  const [activeAd, setActiveAd] = useState<{
    open: boolean;
    isRewarded: boolean;
    placementId: string;
    onSuccess: () => void;
  } | null>(null);

  const [showAndroidHub, setShowAndroidHub] = useState<boolean>(false);
  const [showMissions, setShowMissions] = useState<boolean>(false);
  const [showLocker, setShowLocker] = useState<boolean>(false);
  const [showAnalytics, setShowAnalytics] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  // Sync state machine with DOM attribute
  useEffect(() => {
    document.body.dataset.state = gameState;
  }, [gameState]);

  // Audio system sync
  useEffect(() => {
    sound.sfxEnabled = sfxEnabled;
    sound.musicEnabled = musicEnabled;
  }, [sfxEnabled, musicEnabled]);

  // Handle autostart query param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      startRun();
    }
  }, []);

  // Save persistent state to localStorage
  useEffect(() => {
    localStorage.setItem('sr_cores', energyCores.toString());
    localStorage.setItem('sr_pb_dist', personalBestDistance.toString());
    localStorage.setItem('sr_pb_score', personalBestScore.toString());
    localStorage.setItem('sr_unlocked_cosmetics', JSON.stringify(unlockedCosmetics));
    localStorage.setItem('sr_skin', equippedSkin);
    localStorage.setItem('sr_board', equippedBoard);
    localStorage.setItem('sr_trail', equippedTrail);
    localStorage.setItem('sr_missions', JSON.stringify(missions));
    localStorage.setItem('sr_sfx', sfxEnabled.toString());
    localStorage.setItem('sr_music', musicEnabled.toString());
    localStorage.setItem('sr_haptics', hapticsEnabled.toString());
    localStorage.setItem('sr_reduced_motion', reducedMotion.toString());
    localStorage.setItem('sr_analytics', JSON.stringify(analytics));
  }, [
    energyCores,
    personalBestDistance,
    personalBestScore,
    unlockedCosmetics,
    equippedSkin,
    equippedBoard,
    equippedTrail,
    missions,
    sfxEnabled,
    musicEnabled,
    hapticsEnabled,
    reducedMotion,
    analytics,
  ]);

  // Keyboard Pause listener (Escape or P)
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        if (gameState === 'playing') {
          setGameState('paused');
          sound.stopMusic();
        } else if (gameState === 'paused') {
          setGameState('playing');
          if (musicEnabled) sound.startMusic();
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [gameState, musicEnabled]);

  // Start a fresh run
  const startRun = () => {
    setCurrentDistance(0);
    setCurrentScore(0);
    setCurrentCores(0);
    setPowerUps({ shield: false, magnet: 0, boost: 0 });
    setHasRevivedThisRun(false);
    setIsNewPersonalBest(false);
    setGameState('playing');
    canvasRef.current?.restart();
    if (musicEnabled) sound.startMusic();
  };

  // Live stats callback from canvas loop
  const handleUpdateStats = (dist: number, score: number, cores: number) => {
    setCurrentDistance(dist);
    setCurrentScore(score);
    setCurrentCores(cores);

    // Update Missions in-flight
    setMissions((prev) =>
      prev.map((m) => {
        if (m.type === 'DISTANCE') {
          const current = Math.max(m.current, dist);
          return { ...m, current, completed: current >= m.target };
        }
        if (m.type === 'CORES') {
          const current = Math.max(m.current, cores);
          return { ...m, current, completed: current >= m.target };
        }
        return m;
      })
    );
  };

  // Game Over Handler
  const handleGameOver = (finalDist: number, finalScore: number, finalCores: number) => {
    sound.stopMusic();
    const isNewPB = finalScore > personalBestScore;
    setIsNewPersonalBest(isNewPB);

    // Save PBs
    if (finalDist > personalBestDistance) setPersonalBestDistance(finalDist);
    if (isNewPB) setPersonalBestScore(finalScore);

    // Add collected cores to persistent wallet
    setEnergyCores((prev) => prev + finalCores);

    // Increment analytics
    setAnalytics((prev) => ({
      ...prev,
      totalRuns: prev.totalRuns + 1,
      totalDistance: prev.totalDistance + finalDist,
      totalCores: prev.totalCores + finalCores,
      highScore: Math.max(prev.highScore, finalScore),
    }));

    setRunsSinceLastInterstitial((prev) => prev + 1);
    setGameState('gameover');
  };

  // Unity Ads: Rewarded Video Revive
  const handleRequestRevive = () => {
    setAnalytics((prev) => ({
      ...prev,
      rewardedLoads: prev.rewardedLoads + 1,
      rewardedSuccesses: prev.rewardedSuccesses + 1,
    }));

    setActiveAd({
      open: true,
      isRewarded: true,
      placementId: 'Rewarded_Android',
      onSuccess: () => {
        setHasRevivedThisRun(true);
        setAnalytics((prev) => ({
          ...prev,
          rewardedCompletions: prev.rewardedCompletions + 1,
          actualRewardsGranted: prev.actualRewardsGranted + 1,
        }));
        setGameState('playing');
        canvasRef.current?.revivePlayer();
        if (musicEnabled) sound.startMusic();
      },
    });
  };

  // Unity Ads: Rewarded Video Bonus Cores (+50 Cores)
  const handleRequestBonusCores = () => {
    setAnalytics((prev) => ({
      ...prev,
      rewardedLoads: prev.rewardedLoads + 1,
      rewardedSuccesses: prev.rewardedSuccesses + 1,
    }));

    setActiveAd({
      open: true,
      isRewarded: true,
      placementId: 'Rewarded_Android',
      onSuccess: () => {
        setEnergyCores((prev) => prev + 50);
        setAnalytics((prev) => ({
          ...prev,
          rewardedCompletions: prev.rewardedCompletions + 1,
          actualRewardsGranted: prev.actualRewardsGranted + 1,
        }));
      },
    });
  };

  // Return to Menu / Check Interstitial Frequency
  const handleReturnToMenu = () => {
    const policy = {
      minRunsBetweenInterstitials: 3,
      minSecondsBetweenInterstitials: 60,
      runsSinceLastInterstitial,
      lastInterstitialTimestampMs: lastInterstitialTime,
    };

    if (canShowInterstitial(policy, Date.now(), false)) {
      setRunsSinceLastInterstitial(0);
      setLastInterstitialTime(Date.now());
      setAnalytics((prev) => ({
        ...prev,
        interstitialLoads: prev.interstitialLoads + 1,
      }));

      setActiveAd({
        open: true,
        isRewarded: false,
        placementId: 'Interstitial_Android',
        onSuccess: () => {
          setAnalytics((prev) => ({
            ...prev,
            interstitialImpressions: prev.interstitialImpressions + 1,
          }));
          setGameState('title');
        },
      });
    } else {
      setGameState('title');
    }
  };

  // Get active cosmetic color hexes
  const activeSkinItem = COSMETIC_CATALOG.find((c) => c.id === equippedSkin);
  const activeTrailItem = COSMETIC_CATALOG.find((c) => c.id === equippedTrail);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0A0D14]">
      {/* 2D Canvas Runner Engine Viewport */}
      <GameCanvas
        ref={canvasRef}
        isPlaying={gameState === 'playing' || gameState === 'paused'}
        isPaused={gameState === 'paused'}
        equippedSkinColor={activeSkinItem?.colorHex || '#00F0FF'}
        equippedTrailColor={activeTrailItem?.colorHex || '#00F0FF'}
        onUpdateStats={handleUpdateStats}
        onGameOver={handleGameOver}
        onPowerUpChange={setPowerUps}
      />

      {/* In-Game Live HUD */}
      {gameState === 'playing' && (
        <HUD
          distanceMeters={currentDistance}
          score={currentScore}
          coresCollected={currentCores}
          powerUps={powerUps}
          isMuted={!sfxEnabled && !musicEnabled}
          onPause={() => {
            sound.stopMusic();
            setGameState('paused');
          }}
          onToggleMute={() => {
            const next = !sfxEnabled;
            setSfxEnabled(next);
            setMusicEnabled(next);
            if (!next) sound.stopMusic();
            else sound.startMusic();
          }}
          onLeft={() => canvasRef.current?.triggerSwipeLeft()}
          onRight={() => canvasRef.current?.triggerSwipeRight()}
          onJump={() => {
            canvasRef.current?.triggerJump();
            // Mission jump progress
            setMissions((prev) =>
              prev.map((m) => (m.type === 'JUMPS' ? { ...m, current: m.current + 1, completed: m.current + 1 >= m.target } : m))
            );
          }}
          onSlide={() => {
            canvasRef.current?.triggerSlide();
            // Mission slide progress
            setMissions((prev) =>
              prev.map((m) => (m.type === 'SLIDES' ? { ...m, current: m.current + 1, completed: m.current + 1 >= m.target } : m))
            );
          }}
        />
      )}

      {/* Title / Start Screen */}
      {gameState === 'title' && (
        <TitleScreen
          energyCores={energyCores}
          personalBestDistance={personalBestDistance}
          personalBestScore={personalBestScore}
          onStartGame={startRun}
          onOpenAndroidHub={() => setShowAndroidHub(true)}
          onOpenMissions={() => setShowMissions(true)}
          onOpenLocker={() => setShowLocker(true)}
          onOpenAnalytics={() => setShowAnalytics(true)}
          onOpenSettings={() => setShowSettings(true)}
        />
      )}

      {/* Pause Screen Overlay */}
      {gameState === 'paused' && (
        <PauseModal
          onResume={() => {
            setGameState('playing');
            if (musicEnabled) sound.startMusic();
          }}
          onRestart={startRun}
          onQuit={() => {
            sound.stopMusic();
            setGameState('title');
          }}
        />
      )}

      {/* Game Over Screen Overlay */}
      {gameState === 'gameover' && (
        <GameOverModal
          distanceMeters={currentDistance}
          score={currentScore}
          coresCollected={currentCores}
          isPersonalBest={isNewPersonalBest}
          canRevive={!hasRevivedThisRun}
          onRequestRevive={handleRequestRevive}
          onRequestBonusCores={handleRequestBonusCores}
          onRestart={startRun}
          onHome={handleReturnToMenu}
        />
      )}

      {/* Unity Ads Player Simulator Modal */}
      {activeAd && activeAd.open && (
        <UnityAdModal
          placementId={activeAd.placementId}
          isRewarded={activeAd.isRewarded}
          onAdCompleted={() => {
            activeAd.onSuccess();
          }}
          onAdClosed={() => {
            setActiveAd(null);
          }}
        />
      )}

      {/* Native Android Project Hub & ZIP Downloader */}
      {showAndroidHub && <AndroidProjectHub onClose={() => setShowAndroidHub(false)} />}

      {/* Daily Missions Modal */}
      {showMissions && (
        <MissionsModal
          missions={missions}
          onClaim={(id, reward) => {
            setEnergyCores((prev) => prev + reward);
            setMissions((prev) => prev.filter((m) => m.id !== id));
          }}
          onClose={() => setShowMissions(false)}
        />
      )}

      {/* Cosmetics Locker Modal */}
      {showLocker && (
        <LockerModal
          energyCores={energyCores}
          unlockedIds={unlockedCosmetics}
          equippedSkin={equippedSkin}
          equippedBoard={equippedBoard}
          equippedTrail={equippedTrail}
          onEquip={(cat, id) => {
            if (cat === 'skin') setEquippedSkin(id);
            else if (cat === 'board') setEquippedBoard(id);
            else setEquippedTrail(id);
          }}
          onUnlock={(id, cost) => {
            if (energyCores >= cost && !unlockedCosmetics.includes(id)) {
              setEnergyCores((prev) => prev - cost);
              setUnlockedCosmetics((prev) => [...prev, id]);
            }
          }}
          onClose={() => setShowLocker(false)}
        />
      )}

      {/* Analytics & Ad Intelligence Modal */}
      {showAnalytics && <AnalyticsModal analytics={analytics} onClose={() => setShowAnalytics(false)} />}

      {/* Settings & Privacy Modal */}
      {showSettings && (
        <SettingsModal
          sfxEnabled={sfxEnabled}
          musicEnabled={musicEnabled}
          hapticsEnabled={hapticsEnabled}
          reducedMotion={reducedMotion}
          onToggleSfx={setSfxEnabled}
          onToggleMusic={setMusicEnabled}
          onToggleHaptics={setHapticsEnabled}
          onToggleReducedMotion={setReducedMotion}
          onResetProgress={() => {
            localStorage.clear();
            setEnergyCores(100);
            setPersonalBestDistance(0);
            setPersonalBestScore(0);
            setUnlockedCosmetics(['skin_courier', 'board_aero', 'trail_plasma']);
            setEquippedSkin('skin_courier');
            setEquippedBoard('board_aero');
            setEquippedTrail('trail_plasma');
            setMissions(INITIAL_MISSIONS);
            setAnalytics({
              totalRuns: 0,
              totalDistance: 0,
              totalCores: 0,
              highScore: 0,
              rewardedLoads: 0,
              rewardedSuccesses: 0,
              rewardedCompletions: 0,
              actualRewardsGranted: 0,
              interstitialLoads: 0,
              interstitialImpressions: 0,
              adClicks: 0,
            });
          }}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
