package com.dualmind.hud.data

import android.util.Log
import com.google.firebase.Firebase
import com.google.firebase.firestore.ListenerRegistration
import com.google.firebase.firestore.Query
import com.google.firebase.firestore.firestore
import com.google.firebase.remoteconfig.remoteConfig
import com.google.firebase.remoteconfig.remoteConfigSettings
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.tasks.await

class SessionSyncRepository {

    private val firestore = Firebase.firestore
    private val remoteConfig = Firebase.remoteConfig

    init {
        try {
            val configSettings = remoteConfigSettings {
                minimumFetchIntervalInSeconds = 60
            }
            remoteConfig.setConfigSettingsAsync(configSettings)
            remoteConfig.setDefaultsAsync(mapOf("escalation_risk_threshold" to 70L))
        } catch (e: Exception) {
            Log.w("DualMind", "Remote config init notice: ${e.message}")
        }
    }

    suspend fun getEscalationRiskThreshold(): Int {
        return try {
            remoteConfig.fetchAndActivate().await()
            val threshold = remoteConfig.getLong("escalation_risk_threshold").toInt()
            if (threshold > 0) threshold else 70
        } catch (e: Exception) {
            70
        }
    }

    /**
     * Subscribes to real-time turns for a given session code (e.g. DM-9821)
     */
    fun observeSessionTurns(sessionCode: String): Flow<List<TurnRecord>> = callbackFlow {
        val sessionId = "session_${sessionCode.replace("-", "_")}"
        val turnsCollection = firestore.collection("sessions").document(sessionId).collection("turns")

        val registration: ListenerRegistration = turnsCollection
            .orderBy("timestamp", Query.Direction.ASCENDING)
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    Log.w("DualMind", "Firestore turns listener error (offline mode): ${error.message}")
                    return@addSnapshotListener
                }

                if (snapshot != null) {
                    val turns = snapshot.documents.mapNotNull { doc ->
                        try {
                            TurnRecord(
                                id = doc.id,
                                timestamp = doc.getLong("timestamp") ?: System.currentTimeMillis(),
                                utterance = doc.getString("utterance") ?: "",
                                rawUtterance = doc.getString("rawUtterance") ?: "",
                                executionSource = doc.getString("executionSource") ?: "ON-DEVICE NANO",
                                latencyMs = doc.getLong("latencyMs") ?: 0L,
                                offline = doc.getBoolean("offline") ?: false,
                                piiShieldedCount = (doc.getLong("piiShieldedCount") ?: 0L).toInt(),
                                system1 = doc.get("system1")?.let { s1Map ->
                                    val map = s1Map as? Map<*, *>
                                    System1Payload(
                                        sentiment = map?.get("sentiment") as? String ?: "NEUTRAL",
                                        tacticDetected = map?.get("tacticDetected") as? String ?: "",
                                        tacticCategory = map?.get("tacticCategory") as? String ?: "ANCHORING",
                                        bluffProbability = (map?.get("bluffProbability") as? Long ?: 40L).toInt(),
                                        riskScore = (map?.get("riskScore") as? Long ?: 50L).toInt(),
                                        quickCue = map?.get("quickCue") as? String ?: ""
                                    )
                                } ?: System1Payload(),
                                system2 = doc.get("system2")?.let { s2Map ->
                                    val map = s2Map as? Map<*, *>
                                    System2Payload(
                                        threatAnalysis = map?.get("threatAnalysis") as? String ?: "",
                                        leverageAngle = map?.get("leverageAngle") as? String ?: "",
                                        batnaAnchorMath = map?.get("batnaAnchorMath") as? String ?: "",
                                        exactScriptToSay = map?.get("exactScriptToSay") as? String ?: ""
                                    )
                                }
                            )
                        } catch (e: Exception) {
                            null
                        }
                    }
                    trySend(turns)
                }
            }

        awaitClose {
            registration.remove()
        }
    }
}
