package com.aizoid.skylinerush.game.model

enum class Lane(val index: Int) {
    LEFT(0),
    CENTER(1),
    RIGHT(2);

    companion object {
        fun fromIndex(index: Int): Lane = when {
            index <= 0 -> LEFT
            index >= 2 -> RIGHT
            else -> CENTER
        }
    }
}

enum class ActionState {
    RUNNING,
    JUMPING,
    SLIDING
}

data class PlayerState(
    val lane: Lane = Lane.CENTER,
    val targetLane: Lane = Lane.CENTER,
    val laneTransitionProgress: Float = 1.0f,
    val actionState: ActionState = ActionState.RUNNING,
    val actionTimer: Float = 0.0f,
    val jumpHeight: Float = 0.0f,
    val isShielded: Boolean = false,
    val magnetTimer: Float = 0.0f,
    val scoreBoostTimer: Float = 0.0f
)

enum class ObstacleType {
    GROUND_BARRIER,    // Must jump
    OVERHEAD_BARRIER,  // Must slide
    LANE_BLOCKER,      // Must switch lanes
    PATROL_DRONE       // Moves laterally across lanes
}

data class Obstacle(
    val id: String,
    val type: ObstacleType,
    var lane: Lane,
    var zDistance: Float,
    val width: Float = 2.0f,
    val height: Float = 1.5f,
    var lateralOffset: Float = 0.0f,
    var patrolSpeed: Float = 0.0f
)

data class CollectibleCore(
    val id: String,
    val lane: Lane,
    var zDistance: Float,
    var collected: Boolean = false
)

enum class PowerUpType {
    MAGNET,
    SHIELD,
    SCORE_BOOST
}

data class PowerUp(
    val id: String,
    val type: PowerUpType,
    val lane: Lane,
    var zDistance: Float,
    var collected: Boolean = false
)

enum class MissionType {
    COLLECT_CORES,
    TRAVEL_DISTANCE,
    PERFORM_SLIDES,
    PERFORM_JUMPS,
    COLLECT_POWERUPS
}

data class DailyMission(
    val id: String,
    val title: String,
    val description: String,
    val target: Int,
    val current: Int = 0,
    val rewardCores: Int,
    val type: MissionType,
    val isCompleted: Boolean = false,
    val isClaimed: Boolean = false
)

enum class CosmeticType {
    RUNNER_SKIN,
    HOVERBOARD,
    PARTICLE_TRAIL,
    THEME
}

data class CosmeticItem(
    val id: String,
    val name: String,
    val description: String,
    val type: CosmeticType,
    val costCores: Int,
    val isUnlocked: Boolean = false,
    val isEquipped: Boolean = false,
    val primaryColorHex: String = "#00F0FF"
)

data class RunSummary(
    val runId: String,
    val distanceMeters: Int,
    val coresCollected: Int,
    val finalScore: Int,
    val isPersonalBest: Boolean,
    val reviveOffered: Boolean = false,
    val reviveAccepted: Boolean = false
)
