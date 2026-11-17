'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Wifi,
  WifiOff,
  Cpu,
  Cloud,
  QrCode,
  Copy,
  Check,
  Layers,
  Activity,
  DollarSign,
  TrendingDown,
} from 'lucide-react';
import { ExecutionSource } from '../lib/types';

interface TelemetryBarProps {
  activeEngine: 'SYSTEM-1: ON-DEVICE NANO' | 'SYSTEM-2: CLOUD GEMINI';
  latencyMs: number;
  totalTurns: number;
  onDeviceTurns: number;
  privacyShieldActive: boolean;
  onTogglePrivacyShield: () => void;
  escalationThreshold: number;
  appCheckStatus: 'INITIALIZING' | 'VERIFIED' | 'DEBUG_MODE' | 'ERROR';
  isOfflineSimulated: boolean;
  onToggleOfflineSimulator: () => void;
  isOnline: boolean;
  sessionCode: string;
  isAndroidConnected: boolean;
}

export function TelemetryBar({
  activeEngine,
  latencyMs,
  totalTurns,
  onDeviceTurns,
  privacyShieldActive,
  onTogglePrivacyShield,
  escalationThreshold,
  appCheckStatus,
  isOfflineSimulated,
  onToggleOfflineSimulator,
  isOnline,
  sessionCode,
  isAndroidConnected,
}: TelemetryBarProps) {
  const [showQrModal, setShowQrModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Cloud calls saved percentage calculation
  const cloudCallsSavedPercent =
    totalTurns > 0 ? Math.round((onDeviceTurns / totalTurns) * 100) : 100;
  // Estimated cost saved: ~$0.002 per token savings average calculation
  const estCostSaved = (onDeviceTurns * 0.004).toFixed(3);

  const handleCopyCode = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(sessionCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isActuallyOnline = isOnline && !isOfflineSimulated;

  return (
    <header className="w-full border-b border-slate-800 bg-obsidian-950/80 backdrop-blur-md sticky top-0 z-40 px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Engine Status */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-black tracking-wider bg-gradient-to-r from-emerald-400 via-cyan-400 to-amber-400 bg-clip-text text-transparent">
              DualMind
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/70 text-emerald-400 border border-emerald-800/80 uppercase font-semibold">
              Hybrid AI
            </span>
          </div>

          {/* Active Engine Pill */}
          <div
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium border transition-all ${
              activeEngine.includes('NANO')
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 shadow-sm shadow-emerald-900/50'
                : 'bg-cyan-950/40 border-cyan-500/40 text-cyan-300 shadow-sm shadow-cyan-900/50'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full animate-pulse ${
                activeEngine.includes('NANO') ? 'bg-emerald-400' : 'bg-cyan-400'
              }`}
            />
            {activeEngine.includes('NANO') ? (
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Cloud className="w-3.5 h-3.5 text-cyan-400" />
            )}
            <span>{activeEngine}</span>
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs font-mono">
          {/* Latency */}
          <div className="flex items-center space-x-1 bg-obsidian-900/90 px-2 py-1 rounded border border-slate-800 text-slate-300">
            <Activity className="w-3 h-3 text-emerald-400" />
            <span className="text-slate-400">Latency:</span>
            <span className={`font-semibold ${latencyMs < 150 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {latencyMs}ms
            </span>
          </div>

          {/* Cloud Calls Saved */}
          <div className="flex items-center space-x-1 bg-obsidian-900/90 px-2 py-1 rounded border border-slate-800 text-slate-300">
            <TrendingDown className="w-3 h-3 text-emerald-400" />
            <span className="text-slate-400">Cloud Saved:</span>
            <span className="font-semibold text-emerald-400">{cloudCallsSavedPercent}%</span>
          </div>

          {/* Est Cost Saved */}
          <div className="hidden md:flex items-center space-x-1 bg-obsidian-900/90 px-2 py-1 rounded border border-slate-800 text-slate-300">
            <DollarSign className="w-3 h-3 text-amber-400" />
            <span className="text-slate-400">Est Saved:</span>
            <span className="font-semibold text-amber-400">${estCostSaved}</span>
          </div>

          {/* Remote Config Threshold Badge */}
          <div className="flex items-center space-x-1 bg-obsidian-900/90 px-2 py-1 rounded border border-slate-800 text-slate-300">
            <Layers className="w-3 h-3 text-cyan-400" />
            <span className="text-slate-400">Threshold:</span>
            <span className="font-semibold text-cyan-300">{escalationThreshold}</span>
          </div>

          {/* App Check Verified Indicator */}
          <div
            className={`flex items-center space-x-1 px-2 py-1 rounded border text-[11px] ${
              appCheckStatus === 'VERIFIED'
                ? 'bg-emerald-950/50 border-emerald-800 text-emerald-300'
                : 'bg-cyan-950/50 border-cyan-800 text-cyan-300'
            }`}
            title="Firebase App Check Token Active"
          >
            <ShieldCheck className="w-3 h-3" />
            <span>AppCheck: {appCheckStatus === 'VERIFIED' ? 'Verified' : 'Active'}</span>
          </div>

          {/* PII Shield Toggle */}
          <button
            onClick={onTogglePrivacyShield}
            className={`flex items-center space-x-1 px-2 py-1 rounded border transition-colors ${
              privacyShieldActive
                ? 'bg-emerald-950/60 border-emerald-600/70 text-emerald-300 hover:bg-emerald-900/60'
                : 'bg-rose-950/60 border-rose-600/70 text-rose-300 hover:bg-rose-900/60'
            }`}
          >
            {privacyShieldActive ? (
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
            ) : (
              <ShieldAlert className="w-3 h-3 text-rose-400" />
            )}
            <span>PII Shield: {privacyShieldActive ? 'ON' : 'OFF'}</span>
          </button>

          {/* Offline Simulator Toggle */}
          <button
            onClick={onToggleOfflineSimulator}
            className={`flex items-center space-x-1 px-2 py-1 rounded border transition-colors ${
              !isActuallyOnline
                ? 'bg-amber-950/70 border-amber-500 text-amber-300'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
            title="Simulate network disconnect to test System-1 offline nano mode"
          >
            {!isActuallyOnline ? (
              <WifiOff className="w-3 h-3 text-amber-400" />
            ) : (
              <Wifi className="w-3 h-3 text-emerald-400" />
            )}
            <span>{!isActuallyOnline ? 'Simulating Offline' : 'Online'}</span>
          </button>

          {/* Android Companion Pairing Button */}
          <div className="flex items-center space-x-1.5 bg-obsidian-900 px-2.5 py-1 rounded-md border border-cyan-800/60 text-cyan-300">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isAndroidConnected ? 'bg-emerald-400' : 'bg-amber-400 animate-ping'
              }`}
            />
            <span className="font-bold">{sessionCode}</span>
            <button
              onClick={handleCopyCode}
              title="Copy session code"
              className="text-slate-400 hover:text-cyan-300 transition-colors ml-0.5"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            </button>
            <button
              onClick={() => setShowQrModal(true)}
              title="Scan QR to pair Android companion HUD"
              className="text-slate-400 hover:text-cyan-300 transition-colors ml-0.5"
            >
              <QrCode className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Android Pairing QR Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-obsidian-900 border border-slate-700 rounded-xl p-6 max-w-sm w-full shadow-2xl relative">
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <QrCode className="w-5 h-5 text-cyan-400" />
              Pair Android Companion HUD
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Launch the DualMind Android Pocket HUD app and scan this QR code or enter code manually.
            </p>

            <div className="my-5 p-4 bg-white rounded-lg flex flex-col items-center justify-center">
              {/* Clean inline SVG QR placeholder code */}
              <svg
                className="w-44 h-44 text-obsidian-950"
                viewBox="0 0 100 100"
                fill="currentColor"
              >
                <path d="M0 0h30v30H0zM10 10h10v10H10zM70 0h30v30H70zM80 10h10v10H80zM0 70h30v30H0zM10 80h10v10H10z" />
                <rect x="35" y="10" width="10" height="10" />
                <rect x="50" y="10" width="10" height="20" />
                <rect x="10" y="35" width="20" height="10" />
                <rect x="35" y="35" width="30" height="30" />
                <rect x="75" y="45" width="15" height="10" />
                <rect x="40" y="75" width="20" height="15" />
                <rect x="70" y="70" width="25" height="25" />
                <rect x="75" y="75" width="15" height="15" fill="#fff" />
              </svg>
              <div className="mt-2 text-center">
                <span className="text-sm font-mono font-bold text-obsidian-900">
                  dualmind://join/{sessionCode}
                </span>
              </div>
            </div>

            <div className="text-center font-mono text-sm bg-obsidian-950 p-2.5 rounded border border-slate-800 text-cyan-400 font-bold tracking-widest">
              SESSION CODE: {sessionCode}
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowQrModal(false)}
                className="px-4 py-1.5 rounded-md text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
