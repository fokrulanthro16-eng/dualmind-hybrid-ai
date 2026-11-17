'use client';

import React, { useState } from 'react';
import {
  Cloud,
  CheckCircle2,
  Sparkles,
  Layers,
  Calculator,
  ShieldAlert,
  Send,
  Radio,
  Lock,
} from 'lucide-react';
import { System2Result, CounterOffer, CounterOfferTier } from '../lib/types';

interface System2StrategyPaneProps {
  system2: System2Result | null;
  isEscalating: boolean;
  streamText?: string;
  onLockScript: (script: string) => void;
  lockedScript: string | null;
  isAndroidSynced: boolean;
}

export function System2StrategyPane({
  system2,
  isEscalating,
  streamText,
  onLockScript,
  lockedScript,
  isAndroidSynced,
}: System2StrategyPaneProps) {
  const [selectedTier, setSelectedTier] = useState<CounterOfferTier>('Balanced');

  if (!system2 && !isEscalating) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 rounded-2xl border border-dashed border-slate-800 bg-obsidian-950/40 text-center min-h-[420px]">
        <Cloud className="w-10 h-10 text-cyan-500/40 mb-3" />
        <h3 className="text-sm font-mono font-bold text-slate-300">SYSTEM-2 CLOUD STRATEGY DORMANT</h3>
        <p className="text-xs text-slate-500 max-w-sm mt-1">
          Activates automatically when Risk Score breaches the Remote Config threshold (70) or upon manual escalation. Cloud calls saved to minimize cost & latency.
        </p>
      </div>
    );
  }

  if (isEscalating && !system2) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 rounded-2xl border border-cyan-500/30 bg-obsidian-900/80 backdrop-blur-md text-center min-h-[420px]">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
        <h3 className="text-sm font-mono font-bold text-cyan-300 animate-pulse">
          CLOUD GEMINI SYSTEM-2 STREAMING...
        </h3>
        <p className="text-xs text-slate-400 max-w-sm mt-2 font-mono">
          Evaluating game-theory leverage & synthesizing 3-tier counter-offers via Firebase AI Logic...
        </p>
        {streamText && (
          <div className="mt-4 p-3 bg-obsidian-950 rounded-lg border border-slate-800 text-[11px] font-mono text-cyan-400 text-left max-w-md w-full overflow-hidden max-h-24">
            {streamText}
          </div>
        )}
      </div>
    );
  }

  if (!system2) return null;

  return (
    <div className="flex-1 flex flex-col p-5 rounded-2xl border border-cyan-500/40 backdrop-blur-md bg-obsidian-900/90 shadow-xl shadow-cyan-950/20 transition-all duration-300">
      {/* Header Strip */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <h2 className="text-xs font-mono font-black tracking-wider text-cyan-400 uppercase">
            System-2: Cloud Deep Strategy Engine
          </h2>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
            CLOUD GEMINI (ESCALATED)
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-obsidian-950 text-emerald-400 border border-emerald-900/60 flex items-center gap-1">
            <Radio className="w-2.5 h-2.5" />
            {isAndroidSynced ? 'HUD Synced' : 'Sync Ready'}
          </span>
        </div>
      </div>

      {/* Strategic Synthesis: Threat Analysis & BATNA Math */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        {/* Threat Analysis */}
        <div className="p-3 rounded-xl bg-obsidian-950/80 border border-slate-800">
          <div className="flex items-center space-x-1.5 text-slate-400 text-[10px] font-mono uppercase mb-1">
            <ShieldAlert className="w-3 h-3 text-rose-400" />
            <span>Game-Theory Threat Breakdown</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">{system2.threatAnalysis}</p>
        </div>

        {/* BATNA & Anchor Math */}
        <div className="p-3 rounded-xl bg-obsidian-950/80 border border-slate-800">
          <div className="flex items-center space-x-1.5 text-slate-400 text-[10px] font-mono uppercase mb-1">
            <Calculator className="w-3 h-3 text-emerald-400" />
            <span>BATNA Anchor Differential</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-mono">{system2.batnaAnchorMath}</p>
        </div>
      </div>

      {/* 3 Interactive Counter-Offer Cards */}
      <div className="mb-4">
        <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-bold block mb-2">
          Select Tactical Counter-Offer Tier (Pushes to Android Pocket HUD):
        </span>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          {system2.counterOffers &&
            system2.counterOffers.map((offer, idx) => {
              const isSelected = selectedTier === offer.tier;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedTier(offer.tier);
                    onLockScript(offer.script);
                  }}
                  className={`flex flex-col text-left p-3 rounded-xl border transition duration-150 relative ${
                    isSelected
                      ? 'bg-cyan-950/60 border-cyan-400 shadow-md shadow-cyan-950/50'
                      : 'bg-obsidian-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        offer.tier === 'Conservative'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : offer.tier === 'Balanced'
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}
                    >
                      {offer.tier}
                    </span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                  </div>

                  <h4 className="text-xs font-semibold text-slate-200 mt-1">{offer.headline}</h4>
                  <p className="text-[11px] text-slate-400 mt-1.5 font-sans line-clamp-3 leading-snug">
                    "{offer.script}"
                  </p>

                  <div className="mt-2 pt-2 border-t border-slate-800/80 text-[10px] text-slate-500 font-mono">
                    Outcome: {offer.expectedOutcome}
                  </div>
                </button>
              );
            })}
        </div>
      </div>

      {/* Giant Teleprompter Strategy Banner (Instant Spoken Script) */}
      <div className="mt-auto pt-3 border-t border-slate-800">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold flex items-center gap-1">
            <Lock className="w-3 h-3 text-cyan-400" /> Active Teleprompter Script (Broadcasted to Pocket HUD)
          </span>
          <span className="text-[10px] font-mono text-emerald-400">
            {isAndroidSynced ? 'Live Synced to Android' : 'Ready to push to Android'}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-obsidian-950 border border-cyan-500/50 shadow-lg shadow-cyan-950/40">
          <p className="text-base sm:text-lg font-mono font-black text-cyan-100 tracking-wide leading-snug">
            "{lockedScript || system2.exactScriptToSay}"
          </p>
        </div>
      </div>
    </div>
  );
}
