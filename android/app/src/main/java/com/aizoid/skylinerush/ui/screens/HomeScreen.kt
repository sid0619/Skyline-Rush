package com.aizoid.skylinerush.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aizoid.skylinerush.core.data.UserGamePreferences

@Composable
fun HomeScreen(
    preferences: UserGamePreferences,
    onStartGame: () -> Unit,
    onNavigateCollection: () -> Unit,
    onNavigateMissions: () -> Unit,
    onNavigateSettings: () -> Unit,
    onNavigateAnalytics: () -> Unit,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .fillMaxSize()
            .background(
                Brush.verticalGradient(
                    colors = listOf(Color(0xFF060913), Color(0xFF0F172A), Color(0xFF1E1B4B))
                )
            )
            .padding(24.dp)
    ) {
        // Top Bar: Energy Cores Balance & Settings
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .background(Color(0x99121824), RoundedCornerShape(12.dp))
                    .padding(horizontal = 14.dp, vertical = 8.dp)
            ) {
                Text(
                    text = "◆ ${preferences.energyCoresBalance} CORES",
                    color = Color(0xFFFFB800),
                    fontWeight = FontWeight.Bold,
                    fontSize = 14.sp
                )
            }

            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Button(
                    onClick = onNavigateAnalytics,
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0x99121824))
                ) {
                    Text("STATS", color = Color(0xFF00F0FF))
                }
                Button(
                    onClick = onNavigateSettings,
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0x99121824))
                ) {
                    Text("⚙", color = Color.White)
                }
            }
        }

        // Center Content: Game Title & Play CTA
        Column(
            modifier = Modifier.align(Alignment.Center),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = "SKYLINE RUSH",
                fontSize = 38.sp,
                fontWeight = FontWeight.Black,
                color = Color(0xFF00F0FF),
                letterSpacing = 2.sp
            )
            Text(
                text = "RIFT RUNNER",
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold,
                color = Color(0xFFFF0055),
                letterSpacing = 4.sp
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Personal Best Summary Card
            Card(
                colors = CardDefaults.cardColors(containerColor = Color(0x99121824)),
                shape = RoundedCornerShape(16.dp)
            ) {
                Column(
                    modifier = Modifier.padding(horizontal = 24.dp, vertical = 12.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "PERSONAL BEST",
                        fontSize = 11.sp,
                        color = Color.LightGray,
                        fontWeight = FontWeight.SemiBold
                    )
                    Text(
                        text = "${preferences.personalBestDistance} METERS · ${preferences.personalBestScore} PTS",
                        fontSize = 15.sp,
                        color = Color.White,
                        fontWeight = FontWeight.Bold
                    )
                }
            }

            Spacer(modifier = Modifier.height(36.dp))

            // Large Start Run CTA Button
            Button(
                onClick = onStartGame,
                modifier = Modifier
                    .fillMaxWidth(0.75f)
                    .height(60.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF00F0FF)),
                shape = RoundedCornerShape(14.dp)
            ) {
                Text(
                    text = "RUN SKYLINE",
                    color = Color(0xFF0A0D14),
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Black,
                    letterSpacing = 1.sp
                )
            }
        }

        // Bottom Navigation: Missions and Cosmetics Locker
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .align(Alignment.BottomCenter)
                .padding(bottom = 16.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Button(
                onClick = onNavigateMissions,
                modifier = Modifier.weight(1f).height(48.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xCC121824)),
                shape = RoundedCornerShape(12.dp)
            ) {
                Text("MISSIONS", color = Color.White, fontWeight = FontWeight.Bold)
            }
            Button(
                onClick = onNavigateCollection,
                modifier = Modifier.weight(1f).height(48.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xCC121824)),
                shape = RoundedCornerShape(12.dp)
            ) {
                Text("LOCKER", color = Color(0xFF00F0FF), fontWeight = FontWeight.Bold)
            }
        }
    }
}
