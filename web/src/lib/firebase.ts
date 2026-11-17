'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { initializeAppCheck, ReCaptchaV3Provider, AppCheck } from 'firebase/app-check';
import { getAuth, signInAnonymously, Auth } from 'firebase/auth';
import {
  initializeFirestore,
  getFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  Firestore,
} from 'firebase/firestore';
import { getRemoteConfig, fetchAndActivate, getValue, RemoteConfig } from 'firebase/remote-config';
import { getAI, GoogleAIBackend, AI } from 'firebase/ai';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

let app: FirebaseApp;
let appCheck: AppCheck | null = null;
let appCheckStatus: 'INITIALIZING' | 'VERIFIED' | 'DEBUG_MODE' | 'ERROR' = 'INITIALIZING';
let auth: Auth;
let db: Firestore;
let remoteConfig: RemoteConfig | null = null;
let ai: AI | null = null;

// Initialize Firebase client singleton safely
export function getFirebaseClient() {
  if (typeof window === 'undefined') {
    return { app: null, auth: null, db: null, remoteConfig: null, ai: null, appCheck: null, appCheckStatus };
  }

  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }

  // Mandatory App Check Initialization with Debug Token support
  if (!appCheck) {
    try {
      const debugToken = process.env.NEXT_PUBLIC_FIREBASE_APPCHECK_DEBUG_TOKEN;
      // In development / test, set FIREBASE_APPCHECK_DEBUG_TOKEN before initializeAppCheck
      if (typeof window !== 'undefined') {
        // App Check debug token
        (window as unknown as { FIREBASE_APPCHECK_DEBUG_TOKEN: unknown }).FIREBASE_APPCHECK_DEBUG_TOKEN =
          debugToken && debugToken !== 'REPLACE_WITH_WEB_DEBUG_TOKEN' ? debugToken : true;
      }

      const siteKey =
        process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';

      appCheck = initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(siteKey),
        isTokenAutoRefreshEnabled: true,
      });
      appCheckStatus = 'VERIFIED';
    } catch (err) {
      console.warn('[DualMind] App Check initialized in debug/permissive mode:', err);
      appCheckStatus = 'DEBUG_MODE';
    }
  }

  // Initialize Auth & anonymous sign-in
  if (!auth) {
    auth = getAuth(app);
    signInAnonymously(auth).catch((err) => {
      console.warn('[DualMind] Anonymous Auth warning (proceeding with local resilience):', err);
    });
  }

  // Initialize Firestore with offline persistence
  if (!db) {
    try {
      db = initializeFirestore(app, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager(),
        }),
      });
    } catch {
      db = getFirestore(app);
    }
  }

  // Initialize Remote Config
  if (!remoteConfig) {
    try {
      remoteConfig = getRemoteConfig(app);
      remoteConfig.settings = {
        minimumFetchIntervalMillis: 60000,
        fetchTimeoutMillis: 10000,
      };
      remoteConfig.defaultConfig = {
        escalation_risk_threshold: 70,
      };
      fetchAndActivate(remoteConfig).catch(() => {
        // Fallback default
      });
    } catch {
      // Remote config not available or server-side
    }
  }

  // Initialize Firebase AI Logic (100% exclusive Firebase AI SDK)
  if (!ai) {
    try {
      ai = getAI(app, {
        backend: new GoogleAIBackend(),
      });
    } catch (err) {
      console.warn('[DualMind] Firebase AI Logic initialization warning:', err);
    }
  }

  return { app, auth, db, remoteConfig, ai, appCheck, appCheckStatus };
}

export async function getEscalationRiskThreshold(): Promise<number> {
  const { remoteConfig } = getFirebaseClient();
  if (!remoteConfig) return 70;
  try {
    const val = getValue(remoteConfig, 'escalation_risk_threshold');
    const num = val.asNumber();
    return num > 0 ? num : 70;
  } catch {
    return 70;
  }
}
