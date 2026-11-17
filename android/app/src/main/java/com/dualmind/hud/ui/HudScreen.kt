package com.dualmind.hud.ui

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dualmind.hud.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HudScreen(
    viewModel: HudViewModel,
    modifier: Modifier = Modifier
) {
    val uiState by viewModel.uiState.collectAsState()
    var inputCode by remember { mutableStateOf("") }
    var showJoinDialog by remember { mutableStateOf(!uiState.isJoined) }
    var localAnalyzeInput by remember { mutableStateOf("") }

    val turn = uiState.latestTurn
    val riskScore = turn?.system1?.riskScore ?: 0
    val isBreached = riskScore >= uiState.escalationThreshold

    Scaffold(
        modifier = modifier.fillMaxSize(),
        containerColor = Obsidian950,
        topBar = {
            TopAppBar(
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Obsidian900,
                    titleContentColor = Slate200
                ),
                title = {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Text(
                            text = "DualMind HUD",
                            fontWeight = FontWeight.Black,
                            fontSize = 18.sp,
                            color = EmeraldNano
                        )

                        // Engine Badge
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(12.dp))
                                .background(if (uiState.activeEngine.contains("NANO")) Color(0xFF064E3B) else Color(0xFF164E63))
                                .padding(horizontal = 8.dp, vertical = 3.dp)
                        ) {
                            Text(
                                text = if (uiState.activeEngine.contains("NANO")) "NANO" else "CLOUD",
                                fontSize = 10.sp,
                                fontFamily = FontFamily.Monospace,
                                fontWeight = FontWeight.Bold,
                                color = if (uiState.activeEngine.contains("NANO")) EmeraldNano else CyanCloud
                            )
                        }
                    }
                },
                actions = {
                    TextButton(onClick = { showJoinDialog = true }) {
                        Text(
                            text = if (uiState.sessionCode.isNotBlank()) uiState.sessionCode else "JOIN",
                            fontFamily = FontFamily.Monospace,
                            fontWeight = FontWeight.Bold,
                            color = CyanCloud
                        )
                    }
                }
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(16.dp)
                .verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Risk & Telemetry Banner
            Card(
                colors = CardDefaults.cardColors(containerColor = Obsidian900),
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .border(
                        1.dp,
                        if (isBreached) CrimsonAlert else EmeraldNano.copy(alpha = 0.5f),
                        RoundedCornerShape(16.dp)
                    )
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(
                                text = "REAL-TIME RISK INDEX",
                                fontSize = 11.sp,
                                fontFamily = FontFamily.Monospace,
                                color = Slate400,
                                fontWeight = FontWeight.SemiBold
                            )
                            Text(
                                text = "$riskScore / 100",
                                fontSize = 28.sp,
                                fontFamily = FontFamily.Monospace,
                                fontWeight = FontWeight.Black,
                                color = if (isBreached) CrimsonAlert else EmeraldNano
                            )
                        }

                        // Threshold Badge
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(8.dp))
                                .background(Obsidian950)
                                .border(1.dp, Slate700, RoundedCornerShape(8.dp))
                                .padding(horizontal = 10.dp, vertical = 6.dp)
                        ) {
                            Text(
                                text = "THRESHOLD: ${uiState.escalationThreshold}",
                                fontSize = 11.sp,
                                fontFamily = FontFamily.Monospace,
                                color = CyanCloud,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }

                    // Progress Bar
                    LinearProgressIndicator(
                        progress = { riskScore / 100f },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(8.dp)
                            .clip(RoundedCornerShape(4.dp)),
                        color = if (isBreached) CrimsonAlert else if (riskScore > 40) AmberWarning else EmeraldNano,
                        trackColor = Slate700
                    )

                    // Tactic Pill & Bluff Meter
                    if (turn != null) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "TACTIC: ${turn.system1.tacticCategory}",
                                fontSize = 11.sp,
                                fontFamily = FontFamily.Monospace,
                                color = Slate200,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = "BLUFF: ${turn.system1.bluffProbability}%",
                                fontSize = 11.sp,
                                fontFamily = FontFamily.Monospace,
                                color = AmberWarning,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }
            }

            // Giant Teleprompter HUD Card (Readable from 4 feet away!)
            Card(
                colors = CardDefaults.cardColors(containerColor = Obsidian850),
                shape = RoundedCornerShape(20.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .border(1.5.dp, if (isBreached) CyanCloud else EmeraldNano, RoundedCornerShape(20.dp))
            ) {
                Column(
                    modifier = Modifier.padding(20.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(8.dp)
                                .clip(CircleShape)
                                .background(if (isBreached) CyanCloud else EmeraldNano)
                        )
                        Text(
                            text = if (turn?.system2 != null) "SPOKEN STRATEGY (SYSTEM-2)" else "TELEPROMPTER REFLEX CUE",
                            fontSize = 11.sp,
                            fontFamily = FontFamily.Monospace,
                            fontWeight = FontWeight.Black,
                            color = if (turn?.system2 != null) CyanCloud else EmeraldNano,
                            letterSpacing = 1.sp
                        )
                    }

                    val scriptToRead = turn?.system2?.exactScriptToSay
                        ?: turn?.system1?.quickCue
                        ?: "Awaiting statement. Hold anchor position firmly."

                    Text(
                        text = "\"$scriptToRead\"",
                        fontSize = 22.sp,
                        fontFamily = FontFamily.Monospace,
                        fontWeight = FontWeight.Black,
                        color = Color.White,
                        lineHeight = 32.sp
                    )

                    if (turn?.system2?.threatAnalysis?.isNotBlank() == true) {
                        Divider(color = Slate700, modifier = Modifier.padding(vertical = 4.dp))
                        Text(
                            text = "LEVERAGE: ${turn.system2.leverageAngle}",
                            fontSize = 12.sp,
                            color = Slate400,
                            fontFamily = FontFamily.SansSerif
                        )
                    }
                }
            }

            // Standalone Offline Quick Analyze Input (Works 100% offline without Web)
            Card(
                colors = CardDefaults.cardColors(containerColor = Obsidian900),
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .border(1.dp, Slate700, RoundedCornerShape(16.dp))
            ) {
                Column(
                    modifier = Modifier.padding(14.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Text(
                        text = "STANDALONE QUICK ANALYZE (OFFLINE COMPANION)",
                        fontSize = 10.sp,
                        fontFamily = FontFamily.Monospace,
                        color = Slate400,
                        fontWeight = FontWeight.Bold
                    )

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        OutlinedTextField(
                            value = localAnalyzeInput,
                            onValueChange = { localAnalyzeInput = it },
                            placeholder = { Text("Test opponent statement offline...", fontSize = 12.sp, color = Slate400) },
                            modifier = Modifier.weight(1f),
                            singleLine = true,
                            textStyle = LocalTextStyle.current.copy(fontSize = 13.sp, color = Slate200),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = EmeraldNano,
                                unfocusedBorderColor = Slate700
                            )
                        )

                        Button(
                            onClick = {
                                viewModel.analyzeLocalUtterance(localAnalyzeInput)
                                localAnalyzeInput = ""
                            },
                            enabled = localAnalyzeInput.isNotBlank() && !uiState.isAnalyzing,
                            colors = ButtonDefaults.buttonColors(containerColor = EmeraldNano),
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            Text(
                                text = if (uiState.isAnalyzing) "..." else "Run",
                                color = Obsidian950,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }
            }
        }
    }

    // Join Session Dialog
    if (showJoinDialog) {
        AlertDialog(
            onDismissRequest = { if (uiState.isJoined) showJoinDialog = false },
            containerColor = Obsidian900,
            title = {
                Text(
                    text = "Pair Web Teleprompter",
                    color = Slate200,
                    fontWeight = FontWeight.Bold
                )
            },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text(
                        text = "Enter the 6-character session code shown on your Web HUD (e.g. DM-XXXX):",
                        fontSize = 13.sp,
                        color = Slate400
                    )
                    OutlinedTextField(
                        value = inputCode,
                        onValueChange = { inputCode = it.uppercase() },
                        placeholder = { Text("DM-XXXX", color = Slate400) },
                        singleLine = true,
                        textStyle = LocalTextStyle.current.copy(
                            fontSize = 16.sp,
                            fontFamily = FontFamily.Monospace,
                            fontWeight = FontWeight.Bold,
                            color = CyanCloud
                        ),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = CyanCloud,
                            unfocusedBorderColor = Slate700
                        )
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (inputCode.isNotBlank()) {
                            viewModel.joinSession(inputCode)
                            showJoinDialog = false
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = CyanCloud)
                ) {
                    Text("Join Session", color = Obsidian950, fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { showJoinDialog = false }) {
                    Text("Cancel", color = Slate400)
                }
            }
        )
    }
}
