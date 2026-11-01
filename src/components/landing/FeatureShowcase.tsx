'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Upload,
  Brain,
  BookOpen,
  Target,
  FileText,
  BarChart3,
  Sparkles,
  ArrowUp,
} from 'lucide-react';
import { MobileFeatureCarousel } from './MobileFeatureCarousel';

// ── Shared mono class strings ──
const LABEL = 'font-label text-[11px] uppercase tracking-[0.12em] text-ink-muted';
const INSET = 'rounded-md border border-rule bg-paper';
const TAG = 'font-label text-[10px] uppercase tracking-[0.08em] px-2 py-0.5 rounded-full border border-rule bg-paper-gray text-ink-muted';

// ── Feature metadata ─────────────────────────────────────────────
const FEATURES = [
  {
    id: 'upload',
    icon: Upload,
    label: 'Upload Content',
    tagline: 'Any text, article, or document',
  },
  {
    id: 'summary',
    icon: Brain,
    label: 'AI Summary',
    tagline: 'Exam-focused key points',
  },
  {
    id: 'notes',
    icon: BookOpen,
    label: 'Revision Notes',
    tagline: 'Structured for quick recall',
  },
  {
    id: 'mcq',
    icon: Target,
    label: 'Practice MCQs',
    tagline: 'Auto-generated from your material',
  },
  {
    id: 'topics',
    icon: FileText,
    label: 'Key Topics',
    tagline: 'Core concepts extracted',
  },
  {
    id: 'progress',
    icon: BarChart3,
    label: 'Progress Library',
    tagline: 'Track your entire study library',
  },
] as const;

type FeatureId = typeof FEATURES[number]['id'];

// ── Individual mockup panels ─────────────────────────────────────

function PanelHeader({ icon: Icon, title, tag }: { icon: React.ElementType; title: string; tag?: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon className="h-3.5 w-3.5 text-ink" strokeWidth={1.75} />
      <span className="text-xs font-semibold text-ink">{title}</span>
      {tag && <span className={`ml-auto ${TAG}`}>{tag}</span>}
    </div>
  );
}

function UploadMockup() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-5">
        <div className="h-8 w-8 rounded-md border border-rule bg-paper-deep flex items-center justify-center">
          <Sparkles className="h-4 w-4 text-ink" strokeWidth={1.75} />
        </div>
        <div>
          <p className="text-sm font-semibold text-ink">
            Upload Study Material
          </p>
          <p className="text-[11px] text-ink-muted">
            Paste any article, chapter, or notes
          </p>
        </div>
      </div>

      <div>
        <label className={`${LABEL} mb-1.5 block`}>
          Document Title
        </label>
        <div className={`${INSET} px-3.5 py-2.5 text-xs text-ink-muted`}>
          e.g., GS Paper 2 — Indo-Pacific Relations
        </div>
      </div>

      <div>
        <label className={`${LABEL} mb-1.5 block`}>
          Content
        </label>
        <div className={`${INSET} p-3.5 text-xs text-ink-muted`} style={{ minHeight: 80 }}>
          Paste your article, editorial, or study notes here…
        </div>
        <div className="flex items-center justify-between mt-1.5 text-[10px] text-ink-muted">
          <span>0 words · 0 chars</span>
          <span>Plain text</span>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-3 border-t border-rule">
        <p className="flex-1 min-w-0 text-[10px] text-ink-muted">
          AI will generate summary, notes, MCQs &amp; topics
        </p>
        <div
          className="flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-md bg-ink text-paper shrink-0"
          style={{ cursor: 'default' }}
        >
          <ArrowUp className="h-3.5 w-3.5" />
          Analyse
        </div>
      </div>
    </div>
  );
}

function SummaryMockup() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <span className={TAG}>UPSC CSE</span>
        <span className="text-xs text-ink-muted">
          India&apos;s G20 Presidency
        </span>
      </div>

      <div className={`${INSET} p-4`}>
        <div className="flex items-center gap-2 mb-2">
          <Brain className="h-3.5 w-3.5 text-ink" strokeWidth={1.75} />
          <span className="text-[11px] font-semibold text-ink">AI Summary</span>
        </div>
        <p className="text-xs leading-relaxed text-ink-muted">
          India&apos;s G20 Presidency centred on 3 priorities: inclusive growth, DPI
          (Digital Public Infrastructure), and climate finance — under the theme
          &apos;One Earth, One Family, One Future&apos;, spotlighting the Global South.
        </p>
      </div>

      <div className={`${INSET} p-4`}>
        <div className="flex items-center gap-2 mb-2">
          <Brain className="h-3.5 w-3.5 text-ink" strokeWidth={1.75} />
          <span className="text-[11px] font-semibold text-ink">AI Summary</span>
        </div>
        <p className="text-xs leading-relaxed text-ink-muted">
          Indian Constitution adopted 26 Nov 1949; enforced 26 Jan 1950.
          Dr. B.R. Ambedkar (Drafting Committee Chair) is its chief architect.
          World&apos;s longest written constitution.
        </p>
      </div>

      <div className="flex items-center gap-1.5 text-[11px] text-ink-muted">
        <div className="h-1.5 w-1.5 rounded-full bg-ink" />
        2 summaries generated · avg 1.9 s each
      </div>
    </div>
  );
}

function NotesMockup() {
  const items = [
    "Theme: 'One Earth, One Family, One Future'",
    '3 pillars: Inclusive growth · DPI · Climate finance',
    'Presidency period: Dec 2022 – Nov 2023',
    'Special spotlight on Global South nations',
  ];
  return (
    <div className="space-y-3">
      <PanelHeader icon={BookOpen} title="Revision Notes" tag="4 points" />
      {items.map((note, i) => (
        <div key={i} className={`flex items-start gap-3 ${INSET} px-3.5 py-3`}>
          <div className="w-5 h-5 rounded-full border border-rule-strong bg-paper-raised flex items-center justify-center font-label text-[10px] text-ink shrink-0 mt-0.5">
            {i + 1}
          </div>
          <span className="text-xs leading-relaxed text-ink-soft">
            {note}
          </span>
        </div>
      ))}
    </div>
  );
}

function MCQMockup() {
  const options = [
    { text: 'Military alliances, space exploration', correct: false },
    { text: 'Inclusive growth, Digital Public Infrastructure, climate finance', correct: true },
    { text: 'Nuclear treaties, maritime security', correct: false },
    { text: 'Agricultural subsidies, IT exports', correct: false },
  ];
  return (
    <div className="space-y-3">
      <PanelHeader icon={Target} title="Practice MCQ" tag="Q 1 of 5" />
      <p className="text-xs font-semibold mb-4 text-ink">
        India&apos;s G20 Presidency primarily focused on which three pillars?
      </p>
      {options.map((opt, i) => (
        <div
          key={i}
          className={`flex items-center gap-2.5 text-xs px-3 py-2.5 rounded-md border ${
            opt.correct ? 'border-ink bg-paper-raised text-ink font-medium' : 'border-rule bg-paper text-ink-muted'
          }`}
        >
          <span
            className={`w-5 h-5 rounded-full flex items-center justify-center font-label text-[10px] shrink-0 ${
              opt.correct ? 'bg-ink text-paper' : 'border border-rule bg-paper-gray text-ink-muted'
            }`}
          >
            {String.fromCharCode(65 + i)}
          </span>
          <span className="flex-1">{opt.text}</span>
          {opt.correct && (
            <span className="text-[10px] font-semibold text-ink">✓</span>
          )}
        </div>
      ))}
    </div>
  );
}

function TopicsMockup() {
  const topics = [
    { t: 'G20 Presidency', cat: 'Main Topic' },
    { t: 'Digital Public Infrastructure', cat: 'Key Concept' },
    { t: 'Climate Finance', cat: 'Key Concept' },
    { t: 'Global South',   cat: 'Term' },
    { t: 'Inclusive Growth', cat: 'Term' },
    { t: 'One Earth Philosophy', cat: 'Theme' },
  ];
  // Categories are distinguished by weight/border instead of hue.
  const catClass: Record<string, string> = {
    'Main Topic':  'border-ink text-ink font-semibold bg-paper-raised',
    'Key Concept': 'border-rule-strong text-ink bg-paper-raised',
    'Term':        'border-rule text-ink-soft bg-paper-gray',
    'Theme':       'border-dashed border-rule-strong text-ink-muted bg-paper',
  };
  return (
    <div className="space-y-4">
      <PanelHeader icon={FileText} title="Key Topics" tag="6 extracted" />
      <div className="flex flex-wrap gap-2">
        {topics.map(tp => (
          <div
            key={tp.t}
            className={`text-xs font-medium px-3 py-1.5 rounded-full border ${catClass[tp.cat]}`}
          >
            {tp.t}
          </div>
        ))}
      </div>
      <div className="pt-4 border-t border-rule">
        <p className={`${LABEL} mb-2`}>
          Category legend
        </p>
        <div className="flex flex-wrap gap-1.5">
          {['Main Topic', 'Key Concept', 'Term', 'Theme'].map(l => (
            <span
              key={l}
              className={`text-[10px] px-2 py-1 rounded-full border ${catClass[l]}`}
            >
              {l}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProgressMockup() {
  const stats = [
    { label: 'Total Uploads', value: '24' },
    { label: 'AI Completed',  value: '21' },
    { label: 'Processing',    value: '3' },
  ];
  const items = [
    { title: "India's G20 Presidency",    status: 'COMPLETED', date: 'Jun 24' },
    { title: 'NCERT Polity — Ch. 3',       status: 'COMPLETED', date: 'Jun 23' },
    { title: 'SSC Maths Practice Set 7',   status: 'PROCESSING', date: 'Jun 24' },
  ];
  return (
    <div className="space-y-4">
      <PanelHeader icon={BarChart3} title="Progress Library" />
      <div className="grid grid-cols-3 gap-2">
        {stats.map(s => (
          <div
            key={s.label}
            className={`${INSET} p-2.5 text-center min-w-0 overflow-hidden`}
          >
            <div className="font-display font-light text-3xl leading-none text-ink">
              {s.value}
            </div>
            <div className="font-label text-[9px] uppercase tracking-[0.08em] mt-1 leading-tight wrap-break-word text-ink-muted">
              {s.label}
            </div>
          </div>
        ))}
      </div>
      <div className="space-y-2">
        {items.map(item => (
          <div
            key={item.title}
            className={`flex items-center gap-3 ${INSET} px-3 py-2.5`}
          >
            <div className="w-7 h-7 rounded-md border border-rule bg-paper-deep flex items-center justify-center shrink-0">
              <FileText className="h-3.5 w-3.5 text-ink" strokeWidth={1.75} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate text-ink">
                {item.title}
              </p>
              <p className="text-[10px] text-ink-muted">
                {item.date}
              </p>
            </div>
            <span
              className={`font-label text-[9px] tracking-[0.06em] px-2 py-1 rounded-full shrink-0 border ${
                item.status === 'COMPLETED'
                  ? 'border-rule-strong bg-paper-raised text-ink'
                  : 'border-rule bg-paper-gray text-ink-muted'
              }`}
            >
              {item.status === 'COMPLETED' ? '✓ ' : ''}{item.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Mockup({ id }: { id: FeatureId }) {
  switch (id) {
    case 'upload':   return <UploadMockup />;
    case 'summary':  return <SummaryMockup />;
    case 'notes':    return <NotesMockup />;
    case 'mcq':      return <MCQMockup />;
    case 'topics':   return <TopicsMockup />;
    case 'progress': return <ProgressMockup />;
  }
}

// ── FeatureShowcase ──────────────────────────────────────────────
const AUTO_ROTATE_MS = 4500;

export function FeatureShowcase() {
  const [active, setActive]             = useState(0);
  const [panelVisible, setPanelVisible] = useState(true);
  const [animKey, setAnimKey]           = useState(0);
  const [isVisible, setIsVisible]       = useState(false);
  const activeRef    = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => { activeRef.current = active; }, [active]);

  // Flip animationPlayState so the CSS animation pauses when scrolled off-screen
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

  // Called by onAnimationEnd — no setInterval needed
  const advanceTab = useCallback(() => {
    setPanelVisible(false);
    setTimeout(() => {
      setActive((activeRef.current + 1) % FEATURES.length);
      setAnimKey(k => k + 1);
      setPanelVisible(true);
    }, 200);
  }, []);

  const handleSelect = useCallback((i: number) => {
    if (i === activeRef.current) return;
    setPanelVisible(false);
    setTimeout(() => {
      setActive(i);
      setAnimKey(k => k + 1);
      setPanelVisible(true);
    }, 160);
  }, []);

  const feature = FEATURES[active];

  return (
    <>
      {/* ── Mobile — flicker-free manual carousel, no auto-rotate/IntersectionObserver ── */}
      <div className="md:hidden card-quiet p-4 overflow-hidden">
        <MobileFeatureCarousel items={FEATURES} renderMockup={(id) => <Mockup id={id as FeatureId} />} />
      </div>

      {/* ── Desktop — auto-rotating tabs with progress bar ── */}
      <div
        ref={containerRef}
        className="hidden md:block card-quiet overflow-hidden"
      >
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes rmProgressSweepFS {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
      `}} />
      <div className="grid md:grid-cols-[220px_1fr] min-h-80 md:min-h-105 min-w-0 bg-paper-raised">
        {/* ── Sidebar nav — icon-only scroll on mobile, vertical list on desktop ── */}
        <div className="p-3 md:p-4 flex flex-row overflow-x-auto md:flex-col border-b md:border-b-0 md:border-r border-rule bg-paper min-w-0">
          <p className="hidden md:block eyebrow mb-3 px-3 shrink-0">
            Dashboard Features
          </p>
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            const isActive = i === active;
            return (
              <button
                key={f.id}
                onClick={() => handleSelect(i)}
                aria-current={isActive ? 'true' : undefined}
                className={`relative shrink-0 md:w-full flex items-center gap-0 md:gap-3 p-2 md:px-3 md:py-2.5 rounded-sm mb-0 md:mb-0.5 mr-1.5 md:mr-0 text-left cursor-pointer transition-colors duration-150 ease-out ${
                  isActive ? 'text-ink' : 'text-ink-muted hover:text-ink'
                }`}
              >
                {/* Active indicator — 2px ink bar (left on desktop, bottom on narrow) */}
                <span
                  aria-hidden
                  className={`absolute bg-ink transition-opacity duration-150 ease-out left-2 right-2 bottom-0 h-0.5 md:left-0 md:right-auto md:top-2 md:bottom-2 md:h-auto md:w-0.5 ${
                    isActive ? 'opacity-100' : 'opacity-0'
                  }`}
                />
                <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                {/* Text label — hidden on mobile to keep sidebar compact */}
                <div className="hidden md:block min-w-0">
                  <p className={`text-xs leading-tight truncate ${isActive ? 'font-semibold' : 'font-medium'}`}>
                    {f.label}
                  </p>
                  <p className="text-[10px] leading-tight mt-0.5 truncate text-ink-muted">
                    {f.tagline}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* ── Main panel ──────────────────────── */}
        <div className="p-4 md:p-7 flex flex-col min-w-0 overflow-hidden">
          {/* CSS-animated progress bar — no JS ticking, GPU-composited */}
          <div className="h-0.5 rounded-full mb-6 overflow-hidden bg-paper-gray">
            <div
              key={animKey}
              className="h-full w-full rounded-full bg-gold"
              style={{
                transformOrigin: 'left center',
                animation: `rmProgressSweepFS ${AUTO_ROTATE_MS}ms linear forwards`,
                animationPlayState: isVisible ? 'running' : 'paused',
                willChange: 'transform',
              }}
              onAnimationEnd={advanceTab}
            />
          </div>

          {/* Feature heading */}
          <div className="flex items-center gap-3 mb-5">
            {(() => {
              const Icon = feature.icon;
              return (
                <div className="h-8 w-8 rounded-md border border-rule bg-paper-deep flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4 text-ink" strokeWidth={1.75} />
                </div>
              );
            })()}
            <div>
              <p className="card-title">
                {feature.label}
              </p>
              <p className="text-[12px] text-ink-muted">
                {feature.tagline}
              </p>
            </div>
          </div>

          {/* Panel content — fixed minHeight prevents layout shift when features switch */}
          <div
            className="flex-1 min-w-0"
            style={{
              opacity: panelVisible ? 1 : 0,
              transition: 'opacity 0.18s ease-out',
              minHeight: 260,
              willChange: 'opacity',
            }}
          >
            <Mockup id={feature.id} />
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
