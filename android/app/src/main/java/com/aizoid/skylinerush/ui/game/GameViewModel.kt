package com.aizoid.skylinerush.ui.game

import android.app.Activity
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.aizoid.skylinerush.core.ads.AdsRepository
import com.aizoid.skylinerush.core.analytics.GameAnalytics
import com.aizoid.skylinerush.core.data.DataStoreRepository
import com.aizoid.skylinerush.game.engine.EngineStatus
import com.aizoid.skylinerush.game.engine.GameEngine
import com.aizoid.skylinerush.game.engine.GameEngineSnapshot
import com.aizoid.skylinerush.game.model.RunSummary
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import java.util.UUID

class GameViewModel(
    private val dataStoreRepo: DataStoreRepository,
    private val adsRepo: AdsRepository,
    private val analytics: GameAnalytics
) : ViewModel() {

    private val engine = GameEngine()
    val engineSnapshot: StateFlow<GameEngineSnapshot> = engine.snapshot

    private val _lastRunSummary = MutableStateFlow<RunSummary?>(null)
    val lastRunSummary: StateFlow<RunSummary?> = _lastRunSummary.asStateFlow()

    private var loopJob: Job? = null
    private var currentRunId: String = ""

    fun startGame() {
        currentRunId = UUID.randomUUID().toString()
        _lastRunSummary.value = null
        engine.startNewRun()
        startLoop()
    }

    private fun startLoop() {
        loopJob?.cancel()
        loopJob = viewModelScope.launch {
            var lastTime = System.nanoTime()
            while (isActive) {
                val now = System.nanoTime()
                val delta = (now - lastTime) / 1_000_000_000.0f
                lastTime = now

                engine.tick(delta)

                val snap = engine.snapshot.value
                if (snap.status == EngineStatus.GAME_OVER) {
                    handleGameOver(snap)
                    break
                }
                delay(16) // ~60 FPS
            }
        }
    }

    private fun handleGameOver(snap: GameEngineSnapshot) {
        viewModelScope.launch {
            val distance = snap.distanceTraveled.toInt()
            val cores = snap.coresCollected
            val score = snap.currentScore

            // Update persistent DataStore
            dataStoreRepo.addEnergyCores(cores)
            dataStoreRepo.updatePersonalBest(distance, score)

            // Update Analytics
            analytics.recordRunResult(distance.toLong(), cores.toLong(), score.toLong())
            adsRepo.onRunCompleted()

            val canRevive = !snap.hasRevivedThisRun && adsRepo.isRewardedReady()

            _lastRunSummary.value = RunSummary(
                runId = currentRunId,
                distanceMeters = distance,
                coresCollected = cores,
                finalScore = score,
                isPersonalBest = false, // evaluated by DataStore
                reviveOffered = canRevive,
                reviveAccepted = false
            )
        }
    }

    fun onSwipeLeft() = engine.handleSwipeLeft()
    fun onSwipeRight() = engine.handleSwipeRight()
    fun onJump() = engine.handleJump()
    fun onSlide() = engine.handleSlide()

    fun pause() = engine.pause()
    fun resume() = engine.resume()

    fun requestRewardedRevive(activity: Activity) {
        adsRepo.showRewardedRevive(
            activity = activity,
            onReviveGranted = {
                engine.applyRevive()
                startLoop()
            },
            onDismissed = {
                // User closed ad or skipped
            }
        )
    }

    fun requestBonusCores(activity: Activity, onBonusClaimed: (Int) -> Unit) {
        adsRepo.showRewardedBonusCores(
            activity = activity,
            onBonusGranted = {
                viewModelScope.launch {
                    val bonusAmount = 50
                    dataStoreRepo.addEnergyCores(bonusAmount)
                    onBonusClaimed(bonusAmount)
                }
            },
            onDismissed = {}
        )
    }

    fun checkAndShowInterstitial(activity: Activity, onFinished: () -> Unit) {
        adsRepo.tryShowInterstitialAfterRun(activity, onFinished)
    }

    override fun onCleared() {
        super.onCleared()
        loopJob?.cancel()
    }
}
