package com.aizoid.skylinerush

import com.aizoid.skylinerush.core.ads.AdAnalyticsData
import com.aizoid.skylinerush.core.ads.AdEventTracker
import org.junit.Assert.*
import org.junit.Test

class AdsRepositoryTest {

    @Test
    fun testRealImpressionTracking() {
        val tracker = AdEventTracker()
        assertEquals(0, tracker.analytics.value.interstitialImpressions)
        assertEquals(0, tracker.analytics.value.rewardedCompletions)

        // Record 2 completions and 3 impressions
        tracker.recordRewardedCompletion()
        tracker.recordRewardedCompletion()
        tracker.recordInterstitialImpression()
        tracker.recordInterstitialImpression()
        tracker.recordInterstitialImpression()

        assertEquals(2, tracker.analytics.value.rewardedCompletions)
        assertEquals(3, tracker.analytics.value.interstitialImpressions)
        assertEquals(5, tracker.getTotalEligibleImpressions())
    }
}
