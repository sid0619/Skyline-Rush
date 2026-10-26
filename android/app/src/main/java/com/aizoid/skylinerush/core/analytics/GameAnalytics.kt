package com.aizoid.skylinerush.core.analytics

import com.aizoid.skylinerush.core.config.AdConfiguration
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update

/**
 * Local persistent gameplay and ad analytics data model.
 */
data class PlayerAnalyticsSnapshot(
    val totalRunsCompleted: Int = 0,
    val totalDistanceMeters: Long = 0L,
    val totalCoresCollected: Long = 0L,
    val personalBestScore: Long = 0L,
    val completedMissionsCount: Int = 0,
    val eligibleAdImpressions: Int = 0,
    val assumedEcpmUsd: Double = AdConfiguration.ASSUMED_ECPM_BENCHMARK_USD
) {
    val estimatedRevenueUsd: Double
        get() = (eligibleAdImpressions.toDouble() / 1000.0) * assumedEcpmUsd
}

class GameAnalytics {
    private val _snapshot = MutableStateFlow(PlayerAnalyticsSnapshot())
    val snapshot: StateFlow<PlayerAnalyticsSnapshot> = _snapshot.asStateFlow()

    fun recordRunResult(
        distanceMeters: Long,
        coresCollected: Long,
        score: Long
    ) {
        _snapshot.update { current ->
            current.copy(
                totalRunsCompleted = current.totalRunsCompleted + 1,
                totalDistanceMeters = current.totalDistanceMeters + distanceMeters,
                totalCoresCollected = current.totalCoresCollected + coresCollected,
                personalBestScore = maxOf(current.personalBestScore, score)
            )
        }
    }

    fun recordMissionCompleted() {
        _snapshot.update { it.copy(completedMissionsCount = it.completedMissionsCount + 1) }
    }

    fun recordEligibleImpression() {
        _snapshot.update { it.copy(eligibleAdImpressions = it.eligibleAdImpressions + 1) }
    }
}
