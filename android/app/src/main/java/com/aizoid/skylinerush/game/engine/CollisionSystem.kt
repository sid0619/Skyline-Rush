package com.aizoid.skylinerush.game.engine

import com.aizoid.skylinerush.game.model.*

sealed class CollisionResult {
    object None : CollisionResult()
    object ClearedAction : CollisionResult()
    object ShieldAbsorbed : CollisionResult()
    data class LethalImpact(val obstacle: Obstacle) : CollisionResult()
}

object CollisionSystem {

    private const val COLLISION_Z_MIN = -0.8f
    private const val COLLISION_Z_MAX = 1.0f
    private const val PICKUP_Z_MAX = 1.4f
    private const val MAGNET_RADIUS_Z = 6.0f

    fun checkObstacle(player: PlayerState, obstacle: Obstacle): CollisionResult {
        // Must be in close Z proximity
        if (obstacle.zDistance < COLLISION_Z_MIN || obstacle.zDistance > COLLISION_Z_MAX) {
            return CollisionResult.None
        }

        // Check lane matching
        if (obstacle.lane != player.lane && player.laneTransitionProgress >= 0.85f) {
            return CollisionResult.None
        }

        // Action-specific checks
        when (obstacle.type) {
            ObstacleType.GROUND_BARRIER -> {
                if (player.actionState == ActionState.JUMPING && player.jumpHeight > 0.45f) {
                    return CollisionResult.ClearedAction
                }
            }
            ObstacleType.OVERHEAD_BARRIER -> {
                if (player.actionState == ActionState.SLIDING) {
                    return CollisionResult.ClearedAction
                }
            }
            ObstacleType.LANE_BLOCKER,
            ObstacleType.PATROL_DRONE -> {
                // Must change lane
            }
        }

        // Shield protection
        if (player.isShielded) {
            return CollisionResult.ShieldAbsorbed
        }

        return CollisionResult.LethalImpact(obstacle)
    }

    fun canCollectCore(player: PlayerState, core: CollectibleCore): Boolean {
        if (core.collected) return false
        val dz = Math.abs(core.zDistance)
        if (player.magnetTimer > 0f && dz <= MAGNET_RADIUS_Z) {
            return true
        }
        return dz <= PICKUP_Z_MAX && core.lane == player.lane
    }

    fun canCollectPowerUp(player: PlayerState, powerUp: PowerUp): Boolean {
        if (powerUp.collected) return false
        return Math.abs(powerUp.zDistance) <= PICKUP_Z_MAX && powerUp.lane == player.lane
    }
}
