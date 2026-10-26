/**
 * Pure game rules, physics, collision detection, and scoring logic
 * for Skyline Rush: Rift Runner.
 * Decoupled from React and DOM for high-speed deterministic testing.
 */

export type Lane = 0 | 1 | 2; // 0 = Left, 1 = Center, 2 = Right

export interface PlayerBoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type PlayerActionState = 'RUNNING' | 'JUMPING' | 'SLIDING';

export interface PlayerPhysics {
  lane: Lane;
  targetLane: Lane;
  laneTransitionProgress: number; // 0 to 1
  actionState: PlayerActionState;
  stateTimer: number; // remaining duration in seconds
  jumpHeight: number; // vertical offset (0 to 1)
  isShielded: boolean;
  magnetDuration: number;
  scoreBoostDuration: number;
}

export type ObstacleType = 
  | 'GROUND_BARRIER'    // Must jump
  | 'OVERHEAD_BARRIER'  // Must slide
  | 'LANE_BLOCKER'      // Must switch lane
  | 'PATROL_DRONE';     // Moves laterally between lanes

export interface ObstacleInstance {
  id: string;
  type: ObstacleType;
  lane: Lane;
  zDistance: number; // distance ahead in meters (0 to 100)
  widthMeters: number;
  lengthMeters: number;
  heightMeters: number;
  yOffsetMeters: number;
  patrolSpeed?: number;
  patrolDirection?: number;
}

export interface CollectibleCore {
  id: string;
  lane: Lane;
  zDistance: number;
  collected: boolean;
}

export type PowerUpType = 'MAGNET' | 'SHIELD' | 'SCORE_BOOST';

export interface PowerUpInstance {
  id: string;
  type: PowerUpType;
  lane: Lane;
  zDistance: number;
  collected: boolean;
}

export interface DailyMission {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  completed: boolean;
  rewardCores: number;
  type: 'CORES' | 'DISTANCE' | 'SLIDES' | 'JUMPS' | 'POWERUPS' | 'NO_SHIELD_RUN';
}

export type AdState = 
  | 'NOT_CONFIGURED'
  | 'INITIALIZING'
  | 'LOADING'
  | 'READY'
  | 'SHOWING'
  | 'FAILED'
  | 'UNAVAILABLE';

export interface AdFrequencyPolicy {
  minRunsBetweenInterstitials: number;
  minSecondsBetweenInterstitials: number;
  runsSinceLastInterstitial: number;
  lastInterstitialTimestampMs: number;
}

export const INITIAL_GAME_CONFIG = {
  LANES_COUNT: 3,
  LANE_WIDTH_METERS: 2.5,
  BASE_SPEED: 18.0, // meters per second
  MAX_SPEED: 42.0,
  SPEED_ACCELERATION: 0.15, // speed increase per 100m
  JUMP_DURATION: 0.75, // seconds
  SLIDE_DURATION: 0.65, // seconds
  MAGNET_DURATION_DEFAULT: 10.0,
  SCORE_BOOST_DURATION_DEFAULT: 12.0,
  CORE_VALUE_SCORE: 25,
  CORE_VALUE_CURRENCY: 1,
  DISTANCE_SCORE_RATE: 10, // points per meter
  MAGNET_RADIUS_METERS: 5.0,
  SAFE_SPAWN_GAP_METERS: 18.0,
};

/**
 * Validates and clamps lane transitions
 */
export function clampLane(lane: number): Lane {
  if (lane <= 0) return 0;
  if (lane >= 2) return 2;
  return lane as Lane;
}

export function moveLeft(currentLane: Lane): Lane {
  return clampLane(currentLane - 1);
}

export function moveRight(currentLane: Lane): Lane {
  return clampLane(currentLane + 1);
}

/**
 * Calculates current difficulty speed in meters/second
 */
export function calculateSpeed(distanceMeters: number): number {
  const scaled = INITIAL_GAME_CONFIG.BASE_SPEED + (distanceMeters / 100) * INITIAL_GAME_CONFIG.SPEED_ACCELERATION;
  return Math.min(INITIAL_GAME_CONFIG.MAX_SPEED, scaled);
}

/**
 * Calculates score based on distance, cores collected, and score boost multiplier
 */
export function calculateRunScore(
  distanceMeters: number,
  coresCollected: number,
  scoreBoostActive: boolean
): number {
  const distanceScore = Math.floor(distanceMeters * INITIAL_GAME_CONFIG.DISTANCE_SCORE_RATE);
  const coresScore = coresCollected * INITIAL_GAME_CONFIG.CORE_VALUE_SCORE;
  const base = distanceScore + coresScore;
  return scoreBoostActive ? base * 2 : base;
}

/**
 * Evaluates collision between the player and an obstacle
 * @returns true if player collides lethally with obstacle
 */
export function checkObstacleCollision(
  player: { lane: Lane; actionState: PlayerActionState; jumpHeight: number; isShielded: boolean },
  obstacle: ObstacleInstance
): { collides: boolean; absorbedByShield: boolean } {
  // Check if obstacle is in the player's collision window (zDistance close to 0)
  // Player is at z=0, obstacle collision depth is roughly [-1.0, 1.2] meters
  const inZRange = obstacle.zDistance >= -0.8 && obstacle.zDistance <= 1.0;
  if (!inZRange) {
    return { collides: false, absorbedByShield: false };
  }

  // Check lane match
  if (obstacle.lane !== player.lane) {
    return { collides: false, absorbedByShield: false };
  }

  // Type specific clearance
  if (obstacle.type === 'GROUND_BARRIER') {
    // Player avoids ground barrier by jumping high enough (> 0.45)
    if (player.actionState === 'JUMPING' && player.jumpHeight > 0.45) {
      return { collides: false, absorbedByShield: false };
    }
  } else if (obstacle.type === 'OVERHEAD_BARRIER') {
    // Player avoids overhead barrier by sliding
    if (player.actionState === 'SLIDING') {
      return { collides: false, absorbedByShield: false };
    }
  }

  // Collision occurred
  if (player.isShielded) {
    return { collides: false, absorbedByShield: true };
  }

  return { collides: true, absorbedByShield: false };
}

/**
 * Checks collectible pickup
 */
export function checkCollectiblePickup(
  playerLane: Lane,
  core: CollectibleCore,
  magnetActive: boolean
): boolean {
  if (core.collected) return false;

  // Normal direct hit: same lane and close z-distance
  const closeZ = Math.abs(core.zDistance) <= 1.4;
  if (closeZ && core.lane === playerLane) {
    return true;
  }

  // Magnet attraction: nearby within radius
  if (magnetActive && Math.abs(core.zDistance) <= INITIAL_GAME_CONFIG.MAGNET_RADIUS_METERS) {
    return true;
  }

  return false;
}

/**
 * Procedural generation safe check: ensures at least one lane is free at any z-slice
 */
export function validateObstaclePattern(obstaclesAtSameZ: ObstacleInstance[]): boolean {
  const blockedLanes = new Set<Lane>();
  for (const obs of obstaclesAtSameZ) {
    blockedLanes.add(obs.lane);
  }
  // At least one lane out of 0, 1, 2 must be open
  return blockedLanes.size < 3;
}

/**
 * Update daily mission progress idempotently
 */
export function updateMissionProgress(
  mission: DailyMission,
  increment: number
): DailyMission {
  if (mission.completed) return mission;
  const newCurrent = Math.min(mission.target, mission.current + increment);
  return {
    ...mission,
    current: newCurrent,
    completed: newCurrent >= mission.target,
  };
}

/**
 * Interstitial Ad Frequency Policy validator
 */
export function canShowInterstitial(
  policy: AdFrequencyPolicy,
  currentTimestampMs: number,
  isTutorial: boolean
): boolean {
  if (isTutorial) return false;
  const runsSatisfied = policy.runsSinceLastInterstitial >= policy.minRunsBetweenInterstitials;
  const timeElapsedSec = (currentTimestampMs - policy.lastInterstitialTimestampMs) / 1000;
  const timeSatisfied = timeElapsedSec >= policy.minSecondsBetweenInterstitials;
  return runsSatisfied && timeSatisfied;
}

/**
 * Estimated advertising revenue calculation with official disclaimer
 */
export function calculateEstimatedRevenue(
  recordedImpressions: number,
  assumedEcpm: number
): { estimatedRevenueUsd: number; formula: string; disclaimer: string } {
  const eligible = Math.max(0, recordedImpressions);
  const revenue = (eligible / 1000) * assumedEcpm;
  return {
    estimatedRevenueUsd: Number(revenue.toFixed(4)),
    formula: `${eligible} impressions / 1000 × $${assumedEcpm.toFixed(2)} eCPM`,
    disclaimer: 'Estimated revenue only. Actual revenue is calculated solely by Unity Ads reporting dashboard.',
  };
}

/**
 * Run summary processor with Idempotency Guard (no duplicate reward granting)
 */
export class RunIdempotencyTracker {
  private processedRunIds: Set<string> = new Set();

  public isAlreadyProcessed(runId: string): boolean {
    return this.processedRunIds.has(runId);
  }

  public markProcessed(runId: string): boolean {
    if (this.processedRunIds.has(runId)) {
      return false; // already processed!
    }
    this.processedRunIds.add(runId);
    return true;
  }
}
