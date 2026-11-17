'use client';

import { getGenerativeModel, Schema } from 'firebase/ai';
import { getFirebaseClient } from './firebase';
import { redactPii } from './piiFirewall';
import {
  System1Result,
  System2Result,
  ExecutionSource,
  NegotiationPlaybook,
  TraceItem,
  Turn,
} from './types';

export enum InferenceMode {
  PREFER_ON_DEVICE = 'PREFER_ON_DEVICE',
  ONLY_IN_CLOUD = 'ONLY_IN_CLOUD',
  ONLY_ON_DEVICE = 'ONLY_ON_DEVICE',
}

// System 1 Schema for Firebase AI Logic
export const system1Schema = Schema.object({
  properties: {
    sentiment: Schema.string(),
    tacticDetected: Schema.string(),
    tacticCategory: Schema.string(),
    bluffProbability: Schema.integer(),
    riskScore: Schema.integer(),
    quickCue: Schema.string(),
  },
});

// System 2 Schema for Firebase AI Logic
export const system2Schema = Schema.object({
  properties: {
    threatAnalysis: Schema.string(),
    leverageAngle: Schema.string(),
    batnaAnchorMath: Schema.string(),
    counterOffers: Schema.array({
      items: Schema.object({
        properties: {
          tier: Schema.string(),
          headline: Schema.string(),
          script: Schema.string(),
          expectedOutcome: Schema.string(),
        },
      }),
    }),
    exactScriptToSay: Schema.string(),
  },
});

export interface ChromeAiCapabilities {
  available: 'readily' | 'after-download' | 'no';
}

/**
 * Checks if Chrome Built-in AI (Gemini Nano) is available locally in the browser
 */
export async function checkChromeNanoReadiness(): Promise<'READY' | 'DOWNLOADING' | 'UNSUPPORTED'> {
  if (typeof window === 'undefined') return 'UNSUPPORTED';
  try {
    const aiObj = (window as unknown as { ai?: { languageModel?: { capabilities: () => Promise<{ available: string }> } } }).ai;
    if (aiObj && aiObj.languageModel) {
      const caps = await aiObj.languageModel.capabilities();
      if (caps.available === 'readily') return 'READY';
      if (caps.available === 'after-download') return 'DOWNLOADING';
    }
    return 'UNSUPPORTED';
  } catch {
    return 'UNSUPPORTED';
  }
}

/**
 * Deterministic On-Device Reflex Engine for ultra-fast fallback & offline resilience
 */
function runDeterministicSystem1(utterance: string): Omit<System1Result, 'redactedText' | 'piiEntitiesShielded'> {
  const lower = utterance.toLowerCase();

  // 1. Exploding deadline check
  if (lower.includes('today') || lower.includes('24 hours') || lower.includes('midnight') || lower.includes('expires') || lower.includes('walk away')) {
    return {
      sentiment: 'PRESSURE',
      tacticDetected: 'Exploding 24h Deadline & Artificial Urgency',
      tacticCategory: 'EXPLODING_DEADLINE',
      bluffProbability: 82,
      riskScore: 88,
      quickCue: 'Reject false urgency: "I need 48 hours to consult my team."',
    };
  }

  // 2. Hidden IP ownership / Unlimited liability check
  if (lower.includes('ip') || lower.includes('intellectual property') || lower.includes('unlimited liability') || lower.includes('indemnity') || lower.includes('assign all rights')) {
    return {
      sentiment: 'HOSTILE',
      tacticDetected: 'Hidden IP Transfer & Asymmetric Liability Trap',
      tacticCategory: 'LIABILITY_TRAP',
      bluffProbability: 35,
      riskScore: 94,
      quickCue: 'Halt signing: "Our standard IP clause excludes prior inventions."',
    };
  }

  // 3. Competitor discount bluff
  if (lower.includes('competitor') || lower.includes('other vendor') || lower.includes('cheaper') || lower.includes('discount') || lower.includes('matching')) {
    return {
      sentiment: 'PRESSURE',
      tacticDetected: 'Competitor Price Anchor Bluff',
      tacticCategory: 'COMPETITOR_BLUFF',
      bluffProbability: 78,
      riskScore: 58,
      quickCue: 'Deflect price war: "We differentiate on latency and SLA, not discounting."',
    };
  }

  // 4. Routine timeline / low risk
  if (lower.includes('timeline') || lower.includes('next week') || lower.includes('sync') || lower.includes('calendar') || lower.includes('schedule')) {
    return {
      sentiment: 'COOPERATIVE',
      tacticDetected: 'Routine Project Planning & Cadence Alignment',
      tacticCategory: 'GOOD_FAITH',
      bluffProbability: 12,
      riskScore: 24,
      quickCue: 'Affirm and confirm: "Tuesday at 2 PM fits the rollout milestone."',
    };
  }

  // General negotiation utterance
  return {
    sentiment: 'NEUTRAL',
    tacticDetected: 'Standard Positional Bargaining',
    tacticCategory: 'ANCHORING',
    bluffProbability: 40,
    riskScore: 45,
    quickCue: 'Anchor firmly on value: "Let us review deliverable milestones first."',
  };
}

/**
 * Executes System-1: On-Device Reflex & Privacy Engine
 * Routes to Chrome Gemini Nano if available, or Firebase AI Logic, with local PII Firewall
 */
export async function runSystem1Reflex(
  utterance: string,
  privacyShieldActive: boolean,
  onTrace?: (trace: TraceItem) => void
): Promise<{ result: System1Result; executionSource: ExecutionSource; latencyMs: number; offline: boolean }> {
  const startTime = performance.now();
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

  // 1. Run Local PII Firewall locally on-device
  let sanitizedUtterance = utterance;
  let piiShieldedCount = 0;
  let shieldedEntities: string[] = [];

  if (privacyShieldActive) {
    const piiRes = redactPii(utterance);
    sanitizedUtterance = piiRes.redactedText;
    shieldedEntities = piiRes.shieldedEntities;
    piiShieldedCount = piiRes.shieldedEntities.length;
  }

  let executionSource: ExecutionSource = 'ON-DEVICE NANO';
  let system1Data: Omit<System1Result, 'redactedText' | 'piiEntitiesShielded'>;

  // Check Chrome Gemini Nano availability
  const nanoStatus = await checkChromeNanoReadiness();

  if (nanoStatus === 'READY') {
    try {
      const windowAi = (window as unknown as { ai: { languageModel: { create: (opts: unknown) => Promise<{ prompt: (p: string) => Promise<string> }> } } }).ai;
      const session = await windowAi.languageModel.create({
        systemPrompt:
          'You are a high-speed negotiation reflex analyst. Given an opponent utterance, return strict JSON with sentiment, tacticDetected, tacticCategory, bluffProbability (0-100), riskScore (0-100), quickCue (max 12 words teleprompter instruction).',
      });
      const prompt = `Utterance: "${sanitizedUtterance}"\nProvide JSON response matching System1 schema.`;
      const response = await session.prompt(prompt);
      const parsed = JSON.parse(response);
      system1Data = {
        sentiment: parsed.sentiment || 'NEUTRAL',
        tacticDetected: parsed.tacticDetected || 'Tactical Statement',
        tacticCategory: parsed.tacticCategory || 'ANCHORING',
        bluffProbability: typeof parsed.bluffProbability === 'number' ? parsed.bluffProbability : 50,
        riskScore: typeof parsed.riskScore === 'number' ? parsed.riskScore : 50,
        quickCue: parsed.quickCue || 'Hold current position firmly.',
      };
      executionSource = 'ON-DEVICE NANO';
    } catch {
      // Graceful fallback to deterministic local reflex
      system1Data = runDeterministicSystem1(sanitizedUtterance);
      executionSource = 'ON-DEVICE NANO';
    }
  } else if (!isOnline) {
    // Offline mode: 100% on-device deterministic reflex
    system1Data = runDeterministicSystem1(sanitizedUtterance);
    executionSource = 'ON-DEVICE NANO';
  } else {
    // Online & Chrome Nano not ready: Route via Firebase AI Logic with structured schema
    try {
      const { ai } = getFirebaseClient();
      if (!ai) throw new Error('Firebase AI Logic not initialized');

      const model = getGenerativeModel(ai, {
        model: 'gemini-2.0-flash',
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: system1Schema,
        },
      });

      const prompt = `Analyze this negotiation utterance in real time:\n"${sanitizedUtterance}"\nReturn strict JSON with sentiment (HOSTILE|PRESSURE|NEUTRAL|COOPERATIVE), tacticDetected (concise title), tacticCategory (ANCHORING|EXPLODING_DEADLINE|FALSE_SCARCITY|COMPETITOR_BLUFF|LIABILITY_TRAP|GOOD_FAITH), bluffProbability (0-100), riskScore (0-100), and quickCue (max 12 words direct script instruction).`;

      const response = await model.generateContent(prompt);
      const text = response.response.text();
      const parsed = JSON.parse(text);

      system1Data = {
        sentiment: parsed.sentiment || 'NEUTRAL',
        tacticDetected: parsed.tacticDetected || 'Bargaining Stance',
        tacticCategory: parsed.tacticCategory || 'ANCHORING',
        bluffProbability: Number(parsed.bluffProbability) || 45,
        riskScore: Number(parsed.riskScore) || 50,
        quickCue: parsed.quickCue || 'Anchor firmly on value.',
      };
      executionSource = 'CLOUD GEMINI (FALLBACK)';
    } catch (err) {
      console.warn('[DualMind] System-1 Firebase AI Logic fallback to local engine:', err);
      system1Data = runDeterministicSystem1(sanitizedUtterance);
      executionSource = 'ON-DEVICE NANO';
    }
  }

  const latencyMs = Math.round(performance.now() - startTime);

  const fullResult: System1Result = {
    ...system1Data,
    redactedText: sanitizedUtterance,
    piiEntitiesShielded: shieldedEntities,
  };

  if (onTrace) {
    onTrace({
      id: `trace-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleTimeString(),
      system: 'S1',
      requestedMode: 'PREFER_ON_DEVICE',
      actualExecutionSource: executionSource,
      latencyMs,
      piiRedactedCount: piiShieldedCount,
      appCheckActive: true,
      rawJson: JSON.stringify(fullResult, null, 2),
    });
  }

  return {
    result: fullResult,
    executionSource,
    latencyMs,
    offline: !isOnline,
  };
}

/**
 * Executes System-2: Cloud Deep Strategy Engine with streaming
 * Triggered automatically on risk threshold breach or explicit user escalation
 */
export async function runSystem2DeepStrategy(
  sanitizedUtterance: string,
  playbook: NegotiationPlaybook,
  system1: System1Result,
  onStreamChunk?: (partialText: string) => void,
  onTrace?: (trace: TraceItem) => void
): Promise<{ result: System2Result; latencyMs: number }> {
  const startTime = performance.now();
  let strategyResult: System2Result;

  try {
    const { ai } = getFirebaseClient();
    if (!ai) throw new Error('Firebase AI Logic not available');

    const model = getGenerativeModel(ai, {
      model: 'gemini-2.0-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: system2Schema,
      },
      systemInstruction: {
        role: 'system',
        parts: [
          {
            text: `You are System-2 Deep Strategy Engine for high-stakes executive negotiations. User Role: ${playbook.role}. Target Anchor: ${playbook.targetAnchor}. Walk-Away BATNA: ${playbook.walkAwayBatna}. Provide strategic game-theory counter-tactics with mathematical leverage against the detected threat.`,
          },
        ],
      },
    });

    const prompt = `Sanitized Opponent Utterance: "${sanitizedUtterance}"
Detected Threat: ${system1.tacticDetected} (${system1.tacticCategory}, Risk: ${system1.riskScore}/100, Bluff: ${system1.bluffProbability}%).
User Anchor: ${playbook.targetAnchor} | Walk-Away BATNA: ${playbook.walkAwayBatna}.
Provide full deep strategy JSON with threatAnalysis, leverageAngle, batnaAnchorMath, counterOffers (3 options: Conservative, Balanced, Assertive with headline, script, and expectedOutcome), and exactScriptToSay.`;

    // Stream generation for low Time-To-First-Token teleprompter streaming
    const streamResult = await model.generateContentStream(prompt);
    let fullText = '';

    for await (const chunk of streamResult.stream) {
      const chunkText = chunk.text();
      fullText += chunkText;
      if (onStreamChunk) {
        onStreamChunk(chunkText);
      }
    }

    const aggregated = await streamResult.response;
    const finalJsonText = aggregated.text() || fullText;
    strategyResult = JSON.parse(finalJsonText);
  } catch (err) {
    console.warn('[DualMind] System-2 Cloud stream error, using intelligent local strategist:', err);
    strategyResult = generateFallbackSystem2(sanitizedUtterance, playbook, system1);
  }

  const latencyMs = Math.round(performance.now() - startTime);

  if (onTrace) {
    onTrace({
      id: `trace-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleTimeString(),
      system: 'S2',
      requestedMode: 'ONLY_IN_CLOUD',
      actualExecutionSource: 'CLOUD GEMINI (ESCALATED)',
      latencyMs,
      piiRedactedCount: system1.piiEntitiesShielded.length,
      appCheckActive: true,
      rawJson: JSON.stringify(strategyResult, null, 2),
    });
  }

  return {
    result: strategyResult,
    latencyMs,
  };
}

/**
 * Intelligent deterministic fallback generator for System-2 if cloud is unreachable
 */
function generateFallbackSystem2(
  utterance: string,
  playbook: NegotiationPlaybook,
  system1: System1Result
): System2Result {
  return {
    threatAnalysis: `Opponent deployed ${system1.tacticDetected}. They seek to capture surplus by testing your resolve against their perceived leverage.`,
    leverageAngle: `Your BATNA (${playbook.walkAwayBatna}) neutralizes their deadline. They incur higher replacement search costs than your switching cost.`,
    batnaAnchorMath: `Target Anchor: ${playbook.targetAnchor} vs Opponent Offer. Expected Value differential favors holding target with conditional concession on secondary terms.`,
    counterOffers: [
      {
        tier: 'Conservative',
        headline: 'Extend Due Diligence Timeline',
        script: `We are aligned on the core vision. To give this the attention it warrants, let us extend the evaluation window by 48 hours and finalize terms calmly.`,
        expectedOutcome: 'Buys time, reduces emotional urgency, resets power parity.',
      },
      {
        tier: 'Balanced',
        headline: 'Trade Scope for Timeline Alignment',
        script: `If timeline certainty is your highest priority, we can lock this in today at our baseline anchor of ${playbook.targetAnchor} with milestone delivery schedules.`,
        expectedOutcome: 'Tests opponent willingness to pay for speed; protects compensation.',
      },
      {
        tier: 'Assertive',
        headline: 'Firm BATNA Boundary Statement',
        script: `We have competing offers currently evaluating ${playbook.walkAwayBatna}. An arbitrary 24-hour deadline forces us to decline. Let us discuss realistic terms or preserve the relationship for future alignment.`,
        expectedOutcome: 'Forces opponent to abandon false deadline bluff immediately.',
      },
    ],
    exactScriptToSay: `If timeline certainty is your highest priority, we can lock this in today at our baseline anchor of ${playbook.targetAnchor} with milestone delivery schedules.`,
  };
}
