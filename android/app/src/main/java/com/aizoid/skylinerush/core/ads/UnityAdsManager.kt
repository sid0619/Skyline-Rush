package com.aizoid.skylinerush.core.ads

import android.app.Activity
import android.content.Context
import android.util.Log
import com.aizoid.skylinerush.core.config.AdConfiguration
import com.unity3d.ads.IUnityAdsInitializationListener
import com.unity3d.ads.IUnityAdsLoadListener
import com.unity3d.ads.IUnityAdsShowListener
import com.unity3d.ads.UnityAds
import com.unity3d.ads.UnityAds.UnityAdsInitializationError
import com.unity3d.ads.UnityAds.UnityAdsLoadError
import com.unity3d.ads.UnityAds.UnityAdsShowCompletionState
import com.unity3d.ads.UnityAds.UnityAdsShowError
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

/**
 * Direct Unity Ads Android SDK Integration Manager.
 * Handles lifecycle-aware SDK initialization, ad pre-loading, and verified reward callbacks.
 */
class UnityAdsManager(
    private val context: Context,
    private val eventTracker: AdEventTracker
) : IUnityAdsInitializationListener {

    private val tag = "UnityAdsManager"

    private val _isInitialized = MutableStateFlow(false)
    val isInitialized: StateFlow<Boolean> = _isInitialized.asStateFlow()

    private val _rewardedState = MutableStateFlow<AdState>(AdState.NotConfigured)
    val rewardedState: StateFlow<AdState> = _rewardedState.asStateFlow()

    private val _interstitialState = MutableStateFlow<AdState>(AdState.NotConfigured)
    val interstitialState: StateFlow<AdState> = _interstitialState.asStateFlow()

    /**
     * Initializes the official Unity Ads SDK once at startup.
     */
    fun initialize(testMode: Boolean = AdConfiguration.DEFAULT_TEST_MODE) {
        if (_isInitialized.value) {
            Log.d(tag, "Unity Ads already initialized.")
            return
        }

        _rewardedState.value = AdState.Initializing
        _interstitialState.value = AdState.Initializing

        Log.i(tag, "Initializing Unity Ads with Game ID: ${AdConfiguration.UNITY_ANDROID_GAME_ID}, testMode: $testMode")

        UnityAds.initialize(
            context.applicationContext,
            AdConfiguration.UNITY_ANDROID_GAME_ID,
            testMode,
            this
        )
    }

    override fun onInitializationComplete() {
        Log.i(tag, "Unity Ads initialization completed successfully.")
        _isInitialized.value = true
        _rewardedState.value = AdState.Unavailable
        _interstitialState.value = AdState.Unavailable

        // Preload placements after successful initialization
        loadRewardedAd()
        loadInterstitialAd()
    }

    override fun onInitializationFailed(error: UnityAdsInitializationError?, message: String?) {
        val errDesc = message ?: "Unknown initialization error"
        Log.e(tag, "Unity Ads initialization failed: $error, reason: $errDesc")
        _isInitialized.value = false
        _rewardedState.value = AdState.Failed(errDesc)
        _interstitialState.value = AdState.Failed(errDesc)
    }

    /**
     * Loads a Rewarded Video ad
     */
    fun loadRewardedAd() {
        if (!_isInitialized.value) {
            _rewardedState.value = AdState.Failed("SDK not initialized yet")
            return
        }
        if (_rewardedState.value == AdState.Loading || _rewardedState.value == AdState.Ready) {
            return
        }

        _rewardedState.value = AdState.Loading
        eventTracker.recordRewardedLoadRequest()

        UnityAds.load(AdConfiguration.REWARDED_AD_UNIT_ID, object : IUnityAdsLoadListener {
            override fun onUnityAdsAdLoaded(placementId: String) {
                Log.d(tag, "Rewarded Ad Loaded: $placementId")
                _rewardedState.value = AdState.Ready
                eventTracker.recordRewardedLoadSuccess()
            }

            override fun onUnityAdsFailedToLoad(placementId: String, error: UnityAdsLoadError, message: String) {
                Log.w(tag, "Rewarded Ad Failed to Load: $placementId, err: $error - $message")
                _rewardedState.value = AdState.Failed(message)
                eventTracker.recordRewardedLoadFailure()
            }
        })
    }

    /**
     * Loads an Interstitial Ad
     */
    fun loadInterstitialAd() {
        if (!_isInitialized.value) {
            _interstitialState.value = AdState.Failed("SDK not initialized yet")
            return
        }
        if (_interstitialState.value == AdState.Loading || _interstitialState.value == AdState.Ready) {
            return
        }

        _interstitialState.value = AdState.Loading
        eventTracker.recordInterstitialLoadRequest()

        UnityAds.load(AdConfiguration.INTERSTITIAL_AD_UNIT_ID, object : IUnityAdsLoadListener {
            override fun onUnityAdsAdLoaded(placementId: String) {
                Log.d(tag, "Interstitial Ad Loaded: $placementId")
                _interstitialState.value = AdState.Ready
                eventTracker.recordInterstitialLoadSuccess()
            }

            override fun onUnityAdsFailedToLoad(placementId: String, error: UnityAdsLoadError, message: String) {
                Log.w(tag, "Interstitial Ad Failed to Load: $placementId, err: $error - $message")
                _interstitialState.value = AdState.Failed(message)
                eventTracker.recordInterstitialLoadFailure()
            }
        })
    }

    /**
     * Displays a Rewarded Ad with genuine onComplete reward verification
     */
    fun showRewardedAd(
        activity: Activity,
        onRewardEarned: () -> Unit,
        onDismissed: () -> Unit,
        onFailed: (String) -> Unit
    ) {
        if (_rewardedState.value !is AdState.Ready) {
            onFailed("Rewarded ad is not ready yet.")
            loadRewardedAd()
            return
        }

        _rewardedState.value = AdState.Showing
        eventTracker.recordRewardedShowAttempt()

        UnityAds.show(activity, AdConfiguration.REWARDED_AD_UNIT_ID, object : IUnityAdsShowListener {
            override fun onUnityAdsShowStart(placementId: String) {
                Log.d(tag, "Rewarded Ad show started: $placementId")
            }

            override fun onUnityAdsShowClick(placementId: String) {
                eventTracker.recordClick()
            }

            override fun onUnityAdsShowComplete(
                placementId: String,
                state: UnityAdsShowCompletionState
            ) {
                _rewardedState.value = AdState.Unavailable
                if (state == UnityAdsShowCompletionState.COMPLETED) {
                    Log.i(tag, "Rewarded ad watched to completion. Granting reward.")
                    eventTracker.recordRewardedCompletion()
                    eventTracker.recordRewardGranted()
                    onRewardEarned()
                } else {
                    Log.i(tag, "Rewarded ad skipped by user.")
                }
                onDismissed()
                // Schedule next load
                loadRewardedAd()
            }

            override fun onUnityAdsShowFailure(
                placementId: String,
                error: UnityAdsShowError,
                message: String
            ) {
                Log.e(tag, "Rewarded Ad show failed: $placementId, err: $error - $message")
                _rewardedState.value = AdState.Failed(message)
                onFailed(message)
                loadRewardedAd()
            }
        })
    }

    /**
     * Displays an Interstitial Ad adhering to frequency caps
     */
    fun showInterstitialAd(
        activity: Activity,
        onDismissed: () -> Unit
    ) {
        if (_interstitialState.value !is AdState.Ready) {
            onDismissed()
            loadInterstitialAd()
            return
        }

        _interstitialState.value = AdState.Showing
        eventTracker.recordInterstitialShowAttempt()

        UnityAds.show(activity, AdConfiguration.INTERSTITIAL_AD_UNIT_ID, object : IUnityAdsShowListener {
            override fun onUnityAdsShowStart(placementId: String) {
                Log.d(tag, "Interstitial Ad show started: $placementId")
                eventTracker.recordInterstitialImpression()
            }

            override fun onUnityAdsShowClick(placementId: String) {
                eventTracker.recordClick()
            }

            override fun onUnityAdsShowComplete(
                placementId: String,
                state: UnityAdsShowCompletionState
            ) {
                _interstitialState.value = AdState.Unavailable
                onDismissed()
                loadInterstitialAd()
            }

            override fun onUnityAdsShowFailure(
                placementId: String,
                error: UnityAdsShowError,
                message: String
            ) {
                Log.w(tag, "Interstitial Ad show failed: $placementId - $message")
                _interstitialState.value = AdState.Failed(message)
                onDismissed()
                loadInterstitialAd()
            }
        })
    }
}
