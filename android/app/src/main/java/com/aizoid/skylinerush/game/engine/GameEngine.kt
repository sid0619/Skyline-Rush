package com.aizoid.skylinerush.game.engine

import com.aizoid.skylinerush.game.model.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import java.util.UUID

enum class EngineStatus {
    IDLE,
    RUNNING,
    PAUSED,
    GAME_OVER
}

data class GameEngineSnapshot(
    val status: EngineStatus = EngineStatus.IDLE,
    val player: PlayerState = PlayerState(),
    val distanceTraveled: Float = 0.0f,
    val currentSpeed: Float = ScoreCalculator.BASE_SPEED,
    val coresCollected: Int = 0,
    val currentScore: Int = 0,
    val obstacles: List<Obstacle> = emptyList(),
    val cores: List<CollectibleCore> = emptyList(),
    val powerUps: List<PowerUp> = emptyList(),
    val hasRevivedThisRun: Boolean = false,
    val lastCollisionObstacle: Obstacle? = null
)

class GameEngine(
    private val spawner: ObstacleSpawner = ObstacleSpawner()
) {
    private val _snapshot = MutableStateFlow(GameEngineSnapshot())
    val snapshot: StateFlow<GameEngineSnapshot> = _snapshot.asStateFlow()

    private val obstacleList = mutableListOf<Obstacle>()
    private val coreList = mutableListOf<CollectibleCore>()
    private val powerUpList = mutableListOf<PowerUp>()

    fun startNewRun() {
        obstacleList.clear()
        coreList.clear()
        powerUpList.clear()
        spawner.reset()

        _snapshot.value = GameEngineSnapshot(
            status = EngineStatus.RUNNING,
            player = PlayerState(),
            distanceTraveled = 0.0f,
            currentSpeed = ScoreCalculator.BASE_SPEED,
            coresCollected = 0,
            currentScore = 0,
            obstacles = emptyList(),
            cores = emptyList(),
            powerUps = emptyList(),
            hasRevivedThisRun = false,
            lastCollisionObstacle = null
        )

        // Spawn initial safe stretch
        spawner.generateAhead(0f, obstacleList, coreList, powerUpList)
    }

    fun pause() {
        if (_snapshot.value.status == EngineStatus.RUNNING) {
            _snapshot.update { it.copy(status = EngineStatus.PAUSED) }
        }
    }

    fun resume() {
        if (_snapshot.value.status == EngineStatus.PAUSED) {
            _snapshot.update { it.copy(status = EngineStatus.RUNNING) }
        }
    }

    fun handleSwipeLeft() {
        val current = _snapshot.value.player
        val newLane = Lane.fromIndex(current.lane.index - 1)
        if (newLane != current.lane) {
            _snapshot.update {
                it.copy(player = current.copy(lane = newLane, targetLane = newLane, laneTransitionProgress = 0f))
            }
        }
    }

    fun handleSwipeRight() {
        val current = _snapshot.value.player
        val newLane = Lane.fromIndex(current.lane.index + 1)
        if (newLane != current.lane) {
            _snapshot.update {
                it.copy(player = current.copy(lane = newLane, targetLane = newLane, laneTransitionProgress = 0f))
            }
        }
    }

    fun handleJump() {
        val current = _snapshot.value.player
        if (current.actionState == ActionState.RUNNING) {
            _snapshot.update {
                it.copy(player = current.copy(actionState = ActionState.JUMPING, actionTimer = 0.75f, jumpHeight = 0f))
            }
        }
    }

    fun handleSlide() {
        val current = _snapshot.value.player
        if (current.actionState == ActionState.RUNNING) {
            _snapshot.update {
                it.copy(player = current.copy(actionState = ActionState.SLIDING, actionTimer = 0.65f))
            }
        }
    }

    fun applyRevive() {
        val current = _snapshot.value
        if (!current.hasRevivedThisRun && current.status == EngineStatus.GAME_OVER) {
            // Clear immediate obstacles in front of player for a safe 25m corridor
            obstacleList.removeAll { it.zDistance in -5f..25f }

            _snapshot.update {
                it.copy(
                    status = EngineStatus.RUNNING,
                    hasRevivedThisRun = true,
                    lastCollisionObstacle = null,
                    player = it.player.copy(
                        actionState = ActionState.RUNNING,
                        isShielded = true, // temporary invulnerability shield after revive
                        jumpHeight = 0f
                    )
                )
            }
        }
    }

    /**
     * Fixed-step simulation tick.
     */
    fun tick(rawDeltaSeconds: Float) {
        val current = _snapshot.value
        if (current.status != EngineStatus.RUNNING) return

        // Clamp dt to prevent tunneling on frame drops or app pause
        val dt = rawDeltaSeconds.coerceIn(0.001f, 0.05f)

        val speed = ScoreCalculator.calculateCurrentSpeed(current.distanceTraveled)
        val distanceDelta = speed * dt
        val newDistance = current.distanceTraveled + distanceDelta

        // 1. Update Player State (jump / slide / lane transition / power-ups)
        var player = current.player

        // Lane transition
        val newProgress = (player.laneTransitionProgress + dt * 7.5f).coerceAtMost(1.0f)
        player = player.copy(laneTransitionProgress = newProgress)

        // Actions
        if (player.actionState == ActionState.JUMPING) {
            val remaining = player.actionTimer - dt
            if (remaining <= 0f) {
                player = player.copy(actionState = ActionState.RUNNING, actionTimer = 0f, jumpHeight = 0f)
            } else {
                // Parabolic jump arc: peak in the middle
                val progress = 1.0f - (remaining / 0.75f)
                val height = (Math.sin(progress * Math.PI)).toFloat()
                player = player.copy(actionTimer = remaining, jumpHeight = height)
            }
        } else if (player.actionState == ActionState.SLIDING) {
            val remaining = player.actionTimer - dt
            if (remaining <= 0f) {
                player = player.copy(actionState = ActionState.RUNNING, actionTimer = 0f)
            } else {
                player = player.copy(actionTimer = remaining)
            }
        }

        // Power-up timers
        val newMagnet = (player.magnetTimer - dt).coerceAtLeast(0f)
        val newScoreBoost = (player.scoreBoostTimer - dt).coerceAtLeast(0f)
        player = player.copy(magnetTimer = newMagnet, scoreBoostTimer = newScoreBoost)

        // 2. Advance Entities
        val entityDeltaZ = distanceDelta
        for (obs in obstacleList) {
            obs.zDistance -= entityDeltaZ
            if (obs.type == ObstacleType.PATROL_DRONE) {
                obs.lateralOffset += obs.patrolSpeed * dt
                if (Math.abs(obs.lateralOffset) > 1.2f) {
                    obs.patrolSpeed = -obs.patrolSpeed
                }
            }
        }
        for (core in coreList) {
            core.zDistance -= entityDeltaZ
        }
        for (p in powerUpList) {
            p.zDistance -= entityDeltaZ
        }

        // 3. Collision and Pickup checks
        var coresCollected = current.coresCollected
        for (core in coreList) {
            if (CollisionSystem.canCollectCore(player, core)) {
                core.collected = true
                coresCollected++
            }
        }

        for (p in powerUpList) {
            if (CollisionSystem.canCollectPowerUp(player, p)) {
                p.collected = true
                when (p.type) {
                    PowerUpType.SHIELD -> player = player.copy(isShielded = true)
                    PowerUpType.MAGNET -> player = player.copy(magnetTimer = 10f)
                    PowerUpType.SCORE_BOOST -> player = player.copy(scoreBoostTimer = 12f)
                }
            }
        }

        // Check Obstacle Collisions
        var isGameOver = false
        var lethalObs: Obstacle? = null

        for (obs in obstacleList) {
            when (val res = CollisionSystem.checkObstacle(player, obs)) {
                is CollisionResult.ShieldAbsorbed -> {
                    // Shield breaks safely
                    player = player.copy(isShielded = false)
                }
                is CollisionResult.LethalImpact -> {
                    isGameOver = true
                    lethalObs = res.obstacle
                    break
                }
                else -> { /* Safe */ }
            }
        }

        // Clean up off-screen entities (z < -10)
        obstacleList.removeAll { it.zDistance < -10.0f }
        coreList.removeAll { it.zDistance < -10.0f || it.collected }
        powerUpList.removeAll { it.zDistance < -10.0f || it.collected }

        // Spawn new patterns ahead
        spawner.generateAhead(newDistance, obstacleList, coreList, powerUpList)

        val newScore = ScoreCalculator.calculateScore(newDistance, coresCollected, player.scoreBoostTimer > 0f)

        _snapshot.value = current.copy(
            status = if (isGameOver) EngineStatus.GAME_OVER else EngineStatus.RUNNING,
            player = player,
            distanceTraveled = newDistance,
            currentSpeed = speed,
            coresCollected = coresCollected,
            currentScore = newScore,
            obstacles = obstacleList.toList(),
            cores = coreList.toList(),
            powerUps = powerUpList.toList(),
            lastCollisionObstacle = lethalObs
        )
    }
}
