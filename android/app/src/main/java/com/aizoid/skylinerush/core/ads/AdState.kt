package com.aizoid.skylinerush.core.ads

/**
 * State machine representation for Unity Ads placements.
 */
sealed class AdState {
    object NotConfigured : AdState()
    object Initializing : AdState()
    object Loading : AdState()
    object Ready : AdState()
    object Showing : AdState()
    data class Failed(val reason: String, val code: Int? = null) : AdState()
    object Unavailable : AdState()
}

enum class AdFormat {
    REWARDED,
    INTERSTITIAL
}
