package com.aizoid.skylinerush.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aizoid.skylinerush.game.model.RunSummary

@Composable
fun RunSummaryScreen(
    summary: RunSummary,
    onRestart: () -> Unit,
    onHome: () -> Unit,
    onReviveClick: () -> Unit,
    onBonusClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    var bonusClaimed by remember { mutableStateOf(false) }

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(Color(0xEE060913)),
        contentAlignment = Alignment.Center
    ) {
        Card(
            modifier = Modifier.fillMaxWidth(0.9f),
            colors = CardDefaults.cardColors(containerColor = Color(0xFF121824)),
            shape = RoundedCornerShape(24.dp)
        ) {
            Column(
                modifier = Modifier.padding(28.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = "RUN TERMINATED",
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Black,
                    color = Color(0xFFFF0055)
                )

                Spacer(modifier = Modifier.height(18.dp))

                // Stats Grid
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceEvenly
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("DISTANCE", fontSize = 12.sp, color = Color.Gray)
                        Text(
                            "${summary.distanceMeters}m",
                            fontSize = 22.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF00F0FF)
                        )
                    }
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("SCORE", fontSize = 12.sp, color = Color.Gray)
                        Text(
                            "${summary.finalScore}",
                            fontSize = 22.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                    }
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("CORES", fontSize = 12.sp, color = Color.Gray)
                        Text(
                            "+${summary.coresCollected}",
                            fontSize = 22.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFFFFB800)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(20.dp))

                // Rewarded Revive Offer (if eligible)
                if (summary.reviveOffered && !summary.reviveAccepted) {
                    Button(
                        onClick = onReviveClick,
                        modifier = Modifier.fillMaxWidth().height(48.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF00E5FF)),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Text("▶ WATCH AD TO REVIVE (1x)", color = Color(0xFF0A0D14), fontWeight = FontWeight.Bold)
                    }
                    Spacer(modifier = Modifier.height(10.dp))
                }

                // Rewarded +50 Bonus Cores Offer
                if (!bonusClaimed) {
                    Button(
                        onClick = {
                            onBonusClick()
                            bonusClaimed = true
                        },
                        modifier = Modifier.fillMaxWidth().height(44.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0x33FFB800)),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Text("★ WATCH AD: +50 BONUS CORES", color = Color(0xFFFFB800), fontWeight = FontWeight.SemiBold)
                    }
                    Spacer(modifier = Modifier.height(14.dp))
                }

                // Action Buttons: Play Again or Menu
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Button(
                        onClick = onRestart,
                        modifier = Modifier.weight(1f).height(48.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF00F0FF)),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Text("PLAY AGAIN", color = Color(0xFF0A0D14), fontWeight = FontWeight.Bold)
                    }
                    Button(
                        onClick = onHome,
                        modifier = Modifier.weight(1f).height(48.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0x33FFFFFF)),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Text("HOME", color = Color.White, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}
