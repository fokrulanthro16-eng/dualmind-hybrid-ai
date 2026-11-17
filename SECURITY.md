# DualMind Security & Privacy Policy

DualMind is engineered from the ground up on the principle of **Zero-Knowledge Tactical Privacy**. In high-stakes executive negotiations, salary discussions, and enterprise contract drafting, accidental leakage of financial figures, equity stakes, or strategic walk-away positions can cause severe financial and competitive harm.

---

## 1. Threat Model & Privacy-by-Design Guarantees

| Attack Surface / Threat Vector | Potential Impact | DualMind Architectural Mitigation |
|---|---|---|
| **Eavesdropping on Cloud API Calls** | Interception of confidential salary or valuation figures. | **Local PII Privacy Firewall:** Dollar values, company names, and equity stakes are tokenized locally (`$185k` → `[AMOUNT_1]`) on-device before any escalation touches the network. |
| **Network Interruption / DoS** | Teleprompter freezes during a live high-pressure turn. | **System-1 Hybrid Isolation:** System-1 runs on-device (Chrome Gemini Nano / Android Nano) in <150ms with zero network dependence; IndexedDB offline persistence buffers turns locally. |
| **Abuse & Replay Attacks** | Unauthorized actors exhausting Gemini API quota or injecting spoofed turns. | **Firebase App Check:** Every request to Firebase AI Logic and Cloud Firestore requires a valid App Check token verified via Google reCAPTCHA v3 (Web) or Play Integrity (Android). |
| **Unauthorized Session Tampering** | Third party intercepting another negotiator's session. | **Session-Scoped Cryptographic Codes:** 6-character entropy codes coupled with Anonymous Firebase Auth session isolation prevent cross-tenant access. |

---

## 2. API Key & Client Secret Posture

- **No Hardcoded Gemini API Keys:** DualMind strictly forbids raw `generativelanguage.googleapis.com` fetches or embedded API keys. All generative AI routes through official **Firebase AI Logic SDKs** (`firebase/ai` and `com.google.firebase:firebase-ai`).
- **Sanitized Client Configurations:** Public Firebase configuration parameters (`apiKey`, `appId`, `projectId`) in `web/.env.example` serve solely as project routing identifiers. All sensitive backend operations require App Check cryptographic attestation.
- **Git Hygiene:** Local configuration secrets (`web/.env.local`, `google-services.json`, debug tokens) are strictly excluded via `.gitignore`.

---

## 3. Local PII Redaction Verification

Negotiators can audit the live entity redaction pipeline in real time:
1. The **PII Shield Diff Pill** directly surfaces entities redacted from the active turn.
2. The **Firebase AI Logic Inspector** drawer logs the exact sanitized payload dispatched to System-2, allowing users to verify that raw amounts and counterpart names never left the device.

---

## 4. Responsible Vulnerability Disclosure

If you discover a security vulnerability or privacy bug within DualMind, please disclose it responsibly. Do not open public GitHub issues for security vulnerabilities.

Please contact the project maintainer directly:
- **Security Lead:** Fokrul Islam
- **Email:** `fokrulanthro16@gmail.com`
- **Response SLA:** Initial acknowledgment within 24 hours; patch and remediation report within 72 hours.

We value the security and privacy research community and appreciate responsible disclosure.
