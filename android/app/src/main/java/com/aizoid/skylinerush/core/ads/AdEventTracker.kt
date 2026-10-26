package com.aizoid.skylinerush.core.ads

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update

/**
 * Tracks real advertising events reported by the Unity Ads SDK.
 * Distinguishes genuine impressions/callbacks from button clicks or requests.
 */
data class AdAnalyticsData(
    val rewardedLoadRequests: Int = 0,
    val rewardedLoadSuccesses: Int = 0,
    val rewardedLoadFailures: Int = 0,
    val rewardedShowAttempts: Int = 0,
    val rewardedCompletions: Int = 0,
    val actualRewardsGranted: Int = 0,
    val interstitialLoadRequests: Int = 0,
    val interstitialLoadSuccesses: Int = 0,
    val interstitialLoadFailures: Int = 0,
    val interstitialShowAttempts: Int = 0,
    val interstitialImpressions: Int = 0,
    val recordedClicks: Int = 0
)

class AdEventTracker {
    private val _analytics = MutableStateFlow(AdAnalyticsData())
    val analytics: StateFlow<AdAnalyticsData> = _analytics.asStateFlow()

    fun recordRewardedLoadRequest() {
        _analytics.update { it.copy(rewardedLoadRequests = it.rewardedLoadRequests + 1) }
    }

    fun recordRewardedLoadSuccess() {
        _analytics.update { it.copy(rewardedLoadSuccesses = it.rewardedLoadSuccesses + 1) }
    }

    fun recordRewardedLoadFailure() {
        _analytics.update { it.copy(rewardedLoadFailures = it.rewardedLoadFailures + 1) }
    }

    fun recordRewardedShowAttempt() {
        _analytics.update { it.copy(rewardedShowAttempts = it.rewardedShowAttempts + 1) }
    }

    fun recordRewardedCompletion() {
        _analytics.update { it.copy(rewardedCompletions = it.rewardedCompletions + 1) }
    }

    fun recordRewardGranted() {
        _analytics.update { it.copy(actualRewardsGranted = it.actualRewardsGranted + 1) }
    }

    fun recordInterstitialLoadRequest() {
        _analytics.update { it.copy(interstitialLoadRequests = it.interstitialLoadRequests + 1) }
    }

    fun recordInterstitialLoadSuccess() {
        _analytics.update { it.copy(interstitialLoadSuccesses = it.interstitialLoadSuccesses + 1) }
    }

    fun recordInterstitialLoadFailure() {
        _analytics.update { it.copy(interstitialLoadFailures = it.interstitialLoadFailures + 1) }
    }

    fun recordInterstitialShowAttempt() {
        _analytics.update { it.copy(interstitialShowAttempts = it.interstitialShowAttempts + 1) }
    }

    fun recordInterstitialImpression() {
        _analytics.update { it.copy(interstitialImpressions = it.interstitialImpressions + 1) }
    }

    fun recordClick() {
        _analytics.update { it.copy(recordedClicks = it.recordedClicks + 1) }
    }

    fun getTotalEligibleImpressions(): Int {
        val current = _analytics.value
        return current.rewardedCompletions + current.interstitialImpressions
    }
}
