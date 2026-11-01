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

function ToneCell({ tone, text }: { tone: 'good' | 'bad' | 'mid'; text: string }) {
  const Icon = { good: Check, bad: X, mid: Minus }[tone];
  const good = tone === 'good';
  return (
    <div className="flex items-start gap-2.5">
      <Icon
        className={`mt-0.5 h-4 w-4 shrink-0 ${good ? 'text-ink' : 'text-ink-faint'}`}
        strokeWidth={good ? 2.25 : 1.75}
        aria-hidden="true"
      />
      <span className={`text-[14px] leading-snug ${good ? 'text-ink' : 'text-ink-faint'}`}>
        {text}
      </span>
    </div>
  );
}

export function WhyRemindology() {
  return (
    <div className="card-quiet overflow-hidden">
      {/* Header row */}
      <div className="grid grid-cols-[1.1fr_1fr_1.15fr]">
        <div className="p-4 sm:p-5" />
        <div className="p-4 sm:p-5 text-center border-l border-rule">
          <p className="text-xs sm:text-sm font-medium text-ink-muted">
            The Old Way
          </p>
          <p className="font-label text-[10px] uppercase tracking-[0.12em] mt-1 hidden sm:block text-ink-faint">
            Manual grind
          </p>
        </div>
        <div className="p-4 sm:p-5 text-center border-l border-rule">
          <p className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-ink">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden="true" />
            Remindology
          </p>
          <p className="font-label text-[10px] uppercase tracking-[0.12em] mt-1 hidden sm:block text-ink-muted">
            AI study OS
          </p>
        </div>
      </div>

      {/* Body rows */}
      {ROWS.map((row) => (
        <div
          key={row.dimension}
          className="grid grid-cols-[1.1fr_1fr_1.15fr] items-stretch border-t border-rule"
        >
          <div className="p-4 sm:p-5 flex items-center">
            <p className="text-[14px] font-medium leading-snug text-ink">
              {row.dimension}
            </p>
          </div>
          <div className="p-4 sm:p-5 flex items-center border-l border-rule">
            <ToneCell tone={row.manual.tone} text={row.manual.text} />
          </div>
          <div className="p-4 sm:p-5 flex items-center border-l border-rule">
            <ToneCell tone={row.us.tone} text={row.us.text} />
          </div>
        </div>
      ))}

      {/* Footer strip */}
      <div className="flex items-center justify-center gap-2 py-3.5 px-4 text-center bg-paper-deep border-t border-rule">
        <Clock className="h-3.5 w-3.5 shrink-0 text-ink" />
        <p className="text-xs font-medium text-ink-muted">
          Students save an average of 5+ hours every week
        </p>
      </div>
    </div>
  );
}
