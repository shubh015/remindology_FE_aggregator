'use client';

import { useState, useEffect } from 'react';

// ── Demo subjects that cycle automatically ────────────────────────
const SUBJECTS = [
  {
    badge: 'UPSC CSE',
    badgeColor: '#7C3AED',
    badgeBg:   'rgba(124,58,237,0.22)',
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
    badgeBg:   'rgba(217,119,6,0.22)',
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
  const showProcessing = phase === 'processing';
  const showComplete   = phase === 'revealing' || phase === 'complete' || phase === 'exiting';

  return (
    <div style={{ opacity: cardVisible ? 1 : 0, transition: 'opacity 0.45s ease' }}>
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(167,139,250,0.22)',
          boxShadow: '0 32px 80px rgba(124,58,237,0.16)',
        }}
      >
        {/* Browser bar */}
        <div
          className="flex items-center gap-2 px-4 py-3"
          style={{ background: 'rgba(0,0,0,0.32)', borderBottom: '1px solid rgba(167,139,250,0.1)' }}
        >
          <div className="flex gap-1.5">
            {['#EF4444', '#F59E0B', '#10B981'].map((c, ci) => (
              <div key={ci} style={{ width: 9, height: 9, borderRadius: '50%', background: c, opacity: 0.55 }} />
            ))}
          </div>
          <span
            className="text-[10px] ml-3"
            style={{ color: 'rgba(240,238,255,0.2)', fontFamily: 'monospace' }}
          >
            remindology.app/contents/{subject.slug}
          </span>
        </div>

        {/* Two-panel content */}
        <div className="grid grid-cols-2 text-left" style={{ minHeight: 160 }}>

          {/* ── Left: material being typed ─────────────────────── */}
          <div className="p-5" style={{ borderRight: '1px solid rgba(167,139,250,0.08)' }}>
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
              <span className="text-[10px] truncate" style={{ color: 'rgba(196,181,253,0.36)' }}>
                {subject.title}
              </span>
            </div>

            <div
              className="text-[10px] leading-relaxed rounded-xl p-3"
              style={{
                background: 'rgba(124,58,237,0.08)',
                border: '1px solid rgba(167,139,250,0.1)',
                color: 'rgba(196,181,253,0.58)',
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
                    background: '#A78BFA',
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
                color: 'rgba(52,211,153,0.72)',
                opacity: showComplete ? 1 : 0,
                transition: 'opacity 0.5s ease',
              }}
            >
              <div className="h-1.5 w-1.5 rounded-full" style={{ background: '#34D399' }} />
              AI analysis complete · {subject.time}
            </div>
          </div>

          {/* ── Right: AI outputs ──────────────────────────────── */}
          <div className="p-5 flex flex-col">
            <p
              className="text-[9px] font-bold uppercase tracking-widest mb-3"
              style={{ color: 'rgba(196,181,253,0.30)' }}
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
                <p style={{ fontSize: '0.62rem', color: 'rgba(196,181,253,0.42)' }}>
                  Analysing content…
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
                        background: 'rgba(124,58,237,0.07)',
                        border: '1px solid rgba(167,139,250,0.09)',
                        animationName: 'slideReveal',
                        animationDuration: '0.35s',
                        animationTimingFunction: 'ease-out',
                        animationFillMode: 'both',
                      }}
                    >
                      <span className="text-[10px]" style={{ color: 'rgba(196,181,253,0.52)' }}>
                        {item.icon} {item.label}
                      </span>
                      <span className="text-[9px] font-bold" style={{ color: '#34D399' }}>
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
