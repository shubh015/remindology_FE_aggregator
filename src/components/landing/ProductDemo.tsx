'use client';

import { useState, useEffect, useRef } from 'react';
import { Brain, BookOpen, FileText, CheckCircle2 } from 'lucide-react';

// ── Demo subjects ────────────────────────────────────────────────
const DEMOS = [
  {
    badge: 'UPSC CSE',
    color: '#7C3AED',
    bg: 'rgba(124,58,237,0.12)',
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
    color: '#0891B2',
    bg: 'rgba(8,145,178,0.12)',
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
    color: '#059669',
    bg: 'rgba(5,150,105,0.12)',
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
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {DEMOS.map((d, i) => (
          <button
            key={d.badge}
            onClick={() => handleSelect(i)}
            className="text-xs font-semibold px-4 py-2 rounded-full transition-all duration-200"
            style={{
              background: i === activeDemoIdx ? d.color : 'transparent',
              border: `1.5px solid ${i === activeDemoIdx ? d.color : 'rgba(124,58,237,0.18)'}`,
              color: i === activeDemoIdx ? '#FFFFFF' : '#6B63A0',
              cursor: phase === 'generating' ? 'default' : 'pointer',
              transform: i === activeDemoIdx ? 'scale(1.04)' : 'scale(1)',
            }}
          >
            {d.badge}
          </button>
        ))}
      </div>

      {/* Browser chrome card */}
      <div
        className="rounded-3xl overflow-hidden"
        style={{ border: '1px solid rgba(124,58,237,0.14)', boxShadow: '0 24px 64px rgba(124,58,237,0.12)' }}
      >
        {/* Fake browser bar */}
        <div
          className="flex items-center gap-2 px-5 py-3"
          style={{ background: '#09091F', borderBottom: '1px solid rgba(124,58,237,0.2)' }}
        >
          {['#EF4444', '#F59E0B', '#10B981'].map((c, i) => (
            <div key={i} style={{ background: c, width: 11, height: 11, borderRadius: '50%', opacity: 0.7 }} />
          ))}
          <span
            className="text-xs ml-3 flex-1 min-w-0 truncate"
            style={{ color: 'rgba(240,238,255,0.28)', fontFamily: 'monospace' }}
          >
            remindology.app/contents/{demo.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}
          </span>
        </div>

        {/* Two-panel content */}
        <div className="grid md:grid-cols-2" style={{ background: '#FFFFFF', minHeight: 340 }}>

          {/* ── Left: Material input ────────────── */}
          <div
            className="p-5 md:p-7 border-b md:border-b-0 md:border-r"
            style={{ borderColor: 'rgba(124,58,237,0.08)' }}
          >
            <div className="flex items-center gap-2 mb-4">
              <span
                className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                style={{ background: demo.bg, color: demo.color, transition: 'background 0.4s, color 0.4s' }}
              >
                {demo.badge}
              </span>
              <span className="text-[11px] font-semibold" style={{ color: '#9D95C4' }}>
                {demo.title}
              </span>
            </div>

            <div
              className="rounded-xl p-4 text-sm leading-relaxed"
              style={{
                background: '#F5F4FF',
                border: '1px solid rgba(124,58,237,0.08)',
                color: '#4B4580',
                opacity: inputVisible ? 1 : 0,
                transition: 'opacity 0.3s ease',
              }}
            >
              {demo.input}
            </div>

            <div
              className="mt-4 flex items-center gap-2"
              style={{ fontSize: '0.72rem', color: '#9D95C4' }}
            >
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
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
                      className="w-2.5 h-2.5 rounded-full"
                      style={{
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
                <p className="text-xs font-medium" style={{ color: '#9D95C4' }}>
                  Analysing content…
                </p>
              </div>
            ) : (
              /* Output */
              <div
                style={{
                  opacity: outputVisible ? 1 : 0,
                  transition: 'opacity 0.4s ease',
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {/* Output tab strip */}
                <div
                  className="flex gap-1 mb-5 p-1 rounded-xl"
                  style={{ background: '#F5F4FF' }}
                >
                  {(['summary', 'notes', 'mcq'] as OutputTab[]).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className="flex-1 text-xs font-semibold py-2 rounded-lg transition-all duration-150"
                      style={{
                        background: activeTab === tab ? '#FFFFFF' : 'transparent',
                        color: activeTab === tab ? '#7C3AED' : '#9D95C4',
                        boxShadow: activeTab === tab ? '0 1px 4px rgba(0,0,0,0.07)' : 'none',
                        cursor: 'pointer',
                        border: 'none',
                      }}
                    >
                      {tab === 'summary' ? 'Summary' : tab === 'notes' ? 'Notes' : 'MCQs'}
                    </button>
                  ))}
                </div>

                {/* Tab content — fixed minHeight prevents layout shift when switching tabs */}
                <div className="flex-1" style={{ minHeight: 230 }}>
                  {activeTab === 'summary' && (
                    <div
                      className="rounded-xl p-4"
                      style={{ background: '#F5F4FF', border: '1px solid rgba(124,58,237,0.08)' }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Brain className="h-3.5 w-3.5" style={{ color: '#7C3AED' }} />
                        <span className="text-[11px] font-bold" style={{ color: '#7C3AED' }}>
                          AI Summary
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed" style={{ color: '#4B4580' }}>
                        {demo.summary}
                      </p>
                    </div>
                  )}

                  {activeTab === 'notes' && (
                    <div
                      className="rounded-xl p-4"
                      style={{ background: '#F5F4FF', border: '1px solid rgba(124,58,237,0.08)' }}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <BookOpen className="h-3.5 w-3.5" style={{ color: '#7C3AED' }} />
                        <span className="text-[11px] font-bold" style={{ color: '#7C3AED' }}>
                          Revision Notes
                        </span>
                      </div>
                      <ul className="space-y-2">
                        {demo.notes.map((note, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-xs"
                            style={{ color: '#4B4580' }}
                          >
                            <span
                              className="shrink-0 font-bold"
                              style={{ color: '#7C3AED', lineHeight: 1.6 }}
                            >
                              •
                            </span>
                            {note}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {activeTab === 'mcq' && (
                    <div
                      className="rounded-xl p-4"
                      style={{ background: '#F5F4FF', border: '1px solid rgba(124,58,237,0.08)' }}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <FileText className="h-3.5 w-3.5" style={{ color: '#7C3AED' }} />
                        <span className="text-[11px] font-bold" style={{ color: '#7C3AED' }}>
                          Practice MCQ
                        </span>
                      </div>
                      <p
                        className="text-xs font-semibold mb-3"
                        style={{ color: '#1A1836' }}
                      >
                        {demo.mcq.q}
                      </p>
                      <div className="space-y-2">
                        {demo.mcq.options.map((opt, i) => {
                          const isCorrect = i === demo.mcq.correct;
                          return (
                            <div
                              key={i}
                              className="flex items-center gap-2.5 text-xs px-3 py-2.5 rounded-xl"
                              style={{
                                background: isCorrect
                                  ? 'rgba(5,150,105,0.08)'
                                  : '#FFFFFF',
                                border: `1px solid ${isCorrect
                                  ? 'rgba(5,150,105,0.25)'
                                  : 'rgba(124,58,237,0.08)'}`,
                                color: isCorrect ? '#059669' : '#4B4580',
                              }}
                            >
                              <span
                                className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                                style={{
                                  background: isCorrect
                                    ? '#059669'
                                    : 'rgba(124,58,237,0.1)',
                                  color: isCorrect ? '#FFFFFF' : '#7C3AED',
                                }}
                              >
                                {String.fromCharCode(65 + i)}
                              </span>
                              <span className="flex-1">{opt}</span>
                              {isCorrect && (
                                <CheckCircle2
                                  className="h-3.5 w-3.5 shrink-0"
                                  style={{ color: '#059669' }}
                                />
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
