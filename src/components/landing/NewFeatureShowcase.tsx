'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Flame, PenLine, TrendingDown, Newspaper, CalendarDays, Search, Brain, BadgeCheck,
  Check, X, Zap, BookOpen, FlaskConical, Trophy,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { MobileFeatureCarousel } from './MobileFeatureCarousel';

// ── Feature metadata ─────────────────────────────────────────────
const NEW_FEATURES = [
  { id: 'daily-challenge', icon: Flame,        label: 'Daily Challenge',      tagline: '5 questions every morning'    },
  { id: 'current-affairs', icon: Newspaper,    label: 'Current Affairs',      tagline: 'Daily news with mains angle'  },
  { id: 'mains-writing',   icon: PenLine,      label: 'Answer Writing',       tagline: 'AI paragraph scorecard'       },
  { id: 'weak-zones',      icon: TrendingDown, label: 'Weak Zone Tracker',      tagline: 'Know where you lose marks'    },
  { id: 'study-plan',      icon: CalendarDays, label: '30-Day Plan',          tagline: 'AI-generated calendar'        },
  { id: 'detective',       icon: Search,       label: 'Prelims Detective',    tagline: 'Why each wrong answer failed' },
  { id: 'mnemonics',       icon: Brain,        label: 'Memory Mnemonics',     tagline: 'Never forget a fact'          },
  { id: 'exam-profile',    icon: BadgeCheck,   label: 'Exam Profile',         tagline: 'Personalised for your exam'   },
] as const;

type NewFeatureId = typeof NEW_FEATURES[number]['id'];

const AUTO_ROTATE_MS = 5000;

// ── Shared mono class strings ─────────────────────────────────────
const INSET = 'rounded-md border border-rule bg-paper';
const TAG = 'font-label text-[9px] uppercase tracking-[0.08em] px-2 py-0.5 rounded-full border border-rule bg-paper-gray text-ink-muted';
const SUBLABEL = 'font-label text-[10px] uppercase tracking-[0.1em] text-ink-muted';
// Muted vermilion for the (rare) error state
const ERROR_TEXT = 'text-[oklch(52%_.16_35)]';
const ERROR_BORDER = 'border-[oklch(52%_.16_35)]';

function MockHeader({ icon: Icon, title, right }: { icon: LucideIcon; title: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-1">
      <Icon className="h-3.5 w-3.5 text-ink" strokeWidth={1.75} />
      <span className="text-xs font-semibold text-ink">{title}</span>
      {right && <span className="ml-auto">{right}</span>}
    </div>
  );
}

function OptionRow({ letter, text, state }: { letter: string; text: string; state: 'correct' | 'wrong' | 'idle' }) {
  const row =
    state === 'correct' ? 'border-ink bg-paper-raised text-ink font-medium'
    : state === 'wrong' ? `${ERROR_BORDER} bg-paper text-ink-muted`
    : 'border-rule bg-paper text-ink-muted';
  const badge =
    state === 'correct' ? 'bg-ink text-paper'
    : state === 'wrong' ? `border ${ERROR_BORDER} bg-paper-raised ${ERROR_TEXT}`
    : 'border border-rule bg-paper-gray text-ink-muted';
  return (
    <div className={`flex items-center gap-2.5 px-3 py-2 rounded-md border text-xs ${row}`}>
      <span className={`w-5 h-5 rounded-full flex items-center justify-center font-label text-[10px] shrink-0 ${badge}`}>
        {letter}
      </span>
      <span className="flex-1">{text}</span>
      {state === 'correct' && <Check className="h-3.5 w-3.5 text-ink" />}
      {state === 'wrong' && <X className={`h-3.5 w-3.5 ${ERROR_TEXT}`} />}
    </div>
  );
}

// ── Mockup panels ─────────────────────────────────────────────────

function DailyChallengeMockup() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2 text-[11px] font-semibold text-ink">
          <Flame className="h-3.5 w-3.5" strokeWidth={1.75} />
          <span>7-day streak 🔥</span>
        </div>
        <span className="font-label text-[10px] text-ink-muted">Q 2 / 5</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden bg-paper-gray">
        <div className="h-full rounded-full bg-ink" style={{ width: '40%' }} />
      </div>
      <p className="text-xs font-semibold leading-snug pt-2 text-ink">
        Panchayati Raj was first implemented in which Indian state in 1959?
      </p>
      {[
        { t: 'Maharashtra', correct: false, selected: false },
        { t: 'Rajasthan',   correct: true,  selected: true  },
        { t: 'Punjab',      correct: false, selected: false },
        { t: 'Tamil Nadu',  correct: false, selected: false },
      ].map((opt, i) => (
        <OptionRow key={i} letter={String.fromCharCode(65 + i)} text={opt.t} state={opt.correct ? 'correct' : 'idle'} />
      ))}
      <div className="flex items-center gap-2 pt-1">
        <Trophy className="h-3.5 w-3.5 shrink-0 text-ink" strokeWidth={1.75} />
        <p className="text-[10px] text-ink-muted">+10 pts · Keep going to maintain your streak!</p>
      </div>
    </div>
  );
}

function CurrentAffairsMockup() {
  return (
    <div className="space-y-3">
      <MockHeader
        icon={Newspaper}
        title="Today's Digest"
        right={<span className="text-[10px] text-ink-muted">26 Jul 2026</span>}
      />
      <div className={`${INSET} p-3 space-y-2`}>
        <p className="text-[11px] font-semibold text-ink">India-EU Free Trade Agreement: Latest Round</p>
        <p className="text-[10px] leading-relaxed text-ink-muted">
          India and the EU resumed FTA talks in Brussels, focusing on digital trade, IP rights, and automotive tariffs…
        </p>
        <div className="flex gap-1.5 flex-wrap pt-1">
          {['GS2', 'GS3', 'IR', 'Trade'].map(t => (
            <span key={t} className={TAG}>{t}</span>
          ))}
        </div>
      </div>
      <div className={`${INSET} p-3`}>
        <p className={`${SUBLABEL} mb-2`}>Key Facts</p>
        {['Negotiations since 2007; paused 2013–2022', 'India seeks duty reduction on textiles & pharma', '€100B bilateral trade target by 2030'].map((f, i) => (
          <div key={i} className="flex items-start gap-1.5 text-[10px] mb-1 text-ink-soft">
            <span className="mt-0.5 shrink-0 text-ink-faint">•</span>{f}
          </div>
        ))}
      </div>
      <div className="rounded-md border border-rule bg-paper-deep p-3">
        <p className={`${SUBLABEL} mb-1`}>Mains Angle (GS2)</p>
        <p className="text-[10px] leading-relaxed text-ink-soft">
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
        <p className="text-xs font-semibold text-ink">
          Discuss the significance of India&apos;s semiconductor policy.
        </p>
        <span className="font-label text-[10px] px-2 py-1 rounded-sm border border-rule bg-paper-gray text-ink shrink-0 ml-3">⏱ 12:44</span>
      </div>
      <div className={`${INSET} p-3 text-xs leading-relaxed text-ink-soft`} style={{ minHeight: 70 }}>
        India&apos;s semiconductor policy aims to reduce dependence on imports by building domestic fabrication capacity. The ₹76,000 crore incentive scheme targets…
        <span className="text-ink-faint"> |</span>
      </div>
      <div className="flex justify-between text-[10px] text-ink-muted">
        <span>47 / 150 words</span><span>Mains 2024 · GS3</span>
      </div>
      <div className="rounded-md border border-rule bg-paper-raised p-3 space-y-2">
        <p className={SUBLABEL}>AI Scorecard</p>
        {[['Introduction', '3/4'], ['Arguments', '5/8'], ['Examples', '3/5'], ['Conclusion', '2/3']].map(([k, v]) => (
          <div key={k} className="flex items-center justify-between text-[11px]">
            <span className="text-ink-muted">{k}</span>
            <span className="font-semibold text-ink">{v}</span>
          </div>
        ))}
        <div className="pt-1 border-t border-rule flex justify-between items-baseline text-xs font-semibold text-ink">
          <span>Total</span><span className="font-display font-light text-xl leading-none">13 / 20</span>
        </div>
      </div>
    </div>
  );
}

function WeakZoneMockup() {
  // Severity is shown by bar tone (darker = weaker) rather than hue.
  const zones = [
    { topic: 'Governance & Polity', pct: 68, label: 'Critical', bar: 'bg-ink' },
    { topic: 'Economy — Budget',    pct: 52, label: 'Weak',     bar: 'bg-ink-soft' },
    { topic: 'Modern History',      pct: 38, label: 'Moderate', bar: 'bg-ink-muted' },
    { topic: 'Environment',         pct: 20, label: 'Good',     bar: 'bg-ink-faint' },
  ];
  return (
    <div className="space-y-3">
      <MockHeader
        icon={TrendingDown}
        title="Weak Zone Tracker"
        right={<span className="text-[10px] text-ink-muted">124 attempts</span>}
      />
      {zones.map((z) => (
        <div key={z.topic} className="space-y-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-ink-soft">{z.topic}</span>
            <span className={TAG}>{z.label}</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden bg-paper-gray">
            <div className={`h-full rounded-full ${z.bar}`} style={{ width: `${z.pct}%` }} />
          </div>
        </div>
      ))}
      <div className="inline-flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-md bg-ink text-paper">
        Practice Governance now →
      </div>
    </div>
  );
}

function StudyPlanMockup() {
  const days = [
    { d: 1, topic: 'Modern History — 1857', icon: BookOpen,     today: true },
    { d: 2, topic: 'Current Affairs',        icon: Newspaper    },
    { d: 3, topic: 'Polity — Preamble',      icon: Zap          },
    { d: 4, topic: 'Economy — Budget',       icon: TrendingDown },
    { d: 5, topic: 'Environment & Ecology',  icon: Brain        },
    { d: 7, topic: 'FULL MOCK TEST',         icon: FlaskConical, mock: true },
  ];
  return (
    <div className="space-y-3">
      <MockHeader
        icon={CalendarDays}
        title="30-Day Plan"
        right={<span className={TAG}>89 days left</span>}
      />
      <div className="grid grid-cols-2 gap-2">
        {days.map((day) => {
          const Icon = day.icon;
          return (
            <div
              key={day.d}
              className={`rounded-md p-2.5 border ${
                day.today ? 'border-ink bg-paper-raised'
                : day.mock ? 'border-dashed border-rule-strong bg-paper-deep'
                : 'border-rule bg-paper'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span className={`font-label text-[9px] ${day.today ? 'text-ink' : 'text-ink-muted'}`}>Day {day.d}</span>
                {day.today && <span className="font-label text-[8px] uppercase tracking-[0.06em] px-1.5 py-0.5 rounded-full bg-ink text-paper">Today</span>}
                {day.mock && <span className="font-label text-[8px] uppercase tracking-[0.06em] px-1.5 py-0.5 rounded-full border border-rule bg-paper-gray text-ink-muted">Mock</span>}
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-5 w-5 rounded-sm border border-rule bg-paper-deep flex items-center justify-center shrink-0">
                  <Icon className="h-3 w-3 text-ink" strokeWidth={1.75} />
                </div>
                <p className="text-[10px] font-medium leading-tight text-ink-soft">{day.topic}</p>
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
      <MockHeader icon={Search} title="Prelims Detective Mode" />
      <p className="text-xs font-semibold leading-snug text-ink">
        Which article deals with the Right to Constitutional Remedies?
      </p>
      {[
        { t: 'Article 19', wrong: true,  selected: true  },
        { t: 'Article 32', correct: true, selected: false },
        { t: 'Article 21', wrong: false, selected: false },
        { t: 'Article 44', wrong: false, selected: false },
      ].map((opt, i) => (
        <OptionRow
          key={i}
          letter={String.fromCharCode(65 + i)}
          text={opt.t}
          state={opt.correct ? 'correct' : opt.selected ? 'wrong' : 'idle'}
        />
      ))}
      <div className="rounded-md overflow-hidden border border-rule">
        <div className="flex items-center gap-2 px-3 py-2 bg-paper-deep border-b border-rule">
          <Search className="h-3.5 w-3.5 shrink-0 text-ink" strokeWidth={1.75} />
          <span className="text-[11px] font-semibold text-ink">🔍 Why Article 19 is wrong</span>
        </div>
        <div className="px-3 py-2 bg-paper-raised">
          <p className="text-[10px] leading-relaxed text-ink-soft">
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
      <MockHeader
        icon={Brain}
        title="Memory Mnemonics"
        right={<span className="text-[10px] text-ink-muted">5 generated</span>}
      />
      {[
        {
          type: 'Acronym',
          fact: 'G20 3 pillars: Inclusive growth, DPI, Climate finance',
          mnemonic: '"IDC" — Inclusive, Digital, Climate. I Don\'t Care → you MUST care about all three!',
        },
        {
          type: 'Story',
          fact: 'Rajasthan was the first state to implement Panchayati Raj (1959)',
          mnemonic: 'A RAJA of Rajasthan in 1959 giving his throne to the village panchayat.',
        },
      ].map((m, i) => (
        <div key={i} className={`${INSET} p-3.5 space-y-2`}>
          <span className={TAG}>{m.type}</span>
          <p className="text-[10px] font-semibold leading-snug text-ink-soft">{m.fact}</p>
          <div className="rounded-sm p-2.5 bg-paper-deep border border-rule">
            <p className="text-[10px] leading-relaxed text-ink">💡 {m.mnemonic}</p>
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
      <MockHeader icon={BadgeCheck} title="Your Exam Profile" />
      <p className="text-[11px] text-ink-muted">Select your target — Remindology personalises everything around it.</p>
      <div className="grid grid-cols-2 gap-1.5">
        {exams.map((exam, i) => (
          <div
            key={exam}
            className={`text-[11px] font-medium px-3 py-2 rounded-md border ${
              i === 0 ? 'border-ink bg-paper-raised text-ink font-semibold' : 'border-rule bg-paper text-ink-muted'
            }`}
          >
            {exam}
          </div>
        ))}
      </div>
      <div className="rounded-md border border-rule bg-paper-deep p-3 mt-1">
        <p className={`${SUBLABEL} mb-2`}>After selecting UPSC CSE:</p>
        {['Daily challenges use UPSC-level questions', 'Mains prompts from PYQs', '30-day plan covers all 4 GS papers', 'Current affairs tagged to GS1–GS4'].map(f => (
          <div key={f} className="flex items-center gap-1.5 text-[10px] mb-1 text-ink-soft">
            <Check className="h-3 w-3 shrink-0 text-ink" />{f}
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
      setActive((activeRef.current + 1) % NEW_FEATURES.length);
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

  const feature = NEW_FEATURES[active];


  return (
    <>
      {/* ── Mobile — flicker-free manual carousel, no auto-rotate/IntersectionObserver ── */}
      <div className="md:hidden card-quiet p-4 overflow-hidden">
        <MobileFeatureCarousel items={NEW_FEATURES} renderMockup={(id) => <NewMockup id={id as NewFeatureId} />} />
      </div>

      {/* ── Desktop/tablet — auto-rotating grid with progress bar ── */}
      <div
        ref={containerRef}
        className="hidden md:block card-quiet overflow-hidden"
      >
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes rmProgressSweepNFS {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
      `}} />
      <div className="grid lg:grid-cols-[1fr_360px] bg-paper-raised">

        {/* ── Left: feature grid ── */}
        <div className="p-4 sm:p-6 flex flex-col gap-4 border-b lg:border-b-0 lg:border-r border-rule bg-paper">
          <p className="eyebrow">
            Click any feature to preview
          </p>

          {/* 2 cols on mobile → 4 cols on sm+ (2 at lg while the detail panel sits beside it) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-2.5">
            {NEW_FEATURES.map((f, i) => {
              const Icon = f.icon;
              const isAct = i === active;
              return (
                <button
                  key={f.id}
                  onClick={() => handleSelect(i)}
                  aria-pressed={isAct}
                  className={`card-quiet is-interactive flex flex-col items-start gap-2 p-3.5 text-left cursor-pointer ${
                    isAct ? 'border-ink' : ''
                  }`}
                >
                  <Icon className="h-[18px] w-[18px] text-ink" strokeWidth={1.75} />
                  <span className="card-title text-[14px] leading-tight">
                    {f.label}
                  </span>
                  <span className="text-[11px] leading-snug text-ink-muted">
                    {f.tagline}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Progress bar + hint */}
          <div className="space-y-2">
            <div className="h-0.5 rounded-full overflow-hidden bg-paper-gray">
              <div
                key={animKey}
                className="h-full w-full rounded-full bg-gold"
                style={{
                  transformOrigin: 'left center',
                  animation: `rmProgressSweepNFS ${AUTO_ROTATE_MS}ms linear forwards`,
                  animationPlayState: isVisible ? 'running' : 'paused',
                  willChange: 'transform',
                }}
                onAnimationEnd={advanceTab}
              />
            </div>
            <p className="font-label text-[10px] uppercase tracking-[0.1em] text-center text-ink-muted">
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
                <div className="h-8 w-8 rounded-md border border-rule bg-paper-deep flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4 text-ink" strokeWidth={1.75} />
                </div>
              );
            })()}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="card-title">{feature.label}</p>
                <span className="font-label text-[9px] uppercase tracking-[0.1em] px-1.5 py-0.5 rounded-full border border-rule-strong text-ink shrink-0">
                  New
                </span>
              </div>
              <p className="text-[12px] mt-0.5 text-ink-muted">{feature.tagline}</p>
            </div>
          </div>

          {/* Mockup */}
          <div
            className="flex-1 overflow-y-auto"
            style={{ opacity: panelVisible ? 1 : 0, transition: 'opacity 0.18s ease-out', willChange: 'opacity' }}
          >
            <NewMockup id={feature.id} />
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
