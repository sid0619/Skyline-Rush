package com.aizoid.skylinerush

import com.aizoid.skylinerush.game.engine.CollisionResult
import com.aizoid.skylinerush.game.engine.CollisionSystem
import com.aizoid.skylinerush.game.model.*
import org.junit.Assert.*
import org.junit.Test

class CollisionTest {

    @Test
    fun testGroundBarrierClearedByJump() {
        val barrier = Obstacle(
            id = "obs-1",
            type = ObstacleType.GROUND_BARRIER,
            lane = Lane.CENTER,
            zDistance = 0.2f
        )
        val jumpingPlayer = PlayerState(
            lane = Lane.CENTER,
            actionState = ActionState.JUMPING,
            jumpHeight = 0.8f
        )
        val result = CollisionSystem.checkObstacle(jumpingPlayer, barrier)
        assertEquals(CollisionResult.ClearedAction, result)
    }

    @Test
    fun testOverheadBarrierClearedBySlide() {
        val barrier = Obstacle(
            id = "obs-2",
            type = ObstacleType.OVERHEAD_BARRIER,
            lane = Lane.LEFT,
            zDistance = 0.1f
        )
        val slidingPlayer = PlayerState(
            lane = Lane.LEFT,
            actionState = ActionState.SLIDING
        )
        val result = CollisionSystem.checkObstacle(slidingPlayer, barrier)
        assertEquals(CollisionResult.ClearedAction, result)
    }

    @Test
    fun testShieldAbsorbsLethalImpact() {
        val blocker = Obstacle(
            id = "obs-3",
            type = ObstacleType.LANE_BLOCKER,
            lane = Lane.RIGHT,
            zDistance = 0.0f
        )
        val shieldedPlayer = PlayerState(
            lane = Lane.RIGHT,
            actionState = ActionState.RUNNING,
            isShielded = true
        )
        val result = CollisionSystem.checkObstacle(shieldedPlayer, blocker)
        assertEquals(CollisionResult.ShieldAbsorbed, result)
    }
}
