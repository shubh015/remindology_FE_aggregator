'use client';

import { useState, useEffect } from 'react';

// ── Demo subjects that cycle automatically ────────────────────────
const SUBJECTS = [
  {
    badge: 'UPSC CSE',
    badgeColor: '#7C3AED',
    badgeBg:   'rgba(124,58,237,0.1)',
    title:     "India's G20 Presidency",
    slug:      'indias-g20-presidency',
    input:     "India's G20 Presidency focused on inclusive growth, digital public infrastructure, and climate financing. The 'One Earth, One Family, One Future' theme centred the needs of the Global South.",
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
    badgeColor: '#D97706',
    badgeBg:   'rgba(217,119,6,0.1)',
    title:     'Indian Constitution',
    slug:      'indian-constitution',
    input:     "The Constitution of India was adopted on 26 November 1949 and came into force on 26 January 1950. Dr. B.R. Ambedkar chaired the Drafting Committee. It is the world's longest written constitution.",
    outputs: [
      { icon: '📋', label: 'AI Summary' },
      { icon: '📒', label: '4 Revision Notes' },
      { icon: '🎯', label: '5 Practice MCQs' },
      { icon: '🏷️', label: '6 Key Topics' },
    ],
    time: '1.6s',
  },
];

// ── Light-card palette — matches ProductDemo.tsx's mockup colors ──
const TEXT_MID   = '#9D95C4';
const TEXT_BODY  = '#4B4580';
const SURFACE    = '#F5F4FF';
const BORDER_L   = 'rgba(124,58,237,0.08)';

type Phase = 'typing' | 'processing' | 'revealing' | 'complete' | 'exiting';

export function HeroPreview() {
  const [subjectIdx, setSubjectIdx]     = useState(0);
  const [phase, setPhase]               = useState<Phase>('typing');
  const [typedChars, setTypedChars]     = useState(0);
  const [revealedItems, setRevealedItems] = useState(0);
  const [cardVisible, setCardVisible]   = useState(true);

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

  const displayText    = subject.input.slice(0, typedChars);
  const showCursor     = phase === 'typing';
  // Nothing is revealed yet during typing — show the same loading state as
  // "processing" so the right panel is never blank on first paint.
  const showProcessing = phase === 'typing' || phase === 'processing';
  const processingLabel = phase === 'typing' ? 'Waiting for input…' : 'Analysing content…';
  const showComplete   = phase === 'revealing' || phase === 'complete' || phase === 'exiting';

  return (
    // Perspective wrapper — the tilt lives here so it doesn't fight the
    // opacity-fade transition on the card itself.
    <div className="group relative" style={{ perspective: '1400px' }}>
      {/* Shadow lives on its own layer and only ever transitions opacity —
          animating box-shadow directly alongside a 3D transform forces a
          repaint every frame and is what made the hover feel janky. */}
      <div
        className="absolute inset-2 rounded-2xl opacity-60 transition-opacity duration-1400 ease-in-out group-hover:opacity-100"
        style={{ boxShadow: '0 32px 80px rgba(124,58,237,0.22)' }}
      />
      <div
        style={{ opacity: cardVisible ? 1 : 0, transition: 'opacity 0.45s ease', willChange: 'transform' }}
        className={[
          'relative rounded-2xl overflow-hidden bg-white',
          'transform-[perspective(1400px)_rotateY(-7deg)_rotateX(2.5deg)]',
          'transition-transform duration-1400 ease-in-out',
          'backface-hidden',
          'group-hover:transform-[perspective(1400px)_rotateY(0deg)_rotateX(0deg)_scale(1.025)]',
        ].join(' ')}
      >
        {/* Browser bar — stays dark regardless of card theme, matching ProductDemo's mockup chrome */}
        <div
          className="flex items-center gap-2 px-4 py-3"
          style={{ background: '#09091F', borderBottom: '1px solid rgba(124,58,237,0.2)' }}
        >
          <div className="flex gap-1.5">
            {['#EF4444', '#F59E0B', '#10B981'].map((c, ci) => (
              <div key={ci} style={{ width: 9, height: 9, borderRadius: '50%', background: c, opacity: 0.7 }} />
            ))}
          </div>
          <span
            className="text-[10px] ml-3"
            style={{ color: 'rgba(255,255,255,0.32)', fontFamily: 'monospace' }}
          >
            remindology.app/contents/{subject.slug}
          </span>
        </div>

        {/* Two-panel content — fixed height so the reveal animation never shifts layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 text-left h-115 sm:h-75">

          {/* ── Left: material being typed ─────────────────────── */}
          <div className="p-5 border-b sm:border-b-0 sm:border-r overflow-hidden" style={{ borderColor: BORDER_L }}>
            <div className="flex items-center gap-2 mb-3">
              <span
                className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                style={{
                  background: subject.badgeBg,
                  color: subject.badgeColor,
                  transition: 'background 0.4s, color 0.4s',
                }}
              >
                {subject.badge}
              </span>
              <span className="text-[10px] truncate" style={{ color: TEXT_MID }}>
                {subject.title}
              </span>
            </div>

            <div
              className="text-[10px] leading-relaxed rounded-xl p-3"
              style={{
                background: SURFACE,
                border: `1px solid ${BORDER_L}`,
                color: TEXT_BODY,
                minHeight: 74,
              }}
            >
              {displayText}
              {showCursor && (
                <span
                  style={{
                    display: 'inline-block',
                    width: 2,
                    height: '0.85em',
                    background: '#7C3AED',
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
              className="flex items-center gap-1.5 mt-3"
              style={{
                fontSize: '0.6rem',
                color: '#059669',
                opacity: showComplete ? 1 : 0,
                transition: 'opacity 0.5s ease',
              }}
            >
              <div className="h-1.5 w-1.5 rounded-full" style={{ background: '#34D399' }} />
              AI analysis complete · {subject.time}
            </div>
          </div>

          {/* ── Right: AI outputs ──────────────────────────────── */}
          <div className="p-5 flex flex-col overflow-hidden">
            <p
              className="text-[9px] font-bold uppercase tracking-widest mb-3"
              style={{ color: TEXT_MID }}
            >
              Study Kit Generated
            </p>

            {showProcessing ? (
              // Bouncing "analysing" dots
              <div className="flex-1 flex flex-col items-center justify-center gap-2.5 py-2">
                <div className="flex gap-2">
                  {[0, 1, 2].map(i => (
                    <div
                      key={i}
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #7C3AED, #C026D3)',
                        animationName: 'loadingBounce',
                        animationDuration: '0.9s',
                        animationDelay: `${i * 0.18}s`,
                        animationIterationCount: 'infinite',
                        animationTimingFunction: 'ease-in-out',
                      }}
                    />
                  ))}
                </div>
                <p style={{ fontSize: '0.62rem', color: TEXT_MID }}>
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
                      className="flex items-center justify-between px-3 py-1.5 rounded-lg"
                      style={{
                        background: SURFACE,
                        border: `1px solid ${BORDER_L}`,
                        animationName: 'slideReveal',
                        animationDuration: '0.35s',
                        animationTimingFunction: 'ease-out',
                        animationFillMode: 'both',
                      }}
                    >
                      <span className="text-[10px]" style={{ color: TEXT_BODY }}>
                        {item.icon} {item.label}
                      </span>
                      <span className="text-[9px] font-bold" style={{ color: '#059669' }}>
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
    </div>
  );
}
