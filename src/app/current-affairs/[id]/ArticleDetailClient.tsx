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
// Monochrome docs style (impeccable.style/docs): ink on paper, 1px rules,
// mono labels. All GS papers / exams look identical and differ by label only.

const LABEL = 'font-label text-[11px] uppercase tracking-[0.14em] text-ink-muted';
const ALERT = 'text-[oklch(52%_.16_35)]';

const GS_CONFIG: Record<string, { desc: string; syllabus: string }> = {
  GS1: {
    desc: 'Indian Heritage & Society',
    syllabus: 'History · Geography · Art & Culture · Social Issues',
  },
  GS2: {
    desc: 'Polity & International Relations',
    syllabus: 'Constitution · Governance · IR · Social Justice',
  },
  GS3: {
    desc: 'Economy, Environment & Technology',
    syllabus: 'Economy · Technology · Environment · Security',
  },
  GS4: {
    desc: 'Ethics, Integrity & Aptitude',
    syllabus: 'Ethics · Integrity · Emotional Intelligence',
  },
};

const EXAM_MAP: Record<string, { label: string }> = {
  UPSC_Prelims: { label: 'UPSC Prelims' },
  UPSC_Mains:   { label: 'UPSC Mains' },
  State_PSC:    { label: 'State PSC' },
  upsc_prelims: { label: 'UPSC Prelims' },
  upsc_mains:   { label: 'UPSC Mains' },
  state_psc:    { label: 'State PSC' },
};

function resolveExamLabel(key: string) {
  if (EXAM_MAP[key]) return EXAM_MAP[key];
  return { label: key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) };
}

// ── Section heading ────────────────────────────────────────────────

function SectionHeading({ children }: { children: string }) {
  return <h2 className="doc-h2">{children}</h2>;
}

// ── Inline-bold renderer ──────────────────────────────────────────
// "Location: India's first TMZ…" → <strong>Location:</strong> India's first TMZ…

function RenderFact({ fact }: { fact: string }) {
  const nl    = fact.indexOf('\n');
  const first = nl === -1 ? fact : fact.slice(0, nl);
  const match = first.match(/^([A-Za-z][^:]{1,55}):\s*(.+)/);
  if (match) {
    return (
      <>
        <strong className="font-semibold text-ink">{match[1]}:</strong>{' '}
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

function PYQCard({ pyq }: { pyq: RelatedPYQ }) {
  const [expanded, setExpanded] = useState(false);
  const label = formatPYQSource(pyq.source);
  const isLong = pyq.content.length > 200;

  return (
    <div className="ks-card">
      <div className="ks-card-body">
        <div className="ks-card-head">
          <span className="ks-tag">{label}</span>
        </div>
        <p
          className="text-[14px] leading-relaxed text-ink-soft"
          style={!expanded && isLong ? { display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 4, overflow: 'hidden' } : undefined}
        >
          {pyq.content}
        </p>
        {isLong && (
          <button
            onClick={() => setExpanded(v => !v)}
            className="justify-self-start font-label text-[12px] text-ink underline decoration-rule-strong underline-offset-4 cursor-pointer hover:decoration-ink"
          >
            {expanded ? '↑ Show less' : '↓ Read more'}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Interactive MCQ ────────────────────────────────────────────────

function MCQSection({ questions }: { questions: PracticeQuestion[] }) {
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
    <section className="space-y-6">
      <SectionHeading>Practice MCQ</SectionHeading>
      {questions.map((q, qi) => {
        const chosen   = answers[qi];
        const answered = chosen !== null;
        const correct  = q.correct_answer;
        return (
          <div
            key={qi}
            className={cn('space-y-3 pb-6', qi < questions.length - 1 && 'border-b border-rule')}
          >
            <div className="flex items-start gap-2 text-ink">
              <span className="font-label text-[12px] font-medium text-ink-muted shrink-0 mt-0.5">Q{qi + 1}.</span>
              <QuestionText
                text={q.question}
                introClassName="text-[15px] font-semibold leading-relaxed text-ink"
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
                      'w-full flex items-start gap-2 text-left px-4 py-2.5 rounded-[3px] border bg-paper-raised text-[14px] text-ink-soft transition-colors duration-150 ease-ks',
                      !answered && 'border-rule-strong cursor-pointer hover:border-ink',
                      showGreen && 'border-ink text-ink font-medium',
                      showRed   && cn('border-[oklch(52%_.16_35)]', ALERT),
                      dim       && 'border-rule opacity-50',
                    )}
                  >
                    <span className={cn('font-label text-[12px] font-medium shrink-0 mt-px', showRed ? ALERT : showGreen ? 'text-ink' : 'text-ink-muted')}>
                      {String.fromCharCode(65 + oi)}.
                    </span>
                    <span className="flex-1">{opt}</span>
                    {showGreen && <span className="shrink-0 text-ink" aria-hidden="true">✓</span>}
                    {showRed && <span className={cn('shrink-0', ALERT)} aria-hidden="true">✕</span>}
                  </button>
                );
              })}
            </div>
            {answered && (
              <div className="rounded-[2px] border border-rule bg-paper-deep p-3.5">
                {chosen !== correct && (
                  <p className="text-[12px] font-semibold text-ink mb-1.5">
                    ✓ Correct answer: {correct}
                  </p>
                )}
                <ExplanationText
                  text={q.explanation}
                  className="text-[13px] leading-relaxed text-ink-soft"
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
    <div className="ks-container">
      <div className="pt-10 pb-10 space-y-5 border-b border-rule animate-pulse">
        <div className="h-3 w-40 rounded-[2px] bg-paper-gray" />
        <div className="flex gap-2">
          <div className="h-5 w-16 rounded-[2px] bg-paper-gray" />
          <div className="h-5 w-14 rounded-[2px] bg-paper-gray" />
        </div>
        <div className="h-9 w-full max-w-3xl rounded-[2px] bg-paper-gray" />
        <div className="h-9 w-4/5 max-w-2xl rounded-[2px] bg-paper-gray" />
        <div className="h-3 w-48 rounded-[2px] bg-paper-gray" />
      </div>
      <div className="py-12">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_240px] gap-12 animate-pulse">
          <div className="space-y-10 max-w-[68ch]">
            {[1, 2, 3].map((s) => (
              <div key={s} className="space-y-3">
                <Skeleton className="h-5 w-40 rounded-[2px]" />
                {[95, 88, 78, 65].map((w, i) => (
                  <Skeleton key={i} className="h-4 rounded-[2px]" style={{ width: `${w}%` }} />
                ))}
              </div>
            ))}
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-12 rounded-[2px]" />)}
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-36 w-full rounded-[2px]" />
            <Skeleton className="h-28 w-full rounded-[2px]" />
            <Skeleton className="h-20 w-full rounded-[2px]" />
          </div>
        </div>
      </div>
    </div>
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
      <section className="min-h-[60vh]">
        <div className="ks-container py-20 flex flex-col items-center gap-4 text-center">
          <AlertCircle className={cn('h-10 w-10', ALERT)} />
          <p className="doc-h3">Article not found</p>
          <p className="doc-note">
            This article may have been removed or the link is invalid.
          </p>
          <Link href="/current-affairs" className="btn-ink btn-sm mt-2 gap-2">
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
    <div className="font-ui text-ink-soft">

      {/* ── Header ── */}
      <header className="ks-container">
        <div className="pt-10 pb-8 border-b border-rule">

          {/* Breadcrumb */}
          <div className={cn('flex items-center gap-2 mb-8 min-w-0', LABEL)}>
            <Link href="/current-affairs" className="hover:text-ink transition-colors duration-150 flex items-center gap-1.5 shrink-0">
              <ArrowLeft className="h-3.5 w-3.5" />
              Current Affairs
            </Link>
            <span aria-hidden="true">/</span>
            <span className="truncate max-w-xs normal-case tracking-normal font-ui text-[12px] text-ink-muted">
              {article.title.length > 55 ? `${article.title.slice(0, 55)}…` : article.title}
            </span>
          </div>

          {/* Kicker */}
          <p className="eyebrow mb-4 flex-wrap">
            Current Affairs
            {userExam && (
              <>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1.5">
                  {isBriefView ? <Zap className="h-3 w-3" /> : <BookOpen className="h-3 w-3" />}
                  {isBriefView ? 'Quick Facts' : 'Full Analysis'} · {TARGET_EXAM_LABELS[userExam]}
                </span>
              </>
            )}
          </p>

          {/* GS tags — all papers look identical, differ by label only */}
          {article.gsPaperTags.some((tag) => GS_CONFIG[tag]) && (
            <div className="flex flex-wrap gap-2 mb-5">
              {article.gsPaperTags.map((tag) => {
                const cfg = GS_CONFIG[tag];
                return cfg ? (
                  <span key={tag} className="ks-tag">
                    {tag} · {cfg.desc}
                  </span>
                ) : null;
              })}
            </div>
          )}

          <h1 className="doc-title max-w-4xl mb-6">
            {article.title}
          </h1>

          {/* Meta line */}
          <div className={cn('flex flex-wrap items-center gap-x-4 gap-y-2', LABEL)}>
            {article.sourceName && (
              <span className="text-ink">{article.sourceName}</span>
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
                className="inline-flex items-center gap-1 hover:text-ink transition-colors duration-150"
              >
                <ExternalLink className="h-3 w-3" />Source
              </a>
            )}
            <button
              onClick={handleShare}
              className="ml-auto btn-outline btn-sm gap-1.5 font-ui normal-case tracking-normal cursor-pointer"
            >
              <Share2 className="h-3.5 w-3.5" />Share
            </button>
          </div>

          {/* Credibility line — content is AI-curated, not human-authored, so this
              says so plainly rather than implying a byline that doesn't exist. */}
          {article.sourceName && (
            <p className="doc-note flex items-center gap-1.5 text-[12px] mt-3">
              <BadgeCheck className="h-3.5 w-3.5 text-ink-muted" />
              AI-curated from {article.sourceName}{dateStr ? `, verified ${dateStr}` : ''}
            </p>
          )}
        </div>
      </header>

      {/* ── Document body ── */}
      <div className="ks-container py-12">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_240px] gap-12 items-start">

          {/* ── Main article ── */}
          <article className="min-w-0 max-w-[68ch] space-y-12">

            {/* Mobile table of contents — the sidebar version is desktop-only */}
            {tocItems.length > 1 && (
              <details className="lg:hidden rounded-[2px] border border-rule bg-paper-raised">
                <summary className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-ink cursor-pointer select-none">
                  <List className="h-4 w-4 text-ink-muted" />
                  On this page
                </summary>
                <div className="px-4 pb-4">
                  <TableOfContents items={tocItems} />
                </div>
              </details>
            )}

            {/* 1 — Why in News */}
            <section id="why-in-news" className="scroll-mt-24">
              <SectionHeading>Why in News?</SectionHeading>
              {whyInNews.includes('<') ? (
                <div
                  className="rich-editor-content doc-prose"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(whyInNews) }}
                />
              ) : (
                <p className="doc-prose">
                  {whyInNews}
                </p>
              )}
            </section>

            {/* 2 — Prelims Quick Facts table */}
            {(ed?.prelimsFacts?.length ?? 0) > 0 && (
              <section id="prelims-quick-facts" className="scroll-mt-24">
                <SectionHeading>Prelims Quick Facts</SectionHeading>
                <div className="ks-card">
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
                              return (
                                <tr key={`${gi}-${vi}`}>
                                  {vi === 0 && (
                                    <td
                                      rowSpan={g.values.length}
                                      className={cn(
                                        'w-5/12 px-4 py-3 align-middle bg-paper-deep border-r border-rule text-[13px] text-ink-muted',
                                        gi < groups.length - 1 && 'border-b',
                                      )}
                                    >
                                      <span>{g.label}</span>
                                      {g.values.length > 1 && (
                                        <span className="ks-tag ml-1.5 px-1.5 py-0 tracking-normal">
                                          {g.values.length}
                                        </span>
                                      )}
                                    </td>
                                  )}
                                  <td
                                    className={cn(
                                      'px-4 py-2.5 text-[14px] font-medium text-ink',
                                      !isLast && 'border-b border-rule',
                                    )}
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
              <section id="key-points" className="scroll-mt-24 space-y-5">
                <SectionHeading>Key Points</SectionHeading>

                {/* Pull-quote: the single highest-signal fact, called out */}
                <div className="flex items-start justify-between gap-3 border-l-2 border-gold py-1.5 pl-5">
                  {article.keyFacts[0].includes('<') ? (
                    <div
                      className="rich-editor-content doc-prose text-[1.125rem] text-ink"
                      dangerouslySetInnerHTML={{ __html: sanitizeHtml(article.keyFacts[0]) }}
                    />
                  ) : (
                    <p className="doc-prose text-[1.125rem] text-ink">
                      <RenderFact fact={article.keyFacts[0]} />
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
                  <ul className="space-y-3" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {article.keyFacts.slice(1).map((fact, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="h-1.5 w-1.5 rounded-full bg-ink-muted shrink-0 mt-[0.65rem]" />
                        <span className="flex-1 flex items-start justify-between gap-2">
                          {fact.includes('<') ? (
                            <span
                              className="rich-editor-content doc-prose"
                              dangerouslySetInnerHTML={{ __html: sanitizeHtml(fact) }}
                            />
                          ) : (
                            <span className="doc-prose">
                              <RenderFact fact={fact} />
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
              <section key={i} id={i === 0 ? 'key-features' : undefined} className="scroll-mt-24">
                <SectionHeading>{feature.heading}</SectionHeading>
                {feature.content.includes('<') ? (
                  <div
                    className="rich-editor-content doc-prose"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(feature.content) }}
                  />
                ) : (
                  <p className="doc-prose">
                    {feature.content}
                  </p>
                )}
              </section>
            ))}

            {/* 5 — Key Terms */}
            {(ed?.keyTerms?.length ?? 0) > 0 && (
              <section id="key-terms" className="scroll-mt-24">
                <SectionHeading>Key Terms</SectionHeading>
                <div className="ks-card divide-y divide-rule">
                  {ed!.keyTerms!.map((t, i) => (
                    <div
                      key={i}
                      className="flex flex-col sm:flex-row sm:items-start gap-0.5 sm:gap-4 px-4 py-3.5"
                    >
                      <span className="text-[13px] font-semibold leading-snug text-ink shrink-0 sm:w-44 sm:pt-0.5">
                        {t.term}
                      </span>
                      <span className="flex-1 flex items-start justify-between gap-2">
                        <span className="text-[14px] leading-relaxed text-ink-soft">
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
              <section id="mains-angles" className="scroll-mt-24">
                <SectionHeading>Mains Angles</SectionHeading>
                <ol className="space-y-3" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {mainsAngles.map((angle, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="font-label text-[12px] text-ink-muted tabular-nums shrink-0 w-6 mt-[0.2rem]">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="flex-1 flex items-start justify-between gap-2">
                        <span className="doc-prose">{angle}</span>
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
              <section id="way-forward" className="scroll-mt-24">
                <SectionHeading>Way Forward</SectionHeading>
                <ul className="space-y-3" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {ed!.wayForward!.map((point, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="text-sm text-ink-muted shrink-0 mt-px" aria-hidden="true">
                        →
                      </span>
                      <span className="flex-1 flex items-start justify-between gap-2">
                        <span className="doc-prose">{point}</span>
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
              <section id="constitutional-provisions" className="scroll-mt-24">
                <SectionHeading>Constitutional Provisions</SectionHeading>
                <div className="flex flex-wrap gap-2">
                  {ed!.constitutionalProvisions!.map((p, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center rounded-[2px] border border-rule bg-paper-deep px-2.5 py-1 text-[13px] font-medium text-ink"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* 9 — Practice MCQ */}
            {(article.practiceQuestions?.length ?? 0) > 0 && (
              <div id="practice-mcq" className="ks-card p-6 scroll-mt-24">
                <MCQSection questions={article.practiceQuestions!} />
              </div>
            )}

            {/* 10 — Asked in Previous Years (disabled) */}
            {false && (relatedPYQs?.length ?? 0) > 0 && (
              <section>
                <SectionHeading>Asked in Previous Years</SectionHeading>
                <div className="space-y-3">
                  {relatedPYQs!.map((pyq) => (
                    <PYQCard key={pyq.id} pyq={pyq} />
                  ))}
                </div>
              </section>
            )}

            {/* 11 — Topics + Exam footer */}
            {(article.topicTags.length > 0 || relevantExams.length > 0) && (
              <section className="space-y-3 pt-6 border-t border-rule">
                {article.topicTags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={cn('shrink-0 mr-1', LABEL)}>Topics</span>
                    {article.topicTags.map((tag) => (
                      <span key={tag} className="ks-tag ks-tag-outline">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {relevantExams.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={cn('shrink-0 mr-1', LABEL)}>Exams</span>
                    {relevantExams.map((key) => {
                      const { label } = resolveExamLabel(key);
                      return (
                        <span key={key} className="ks-tag">
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
              <div className="ks-card p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink">
                    Want the full UPSC breakdown?
                  </p>
                  <p className="text-[13px] mt-0.5 text-ink-muted">
                    Historical Background, Mains Angles, Way Forward &amp; Constitutional Provisions — available in UPSC / State PSC mode.
                  </p>
                </div>
                <Link href="/profile" className="shrink-0 btn-ink btn-sm gap-1.5">
                  Change Exam<ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}

            {/* Related articles — client-side tag-overlap heuristic, no dedicated backend endpoint yet */}
            {relatedArticles.length > 0 && (
              <section className="pt-2">
                <SectionHeading>More on this topic</SectionHeading>
                <div className="ks-card-grid mt-2">
                  {relatedArticles.map((related) => (
                    <Link
                      key={related.id}
                      href={`/current-affairs/${related.id}`}
                      className="ks-card"
                    >
                      <div className="ks-card-body">
                        {GS_CONFIG[related.gsPaperTags[0]] && (
                          <div className="ks-card-head">
                            <span className="ks-tag">{related.gsPaperTags[0]}</span>
                          </div>
                        )}
                        <p className="ks-card-title line-clamp-2">
                          {related.title}
                        </p>
                        {related.sourceName && (
                          <span className="ks-card-meta">{related.sourceName}</span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-6 border-t border-rule">
              <Link href="/current-affairs" className="btn-outline btn-sm gap-2">
                <ArrowLeft className="h-4 w-4" />All Articles
              </Link>
              <button onClick={handleShare} className="btn-ink btn-sm gap-2 cursor-pointer">
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
          <aside className="space-y-6 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">

            {/* Table of contents — desktop only, hidden if there's nothing worth jumping to */}
            {tocItems.length > 1 && (
              <div className="hidden lg:block">
                <TableOfContents items={tocItems} label="On this page" />
              </div>
            )}

            {/* GS Paper */}
            {gsCfg && (
              <div className="ks-card">
                <div className="ks-card-body">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className={cn('mb-1', LABEL)}>{primaryGS}</p>
                      <p className="ks-card-title text-[14px]">{gsCfg.desc}</p>
                    </div>
                    <span className="ks-tag shrink-0">
                      {isBriefView ? 'GS' : 'UPSC'}
                    </span>
                  </div>
                  <div className="rounded-[2px] bg-paper-deep border border-rule p-3 mt-1">
                    <p className={cn('mb-1', LABEL)}>Syllabus</p>
                    <p className="text-[12px] leading-relaxed text-ink-muted">
                      {ed?.syllabusDetail || gsCfg.syllabus}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Article Info */}
            <div className="ks-card">
              <div className="ks-card-body gap-3">
                <p className={LABEL}>Article Info</p>
                <div className="space-y-2.5 text-[13px]">
                  {article.keyFacts.length > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-ink-muted">Key points</span>
                      <span className="font-semibold tabular-nums text-ink">{article.keyFacts.length}</span>
                    </div>
                  )}
                  {(ed?.prelimsFacts?.length ?? 0) > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-ink-muted">Prelims facts</span>
                      <span className="font-semibold tabular-nums text-ink">{ed!.prelimsFacts!.length}</span>
                    </div>
                  )}
                  {(ed?.keyTerms?.length ?? 0) > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-ink-muted">Key terms</span>
                      <span className="font-semibold tabular-nums text-ink">{ed!.keyTerms!.length}</span>
                    </div>
                  )}
                  {(article.practiceQuestions?.length ?? 0) > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-ink-muted">Practice MCQ</span>
                      <span className="font-semibold tabular-nums text-ink">
                        {article.practiceQuestions!.length} Q
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-ink-muted">Read time</span>
                    <span className="font-semibold tabular-nums text-ink">{readMins} min</span>
                  </div>
                  {article.sourceName && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-ink-muted">Source</span>
                      {article.sourceUrl ? (
                        <a
                          href={article.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ks-link flex items-center gap-1 font-medium truncate max-w-28"
                        >
                          {article.sourceName}
                          <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                        </a>
                      ) : (
                        <span className="font-medium truncate max-w-28 text-right text-ink">
                          {article.sourceName}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Exam relevance */}
            {relevantExams.length > 0 && (
              <div className="ks-card">
                <div className="ks-card-body gap-2.5">
                  <p className={LABEL}>Exam Relevance</p>
                  {relevantExams.map((key) => {
                    const { label } = resolveExamLabel(key);
                    return (
                      <div key={key} className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-ink" />
                        <span className="text-[13px] font-medium text-ink">{label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* CTA — brief vs full distinguished by copy, not color */}
            <div className="ks-card">
              <div className="ks-card-body">
                {isBriefView ? (
                  <>
                    <p className="ks-card-title text-[14px]">Practice with MCQs</p>
                    <p className="ks-card-desc text-[12.5px]">
                      Reinforce these facts with AI-generated MCQs &amp; daily challenges for {userExam ? TARGET_EXAM_LABELS[userExam] : 'your exam'}.
                    </p>
                    <Link href="/signup" className="btn-ink btn-sm gap-1.5 justify-self-start mt-2">
                      Start Free<ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </>
                ) : (
                  <>
                    <p className="ks-card-title text-[14px]">Go deeper with AI</p>
                    <p className="ks-card-desc text-[12.5px]">
                      Ask Remi about this topic — get examples, case studies &amp; model answers.
                    </p>
                    <Link href="/signup" className="btn-ink btn-sm gap-1.5 justify-self-start mt-2">
                      Try for Free<ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
