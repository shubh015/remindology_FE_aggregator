'use client';

import { Check, X, Clock, Minus } from 'lucide-react';

// ── Comparison rows: the manual study grind vs Remindology ────────
const ROWS = [
  {
    dimension: 'Turning a chapter into notes',
    manual: { text: '30–45 min of highlighting & rewriting', tone: 'bad' as const },
    us:     { text: 'Structured notes in under 10 seconds', tone: 'good' as const },
  },
  {
    dimension: 'Getting practice MCQs',
    manual: { text: 'Hunt through question banks & PDFs', tone: 'bad' as const },
    us:     { text: 'Auto-generated from your own material', tone: 'good' as const },
  },
  {
    dimension: 'Mains answer feedback',
    manual: { text: 'Wait days for a mentor — if available', tone: 'bad' as const },
    us:     { text: 'Instant AI scorecard, section by section', tone: 'good' as const },
  },
  {
    dimension: 'Knowing your weak areas',
    manual: { text: 'A gut feeling, no real data', tone: 'mid' as const },
    us:     { text: 'Weak-zone tracker across every attempt', tone: 'good' as const },
  },
  {
    dimension: 'Current affairs',
    manual: { text: 'Read 3 newspapers, make your own links', tone: 'mid' as const },
    us:     { text: 'Daily digest, pre-tagged to the syllabus', tone: 'good' as const },
  },
  {
    dimension: 'Staying consistent',
    manual: { text: 'Motivation runs out by week two', tone: 'bad' as const },
    us:     { text: 'Daily streak challenge keeps you hooked', tone: 'good' as const },
  },
  {
    dimension: 'Cost',
    manual: { text: '₹50,000+ coaching, per subject books', tone: 'bad' as const },
    us:     { text: 'Free to start — no credit card', tone: 'good' as const },
  },
];

const BRAND_GRAD = 'linear-gradient(135deg, #7C3AED, #C026D3)';
const TEXT_DARK  = '#1A1836';
const TEXT_MID   = '#6B63A0';

function ToneCell({ tone, text }: { tone: 'good' | 'bad' | 'mid'; text: string }) {
  const cfg = {
    good: { Icon: Check, color: '#059669', bg: 'rgba(5,150,105,0.1)' },
    bad:  { Icon: X,     color: '#F43F5E', bg: 'rgba(244,63,94,0.1)' },
    mid:  { Icon: Minus, color: '#D97706', bg: 'rgba(217,119,6,0.1)' },
  }[tone];
  const { Icon, color, bg } = cfg;
  return (
    <div className="flex items-start gap-2.5">
      <span
        className="mt-0.5 h-5 w-5 rounded-full flex items-center justify-center shrink-0"
        style={{ background: bg }}
      >
        <Icon className="h-3 w-3" style={{ color }} strokeWidth={3} />
      </span>
      <span className="text-[13px] leading-snug" style={{ color: tone === 'good' ? TEXT_DARK : TEXT_MID }}>
        {text}
      </span>
    </div>
  );
}

export function WhyRemindology() {
  return (
    <div
      className="rounded-3xl overflow-hidden"
      style={{ border: '1px solid rgba(124,58,237,0.14)', boxShadow: '0 20px 60px rgba(124,58,237,0.1)' }}
    >
      {/* Header row */}
      <div className="grid grid-cols-[1.1fr_1fr_1.15fr]">
        <div className="p-4 sm:p-5" style={{ background: '#FAFAFF' }} />
        <div
          className="p-4 sm:p-5 text-center border-l"
          style={{ background: '#FAFAFF', borderColor: 'rgba(124,58,237,0.1)' }}
        >
          <p className="text-xs sm:text-sm font-bold" style={{ color: TEXT_MID }}>
            The Old Way
          </p>
          <p className="text-[10px] mt-0.5 hidden sm:block" style={{ color: '#A79FCB' }}>
            Manual grind
          </p>
        </div>
        <div
          className="p-4 sm:p-5 text-center relative overflow-hidden"
          style={{ background: BRAND_GRAD }}
        >
          <p className="text-xs sm:text-sm font-bold text-white">Remindology</p>
          <p className="text-[10px] mt-0.5 hidden sm:block" style={{ color: 'rgba(255,255,255,0.7)' }}>
            AI study OS
          </p>
        </div>
      </div>

      {/* Body rows */}
      {ROWS.map((row, i) => (
        <div
          key={row.dimension}
          className="grid grid-cols-[1.1fr_1fr_1.15fr] items-stretch"
          style={{
            background: i % 2 === 0 ? '#FFFFFF' : '#FCFBFF',
            borderTop: '1px solid rgba(124,58,237,0.07)',
          }}
        >
          <div className="p-4 sm:p-5 flex items-center">
            <p className="text-[13px] font-semibold leading-snug" style={{ color: TEXT_DARK }}>
              {row.dimension}
            </p>
          </div>
          <div className="p-4 sm:p-5 flex items-center border-l" style={{ borderColor: 'rgba(124,58,237,0.07)' }}>
            <ToneCell tone={row.manual.tone} text={row.manual.text} />
          </div>
          <div
            className="p-4 sm:p-5 flex items-center border-l"
            style={{ borderColor: 'rgba(124,58,237,0.07)', background: 'rgba(124,58,237,0.035)' }}
          >
            <ToneCell tone={row.us.tone} text={row.us.text} />
          </div>
        </div>
      ))}

      {/* Footer strip */}
      <div
        className="flex items-center justify-center gap-2 py-3.5 px-4 text-center"
        style={{ background: 'rgba(124,58,237,0.05)', borderTop: '1px solid rgba(124,58,237,0.1)' }}
      >
        <Clock className="h-3.5 w-3.5 shrink-0" style={{ color: '#7C3AED' }} />
        <p className="text-xs font-semibold" style={{ color: '#7C3AED' }}>
          Students save an average of 5+ hours every week
        </p>
      </div>
    </div>
  );
}
