package com.aizoid.skylinerush.core.data

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.*
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.map
import java.io.IOException

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "skyline_rush_prefs")

data class UserGamePreferences(
    val energyCoresBalance: Int = 100,
    val personalBestDistance: Int = 0,
    val personalBestScore: Int = 0,
    val soundFxEnabled: Boolean = true,
    val musicEnabled: Boolean = true,
    val hapticsEnabled: Boolean = true,
    val reducedMotion: Boolean = false,
    val equippedSkinId: String = "skin_courier",
    val equippedBoardId: String = "board_aero",
    val equippedTrailId: String = "trail_plasma",
    val unlockedSkins: Set<String> = setOf("skin_courier"),
    val unlockedBoards: Set<String> = setOf("board_aero"),
    val unlockedTrails: Set<String> = setOf("trail_plasma")
)

class DataStoreRepository(private val context: Context) {

    private object PreferencesKeys {
        val CORES_BALANCE = intPreferencesKey("cores_balance")
        val PB_DISTANCE = intPreferencesKey("pb_distance")
        val PB_SCORE = intPreferencesKey("pb_score")
        val SOUND_FX = booleanPreferencesKey("sound_fx")
        val MUSIC = booleanPreferencesKey("music")
        val HAPTICS = booleanPreferencesKey("haptics")
        val REDUCED_MOTION = booleanPreferencesKey("reduced_motion")
        val EQUIPPED_SKIN = stringPreferencesKey("equipped_skin")
        val EQUIPPED_BOARD = stringPreferencesKey("equipped_board")
        val EQUIPPED_TRAIL = stringPreferencesKey("equipped_trail")
        val UNLOCKED_SKINS = stringSetPreferencesKey("unlocked_skins")
        val UNLOCKED_BOARDS = stringSetPreferencesKey("unlocked_boards")
        val UNLOCKED_TRAILS = stringSetPreferencesKey("unlocked_trails")
    }

    val preferencesFlow: Flow<UserGamePreferences> = context.dataStore.data
        .catch { exception ->
            if (exception is IOException) {
                emit(emptyPreferences())
            } else {
                throw exception
            }
        }
        .map { prefs ->
            UserGamePreferences(
                energyCoresBalance = prefs[PreferencesKeys.CORES_BALANCE] ?: 100,
                personalBestDistance = prefs[PreferencesKeys.PB_DISTANCE] ?: 0,
                personalBestScore = prefs[PreferencesKeys.PB_SCORE] ?: 0,
                soundFxEnabled = prefs[PreferencesKeys.SOUND_FX] ?: true,
                musicEnabled = prefs[PreferencesKeys.MUSIC] ?: true,
                hapticsEnabled = prefs[PreferencesKeys.HAPTICS] ?: true,
                reducedMotion = prefs[PreferencesKeys.REDUCED_MOTION] ?: false,
                equippedSkinId = prefs[PreferencesKeys.EQUIPPED_SKIN] ?: "skin_courier",
                equippedBoardId = prefs[PreferencesKeys.EQUIPPED_BOARD] ?: "board_aero",
                equippedTrailId = prefs[PreferencesKeys.EQUIPPED_TRAIL] ?: "trail_plasma",
                unlockedSkins = prefs[PreferencesKeys.UNLOCKED_SKINS] ?: setOf("skin_courier"),
                unlockedBoards = prefs[PreferencesKeys.UNLOCKED_BOARDS] ?: setOf("board_aero"),
                unlockedTrails = prefs[PreferencesKeys.UNLOCKED_TRAILS] ?: setOf("trail_plasma")
            )
        }

    suspend fun addEnergyCores(amount: Int) {
        context.dataStore.edit { prefs ->
            val current = prefs[PreferencesKeys.CORES_BALANCE] ?: 100
            prefs[PreferencesKeys.CORES_BALANCE] = maxOf(0, current + amount)
        }
    }

    suspend fun spendEnergyCores(amount: Int): Boolean {
        var success = false
        context.dataStore.edit { prefs ->
            val current = prefs[PreferencesKeys.CORES_BALANCE] ?: 100
            if (current >= amount) {
                prefs[PreferencesKeys.CORES_BALANCE] = current - amount
                success = true
            }
        }
        return success
    }

    suspend fun updatePersonalBest(distance: Int, score: Int) {
        context.dataStore.edit { prefs ->
            val currentDistance = prefs[PreferencesKeys.PB_DISTANCE] ?: 0
            val currentScore = prefs[PreferencesKeys.PB_SCORE] ?: 0
            if (distance > currentDistance) prefs[PreferencesKeys.PB_DISTANCE] = distance
            if (score > currentScore) prefs[PreferencesKeys.PB_SCORE] = score
        }
    }

    suspend fun setSoundFx(enabled: Boolean) {
        context.dataStore.edit { it[PreferencesKeys.SOUND_FX] = enabled }
    }

    suspend fun setMusic(enabled: Boolean) {
        context.dataStore.edit { it[PreferencesKeys.MUSIC] = enabled }
    }

    suspend fun setHaptics(enabled: Boolean) {
        context.dataStore.edit { it[PreferencesKeys.HAPTICS] = enabled }
    }

    suspend fun setReducedMotion(enabled: Boolean) {
        context.dataStore.edit { it[PreferencesKeys.REDUCED_MOTION] = enabled }
    }

    suspend fun equipCosmetic(category: String, id: String) {
        context.dataStore.edit { prefs ->
            when (category) {
                "skin" -> prefs[PreferencesKeys.EQUIPPED_SKIN] = id
                "board" -> prefs[PreferencesKeys.EQUIPPED_BOARD] = id
                "trail" -> prefs[PreferencesKeys.EQUIPPED_TRAIL] = id
            }
        }
    }

    suspend fun unlockCosmetic(category: String, id: String) {
        context.dataStore.edit { prefs ->
            when (category) {
                "skin" -> {
                    val current = prefs[PreferencesKeys.UNLOCKED_SKINS] ?: setOf("skin_courier")
                    prefs[PreferencesKeys.UNLOCKED_SKINS] = current + id
                }
                "board" -> {
                    val current = prefs[PreferencesKeys.UNLOCKED_BOARDS] ?: setOf("board_aero")
                    prefs[PreferencesKeys.UNLOCKED_BOARDS] = current + id
                }
                "trail" -> {
                    val current = prefs[PreferencesKeys.UNLOCKED_TRAILS] ?: setOf("trail_plasma")
                    prefs[PreferencesKeys.UNLOCKED_TRAILS] = current + id
                }
            }
        }
    }

    suspend fun resetAllProgress() {
        context.dataStore.edit { it.clear() }
    }
}
