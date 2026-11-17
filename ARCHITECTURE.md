# DualMind Technical Architecture Guide

DualMind is an enterprise-grade, multi-platform **Hybrid AI Tactical Negotiation Teleprompter** architected for high-stakes dealmaking, executive salary negotiations, and enterprise procurement. It implements a true **Dual-Process Cognitive Architecture** grounded in Daniel Kahneman's behavioral economics theory, utilizing **100% Firebase AI Logic** across Next.js (Web) and Jetpack Compose (Android).

---

## 1. High-Level Architectural Overview

DualMind decouples real-time conversational processing into two symbiotic cognitive pipelines:

```
[Opponent Utterance: Mic / Text / Event]
                     │
                     ▼
  ┌─────────────────────────────────────────────────────────┐
  │         Deterministic Local PII Privacy Firewall         │
  │     (Regex Tokenizer: Currency, Equity, Names, Cos)     │
  └──────────────────────────┬──────────────────────────────┘
                             │ Local Tokenized Utterance
                             ▼
  ┌─────────────────────────────────────────────────────────┐
  │     System-1: On-Device Reflex & Privacy Engine         │
  │       (Gemini Nano via InferenceMode.PREFER_ON_DEVICE)   │
  │      - Latency: <150ms | Functional 100% Offline         │
  │      - Output: Sentiment, Tactic, Bluff %, Risk (0-100) │
  │      - Teleprompter Reflex Quick Cue (<12 words)        │
  └──────────────────────────┬──────────────────────────────┘
                             │
                             ▼
                 [Risk Score >= Threshold?]
                (Firebase Remote Config: 70)
                   /                    \
         NO (<= 70)                      YES (> 70)
            │                                 │
            ▼                                 ▼
┌───────────────────────────┐   ┌───────────────────────────┐
│     Stay On-Device        │   │    System-2 Escalation    │
│  (Zero Cloud Calls Made)  │   │   (Cloud Gemini Stream)   │
│  - Lock reflex cue to HUD │   │  - App Check Token Check  │
│  - Queue turn in cache    │   │  - Deep threat breakdown  │
└───────────┬───────────────┘   │  - BATNA math synthesis   │
            │                   │  - 3-tier counter-offers  │
            │                   └─────────────┬─────────────┘
            │                                 │
            └────────────────┬────────────────┘
                             │
                             ▼
  ┌─────────────────────────────────────────────────────────┐
  │       Cloud Firestore Real-Time Session Bus             │
  │         (persistentLocalCache Tab Persistence)          │
  └──────────────────────────┬──────────────────────────────┘
                             │ WebSockets / Offline Cache
                             ▼
  ┌─────────────────────────────────────────────────────────┐
  │     Android Companion Pocket HUD (Jetpack Compose)      │
  │  - FLAG_KEEP_SCREEN_ON                                  │
  │  - Haptic Alert (VibrationEffect) on Threshold Breach   │
  │  - Glanceable 4-Foot Teleprompter Spoken Script         │
  │  - Standalone Offline Quick-Analyze Mode                │
  └─────────────────────────────────────────────────────────┘
```

---

## 2. Kahneman Dual-Process Cognitive Engine

### System-1 — On-Device Reflex Engine (Gemini Nano)
- **Role:** Instantaneous, subconscious reflex evaluation of opponent psychological maneuvers.
- **Inference Mode:** `InferenceMode.PREFER_ON_DEVICE` via Firebase AI Logic (`firebase/ai` on Web, `com.google.firebase:firebase-ai` on Android).
- **Runtime Environment:** Runs in-browser via Chrome Built-in AI (`window.ai` Prompt API) and Android on-device Gemini Nano hardware acceleration.
- **Performance:** Sub-150ms wall-clock latency with zero network bandwidth consumption.
- **Strict Output Schema:**
  ```typescript
  interface System1Result {
    sentiment: "HOSTILE" | "PRESSURE" | "NEUTRAL" | "COOPERATIVE";
    tacticDetected: string;
    tacticCategory: "ANCHORING" | "EXPLODING_DEADLINE" | "FALSE_SCARCITY" | "COMPETITOR_BLUFF" | "LIABILITY_TRAP" | "GOOD_FAITH";
    bluffProbability: number; // 0 - 100
    riskScore: number;        // 0 - 100
    quickCue: string;         // Max 12 words teleprompter instruction
    redactedText: string;
    piiEntitiesShielded: string[];
  }
  ```

### System-2 — Cloud Deep Strategy Engine (Cloud Gemini 2.0 Flash)
- **Role:** Deliberative, high-dimensional game-theoretic calculation and mathematical counter-offer generation.
- **Inference Mode:** `InferenceMode.ONLY_IN_CLOUD` via Firebase AI Logic with token streaming.
- **Trigger Condition:** Breaching the dynamic `escalation_risk_threshold` (default `70`, controlled via Firebase Remote Config) OR manual negotiator escalation.
- **Streaming Pipeline:** Implements `model.generateContentStream()` for minimal Time-To-First-Token (TTFT) teleprompter display.
- **Strategic Payload:**
  ```typescript
  interface System2Result {
    threatAnalysis: string;
    leverageAngle: string;
    batnaAnchorMath: string;
    counterOffers: Array<{
      tier: "Conservative" | "Balanced" | "Assertive";
      headline: string;
      script: string;
      expectedOutcome: string;
    }>;
    exactScriptToSay: string;
  }
  ```

---

## 3. Deterministic Local PII Privacy Firewall

Confidential negotiation figures must never touch third-party servers. DualMind enforces a zero-leakage **Local PII Firewall** that runs client-side prior to cloud escalation:

1. **Entity Detection & Replacement:**
   - **Currency & Valuations:** Regular expressions detect diverse notations (`$185k`, `$240,000`, `€150,000`, `2.5M USD`) and substitute them with sequential tokens `[AMOUNT_1]`, `[AMOUNT_2]`.
   - **Equity & Stock Grants:** Percentages linked with ownership terms (`0.15% equity`, `2.5% options`) map to `[EQUITY_1]`.
   - **Counterparty & Competitor Entities:** Enterprise names (`Google`, `Meta`, `Acme Corp`) map to `[COMPANY_1]`.
   - **Executive Identities:** Executive titles and names map to `[PERSON_1]`.
2. **Transparent Diff Pill:** A live UI element surfaces all shielded tokens on-device so negotiators have continuous visibility into local isolation.
3. **De-tokenization on Display:** When System-2 returns strategic scripts containing symbolic tokens, the client-side session engine re-hydrates them for local viewing without cloud revelation.

---

## 4. Security Architecture & Attestation

### Firebase App Check
Every call to Firebase backend resources (AI Logic, Firestore, Remote Config) is attested against fraud and tampering:
- **Web Attestation:** `initializeAppCheck(app, { provider: new ReCaptchaV3Provider(siteKey), isTokenAutoRefreshEnabled: true })`. Supports local development via `self.FIREBASE_APPCHECK_DEBUG_TOKEN`.
- **Android Attestation:** `PlayIntegrityAppCheckProviderFactory` for production release builds; `DebugAppCheckProviderFactory` for local test verification.

### Firebase Authentication (Anonymous Session Auth)
- Allows zero-friction guest access without requiring users to disclose identity during high-stakes calls.
- Enforces scoped write permissions defined in `firestore.rules`:
  ```javascript
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      function isAuthenticated() {
        return request.auth != null;
      }
      match /sessions/{sessionId} {
        allow read, write: if isAuthenticated();
        match /turns/{turnId} {
          allow read: if isAuthenticated();
          allow create, update: if isAuthenticated() 
            && request.resource.data.keys().hasAll(['timestamp', 'utterance', 'system1'])
            && request.resource.data.utterance is string;
        }
      }
    }
  }
  ```

---

## 5. Offline Persistence & Multi-Platform Real-Time Sync

### Web Offline Cache
Initialized with multi-tab persistent cache:
```typescript
initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});
```
When network connectivity is interrupted (or simulated via the UI switch), System-1 reflexes and local turn recording continue without disruption. Changes queue locally in IndexedDB and reconcile seamlessly upon reconnection.

### Android Companion Pocket HUD (`com.dualmind.hud`)
- Built natively using **Jetpack Compose + Material 3**.
- Pairs with any active web session via a 6-character pairing code (`DM-XXXX`) or QR code deep link (`dualmind://join/DM-XXXX`).
- Listens to snapshot flows on `sessions/{sessionId}/turns`.
- Fires a hardware haptic pulse (`VibrationEffect`) whenever an incoming turn exceeds the Remote Config risk threshold.
- Sets `FLAG_KEEP_SCREEN_ON` to prevent device sleep during live executive meetings.
- Includes a standalone on-device analysis pipeline matching the web JSON schema, allowing 100% offline companion usage without a paired browser.
