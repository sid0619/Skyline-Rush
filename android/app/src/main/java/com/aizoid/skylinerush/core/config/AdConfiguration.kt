package com.aizoid.skylinerush.core.config

/**
 * Built-in advertising configuration for Skyline Rush: Rift Runner.
 * Uses official direct Unity Ads Android SDK architecture.
 *
 * NOTE: The Game ID and Ad Unit IDs are predefined in source code.
 * Replace placeholders with your registered Unity Ads project identifiers
 * before publishing to Google Play.
 */
object AdConfiguration {
    // Official Unity Ads Android Project Game ID (replace with your active Unity dashboard ID)
    const val UNITY_ANDROID_GAME_ID: String = "5565465"

    // Standard Ad Unit Placement IDs defined in the Unity Ads Monetization Dashboard
    const val REWARDED_AD_UNIT_ID: String = "Rewarded_Android"
    const val INTERSTITIAL_AD_UNIT_ID: String = "Interstitial_Android"

    // Default test mode: enabled during development to prevent invalid traffic policy flags
    const val DEFAULT_TEST_MODE: Boolean = true

    // Interstitial frequency capping policy
    const val MIN_RUNS_BETWEEN_INTERSTITIALS: Int = 3
    const val MIN_SECONDS_BETWEEN_INTERSTITIALS: Long = 90L

    // Revenue estimation benchmark (for transparency disclaimer)
    const val ASSUMED_ECPM_BENCHMARK_USD: Double = 15.00
}
