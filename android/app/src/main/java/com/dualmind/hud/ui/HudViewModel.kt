package com.dualmind.hud.ui

import android.app.Application
import android.content.Context
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.dualmind.hud.data.HybridAiRepository
import com.dualmind.hud.data.NegotiationPlaybook
import com.dualmind.hud.data.SessionSyncRepository
import com.dualmind.hud.data.TurnRecord
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch

data class HudUiState(
    val sessionCode: String = "",
    val isJoined: Boolean = false,
    val escalationThreshold: Int = 70,
    val latestTurn: TurnRecord? = null,
    val turnsCount: Int = 0,
    val activeEngine: String = "SYSTEM-1: ON-DEVICE NANO",
    val isOfflineMode: Boolean = false,
    val isAnalyzing: Boolean = false,
    val playbook: NegotiationPlaybook = NegotiationPlaybook()
)

class HudViewModel(application: Application) : AndroidViewModel(application) {

    private val sessionSyncRepository = SessionSyncRepository()
    private val hybridAiRepository = HybridAiRepository(application)

    private val _uiState = MutableStateFlow(HudUiState())
    val uiState: StateFlow<HudUiState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            val threshold = sessionSyncRepository.getEscalationRiskThreshold()
            _uiState.value = _uiState.value.copy(escalationThreshold = threshold)
        }
    }

    fun joinSession(code: String) {
        val formatted = code.trim().uppercase()
        if (formatted.isBlank()) return

        _uiState.value = _uiState.value.copy(sessionCode = formatted, isJoined = true)

        viewModelScope.launch {
            sessionSyncRepository.observeSessionTurns(formatted).collectLatest { turns ->
                if (turns.isNotEmpty()) {
                    val latest = turns.last()
                    val prevRisk = _uiState.value.latestTurn?.system1?.riskScore ?: 0
                    val currentRisk = latest.system1.riskScore
                    val threshold = _uiState.value.escalationThreshold

                    // Trigger Haptic Vibration when risk breaches threshold
                    if (currentRisk >= threshold && prevRisk < threshold) {
                        triggerHapticAlert()
                    }

                    val engine = if (latest.system2 != null) {
                        "SYSTEM-2: CLOUD GEMINI"
                    } else {
                        "SYSTEM-1: ON-DEVICE NANO"
                    }

                    _uiState.value = _uiState.value.copy(
                        latestTurn = latest,
                        turnsCount = turns.size,
                        activeEngine = engine
                    )
                }
            }
        }
    }

    /**
     * Standalone Offline Quick Analyze: Run directly on Android without Web app
     */
    fun analyzeLocalUtterance(text: String) {
        if (text.isBlank()) return

        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isAnalyzing = true)
            val (s1Result, source) = hybridAiRepository.analyzeSystem1Reflex(text, privacyShieldActive = true)

            val turn = TurnRecord(
                id = "local_${System.currentTimeMillis()}",
                timestamp = System.currentTimeMillis(),
                utterance = s1Result.redactedText,
                rawUtterance = text,
                system1 = s1Result,
                executionSource = source,
                offline = true,
                piiShieldedCount = s1Result.piiEntitiesShielded.size
            )

            if (s1Result.riskScore >= _uiState.value.escalationThreshold) {
                triggerHapticAlert()
            }

            _uiState.value = _uiState.value.copy(
                latestTurn = turn,
                turnsCount = _uiState.value.turnsCount + 1,
                activeEngine = source,
                isAnalyzing = false
            )
        }
    }

    private fun triggerHapticAlert() {
        try {
            val context = getApplication<Application>()
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                val vibratorManager = context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as? VibratorManager
                vibratorManager?.defaultVibrator?.vibrate(
                    VibrationEffect.createWaveform(longArrayOf(0, 150, 100, 250), -1)
                )
            } else {
                @Suppress("DEPRECATION")
                val vibrator = context.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
                vibrator?.vibrate(
                    VibrationEffect.createWaveform(longArrayOf(0, 150, 100, 250), -1)
                )
            }
        } catch (_: Exception) {
            // Haptic failure ignored gracefully
        }
    }
}
