package com.aizoid.skylinerush.game.engine

/**
 * Score and difficulty calculation formulas.
 */
object ScoreCalculator {
    const val POINTS_PER_METER = 10
    const val POINTS_PER_CORE = 25
    const val BASE_SPEED = 18.0f
    const val MAX_SPEED = 42.0f
    const val SPEED_RAMP_FACTOR = 0.0015f

    fun calculateCurrentSpeed(distanceMeters: Float): Float {
        val speed = BASE_SPEED + (distanceMeters * SPEED_RAMP_FACTOR)
        return speed.coerceAtMost(MAX_SPEED)
    }

    fun calculateScore(distanceMeters: Float, coresCollected: Int, isScoreBoosted: Boolean): Int {
        val distancePoints = (distanceMeters * POINTS_PER_METER).toInt()
        val corePoints = coresCollected * POINTS_PER_CORE
        val total = distancePoints + corePoints
        return if (isScoreBoosted) total * 2 else total
    }
}
