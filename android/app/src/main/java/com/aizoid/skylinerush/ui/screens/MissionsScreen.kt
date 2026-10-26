package com.aizoid.skylinerush.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aizoid.skylinerush.game.model.DailyMission
import com.aizoid.skylinerush.game.model.MissionType

@Composable
fun MissionsScreen(
    missions: List<DailyMission>,
    onClaimMission: (missionId: String, reward: Int) -> Unit,
    onBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Color(0xFF0A0D14))
            .padding(20.dp)
    ) {
        // Header
        Row(
            modifier = Modifier.fillMaxWidth().padding(top = 16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Button(
                onClick = onBack,
                colors = ButtonDefaults.buttonColors(containerColor = Color(0x33FFFFFF))
            ) {
                Text("← BACK", color = Color.White)
            }
            Text(
                text = "DAILY MISSIONS",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )
            Spacer(modifier = Modifier.width(48.dp))
        }

        Spacer(modifier = Modifier.height(20.dp))

        Text(
            text = "Resets daily at 00:00 local time. Earn bonus energy cores by honing courier maneuvers.",
            fontSize = 13.sp,
            color = Color.Gray
        )

        Spacer(modifier = Modifier.height(16.dp))

        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            items(missions) { mission ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF161E2E)),
                    shape = RoundedCornerShape(14.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = mission.title,
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color.White
                            )
                            Text(
                                text = "◆ ${mission.rewardCores}",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFFFFB800)
                            )
                        }

                        Text(
                            text = mission.description,
                            fontSize = 12.sp,
                            color = Color.LightGray,
                            modifier = Modifier.padding(vertical = 4.dp)
                        )

                        // Progress Bar
                        val progress = (mission.current.toFloat() / mission.target.toFloat()).coerceIn(0f, 1f)
                        LinearProgressIndicator(
                            progress = { progress },
                            modifier = Modifier.fillMaxWidth().height(6.dp),
                            color = Color(0xFF00F0FF),
                            trackColor = Color(0xFF0A0D14)
                        )

                        Spacer(modifier = Modifier.height(8.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "${mission.current} / ${mission.target}",
                                fontSize = 12.sp,
                                color = Color.Gray
                            )

                            if (mission.isClaimed) {
                                Text("CLAIMED", color = Color.Gray, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                            } else if (mission.isCompleted) {
                                Button(
                                    onClick = { onClaimMission(mission.id, mission.rewardCores) },
                                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFFFB800))
                                ) {
                                    Text("CLAIM REWARD", color = Color(0xFF0A0D14), fontWeight = FontWeight.Bold)
                                }
                            } else {
                                Text("IN PROGRESS", color = Color(0xFF00F0FF), fontSize = 12.sp)
                            }
                        }
                    }
                }
            }
        }
    }
}
