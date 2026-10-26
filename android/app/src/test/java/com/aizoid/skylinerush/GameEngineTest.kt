package com.aizoid.skylinerush

import com.aizoid.skylinerush.game.engine.GameEngine
import com.aizoid.skylinerush.game.engine.ScoreCalculator
import com.aizoid.skylinerush.game.model.ActionState
import com.aizoid.skylinerush.game.model.Lane
import org.junit.Assert.*
import org.junit.Test

class GameEngineTest {

    @Test
    fun testLaneSwitchClamping() {
        val engine = GameEngine()
        engine.startNewRun()

        // Start in CENTER
        assertEquals(Lane.CENTER, engine.snapshot.value.player.lane)

        // Move Left -> LEFT
        engine.handleSwipeLeft()
        assertEquals(Lane.LEFT, engine.snapshot.value.player.lane)

        // Move Left again -> should clamp at LEFT
        engine.handleSwipeLeft()
        assertEquals(Lane.LEFT, engine.snapshot.value.player.lane)

        // Move Right twice -> RIGHT
        engine.handleSwipeRight()
        assertEquals(Lane.CENTER, engine.snapshot.value.player.lane)
        engine.handleSwipeRight()
        assertEquals(Lane.RIGHT, engine.snapshot.value.player.lane)
    }

    @Test
    fun testJumpStateTransition() {
        val engine = GameEngine()
        engine.startNewRun()

        assertEquals(ActionState.RUNNING, engine.snapshot.value.player.actionState)
        engine.handleJump()
        assertEquals(ActionState.JUMPING, engine.snapshot.value.player.actionState)
    }

    @Test
    fun testScoreCalculation() {
        val scoreNormal = ScoreCalculator.calculateScore(100f, 10, isScoreBoosted = false)
        assertEquals(1250, scoreNormal)

        val scoreBoosted = ScoreCalculator.calculateScore(100f, 10, isScoreBoosted = true)
        assertEquals(2500, scoreBoosted)
    }
}
