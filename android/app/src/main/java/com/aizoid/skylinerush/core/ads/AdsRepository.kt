package com.aizoid.skylinerush.core.ads

import android.app.Activity
import com.aizoid.skylinerush.core.config.AdConfiguration
import kotlinx.coroutines.flow.StateFlow

/**
 * Repository mediating ad presentation, frequency policy caps, and safe continuation states.
 */
class AdsRepository(
    private val unityAdsManager: UnityAdsManager,
    private val eventTracker: AdEventTracker
) {
    private var runsSinceLastInterstitial: Int = 0
    private var lastInterstitialTimestampMs: Long = 0L

    val rewardedState: StateFlow<AdState> = unityAdsManager.rewardedState
    val interstitialState: StateFlow<AdState> = unityAdsManager.interstitialState
    val analytics: StateFlow<AdAnalyticsData> = eventTracker.analytics

    fun initialize(testMode: Boolean = AdConfiguration.DEFAULT_TEST_MODE) {
        unityAdsManager.initialize(testMode)
    }

    fun isRewardedReady(): Boolean = unityAdsManager.rewardedState.value is AdState.Ready

    fun showRewardedRevive(
        activity: Activity,
        onReviveGranted: () -> Unit,
        onDismissed: () -> Unit
    ) {
        unityAdsManager.showRewardedAd(
            activity = activity,
            onRewardEarned = onReviveGranted,
            onDismissed = onDismissed,
            onFailed = { onDismissed() }
        )
    }

    fun showRewardedBonusCores(
        activity: Activity,
        onBonusGranted: () -> Unit,
        onDismissed: () -> Unit
    ) {
        unityAdsManager.showRewardedAd(
            activity = activity,
            onRewardEarned = onBonusGranted,
            onDismissed = onDismissed,
            onFailed = { onDismissed() }
        )
    }

    fun onRunCompleted() {
        runsSinceLastInterstitial++
    }

    fun tryShowInterstitialAfterRun(
        activity: Activity,
        onComplete: () -> Unit
    ) {
        val now = System.currentTimeMillis()
        val runsSatisfied = runsSinceLastInterstitial >= AdConfiguration.MIN_RUNS_BETWEEN_INTERSTITIALS
        val timeSatisfied = (now - lastInterstitialTimestampMs) >= (AdConfiguration.MIN_SECONDS_BETWEEN_INTERSTITIALS * 1000L)

        if (runsSatisfied && timeSatisfied && unityAdsManager.interstitialState.value is AdState.Ready) {
            runsSinceLastInterstitial = 0
            lastInterstitialTimestampMs = now
            unityAdsManager.showInterstitialAd(activity, onComplete)
        } else {
            onComplete()
        }
    }
}
