'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, Sparkles, Volume2, ShieldCheck, Zap, AlertTriangle } from 'lucide-react';

interface InstantDemoDeckProps {
  onProcessUtterance: (text: string) => void;
  isProcessing: boolean;
}

interface DemoScenario {
  id: string;
  title: string;
  tag: string;
  riskExpectation?: string;
  expectedRouting: string;
  badgeColor: string;
  text: string;
}

const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'exploding-deadline',
    title: 'Lowball Offer + Exploding 24h Deadline',
    tag: 'High Risk (~88)',
    expectedRouting: 'Triggers PII Shield + Auto System-2 Escalation',
    badgeColor: 'border-rose-500/50 bg-rose-950/40 text-rose-300',
    text: 'Our final cap is $185k with 0.15% equity at Acme Corp. This offer expires at midnight tonight, and if you do not sign within 24 hours, we are walking away to our runner-up candidate.',
  },
  {
    id: 'routine-timeline',
    title: 'Routine Timeline Alignment',
    tag: 'Low Risk (~24)',
    expectedRouting: '100% On-Device System-1 (0 Cloud Calls!)',
    badgeColor: 'border-emerald-500/50 bg-emerald-950/40 text-emerald-300',
    text: 'Can we sync on the architectural sprint milestones next Tuesday at 2 PM to ensure we are aligned before the Q3 release?',
  },
  {
    id: 'competitor-bluff',
    title: 'Competitor Discount Bluff',
    tag: 'Medium Risk (~58)',
    expectedRouting: 'Caught locally by Bluff Detector + Instant Cue',
    badgeColor: 'border-amber-500/50 bg-amber-950/40 text-amber-300',
    text: 'Google and AWS offered us the exact same enterprise tier with a 40% immediate discount and matching SLA. You must match their pricing today or we sign with them.',
  },
  {
    id: 'liability-trap',
    title: 'Hidden IP Ownership & Unlimited Liability',
    tag: 'Critical Risk (~94)',
    expectedRouting: 'System-2 Legal/BATNA 3-Tier Counter-Offer',
    badgeColor: 'border-red-600/60 bg-red-950/50 text-red-300',
    text: 'In section 14 of the contract, your firm agrees to assign all prior and future intellectual property rights to us unconditionally, along with unlimited indemnity liability for any third-party claims.',
  },
];

interface SpeechRecInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (e: { resultIndex: number; results: Array<Array<{ transcript: string }> & { isFinal?: boolean }> }) => void;
  onerror: () => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
}

export function InstantDemoDeck({ onProcessUtterance, isProcessing }: InstantDemoDeckProps) {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [interimTranscript, setInterimTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecInstance | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check Web Speech API availability
    if (typeof window !== 'undefined') {
      const windowObj = window as unknown as { SpeechRecognition?: new () => SpeechRecInstance; webkitSpeechRecognition?: new () => SpeechRecInstance };
      const SpeechRecognitionClass = windowObj.SpeechRecognition || windowObj.webkitSpeechRecognition;
      if (SpeechRecognitionClass) {
        const recognition = new SpeechRecognitionClass();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
          let interim = '';
          let final = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              final += event.results[i][0].transcript;
            } else {
              interim += event.results[i][0].transcript;
            }
          }

          if (interim) {
            setInterimTranscript(interim);
            setAudioLevel(Math.floor(Math.random() * 60) + 40);
          }

          if (final) {
            const combined = (inputText + ' ' + final).trim();
            setInputText(combined);
            setInterimTranscript('');

            // Reset pause timer to auto-trigger on conversational pause
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = setTimeout(() => {
              if (combined) {
                onProcessUtterance(combined);
                setInputText('');
              }
            }, 1200);
          }
        };

        recognition.onerror = () => {
          setIsListening(false);
          setAudioLevel(0);
        };

        recognition.onend = () => {
          setIsListening(false);
          setAudioLevel(0);
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
  }, [inputText, onProcessUtterance]);

  const toggleMic = () => {
    if (!recognitionRef.current) {
      alert('Web Speech API is not supported in this browser. Please use the text input or 1-Click Judge scenarios.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      setAudioLevel(0);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Speech recognition error:', err);
      }
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isProcessing) return;
    onProcessUtterance(inputText.trim());
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full bg-obsidian-950/70 border-b border-slate-800/80 p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Judge 1-Click Instant Demo Scenarios */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h2 className="text-xs font-mono font-bold tracking-wider text-slate-300 uppercase">
                Judge Instant-Demo Deck (1-Click Test Scenarios)
              </h2>
            </div>
            <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
              Click any scenario to test real-time hybrid cognitive routing
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {DEMO_SCENARIOS.map((scenario) => (
              <button
                key={scenario.id}
                onClick={() => onProcessUtterance(scenario.text)}
                disabled={isProcessing}
                className="group flex flex-col text-left p-3 rounded-xl bg-obsidian-900 border border-slate-800/90 hover:border-slate-700 hover:bg-obsidian-850 transition duration-150 disabled:opacity-50"
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${scenario.badgeColor} font-semibold`}>
                    {scenario.tag}
                  </span>
                  <Zap className="w-3.5 h-3.5 text-slate-600 group-hover:text-cyan-400 transition" />
                </div>
                <h3 className="text-xs font-semibold text-slate-200 line-clamp-1 group-hover:text-cyan-300 transition">
                  {scenario.title}
                </h3>
                <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-snug font-sans">
                  "{scenario.text}"
                </p>
                <div className="mt-2 pt-2 border-t border-slate-800/80 text-[10px] text-slate-500 font-mono">
                  {scenario.expectedRouting}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Live Audio & Manual Input Box */}
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 items-stretch">
          <div className="relative flex-1">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Paste opponent statement or click Mic for real-time speech capture (Press Ctrl+Enter to submit)..."
              rows={2}
              className="w-full bg-obsidian-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-cyan-500/80 transition resize-none font-sans"
            />
            {interimTranscript && (
              <div className="absolute left-4 bottom-2 text-[11px] text-cyan-400 font-mono italic pointer-events-none">
                Listening: {interimTranscript}...
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {/* Live Mic Button */}
            <button
              type="button"
              onClick={toggleMic}
              className={`flex items-center justify-center p-3 rounded-xl border transition ${
                isListening
                  ? 'bg-rose-950 border-rose-500 text-rose-300 animate-pulse'
                  : 'bg-obsidian-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-slate-100'
              }`}
              title={isListening ? 'Stop listening' : 'Start speech recognition'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Audio waveform visualization when listening */}
            {isListening && (
              <div className="flex items-center space-x-1 h-8 px-2 bg-obsidian-900 rounded-lg border border-slate-800">
                <span className="w-1 bg-cyan-400 rounded-full animate-bounce" style={{ height: `${Math.max(6, audioLevel * 0.4)}px` }} />
                <span className="w-1 bg-cyan-300 rounded-full animate-bounce delay-75" style={{ height: `${Math.max(10, audioLevel * 0.6)}px` }} />
                <span className="w-1 bg-emerald-400 rounded-full animate-bounce delay-150" style={{ height: `${Math.max(8, audioLevel * 0.5)}px` }} />
                <span className="w-1 bg-cyan-400 rounded-full animate-bounce delay-200" style={{ height: `${Math.max(12, audioLevel * 0.7)}px` }} />
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!inputText.trim() || isProcessing}
              className="flex items-center space-x-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-obsidian-950 font-bold text-xs transition duration-150 disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-cyan-950/40"
            >
              <span>{isProcessing ? 'Analyzing...' : 'Analyze Turn'}</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
