'use client';

import React from 'react';
import { Download, TrendingUp, History, Shield, Zap } from 'lucide-react';
import { Turn, NegotiationPlaybook } from '../lib/types';

interface TimelineDebriefProps {
  turns: Turn[];
  playbook: NegotiationPlaybook;
  escalationThreshold: number;
}

export function TimelineDebrief({ turns, playbook, escalationThreshold }: TimelineDebriefProps) {
  if (turns.length === 0) return null;

  // Calculate sparkline points for SVG
  const width = 600;
  const height = 60;
  const padding = 10;

  const points = turns
    .map((turn, idx) => {
      const x = padding + (idx / Math.max(1, turns.length - 1)) * (width - 2 * padding);
      const y = height - padding - (turn.system1.riskScore / 100) * (height - 2 * padding);
      return `${x},${y}`;
    })
    .join(' ');

  // Threshold horizontal line Y coordinate
  const thresholdY = height - padding - (escalationThreshold / 100) * (height - 2 * padding);

  const handleExportDebrief = () => {
    const onDeviceCount = turns.filter((t) => t.executionSource === 'ON-DEVICE NANO').length;
    const cloudCount = turns.length - onDeviceCount;
    const cloudSavedPercent = Math.round((onDeviceCount / turns.length) * 100);
    const totalPiiShielded = turns.reduce((acc, t) => acc + t.piiShieldedCount, 0);

    const markdown = `# DualMind Executive Negotiation Debrief
**Generated:** ${new Date().toLocaleString()}
**Target Anchor:** ${playbook.targetAnchor}
**Walk-Away BATNA:** ${playbook.walkAwayBatna}
**Role:** ${playbook.role}

---

## 1. Executive Hybrid AI Efficiency Metrics
- **Total Opponent Turns Analyzed:** ${turns.length}
- **System-1 On-Device Nano Turns:** ${onDeviceCount} (${cloudSavedPercent}% of all turns)
- **System-2 Cloud Escalations:** ${cloudCount}
- **Confidential PII Entities Shielded Locally:** ${totalPiiShielded}
- **Estimated Cloud API Cost Savings:** $${(onDeviceCount * 0.004).toFixed(3)}
- **Remote Config Risk Threshold:** ${escalationThreshold}

---

## 2. Chronological Turn Audit Log

${turns
  .map(
    (turn, idx) => `### Turn ${idx + 1} [${turn.executionSource} | Latency: ${turn.latencyMs}ms]
- **Opponent Statement:** "${turn.rawUtterance}"
- **Redacted (PII Shielded):** "${turn.utterance}"
- **Detected Tactic:** ${turn.system1.tacticDetected} (${turn.system1.tacticCategory})
- **Reflex Risk Score:** ${turn.system1.riskScore}/100 | **Bluff Probability:** ${turn.system1.bluffProbability}%
- **System-1 Teleprompter Cue:** "${turn.system1.quickCue}"
${
  turn.system2
    ? `- **System-2 Threat Analysis:** ${turn.system2.threatAnalysis}
- **System-2 Spoken Response:** "${turn.system2.exactScriptToSay}"`
    : '- **System-2 Cloud Escalation:** Dormant (Risk below threshold)'
}
`
  )
  .join('\n')}

---
*DualMind Hybrid AI Negotiation Teleprompter — Grand Prize Hackathon Edition*
`;

    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `DualMind_Debrief_${Date.now()}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full bg-obsidian-900/80 border-t border-slate-800 p-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Timeline Header & Sparkline */}
        <div className="flex-1 w-full flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center space-x-2 shrink-0">
            <History className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono font-bold uppercase text-slate-300">
              Session Risk Sparkline ({turns.length} turns)
            </span>
          </div>

          <div className="flex-1 w-full bg-obsidian-950 p-2 rounded-xl border border-slate-800 relative overflow-hidden">
            <svg className="w-full h-12" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
              {/* Threshold line */}
              <line
                x1={0}
                y1={thresholdY}
                x2={width}
                y2={thresholdY}
                stroke="#06b6d4"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              {/* Sparkline path */}
              {turns.length > 1 ? (
                <polyline
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={points}
                />
              ) : (
                <circle
                  cx={width / 2}
                  cy={height - padding - (turns[0].system1.riskScore / 100) * (height - 2 * padding)}
                  r="4"
                  fill="#10b981"
                />
              )}
            </svg>
            <span className="absolute top-1 right-2 text-[9px] font-mono text-cyan-400/80">
              Threshold: {escalationThreshold}
            </span>
          </div>
        </div>

        {/* 1-Click Export Debrief Button */}
        <button
          onClick={handleExportDebrief}
          className="shrink-0 flex items-center space-x-2 px-4 py-2 rounded-xl bg-obsidian-850 hover:bg-obsidian-800 border border-slate-700 text-xs font-mono font-bold text-slate-200 transition duration-150 shadow-sm"
        >
          <Download className="w-3.5 h-3.5 text-cyan-400" />
          <span>Export Debrief (.md)</span>
        </button>
      </div>
    </div>
  );
}
