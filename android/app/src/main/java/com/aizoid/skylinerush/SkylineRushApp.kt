package com.aizoid.skylinerush

import android.app.Application
import com.aizoid.skylinerush.core.ads.AdEventTracker
import com.aizoid.skylinerush.core.ads.AdsRepository
import com.aizoid.skylinerush.core.ads.UnityAdsManager
import com.aizoid.skylinerush.core.analytics.GameAnalytics
import com.aizoid.skylinerush.core.data.DataStoreRepository

class SkylineRushApp : Application() {

    lateinit var dataStoreRepository: DataStoreRepository private set
    lateinit var adEventTracker: AdEventTracker private set
    lateinit var unityAdsManager: UnityAdsManager private set
    lateinit var adsRepository: AdsRepository private set
    lateinit var gameAnalytics: GameAnalytics private set

    override fun onCreate() {
        super.onCreate()

        // 1. Initialize local persistent repository
        dataStoreRepository = DataStoreRepository(this)

        // 2. Initialize analytics
        gameAnalytics = GameAnalytics()

        // 3. Initialize real Unity Ads components
        adEventTracker = AdEventTracker()
        unityAdsManager = UnityAdsManager(this, adEventTracker)
        adsRepository = AdsRepository(unityAdsManager, adEventTracker)

        // 4. Initialize Unity Ads SDK
        unityAdsManager.initialize()
    }
}
