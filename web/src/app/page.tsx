'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { TelemetryBar } from '../components/TelemetryBar';
import { PlaybookBar } from '../components/PlaybookBar';
import { InstantDemoDeck } from '../components/InstantDemoDeck';
import { System1ReflexPane } from '../components/System1ReflexPane';
import { System2StrategyPane } from '../components/System2StrategyPane';
import { TimelineDebrief } from '../components/TimelineDebrief';
import { AiLogicInspector } from '../components/AiLogicInspector';
import { NanoReadinessGuide } from '../components/NanoReadinessGuide';
import {
  Turn,
  NegotiationPlaybook,
  TraceItem,
  ExecutionSource,
  System1Result,
  System2Result,
} from '../lib/types';
import {
  runSystem1Reflex,
  runSystem2DeepStrategy,
  checkChromeNanoReadiness,
} from '../lib/hybridRouter';
import {
  getFirebaseClient,
  getEscalationRiskThreshold,
} from '../lib/firebase';
import {
  generateSessionCode,
  createOrJoinSession,
  pushTurnToFirestore,
  subscribeToSessionTurns,
} from '../lib/sessionSync';

export default function DualMindHomePage() {
  // Session & Playbook State
  const [sessionCode] = useState<string>(() => generateSessionCode());
  const [sessionId, setSessionId] = useState<string>('');
  const [playbook, setPlaybook] = useState<NegotiationPlaybook>({
    role: 'Staff AI Systems Architect',
    targetAnchor: '$240k base + 0.5% equity',
    walkAwayBatna: '$205k competing offer from Tier-1 Lab',
  });

  // Hybrid Telemetry State
  const [activeEngine, setActiveEngine] = useState<'SYSTEM-1: ON-DEVICE NANO' | 'SYSTEM-2: CLOUD GEMINI'>('SYSTEM-1: ON-DEVICE NANO');
  const [latencyMs, setLatencyMs] = useState<number>(14);
  const [privacyShieldActive, setPrivacyShieldActive] = useState<boolean>(true);
  const [escalationThreshold, setEscalationThreshold] = useState<number>(70);
  const [appCheckStatus, setAppCheckStatus] = useState<'INITIALIZING' | 'VERIFIED' | 'DEBUG_MODE' | 'ERROR'>('INITIALIZING');
  const [isOfflineSimulated, setIsOfflineSimulated] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [chromeNanoStatus, setChromeNanoStatus] = useState<'READY' | 'DOWNLOADING' | 'UNSUPPORTED'>('UNSUPPORTED');
  const [isAndroidConnected, setIsAndroidConnected] = useState<boolean>(false);

  // Turns & Active Cognitive State
  const [turns, setTurns] = useState<Turn[]>([]);
  const [currentTurn, setCurrentTurn] = useState<Turn | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isEscalating, setIsEscalating] = useState<boolean>(false);
  const [streamBuffer, setStreamBuffer] = useState<string>('');
  const [lockedScript, setLockedScript] = useState<string | null>(null);
  const [traces, setTraces] = useState<TraceItem[]>([]);

  // Initialize Firebase client, App Check, and Remote Config on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      // Check Chrome Gemini Nano availability
      checkChromeNanoReadiness().then((status) => {
        setChromeNanoStatus(status);
      });

      // Initialize Firebase Client
      const { appCheckStatus: status } = getFirebaseClient();
      setAppCheckStatus(status);

      // Fetch dynamic Remote Config threshold
      getEscalationRiskThreshold().then((threshold) => {
        setEscalationThreshold(threshold);
      });

      // Create session document
      createOrJoinSession(sessionCode, playbook, escalationThreshold).then((id) => {
        setSessionId(id);
      });

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, [sessionCode, playbook, escalationThreshold]);

  // Subscribe to real-time session turns
  useEffect(() => {
    if (!sessionId) return;
    const unsub = subscribeToSessionTurns(sessionId, (syncedTurns) => {
      if (syncedTurns.length > 0) {
        setIsAndroidConnected(true);
      }
    });
    return () => unsub();
  }, [sessionId]);

  const handleAddTrace = useCallback((trace: TraceItem) => {
    setTraces((prev) => [trace, ...prev]);
  }, []);

  // Main turn processing pipeline
  const processOpponentUtterance = async (rawUtterance: string) => {
    if (isProcessing) return;
    setIsProcessing(true);
    setActiveEngine('SYSTEM-1: ON-DEVICE NANO');
    setStreamBuffer('');
    setLockedScript(null);

    // 1. Run System-1 Reflex & Local Privacy Firewall
    const s1Response = await runSystem1Reflex(rawUtterance, privacyShieldActive, handleAddTrace);
    const { result: s1Result, executionSource: s1Source, latencyMs: s1Latency, offline } = s1Response;
    setLatencyMs(s1Latency);

    const turnId = `turn-${Date.now()}`;
    const newTurn: Turn = {
      id: turnId,
      timestamp: Date.now(),
      rawUtterance,
      utterance: s1Result.redactedText,
      system1: s1Result,
      executionSource: s1Source,
      latencyMs: s1Latency,
      offline,
      piiShieldedCount: s1Result.piiEntitiesShielded.length,
    };

    setCurrentTurn(newTurn);
    setTurns((prev) => [...prev, newTurn]);

    // Check if System-2 escalation is triggered
    const shouldEscalate = s1Result.riskScore >= escalationThreshold;

    if (shouldEscalate) {
      await triggerSystem2Escalation(newTurn, s1Result);
    } else {
      // Push turn to Firestore for Android HUD sync
      if (sessionId) {
        pushTurnToFirestore(sessionId, newTurn);
      }
      setIsProcessing(false);
    }
  };

  const triggerSystem2Escalation = async (turn: Turn, s1Result: System1Result) => {
    setIsEscalating(true);
    setActiveEngine('SYSTEM-2: CLOUD GEMINI');

    const s2Response = await runSystem2DeepStrategy(
      turn.utterance,
      playbook,
      s1Result,
      (chunk) => {
        setStreamBuffer((prev) => prev + chunk);
      },
      handleAddTrace
    );

    const updatedTurn: Turn = {
      ...turn,
      system2: s2Response.result,
      executionSource: 'CLOUD GEMINI (ESCALATED)',
      latencyMs: s2Response.latencyMs,
    };

    setCurrentTurn(updatedTurn);
    setTurns((prev) => prev.map((t) => (t.id === turn.id ? updatedTurn : t)));
    setLatencyMs(s2Response.latencyMs);

    // Push escalated turn to Firestore
    if (sessionId) {
      pushTurnToFirestore(sessionId, updatedTurn);
    }

    setIsEscalating(false);
    setIsProcessing(false);
  };

  const handleForceEscalate = () => {
    if (currentTurn && !currentTurn.system2 && !isEscalating) {
      triggerSystem2Escalation(currentTurn, currentTurn.system1);
    }
  };

  const handleLockScript = (script: string) => {
    setLockedScript(script);
    if (currentTurn && sessionId) {
      const updatedTurn: Turn = {
        ...currentTurn,
        system2: currentTurn.system2
          ? { ...currentTurn.system2, exactScriptToSay: script }
          : undefined,
      };
      pushTurnToFirestore(sessionId, updatedTurn);
    }
  };

  const onDeviceTurnsCount = turns.filter((t) => t.executionSource === 'ON-DEVICE NANO').length;

  return (
    <main className="min-h-screen flex flex-col bg-obsidian-950 text-slate-100 font-sans selection:bg-cyan-500/20">
      {/* Top Hybrid Telemetry & Control Strip */}
      <TelemetryBar
        activeEngine={activeEngine}
        latencyMs={latencyMs}
        totalTurns={turns.length}
        onDeviceTurns={onDeviceTurnsCount}
        privacyShieldActive={privacyShieldActive}
        onTogglePrivacyShield={() => setPrivacyShieldActive(!privacyShieldActive)}
        escalationThreshold={escalationThreshold}
        appCheckStatus={appCheckStatus}
        isOfflineSimulated={isOfflineSimulated}
        onToggleOfflineSimulator={() => setIsOfflineSimulated(!isOfflineSimulated)}
        isOnline={isOnline}
        sessionCode={sessionCode}
        isAndroidConnected={isAndroidConnected}
      />

      {/* Nano Readiness Guide Popover (subtle non-blocking) */}
      <NanoReadinessGuide status={chromeNanoStatus} />

      {/* Collapsible Negotiation Playbook Bar */}
      <PlaybookBar playbook={playbook} onChangePlaybook={setPlaybook} />

      {/* Live Audio Capture & 1-Click Judge Demo Scenarios */}
      <InstantDemoDeck
        onProcessUtterance={processOpponentUtterance}
        isProcessing={isProcessing}
      />

      {/* Dual-Pane Cognitive Teleprompter HUD */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 flex flex-col lg:flex-row gap-4 items-stretch">
        {/* Left Pane: System-1 Reflex Feed (On-Device Nano) */}
        <System1ReflexPane
          system1={currentTurn ? currentTurn.system1 : null}
          rawUtterance={currentTurn ? currentTurn.rawUtterance : ''}
          executionSource={currentTurn ? currentTurn.executionSource : 'ON-DEVICE NANO'}
          latencyMs={currentTurn ? currentTurn.latencyMs : latencyMs}
          escalationThreshold={escalationThreshold}
          onForceEscalate={handleForceEscalate}
          isEscalating={isEscalating}
        />

        {/* Right Pane: System-2 Deep Strategy (Cloud Escalation) */}
        <System2StrategyPane
          system2={currentTurn ? currentTurn.system2 || null : null}
          isEscalating={isEscalating}
          streamText={streamBuffer}
          onLockScript={handleLockScript}
          lockedScript={lockedScript}
          isAndroidSynced={isAndroidConnected}
        />
      </div>

      {/* Negotiation Risk Timeline + Post-Call Debrief Export */}
      <TimelineDebrief
        turns={turns}
        playbook={playbook}
        escalationThreshold={escalationThreshold}
      />

      {/* Slide-Over Firebase AI Logic Inspector (Judge Verification Drawer) */}
      <AiLogicInspector traces={traces} />
    </main>
  );
}
