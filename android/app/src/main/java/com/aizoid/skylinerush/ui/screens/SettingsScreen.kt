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
import com.aizoid.skylinerush.core.data.UserGamePreferences

@Composable
fun SettingsScreen(
    preferences: UserGamePreferences,
    onToggleSoundFx: (Boolean) -> Unit,
    onToggleMusic: (Boolean) -> Unit,
    onToggleHaptics: (Boolean) -> Unit,
    onToggleReducedMotion: (Boolean) -> Unit,
    onResetProgress: () -> Unit,
    onBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    var showResetDialog by remember { mutableStateOf(false) }

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
                text = "SETTINGS & PRIVACY",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )
            Spacer(modifier = Modifier.width(48.dp))
        }

        Spacer(modifier = Modifier.height(24.dp))

        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = Color(0xFF161E2E)),
            shape = RoundedCornerShape(16.dp)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                SettingToggleRow("Sound Effects (SFX)", preferences.soundFxEnabled, onToggleSoundFx)
                Divider(color = Color(0x22FFFFFF), modifier = Modifier.padding(vertical = 12.dp))
                SettingToggleRow("Synth Music Loops", preferences.musicEnabled, onToggleMusic)
                Divider(color = Color(0x22FFFFFF), modifier = Modifier.padding(vertical = 12.dp))
                SettingToggleRow("Haptic Feedback (Vibration)", preferences.hapticsEnabled, onToggleHaptics)
                Divider(color = Color(0x22FFFFFF), modifier = Modifier.padding(vertical = 12.dp))
                SettingToggleRow("Reduced Motion (Accessibility)", preferences.reducedMotion, onToggleReducedMotion)
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Privacy and Advertising Compliance Info
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = Color(0xFF161E2E)),
            shape = RoundedCornerShape(16.dp)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text("PRIVACY & MONETIZATION", fontWeight = FontWeight.Bold, color = Color(0xFF00F0FF), fontSize = 14.sp)
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    "• Offline playable without an account\n• No forced ads during active runs\n• Rewarded ads strictly optional with verified reward grants\n• Built-in Unity Ads SDK 4.12.5 (Test Mode active)",
                    fontSize = 12.sp,
                    color = Color.LightGray
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text("Version: 1.0.0 (Build 1) · Package: com.aizoid.skylinerush", fontSize = 11.sp, color = Color.Gray)
            }
        }

        Spacer(modifier = Modifier.weight(1f))

        // Reset Data Button
        Button(
            onClick = { showResetDialog = true },
            modifier = Modifier.fillMaxWidth().height(48.dp),
            colors = ButtonDefaults.buttonColors(containerColor = Color(0x33FF0055)),
            shape = RoundedCornerShape(12.dp)
        ) {
            Text("RESET LOCAL PROGRESS", color = Color(0xFFFF0055), fontWeight = FontWeight.Bold)
        }
    }

    if (showResetDialog) {
        AlertDialog(
            onDismissRequest = { showResetDialog = false },
            title = { Text("Confirm Data Reset") },
            text = { Text("Are you sure you want to reset all energy cores, high scores, and cosmetics? This action is irreversible.") },
            confirmButton = {
                Button(
                    onClick = {
                        onResetProgress()
                        showResetDialog = false
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFFF0055))
                ) {
                    Text("YES, RESET")
                }
            },
            dismissButton = {
                Button(onClick = { showResetDialog = false }) {
                    Text("CANCEL")
                }
            }
        )
    }
}

@Composable
fun SettingToggleRow(label: String, checked: Boolean, onCheckedChange: (Boolean) -> Unit) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(text = label, color = Color.White, fontSize = 14.sp)
        Switch(
            checked = checked,
            onCheckedChange = onCheckedChange,
            colors = SwitchDefaults.colors(checkedThumbColor = Color(0xFF00F0FF))
        )
    }
}
