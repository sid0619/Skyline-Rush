package com.aizoid.skylinerush.game.engine

import com.aizoid.skylinerush.game.model.*
import java.util.UUID
import kotlin.random.Random

/**
 * Procedural generation system guaranteeing fair, navigable rooftop routes.
 * Supports deterministic seeding for test repeatability.
 */
class ObstacleSpawner(private val random: Random = Random(System.currentTimeMillis())) {

    private var nextSpawnZ = 35.0f
    private val minGap = 20.0f
    private val maxGap = 32.0f

    fun reset() {
        nextSpawnZ = 35.0f
    }

    /**
     * Generates a safe batch of obstacles and collectibles ahead of the player.
     */
    fun generateAhead(
        playerDistance: Float,
        currentObstacles: MutableList<Obstacle>,
        currentCores: MutableList<CollectibleCore>,
        currentPowerUps: MutableList<PowerUp>
    ) {
        val spawnHorizon = playerDistance + 120.0f

        while (nextSpawnZ < spawnHorizon) {
            val z = nextSpawnZ
            val patternType = random.nextInt(4)

            when (patternType) {
                0 -> {
                    // Single lane ground barrier
                    val lane = Lane.values()[random.nextInt(3)]
                    currentObstacles.add(
                        Obstacle(
                            id = UUID.randomUUID().toString(),
                            type = ObstacleType.GROUND_BARRIER,
                            lane = lane,
                            zDistance = z
                        )
                    )
                    // Place core trail in an adjacent open lane
                    val safeLane = Lane.fromIndex((lane.index + 1) % 3)
                    spawnCoreTrail(safeLane, z - 4f, 3, currentCores)
                }
                1 -> {
                    // Overhead barrier
                    val lane = Lane.values()[random.nextInt(3)]
                    currentObstacles.add(
                        Obstacle(
                            id = UUID.randomUUID().toString(),
                            type = ObstacleType.OVERHEAD_BARRIER,
                            lane = lane,
                            zDistance = z
                        )
                    )
                }
                2 -> {
                    // Double lane obstacle combo - leaves exactly 1 clear lane
                    val safeLaneIndex = random.nextInt(3)
                    for (i in 0..2) {
                        if (i != safeLaneIndex) {
                            val type = if (random.nextBoolean()) ObstacleType.LANE_BLOCKER else ObstacleType.GROUND_BARRIER
                            currentObstacles.add(
                                Obstacle(
                                    id = UUID.randomUUID().toString(),
                                    type = type,
                                    lane = Lane.fromIndex(i),
                                    zDistance = z
                                )
                            )
                        }
                    }
                    // Reward taking the open lane with an energy core
                    currentCores.add(
                        CollectibleCore(
                            id = UUID.randomUUID().toString(),
                            lane = Lane.fromIndex(safeLaneIndex),
                            zDistance = z
                        )
                    )
                }
                3 -> {
                    // Moving patrol drone
                    val lane = Lane.values()[random.nextInt(3)]
                    currentObstacles.add(
                        Obstacle(
                            id = UUID.randomUUID().toString(),
                            type = ObstacleType.PATROL_DRONE,
                            lane = lane,
                            zDistance = z,
                            patrolSpeed = if (random.nextBoolean()) 1.5f else -1.5f
                        )
                    )
                }
            }

            // Chance to spawn a power-up (magnet, shield, score boost)
            if (random.nextFloat() < 0.18f) {
                val powerLane = Lane.values()[random.nextInt(3)]
                val powerType = PowerUpType.values()[random.nextInt(PowerUpType.values().size)]
                currentPowerUps.add(
                    PowerUp(
                        id = UUID.randomUUID().toString(),
                        type = powerType,
                        lane = powerLane,
                        zDistance = z + 10.0f
                    )
                )
            }

            nextSpawnZ += minGap + random.nextFloat() * (maxGap - minGap)
        }
    }

    private fun spawnCoreTrail(
        lane: Lane,
        startZ: Float,
        count: Int,
        coreList: MutableList<CollectibleCore>
    ) {
        for (i in 0 until count) {
            coreList.add(
                CollectibleCore(
                    id = UUID.randomUUID().toString(),
                    lane = lane,
                    zDistance = startZ + i * 2.2f
                )
            )
        }
    }
}
