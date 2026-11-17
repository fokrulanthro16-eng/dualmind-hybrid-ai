import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DualMind — Hybrid AI Tactical Negotiation Teleprompter',
  description:
    '1st-place $30,000 Grand Prize submission for #BuildHybridAI 2026 Hackathon. Dual-Process Cognitive Engine combining On-Device Gemini Nano with Cloud Gemini Strategy.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-obsidian-950 text-slate-100 min-h-screen antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
        {children}
      </body>
    </html>
  );
}
