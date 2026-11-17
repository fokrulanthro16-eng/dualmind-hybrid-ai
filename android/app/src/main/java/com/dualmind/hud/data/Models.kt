package com.dualmind.hud.data

import com.google.gson.annotations.SerializedName

data class System1Payload(
    @SerializedName("sentiment") val sentiment: String = "NEUTRAL",
    @SerializedName("tacticDetected") val tacticDetected: String = "Positional Bargaining",
    @SerializedName("tacticCategory") val tacticCategory: String = "ANCHORING",
    @SerializedName("bluffProbability") val bluffProbability: Int = 45,
    @SerializedName("riskScore") val riskScore: Int = 50,
    @SerializedName("quickCue") val quickCue: String = "Anchor firmly on value.",
    @SerializedName("redactedText") val redactedText: String = "",
    @SerializedName("piiEntitiesShielded") val piiEntitiesShielded: List<String> = emptyList()
)

data class CounterOffer(
    @SerializedName("tier") val tier: String = "Balanced",
    @SerializedName("headline") val headline: String = "",
    @SerializedName("script") val script: String = "",
    @SerializedName("expectedOutcome") val expectedOutcome: String = ""
)

data class System2Payload(
    @SerializedName("threatAnalysis") val threatAnalysis: String = "",
    @SerializedName("leverageAngle") val leverageAngle: String = "",
    @SerializedName("batnaAnchorMath") val batnaAnchorMath: String = "",
    @SerializedName("counterOffers") val counterOffers: List<CounterOffer> = emptyList(),
    @SerializedName("exactScriptToSay") val exactScriptToSay: String = ""
)

data class NegotiationPlaybook(
    val role: String = "Staff AI Systems Architect",
    val targetAnchor: String = "$240k base + 0.5% equity",
    val walkAwayBatna: String = "$205k competing offer"
)

data class TurnRecord(
    val id: String = "",
    val timestamp: Long = System.currentTimeMillis(),
    val utterance: String = "",
    val rawUtterance: String = "",
    val system1: System1Payload = System1Payload(),
    val system2: System2Payload? = null,
    val executionSource: String = "ON-DEVICE NANO",
    val latencyMs: Long = 0,
    val offline: Boolean = false,
    val piiShieldedCount: Int = 0
)
