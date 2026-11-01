'use client';

import { useState, useEffect, useRef } from 'react';
import { Brain, BookOpen, FileText, CheckCircle2 } from 'lucide-react';

// ── Demo subjects ────────────────────────────────────────────────
const DEMOS = [
  {
    badge: 'UPSC CSE',
    title: "India's G20 Presidency",
    input: `India's G20 Presidency focused on inclusive growth, digital public infrastructure (DPI), and climate financing for developing nations. The 'One Earth, One Family, One Future' theme emphasised a human-centric, planet-first approach and centred the needs of the Global South.`,
    summary: "India's G20 Presidency centred on inclusive growth, DPI rollout, and climate finance — under the theme 'One Earth, One Family, One Future', spotlighting Global South priorities.",
    notes: [
      "Theme: 'One Earth, One Family, One Future'",
      "3 pillars: Inclusive growth · DPI · Climate finance",
      "Presidency period: Dec 2022 – Nov 2023",
      "Special focus: Needs of the Global South",
    ],
    mcq: {
      q: "India's G20 Presidency primarily focused on which three pillars?",
      options: [
        'Military alliances, space exploration, trade surplus',
        'Inclusive growth, Digital Public Infrastructure, climate finance',
        'Nuclear treaties, maritime security, currency reform',
        'Agricultural subsidies, demographic dividend, IT exports',
      ],
      correct: 1,
    },
  },
  {
    badge: 'SSC CGL',
    title: 'Indian Constitution',
    input: `The Constitution of India was adopted on 26 November 1949 and came into effect on 26 January 1950. Dr. B.R. Ambedkar chaired the Drafting Committee and is called the Father of the Indian Constitution. It is the world's longest written constitution.`,
    summary: "Indian Constitution adopted 26 Nov 1949; in force 26 Jan 1950. Dr. B.R. Ambedkar (Drafting Committee Chair) is its chief architect. World's longest written constitution.",
    notes: [
      'Adoption: 26 November 1949',
      'Enforcement: 26 January 1950 (Republic Day)',
      'Drafting Committee Chairman: Dr. B.R. Ambedkar',
      'Distinction: World\'s longest written constitution',
    ],
    mcq: {
      q: 'The Indian Constitution was enforced on which date?',
      options: [
        '15 August 1947',
        '26 November 1949',
        '26 January 1950',
        '2 October 1948',
      ],
      correct: 2,
    },
  },
  {
    badge: 'State PSC',
    title: 'NCERT Geography',
    input: `The Himalayas are young fold mountains formed by the collision of the Indian Plate with the Eurasian Plate approximately 50 million years ago. They form a continuous arc spanning 2,400 km from the Indus gorge in the west to the Brahmaputra gorge in the east.`,
    summary: "Himalayas = young fold mountains from Indian–Eurasian plate collision (~50 Ma). They arc 2,400 km from the Indus gorge to the Brahmaputra gorge.",
    notes: [
      'Type: Young fold mountains',
      'Origin: Indian Plate vs. Eurasian Plate collision',
      'Age: ~50 million years ago',
      'Span: 2,400 km — Indus gorge → Brahmaputra gorge',
    ],
    mcq: {
      q: 'How were the Himalayan mountains primarily formed?',
      options: [
        'Volcanic eruptions along a rift zone',
        'Indian Plate colliding with the Eurasian Plate',
        'Erosion and glacial deposits over millions of years',
        'Upwelling of magma from the ocean floor',
      ],
      correct: 1,
    },
  },
];

type OutputTab = 'summary' | 'notes' | 'mcq';

// ── Component ────────────────────────────────────────────────────
export function ProductDemo() {
  const [activeDemoIdx, setActiveDemoIdx] = useState(0);
  const [activeTab, setActiveTab] = useState<OutputTab>('summary');
  const [phase, setPhase] = useState<'idle' | 'generating'>('idle');
  const [inputVisible, setInputVisible] = useState(true);
  const [outputVisible, setOutputVisible] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const activeDemoRef = useRef(0);
  const containerRef  = useRef<HTMLDivElement>(null);

  // Pause the auto-cycle entirely while off-screen — on mobile, a transition
  // firing mid-scroll (fade-out/swap/fade-in changing panel height) is the
  // flicker; halting it outside the viewport removes the cause, not just the
  // symptom.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Auto-cycle every 7 s — only while visible
  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => {
      const next = (activeDemoRef.current + 1) % DEMOS.length;
      runTransition(next);
    }, 7000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible]);

  function runTransition(nextIdx: number) {
    // Fade out both panels
    setInputVisible(false);
    setOutputVisible(false);
    setPhase('generating');

    // Swap content mid-fade
    setTimeout(() => {
      activeDemoRef.current = nextIdx;
      setActiveDemoIdx(nextIdx);
      setActiveTab('summary');
      setInputVisible(true);
    }, 350);

    // Finish generating, reveal output
    setTimeout(() => {
      setPhase('idle');
      setOutputVisible(true);
    }, 1700);
  }

  function handleSelect(i: number) {
    if (i === activeDemoIdx || phase === 'generating') return;
    runTransition(i);
  }

  const demo = DEMOS[activeDemoIdx];

  return (
    <div ref={containerRef}>
      {/* Subject selector */}
      <div className="flex flex-wrap gap-2 mb-8">
        {DEMOS.map((d, i) => {
          const active = i === activeDemoIdx;
          return (
            <button
              key={d.badge}
              onClick={() => handleSelect(i)}
              aria-pressed={active}
              className={[
                'text-xs font-medium px-4 h-8 rounded-full border transition-colors duration-150 ease-out',
                active
                  ? 'bg-ink border-ink text-paper'
                  : 'bg-transparent border-rule-strong text-ink-muted hover:text-ink hover:border-edge',
                phase === 'generating' ? 'cursor-default' : 'cursor-pointer',
              ].join(' ')}
            >
              {d.badge}
            </button>
          );
        })}
      </div>

      {/* Browser chrome card */}
      <div className="rounded-lg overflow-hidden border border-rule shadow-lift-2 bg-paper-raised">
        {/* Fake browser bar */}
        <div className="flex items-center gap-2 px-5 py-3 bg-paper-deep border-b border-rule">
          {[0, 1, 2].map(i => (
            <div key={i} className="h-2.75 w-2.75 rounded-full bg-paper-gray border border-rule-strong" />
          ))}
          <span className="font-label text-xs ml-3 flex-1 min-w-0 truncate text-ink-faint">
            remindology.app/contents/{demo.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}
          </span>
        </div>

        {/* Two-panel content */}
        <div className="grid md:grid-cols-2" style={{ minHeight: 340 }}>

          {/* ── Left: Material input ────────────── */}
          <div className="p-5 md:p-7 border-b md:border-b-0 md:border-r border-rule">
            <div className="flex items-center gap-2 mb-4">
              <span className="font-label text-[10px] font-medium uppercase tracking-[0.12em] px-2.5 py-1 rounded-full border border-rule-strong text-ink">
                {demo.badge}
              </span>
              <span className="text-[11px] font-semibold text-ink-muted">
                {demo.title}
              </span>
            </div>

            <div
              className="rounded-md p-4 text-sm leading-relaxed bg-paper border border-rule text-ink transition-opacity duration-200 ease-out"
              style={{ opacity: inputVisible ? 1 : 0 }}
            >
              {demo.input}
            </div>

            <div className="mt-4 flex items-center gap-2 text-ink-muted" style={{ fontSize: '0.72rem' }}>
              <div className="h-1.5 w-1.5 rounded-full bg-gold" />
              AI processing complete · 2.1 s
            </div>
          </div>

          {/* ── Right: Output ───────────────────── */}
          <div className="p-5 md:p-7 flex flex-col" style={{ minHeight: 310 }}>

            {phase === 'generating' ? (
              /* Generating state */
              <div className="flex-1 flex flex-col items-center justify-center gap-4 py-6">
                <div className="flex gap-2.5">
                  {[0, 1, 2].map(i => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full bg-ink"
                      style={{
                        animationName: 'loadingBounce',
                        animationDuration: '0.9s',
                        animationDelay: `${i * 0.18}s`,
                        animationIterationCount: 'infinite',
                        animationTimingFunction: 'ease-in-out',
                      }}
                    />
                  ))}
                </div>
                <p className="text-xs font-medium text-ink-muted">
                  Analysing content…
                </p>
              </div>
            ) : (
              /* Output */
              <div
                className="transition-opacity duration-200 ease-out"
                style={{
                  opacity: outputVisible ? 1 : 0,
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {/* Output tab strip */}
                <div className="flex gap-1 mb-5 p-1 rounded-md bg-paper-deep border border-rule" role="tablist">
                  {(['summary', 'notes', 'mcq'] as OutputTab[]).map(tab => {
                    const active = activeTab === tab;
                    return (
                      <button
                        key={tab}
                        role="tab"
                        aria-selected={active}
                        onClick={() => setActiveTab(tab)}
                        className={[
                          'flex-1 text-xs font-semibold py-2 rounded-sm cursor-pointer transition-colors duration-150 ease-out',
                          active
                            ? 'bg-paper-raised text-ink shadow-lift-1'
                            : 'bg-transparent text-ink-muted hover:text-ink',
                        ].join(' ')}
                      >
                        {tab === 'summary' ? 'Summary' : tab === 'notes' ? 'Notes' : 'MCQs'}
                      </button>
                    );
                  })}
                </div>

                {/* Tab content — fixed minHeight prevents layout shift when switching tabs */}
                <div className="flex-1" style={{ minHeight: 230 }}>
                  {activeTab === 'summary' && (
                    <div className="rounded-md p-4 bg-paper border border-rule">
                      <div className="flex items-center gap-2 mb-2">
                        <Brain className="h-3.5 w-3.5 text-ink" />
                        <span className="font-label text-[11px] uppercase tracking-[0.12em] text-ink-muted">
                          AI Summary
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed text-ink">
                        {demo.summary}
                      </p>
                    </div>
                  )}

                  {activeTab === 'notes' && (
                    <div className="rounded-md p-4 bg-paper border border-rule">
                      <div className="flex items-center gap-2 mb-3">
                        <BookOpen className="h-3.5 w-3.5 text-ink" />
                        <span className="font-label text-[11px] uppercase tracking-[0.12em] text-ink-muted">
                          Revision Notes
                        </span>
                      </div>
                      <ul className="space-y-2">
                        {demo.notes.map((note, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-ink">
                            <span className="shrink-0 font-semibold text-ink-faint" style={{ lineHeight: 1.6 }}>
                              •
                            </span>
                            {note}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {activeTab === 'mcq' && (
                    <div className="rounded-md p-4 bg-paper border border-rule">
                      <div className="flex items-center gap-2 mb-3">
                        <FileText className="h-3.5 w-3.5 text-ink" />
                        <span className="font-label text-[11px] uppercase tracking-[0.12em] text-ink-muted">
                          Practice MCQ
                        </span>
                      </div>
                      <p className="text-xs font-semibold mb-3 text-ink">
                        {demo.mcq.q}
                      </p>
                      <div className="space-y-2">
                        {demo.mcq.options.map((opt, i) => {
                          const isCorrect = i === demo.mcq.correct;
                          return (
                            <div
                              key={i}
                              className={[
                                'flex items-center gap-2.5 text-xs px-3 py-2.5 rounded-md border text-ink',
                                isCorrect
                                  ? 'bg-paper-raised border-ink font-medium'
                                  : 'bg-paper-raised border-rule',
                              ].join(' ')}
                            >
                              <span
                                className={[
                                  'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold shrink-0',
                                  isCorrect ? 'bg-ink text-paper' : 'bg-paper-gray text-ink-muted',
                                ].join(' ')}
                              >
                                {String.fromCharCode(65 + i)}
                              </span>
                              <span className="flex-1">{opt}</span>
                              {isCorrect && (
                                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-ink" aria-label="Correct answer" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
