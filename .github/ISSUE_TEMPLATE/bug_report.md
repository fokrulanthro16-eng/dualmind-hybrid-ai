---
name: Bug Report
about: Create a report to help improve DualMind Hybrid AI
title: "[BUG] "
labels: ["bug", "triage"]
assignees: ""
---

### Bug Description
A clear and concise description of what the bug is.

### Platform / Environment
- **Platform**: [e.g. Web Browser / Android Companion]
- **Browser & Version** (if Web): [e.g. Chrome 134, Edge 134, Firefox 135]
- **Android Device & OS** (if Android): [e.g. Pixel 8 Pro, Android 15]
- **Inference Mode Tested**: [e.g. System-1 On-Device (Gemini Nano) / System-2 Cloud (Gemini 2.5 Flash)]

### Steps to Reproduce
1. Navigate to '...'
2. Trigger negotiation scenario '...'
3. Enter transcript turn '...'
4. Observe risk score calculation or counter-offer generation

### Expected Behavior
A clear and concise description of what you expected to happen.

### Actual Behavior
What actually happened (including any UI error states or telemetry indicators).

### Telemetry & Inspection Logs
Paste any relevant output from the **Inspect AI Logic** drawer:
- **App Check Status**: [Verified / Failed]
- **Escalation Reason**: [Threshold Exceeded / High Stakes Keyword / Manual Override]
- **Latency Breakdown**:
  - System-1 On-Device Latency: `___ ms`
  - Local PII Sanitization Latency: `___ ms`
  - System-2 Cloud Escalation Latency: `___ ms`
- **Masked Entities Detected**: [e.g. `<SALARY_NUM>`, `<PERCENT_EQUITY>`, `<COMPANY_NAME>`]

### Screenshots / Screen Recording
If applicable, attach screenshots or short clips to help explain the problem.

### Additional Context
Add any other context about the problem here (e.g., custom Remote Config threshold, offline sync state).
