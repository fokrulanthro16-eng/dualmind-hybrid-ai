'use client';

import React from 'react';
import { Cpu, ShieldCheck, AlertCircle, Eye, ArrowRight, Zap, Target } from 'lucide-react';
import { System1Result, ExecutionSource } from '../lib/types';

interface System1ReflexPaneProps {
  system1: System1Result | null;
  rawUtterance: string;
  executionSource: ExecutionSource;
  latencyMs: number;
  escalationThreshold: number;
  onForceEscalate: () => void;
  isEscalating: boolean;
}

export function System1ReflexPane({
  system1,
  rawUtterance,
  executionSource,
  latencyMs,
  escalationThreshold,
  onForceEscalate,
  isEscalating,
}: System1ReflexPaneProps) {
  if (!system1) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 rounded-2xl border border-dashed border-slate-800 bg-obsidian-950/40 text-center min-h-[420px]">
        <Cpu className="w-10 h-10 text-emerald-500/40 mb-3 animate-pulse" />
        <h3 className="text-sm font-mono font-bold text-slate-300">SYSTEM-1 REFLEX ENGINE STANDBY</h3>
        <p className="text-xs text-slate-500 max-w-sm mt-1">
          Waiting for opponent speech or click one of the 4 Judge Demo Scenarios above. System-1 analyzes reflexes on-device in &lt;250ms.
        </p>
      </div>
    );
  }

  const riskScore = system1.riskScore;
  const isBreached = riskScore >= escalationThreshold;

  // Semi-circle SVG calculation
  // Radius = 70, circumference = PI * r ~ 220
  const radius = 70;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - (riskScore / 100) * circumference;

  // Threshold notch angle (180 deg mapped to 0-100)
  const thresholdAngle = 180 - (escalationThreshold / 100) * 180;
  const thresholdRad = (thresholdAngle * Math.PI) / 180;
  const notchX = 100 + (radius + 2) * Math.cos(thresholdRad);
  const notchY = 90 - (radius + 2) * Math.sin(thresholdRad);

  return (
    <div
      className={`flex-1 flex flex-col p-5 rounded-2xl border transition-all duration-300 backdrop-blur-md bg-obsidian-900/90 shadow-xl ${
        isBreached
          ? 'border-rose-600/70 shadow-rose-950/30'
          : 'border-emerald-600/40 shadow-emerald-950/20'
      }`}
    >
      {/* Header Strip */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <h2 className="text-xs font-mono font-black tracking-wider text-emerald-400 uppercase">
            System-1: On-Device Reflex Feed
          </h2>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-obsidian-950 border border-slate-800 text-slate-300">
            {executionSource} ({latencyMs}ms)
          </span>
          <span
            className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
              system1.sentiment === 'HOSTILE'
                ? 'bg-rose-950 text-rose-300 border border-rose-800'
                : system1.sentiment === 'PRESSURE'
                ? 'bg-amber-950 text-amber-300 border border-amber-800'
                : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
            }`}
          >
            {system1.sentiment}
          </span>
        </div>
      </div>

      {/* Main Reflex Grid: Semi-Circle Gauge + Tactic & Bluff Meters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
        {/* Semi-Circular SVG Risk Gauge */}
        <div className="flex flex-col items-center justify-center relative p-2">
          <svg className="w-48 h-28 overflow-visible" viewBox="0 0 200 110">
            {/* Background Arc */}
            <path
              d="M 30 90 A 70 70 0 0 1 170 90"
              fill="none"
              stroke="#1e293b"
              strokeWidth="14"
              strokeLinecap="round"
            />
            {/* Value Arc */}
            <path
              d="M 30 90 A 70 70 0 0 1 170 90"
              fill="none"
              stroke={isBreached ? '#ef4444' : riskScore > 40 ? '#f59e0b' : '#10b981'}
              strokeWidth="14"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-500 ease-out"
            />
            {/* Threshold Notch */}
            <line
              x1={100 + 60 * Math.cos(thresholdRad)}
              y1={90 - 60 * Math.sin(thresholdRad)}
              x2={100 + 82 * Math.cos(thresholdRad)}
              y2={90 - 82 * Math.sin(thresholdRad)}
              stroke="#06b6d4"
              strokeWidth="3"
            />
          </svg>

          {/* Central Score Display */}
          <div className="absolute bottom-2 flex flex-col items-center">
            <span
              className={`text-3xl font-black font-mono leading-none ${
                isBreached ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {riskScore}
            </span>
            <span className="text-[10px] font-mono text-slate-400 uppercase mt-0.5">Risk Score / 100</span>
          </div>

          {/* Threshold Label */}
          <div className="mt-1 flex items-center space-x-1 text-[10px] font-mono text-cyan-400">
            <Target className="w-3 h-3" />
            <span>Escalation Threshold: {escalationThreshold}</span>
          </div>
        </div>

        {/* Tactical Classification & Bluff Probability */}
        <div className="space-y-3">
          {/* Tactic Detected */}
          <div className="bg-obsidian-950/80 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">
              Detected Tactic
            </span>
            <div className="flex items-center space-x-1.5">
              <span className="px-2 py-0.5 rounded bg-slate-800 text-[11px] font-mono text-cyan-300 font-semibold">
                {system1.tacticCategory}
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-200 mt-1">{system1.tacticDetected}</p>
          </div>

          {/* Bluff Probability Meter */}
          <div className="bg-obsidian-950/80 p-2.5 rounded-xl border border-slate-800">
            <div className="flex justify-between items-center mb-1 text-[10px] font-mono">
              <span className="text-slate-500 uppercase">Bluff Probability</span>
              <span className={`font-bold ${system1.bluffProbability > 60 ? 'text-amber-400' : 'text-slate-300'}`}>
                {system1.bluffProbability}%
              </span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  system1.bluffProbability > 70
                    ? 'bg-amber-400'
                    : system1.bluffProbability > 40
                    ? 'bg-cyan-400'
                    : 'bg-emerald-400'
                }`}
                style={{ width: `${system1.bluffProbability}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Local PII Firewall Shield Diff Pill */}
      {system1.piiEntitiesShielded && system1.piiEntitiesShielded.length > 0 && (
        <div className="mt-4 p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-800/60 text-xs">
          <div className="flex items-center space-x-1.5 text-emerald-400 font-mono text-[11px] font-bold mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>PII Shielded Locally (Never Sent To Cloud):</span>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-1 font-mono text-[11px]">
            {system1.piiEntitiesShielded.map((entity, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-200 border border-emerald-700/50"
              >
                {entity}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Giant High-Contrast Teleprompter Quick Cue (Readable from 4 feet away) */}
      <div className="mt-4 pt-3 border-t border-slate-800 flex-1 flex flex-col justify-center">
        <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-bold flex items-center gap-1 mb-1">
          <Zap className="w-3.5 h-3.5" /> Teleprompter Reflex Cue (Read Aloud Immediately)
        </span>
        <div className="p-4 rounded-xl bg-obsidian-950 border border-emerald-500/40 shadow-inner">
          <p className="text-base sm:text-lg font-mono font-black text-slate-100 tracking-wide leading-snug">
            "{system1.quickCue}"
          </p>
        </div>
      </div>

      {/* Escalation Control Action */}
      <div className="mt-4 pt-2 flex items-center justify-between text-xs">
        <span className="text-slate-500 text-[11px] font-mono">
          {isBreached ? (
            <span className="text-rose-400 font-bold flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> Risk ({riskScore}) &gt; Threshold ({escalationThreshold}): System-2 Auto-Fired
            </span>
          ) : (
            <span>Risk within safe margin. Cloud escalation dormant.</span>
          )}
        </span>

        {!isBreached && (
          <button
            onClick={onForceEscalate}
            disabled={isEscalating}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-950 border border-cyan-700/70 hover:bg-cyan-900/70 text-cyan-300 font-mono text-[11px] transition"
          >
            <ArrowRight className="w-3 h-3" />
            <span>{isEscalating ? 'Escalating...' : 'Escalate to System-2'}</span>
          </button>
        )}
      </div>
    </div>
  );
}
