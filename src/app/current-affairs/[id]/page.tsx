'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { currentAffairsService } from '@/services/current-affairs.service';
import type { RelatedPYQ } from '@/services/current-affairs.service';
import { QuestionText } from '@/components/mcq/QuestionText';
import { useAuthStore } from '@/store/use-auth-store';
import { TARGET_EXAM_LABELS } from '@/types/auth';
import type { PracticeQuestion } from '@/types/features';
import {
  ArrowLeft, ExternalLink, Share2, AlertCircle,
  ArrowRight, CheckCircle2, Clock, Zap, BookOpen,
} from 'lucide-react';

// Exams that need the full UPSC deep-dive (enriched_data)
const FULL_VIEW_EXAMS = ['UPSC_CSE', 'STATE_PSC'] as const;

// ── Design tokens ─────────────────────────────────────────────────

const MIDNIGHT   = '#09091F';
const BRAND_GRAD = 'linear-gradient(135deg, #7C3AED, #C026D3)';
const BORDER_D   = '1px solid rgba(124,58,237,0.2)';

const GS_CONFIG: Record<string, { color: string; bg: string; border: string; desc: string; syllabus: string }> = {
  GS1: {
    color: '#7C3AED', bg: 'rgba(124,58,237,0.08)', border: 'rgba(124,58,237,0.2)',
    desc: 'Indian Heritage & Society',
    syllabus: 'History · Geography · Art & Culture · Social Issues',
  },
  GS2: {
    color: '#0891B2', bg: 'rgba(8,145,178,0.08)', border: 'rgba(8,145,178,0.2)',
    desc: 'Polity & International Relations',
    syllabus: 'Constitution · Governance · IR · Social Justice',
  },
  GS3: {
    color: '#059669', bg: 'rgba(5,150,105,0.08)', border: 'rgba(5,150,105,0.2)',
    desc: 'Economy, Environment & Technology',
    syllabus: 'Economy · Technology · Environment · Security',
  },
  GS4: {
    color: '#DC2626', bg: 'rgba(220,38,38,0.08)', border: 'rgba(220,38,38,0.2)',
    desc: 'Ethics, Integrity & Aptitude',
    syllabus: 'Ethics · Integrity · Emotional Intelligence',
  },
};

const EXAM_MAP: Record<string, { label: string; color: string }> = {
  UPSC_Prelims: { label: 'UPSC Prelims', color: '#7C3AED' },
  UPSC_Mains:   { label: 'UPSC Mains',   color: '#0891B2' },
  State_PSC:    { label: 'State PSC',     color: '#059669' },
  upsc_prelims: { label: 'UPSC Prelims', color: '#7C3AED' },
  upsc_mains:   { label: 'UPSC Mains',   color: '#0891B2' },
  state_psc:    { label: 'State PSC',     color: '#059669' },
};

function resolveExamLabel(key: string) {
  if (EXAM_MAP[key]) return EXAM_MAP[key];
  return { label: key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()), color: '#6B63A0' };
}

// ── Section heading ────────────────────────────────────────────────

function SectionHeading({ children, color }: { children: string; color: string }) {
  return (
    <h2 style={{
      fontSize: '0.68rem', fontWeight: 900, letterSpacing: '0.13em',
      textTransform: 'uppercase', color,
      borderBottom: `2px solid ${color}22`, paddingBottom: '0.45rem',
    }}>
      {children}
    </h2>
  );
}

// ── Inline-bold renderer ──────────────────────────────────────────
// "Location: India's first TMZ…" → <strong>Location:</strong> India's first TMZ…

function RenderFact({ fact, color }: { fact: string; color: string }) {
  const nl    = fact.indexOf('\n');
  const first = nl === -1 ? fact : fact.slice(0, nl);
  const match = first.match(/^([A-Za-z][^:]{1,55}):\s*(.+)/);
  if (match) {
    return (
      <>
        <strong style={{ fontWeight: 700, color }}>{match[1]}:</strong>{' '}
        {match[2]}
      </>
    );
  }
  return <>{fact}</>;
}

// ── PYQ helpers ───────────────────────────────────────────────────

function formatPYQSource(source: string): string {
  if (!source) return 'Previous Year';
  const yearMatch = source.match(/\b(20\d{2})\b/);
  const year = yearMatch ? yearMatch[1] : '';
  const lower = source.toLowerCase();
  if (lower.includes('prelim')) return year ? `UPSC Prelims ${year}` : 'UPSC Prelims';
  if (lower.includes('mains'))  return year ? `UPSC Mains ${year}`   : 'UPSC Mains';
  if (lower.includes('state'))  return year ? `State PSC ${year}`    : 'State PSC';
  if (lower.includes('ssc'))    return year ? `SSC ${year}`          : 'SSC';
  // Generic fallback: strip underscores + "pyq", keep year
  return source.replace(/_/g, ' ').replace(/\bpyq\b/gi, '').replace(/\s+/g, ' ').trim()
    || 'Previous Year';
}

function PYQCard({ pyq, accentColor }: { pyq: RelatedPYQ; accentColor: string }) {
  const [expanded, setExpanded] = useState(false);
  const label = formatPYQSource(pyq.source);

  return (
    <div
      className="rounded-xl p-4 space-y-3"
      style={{ background: `${accentColor}05`, border: `1px solid ${accentColor}15` }}
    >
      {/* Source badge */}
      <span
        className="inline-flex items-center text-[10.5px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wide"
        style={{ background: `${accentColor}12`, color: accentColor, border: `1px solid ${accentColor}25` }}
      >
        {label}
      </span>

      {/* Question text */}
      <p
        className="text-[13.5px] leading-relaxed"
        style={{
          color: '#1F2937',
          display: '-webkit-box',
          WebkitBoxOrient: 'vertical',
          WebkitLineClamp: expanded ? 'unset' : 3,
          overflow: expanded ? 'visible' : 'hidden',
        }}
      >
        {pyq.content}
      </p>

      {/* Expand / collapse — only show when text is long enough */}
      {pyq.content.length > 160 && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-[11px] font-bold cursor-pointer transition-colors hover:opacity-70"
          style={{ color: accentColor }}
        >
          {expanded ? '↑ Show less' : '↓ Read full question'}
        </button>
      )}
    </div>
  );
}

// ── Interactive MCQ ────────────────────────────────────────────────

function MCQSection({ questions, accentColor }: { questions: PracticeQuestion[]; accentColor: string }) {
  const [answers, setAnswers] = useState<(string | null)[]>(questions.map(() => null));

  const pick = (qi: number, opt: string) => {
    setAnswers((prev) => {
      if (prev[qi] !== null) return prev;
      const next = [...prev];
      next[qi] = opt;
      return next;
    });
  };

  return (
    <section className="space-y-5">
      <SectionHeading color={accentColor}>Practice MCQ</SectionHeading>
      {questions.map((q, qi) => {
        const chosen   = answers[qi];
        const answered = chosen !== null;
        const correct  = q.correct_answer;
        return (
          <div key={qi} className="space-y-3 pb-5" style={{ borderBottom: qi < questions.length - 1 ? '1px solid rgba(0,0,0,0.06)' : 'none' }}>
            <div className="flex items-start gap-1.5">
              <span className="text-sm font-bold shrink-0" style={{ color: accentColor }}>Q{qi + 1}.</span>
              <QuestionText
                text={q.question}
                introClassName="text-sm font-semibold leading-relaxed"
              />
            </div>
            <div className="space-y-2">
              {q.options.map((opt, oi) => {
                const isChosen   = chosen === opt;
                const isCorrect  = opt === correct;
                const showGreen  = answered && isCorrect;
                const showRed    = answered && isChosen && !isCorrect;
                const dim        = answered && !isCorrect && !isChosen;
                return (
                  <button
                    key={oi}
                    type="button"
                    onClick={() => pick(qi, opt)}
                    disabled={answered}
                    className={cn(
                      'w-full text-left px-4 py-2.5 rounded-xl border text-sm transition-all',
                      !answered && 'cursor-pointer hover:border-primary/30 hover:bg-primary/5',
                      showGreen && 'border-emerald-500/60 bg-emerald-50',
                      showRed   && 'border-red-400/60 bg-red-50',
                      dim       && 'opacity-40',
                    )}
                    style={{
                      color: showGreen ? '#065F46' : showRed ? '#991B1B' : '#1F2937',
                      borderColor: !answered ? 'rgba(0,0,0,0.1)' : undefined,
                    }}
                  >
                    <span className="font-bold mr-2" style={{ color: showGreen ? '#059669' : showRed ? '#DC2626' : accentColor }}>
                      {String.fromCharCode(65 + oi)}.
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>
            {answered && (
              <div
                className="rounded-xl p-3.5"
                style={{
                  background: chosen === correct ? 'rgba(5,150,105,0.06)' : 'rgba(220,38,38,0.06)',
                  border: `1px solid ${chosen === correct ? 'rgba(5,150,105,0.2)' : 'rgba(220,38,38,0.2)'}`,
                }}
              >
                {chosen !== correct && (
                  <p className="text-[11px] font-extrabold mb-1.5" style={{ color: '#059669' }}>
                    ✓ Correct answer: {correct}
                  </p>
                )}
                <p className="text-[12px] leading-relaxed" style={{ color: '#374151' }}>
                  {q.explanation}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────

function DetailSkeleton() {
  return (
    <>
      <section style={{ background: MIDNIGHT }}>
        <div className="max-w-6xl mx-auto px-6 pt-10 pb-14 space-y-5 animate-pulse">
          <div className="h-3 w-40 rounded bg-white/10" />
          <div className="flex gap-2">
            <div className="h-6 w-20 rounded-full bg-white/10" />
            <div className="h-6 w-16 rounded-full bg-white/10" />
          </div>
          <div className="h-8 w-full rounded bg-white/10" />
          <div className="h-8 w-4/5 rounded bg-white/10" />
          <div className="h-4 w-48 rounded bg-white/10" />
        </div>
      </section>
      <section style={{ background: '#FFFFFF' }}>
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid lg:grid-cols-[1fr_240px] gap-12 animate-pulse">
            <div className="space-y-10">
              {[1, 2, 3].map((s) => (
                <div key={s} className="space-y-3">
                  <Skeleton className="h-3 w-28 rounded" />
                  {[95, 88, 78, 65].map((w, i) => (
                    <Skeleton key={i} className="h-4 rounded" style={{ width: `${w}%` }} />
                  ))}
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-12 rounded-xl" />)}
              </div>
            </div>
            <div className="space-y-4">
              <Skeleton className="h-36 w-full rounded-2xl" />
              <Skeleton className="h-28 w-full rounded-2xl" />
              <Skeleton className="h-20 w-full rounded-2xl" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

// ── Main page ─────────────────────────────────────────────────────

export default function ArticleDetailPage() {
  const { id }      = useParams<{ id: string }>();
  const userExam    = useAuthStore((s) => s.user?.target_exam);
  // SSC / Banking / RRB / NDA get the quick-facts brief view; UPSC + State PSC get the full page
  const isBriefView = !!userExam && !(FULL_VIEW_EXAMS as readonly string[]).includes(userExam);

  const { data: article, isLoading, isError } = useQuery({
    queryKey: ['current-affairs', 'detail', id, isBriefView ? 'brief' : 'full'],
    queryFn: () => currentAffairsService.getById(id, isBriefView),
    staleTime: 60 * 60 * 1000,
    retry: false,
    enabled: !!id,
  });

  const { data: relatedPYQs } = useQuery({
    queryKey: ['current-affairs', 'pyqs', id],
    queryFn: () => currentAffairsService.getRelatedPYQs(id),
    staleTime: 60 * 60 * 1000,
    retry: false,
    enabled: !!id,
  });

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({ title: article?.title ?? 'Current Affairs', url: window.location.href });
    } else if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (isLoading) return <DetailSkeleton />;

  if (isError || !article) {
    return (
      <section style={{ background: '#FFFFFF', minHeight: '60vh' }}>
        <div className="max-w-6xl mx-auto px-6 py-20 flex flex-col items-center gap-4 text-center">
          <AlertCircle className="h-12 w-12" style={{ color: '#DC2626', opacity: 0.5 }} />
          <p className="text-lg font-semibold" style={{ color: '#1A1836' }}>Article not found</p>
          <p className="text-sm" style={{ color: '#6B63A0' }}>
            This article may have been removed or the link is invalid.
          </p>
          <Link
            href="/current-affairs"
            className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl text-white mt-2"
            style={{ background: BRAND_GRAD }}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Current Affairs
          </Link>
        </div>
      </section>
    );
  }

  const ed          = article.enrichedData;
  const primaryGS   = article.gsPaperTags[0];
  const gsCfg       = primaryGS ? GS_CONFIG[primaryGS] : null;
  const accentColor = gsCfg?.color ?? '#7C3AED';

  const dateStr = article.publishedDate
    ? new Date(article.publishedDate).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : '';

  const totalWords = [
    article.summary, ...(article.keyFacts ?? []),
    article.mainsAngle, ed?.historicalBackground ?? '',
    ...(ed?.mainsAngles ?? []), ...(ed?.wayForward ?? []),
  ].join(' ').split(/\s+/).length;
  const readMins = Math.max(1, Math.ceil(totalWords / 200));

  const relevantExams = Object.entries(article.examRelevance ?? {})
    .filter(([, v]) => v).map(([k]) => k);

  // Prefer enriched angles array; fall back to old single-string field
  const mainsAngles = (ed?.mainsAngles?.length ?? 0) > 0
    ? ed!.mainsAngles!
    : article.mainsAngle ? [article.mainsAngle] : [];

  // Prefer enriched why-in-news; fall back to summary
  const whyInNews = ed?.whyInNews || article.summary;

  const TEXT_MUTED   = '#6B7280';
  const TEXT_BODY    = '#1F2937';

  return (
    <div style={{ fontFamily: 'var(--font-poppins), system-ui, sans-serif' }}>

      <style>{`
        @keyframes ca-fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .ca-article { animation: ca-fade-in 0.45s ease both; animation-delay: 0.08s; }
        .ca-sidebar { animation: ca-fade-in 0.45s ease both; animation-delay: 0.18s; }
      `}</style>

      {/* ── Dark hero ── */}
      <section className="relative overflow-hidden" style={{ background: MIDNIGHT }}>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(167,139,250,0.07) 1px, transparent 1px)',
            backgroundSize: '30px 30px',
          }}
        />
        <div
          className="absolute pointer-events-none"
          style={{
            top: 0, right: '-10%', width: 440, height: 440, borderRadius: '50%',
            background: `radial-gradient(circle, ${accentColor}28 0%, transparent 68%)`,
          }}
        />

        <div className="relative max-w-6xl mx-auto px-6 pt-10 pb-14">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs mb-6" style={{ color: 'rgba(196,181,253,0.5)' }}>
            <Link href="/current-affairs" className="hover:text-white transition-colors flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" />
              Current Affairs
            </Link>
            <span>/</span>
            <span className="truncate max-w-xs" style={{ color: 'rgba(196,181,253,0.75)' }}>
              {article.title.length > 55 ? `${article.title.slice(0, 55)}…` : article.title}
            </span>
          </div>

          {/* View mode badge */}
          {userExam && (
            <div className="flex items-center gap-2 mb-5">
              <span
                className="inline-flex items-center gap-1.5 text-[11px] font-extrabold px-3 py-1.5 rounded-full"
                style={isBriefView
                  ? { background: 'rgba(14,165,233,0.18)', border: '1px solid rgba(14,165,233,0.35)', color: '#38BDF8' }
                  : { background: 'rgba(124,58,237,0.18)', border: '1px solid rgba(124,58,237,0.35)', color: '#A78BFA' }
                }
              >
                {isBriefView
                  ? <><Zap className="h-3 w-3" />Quick Facts · {TARGET_EXAM_LABELS[userExam]}</>
                  : <><BookOpen className="h-3 w-3" />Full Analysis · {TARGET_EXAM_LABELS[userExam]}</>
                }
              </span>
            </div>
          )}

          {/* GS tags */}
          <div className="flex flex-wrap gap-2 mb-5">
            {article.gsPaperTags.map((tag) => {
              const cfg = GS_CONFIG[tag];
              return cfg ? (
                <span
                  key={tag}
                  className="text-xs font-bold px-3 py-1 rounded-full"
                  style={{ background: `${cfg.color}22`, color: cfg.color, border: `1px solid ${cfg.color}44` }}
                >
                  {tag} · {cfg.desc}
                </span>
              ) : null;
            })}
          </div>

          <h1
            className="font-extrabold tracking-tight mb-5"
            style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)', lineHeight: 1.15, color: '#F0EEFF' }}
          >
            {article.title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-xs" style={{ color: 'rgba(196,181,253,0.55)' }}>
            {article.sourceName && (
              <span className="font-semibold" style={{ color: 'rgba(196,181,253,0.8)' }}>{article.sourceName}</span>
            )}
            {dateStr && <span>{dateStr}</span>}
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />{readMins} min read
            </span>
            {article.sourceUrl && (
              <a
                href={article.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 hover:text-white transition-colors"
              >
                <ExternalLink className="h-3 w-3" />Source
              </a>
            )}
            <button
              onClick={handleShare}
              className="ml-auto inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all hover:bg-white/10 cursor-pointer"
              style={{ border: BORDER_D, color: 'rgba(196,181,253,0.7)' }}
            >
              <Share2 className="h-3.5 w-3.5" />Share
            </button>
          </div>
        </div>
      </section>

      {/* ── Document body ── */}
      <section style={{ background: '#FFFFFF' }}>
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid lg:grid-cols-[1fr_240px] gap-12 items-start">

            {/* ── Main article ── */}
            <article className="ca-article space-y-10">

              {/* 1 — Why in News */}
              <section className="space-y-3.5">
                <SectionHeading color={accentColor}>Why in News?</SectionHeading>
                <p style={{ fontSize: '0.9625rem', lineHeight: 1.9, color: TEXT_BODY, fontWeight: 450 }}>
                  {whyInNews}
                </p>
              </section>

              {/* 2 — Prelims Quick Facts table */}
              {(ed?.prelimsFacts?.length ?? 0) > 0 && (
                <section className="space-y-3.5">
                  <SectionHeading color={accentColor}>Prelims Quick Facts</SectionHeading>
                  <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${accentColor}20` }}>
                    {ed!.prelimsFacts!.map((f, i) => (
                      <div
                        key={i}
                        className="flex"
                        style={{
                          borderBottom: i < ed!.prelimsFacts!.length - 1
                            ? `1px solid ${accentColor}15` : 'none',
                        }}
                      >
                        <div
                          className="w-5/12 px-4 py-2.5 flex items-center text-[11.5px] font-medium"
                          style={{
                            background: i % 2 === 0 ? `${accentColor}07` : `${accentColor}03`,
                            color: TEXT_MUTED,
                            borderRight: `1px solid ${accentColor}15`,
                          }}
                        >
                          {f.label}
                        </div>
                        <div
                          className="flex-1 px-4 py-2.5 flex items-center text-[12px] font-bold"
                          style={{
                            background: i % 2 === 0 ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.5)',
                            color: '#111827',
                          }}
                        >
                          {f.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* 3 — Key Points */}
              {article.keyFacts.length > 0 && (
                <section className="space-y-3.5">
                  <SectionHeading color={accentColor}>Key Points</SectionHeading>
                  <ul className="space-y-3.5" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {article.keyFacts.map((fact, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span
                          className="rounded-full shrink-0"
                          style={{
                            width: 6, height: 6, marginTop: '0.55rem',
                            background: accentColor, opacity: 0.65, flexShrink: 0,
                          }}
                        />
                        <span style={{ fontSize: '0.9375rem', lineHeight: 1.85, color: TEXT_BODY }}>
                          <RenderFact fact={fact} color={accentColor} />
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* 4 — Historical Background */}
              {ed?.historicalBackground && (
                <section className="space-y-3.5">
                  <SectionHeading color={accentColor}>Historical Background</SectionHeading>
                  <div
                    className="rounded-xl px-5 py-4"
                    style={{ background: `${accentColor}06`, border: `1px solid ${accentColor}14` }}
                  >
                    <p style={{ fontSize: '0.9375rem', lineHeight: 1.88, color: TEXT_BODY }}>
                      {ed.historicalBackground}
                    </p>
                  </div>
                </section>
              )}

              {/* 5 — Key Terms */}
              {(ed?.keyTerms?.length ?? 0) > 0 && (
                <section className="space-y-3.5">
                  <SectionHeading color={accentColor}>Key Terms</SectionHeading>
                  <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${accentColor}18` }}>
                    {ed!.keyTerms!.map((t, i) => (
                      <div
                        key={i}
                        className="flex flex-col sm:flex-row sm:items-start gap-0.5 sm:gap-4 px-4 py-3.5"
                        style={{
                          borderBottom: i < ed!.keyTerms!.length - 1 ? `1px solid ${accentColor}10` : 'none',
                          background: i % 2 === 0 ? `${accentColor}05` : '#FFFFFF',
                        }}
                      >
                        <span
                          className="text-[11.5px] font-extrabold leading-snug shrink-0 sm:w-44 sm:pt-0.5"
                          style={{ color: accentColor }}
                        >
                          {t.term}
                        </span>
                        <span className="text-sm leading-relaxed" style={{ color: TEXT_BODY }}>
                          {t.definition}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* 6 — Mains Angles */}
              {mainsAngles.length > 0 && (
                <section className="space-y-3.5">
                  <SectionHeading color={accentColor}>Mains Angles</SectionHeading>
                  <ol className="space-y-2.5" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {mainsAngles.map((angle, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span
                          className="h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-extrabold shrink-0"
                          style={{ background: `${accentColor}12`, color: accentColor, marginTop: 2 }}
                        >
                          {i + 1}
                        </span>
                        <span style={{ fontSize: '0.9rem', lineHeight: 1.85, color: TEXT_BODY }}>{angle}</span>
                      </li>
                    ))}
                  </ol>
                </section>
              )}

              {/* 7 — Way Forward */}
              {(ed?.wayForward?.length ?? 0) > 0 && (
                <section className="space-y-3.5">
                  <SectionHeading color={accentColor}>Way Forward</SectionHeading>
                  <ul className="space-y-2.5" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {ed!.wayForward!.map((point, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span
                          className="text-sm font-bold shrink-0"
                          style={{ color: accentColor, marginTop: 1 }}
                        >
                          →
                        </span>
                        <span style={{ fontSize: '0.9rem', lineHeight: 1.85, color: TEXT_BODY }}>{point}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* 8 — Constitutional Provisions */}
              {(ed?.constitutionalProvisions?.length ?? 0) > 0 && (
                <section className="space-y-3.5">
                  <SectionHeading color={accentColor}>Constitutional Provisions</SectionHeading>
                  <div className="flex flex-wrap gap-2">
                    {ed!.constitutionalProvisions!.map((p, i) => (
                      <span
                        key={i}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg"
                        style={{
                          background: `${accentColor}10`,
                          color: accentColor,
                          border: `1px solid ${accentColor}25`,
                        }}
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {/* 9 — Practice MCQ */}
              {(article.practiceQuestions?.length ?? 0) > 0 && (
                <div
                  className="rounded-2xl p-6 space-y-5"
                  style={{ background: '#FFFFFF', border: `1px solid ${accentColor}18` }}
                >
                  <MCQSection questions={article.practiceQuestions!} accentColor={accentColor} />
                </div>
              )}

              {/* 10 — Previous Year Questions */}
              {(relatedPYQs?.length ?? 0) > 0 && (
                <section className="space-y-3.5">
                  <SectionHeading color={accentColor}>Previous Year Questions on this Topic</SectionHeading>
                  <div className="space-y-3">
                    {relatedPYQs!.map((pyq) => (
                      <PYQCard key={pyq.id} pyq={pyq} accentColor={accentColor} />
                    ))}
                  </div>
                </section>
              )}

              {/* 11 — Topics + Exam footer */}
              {(article.topicTags.length > 0 || relevantExams.length > 0) && (
                <section className="space-y-3 pt-2">
                  <div className="h-px" style={{ background: `${accentColor}18` }} />

                  {article.topicTags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className="text-[10px] font-extrabold uppercase tracking-widest shrink-0"
                        style={{ color: accentColor, opacity: 0.7 }}
                      >
                        Topics
                      </span>
                      {article.topicTags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[11px] font-medium px-2.5 py-1 rounded-lg"
                          style={{ background: `${accentColor}08`, color: '#4B5563', border: `1px solid ${accentColor}18` }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {relevantExams.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className="text-[10px] font-extrabold uppercase tracking-widest shrink-0"
                        style={{ color: accentColor, opacity: 0.7 }}
                      >
                        Exams
                      </span>
                      {relevantExams.map((key) => {
                        const { label, color } = resolveExamLabel(key);
                        return (
                          <span
                            key={key}
                            className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg"
                            style={{ background: `${color}10`, color, border: `1px solid ${color}25` }}
                          >
                            <CheckCircle2 className="h-2.5 w-2.5" />
                            {label}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </section>
              )}

              {/* Brief-mode upgrade nudge */}
              {isBriefView && (
                <div
                  className="rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4"
                  style={{ background: 'rgba(124,58,237,0.05)', border: '1px solid rgba(124,58,237,0.15)' }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold" style={{ color: '#1A1836' }}>
                      Want the full UPSC breakdown?
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>
                      Historical Background, Mains Angles, Way Forward &amp; Constitutional Provisions — available in UPSC / State PSC mode.
                    </p>
                  </div>
                  <Link
                    href="/profile"
                    className="shrink-0 inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity"
                    style={{ background: BRAND_GRAD, color: '#FFFFFF' }}
                  >
                    Change Exam<ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              )}

              {/* Navigation */}
              <div
                className="flex items-center justify-between pt-2"
                style={{ borderTop: `1px solid ${accentColor}15` }}
              >
                <Link
                  href="/current-affairs"
                  className="inline-flex items-center gap-2 text-sm font-semibold rounded-xl px-5 py-2.5 transition-all hover:shadow-sm"
                  style={{ border: '1px solid rgba(124,58,237,0.2)', color: '#7C3AED', background: 'rgba(124,58,237,0.04)' }}
                >
                  <ArrowLeft className="h-4 w-4" />All Articles
                </Link>
                <button
                  onClick={handleShare}
                  className="inline-flex items-center gap-2 text-sm font-semibold rounded-xl px-5 py-2.5 text-white transition-opacity hover:opacity-90 cursor-pointer"
                  style={{ background: BRAND_GRAD }}
                >
                  <Share2 className="h-4 w-4" />Share
                </button>
              </div>
            </article>

            {/* ── Sidebar ── */}
            <aside className="ca-sidebar space-y-4">

              {/* GS Paper */}
              {gsCfg && (
                <div
                  className="rounded-2xl p-5 overflow-hidden"
                  style={{ background: '#FFFFFF', border: `1px solid ${gsCfg.border}` }}
                >
                  <div className="h-0.75 rounded-full mb-4" style={{ background: gsCfg.color }} />
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <p className="text-[10px] font-extrabold uppercase tracking-widest mb-0.5" style={{ color: gsCfg.color }}>
                        {primaryGS}
                      </p>
                      <p className="text-sm font-bold" style={{ color: '#1A1836' }}>{gsCfg.desc}</p>
                    </div>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                      style={{ background: gsCfg.bg, color: gsCfg.color, border: `1px solid ${gsCfg.border}` }}
                    >
                      {isBriefView ? 'GS' : 'UPSC'}
                    </span>
                  </div>
                  <div className="rounded-xl p-3" style={{ background: gsCfg.bg }}>
                    <p className="text-[10px] font-bold mb-1" style={{ color: gsCfg.color }}>Syllabus</p>
                    <p className="text-[11px] leading-relaxed" style={{ color: '#4B5563' }}>
                      {ed?.syllabusDetail || gsCfg.syllabus}
                    </p>
                  </div>
                </div>
              )}

              {/* Article Info */}
              <div
                className="rounded-2xl p-4 space-y-3"
                style={{ background: '#FFFFFF', border: '1px solid rgba(124,58,237,0.1)' }}
              >
                <p className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: '#6B63A0' }}>
                  Article Info
                </p>
                <div className="space-y-2.5 text-xs">
                  {article.keyFacts.length > 0 && (
                    <div className="flex items-center justify-between">
                      <span style={{ color: TEXT_MUTED }}>Key points</span>
                      <span className="font-bold" style={{ color: '#1A1836' }}>{article.keyFacts.length}</span>
                    </div>
                  )}
                  {(ed?.prelimsFacts?.length ?? 0) > 0 && (
                    <div className="flex items-center justify-between">
                      <span style={{ color: TEXT_MUTED }}>Prelims facts</span>
                      <span className="font-bold" style={{ color: '#1A1836' }}>{ed!.prelimsFacts!.length}</span>
                    </div>
                  )}
                  {(ed?.keyTerms?.length ?? 0) > 0 && (
                    <div className="flex items-center justify-between">
                      <span style={{ color: TEXT_MUTED }}>Key terms</span>
                      <span className="font-bold" style={{ color: '#1A1836' }}>{ed!.keyTerms!.length}</span>
                    </div>
                  )}
                  {(article.practiceQuestions?.length ?? 0) > 0 && (
                    <div className="flex items-center justify-between">
                      <span style={{ color: TEXT_MUTED }}>Practice MCQ</span>
                      <span
                        className="font-bold px-1.5 py-0.5 rounded"
                        style={{ color: accentColor, background: `${accentColor}10` }}
                      >
                        {article.practiceQuestions!.length} Q
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span style={{ color: TEXT_MUTED }}>Read time</span>
                    <span className="font-bold" style={{ color: '#1A1836' }}>{readMins} min</span>
                  </div>
                  {article.sourceName && (
                    <div className="flex items-center justify-between gap-2">
                      <span style={{ color: TEXT_MUTED }}>Source</span>
                      {article.sourceUrl ? (
                        <a
                          href={article.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 hover:underline font-semibold truncate max-w-28"
                          style={{ color: accentColor }}
                        >
                          {article.sourceName}
                          <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                        </a>
                      ) : (
                        <span className="font-semibold truncate max-w-28 text-right" style={{ color: '#1A1836' }}>
                          {article.sourceName}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Exam relevance */}
              {relevantExams.length > 0 && (
                <div
                  className="rounded-2xl p-4 space-y-2.5"
                  style={{ background: '#FFFFFF', border: '1px solid rgba(124,58,237,0.1)' }}
                >
                  <p className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: '#6B63A0' }}>
                    Exam Relevance
                  </p>
                  {relevantExams.map((key) => {
                    const { label, color } = resolveExamLabel(key);
                    return (
                      <div key={key} className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" style={{ color }} />
                        <span className="text-xs font-semibold" style={{ color: '#1A1836' }}>{label}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* CTA */}
              <div
                className="rounded-2xl p-5 relative overflow-hidden"
                style={{ background: isBriefView
                  ? 'linear-gradient(135deg, #0369A1 0%, #0891B2 100%)'
                  : 'linear-gradient(135deg, #5B21B6 0%, #7C3AED 100%)'
                }}
              >
                <div
                  className="absolute top-0 right-0 w-28 h-28 pointer-events-none"
                  style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '50%', transform: 'translate(30%, -30%)' }}
                />
                <div className="relative">
                  {isBriefView ? (
                    <>
                      <p className="text-white font-bold text-sm mb-1">Practice with MCQs</p>
                      <p className="text-xs mb-4 leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>
                        Reinforce these facts with AI-generated MCQs &amp; daily challenges for {userExam ? TARGET_EXAM_LABELS[userExam] : 'your exam'}.
                      </p>
                      <Link
                        href="/signup"
                        className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl hover:opacity-90 transition-opacity"
                        style={{ background: '#FFFFFF', color: '#0891B2' }}
                      >
                        Start Free<ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </>
                  ) : (
                    <>
                      <p className="text-white font-bold text-sm mb-1">Go deeper with AI</p>
                      <p className="text-xs mb-4 leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>
                        Ask Remi about this topic — get examples, case studies &amp; model answers.
                      </p>
                      <Link
                        href="/signup"
                        className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl hover:opacity-90 transition-opacity"
                        style={{ background: '#FFFFFF', color: '#7C3AED' }}
                      >
                        Try for Free<ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}
