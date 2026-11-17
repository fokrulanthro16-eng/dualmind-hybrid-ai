export type SentimentType = 'HOSTILE' | 'PRESSURE' | 'NEUTRAL' | 'COOPERATIVE';

export type TacticCategory =
  | 'ANCHORING'
  | 'EXPLODING_DEADLINE'
  | 'FALSE_SCARCITY'
  | 'COMPETITOR_BLUFF'
  | 'LIABILITY_TRAP'
  | 'GOOD_FAITH';

export interface System1Result {
  sentiment: SentimentType;
  tacticDetected: string;
  tacticCategory: TacticCategory;
  bluffProbability: number; // 0 - 100
  riskScore: number;        // 0 - 100
  quickCue: string;         // Max 12 words teleprompter ready
  redactedText: string;
  piiEntitiesShielded: string[];
}

export type CounterOfferTier = 'Conservative' | 'Balanced' | 'Assertive';

export interface CounterOffer {
  tier: CounterOfferTier;
  headline: string;
  script: string;
  expectedOutcome: string;
}

export interface System2Result {
  threatAnalysis: string;
  leverageAngle: string;
  batnaAnchorMath: string;
  counterOffers: CounterOffer[];
  exactScriptToSay: string;
}

export type ExecutionSource =
  | 'ON-DEVICE NANO'
  | 'CLOUD GEMINI (FALLBACK)'
  | 'CLOUD GEMINI (ESCALATED)';

export interface Turn {
  id: string;
  timestamp: number;
  utterance: string;
  rawUtterance: string;
  system1: System1Result;
  system2?: System2Result;
  executionSource: ExecutionSource;
  latencyMs: number;
  offline: boolean;
  piiShieldedCount: number;
}

export interface NegotiationPlaybook {
  role: string;
  targetAnchor: string;
  walkAwayBatna: string;
}

export interface SessionData {
  id: string;
  sessionCode: string;
  createdAt: number;
  escalationThreshold: number;
  playbook: NegotiationPlaybook;
}

export interface TraceItem {
  id: string;
  timestamp: string;
  system: 'S1' | 'S2';
  requestedMode: 'PREFER_ON_DEVICE' | 'ONLY_IN_CLOUD';
  actualExecutionSource: ExecutionSource;
  latencyMs: number;
  piiRedactedCount: number;
  appCheckActive: boolean;
  rawJson: string;
}
