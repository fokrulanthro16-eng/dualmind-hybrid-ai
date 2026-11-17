# Contributing to DualMind

Thank you for your interest in contributing to **DualMind**! We welcome contributions from developers, researchers, and designers passionate about hybrid on-device/cloud AI architectures.

---

## Code of Conduct
We are committed to providing a welcoming, inclusive, and harassment-free environment for everyone. Please be respectful and constructive in all interactions.

---

## Getting Started

1. **Fork the Repository:**
   Click the Fork button at the top right of the [DualMind GitHub Repository](https://github.com/fokrulanthro16-eng/dualmind-hybrid-ai).
2. **Clone Your Fork:**
   ```bash
   git clone https://github.com/<your-username>/dualmind-hybrid-ai.git
   cd dualmind-hybrid-ai
   ```
3. **Set Up the Next.js Web App:**
   ```bash
   cd web
   cp .env.example .env.local
   npm install
   npm run dev
   ```
4. **Set Up the Android Companion App:**
   - Open `android/` in Android Studio Ladybug (2024.2+).
   - Sync Gradle project and run on an Android 8.0+ (API 26+) emulator or physical device.

---

## Development & Testing Standards

All pull requests must pass our automated verification gates:

### Web HUD (`web/`)
- **TypeScript:** Must pass type checking with zero errors:
  ```bash
  cd web && npx tsc --noEmit
  ```
- **Linting:** Must pass ESLint with zero warnings or errors:
  ```bash
  cd web && npm run lint
  ```
- **Static Export:** Must compile cleanly:
  ```bash
  cd web && npm run build
  ```

### Strict Hackathon Compliance Rules
- **No Unauthorized AI SDKs:** Never import `@google/generative-ai`, `@google/genai`, or raw REST Gemini clients. All AI features must use official **Firebase AI Logic** (`firebase/ai` or `com.google.firebase:firebase-ai`).
- **No Hardcoded Keys:** Never commit API keys, service account JSON files, or App Check debug tokens to the repository.

---

## Submitting Pull Requests

1. Create a feature branch: `git checkout -b feature/your-feature-name`.
2. Commit changes using Conventional Commits (e.g., `feat: add tactic classifier`, `fix: handle offline sync edge case`).
3. Push to your fork: `git push origin feature/your-feature-name`.
4. Open a Pull Request against the `main` branch with a clear description and screenshots/GIFs demonstrating changes.
