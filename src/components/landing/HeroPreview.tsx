'use client';

import { useState, useEffect } from 'react';

// ── Demo subjects that cycle automatically ────────────────────────
const SUBJECTS = [
  {
    badge: 'UPSC CSE',
    title: "India's G20 Presidency",
    slug: 'indias-g20-presidency',
    input: "India's G20 Presidency focused on inclusive growth, digital public infrastructure, and climate financing. The 'One Earth, One Family, One Future' theme centred the needs of the Global South.",
    outputs: [
      { icon: '📋', label: 'AI Summary' },
      { icon: '📒', label: '4 Revision Notes' },
      { icon: '🎯', label: '5 Practice MCQs' },
      { icon: '🏷️', label: '6 Key Topics' },
    ],
    time: '1.8s',
  },
  {
    badge: 'SSC CGL',
    title: 'Indian Constitution',
    slug: 'indian-constitution',
    input: "The Constitution of India was adopted on 26 November 1949 and came into force on 26 January 1950. Dr. B.R. Ambedkar chaired the Drafting Committee. It is the world's longest written constitution.",
    outputs: [
      { icon: '📋', label: 'AI Summary' },
      { icon: '📒', label: '4 Revision Notes' },
      { icon: '🎯', label: '5 Practice MCQs' },
      { icon: '🏷️', label: '6 Key Topics' },
    ],
    time: '1.6s',
  },
];

type Phase = 'typing' | 'processing' | 'revealing' | 'complete' | 'exiting';

export function HeroPreview() {
  const [subjectIdx, setSubjectIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>('typing');
  const [typedChars, setTypedChars] = useState(0);
  const [revealedItems, setRevealedItems] = useState(0);
  const [cardVisible, setCardVisible] = useState(true);

  const subject = SUBJECTS[subjectIdx];

  // ── Typewriter ────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'typing') return;
    if (typedChars >= subject.input.length) { setPhase('processing'); return; }
    const t = setTimeout(() => setTypedChars(c => c + 1), 22);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, typedChars]);

  // ── Processing → Revealing ────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'processing') return;
    const t = setTimeout(() => setPhase('revealing'), 1400);
    return () => clearTimeout(t);
  }, [phase]);

  // ── Reveal items one by one ───────────────────────────────────────
  useEffect(() => {
    if (phase !== 'revealing') return;
    if (revealedItems >= subject.outputs.length) { setPhase('complete'); return; }
    const t = setTimeout(() => setRevealedItems(r => r + 1), 420);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, revealedItems]);

  // ── Pause then exit ───────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'complete') return;
    const t = setTimeout(() => setPhase('exiting'), 2400);
    return () => clearTimeout(t);
  }, [phase]);

  // ── Fade out, advance subject ─────────────────────────────────────
  useEffect(() => {
    if (phase !== 'exiting') return;
    setCardVisible(false);
    const t = setTimeout(() => {
      setSubjectIdx(i => (i + 1) % SUBJECTS.length);
      setTypedChars(0);
      setRevealedItems(0);
      setCardVisible(true);
      setPhase('typing');
    }, 500);
    return () => clearTimeout(t);
  }, [phase]);

  const displayText = subject.input.slice(0, typedChars);
  const showCursor = phase === 'typing';
  // Nothing is revealed yet during typing — show the same loading state as
  // "processing" so the right panel is never blank on first paint.
  const showProcessing = phase === 'typing' || phase === 'processing';
  const processingLabel = phase === 'typing' ? 'Waiting for input…' : 'Analysing content…';
  const showComplete = phase === 'revealing' || phase === 'complete' || phase === 'exiting';

  return (
    <div
      style={{ opacity: cardVisible ? 1 : 0 }}
      className="relative rounded-lg overflow-hidden bg-paper-raised border border-rule shadow-lift-2 transition-opacity duration-200 ease-out"
    >
      {/* Browser bar */}
      <div className="flex items-center gap-2 px-4 py-3 bg-paper-deep border-b border-rule">
        <div className="flex gap-1.5">
          {[0, 1, 2].map(ci => (
            <div key={ci} className="h-2.25 w-2.25 rounded-full bg-paper-gray border border-rule-strong" />
          ))}
        </div>
        <span className="font-label text-[10px] ml-3 truncate text-ink-faint">
          remindology.app/contents/{subject.slug}
        </span>
      </div>

      {/* Two-panel content — fixed height so the reveal animation never shifts layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 text-left h-115 sm:h-75">

        {/* ── Left: material being typed ─────────────────────── */}
        <div className="p-5 border-b sm:border-b-0 sm:border-r border-rule overflow-hidden">
          <div className="flex items-center gap-2 mb-3">
            <span className="font-label text-[9px] font-medium uppercase tracking-[0.12em] px-2 py-0.5 rounded-full border border-rule-strong bg-paper-raised text-ink">
              {subject.badge}
            </span>
            <span className="text-[10px] truncate text-ink-muted">
              {subject.title}
            </span>
          </div>

          <div
            className="text-[10px] leading-relaxed rounded-md p-3 bg-paper border border-rule text-ink"
            style={{ minHeight: 74 }}
          >
            {displayText}
            {showCursor && (
              <span
                className="bg-ink"
                style={{
                  display: 'inline-block',
                  width: 2,
                  height: '0.85em',
                  verticalAlign: 'middle',
                  marginLeft: 2,
                  borderRadius: 1,
                  animationName: 'blinkCursor',
                  animationDuration: '0.8s',
                  animationTimingFunction: 'ease-in-out',
                  animationIterationCount: 'infinite',
                }}
              />
            )}
          </div>

          {/* "Complete" status */}
          <div
            className="flex items-center gap-1.5 mt-3 text-ink-muted transition-opacity duration-200 ease-out"
            style={{ fontSize: '0.6rem', opacity: showComplete ? 1 : 0 }}
          >
            <div className="h-1.5 w-1.5 rounded-full bg-gold" />
            AI analysis complete · {subject.time}
          </div>
        </div>

        {/* ── Right: AI outputs ──────────────────────────────── */}
        <div className="p-5 flex flex-col overflow-hidden">
          <p className="font-label text-[9px] font-medium uppercase tracking-[0.12em] mb-3 text-ink-muted">
            Study Kit Generated
          </p>

          {showProcessing ? (
            // "Analysing" dots — a functional generating indicator
            <div className="flex-1 flex flex-col items-center justify-center gap-2.5 py-2">
              <div className="flex gap-2">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className="bg-ink"
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      animationName: 'loadingBounce',
                      animationDuration: '0.9s',
                      animationDelay: `${i * 0.18}s`,
                      animationIterationCount: 'infinite',
                      animationTimingFunction: 'ease-in-out',
                    }}
                  />
                ))}
              </div>
              <p className="text-ink-muted" style={{ fontSize: '0.62rem' }}>
                {processingLabel}
              </p>
            </div>
          ) : (
            // Items revealed one by one
            <div className="space-y-2">
              {subject.outputs.map((item, i) =>
                i < revealedItems ? (
                  <div
                    key={`${subjectIdx}-${i}`}
                    className="flex items-center justify-between px-3 py-1.5 rounded-md bg-paper border border-rule"
                    style={{
                      animationName: 'slideReveal',
                      animationDuration: '0.2s',
                      animationTimingFunction: 'ease-out',
                      animationFillMode: 'both',
                    }}
                  >
                    <span className="text-[10px] text-ink">
                      {item.icon} {item.label}
                    </span>
                    <span className="text-[9px] font-semibold text-ink-muted">
                      ✓ Done
                    </span>
                  </div>
                ) : null
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
