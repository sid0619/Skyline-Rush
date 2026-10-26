package com.aizoid.skylinerush

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Modifier
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.aizoid.skylinerush.core.data.UserGamePreferences
import com.aizoid.skylinerush.game.model.DailyMission
import com.aizoid.skylinerush.game.model.MissionType
import com.aizoid.skylinerush.ui.game.GameScreen
import com.aizoid.skylinerush.ui.game.GameViewModel
import com.aizoid.skylinerush.ui.navigation.Screen
import com.aizoid.skylinerush.ui.screens.*
import com.aizoid.skylinerush.ui.theme.SkylineRushTheme
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val app = application as SkylineRushApp
        val dataStore = app.dataStoreRepository
        val adsRepo = app.adsRepository
        val analytics = app.gameAnalytics
        val gameViewModel = GameViewModel(dataStore, adsRepo, analytics)

        setContent {
            SkylineRushTheme {
                val navController = rememberNavController()
                val preferences by dataStore.preferencesFlow.collectAsState(initial = UserGamePreferences())
                val playerStats by analytics.snapshot.collectAsState()
                val adStats by app.adEventTracker.analytics.collectAsState()
                val scope = rememberCoroutineScope()

                Surface(modifier = Modifier.fillMaxSize()) {
                    NavHost(
                        navController = navController,
                        startDestination = Screen.Home.route
                    ) {
                        composable(Screen.Home.route) {
                            HomeScreen(
                                preferences = preferences,
                                onStartGame = {
                                    gameViewModel.startGame()
                                    navController.navigate(Screen.Game.route)
                                },
                                onNavigateCollection = { navController.navigate(Screen.Collection.route) },
                                onNavigateMissions = { navController.navigate(Screen.Missions.route) },
                                onNavigateSettings = { navController.navigate(Screen.Settings.route) },
                                onNavigateAnalytics = { navController.navigate(Screen.Analytics.route) }
                            )
                        }

                        composable(Screen.Game.route) {
                            GameScreen(
                                viewModel = gameViewModel,
                                onNavigateHome = {
                                    gameViewModel.checkAndShowInterstitial(this@MainActivity) {
                                        navController.navigate(Screen.Home.route) {
                                            popUpTo(Screen.Home.route) { inclusive = true }
                                        }
                                    }
                                }
                            )
                        }

                        composable(Screen.Collection.route) {
                            CollectionScreen(
                                preferences = preferences,
                                onEquip = { category, id ->
                                    scope.launch { dataStore.equipCosmetic(category, id) }
                                },
                                onUnlock = { category, id, cost ->
                                    scope.launch {
                                        if (dataStore.spendEnergyCores(cost)) {
                                            dataStore.unlockCosmetic(category, id)
                                            dataStore.equipCosmetic(category, id)
                                        }
                                    }
                                },
                                onBack = { navController.popBackStack() }
                            )
                        }

                        composable(Screen.Missions.route) {
                            val dummyMissions = listOf(
                                DailyMission("m1", "Aero Dash", "Travel 1,500m across rooftops", 1500, (preferences.personalBestDistance).coerceAtMost(1500), 50, MissionType.TRAVEL_DISTANCE),
                                DailyMission("m2", "Core Harvester", "Collect 80 Energy Cores", 80, 45, 60, MissionType.COLLECT_CORES),
                                DailyMission("m3", "Acrobat", "Perform 12 slides under neon pipes", 12, 12, 40, MissionType.PERFORM_SLIDES, isCompleted = true),
                                DailyMission("m4", "Power Surge", "Collect 3 Power-Up Overcharges", 3, 1, 45, MissionType.COLLECT_POWERUPS)
                            )
                            MissionsScreen(
                                missions = dummyMissions,
                                onClaimMission = { id, reward ->
                                    scope.launch {
                                        dataStore.addEnergyCores(reward)
                                        analytics.recordMissionCompleted()
                                    }
                                },
                                onBack = { navController.popBackStack() }
                            )
                        }

                        composable(Screen.Settings.route) {
                            SettingsScreen(
                                preferences = preferences,
                                onToggleSoundFx = { scope.launch { dataStore.setSoundFx(it) } },
                                onToggleMusic = { scope.launch { dataStore.setMusic(it) } },
                                onToggleHaptics = { scope.launch { dataStore.setHaptics(it) } },
                                onToggleReducedMotion = { scope.launch { dataStore.setReducedMotion(it) } },
                                onResetProgress = { scope.launch { dataStore.resetAllProgress() } },
                                onBack = { navController.popBackStack() }
                            )
                        }

                        composable(Screen.Analytics.route) {
                            AnalyticsScreen(
                                playerStats = playerStats,
                                adStats = adStats,
                                onBack = { navController.popBackStack() }
                            )
                        }
                    }
                }
            }
        }
    }
}
