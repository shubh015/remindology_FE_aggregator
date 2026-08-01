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

function UploadMockup() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-5">
        <div
          className="h-9 w-9 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(124,58,237,0.12)' }}
        >
          <Sparkles className="h-4 w-4" style={{ color: '#7C3AED' }} />
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: '#1A1836' }}>
            Upload Study Material
          </p>
          <p className="text-[11px]" style={{ color: '#9D95C4' }}>
            Paste any article, chapter, or notes
          </p>
        </div>
      </div>

      <div>
        <label
          className="text-[10px] font-bold uppercase tracking-widest mb-1.5 block"
          style={{ color: '#9D95C4' }}
        >
          Document Title
        </label>
        <div
          className="rounded-xl px-3.5 py-2.5 text-xs"
          style={{
            background: '#F5F4FF',
            border: '1px solid rgba(124,58,237,0.15)',
            color: '#9D95C4',
          }}
        >
          e.g., GS Paper 2 — Indo-Pacific Relations
        </div>
      </div>

      <div>
        <label
          className="text-[10px] font-bold uppercase tracking-widest mb-1.5 block"
          style={{ color: '#9D95C4' }}
        >
          Content
        </label>
        <div
          className="rounded-xl p-3.5 text-xs"
          style={{
            background: '#F5F4FF',
            border: '1px solid rgba(124,58,237,0.15)',
            minHeight: 80,
            color: '#9D95C4',
          }}
        >
          Paste your article, editorial, or study notes here…
        </div>
        <div
          className="flex items-center justify-between mt-1.5 text-[10px]"
          style={{ color: '#C4BAE8' }}
        >
          <span>0 words · 0 chars</span>
          <span>Plain text</span>
        </div>
      </div>

      <div
        className="flex items-center gap-3 pt-3"
        style={{ borderTop: '1px solid rgba(124,58,237,0.1)' }}
      >
        <p className="flex-1 min-w-0 text-[10px]" style={{ color: '#9D95C4' }}>
          AI will generate summary, notes, MCQs &amp; topics
        </p>
        <div
          className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl text-white shrink-0"
          style={{ background: 'linear-gradient(135deg, #7C3AED, #C026D3)', cursor: 'default' }}
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
        <span
          className="text-[10px] font-bold px-2.5 py-1 rounded-full"
          style={{ background: 'rgba(124,58,237,0.12)', color: '#7C3AED' }}
        >
          UPSC CSE
        </span>
        <span className="text-xs" style={{ color: '#9D95C4' }}>
          India&apos;s G20 Presidency
        </span>
      </div>

      <div
        className="rounded-xl p-4"
        style={{ background: '#F5F4FF', border: '1px solid rgba(124,58,237,0.1)' }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Brain className="h-3.5 w-3.5" style={{ color: '#7C3AED' }} />
          <span className="text-[11px] font-bold" style={{ color: '#7C3AED' }}>
            AI Summary
          </span>
        </div>
        <p className="text-xs leading-relaxed" style={{ color: '#4B4580' }}>
          India&apos;s G20 Presidency centred on 3 priorities: inclusive growth, DPI
          (Digital Public Infrastructure), and climate finance — under the theme
          &apos;One Earth, One Family, One Future&apos;, spotlighting the Global South.
        </p>
      </div>

      <div
        className="rounded-xl p-4"
        style={{ background: '#F5F4FF', border: '1px solid rgba(124,58,237,0.1)' }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Brain className="h-3.5 w-3.5" style={{ color: '#0891B2' }} />
          <span className="text-[11px] font-bold" style={{ color: '#0891B2' }}>
            AI Summary
          </span>
        </div>
        <p className="text-xs leading-relaxed" style={{ color: '#4B4580' }}>
          Indian Constitution adopted 26 Nov 1949; enforced 26 Jan 1950.
          Dr. B.R. Ambedkar (Drafting Committee Chair) is its chief architect.
          World&apos;s longest written constitution.
        </p>
      </div>

      <div className="flex items-center gap-1.5 text-[11px]" style={{ color: '#9D95C4' }}>
        <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
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
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="h-3.5 w-3.5" style={{ color: '#7C3AED' }} />
        <span className="text-xs font-bold" style={{ color: '#7C3AED' }}>
          Revision Notes
        </span>
        <span
          className="text-[10px] ml-auto px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(5,150,105,0.1)', color: '#059669' }}
        >
          4 points
        </span>
      </div>
      {items.map((note, i) => (
        <div
          key={i}
          className="flex items-start gap-3 rounded-xl px-3.5 py-3"
          style={{ background: '#F5F4FF', border: '1px solid rgba(124,58,237,0.08)' }}
        >
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5"
            style={{
              background: 'linear-gradient(135deg, #7C3AED, #C026D3)',
              color: '#FFFFFF',
            }}
          >
            {i + 1}
          </div>
          <span className="text-xs leading-relaxed" style={{ color: '#4B4580' }}>
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
      <div className="flex items-center gap-2 mb-4">
        <Target className="h-3.5 w-3.5" style={{ color: '#7C3AED' }} />
        <span className="text-xs font-bold" style={{ color: '#7C3AED' }}>
          Practice MCQ
        </span>
        <span
          className="text-[10px] ml-auto px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(124,58,237,0.1)', color: '#7C3AED' }}
        >
          Q 1 of 5
        </span>
      </div>
      <p className="text-xs font-semibold mb-4" style={{ color: '#1A1836' }}>
        India&apos;s G20 Presidency primarily focused on which three pillars?
      </p>
      {options.map((opt, i) => (
        <div
          key={i}
          className="flex items-center gap-2.5 text-xs px-3 py-2.5 rounded-xl"
          style={{
            background: opt.correct ? 'rgba(5,150,105,0.08)' : '#F5F4FF',
            border: `1px solid ${opt.correct ? 'rgba(5,150,105,0.25)' : 'rgba(124,58,237,0.08)'}`,
            color: opt.correct ? '#059669' : '#4B4580',
          }}
        >
          <span
            className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
            style={{
              background: opt.correct ? '#059669' : 'rgba(124,58,237,0.1)',
              color: opt.correct ? '#FFFFFF' : '#7C3AED',
            }}
          >
            {String.fromCharCode(65 + i)}
          </span>
          <span className="flex-1">{opt.text}</span>
          {opt.correct && (
            <span className="text-[10px] font-bold" style={{ color: '#059669' }}>✓</span>
          )}
        </div>
      ))}
    </div>
  );
}

function TopicsMockup() {
  const topics = [
    { t: 'G20 Presidency', cat: 'Main Topic',  c: '#7C3AED', bg: 'rgba(124,58,237,0.1)' },
    { t: 'Digital Public Infrastructure', cat: 'Key Concept', c: '#0891B2', bg: 'rgba(8,145,178,0.1)' },
    { t: 'Climate Finance', cat: 'Key Concept', c: '#0891B2', bg: 'rgba(8,145,178,0.1)' },
    { t: 'Global South',   cat: 'Term',         c: '#059669', bg: 'rgba(5,150,105,0.1)' },
    { t: 'Inclusive Growth', cat: 'Term',        c: '#059669', bg: 'rgba(5,150,105,0.1)' },
    { t: 'One Earth Philosophy', cat: 'Theme',   c: '#D97706', bg: 'rgba(217,119,6,0.1)' },
  ];
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="h-3.5 w-3.5" style={{ color: '#7C3AED' }} />
        <span className="text-xs font-bold" style={{ color: '#7C3AED' }}>
          Key Topics
        </span>
        <span
          className="text-[10px] ml-auto px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(124,58,237,0.1)', color: '#7C3AED' }}
        >
          6 extracted
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {topics.map(tp => (
          <div
            key={tp.t}
            className="text-xs font-medium px-3 py-1.5 rounded-full"
            style={{ background: tp.bg, color: tp.c, border: `1px solid ${tp.c}33` }}
          >
            {tp.t}
          </div>
        ))}
      </div>
      <div
        className="pt-4"
        style={{ borderTop: '1px solid rgba(124,58,237,0.08)' }}
      >
        <p
          className="text-[10px] font-semibold mb-2"
          style={{ color: '#9D95C4' }}
        >
          Category legend
        </p>
        <div className="flex flex-wrap gap-1.5">
          {[
            { l: 'Main Topic', c: '#7C3AED', bg: 'rgba(124,58,237,0.1)' },
            { l: 'Key Concept', c: '#0891B2', bg: 'rgba(8,145,178,0.1)' },
            { l: 'Term', c: '#059669', bg: 'rgba(5,150,105,0.1)' },
            { l: 'Theme', c: '#D97706', bg: 'rgba(217,119,6,0.1)' },
          ].map(item => (
            <span
              key={item.l}
              className="text-[10px] px-2 py-1 rounded-full"
              style={{ background: item.bg, color: item.c }}
            >
              {item.l}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProgressMockup() {
  const stats = [
    { label: 'Total Uploads', value: '24', color: '#7C3AED', bg: 'rgba(124,58,237,0.1)' },
    { label: 'AI Completed',  value: '21', color: '#059669', bg: 'rgba(5,150,105,0.1)' },
    { label: 'Processing',    value: '3',  color: '#D97706', bg: 'rgba(217,119,6,0.1)' },
  ];
  const items = [
    { title: "India's G20 Presidency",    status: 'COMPLETED', date: 'Jun 24' },
    { title: 'NCERT Polity — Ch. 3',       status: 'COMPLETED', date: 'Jun 23' },
    { title: 'SSC Maths Practice Set 7',   status: 'PROCESSING', date: 'Jun 24' },
  ];
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="h-3.5 w-3.5" style={{ color: '#7C3AED' }} />
        <span className="text-xs font-bold" style={{ color: '#7C3AED' }}>
          Progress Library
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {stats.map(s => (
          <div
            key={s.label}
            className="rounded-xl p-2.5 text-center min-w-0 overflow-hidden"
            style={{ background: s.bg, border: `1px solid ${s.color}22` }}
          >
            <div
              className="text-xl font-extrabold"
              style={{ color: s.color }}
            >
              {s.value}
            </div>
            <div
              className="text-[9px] font-medium mt-0.5 leading-tight wrap-break-word"
              style={{ color: `${s.color}99` }}
            >
              {s.label}
            </div>
          </div>
        ))}
      </div>
      <div className="space-y-2">
        {items.map(item => (
          <div
            key={item.title}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5"
            style={{ background: '#F5F4FF', border: '1px solid rgba(124,58,237,0.08)' }}
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: 'rgba(124,58,237,0.1)' }}
            >
              <FileText className="h-3.5 w-3.5" style={{ color: '#7C3AED' }} />
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-xs font-semibold truncate"
                style={{ color: '#1A1836' }}
              >
                {item.title}
              </p>
              <p className="text-[10px]" style={{ color: '#9D95C4' }}>
                {item.date}
              </p>
            </div>
            <span
              className="text-[9px] font-bold px-2 py-1 rounded-full shrink-0"
              style={{
                background:
                  item.status === 'COMPLETED'
                    ? 'rgba(5,150,105,0.12)'
                    : 'rgba(217,119,6,0.12)',
                color:
                  item.status === 'COMPLETED' ? '#059669' : '#D97706',
              }}
            >
              {item.status}
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
    <div
      ref={containerRef}
      className="rounded-3xl overflow-hidden"
      style={{
        border: '1px solid rgba(124,58,237,0.12)',
        boxShadow: '0 20px 60px rgba(124,58,237,0.1)',
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes rmProgressSweepFS {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
      `}} />
      <div
        className="grid md:grid-cols-[220px_1fr] min-h-80 md:min-h-105 min-w-0"
        style={{ background: '#FFFFFF' }}
      >
        {/* ── Sidebar nav — icon-only scroll on mobile, vertical list on desktop ── */}
        <div
          className="p-3 md:p-4 flex flex-row overflow-x-auto md:flex-col border-b md:border-b-0 md:border-r min-w-0"
          style={{ background: '#FAFAFF', borderColor: 'rgba(124,58,237,0.1)' }}
        >
          <p
            className="hidden md:block text-[10px] font-bold uppercase tracking-widest mb-3 px-2 shrink-0"
            style={{ color: '#9D95C4' }}
          >
            Dashboard Features
          </p>
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            const isActive = i === active;
            return (
              <button
                key={f.id}
                onClick={() => handleSelect(i)}
                className="shrink-0 md:w-full flex items-center gap-0 md:gap-3 p-2 md:px-3 md:py-2.5 rounded-xl mb-0 md:mb-1 mr-1.5 md:mr-0 text-left transition-all duration-150"
                style={{
                  background: isActive
                    ? 'linear-gradient(135deg, rgba(124,58,237,0.1), rgba(192,38,211,0.06))'
                    : 'transparent',
                  border: `1px solid ${isActive ? 'rgba(124,58,237,0.18)' : 'transparent'}`,
                  cursor: 'pointer',
                }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-150"
                  style={{
                    background: isActive
                      ? 'linear-gradient(135deg, #7C3AED, #C026D3)'
                      : 'rgba(124,58,237,0.08)',
                  }}
                >
                  <Icon
                    className="h-4 w-4"
                    style={{ color: isActive ? '#FFFFFF' : '#7C3AED' }}
                  />
                </div>
                {/* Text label — hidden on mobile to keep sidebar compact */}
                <div className="hidden md:block min-w-0 ml-3">
                  <p
                    className="text-xs font-semibold leading-tight truncate"
                    style={{ color: isActive ? '#1A1836' : '#6B63A0' }}
                  >
                    {f.label}
                  </p>
                  <p
                    className="text-[10px] leading-tight mt-0.5 truncate"
                    style={{ color: '#9D95C4' }}
                  >
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
          <div
            className="h-0.5 rounded-full mb-6 overflow-hidden"
            style={{ background: 'rgba(124,58,237,0.1)' }}
          >
            <div
              key={animKey}
              className="h-full w-full rounded-full"
              style={{
                transformOrigin: 'left center',
                background: 'linear-gradient(to right, #7C3AED, #C026D3)',
                animation: `rmProgressSweepFS ${AUTO_ROTATE_MS}ms linear forwards`,
                animationPlayState: isVisible ? 'running' : 'paused',
                willChange: 'transform',
              }}
              onAnimationEnd={advanceTab}
            />
          </div>

          {/* Feature heading */}
          <div className="flex items-center gap-2 mb-5">
            {(() => {
              const Icon = feature.icon;
              return (
                <div
                  className="h-8 w-8 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.12), rgba(192,38,211,0.07))' }}
                >
                  <Icon className="h-4 w-4" style={{ color: '#7C3AED' }} />
                </div>
              );
            })()}
            <div>
              <p className="text-sm font-bold" style={{ color: '#1A1836' }}>
                {feature.label}
              </p>
              <p className="text-[11px]" style={{ color: '#9D95C4' }}>
                {feature.tagline}
              </p>
            </div>
          </div>

          {/* Panel content — fixed minHeight prevents layout shift when features switch */}
          <div
            className="flex-1 min-w-0"
            style={{
              opacity: panelVisible ? 1 : 0,
              transition: 'opacity 0.18s ease',
              minHeight: 260,
              willChange: 'opacity',
            }}
          >
            <Mockup id={feature.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
