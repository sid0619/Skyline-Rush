import React, { useRef, useEffect } from 'react';
import {
  Lane,
  PlayerActionState,
  ObstacleInstance,
  CollectibleCore,
  PowerUpInstance,
  clampLane,
  moveLeft,
  moveRight,
  calculateSpeed,
  checkObstacleCollision,
  checkCollectiblePickup,
  validateObstaclePattern,
  INITIAL_GAME_CONFIG,
} from '../game/rules';
import { sound } from '../audio/soundSystem';

export interface GameCanvasProps {
  isPlaying: boolean;
  isPaused: boolean;
  equippedSkinColor: string;
  equippedTrailColor: string;
  onUpdateStats: (distance: number, score: number, cores: number) => void;
  onGameOver: (distance: number, score: number, cores: number) => void;
  onPowerUpChange: (powerUps: { shield: boolean; magnet: number; boost: number }) => void;
  onRequestReviveResume?: () => void;
}

export interface GameCanvasHandle {
  revivePlayer: () => void;
  restart: () => void;
  triggerSwipeLeft: () => void;
  triggerSwipeRight: () => void;
  triggerJump: () => void;
  triggerSlide: () => void;
}

export const GameCanvas = React.forwardRef<GameCanvasHandle, GameCanvasProps>(
  (
    {
      isPlaying,
      isPaused,
      equippedSkinColor,
      equippedTrailColor,
      onUpdateStats,
      onGameOver,
      onPowerUpChange,
    },
    ref
  ) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    // Gameplay state stored in refs to prevent React state tearing in 60Hz requestAnimationFrame
    const stateRef = useRef({
      lane: 1 as Lane,
      targetLane: 1 as Lane,
      laneInterpolation: 1.0, // current continuous lane X (0 to 2)
      actionState: 'RUNNING' as PlayerActionState,
      actionTimer: 0,
      jumpHeight: 0,
      isShielded: false,
      magnetTimer: 0,
      scoreBoostTimer: 0,
      distanceMeters: 0,
      coresCollected: 0,
      score: 0,
      obstacles: [] as ObstacleInstance[],
      cores: [] as CollectibleCore[],
      powerUps: [] as PowerUpInstance[],
      particles: [] as Array<{ x: number; y: number; vx: number; vy: number; color: string; life: number }>,
      isGameOver: false,
      nextSpawnZ: 30,
    });

    // Touch / Drag input tracking
    const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

    const triggerSwipeLeft = () => {
      const s = stateRef.current;
      if (s.isGameOver) return;
      const next = moveLeft(s.targetLane);
      if (next !== s.targetLane) {
        s.targetLane = next;
        sound.playClick();
      }
    };

    const triggerSwipeRight = () => {
      const s = stateRef.current;
      if (s.isGameOver) return;
      const next = moveRight(s.targetLane);
      if (next !== s.targetLane) {
        s.targetLane = next;
        sound.playClick();
      }
    };

    const triggerJump = () => {
      const s = stateRef.current;
      if (s.isGameOver) return;
      if (s.actionState === 'RUNNING') {
        s.actionState = 'JUMPING';
        s.actionTimer = INITIAL_GAME_CONFIG.JUMP_DURATION;
        s.jumpHeight = 0;
        sound.playJump();
      }
    };

    const triggerSlide = () => {
      const s = stateRef.current;
      if (s.isGameOver) return;
      if (s.actionState === 'RUNNING') {
        s.actionState = 'SLIDING';
        s.actionTimer = INITIAL_GAME_CONFIG.SLIDE_DURATION;
        sound.playSlide();
      }
    };

    const restartGame = () => {
      const s = stateRef.current;
      s.lane = 1;
      s.targetLane = 1;
      s.laneInterpolation = 1.0;
      s.actionState = 'RUNNING';
      s.actionTimer = 0;
      s.jumpHeight = 0;
      s.isShielded = false;
      s.magnetTimer = 0;
      s.scoreBoostTimer = 0;
      s.distanceMeters = 0;
      s.coresCollected = 0;
      s.score = 0;
      s.obstacles = [];
      s.cores = [];
      s.powerUps = [];
      s.particles = [];
      s.isGameOver = false;
      s.nextSpawnZ = 35;

      // Seed initial safe collectibles ahead
      for (let i = 0; i < 5; i++) {
        s.cores.push({
          id: `core-init-${i}`,
          lane: 1,
          zDistance: 15 + i * 4,
          collected: false,
        });
      }
    };

    const revivePlayer = () => {
      const s = stateRef.current;
      s.isGameOver = false;
      s.actionState = 'RUNNING';
      s.isShielded = true; // Invulnerability shield after revive
      s.jumpHeight = 0;
      // Clear all obstacles in close range ahead for a safe continuation corridor
      s.obstacles = s.obstacles.filter((o) => o.zDistance < -5 || o.zDistance > 35);
      sound.playPowerUp();
    };

    React.useImperativeHandle(ref, () => ({
      revivePlayer,
      restart: restartGame,
      triggerSwipeLeft,
      triggerSwipeRight,
      triggerJump,
      triggerSlide,
    }));

    // Keyboard controls
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (!isPlaying || isPaused) return;
        switch (e.key) {
          case 'ArrowLeft':
          case 'a':
          case 'A':
            triggerSwipeLeft();
            break;
          case 'ArrowRight':
          case 'd':
          case 'D':
            triggerSwipeRight();
            break;
          case 'ArrowUp':
          case 'w':
          case 'W':
          case ' ':
            e.preventDefault();
            triggerJump();
            break;
          case 'ArrowDown':
          case 's':
          case 'S':
            e.preventDefault();
            triggerSlide();
            break;
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isPlaying, isPaused]);

    // Touch and Drag handlers
    const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      touchStartRef.current = { x: clientX, y: clientY, time: Date.now() };
    };

    const handleTouchEnd = (e: React.TouchEvent | React.MouseEvent) => {
      if (!touchStartRef.current) return;
      const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : (e as React.MouseEvent).clientX;
      const clientY = 'changedTouches' in e ? e.changedTouches[0].clientY : (e as React.MouseEvent).clientY;

      const dx = clientX - touchStartRef.current.x;
      const dy = clientY - touchStartRef.current.y;
      const threshold = 35;

      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx < -threshold) triggerSwipeLeft();
        else if (dx > threshold) triggerSwipeRight();
      } else {
        if (dy < -threshold) triggerJump();
        else if (dy > threshold) triggerSlide();
      }

      touchStartRef.current = null;
    };

    // Main 60 FPS Canvas Game Loop
    useEffect(() => {
      if (!isPlaying) return;

      let animationFrameId: number;
      let lastTime = performance.now();

      const loop = (currentTime: number) => {
        const rawDt = (currentTime - lastTime) / 1000;
        lastTime = currentTime;
        const dt = Math.min(rawDt, 0.05); // clamped simulation step

        const s = stateRef.current;
        const canvas = canvasRef.current;

        if (canvas && !isPaused && !s.isGameOver) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            // 1. Advance Physics & Player State
            const speed = calculateSpeed(s.distanceMeters);
            const distDelta = speed * dt;
            s.distanceMeters += distDelta;

            // Smooth lane interpolation
            const laneDiff = s.targetLane - s.laneInterpolation;
            s.laneInterpolation += laneDiff * Math.min(1.0, dt * 14);
            s.lane = Math.round(s.laneInterpolation) as Lane;

            // Jump / Slide timers
            if (s.actionState === 'JUMPING') {
              s.actionTimer -= dt;
              if (s.actionTimer <= 0) {
                s.actionState = 'RUNNING';
                s.actionTimer = 0;
                s.jumpHeight = 0;
              } else {
                // Parabolic Jump
                const progress = 1.0 - s.actionTimer / INITIAL_GAME_CONFIG.JUMP_DURATION;
                s.jumpHeight = Math.sin(progress * Math.PI);
              }
            } else if (s.actionState === 'SLIDING') {
              s.actionTimer -= dt;
              if (s.actionTimer <= 0) {
                s.actionState = 'RUNNING';
                s.actionTimer = 0;
              }
            }

            // Power-up countdowns
            if (s.magnetTimer > 0) s.magnetTimer = Math.max(0, s.magnetTimer - dt);
            if (s.scoreBoostTimer > 0) s.scoreBoostTimer = Math.max(0, s.scoreBoostTimer - dt);

            // Score update
            const multiplier = s.scoreBoostTimer > 0 ? 2 : 1;
            s.score += Math.floor(distDelta * INITIAL_GAME_CONFIG.DISTANCE_SCORE_RATE * multiplier);

            // 2. Advance Entities
            for (const obs of s.obstacles) {
              obs.zDistance -= distDelta;
              if (obs.type === 'PATROL_DRONE') {
                obs.patrolSpeed = obs.patrolSpeed || 2.0;
                obs.patrolDirection = obs.patrolDirection || 1;
                // Move laterally
              }
            }

            for (const core of s.cores) {
              core.zDistance -= distDelta;
              // Magnet suction attraction
              if (s.magnetTimer > 0 && Math.abs(core.zDistance) < 14) {
                const targetL = s.targetLane;
                core.lane = targetL;
              }
            }

            for (const p of s.powerUps) {
              p.zDistance -= distDelta;
            }

            // 3. Check Collisions & Pickups
            // Pickups
            for (const core of s.cores) {
              if (checkCollectiblePickup(s.lane, core, s.magnetTimer > 0)) {
                core.collected = true;
                s.coresCollected += 1;
                s.score += INITIAL_GAME_CONFIG.CORE_VALUE_SCORE * multiplier;
                sound.playCorePickup();

                // Spawn pickup particle sparks
                for (let i = 0; i < 5; i++) {
                  s.particles.push({
                    x: (s.laneInterpolation + 0.5) * (canvas.width / 3),
                    y: canvas.height * 0.85,
                    vx: (Math.random() - 0.5) * 120,
                    vy: -Math.random() * 150,
                    color: '#00F0FF',
                    life: 0.3,
                  });
                }
              }
            }

            for (const p of s.powerUps) {
              if (!p.collected && Math.abs(p.zDistance) <= 1.2 && p.lane === s.lane) {
                p.collected = true;
                sound.playPowerUp();
                if (p.type === 'SHIELD') s.isShielded = true;
                if (p.type === 'MAGNET') s.magnetTimer = INITIAL_GAME_CONFIG.MAGNET_DURATION_DEFAULT;
                if (p.type === 'SCORE_BOOST') s.scoreBoostTimer = INITIAL_GAME_CONFIG.SCORE_BOOST_DURATION_DEFAULT;
              }
            }

            // Obstacle Collisions
            for (const obs of s.obstacles) {
              const res = checkObstacleCollision(
                {
                  lane: s.lane,
                  actionState: s.actionState,
                  jumpHeight: s.jumpHeight,
                  isShielded: s.isShielded,
                },
                obs
              );

              if (res.absorbedByShield) {
                s.isShielded = false;
                obs.zDistance = -10; // destroy obstacle
                sound.playShieldAbsorb();
              } else if (res.collides) {
                s.isGameOver = true;
                sound.playCrash();
                onGameOver(Math.floor(s.distanceMeters), s.score, s.coresCollected);
                break;
              }
            }

            // Entity Cleanup
            s.obstacles = s.obstacles.filter((o) => o.zDistance > -10);
            s.cores = s.cores.filter((c) => c.zDistance > -10 && !c.collected);
            s.powerUps = s.powerUps.filter((p) => p.zDistance > -10 && !p.collected);

            // 4. Procedural Generator Streaming
            const spawnHorizon = s.distanceMeters + 120;
            while (s.nextSpawnZ < spawnHorizon) {
              const z = s.nextSpawnZ;
              const randPattern = Math.floor(Math.random() * 4);

              if (randPattern === 0) {
                // Ground Barrier (must jump)
                const lane = Math.floor(Math.random() * 3) as Lane;
                s.obstacles.push({
                  id: `obs-g-${z}`,
                  type: 'GROUND_BARRIER',
                  lane,
                  zDistance: z - s.distanceMeters,
                  widthMeters: 2.2,
                  lengthMeters: 1.0,
                  heightMeters: 0.9,
                  yOffsetMeters: 0,
                });
              } else if (randPattern === 1) {
                // Overhead Barrier (must slide)
                const lane = Math.floor(Math.random() * 3) as Lane;
                s.obstacles.push({
                  id: `obs-o-${z}`,
                  type: 'OVERHEAD_BARRIER',
                  lane,
                  zDistance: z - s.distanceMeters,
                  widthMeters: 2.2,
                  lengthMeters: 1.0,
                  heightMeters: 1.2,
                  yOffsetMeters: 1.0,
                });
              } else if (randPattern === 2) {
                // Lane Blocker (leaves 1 or 2 lanes free)
                const blockedCount = Math.random() < 0.6 ? 2 : 1;
                const lanes = [0, 1, 2].sort(() => Math.random() - 0.5).slice(0, blockedCount);
                for (const l of lanes) {
                  s.obstacles.push({
                    id: `obs-b-${z}-${l}`,
                    type: 'LANE_BLOCKER',
                    lane: l as Lane,
                    zDistance: z - s.distanceMeters,
                    widthMeters: 2.2,
                    lengthMeters: 1.2,
                    heightMeters: 2.5,
                    yOffsetMeters: 0,
                  });
                }
              } else {
                // Moving Patrol Drone
                const lane = Math.floor(Math.random() * 3) as Lane;
                s.obstacles.push({
                  id: `obs-d-${z}`,
                  type: 'PATROL_DRONE',
                  lane,
                  zDistance: z - s.distanceMeters,
                  widthMeters: 1.8,
                  lengthMeters: 1.0,
                  heightMeters: 1.5,
                  yOffsetMeters: 0.5,
                  patrolSpeed: 2.0,
                });
              }

              // Spawn Core Lines
              if (Math.random() < 0.75) {
                const coreLane = Math.floor(Math.random() * 3) as Lane;
                for (let k = 0; k < 3; k++) {
                  s.cores.push({
                    id: `core-${z}-${k}`,
                    lane: coreLane,
                    zDistance: z - s.distanceMeters + 6 + k * 2.5,
                    collected: false,
                  });
                }
              }

              // Power-up chance
              if (Math.random() < 0.15) {
                const types: Array<'MAGNET' | 'SHIELD' | 'SCORE_BOOST'> = ['MAGNET', 'SHIELD', 'SCORE_BOOST'];
                s.powerUps.push({
                  id: `power-${z}`,
                  type: types[Math.floor(Math.random() * types.length)],
                  lane: Math.floor(Math.random() * 3) as Lane,
                  zDistance: z - s.distanceMeters + 12,
                  collected: false,
                });
              }

              s.nextSpawnZ += 24 + Math.random() * 12;
            }

            // Sync with HUD
            onUpdateStats(Math.floor(s.distanceMeters), s.score, s.coresCollected);
            onPowerUpChange({
              shield: s.isShielded,
              magnet: Math.ceil(s.magnetTimer),
              boost: Math.ceil(s.scoreBoostTimer),
            });

            // 5. Render Scene to Canvas
            renderFrame(ctx, canvas.width, canvas.height, s, equippedSkinColor, equippedTrailColor);
          }
        }

        animationFrameId = requestAnimationFrame(loop);
      };

      animationFrameId = requestAnimationFrame(loop);
      return () => cancelAnimationFrame(animationFrameId);
    }, [isPlaying, isPaused, equippedSkinColor, equippedTrailColor, onUpdateStats, onGameOver, onPowerUpChange]);

    // Handle high DPI resize
    useEffect(() => {
      const handleResize = () => {
        if (!canvasRef.current) return;
        const rect = canvasRef.current.parentElement?.getBoundingClientRect();
        if (rect) {
          canvasRef.current.width = rect.width;
          canvasRef.current.height = rect.height;
        }
      };

      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
      <div
        className="relative w-full h-full overflow-hidden select-none touch-none"
        onMouseDown={handleTouchStart}
        onMouseUp={handleTouchEnd}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <canvas ref={canvasRef} className="block w-full h-full" />
      </div>
    );
  }
);

GameCanvas.displayName = 'GameCanvas';

/**
 * 2D Canvas Renderer with 3D perspective projection
 */
function renderFrame(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  s: {
    distanceMeters: number;
    laneInterpolation: number;
    actionState: PlayerActionState;
    jumpHeight: number;
    isShielded: boolean;
    magnetTimer: number;
    scoreBoostTimer: number;
    obstacles: ObstacleInstance[];
    cores: CollectibleCore[];
    powerUps: PowerUpInstance[];
    particles: Array<{ x: number; y: number; vx: number; vy: number; color: string; life: number }>;
  },
  skinColor: string,
  trailColor: string
) {
  // Clear Frame
  ctx.clearRect(0, 0, w, h);

  // 1. Cyber Sky Gradient & Stars
  const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.65);
  skyGrad.addColorStop(0, '#040711');
  skyGrad.addColorStop(0.5, '#0B1124');
  skyGrad.addColorStop(1, '#1A1838');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, w, h * 0.65);

  // Distant Stars
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  for (let i = 0; i < 40; i++) {
    const sx = (i * 97) % w;
    const sy = (i * 43) % (h * 0.5);
    ctx.fillRect(sx, sy, 1.5, 1.5);
  }

  // 2. Far Skyline Skyscrapers (Parallax 1)
  const farOffset = (s.distanceMeters * 0.15) % 300;
  ctx.fillStyle = '#0f172a';
  for (let i = -1; i < w / 120 + 2; i++) {
    const bx = i * 140 - farOffset;
    const bh = 120 + ((i * 47) % 150);
    ctx.fillRect(bx, h * 0.62 - bh, 90, bh);
  }

  // Midground Neon Rooftop Silhouettes (Parallax 2)
  const midOffset = (s.distanceMeters * 0.4) % 400;
  ctx.fillStyle = '#161e31';
  for (let i = -1; i < w / 180 + 2; i++) {
    const mx = i * 200 - midOffset;
    const mh = 160 + ((i * 61) % 180);
    ctx.fillRect(mx, h * 0.65 - mh, 140, mh);

    // Glowing window grid
    ctx.fillStyle = 'rgba(0, 240, 255, 0.15)';
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 3; c++) {
        ctx.fillRect(mx + 20 + c * 35, h * 0.65 - mh + 25 + r * 28, 14, 18);
      }
    }
    ctx.fillStyle = '#161e31';
  }

  // 3. 3-Lane Track Deck
  const horizonY = h * 0.65;
  const trackBottomY = h;

  // Rooftop asphalt base
  const trackGrad = ctx.createLinearGradient(0, horizonY, 0, trackBottomY);
  trackGrad.addColorStop(0, '#0a0f1d');
  trackGrad.addColorStop(1, '#05070e');
  ctx.fillStyle = trackGrad;
  ctx.fillRect(0, horizonY, w, trackBottomY - horizonY);

  // 3 Lanes (Perspective lines)
  const laneW = w / 3;
  ctx.lineWidth = 2;

  // Lane Dividers
  for (let i = 1; i <= 2; i++) {
    const lx = i * laneW;
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.35)';
    ctx.beginPath();
    ctx.moveTo(lx, horizonY);
    ctx.lineTo(lx, trackBottomY);
    ctx.stroke();

    // Speed Dashes
    const dashOffset = (s.distanceMeters * 12) % 60;
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.6)';
    ctx.setLineDash([20, 40]);
    ctx.lineDashOffset = -dashOffset;
    ctx.beginPath();
    ctx.moveTo(lx, horizonY);
    ctx.lineTo(lx, trackBottomY);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Side Neon Rails
  ctx.strokeStyle = '#00F0FF';
  ctx.lineWidth = 4;
  ctx.strokeRect(4, horizonY, 2, trackBottomY - horizonY);
  ctx.strokeRect(w - 6, horizonY, 2, trackBottomY - horizonY);

  // Helper projection function: converts (lane, zDistance) into screen (x, y, scale)
  const project = (laneIndex: number, z: number) => {
    const clampedZ = Math.max(0, Math.min(80, z));
    const depth = 1.0 - clampedZ / 80; // 0 (far) to 1 (near)
    const scale = 0.25 + depth * 0.75;
    const y = horizonY + (trackBottomY - 40 - horizonY) * (depth * depth);
    const x = (laneIndex + 0.5) * laneW;
    return { x, y, scale, depth };
  };

  // 4. Draw Collectibles (Energy Cores)
  for (const core of s.cores) {
    if (core.zDistance < 0 || core.zDistance > 75) continue;
    const p = project(core.lane, core.zDistance);

    // Glow aura
    ctx.save();
    ctx.beginPath();
    ctx.arc(p.x, p.y, 14 * p.scale, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 240, 255, 0.3)';
    ctx.fill();

    // Bright Center Core
    ctx.beginPath();
    ctx.arc(p.x, p.y, 8 * p.scale, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = '#00F0FF';
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.restore();
  }

  // 5. Draw Power-Ups
  for (const pw of s.powerUps) {
    if (pw.zDistance < 0 || pw.zDistance > 75) continue;
    const p = project(pw.lane, pw.zDistance);
    const color = pw.type === 'SHIELD' ? '#00E5FF' : pw.type === 'MAGNET' ? '#FFB800' : '#FF0055';

    ctx.save();
    ctx.beginPath();
    ctx.arc(p.x, p.y, 18 * p.scale, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 16;
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${Math.floor(12 * p.scale)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(pw.type === 'SHIELD' ? '🛡' : pw.type === 'MAGNET' ? '🧲' : '⚡', p.x, p.y);
    ctx.restore();
  }

  // 6. Draw Obstacles (sorted by distance so farther are drawn first)
  const sortedObstacles = [...s.obstacles].sort((a, b) => b.zDistance - a.zDistance);

  for (const obs of sortedObstacles) {
    if (obs.zDistance < -2 || obs.zDistance > 75) continue;
    const p = project(obs.lane, obs.zDistance);
    const obsWidth = laneW * 0.75 * p.scale;

    ctx.save();
    if (obs.type === 'GROUND_BARRIER') {
      // Jump Barrier (Laser barrier fence)
      const hBar = 28 * p.scale;
      ctx.fillStyle = '#FF0055';
      ctx.shadowColor = '#FF0055';
      ctx.shadowBlur = 14;
      ctx.fillRect(p.x - obsWidth / 2, p.y - hBar, obsWidth, hBar);

      // Warning hazard diagonal lines
      ctx.strokeStyle = '#FFDD00';
      ctx.lineWidth = 3 * p.scale;
      ctx.beginPath();
      ctx.moveTo(p.x - obsWidth / 2, p.y);
      ctx.lineTo(p.x + obsWidth / 2, p.y - hBar);
      ctx.stroke();
    } else if (obs.type === 'OVERHEAD_BARRIER') {
      // Slide Conduit (Elevated beam)
      const beamY = p.y - 75 * p.scale;
      const beamH = 22 * p.scale;
      ctx.fillStyle = '#FFB800';
      ctx.shadowColor = '#FFB800';
      ctx.shadowBlur = 12;
      ctx.fillRect(p.x - obsWidth / 2, beamY, obsWidth, beamH);

      // Support pillars
      ctx.fillStyle = '#475569';
      ctx.fillRect(p.x - obsWidth / 2, beamY + beamH, 6 * p.scale, p.y - (beamY + beamH));
      ctx.fillRect(p.x + obsWidth / 2 - 6 * p.scale, beamY + beamH, 6 * p.scale, p.y - (beamY + beamH));
    } else if (obs.type === 'LANE_BLOCKER') {
      // Solid Blockade Pylon
      const blockH = 85 * p.scale;
      ctx.fillStyle = '#7C3AED';
      ctx.shadowColor = '#C084FC';
      ctx.shadowBlur = 10;
      ctx.fillRect(p.x - obsWidth / 2, p.y - blockH, obsWidth, blockH);

      ctx.fillStyle = '#E9D5FF';
      ctx.fillRect(p.x - obsWidth / 4, p.y - blockH + 10, obsWidth / 2, 8);
    } else if (obs.type === 'PATROL_DRONE') {
      // Flying Patrol Drone
      const droneY = p.y - 50 * p.scale;
      ctx.fillStyle = '#FF0055';
      ctx.shadowColor = '#FF0055';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(p.x, droneY, 14 * p.scale, 0, Math.PI * 2);
      ctx.fill();

      // Scanner laser beam to ground
      ctx.strokeStyle = 'rgba(255, 0, 85, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(p.x, droneY + 14 * p.scale);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    }
    ctx.restore();
  }

  // 7. Draw Player Character
  const playerX = (s.laneInterpolation + 0.5) * laneW;
  const playerBaseY = trackBottomY - 50;
  const jumpOffset = s.jumpHeight * 110;
  const playerY = playerBaseY - jumpOffset;

  const isSliding = s.actionState === 'SLIDING';
  const charW = isSliding ? 48 : 34;
  const charH = isSliding ? 26 : 58;

  ctx.save();

  // Shadow on track
  ctx.beginPath();
  ctx.ellipse(playerX, playerBaseY + 6, 26, 8, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fill();

  // Particle Trail
  const trailHue = trailColor || '#00F0FF';
  ctx.fillStyle = trailHue;
  for (let t = 0; t < 4; t++) {
    const tx = playerX + (Math.random() - 0.5) * 16;
    const ty = playerY + charH / 2 + Math.random() * 12;
    ctx.fillRect(tx, ty, 3, 3);
  }

  // Shield Bubble (if active)
  if (s.isShielded) {
    ctx.beginPath();
    ctx.arc(playerX, playerY - charH / 2, 45, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 240, 255, 0.25)';
    ctx.strokeStyle = '#00F0FF';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#00F0FF';
    ctx.shadowBlur = 16;
    ctx.fill();
    ctx.stroke();
  }

  // Hoverboard
  ctx.fillStyle = '#FFB800';
  ctx.shadowColor = '#FFB800';
  ctx.shadowBlur = 8;
  ctx.fillRect(playerX - 26, playerY, 52, 7);

  // Runner Body
  ctx.fillStyle = skinColor || '#00F0FF';
  ctx.shadowColor = skinColor || '#00F0FF';
  ctx.shadowBlur = 10;
  ctx.fillRect(playerX - charW / 2, playerY - charH, charW, charH);

  // Glowing Visor
  ctx.fillStyle = '#FF0055';
  ctx.fillRect(playerX - charW / 3, playerY - charH + 8, (charW * 2) / 3, 7);

  ctx.restore();
}
