'use client';

import React, { useState } from 'react';
import { Info, X, ExternalLink, Cpu, CheckCircle } from 'lucide-react';

interface NanoReadinessGuideProps {
  status: 'READY' | 'DOWNLOADING' | 'UNSUPPORTED';
}

export function NanoReadinessGuide({ status }: NanoReadinessGuideProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (status === 'READY' || isDismissed) return null;

  return (
    <div className="bg-obsidian-900/90 border-b border-cyan-800/60 px-4 py-2 text-xs font-mono backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center space-x-2 text-slate-300">
          <Cpu className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>
            {status === 'DOWNLOADING' ? (
              <span className="text-amber-300">
                Chrome Gemini Nano model is downloading locally. Routing through Firebase AI Logic fallback...
              </span>
            ) : (
              <span>
                Chrome Built-in AI (Gemini Nano) not detected. Seamlessly routing via Firebase AI Logic Cloud Fallback.
              </span>
            )}
          </span>
          <span className="text-slate-500 hidden md:inline">
            To enable Chrome Gemini Nano locally: visit{' '}
            <code className="text-cyan-300 bg-obsidian-950 px-1 py-0.5 rounded border border-slate-800">
              chrome://flags/#prompt-api-for-gemini-nano
            </code>
          </span>
        </div>

        <button
          onClick={() => setIsDismissed(true)}
          className="text-slate-500 hover:text-slate-300 transition shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
