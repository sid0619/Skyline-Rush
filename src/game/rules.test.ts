import test from 'node:test';
import assert from 'node:assert/strict';
import {
  clampLane,
  moveLeft,
  moveRight,
  calculateSpeed,
  calculateRunScore,
  checkObstacleCollision,
  checkCollectiblePickup,
  validateObstaclePattern,
  updateMissionProgress,
  canShowInterstitial,
  calculateEstimatedRevenue,
  RunIdempotencyTracker,
  ObstacleInstance,
  DailyMission,
  AdFrequencyPolicy,
} from './rules';

test('Lane movement and clamping', () => {
  assert.equal(clampLane(-1), 0);
  assert.equal(clampLane(0), 0);
  assert.equal(clampLane(1), 1);
  assert.equal(clampLane(2), 2);
  assert.equal(clampLane(3), 2);

  assert.equal(moveLeft(1), 0);
  assert.equal(moveLeft(0), 0); // clamps at left edge
  assert.equal(moveRight(1), 2);
  assert.equal(moveRight(2), 2); // clamps at right edge
});

test('Speed scaling calculation', () => {
  const baseSpeed = calculateSpeed(0);
  assert.equal(baseSpeed, 18.0);
  const midSpeed = calculateSpeed(1000);
  assert.ok(midSpeed > baseSpeed);
  const maxSpeed = calculateSpeed(100000);
  assert.equal(maxSpeed, 42.0); // capped at MAX_SPEED
});

test('Score calculation logic', () => {
  // 100 meters (1000 pts) + 10 cores (250 pts) = 1250 pts
  const normalScore = calculateRunScore(100, 10, false);
  assert.equal(normalScore, 1250);

  // With 2x score boost active
  const boostedScore = calculateRunScore(100, 10, true);
  assert.equal(boostedScore, 2500);
});

test('Collision detection - ground barrier avoided by jumping', () => {
  const obstacle: ObstacleInstance = {
    id: 'obs-1',
    type: 'GROUND_BARRIER',
    lane: 1,
    zDistance: 0.1,
    widthMeters: 2.0,
    lengthMeters: 1.0,
    heightMeters: 0.8,
    yOffsetMeters: 0,
  };

  // Player in lane 1 running hits barrier
  const runHit = checkObstacleCollision(
    { lane: 1, actionState: 'RUNNING', jumpHeight: 0, isShielded: false },
    obstacle
  );
  assert.equal(runHit.collides, true);
  assert.equal(runHit.absorbedByShield, false);

  // Player in lane 1 jumping high enough clears it
  const jumpClear = checkObstacleCollision(
    { lane: 1, actionState: 'JUMPING', jumpHeight: 0.7, isShielded: false },
    obstacle
  );
  assert.equal(jumpClear.collides, false);

  // Player in lane 0 (different lane) doesn't collide
  const diffLane = checkObstacleCollision(
    { lane: 0, actionState: 'RUNNING', jumpHeight: 0, isShielded: false },
    obstacle
  );
  assert.equal(diffLane.collides, false);
});

test('Collision detection - overhead barrier avoided by sliding', () => {
  const obstacle: ObstacleInstance = {
    id: 'obs-2',
    type: 'OVERHEAD_BARRIER',
    lane: 2,
    zDistance: 0.2,
    widthMeters: 2.0,
    lengthMeters: 1.0,
    heightMeters: 1.2,
    yOffsetMeters: 1.0,
  };

  // Player running hits overhead barrier
  const runHit = checkObstacleCollision(
    { lane: 2, actionState: 'RUNNING', jumpHeight: 0, isShielded: false },
    obstacle
  );
  assert.equal(runHit.collides, true);

  // Player sliding safely duck under overhead barrier
  const slideClear = checkObstacleCollision(
    { lane: 2, actionState: 'SLIDING', jumpHeight: 0, isShielded: false },
    obstacle
  );
  assert.equal(slideClear.collides, false);
});

test('Collision protection with shield', () => {
  const obstacle: ObstacleInstance = {
    id: 'obs-3',
    type: 'LANE_BLOCKER',
    lane: 0,
    zDistance: 0.0,
    widthMeters: 2.0,
    lengthMeters: 1.0,
    heightMeters: 2.0,
    yOffsetMeters: 0,
  };

  const shieldHit = checkObstacleCollision(
    { lane: 0, actionState: 'RUNNING', jumpHeight: 0, isShielded: true },
    obstacle
  );
  assert.equal(shieldHit.collides, false);
  assert.equal(shieldHit.absorbedByShield, true);
});

test('Collectible pickup with and without magnet', () => {
  const directCore = { id: 'c1', lane: 1 as const, zDistance: 0.5, collected: false };
  assert.equal(checkCollectiblePickup(1, directCore, false), true);
  assert.equal(checkCollectiblePickup(0, directCore, false), false);

  // Far core not reachable without magnet
  const distantCore = { id: 'c2', lane: 0 as const, zDistance: 3.5, collected: false };
  assert.equal(checkCollectiblePickup(1, distantCore, false), false);
  // Attracted when magnet is active within radius
  assert.equal(checkCollectiblePickup(1, distantCore, true), true);
});

test('Obstacle procedural pattern validity (must leave at least 1 lane open)', () => {
  const fairPattern: ObstacleInstance[] = [
    { id: '1', type: 'LANE_BLOCKER', lane: 0, zDistance: 20, widthMeters: 2, lengthMeters: 1, heightMeters: 2, yOffsetMeters: 0 },
    { id: '2', type: 'GROUND_BARRIER', lane: 1, zDistance: 20, widthMeters: 2, lengthMeters: 1, heightMeters: 1, yOffsetMeters: 0 },
  ];
  assert.equal(validateObstaclePattern(fairPattern), true); // Lane 2 is open

  const unfairPattern: ObstacleInstance[] = [
    { id: '1', type: 'LANE_BLOCKER', lane: 0, zDistance: 20, widthMeters: 2, lengthMeters: 1, heightMeters: 2, yOffsetMeters: 0 },
    { id: '2', type: 'LANE_BLOCKER', lane: 1, zDistance: 20, widthMeters: 2, lengthMeters: 1, heightMeters: 2, yOffsetMeters: 0 },
    { id: '3', type: 'LANE_BLOCKER', lane: 2, zDistance: 20, widthMeters: 2, lengthMeters: 1, heightMeters: 2, yOffsetMeters: 0 },
  ];
  assert.equal(validateObstaclePattern(unfairPattern), false); // All lanes blocked at once!
});

test('Daily mission progression and completion', () => {
  const mission: DailyMission = {
    id: 'm1',
    title: 'Collect 50 Cores',
    description: 'Gather energy cores',
    target: 50,
    current: 40,
    completed: false,
    rewardCores: 25,
    type: 'CORES',
  };

  const updated1 = updateMissionProgress(mission, 5);
  assert.equal(updated1.current, 45);
  assert.equal(updated1.completed, false);

  const updated2 = updateMissionProgress(updated1, 10);
  assert.equal(updated2.current, 50);
  assert.equal(updated2.completed, true);
});

test('Interstitial ad frequency caps', () => {
  const policy: AdFrequencyPolicy = {
    minRunsBetweenInterstitials: 3,
    minSecondsBetweenInterstitials: 60,
    runsSinceLastInterstitial: 2,
    lastInterstitialTimestampMs: Date.now() - 70000,
  };

  // Only 2 runs -> should not show
  assert.equal(canShowInterstitial(policy, Date.now(), false), false);

  // Now 3 runs and > 60s elapsed -> should show
  policy.runsSinceLastInterstitial = 3;
  assert.equal(canShowInterstitial(policy, Date.now(), false), true);

  // During tutorial -> must NEVER show
  assert.equal(canShowInterstitial(policy, Date.now(), true), false);
});

test('Estimated revenue formula and disclaimer', () => {
  const res = calculateEstimatedRevenue(2000, 15.0);
  assert.equal(res.estimatedRevenueUsd, 30.0);
  assert.ok(res.disclaimer.includes('Unity Ads'));
});

test('Run idempotency prevents duplicate rewards', () => {
  const tracker = new RunIdempotencyTracker();
  const runId = 'run-uuid-101';

  assert.equal(tracker.isAlreadyProcessed(runId), false);
  assert.equal(tracker.markProcessed(runId), true); // 1st processing
  assert.equal(tracker.isAlreadyProcessed(runId), true);
  assert.equal(tracker.markProcessed(runId), false); // 2nd attempt denied!
});
