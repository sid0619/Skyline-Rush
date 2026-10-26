package com.aizoid.skylinerush.ui.navigation

sealed class Screen(val route: String) {
    object Home : Screen("home")
    object Game : Screen("game")
    object Collection : Screen("collection")
    object Missions : Screen("missions")
    object Settings : Screen("settings")
    object Analytics : Screen("analytics")
}
