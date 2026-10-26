package com.aizoid.skylinerush.ui.game

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.*
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.input.pointer.pointerInput
import com.aizoid.skylinerush.game.engine.GameEngineSnapshot
import com.aizoid.skylinerush.game.model.*
import kotlin.math.abs

/**
 * Custom Compose Canvas 2D Game Renderer.
 * High-performance 2D projection with multi-layer parallax skyline,
 * 3-lane rooftop tracks, dynamic obstacle silhouettes, and particle glows.
 */
@Composable
fun GameCanvasRenderer(
    snapshot: GameEngineSnapshot,
    onSwipeLeft: () -> Unit,
    onSwipeRight: () -> Unit,
    onJump: () -> Unit,
    onSlide: () -> Unit,
    modifier: Modifier = Modifier
) {
    Canvas(
        modifier = modifier
            .fillMaxSize()
            .pointerInput(Unit) {
                var dragTotalX = 0f
                var dragTotalY = 0f
                var gestureHandled = false

                detectDragGestures(
                    onDragStart = {
                        dragTotalX = 0f
                        dragTotalY = 0f
                        gestureHandled = false
                    },
                    onDragEnd = {
                        if (!gestureHandled) {
                            val threshold = 40f
                            if (abs(dragTotalX) > abs(dragTotalY)) {
                                if (dragTotalX < -threshold) onSwipeLeft()
                                else if (dragTotalX > threshold) onSwipeRight()
                            } else {
                                if (dragTotalY < -threshold) onJump()
                                else if (dragTotalY > threshold) onSlide()
                            }
                        }
                    },
                    onDrag = { change, dragAmount ->
                        change.consume()
                        dragTotalX += dragAmount.x
                        dragTotalY += dragAmount.y
                    }
                )
            }
    ) {
        val width = size.width
        val height = size.height

        // 1. Cyber Skyline Parallax Background
        drawParallaxSkyline(width, height, snapshot.distanceTraveled)

        // 2. Three-Lane Rooftop Perspective Track
        drawRooftopTrack(width, height)

        // 3. Draw Collectibles (Energy Cores & PowerUps)
        drawCollectibles(snapshot.cores, snapshot.powerUps, width, height)

        // 4. Draw Obstacles (Ground, Overhead, Blockers, Patrol Drones)
        drawObstacles(snapshot.obstacles, width, height)

        // 5. Draw Player Character & Trail
        drawPlayer(snapshot.player, width, height)
    }
}

private fun DrawScope.drawParallaxSkyline(w: Float, h: Float, distance: Float) {
    // Deep Space/Night Sky Gradient
    drawRect(
        brush = Brush.verticalGradient(
            colors = listOf(Color(0xFF060913), Color(0xFF0F172A), Color(0xFF1E1B4B)),
            startY = 0f,
            endY = h * 0.7f
        ),
        size = Size(w, h)
    )

    // Distant Cyber Skyscrapers (Far Parallax Layer)
    val farScroll = (distance * 0.2f) % 200f
    for (i in -1..6) {
        val bx = i * 160f - farScroll
        val bh = 140f + (abs(i * 37) % 180f)
        drawRect(
            color = Color(0xFF141A2E),
            topLeft = Offset(bx, h * 0.65f - bh),
            size = Size(110f, bh)
        )
    }

    // Midground Neon Rooftop Towers
    val midScroll = (distance * 0.6f) % 320f
    for (i in -1..4) {
        val mx = i * 240f - midScroll
        val mh = 200f + (abs(i * 53) % 220f)
        drawRect(
            color = Color(0xFF1B243B),
            topLeft = Offset(mx, h * 0.7f - mh),
            size = Size(160f, mh)
        )
        // Neon antenna light
        drawCircle(
            color = Color(0xFFFF0055),
            radius = 3f,
            center = Offset(mx + 80f, h * 0.7f - mh - 8f)
        )
    }
}

private fun DrawScope.drawRooftopTrack(w: Float, h: Float) {
    val trackTop = h * 0.68f
    val trackBottom = h

    // Track Deck Base
    drawRect(
        brush = Brush.verticalGradient(
            colors = listOf(Color(0xFF0B101D), Color(0xFF060911)),
            startY = trackTop,
            endY = trackBottom
        ),
        topLeft = Offset(0f, trackTop),
        size = Size(w, trackBottom - trackTop)
    )

    // 3 Neon Lane Dividers
    val laneW = w / 3f
    for (i in 1..2) {
        val lx = i * laneW
        drawLine(
            color = Color(0xFF00F0FF).copy(alpha = 0.35f),
            start = Offset(lx, trackTop),
            end = Offset(lx, trackBottom),
            strokeWidth = 3f
        )
    }

    // Side Guardrails
    drawLine(
        color = Color(0xFF00F0FF),
        start = Offset(8f, trackTop),
        end = Offset(8f, trackBottom),
        strokeWidth = 4f
    )
    drawLine(
        color = Color(0xFF00F0FF),
        start = Offset(w - 8f, trackTop),
        end = Offset(w - 8f, trackBottom),
        strokeWidth = 4f
    )
}

private fun DrawScope.drawCollectibles(
    cores: List<CollectibleCore>,
    powerUps: List<PowerUp>,
    w: Float,
    h: Float
) {
    val laneW = w / 3f
    val horizonY = h * 0.68f
    val playerY = h * 0.88f

    // Draw Energy Cores
    for (core in cores) {
        if (core.zDistance < 0f || core.zDistance > 70f) continue
        val depth = 1f - (core.zDistance / 70f)
        val cy = horizonY + (playerY - horizonY) * depth
        val cx = core.lane.index * laneW + (laneW / 2f)
        val radius = 8f + depth * 10f

        // Energy Core Outer Aura
        drawCircle(
            color = Color(0xFF00F0FF).copy(alpha = 0.35f),
            radius = radius * 1.5f,
            center = Offset(cx, cy)
        )
        // Core Center
        drawCircle(
            color = Color(0xFFE0F7FA),
            radius = radius,
            center = Offset(cx, cy)
        )
    }

    // Draw Power-ups
    for (p in powerUps) {
        if (p.zDistance < 0f || p.zDistance > 70f) continue
        val depth = 1f - (p.zDistance / 70f)
        val py = horizonY + (playerY - horizonY) * depth
        val px = p.lane.index * laneW + (laneW / 2f)
        val pColor = when (p.type) {
            PowerUpType.SHIELD -> Color(0xFF00E5FF)
            PowerUpType.MAGNET -> Color(0xFFFFB800)
            PowerUpType.SCORE_BOOST -> Color(0xFFFF0055)
        }
        drawCircle(
            color = pColor,
            radius = 14f + depth * 12f,
            center = Offset(px, py)
        )
    }
}

private fun DrawScope.drawObstacles(obstacles: List<Obstacle>, w: Float, h: Float) {
    val laneW = w / 3f
    val horizonY = h * 0.68f
    val playerY = h * 0.88f

    for (obs in obstacles) {
        if (obs.zDistance < -2f || obs.zDistance > 70f) continue
        val depth = 1f - (obs.zDistance / 70f).coerceIn(0f, 1f)
        val oy = horizonY + (playerY - horizonY) * depth
        val ox = obs.lane.index * laneW + (laneW * 0.1f) + (obs.lateralOffset * 20f)
        val ow = laneW * 0.8f * (0.4f + depth * 0.6f)

        when (obs.type) {
            ObstacleType.GROUND_BARRIER -> {
                val bh = 22f + depth * 32f
                drawRect(
                    color = Color(0xFFFF0055),
                    topLeft = Offset(ox, oy - bh),
                    size = Size(ow, bh)
                )
                // Hazard warning stripes
                drawLine(
                    color = Color(0xFFFFCC00),
                    start = Offset(ox, oy - bh),
                    end = Offset(ox + ow, oy),
                    strokeWidth = 3f
                )
            }
            ObstacleType.OVERHEAD_BARRIER -> {
                val barH = 18f + depth * 22f
                val barElevation = 60f + depth * 70f
                drawRect(
                    color = Color(0xFFFFB800),
                    topLeft = Offset(ox, oy - barElevation),
                    size = Size(ow, barH)
                )
            }
            ObstacleType.LANE_BLOCKER -> {
                val blockH = 70f + depth * 80f
                drawRect(
                    color = Color(0xFF7C3AED),
                    topLeft = Offset(ox, oy - blockH),
                    size = Size(ow, blockH)
                )
            }
            ObstacleType.PATROL_DRONE -> {
                val droneY = oy - 45f - depth * 40f
                drawCircle(
                    color = Color(0xFFFF0055),
                    radius = 12f + depth * 10f,
                    center = Offset(ox + ow / 2f, droneY)
                )
            }
        }
    }
}

private fun DrawScope.drawPlayer(player: PlayerState, w: Float, h: Float) {
    val laneW = w / 3f
    val playerBaseY = h * 0.88f

    val targetX = player.lane.index * laneW + (laneW / 2f)
    val jumpOffset = player.jumpHeight * 85f
    val py = playerBaseY - jumpOffset

    val isSliding = player.actionState == ActionState.SLIDING
    val charW = if (isSliding) 42f else 32f
    val charH = if (isSliding) 24f else 54f

    // Shield Aura
    if (player.isShielded) {
        drawCircle(
            color = Color(0xFF00F0FF).copy(alpha = 0.35f),
            radius = 45f,
            center = Offset(targetX, py - charH / 2f)
        )
    }

    // Runner Body
    drawRoundRect(
        color = Color(0xFF00F0FF),
        topLeft = Offset(targetX - charW / 2f, py - charH),
        size = Size(charW, charH),
        cornerRadius = CornerRadius(8f, 8f)
    )

    // Visor
    drawRect(
        color = Color(0xFFFF0055),
        topLeft = Offset(targetX - charW / 4f, py - charH + 10f),
        size = Size(charW / 2f, 8f)
    )

    // Hoverboard base
    drawRoundRect(
        color = Color(0xFFFFB800),
        topLeft = Offset(targetX - 28f, py),
        size = Size(56f, 8f),
        cornerRadius = CornerRadius(4f, 4f)
    )
}
