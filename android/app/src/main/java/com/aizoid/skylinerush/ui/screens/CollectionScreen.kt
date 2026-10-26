package com.aizoid.skylinerush.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
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
import com.aizoid.skylinerush.game.model.CosmeticItem
import com.aizoid.skylinerush.game.model.CosmeticType

@Composable
fun CollectionScreen(
    preferences: UserGamePreferences,
    onEquip: (category: String, id: String) -> Unit,
    onUnlock: (category: String, id: String, cost: Int) -> Unit,
    onBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    var selectedTab by remember { mutableStateOf(0) }
    val tabs = listOf("RUNNER SKINS", "HOVERBOARDS", "TRAILS")

    val catalog = listOf(
        // Skins
        CosmeticItem("skin_courier", "Cyber Courier", "Standard issue high-altitude courier gear", CosmeticType.RUNNER_SKIN, 0, isUnlocked = preferences.unlockedSkins.contains("skin_courier"), isEquipped = preferences.equippedSkinId == "skin_courier", primaryColorHex = "#00F0FF"),
        CosmeticItem("skin_specter", "Neon Specter", "Stealth cloaking mesh with ultraviolet highlights", CosmeticType.RUNNER_SKIN, 250, isUnlocked = preferences.unlockedSkins.contains("skin_specter"), isEquipped = preferences.equippedSkinId == "skin_specter", primaryColorHex = "#A855F7"),
        CosmeticItem("skin_vanguard", "Rift Vanguard", "Heavy carbon plating tuned for rift radiation", CosmeticType.RUNNER_SKIN, 600, isUnlocked = preferences.unlockedSkins.contains("skin_vanguard"), isEquipped = preferences.equippedSkinId == "skin_vanguard", primaryColorHex = "#FF0055"),
        // Hoverboards
        CosmeticItem("board_aero", "Aero Glide", "Balanced repulsor deck with stable draft fins", CosmeticType.HOVERBOARD, 0, isUnlocked = preferences.unlockedBoards.contains("board_aero"), isEquipped = preferences.equippedBoardId == "board_aero", primaryColorHex = "#FFB800"),
        CosmeticItem("board_tachyon", "Tachyon Blade", "Sharpened edge hoverboard for hyper-responsive carving", CosmeticType.HOVERBOARD, 350, isUnlocked = preferences.unlockedBoards.contains("board_tachyon"), isEquipped = preferences.equippedBoardId == "board_tachyon", primaryColorHex = "#00F0FF"),
        CosmeticItem("board_void", "Void Skimmer", "Zero-friction levitation engine forged in rift slipstreams", CosmeticType.HOVERBOARD, 800, isUnlocked = preferences.unlockedBoards.contains("board_void"), isEquipped = preferences.equippedBoardId == "board_void", primaryColorHex = "#7C3AED"),
        // Trails
        CosmeticItem("trail_plasma", "Cyan Plasma", "High-energy ion wake", CosmeticType.PARTICLE_TRAIL, 0, isUnlocked = preferences.unlockedTrails.contains("trail_plasma"), isEquipped = preferences.equippedTrailId == "trail_plasma", primaryColorHex = "#00F0FF"),
        CosmeticItem("trail_amber", "Solar Amber", "Radiant thermite spark trail", CosmeticType.PARTICLE_TRAIL, 200, isUnlocked = preferences.unlockedTrails.contains("trail_amber"), isEquipped = preferences.equippedTrailId == "trail_amber", primaryColorHex = "#FFB800"),
        CosmeticItem("trail_violet", "Violet Warp", "Localized rift tear particles", CosmeticType.PARTICLE_TRAIL, 450, isUnlocked = preferences.unlockedTrails.contains("trail_violet"), isEquipped = preferences.equippedTrailId == "trail_violet", primaryColorHex = "#C084FC")
    )

    val currentItems = when (selectedTab) {
        0 -> catalog.filter { it.type == CosmeticType.RUNNER_SKIN }
        1 -> catalog.filter { it.type == CosmeticType.HOVERBOARD }
        else -> catalog.filter { it.type == CosmeticType.PARTICLE_TRAIL }
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Color(0xFF0A0D14))
            .padding(20.dp)
    ) {
        // Top Header
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
                text = "COSMETIC LOCKER",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )
            Text(
                text = "◆ ${preferences.energyCoresBalance}",
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
                color = Color(0xFFFFB800)
            )
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Tabs
        TabRow(
            selectedTabIndex = selectedTab,
            containerColor = Color(0xFF121824),
            contentColor = Color(0xFF00F0FF)
        ) {
            tabs.forEachIndexed { index, title ->
                Tab(
                    selected = selectedTab == index,
                    onClick = { selectedTab = index },
                    text = { Text(title, fontSize = 12.sp, fontWeight = FontWeight.Bold) }
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Cosmetic Items List
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            items(currentItems) { item ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF161E2E)),
                    shape = RoundedCornerShape(14.dp)
                ) {
                    Row(
                        modifier = Modifier.padding(16.dp).fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = item.name,
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color.White
                            )
                            Text(
                                text = item.description,
                                fontSize = 12.sp,
                                color = Color.Gray
                            )
                        }

                        if (item.isEquipped) {
                            Text("EQUIPPED", color = Color(0xFF00F0FF), fontWeight = FontWeight.Bold)
                        } else if (item.isUnlocked) {
                            Button(
                                onClick = {
                                    val cat = when (item.type) {
                                        CosmeticType.RUNNER_SKIN -> "skin"
                                        CosmeticType.HOVERBOARD -> "board"
                                        CosmeticType.PARTICLE_TRAIL -> "trail"
                                        else -> "theme"
                                    }
                                    onEquip(cat, item.id)
                                },
                                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF00F0FF))
                            ) {
                                Text("EQUIP", color = Color(0xFF0A0D14), fontWeight = FontWeight.Bold)
                            }
                        } else {
                            Button(
                                onClick = {
                                    val cat = when (item.type) {
                                        CosmeticType.RUNNER_SKIN -> "skin"
                                        CosmeticType.HOVERBOARD -> "board"
                                        CosmeticType.PARTICLE_TRAIL -> "trail"
                                        else -> "theme"
                                    }
                                    onUnlock(cat, item.id, item.costCores)
                                },
                                enabled = preferences.energyCoresBalance >= item.costCores,
                                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFFFB800))
                            ) {
                                Text("UNLOCK: ◆ ${item.costCores}", color = Color(0xFF0A0D14), fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }
            }
        }
    }
}
