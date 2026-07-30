'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Flame, PenLine, TrendingDown, Newspaper, CalendarDays, Search, Brain, BadgeCheck,
  Check, X, Zap, BookOpen, FlaskConical, Trophy,
} from 'lucide-react';

// ── Feature metadata ─────────────────────────────────────────────
const NEW_FEATURES = [
  { id: 'daily-challenge', icon: Flame,        label: 'Daily Challenge',      tagline: '5 questions every morning',    color: '#FB923C' },
  { id: 'current-affairs', icon: Newspaper,    label: 'Current Affairs',      tagline: 'Daily news with mains angle',  color: '#38BDF8' },
  { id: 'mains-writing',   icon: PenLine,      label: 'Answer Writing',       tagline: 'AI paragraph scorecard',       color: '#34D399' },
  { id: 'weak-zones',      icon: TrendingDown, label: 'Weak Zone Tracker',      tagline: 'Know where you lose marks',    color: '#F43F5E' },
  { id: 'study-plan',      icon: CalendarDays, label: '30-Day Plan',          tagline: 'AI-generated calendar',        color: '#818CF8' },
  { id: 'detective',       icon: Search,       label: 'Prelims Detective',    tagline: 'Why each wrong answer failed', color: '#F59E0B' },
  { id: 'mnemonics',       icon: Brain,        label: 'Memory Mnemonics',     tagline: 'Never forget a fact',          color: '#A78BFA' },
  { id: 'exam-profile',    icon: BadgeCheck,   label: 'Exam Profile',         tagline: 'Personalised for your exam',   color: '#7C3AED' },
] as const;

type NewFeatureId = typeof NEW_FEATURES[number]['id'];

const SURFACE   = '#F5F4FF';
const BORDER_S  = 'rgba(124,58,237,0.09)';
const TEXT_DARK = '#1A1836';
const TEXT_MID  = '#9D95C4';
const AUTO_ROTATE_MS = 5000;

// ── Mockup panels ─────────────────────────────────────────────────

function DailyChallengeMockup() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2 text-[11px] font-bold" style={{ color: '#FB923C' }}>
          <Flame className="h-3.5 w-3.5" />
          <span>7-day streak 🔥</span>
        </div>
        <span className="text-[10px] font-semibold" style={{ color: TEXT_MID }}>Q 2 / 5</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(251,146,60,0.12)' }}>
        <div className="h-full rounded-full" style={{ width: '40%', background: 'linear-gradient(to right, #FB923C, #F59E0B)' }} />
      </div>
      <p className="text-xs font-semibold leading-snug pt-2" style={{ color: TEXT_DARK }}>
        Panchayati Raj was first implemented in which Indian state in 1959?
      </p>
      {[
        { t: 'Maharashtra', correct: false, selected: false },
        { t: 'Rajasthan',   correct: true,  selected: true  },
        { t: 'Punjab',      correct: false, selected: false },
        { t: 'Tamil Nadu',  correct: false, selected: false },
      ].map((opt, i) => (
        <div key={i} className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs"
          style={{
            background: opt.correct ? 'rgba(5,150,105,0.08)' : SURFACE,
            border: `1px solid ${opt.correct ? 'rgba(5,150,105,0.25)' : BORDER_S}`,
            color: opt.correct ? '#059669' : '#4B4580',
          }}>
          <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
            style={{ background: opt.correct ? '#059669' : 'rgba(124,58,237,0.1)', color: opt.correct ? '#fff' : '#7C3AED' }}>
            {String.fromCharCode(65 + i)}
          </span>
          <span className="flex-1">{opt.t}</span>
          {opt.correct && <Check className="h-3.5 w-3.5 text-emerald-500" />}
        </div>
      ))}
      <div className="flex items-center gap-2 pt-1">
        <Trophy className="h-3.5 w-3.5 shrink-0" style={{ color: '#FB923C' }} />
        <p className="text-[10px]" style={{ color: TEXT_MID }}>+10 pts · Keep going to maintain your streak!</p>
      </div>
    </div>
  );
}

function CurrentAffairsMockup() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <Newspaper className="h-3.5 w-3.5" style={{ color: '#38BDF8' }} />
        <span className="text-xs font-bold" style={{ color: TEXT_DARK }}>Today&apos;s Digest</span>
        <span className="text-[10px] ml-auto" style={{ color: TEXT_MID }}>26 Jul 2026</span>
      </div>
      <div className="rounded-xl p-3 space-y-2" style={{ background: 'rgba(56,189,248,0.07)', border: '1px solid rgba(56,189,248,0.2)' }}>
        <p className="text-[11px] font-bold" style={{ color: TEXT_DARK }}>India-EU Free Trade Agreement: Latest Round</p>
        <p className="text-[10px] leading-relaxed" style={{ color: '#4B4580' }}>
          India and the EU resumed FTA talks in Brussels, focusing on digital trade, IP rights, and automotive tariffs…
        </p>
        <div className="flex gap-1.5 flex-wrap pt-1">
          {['GS2', 'GS3', 'IR', 'Trade'].map(t => (
            <span key={t} className="text-[9px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(56,189,248,0.15)', color: '#0891B2' }}>{t}</span>
          ))}
        </div>
      </div>
      <div className="rounded-xl p-3" style={{ background: SURFACE, border: `1px solid ${BORDER_S}` }}>
        <p className="text-[10px] font-bold mb-2" style={{ color: '#7C3AED' }}>Key Facts</p>
        {['Negotiations since 2007; paused 2013–2022', 'India seeks duty reduction on textiles & pharma', '€100B bilateral trade target by 2030'].map((f, i) => (
          <div key={i} className="flex items-start gap-1.5 text-[10px] mb-1" style={{ color: '#4B4580' }}>
            <span className="mt-0.5 shrink-0" style={{ color: '#7C3AED' }}>•</span>{f}
          </div>
        ))}
      </div>
      <div className="rounded-xl p-3" style={{ background: 'rgba(124,58,237,0.04)', border: `1px solid rgba(124,58,237,0.1)` }}>
        <p className="text-[10px] font-bold mb-1" style={{ color: '#7C3AED' }}>Mains Angle (GS2)</p>
        <p className="text-[10px] leading-relaxed" style={{ color: '#4B4580' }}>
          Analyse India&apos;s FTA strategy in the context of supply chain diversification and QUAD commitments.
        </p>
      </div>
    </div>
  );
}

function MainsMockup() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold" style={{ color: TEXT_DARK }}>
          Discuss the significance of India&apos;s semiconductor policy.
        </p>
        <span className="text-[10px] font-bold px-2 py-1 rounded-lg shrink-0 ml-3"
          style={{ background: 'rgba(52,211,153,0.12)', color: '#059669' }}>⏱ 12:44</span>
      </div>
      <div className="rounded-xl p-3 text-xs leading-relaxed" style={{ background: SURFACE, border: `1px solid ${BORDER_S}`, minHeight: 70, color: '#4B4580' }}>
        India&apos;s semiconductor policy aims to reduce dependence on imports by building domestic fabrication capacity. The ₹76,000 crore incentive scheme targets…
        <span style={{ color: '#C4BAE8' }}> |</span>
      </div>
      <div className="flex justify-between text-[10px]" style={{ color: TEXT_MID }}>
        <span>47 / 150 words</span><span>Mains 2024 · GS3</span>
      </div>
      <div className="rounded-xl p-3 space-y-2" style={{ background: 'rgba(52,211,153,0.07)', border: '1px solid rgba(52,211,153,0.2)' }}>
        <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#059669' }}>AI Scorecard</p>
        {[['Introduction', '3/4'], ['Arguments', '5/8'], ['Examples', '3/5'], ['Conclusion', '2/3']].map(([k, v]) => (
          <div key={k} className="flex items-center justify-between text-[11px]">
            <span style={{ color: '#4B4580' }}>{k}</span>
            <span className="font-bold" style={{ color: '#059669' }}>{v}</span>
          </div>
        ))}
        <div className="pt-1 border-t border-emerald-200/40 flex justify-between text-xs font-bold" style={{ color: '#059669' }}>
          <span>Total</span><span>13 / 20</span>
        </div>
      </div>
    </div>
  );
}

function WeakZoneMockup() {
  const zones = [
    { topic: 'Governance & Polity', pct: 68, label: 'Critical', color: '#F43F5E', bg: 'rgba(244,63,94,0.12)' },
    { topic: 'Economy — Budget',    pct: 52, label: 'Weak',     color: '#FB923C', bg: 'rgba(251,146,60,0.12)' },
    { topic: 'Modern History',      pct: 38, label: 'Moderate', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
    { topic: 'Environment',         pct: 20, label: 'Good',     color: '#34D399', bg: 'rgba(52,211,153,0.12)' },
  ];
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <TrendingDown className="h-3.5 w-3.5" style={{ color: '#F43F5E' }} />
        <span className="text-xs font-bold" style={{ color: TEXT_DARK }}>Weak Zone Tracker</span>
        <span className="text-[10px] ml-auto" style={{ color: TEXT_MID }}>124 attempts</span>
      </div>
      {zones.map((z) => (
        <div key={z.topic} className="space-y-1">
          <div className="flex items-center justify-between text-[11px]">
            <span style={{ color: '#4B4580' }}>{z.topic}</span>
            <span className="font-bold px-2 py-0.5 rounded-full text-[10px]" style={{ background: z.bg, color: z.color }}>{z.label}</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(124,58,237,0.07)' }}>
            <div className="h-full rounded-full" style={{ width: `${z.pct}%`, background: z.color }} />
          </div>
        </div>
      ))}
      <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-lg" style={{ background: 'rgba(124,58,237,0.08)', color: '#7C3AED' }}>
        Practice Governance now →
      </div>
    </div>
  );
}

function StudyPlanMockup() {
  const days = [
    { d: 1, topic: 'Modern History — 1857', icon: BookOpen,     color: '#818CF8', bg: 'rgba(129,140,248,0.1)', today: true },
    { d: 2, topic: 'Current Affairs',        icon: Newspaper,   color: '#34D399', bg: 'rgba(52,211,153,0.1)'  },
    { d: 3, topic: 'Polity — Preamble',      icon: Zap,         color: '#F59E0B', bg: 'rgba(245,158,11,0.1)'  },
    { d: 4, topic: 'Economy — Budget',       icon: TrendingDown,color: '#F43F5E', bg: 'rgba(244,63,94,0.1)'   },
    { d: 5, topic: 'Environment & Ecology',  icon: Brain,       color: '#A78BFA', bg: 'rgba(167,139,250,0.1)' },
    { d: 7, topic: 'FULL MOCK TEST',         icon: FlaskConical,color: '#F43F5E', bg: 'rgba(244,63,94,0.1)',  mock: true },
  ];
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <CalendarDays className="h-3.5 w-3.5" style={{ color: '#818CF8' }} />
        <span className="text-xs font-bold" style={{ color: TEXT_DARK }}>30-Day Plan</span>
        <span className="text-[10px] ml-auto px-2 py-0.5 rounded-full" style={{ background: 'rgba(129,140,248,0.1)', color: '#818CF8' }}>89 days left</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {days.map((day) => {
          const Icon = day.icon;
          return (
            <div key={day.d} className="rounded-xl p-2.5"
              style={{
                background: day.today ? 'rgba(124,58,237,0.07)' : day.mock ? 'rgba(244,63,94,0.05)' : SURFACE,
                border: `1px solid ${day.today ? 'rgba(124,58,237,0.2)' : day.mock ? 'rgba(244,63,94,0.2)' : BORDER_S}`,
              }}>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[9px] font-bold" style={{ color: day.today ? '#7C3AED' : TEXT_MID }}>Day {day.d}</span>
                {day.today && <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(124,58,237,0.15)', color: '#7C3AED' }}>Today</span>}
                {day.mock && <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(244,63,94,0.15)', color: '#F43F5E' }}>Mock</span>}
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-5 w-5 rounded flex items-center justify-center shrink-0" style={{ background: day.bg }}>
                  <Icon className="h-3 w-3" style={{ color: day.color }} />
                </div>
                <p className="text-[10px] font-semibold leading-tight" style={{ color: '#4B4580' }}>{day.topic}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DetectiveMockup() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <Search className="h-3.5 w-3.5" style={{ color: '#F59E0B' }} />
        <span className="text-xs font-bold" style={{ color: TEXT_DARK }}>Prelims Detective Mode</span>
      </div>
      <p className="text-xs font-semibold leading-snug" style={{ color: TEXT_DARK }}>
        Which article deals with the Right to Constitutional Remedies?
      </p>
      {[
        { t: 'Article 19', wrong: true,  selected: true  },
        { t: 'Article 32', correct: true, selected: false },
        { t: 'Article 21', wrong: false, selected: false },
        { t: 'Article 44', wrong: false, selected: false },
      ].map((opt, i) => (
        <div key={i} className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs"
          style={{
            background: opt.correct ? 'rgba(5,150,105,0.08)' : opt.selected ? 'rgba(244,63,94,0.08)' : SURFACE,
            border: `1px solid ${opt.correct ? 'rgba(5,150,105,0.25)' : opt.selected ? 'rgba(244,63,94,0.25)' : BORDER_S}`,
            color: opt.correct ? '#059669' : opt.selected ? '#F43F5E' : '#4B4580',
          }}>
          <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
            style={{ background: opt.correct ? '#059669' : opt.selected ? '#F43F5E' : 'rgba(124,58,237,0.1)', color: opt.correct || opt.selected ? '#fff' : '#7C3AED' }}>
            {String.fromCharCode(65 + i)}
          </span>
          <span className="flex-1">{opt.t}</span>
          {opt.correct && <Check className="h-3.5 w-3.5" />}
          {opt.selected && !opt.correct && <X className="h-3.5 w-3.5" />}
        </div>
      ))}
      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(245,158,11,0.25)' }}>
        <div className="flex items-center gap-2 px-3 py-2" style={{ background: 'rgba(245,158,11,0.08)' }}>
          <Search className="h-3.5 w-3.5 shrink-0" style={{ color: '#F59E0B' }} />
          <span className="text-[11px] font-bold" style={{ color: '#B45309' }}>🔍 Why Article 19 is wrong</span>
        </div>
        <div className="px-3 py-2">
          <p className="text-[10px] leading-relaxed" style={{ color: '#4B4580' }}>
            Article 19 guarantees 6 fundamental freedoms but does NOT provide the right to move court for remedy — that is exclusively Article 32, called &lsquo;the heart and soul of the Constitution&rsquo; by Dr. Ambedkar.
          </p>
        </div>
      </div>
    </div>
  );
}

function MnemonicsMockup() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <Brain className="h-3.5 w-3.5" style={{ color: '#A78BFA' }} />
        <span className="text-xs font-bold" style={{ color: TEXT_DARK }}>Memory Mnemonics</span>
        <span className="text-[10px] ml-auto" style={{ color: TEXT_MID }}>5 generated</span>
      </div>
      {[
        {
          type: 'Acronym', typeColor: '#7C3AED', typeBg: 'rgba(124,58,237,0.1)',
          fact: 'G20 3 pillars: Inclusive growth, DPI, Climate finance',
          mnemonic: '"IDC" — Inclusive, Digital, Climate. I Don\'t Care → you MUST care about all three!',
        },
        {
          type: 'Story', typeColor: '#0891B2', typeBg: 'rgba(8,145,178,0.1)',
          fact: 'Rajasthan was the first state to implement Panchayati Raj (1959)',
          mnemonic: 'A RAJA of Rajasthan in 1959 giving his throne to the village panchayat.',
        },
      ].map((m, i) => (
        <div key={i} className="rounded-xl p-3.5 space-y-2" style={{ background: SURFACE, border: `1px solid ${BORDER_S}` }}>
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide"
            style={{ background: m.typeBg, color: m.typeColor }}>{m.type}</span>
          <p className="text-[10px] font-semibold leading-snug" style={{ color: '#4B4580' }}>{m.fact}</p>
          <div className="rounded-lg p-2.5" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)' }}>
            <p className="text-[10px] leading-relaxed" style={{ color: '#92400E' }}>💡 {m.mnemonic}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function ExamProfileMockup() {
  const exams = ['UPSC CSE', 'SSC CGL', 'SSC CHSL', 'State PSC'];
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <BadgeCheck className="h-3.5 w-3.5" style={{ color: '#7C3AED' }} />
        <span className="text-xs font-bold" style={{ color: TEXT_DARK }}>Your Exam Profile</span>
      </div>
      <p className="text-[11px]" style={{ color: TEXT_MID }}>Select your target — Remindology personalises everything around it.</p>
      <div className="grid grid-cols-2 gap-1.5">
        {exams.map((exam, i) => (
          <div key={exam} className="text-[11px] font-semibold px-3 py-2 rounded-xl"
            style={{
              background: i === 0 ? 'rgba(124,58,237,0.1)' : SURFACE,
              border: `1px solid ${i === 0 ? 'rgba(124,58,237,0.3)' : BORDER_S}`,
              color: i === 0 ? '#7C3AED' : '#4B4580',
            }}>
            {exam}
          </div>
        ))}
      </div>
      <div className="rounded-xl p-3 mt-1" style={{ background: 'rgba(124,58,237,0.05)', border: `1px solid rgba(124,58,237,0.12)` }}>
        <p className="text-[10px] font-bold mb-2" style={{ color: '#7C3AED' }}>After selecting UPSC CSE:</p>
        {['Daily challenges use UPSC-level questions', 'Mains prompts from PYQs', '30-day plan covers all 4 GS papers', 'Current affairs tagged to GS1–GS4'].map(f => (
          <div key={f} className="flex items-center gap-1.5 text-[10px] mb-1" style={{ color: '#4B4580' }}>
            <Check className="h-3 w-3 shrink-0" style={{ color: '#059669' }} />{f}
          </div>
        ))}
      </div>
    </div>
  );
}

function NewMockup({ id }: { id: NewFeatureId }) {
  switch (id) {
    case 'daily-challenge': return <DailyChallengeMockup />;
    case 'current-affairs': return <CurrentAffairsMockup />;
    case 'mains-writing':   return <MainsMockup />;
    case 'weak-zones':      return <WeakZoneMockup />;
    case 'study-plan':      return <StudyPlanMockup />;
    case 'detective':       return <DetectiveMockup />;
    case 'mnemonics':       return <MnemonicsMockup />;
    case 'exam-profile':    return <ExamProfileMockup />;
  }
}

// ── NewFeatureShowcase — grid layout (different from FeatureShowcase sidebar) ──
export function NewFeatureShowcase() {
  const [active, setActive]             = useState(0);
  const [progress, setProgress]         = useState(0);
  const [panelVisible, setPanelVisible] = useState(true);
  const progressRef  = useRef(0);
  const activeRef    = useRef(0);
  const isVisibleRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => { activeRef.current = active; }, [active]);

  // Pause while off-screen so mobile scroll doesn't fight 25 React updates/sec
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { isVisibleRef.current = entry.isIntersecting; },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const TICK = 40;
    const timer = setInterval(() => {
      if (!isVisibleRef.current) return;

      progressRef.current = Math.min(progressRef.current + (TICK / AUTO_ROTATE_MS) * 100, 100);
      setProgress(progressRef.current);
      if (progressRef.current >= 100) {
        progressRef.current = 0;
        setPanelVisible(false);
        setTimeout(() => {
          setActive((activeRef.current + 1) % NEW_FEATURES.length);
          setPanelVisible(true);
        }, 200);
        setProgress(0);
      }
    }, TICK);
    return () => clearInterval(timer);
  }, []);

  const handleSelect = useCallback((i: number) => {
    if (i === activeRef.current) return;
    progressRef.current = 0;
    setProgress(0);
    setPanelVisible(false);
    setTimeout(() => { setActive(i); setPanelVisible(true); }, 160);
  }, []);

  const feature = NEW_FEATURES[active];

  return (
    <div
      ref={containerRef}
      className="rounded-3xl overflow-hidden"
      style={{ border: '1px solid rgba(124,58,237,0.12)', boxShadow: '0 20px 60px rgba(124,58,237,0.1)' }}
    >
      <div className="grid lg:grid-cols-[1fr_360px]" style={{ background: '#FFFFFF' }}>

        {/* ── Left: feature grid ── */}
        <div
          className="p-4 sm:p-6 flex flex-col gap-4 border-b lg:border-b-0 lg:border-r"
          style={{ background: '#FAFAFF', borderColor: 'rgba(124,58,237,0.1)' }}
        >
          <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: TEXT_MID }}>
            Click any feature to preview
          </p>

          {/* 2 cols on mobile → 4 cols on sm+ */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-2">
            {NEW_FEATURES.map((f, i) => {
              const Icon = f.icon;
              const isAct = i === active;
              return (
                <button
                  key={f.id}
                  onClick={() => handleSelect(i)}
                  className="flex flex-col items-center gap-2 p-3 rounded-2xl transition-all duration-150 text-center cursor-pointer"
                  style={{
                    background: isAct ? `${f.color}12` : 'rgba(0,0,0,0)',
                    border: `1.5px solid ${isAct ? `${f.color}40` : 'rgba(124,58,237,0.08)'}`,
                    transform: isAct ? 'scale(1.02)' : 'scale(1)',
                  }}
                >
                  <div
                    className="h-11 w-11 rounded-xl flex items-center justify-center transition-all duration-150"
                    style={{ background: isAct ? f.color : `${f.color}18` }}
                  >
                    <Icon className="h-[18px] w-[18px]" style={{ color: isAct ? '#FFFFFF' : f.color }} />
                  </div>
                  <p className="text-[11px] sm:text-[10px] font-semibold leading-tight" style={{ color: isAct ? '#1A1836' : '#6B63A0' }}>
                    {f.label}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Progress bar + hint */}
          <div className="space-y-2">
            <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(124,58,237,0.1)' }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: `${progress}%`,
                  background: `linear-gradient(to right, ${feature.color}, ${feature.color}CC)`,
                  transition: '40ms linear',
                }}
              />
            </div>
            <p className="text-[10px] text-center" style={{ color: TEXT_MID }}>
              Auto-previewing all 8 · click any to jump
            </p>
          </div>
        </div>

        {/* ── Right: detail panel ── */}
        <div className="p-5 lg:p-7 flex flex-col min-w-0" style={{ minHeight: 380 }}>
          {/* Feature heading */}
          <div className="flex items-center gap-3 mb-5">
            {(() => {
              const Icon = feature.icon;
              return (
                <div
                  className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${feature.color}18` }}
                >
                  <Icon className="h-4 w-4" style={{ color: feature.color }} />
                </div>
              );
            })()}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold" style={{ color: TEXT_DARK }}>{feature.label}</p>
                <span
                  className="text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide shrink-0"
                  style={{ background: `${feature.color}18`, color: feature.color }}
                >
                  New
                </span>
              </div>
              <p className="text-[11px] mt-0.5" style={{ color: TEXT_MID }}>{feature.tagline}</p>
            </div>
          </div>

          {/* Mockup */}
          <div
            className="flex-1 overflow-y-auto"
            style={{ opacity: panelVisible ? 1 : 0, transition: 'opacity 0.18s ease' }}
          >
            <NewMockup id={feature.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
