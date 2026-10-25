'use client';

import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { sanitizeHtml } from '@/lib/sanitize-html';
import { currentAffairsService } from '@/services/current-affairs.service';
import type { RelatedPYQ } from '@/services/current-affairs.service';
import { useRecentCurrentAffairs } from '@/features/current-affairs/hooks/use-current-affairs';
import { QuestionText } from '@/components/mcq/QuestionText';
import { ExplanationText } from '@/components/mcq/ExplanationText';
import { SaveNoteButton } from '@/components/notes/SaveNoteButton';
import { TableOfContents, type TocItem } from '@/components/content/TableOfContents';
import { useAuthStore } from '@/store/use-auth-store';
import { TARGET_EXAM_LABELS } from '@/types/auth';
import type { CurrentAffairsArticle, PracticeQuestion } from '@/types/features';
import {
  ArrowLeft, ExternalLink, Share2, AlertCircle,
  ArrowRight, CheckCircle2, Clock, Zap, BookOpen, List, BadgeCheck,
} from 'lucide-react';

// Exams that need the full UPSC deep-dive (enriched_data)
const FULL_VIEW_EXAMS = ['UPSC_CSE', 'STATE_PSC'] as const;

// ── Design tokens ─────────────────────────────────────────────────
// Clean Editorial: warm off-white surface, ink text, one deep-green accent.

const INK        = '#16233E';
const MUTED      = '#5B6478';
const ACCENT     = '#8A6A12';
const SURFACE    = '#F7F4EC';
const BRAND_GRAD = ACCENT;
const BORDER_D   = '1px solid rgba(22,35,62,0.1)';
const SERIF      = { fontFamily: 'var(--font-serif-display), Georgia, serif' };

// Real GS-paper taxonomy — kept as distinct categorical colors, muted so
// none of them compete with the one dominant accent.
const GS_CONFIG: Record<string, { color: string; bg: string; border: string; desc: string; syllabus: string }> = {
  GS1: {
    color: '#6B5B95', bg: 'rgba(107,91,149,0.08)', border: 'rgba(107,91,149,0.2)',
    desc: 'Indian Heritage & Society',
    syllabus: 'History · Geography · Art & Culture · Social Issues',
  },
  GS2: {
    color: '#2E6F85', bg: 'rgba(46,111,133,0.08)', border: 'rgba(46,111,133,0.2)',
    desc: 'Polity & International Relations',
    syllabus: 'Constitution · Governance · IR · Social Justice',
  },
  GS3: {
    color: '#9A6324', bg: 'rgba(154,99,36,0.08)', border: 'rgba(154,99,36,0.2)',
    desc: 'Economy, Environment & Technology',
    syllabus: 'Economy · Technology · Environment · Security',
  },
  GS4: {
    color: '#9C3848', bg: 'rgba(156,56,72,0.08)', border: 'rgba(156,56,72,0.2)',
    desc: 'Ethics, Integrity & Aptitude',
    syllabus: 'Ethics · Integrity · Emotional Intelligence',
  },
};

const EXAM_MAP: Record<string, { label: string; color: string }> = {
  UPSC_Prelims: { label: 'UPSC Prelims', color: '#6B5B95' },
  UPSC_Mains:   { label: 'UPSC Mains',   color: '#2E6F85' },
  State_PSC:    { label: 'State PSC',     color: '#3F7D6B' },
  upsc_prelims: { label: 'UPSC Prelims', color: '#6B5B95' },
  upsc_mains:   { label: 'UPSC Mains',   color: '#2E6F85' },
  state_psc:    { label: 'State PSC',     color: '#3F7D6B' },
};

function resolveExamLabel(key: string) {
  if (EXAM_MAP[key]) return EXAM_MAP[key];
  return { label: key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()), color: MUTED };
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

// Strips rich-text HTML tags for use as plain-text saved-note content
function stripHtml(text: string): string {
  return text.includes('<') ? text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : text;
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
  return source.replace(/_/g, ' ').replace(/\bpyq\b/gi, '').replace(/\s+/g, ' ').trim() || 'Previous Year';
}

function PYQCard({ pyq, accentColor }: { pyq: RelatedPYQ; accentColor: string }) {
  const [expanded, setExpanded] = useState(false);
  const label = formatPYQSource(pyq.source);
  const isLong = pyq.content.length > 200;

  return (
    <div className="rounded-xl p-4 space-y-2.5" style={{ border: `1px solid ${accentColor}20`, background: `${accentColor}05` }}>
      <span
        className="inline-flex items-center text-[10.5px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wide"
        style={{ background: `${accentColor}15`, color: accentColor, border: `1px solid ${accentColor}30` }}
      >
        {label}
      </span>
      <p
        className="text-[13.5px] leading-relaxed text-foreground/80"
        style={!expanded && isLong ? { display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 4, overflow: 'hidden' } : undefined}
      >
        {pyq.content}
      </p>
      {isLong && (
        <button
          onClick={() => setExpanded(v => !v)}
          className="text-[12px] font-semibold cursor-pointer hover:opacity-70"
          style={{ color: accentColor }}
        >
          {expanded ? '↑ Show less' : '↓ Read more'}
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
                      color: showGreen ? '#065F46' : showRed ? '#991B1B' : INK,
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
                <ExplanationText
                  text={q.explanation}
                  className="text-[12px] leading-relaxed"
                />
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
      <section style={{ background: SURFACE }}>
        <div className="max-w-6xl mx-auto px-6 pt-10 pb-14 space-y-5 animate-pulse">
          <div className="h-3 w-40 rounded bg-black/10" />
          <div className="flex gap-2">
            <div className="h-6 w-20 rounded-full bg-black/10" />
            <div className="h-6 w-16 rounded-full bg-black/10" />
          </div>
          <div className="h-8 w-full rounded bg-black/10" />
          <div className="h-8 w-4/5 rounded bg-black/10" />
          <div className="h-4 w-48 rounded bg-black/10" />
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

export function ArticleDetailClient() {
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

  // Client-side "related articles" heuristic: overlapping topic/GS-paper tags
  // against a recent-articles pool. No dedicated backend endpoint for this yet.
  const { data: recentArticles } = useRecentCurrentAffairs(30);
  const relatedArticles = useMemo<CurrentAffairsArticle[]>(() => {
    if (!article || !recentArticles) return [];
    return recentArticles
      .filter((a) => a.id !== article.id && (
        a.topicTags.some((t) => article.topicTags.includes(t))
        || a.gsPaperTags.some((g) => article.gsPaperTags.includes(g))
      ))
      .slice(0, 4);
  }, [article, recentArticles]);

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
          <p className="text-lg font-semibold" style={{ color: INK }}>Article not found</p>
          <p className="text-sm" style={{ color: MUTED }}>
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
  const accentColor = gsCfg?.color ?? ACCENT;

  const dateStr = article.publishedDate
    ? new Date(article.publishedDate).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : '';

  const totalWords = [
    article.summary, ...(article.keyFacts ?? []),
    article.mainsAngle, ...(ed?.keyFeatures ?? []).map((f) => f.content),
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

  const TEXT_MUTED   = MUTED;
  const TEXT_BODY    = INK;

  // Table of contents — built from the exact same guards that decide what
  // renders below, so it never links to a section that isn't actually there.
  const tocItems: TocItem[] = [
    { id: 'why-in-news', label: 'Why in News?' },
    ...((ed?.prelimsFacts?.length ?? 0) > 0 ? [{ id: 'prelims-quick-facts', label: 'Prelims Quick Facts' }] : []),
    ...(article.keyFacts.length > 0 ? [{ id: 'key-points', label: 'Key Points' }] : []),
    ...((ed?.keyFeatures?.length ?? 0) > 0 ? [{ id: 'key-features', label: 'Key Features' }] : []),
    ...((ed?.keyTerms?.length ?? 0) > 0 ? [{ id: 'key-terms', label: 'Key Terms' }] : []),
    ...(mainsAngles.length > 0 ? [{ id: 'mains-angles', label: 'Mains Angles' }] : []),
    ...((ed?.wayForward?.length ?? 0) > 0 ? [{ id: 'way-forward', label: 'Way Forward' }] : []),
    ...((ed?.constitutionalProvisions?.length ?? 0) > 0 ? [{ id: 'constitutional-provisions', label: 'Constitutional Provisions' }] : []),
    ...((article.practiceQuestions?.length ?? 0) > 0 ? [{ id: 'practice-mcq', label: 'Practice MCQ' }] : []),
  ];

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

      {/* ── Hero ── */}
      <section className="relative overflow-hidden" style={{ background: SURFACE }}>
        <div className="relative max-w-6xl mx-auto px-6 pt-10 pb-14">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs mb-6" style={{ color: MUTED }}>
            <Link href="/current-affairs" className="hover:text-[#16233E] transition-colors flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" />
              Current Affairs
            </Link>
            <span>/</span>
            <span className="truncate max-w-xs" style={{ color: INK, opacity: 0.75 }}>
              {article.title.length > 55 ? `${article.title.slice(0, 55)}…` : article.title}
            </span>
          </div>

          {/* Kicker — masthead-style section label, newspaper convention */}
          <p
            className="flex items-center gap-2.5 text-[11px] font-bold uppercase mb-4"
            style={{ color: ACCENT, letterSpacing: '0.16em' }}
          >
            <span className="inline-block h-px w-6" style={{ background: ACCENT }} />
            Current Affairs
            {userExam && (
              <>
                <span style={{ color: MUTED }}>·</span>
                <span className="inline-flex items-center gap-1" style={{ color: MUTED }}>
                  {isBriefView ? <Zap className="h-3 w-3" /> : <BookOpen className="h-3 w-3" />}
                  {isBriefView ? 'Quick Facts' : 'Full Analysis'} · {TARGET_EXAM_LABELS[userExam]}
                </span>
              </>
            )}
          </p>

          {/* GS tags */}
          <div className="flex flex-wrap gap-2 mb-5">
            {article.gsPaperTags.map((tag) => {
              const cfg = GS_CONFIG[tag];
              return cfg ? (
                <span
                  key={tag}
                  className="text-xs font-bold px-3 py-1 rounded-full"
                  style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
                >
                  {tag} · {cfg.desc}
                </span>
              ) : null;
            })}
          </div>

          <h1
            className="font-semibold tracking-tight mb-6"
            style={{ ...SERIF, fontSize: 'clamp(1.9rem, 4.4vw, 3.1rem)', lineHeight: 1.18, color: INK }}
          >
            {article.title}
          </h1>

          {/* Dateline — newspaper byline strip, bordered top & bottom */}
          <div
            className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] uppercase py-3"
            style={{ color: MUTED, borderTop: BORDER_D, borderBottom: BORDER_D, letterSpacing: '0.04em' }}
          >
            {article.sourceName && (
              <span className="font-bold" style={{ color: INK, letterSpacing: '0.02em' }}>{article.sourceName}</span>
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
                className="inline-flex items-center gap-1 hover:text-[#16233E] transition-colors"
              >
                <ExternalLink className="h-3 w-3" />Source
              </a>
            )}
            <button
              onClick={handleShare}
              className="ml-auto inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all hover:bg-black/5 cursor-pointer"
              style={{ border: BORDER_D, color: MUTED }}
            >
              <Share2 className="h-3.5 w-3.5" />Share
            </button>
          </div>

          {/* Credibility line — content is AI-curated, not human-authored, so this
              says so plainly rather than implying a byline that doesn't exist. */}
          {article.sourceName && (
            <p className="flex items-center gap-1.5 text-[11px] mt-3" style={{ color: MUTED }}>
              <BadgeCheck className="h-3.5 w-3.5" style={{ color: accentColor }} />
              AI-curated from {article.sourceName}{dateStr ? `, verified ${dateStr}` : ''}
            </p>
          )}
        </div>
      </section>

      {/* ── Document body ── */}
      <section style={{ background: '#FFFFFF' }}>
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid lg:grid-cols-[1fr_240px] gap-12 items-start">

            {/* ── Main article ── */}
            <article className="ca-article space-y-10">

              {/* Mobile table of contents — the sidebar version is desktop-only */}
              {tocItems.length > 1 && (
                <details className="lg:hidden rounded-xl" style={{ border: BORDER_D }}>
                  <summary
                    className="flex items-center gap-2 px-4 py-3 text-sm font-bold cursor-pointer select-none"
                    style={{ color: INK }}
                  >
                    <List className="h-4 w-4" style={{ color: accentColor }} />
                    On this page
                  </summary>
                  <div className="px-4 pb-4">
                    <TableOfContents items={tocItems} accentColor={accentColor} />
                  </div>
                </details>
              )}

              {/* 1 — Why in News */}
              <section id="why-in-news" className="space-y-3.5 scroll-mt-24">
                <SectionHeading color={accentColor}>Why in News?</SectionHeading>
                {whyInNews.includes('<') ? (
                  <div
                    className="rich-editor-content first-letter:float-left first-letter:mr-2.5 first-letter:mt-1 first-letter:text-6xl first-letter:font-semibold first-letter:leading-[0.8] first-letter:font-serif-display first-letter:text-[#8A6A12]"
                    style={{ fontSize: '1.0625rem', lineHeight: 1.75, color: TEXT_BODY, fontWeight: 450, maxWidth: 640 }}
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(whyInNews) }}
                  />
                ) : (
                  <p
                    className="first-letter:float-left first-letter:mr-2.5 first-letter:mt-1 first-letter:text-6xl first-letter:font-semibold first-letter:leading-[0.8] first-letter:font-serif-display first-letter:text-[#8A6A12]"
                    style={{ fontSize: '1.0625rem', lineHeight: 1.75, color: TEXT_BODY, fontWeight: 450, maxWidth: 640 }}
                  >
                    {whyInNews}
                  </p>
                )}
              </section>

              {/* 2 — Prelims Quick Facts table */}
              {(ed?.prelimsFacts?.length ?? 0) > 0 && (
                <section id="prelims-quick-facts" className="space-y-3.5 scroll-mt-24">
                  <SectionHeading color={accentColor}>Prelims Quick Facts</SectionHeading>
                  <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${accentColor}20` }}>
                    {(() => {
                      // Merge consecutive rows that share the same label into one rowSpan group
                      const groups: { label: string; values: string[] }[] = [];
                      for (const f of ed!.prelimsFacts!) {
                        const last = groups[groups.length - 1];
                        if (last && last.label === f.label) last.values.push(f.value);
                        else groups.push({ label: f.label, values: [f.value] });
                      }
                      return (
                        <table className="w-full border-collapse">
                          <tbody>
                            {groups.flatMap((g, gi) =>
                              g.values.map((val, vi) => {
                                const isLast = gi === groups.length - 1 && vi === g.values.length - 1;
                                const rowBorder = isLast ? 'none' : `1px solid ${accentColor}15`;
                                const labelBg = gi % 2 === 0 ? `${accentColor}07` : `${accentColor}03`;
                                const valBg   = gi % 2 === 0 ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.5)';
                                return (
                                  <tr key={`${gi}-${vi}`}>
                                    {vi === 0 && (
                                      <td
                                        rowSpan={g.values.length}
                                        className="w-5/12 px-4 py-3 text-[11.5px] font-medium align-middle"
                                        style={{
                                          background: labelBg,
                                          color: TEXT_MUTED,
                                          borderRight: `1px solid ${accentColor}15`,
                                          borderBottom: gi < groups.length - 1 ? `1px solid ${accentColor}15` : 'none',
                                        }}
                                      >
                                        <span>{g.label}</span>
                                        {g.values.length > 1 && (
                                          <span
                                            className="ml-1.5 inline-flex items-center justify-center text-[10px] font-extrabold px-1.5 py-0.5 rounded-full"
                                            style={{ background: `${accentColor}18`, color: accentColor }}
                                          >
                                            {g.values.length}
                                          </span>
                                        )}
                                      </td>
                                    )}
                                    <td
                                      className="px-4 py-2.5 text-[12px] font-bold"
                                      style={{ background: valBg, color: '#111827', borderBottom: rowBorder }}
                                    >
                                      <span className="flex items-center justify-between gap-2">
                                        <span>{val}</span>
                                        <SaveNoteButton
                                          articleId={article.id}
                                          articleTitle={article.title}
                                          noteText={`${g.label}: ${val}`}
                                          sourceSection="PRELIMS_FACT"
                                        />
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      );
                    })()}
                  </div>
                </section>
              )}

              {/* 3 — Key Points */}
              {article.keyFacts.length > 0 && (
                <section id="key-points" className="space-y-3.5 scroll-mt-24">
                  <SectionHeading color={accentColor}>Key Points</SectionHeading>

                  {/* Pull-quote: the single highest-signal fact, called out */}
                  <div
                    className="relative flex items-start justify-between gap-3 rounded-r-lg py-3"
                    style={{ borderLeft: `3px solid ${accentColor}`, paddingLeft: '1.75rem', maxWidth: 640, background: `${accentColor}05` }}
                  >
                    <span
                      className="absolute select-none pointer-events-none"
                      style={{ ...SERIF, left: '0.6rem', top: '-0.5rem', fontSize: '2.75rem', color: accentColor, opacity: 0.25, lineHeight: 1 }}
                      aria-hidden="true"
                    >
                      &ldquo;
                    </span>
                    {article.keyFacts[0].includes('<') ? (
                      <div
                        className="rich-editor-content"
                        style={{ ...SERIF, fontStyle: 'italic', fontSize: '1.15rem', lineHeight: 1.55, color: INK }}
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(article.keyFacts[0]) }}
                      />
                    ) : (
                      <p style={{ ...SERIF, fontStyle: 'italic', fontSize: '1.15rem', lineHeight: 1.55, color: INK }}>
                        <RenderFact fact={article.keyFacts[0]} color={accentColor} />
                      </p>
                    )}
                    <SaveNoteButton
                      articleId={article.id}
                      articleTitle={article.title}
                      noteText={stripHtml(article.keyFacts[0])}
                      sourceSection="KEY_POINT"
                      className="mt-1 shrink-0"
                    />
                  </div>

                  {article.keyFacts.length > 1 && (
                    <ul className="space-y-3.5" style={{ listStyle: 'none', padding: 0, margin: 0, maxWidth: 640 }}>
                      {article.keyFacts.slice(1).map((fact, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span
                            className="rounded-full shrink-0"
                            style={{
                              width: 6, height: 6, marginTop: '0.55rem',
                              background: accentColor, opacity: 0.65, flexShrink: 0,
                            }}
                          />
                          <span className="flex-1 flex items-start justify-between gap-2">
                            {fact.includes('<') ? (
                              <span
                                className="rich-editor-content"
                                style={{ fontSize: '1rem', lineHeight: 1.75, color: TEXT_BODY }}
                                dangerouslySetInnerHTML={{ __html: sanitizeHtml(fact) }}
                              />
                            ) : (
                              <span style={{ fontSize: '1rem', lineHeight: 1.75, color: TEXT_BODY }}>
                                <RenderFact fact={fact} color={accentColor} />
                              </span>
                            )}
                            <SaveNoteButton
                              articleId={article.id}
                              articleTitle={article.title}
                              noteText={stripHtml(fact)}
                              sourceSection="KEY_POINT"
                              className="mt-0.5"
                            />
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              )}

              {/* 4 — Key Features */}
              {(ed?.keyFeatures?.length ?? 0) > 0 && ed!.keyFeatures!.map((feature, i) => (
                <section key={i} id={i === 0 ? 'key-features' : undefined} className="space-y-3.5 scroll-mt-24">
                  <SectionHeading color={accentColor}>{feature.heading}</SectionHeading>
                  <div
                    className="rounded-xl px-5 py-4"
                    style={{ background: `${accentColor}06`, border: `1px solid ${accentColor}14` }}
                  >
                    {feature.content.includes('<') ? (
                      <div
                        className="rich-editor-content"
                        style={{ fontSize: '1rem', lineHeight: 1.78, color: TEXT_BODY, maxWidth: 640 }}
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(feature.content) }}
                      />
                    ) : (
                      <p style={{ fontSize: '1rem', lineHeight: 1.78, color: TEXT_BODY, maxWidth: 640 }}>
                        {feature.content}
                      </p>
                    )}
                  </div>
                </section>
              ))}

              {/* 5 — Key Terms */}
              {(ed?.keyTerms?.length ?? 0) > 0 && (
                <section id="key-terms" className="space-y-3.5 scroll-mt-24">
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
                        <span className="flex-1 flex items-start justify-between gap-2">
                          <span className="text-sm leading-relaxed" style={{ color: TEXT_BODY }}>
                            {t.definition}
                          </span>
                          <SaveNoteButton
                            articleId={article.id}
                            articleTitle={article.title}
                            noteText={`${t.term}: ${t.definition}`}
                            sourceSection="KEY_TERM"
                          />
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* 6 — Mains Angles */}
              {mainsAngles.length > 0 && (
                <section id="mains-angles" className="space-y-3.5 scroll-mt-24">
                  <SectionHeading color={accentColor}>Mains Angles</SectionHeading>
                  <ol className="space-y-2.5" style={{ listStyle: 'none', padding: 0, margin: 0, maxWidth: 640 }}>
                    {mainsAngles.map((angle, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span
                          className="h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-extrabold shrink-0"
                          style={{ background: `${accentColor}12`, color: accentColor, marginTop: 2 }}
                        >
                          {i + 1}
                        </span>
                        <span className="flex-1 flex items-start justify-between gap-2">
                          <span style={{ fontSize: '0.975rem', lineHeight: 1.75, color: TEXT_BODY }}>{angle}</span>
                          <SaveNoteButton
                            articleId={article.id}
                            articleTitle={article.title}
                            noteText={angle}
                            sourceSection="MAINS_ANGLE"
                          />
                        </span>
                      </li>
                    ))}
                  </ol>
                </section>
              )}

              {/* 7 — Way Forward */}
              {(ed?.wayForward?.length ?? 0) > 0 && (
                <section id="way-forward" className="space-y-3.5 scroll-mt-24">
                  <SectionHeading color={accentColor}>Way Forward</SectionHeading>
                  <ul className="space-y-2.5" style={{ listStyle: 'none', padding: 0, margin: 0, maxWidth: 640 }}>
                    {ed!.wayForward!.map((point, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span
                          className="text-sm font-bold shrink-0"
                          style={{ color: accentColor, marginTop: 1 }}
                        >
                          →
                        </span>
                        <span className="flex-1 flex items-start justify-between gap-2">
                          <span style={{ fontSize: '0.975rem', lineHeight: 1.75, color: TEXT_BODY }}>{point}</span>
                          <SaveNoteButton
                            articleId={article.id}
                            articleTitle={article.title}
                            noteText={point}
                            sourceSection="WAY_FORWARD"
                          />
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* 8 — Constitutional Provisions */}
              {(ed?.constitutionalProvisions?.length ?? 0) > 0 && (
                <section id="constitutional-provisions" className="space-y-3.5 scroll-mt-24">
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
                  id="practice-mcq"
                  className="rounded-2xl p-6 space-y-5 scroll-mt-24"
                  style={{ background: '#FFFFFF', border: `1px solid ${accentColor}18` }}
                >
                  <MCQSection questions={article.practiceQuestions!} accentColor={accentColor} />
                </div>
              )}

              {/* 10 — Asked in Previous Years (disabled) */}
              {false && (relatedPYQs?.length ?? 0) > 0 && (
                <section className="space-y-3.5">
                  <SectionHeading color={accentColor}>Asked in Previous Years</SectionHeading>
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
                          style={{ background: `${accentColor}08`, color: MUTED, border: `1px solid ${accentColor}18` }}
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
                  style={{ background: 'rgba(138,106,18,0.05)', border: '1px solid rgba(138,106,18,0.15)' }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold" style={{ color: INK }}>
                      Want the full UPSC breakdown?
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: MUTED }}>
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

              {/* Related articles — client-side tag-overlap heuristic, no dedicated backend endpoint yet */}
              {relatedArticles.length > 0 && (
                <section className="space-y-3.5 pt-2">
                  <SectionHeading color={accentColor}>More on this topic</SectionHeading>
                  <div className="grid sm:grid-cols-2 gap-3.5">
                    {relatedArticles.map((related) => {
                      const relGsCfg = GS_CONFIG[related.gsPaperTags[0]];
                      return (
                        <Link
                          key={related.id}
                          href={`/current-affairs/${related.id}`}
                          className="group rounded-xl bg-white p-4 transition-all hover:-translate-y-0.5"
                          style={{ border: BORDER_D, boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}
                        >
                          {relGsCfg && (
                            <span
                              className="inline-flex text-[10px] font-extrabold px-2 py-0.5 rounded-full mb-2"
                              style={{ background: relGsCfg.bg, color: relGsCfg.color }}
                            >
                              {related.gsPaperTags[0]}
                            </span>
                          )}
                          <p
                            className="text-sm font-bold leading-snug line-clamp-2 group-hover:underline"
                            style={{ color: INK }}
                          >
                            {related.title}
                          </p>
                          {related.sourceName && (
                            <p className="text-[11px] mt-1.5" style={{ color: MUTED }}>{related.sourceName}</p>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Navigation */}
              <div
                className="flex items-center justify-between pt-2"
                style={{ borderTop: `1px solid ${accentColor}15` }}
              >
                <Link
                  href="/current-affairs"
                  className="inline-flex items-center gap-2 text-sm font-semibold rounded-xl px-5 py-2.5 transition-all hover:shadow-sm"
                  style={{ border: '1px solid rgba(138,106,18,0.2)', color: ACCENT, background: 'rgba(138,106,18,0.04)' }}
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

            {/* ── Sidebar ──
                The whole column sticks together as one unit (not just the TOC card) —
                sticking only the TOC while its sibling cards stay in normal flow means
                those siblings scroll up and visually slide underneath the frozen TOC as
                the page scrolls, since a sticky element still reserves its natural-flow
                space for layout purposes even while pinned on screen. Scrolls internally
                if the combined cards are taller than the viewport. */}
            <aside className="ca-sidebar space-y-4 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">

              {/* Table of contents — desktop only, hidden if there's nothing worth jumping to */}
              {tocItems.length > 1 && (
                <div
                  className="hidden lg:block rounded-2xl p-4"
                  style={{ background: '#FFFFFF', border: BORDER_D }}
                >
                  <p
                    className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest mb-2.5"
                    style={{ color: MUTED }}
                  >
                    <List className="h-3 w-3" />
                    On this page
                  </p>
                  <TableOfContents items={tocItems} accentColor={accentColor} />
                </div>
              )}

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
                      <p className="text-sm font-bold" style={{ color: INK }}>{gsCfg.desc}</p>
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
                    <p className="text-[11px] leading-relaxed" style={{ color: MUTED }}>
                      {ed?.syllabusDetail || gsCfg.syllabus}
                    </p>
                  </div>
                </div>
              )}

              {/* Article Info */}
              <div
                className="rounded-2xl p-4 space-y-3"
                style={{ background: '#FFFFFF', border: BORDER_D }}
              >
                <p className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: MUTED }}>
                  Article Info
                </p>
                <div className="space-y-2.5 text-xs">
                  {article.keyFacts.length > 0 && (
                    <div className="flex items-center justify-between">
                      <span style={{ color: TEXT_MUTED }}>Key points</span>
                      <span className="font-bold" style={{ color: INK }}>{article.keyFacts.length}</span>
                    </div>
                  )}
                  {(ed?.prelimsFacts?.length ?? 0) > 0 && (
                    <div className="flex items-center justify-between">
                      <span style={{ color: TEXT_MUTED }}>Prelims facts</span>
                      <span className="font-bold" style={{ color: INK }}>{ed!.prelimsFacts!.length}</span>
                    </div>
                  )}
                  {(ed?.keyTerms?.length ?? 0) > 0 && (
                    <div className="flex items-center justify-between">
                      <span style={{ color: TEXT_MUTED }}>Key terms</span>
                      <span className="font-bold" style={{ color: INK }}>{ed!.keyTerms!.length}</span>
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
                    <span className="font-bold" style={{ color: INK }}>{readMins} min</span>
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
                        <span className="font-semibold truncate max-w-28 text-right" style={{ color: INK }}>
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
                  style={{ background: '#FFFFFF', border: BORDER_D }}
                >
                  <p className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: MUTED }}>
                    Exam Relevance
                  </p>
                  {relevantExams.map((key) => {
                    const { label, color } = resolveExamLabel(key);
                    return (
                      <div key={key} className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" style={{ color }} />
                        <span className="text-xs font-semibold" style={{ color: INK }}>{label}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* CTA — one flat accent panel; brief vs full distinguished by copy, not color */}
              <div
                className="rounded-2xl p-5 relative overflow-hidden"
                style={{ background: ACCENT }}
              >
                <div className="relative">
                  {isBriefView ? (
                    <>
                      <p className="text-white font-bold text-sm mb-1">Practice with MCQs</p>
                      <p className="text-xs mb-4 leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)' }}>
                        Reinforce these facts with AI-generated MCQs &amp; daily challenges for {userExam ? TARGET_EXAM_LABELS[userExam] : 'your exam'}.
                      </p>
                      <Link
                        href="/signup"
                        className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl hover:opacity-90 transition-opacity"
                        style={{ background: '#FFFFFF', color: ACCENT }}
                      >
                        Start Free<ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </>
                  ) : (
                    <>
                      <p className="text-white font-bold text-sm mb-1">Go deeper with AI</p>
                      <p className="text-xs mb-4 leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)' }}>
                        Ask Remi about this topic — get examples, case studies &amp; model answers.
                      </p>
                      <Link
                        href="/signup"
                        className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl hover:opacity-90 transition-opacity"
                        style={{ background: '#FFFFFF', color: ACCENT }}
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
