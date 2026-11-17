'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, BookOpen, Target, Shield, Briefcase } from 'lucide-react';
import { NegotiationPlaybook } from '../lib/types';

interface PlaybookBarProps {
  playbook: NegotiationPlaybook;
  onChangePlaybook: (newPlaybook: NegotiationPlaybook) => void;
}

export function PlaybookBar({ playbook, onChangePlaybook }: PlaybookBarProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="w-full bg-obsidian-900/90 border-b border-slate-800/80 transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center space-x-2 text-xs font-semibold text-slate-300 hover:text-cyan-400 transition"
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span className="tracking-wide uppercase text-[11px] font-mono">Negotiation Playbook Context</span>
            {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
            Injected into System-1 reflex guards & System-2 game-theory calculation
          </span>
        </div>

        {isOpen && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2.5 pb-1">
            {/* Role */}
            <div className="flex items-center space-x-2 bg-obsidian-950/70 px-3 py-1.5 rounded-lg border border-slate-800 focus-within:border-cyan-500 transition">
              <Briefcase className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <div className="w-full flex flex-col">
                <label className="text-[10px] uppercase font-mono text-slate-500 font-semibold leading-none mb-0.5">
                  Your Role / Mandate
                </label>
                <input
                  type="text"
                  value={playbook.role}
                  onChange={(e) => onChangePlaybook({ ...playbook, role: e.target.value })}
                  placeholder="e.g. Staff AI Systems Architect"
                  className="bg-transparent text-xs text-slate-200 outline-none w-full font-sans"
                />
              </div>
            </div>

            {/* Target Anchor */}
            <div className="flex items-center space-x-2 bg-obsidian-950/70 px-3 py-1.5 rounded-lg border border-slate-800 focus-within:border-emerald-500 transition">
              <Target className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <div className="w-full flex flex-col">
                <label className="text-[10px] uppercase font-mono text-slate-500 font-semibold leading-none mb-0.5">
                  Target Anchor Valuation
                </label>
                <input
                  type="text"
                  value={playbook.targetAnchor}
                  onChange={(e) => onChangePlaybook({ ...playbook, targetAnchor: e.target.value })}
                  placeholder="e.g. $240k base + 0.5% equity"
                  className="bg-transparent text-xs text-emerald-300 font-mono outline-none w-full"
                />
              </div>
            </div>

            {/* Walk-Away BATNA */}
            <div className="flex items-center space-x-2 bg-obsidian-950/70 px-3 py-1.5 rounded-lg border border-slate-800 focus-within:border-amber-500 transition">
              <Shield className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <div className="w-full flex flex-col">
                <label className="text-[10px] uppercase font-mono text-slate-500 font-semibold leading-none mb-0.5">
                  Walk-Away BATNA Floor
                </label>
                <input
                  type="text"
                  value={playbook.walkAwayBatna}
                  onChange={(e) => onChangePlaybook({ ...playbook, walkAwayBatna: e.target.value })}
                  placeholder="e.g. $205k competing offer in hand"
                  className="bg-transparent text-xs text-amber-300 font-mono outline-none w-full"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
