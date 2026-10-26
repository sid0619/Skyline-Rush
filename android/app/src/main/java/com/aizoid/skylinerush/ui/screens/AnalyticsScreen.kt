package com.aizoid.skylinerush.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aizoid.skylinerush.core.ads.AdAnalyticsData
import com.aizoid.skylinerush.core.analytics.PlayerAnalyticsSnapshot

@Composable
fun AnalyticsScreen(
    playerStats: PlayerAnalyticsSnapshot,
    adStats: AdAnalyticsData,
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
                text = "PERFORMANCE ANALYTICS",
                fontSize = 17.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )
            Spacer(modifier = Modifier.width(48.dp))
        }

        Spacer(modifier = Modifier.height(20.dp))

        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF161E2E)),
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Column(modifier = Modifier.padding(18.dp)) {
                        Text("GAMEPLAY METRICS", color = Color(0xFF00F0FF), fontWeight = FontWeight.Bold, fontSize = 14.sp)
                        Spacer(modifier = Modifier.height(12.dp))
                        StatRow("Total Runs Completed", "${playerStats.totalRunsCompleted}")
                        StatRow("Total Distance Traveled", "${playerStats.totalDistanceMeters} m")
                        StatRow("Total Energy Cores Collected", "${playerStats.totalCoresCollected}")
                        StatRow("Personal Best High Score", "${playerStats.personalBestScore} pts")
                        StatRow("Missions Accomplished", "${playerStats.completedMissionsCount}")
                    }
                }
            }

            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF161E2E)),
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Column(modifier = Modifier.padding(18.dp)) {
                        Text("UNITY ADS LIFECYCLE EVENTS", color = Color(0xFFFFB800), fontWeight = FontWeight.Bold, fontSize = 14.sp)
                        Spacer(modifier = Modifier.height(12.dp))
                        StatRow("Rewarded Load Requests", "${adStats.rewardedLoadRequests}")
                        StatRow("Rewarded Load Successes", "${adStats.rewardedLoadSuccesses}")
                        StatRow("Rewarded Show Attempts", "${adStats.rewardedShowAttempts}")
                        StatRow("Rewarded Completions", "${adStats.rewardedCompletions}")
                        StatRow("Verified Rewards Granted", "${adStats.actualRewardsGranted}")
                        Divider(color = Color(0x22FFFFFF), modifier = Modifier.padding(vertical = 8.dp))
                        StatRow("Interstitial Load Requests", "${adStats.interstitialLoadRequests}")
                        StatRow("Interstitial Load Successes", "${adStats.interstitialLoadSuccesses}")
                        StatRow("Interstitial Show Attempts", "${adStats.interstitialShowAttempts}")
                        StatRow("Recorded Impressions", "${adStats.interstitialImpressions}")
                        StatRow("Ad Clicks Recorded", "${adStats.recordedClicks}")
                    }
                }
            }

            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF161E2E)),
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Column(modifier = Modifier.padding(18.dp)) {
                        Text("ESTIMATED REVENUE MODEL", color = Color(0xFF10B981), fontWeight = FontWeight.Bold, fontSize = 14.sp)
                        Spacer(modifier = Modifier.height(8.dp))

                        val totalImpressions = adStats.rewardedCompletions + adStats.interstitialImpressions
                        val assumedEcpm = playerStats.assumedEcpmUsd
                        val estimatedRevenue = (totalImpressions.toDouble() / 1000.0) * assumedEcpm

                        Text(
                            text = "$${String.format("%.4f", estimatedRevenue)} USD",
                            fontSize = 28.sp,
                            fontWeight = FontWeight.Black,
                            color = Color(0xFF10B981)
                        )
                        Text(
                            text = "Formula: $totalImpressions impressions / 1,000 × $$assumedEcpm benchmark eCPM",
                            fontSize = 12.sp,
                            color = Color.LightGray
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "DISCLAIMER: This is a mathematical estimation based on configured eCPM benchmarks and does not represent official ad earnings. Official revenue is calculated solely by the Unity Ads Monetization Dashboard.",
                            fontSize = 11.sp,
                            color = Color.Gray,
                            lineHeight = 15.sp
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun StatRow(label: String, value: String) {
    Row(
        modifier = Modifier.fillMaxWidth().padding(vertical = 3.dp),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(label, color = Color.LightGray, fontSize = 13.sp)
        Text(value, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 13.sp)
    }
}
