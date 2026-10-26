package com.aizoid.skylinerush.ui.game

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aizoid.skylinerush.game.engine.EngineStatus
import com.aizoid.skylinerush.ui.screens.PauseScreen
import com.aizoid.skylinerush.ui.screens.RunSummaryScreen

@Composable
fun GameScreen(
    viewModel: GameViewModel,
    onNavigateHome: () -> Unit,
    modifier: Modifier = Modifier
) {
    val snapshot by viewModel.engineSnapshot.collectAsState()
    val lastSummary by viewModel.lastRunSummary.collectAsState()

    Box(modifier = modifier.fillMaxSize().background(Color(0xFF0A0D14))) {
        // Compose Canvas Viewport
        GameCanvasRenderer(
            snapshot = snapshot,
            onSwipeLeft = { viewModel.onSwipeLeft() },
            onSwipeRight = { viewModel.onSwipeRight() },
            onJump = { viewModel.onJump() },
            onSlide = { viewModel.onSlide() }
        )

        // Top HUD Perimeter Cluster
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 40.dp, start = 16.dp, end = 16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Distance & Score
            Column {
                Text(
                    text = "${snapshot.distanceTraveled.toInt()} M",
                    fontSize = 24.sp,
                    color = Color(0xFF00F0FF)
                )
                Text(
                    text = "SCORE: ${snapshot.currentScore}",
                    fontSize = 14.sp,
                    color = Color.White
                )
            }

            // Energy Cores Counter
            Box(
                modifier = Modifier
                    .background(Color(0x99121824), RoundedCornerShape(12.dp))
                    .padding(horizontal = 12.dp, vertical = 6.dp)
            ) {
                Text(
                    text = "◆ ${snapshot.coresCollected}",
                    fontSize = 16.sp,
                    color = Color(0xFFFFB800)
                )
            }

            // Pause Button
            IconButton(
                onClick = { viewModel.pause() },
                modifier = Modifier.background(Color(0x99121824), RoundedCornerShape(8.dp))
            ) {
                Text("II", color = Color.White)
            }
        }

        // Active Power-up Indicator
        if (snapshot.player.isShielded || snapshot.player.magnetTimer > 0f || snapshot.player.scoreBoostTimer > 0f) {
            Row(
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .padding(bottom = 32.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                if (snapshot.player.isShielded) {
                    PowerUpBadge("SHIELD ACTIVE", Color(0xFF00E5FF))
                }
                if (snapshot.player.magnetTimer > 0f) {
                    PowerUpBadge("MAGNET: ${snapshot.player.magnetTimer.toInt()}s", Color(0xFFFFB800))
                }
                if (snapshot.player.scoreBoostTimer > 0f) {
                    PowerUpBadge("2X SCORE: ${snapshot.player.scoreBoostTimer.toInt()}s", Color(0xFFFF0055))
                }
            }
        }

        // Pause Modal Overlay
        if (snapshot.status == EngineStatus.PAUSED) {
            PauseScreen(
                onResume = { viewModel.resume() },
                onRestart = { viewModel.startGame() },
                onHome = onNavigateHome
            )
        }

        // Run Summary Modal Overlay
        if (snapshot.status == EngineStatus.GAME_OVER && lastSummary != null) {
            RunSummaryScreen(
                summary = lastSummary!!,
                onRestart = { viewModel.startGame() },
                onHome = onNavigateHome,
                onReviveClick = {
                    // Triggers Rewarded Video Revive flow
                },
                onBonusClick = {
                    // Triggers Rewarded Video Bonus flow
                }
            )
        }
    }
}

@Composable
fun PowerUpBadge(label: String, color: Color) {
    Box(
        modifier = Modifier
            .background(color.copy(alpha = 0.2f), RoundedCornerShape(8.dp))
            .padding(horizontal = 10.dp, vertical = 4.dp)
    ) {
        Text(text = label, color = color, fontSize = 12.sp)
    }
}
