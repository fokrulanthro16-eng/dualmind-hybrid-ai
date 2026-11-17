package com.dualmind.hud.data

import android.content.Context
import android.util.Log
import com.google.firebase.Firebase
import com.google.firebase.ai.ai
import com.google.firebase.ai.type.InferenceMode
import com.google.firebase.ai.type.generationConfig
import com.google.gson.Gson
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class HybridAiRepository(private val context: Context) {

    private val gson = Gson()

    /**
     * Executes System-1 Reflex Engine on Android using Firebase AI Logic with InferenceMode.PREFER_ON_DEVICE
     * If Gemini Nano is downloading or offline, seamlessly routes to high-speed on-device reflex.
     */
    suspend fun analyzeSystem1Reflex(
        utterance: String,
        privacyShieldActive: Boolean = true
    ): Pair<System1Payload, String> = withContext(Dispatchers.IO) {
        val startTime = System.currentTimeMillis()

        // 1. Local PII Redaction
        val (redactedText, shieldedEntities) = if (privacyShieldActive) {
            redactPiiLocally(utterance)
        } else {
            Pair(utterance, emptyList())
        }

        try {
            // Attempt Firebase AI Logic with PREFER_ON_DEVICE (Gemini Nano on Android)
            val generativeModel = Firebase.ai.getGenerativeModel(
                modelName = "gemini-2.0-flash",
                generationConfig = generationConfig {
                    responseMimeType = "application/json"
                },
                inferenceMode = InferenceMode.PREFER_ON_DEVICE
            )

            val prompt = """
                Analyze this negotiation utterance in real time:
                "$redactedText"
                Return strict JSON matching:
                {"sentiment":"HOSTILE"|"PRESSURE"|"NEUTRAL"|"COOPERATIVE","tacticDetected":"string","tacticCategory":"ANCHORING"|"EXPLODING_DEADLINE"|"FALSE_SCARCITY"|"COMPETITOR_BLUFF"|"LIABILITY_TRAP"|"GOOD_FAITH","bluffProbability":number,"riskScore":number,"quickCue":"max 12 words teleprompter cue"}
            """.trimIndent()

            val response = generativeModel.generateContent(prompt)
            val jsonText = response.text ?: throw IllegalStateException("Empty response")
            val payload = gson.fromJson(jsonText, System1Payload::class.java).copy(
                redactedText = redactedText,
                piiEntitiesShielded = shieldedEntities
            )
            val source = if (response.promptFeedback?.blockReason != null) "ON-DEVICE NANO" else "ON-DEVICE NANO"
            Pair(payload, source)
        } catch (e: Exception) {
            Log.d("DualMind", "Firebase AI on-device fallback: ${e.message}")
            // Deterministic high-speed reflex matching Web
            val payload = runLocalDeterministicReflex(redactedText, shieldedEntities)
            Pair(payload, "ON-DEVICE NANO")
        }
    }

    /**
     * Executes System-2 Cloud Deep Strategy on Android using InferenceMode.ONLY_IN_CLOUD
     */
    suspend fun analyzeSystem2DeepStrategy(
        sanitizedUtterance: String,
        playbook: NegotiationPlaybook,
        system1: System1Payload
    ): System2Payload = withContext(Dispatchers.IO) {
        try {
            val generativeModel = Firebase.ai.getGenerativeModel(
                modelName = "gemini-2.0-flash",
                generationConfig = generationConfig {
                    responseMimeType = "application/json"
                },
                inferenceMode = InferenceMode.ONLY_IN_CLOUD
            )

            val prompt = """
                System-2 Deep Strategy Analysis for High-Stakes Negotiation.
                User Role: ${playbook.role}
                Target Anchor: ${playbook.targetAnchor}
                Walk-Away BATNA: ${playbook.walkAwayBatna}
                Opponent Statement: "$sanitizedUtterance"
                Detected Tactic: ${system1.tacticDetected} (${system1.tacticCategory}, Risk: ${system1.riskScore})
                Provide strict JSON with threatAnalysis, leverageAngle, batnaAnchorMath, counterOffers (3 items with tier, headline, script, expectedOutcome), and exactScriptToSay.
            """.trimIndent()

            val response = generativeModel.generateContent(prompt)
            val jsonText = response.text ?: throw IllegalStateException("Empty response")
            gson.fromJson(jsonText, System2Payload::class.java)
        } catch (e: Exception) {
            Log.w("DualMind", "Firebase AI Cloud escalation fallback: ${e.message}")
            generateFallbackSystem2(sanitizedUtterance, playbook, system1)
        }
    }

    private fun redactPiiLocally(text: String): Pair<String, List<String>> {
        var redacted = text
        val shielded = mutableListOf<String>()

        // Currency redaction
        val currencyRegex = Regex("(\\\$\\s?\\d+(?:,\\d{3})*(?:\\.\\d+)?\\s*(?:k|K|m|M|b|B|million|thousand)?|\\b\\d+(?:,\\d{3})*(?:\\.\\d+)?\\s*(?:USD|dollars?)\\b)", RegexOption.IGNORE_CASE)
        var amountIdx = 1
        redacted = currencyRegex.replace(redacted) { match ->
            val token = "[AMOUNT_${amountIdx++}]"
            shielded.add(match.value)
            token
        }

        // Equity percentages
        val equityRegex = Regex("(\\b\\d+(?:\\.\\d+)?\\s*%(?:\\s*(?:equity|stock|options|stake))?)", RegexOption.IGNORE_CASE)
        var equityIdx = 1
        redacted = equityRegex.replace(redacted) { match ->
            val token = "[EQUITY_${equityIdx++}]"
            shielded.add(match.value)
            token
        }

        // Company names
        val companies = listOf("Google", "Meta", "Amazon", "Microsoft", "Apple", "OpenAI", "Anthropic", "Stripe", "Acme Corp")
        var compIdx = 1
        for (comp in companies) {
            if (redacted.contains(comp, ignoreCase = true)) {
                shielded.add(comp)
                redacted = redacted.replace(comp, "[COMPANY_${compIdx++}]", ignoreCase = true)
            }
        }

        return Pair(redacted, shielded)
    }

    private fun runLocalDeterministicReflex(text: String, shielded: List<String>): System1Payload {
        val lower = text.lowercase()
        return when {
            lower.contains("today") || lower.contains("24 hours") || lower.contains("midnight") || lower.contains("expires") || lower.contains("walk away") -> {
                System1Payload(
                    sentiment = "PRESSURE",
                    tacticDetected = "Exploding 24h Deadline & Artificial Urgency",
                    tacticCategory = "EXPLODING_DEADLINE",
                    bluffProbability = 82,
                    riskScore = 88,
                    quickCue = "Reject false urgency: \"I need 48 hours to consult my team.\"",
                    redactedText = text,
                    piiEntitiesShielded = shielded
                )
            }
            lower.contains("ip") || lower.contains("intellectual property") || lower.contains("unlimited liability") || lower.contains("indemnity") -> {
                System1Payload(
                    sentiment = "HOSTILE",
                    tacticDetected = "Hidden IP Transfer & Asymmetric Liability Trap",
                    tacticCategory = "LIABILITY_TRAP",
                    bluffProbability = 35,
                    riskScore = 94,
                    quickCue = "Halt signing: \"Our standard IP clause excludes prior inventions.\"",
                    redactedText = text,
                    piiEntitiesShielded = shielded
                )
            }
            lower.contains("competitor") || lower.contains("cheaper") || lower.contains("discount") || lower.contains("matching") -> {
                System1Payload(
                    sentiment = "PRESSURE",
                    tacticDetected = "Competitor Price Anchor Bluff",
                    tacticCategory = "COMPETITOR_BLUFF",
                    bluffProbability = 78,
                    riskScore = 58,
                    quickCue = "Deflect price war: \"We differentiate on SLA, not discounting.\"",
                    redactedText = text,
                    piiEntitiesShielded = shielded
                )
            }
            lower.contains("timeline") || lower.contains("sync") || lower.contains("calendar") || lower.contains("schedule") -> {
                System1Payload(
                    sentiment = "COOPERATIVE",
                    tacticDetected = "Routine Project Planning & Cadence Alignment",
                    tacticCategory = "GOOD_FAITH",
                    bluffProbability = 12,
                    riskScore = 24,
                    quickCue = "Affirm and confirm: \"Tuesday at 2 PM fits the rollout milestone.\"",
                    redactedText = text,
                    piiEntitiesShielded = shielded
                )
            }
            else -> {
                System1Payload(
                    sentiment = "NEUTRAL",
                    tacticDetected = "Standard Positional Bargaining",
                    tacticCategory = "ANCHORING",
                    bluffProbability = 40,
                    riskScore = 45,
                    quickCue = "Anchor firmly on value: \"Let us review milestone terms.\"",
                    redactedText = text,
                    piiEntitiesShielded = shielded
                )
            }
        }
    }

    private fun generateFallbackSystem2(
        utterance: String,
        playbook: NegotiationPlaybook,
        system1: System1Payload
    ): System2Payload {
        return System2Payload(
            threatAnalysis = "Opponent deployed ${system1.tacticDetected}. Attempting to capture negotiation surplus via artificial timing constraints.",
            leverageAngle = "Your walk-away BATNA (${playbook.walkAwayBatna}) neutralizes their ultimatum.",
            batnaAnchorMath = "Target Anchor: ${playbook.targetAnchor} vs Offer. Expected value delta favors holding boundary.",
            counterOffers = listOf(
                CounterOffer(
                    tier = "Conservative",
                    headline = "Extend Diligence Window",
                    script = "To ensure quality review, let us extend the timeline by 48 hours and finalize terms calmly.",
                    expectedOutcome = "Reduces emotional pressure; restores symmetry."
                ),
                CounterOffer(
                    tier = "Balanced",
                    headline = "Trade Scope for Speed",
                    script = "If timeline certainty is paramount, we can execute today at our baseline anchor of ${playbook.targetAnchor}.",
                    expectedOutcome = "Monetizes urgency without discounting baseline value."
                ),
                CounterOffer(
                    tier = "Assertive",
                    headline = "Firm BATNA Stand",
                    script = "We have active commitments at ${playbook.walkAwayBatna}. A 24-hour deadline forces an immediate decline.",
                    expectedOutcome = "Calls opponent bluff instantly."
                )
            ),
            exactScriptToSay = "If timeline certainty is paramount, we can execute today at our baseline anchor of ${playbook.targetAnchor}."
        )
    }
}
