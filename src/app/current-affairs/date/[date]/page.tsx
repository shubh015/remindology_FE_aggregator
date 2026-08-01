'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { currentAffairsService } from '@/services/current-affairs.service';
import { useAuthStore } from '@/store/use-auth-store';
import type { CurrentAffairsArticle } from '@/types/features';
import {
  ArrowLeft, ExternalLink, BookOpen, ArrowRight,
  AlertCircle, Sparkles, BookMarked, Zap,
} from 'lucide-react';

// ── Design tokens ──────────────────────────────────────────────────

const MIDNIGHT   = '#09091F';
const BRAND_GRAD = 'linear-gradient(135deg, #7C3AED, #C026D3)';

const GS_CONFIG: Record<string, { color: string; bg: string; border: string; desc: string }> = {
  GS1: { color: '#7C3AED', bg: 'rgba(124,58,237,0.08)', border: 'rgba(124,58,237,0.2)', desc: 'Indian Heritage & Society' },
  GS2: { color: '#0891B2', bg: 'rgba(8,145,178,0.08)',  border: 'rgba(8,145,178,0.2)',  desc: 'Polity & International' },
  GS3: { color: '#059669', bg: 'rgba(5,150,105,0.08)',  border: 'rgba(5,150,105,0.2)',  desc: 'Economy & Environment' },
  GS4: { color: '#DC2626', bg: 'rgba(220,38,38,0.08)',  border: 'rgba(220,38,38,0.2)',  desc: 'Ethics & Integrity' },
};

// ── Inline bold renderer ──────────────────────────────────────────

function RenderFact({ fact, color }: { fact: string; color: string }) {
  const nl    = fact.indexOf('\n');
  const first = nl === -1 ? fact : fact.slice(0, nl);
  const match = first.match(/^([A-Za-z][^:]{1,55}):\s*(.+)/);
  if (match) {
    return (
      <>
        <strong style={{ fontWeight: 700, color }}>{match[1]}:</strong>{' '}{match[2]}
      </>
    );
  }
  return <>{fact}</>;
}

// ── Single article section (digest card) ─────────────────────────

function ArticleSection({ article, index }: { article: CurrentAffairsArticle; index: number }) {
  const primaryGS   = article.gsPaperTags[0];
  const gsCfg       = primaryGS ? GS_CONFIG[primaryGS] : null;
  const accentColor = gsCfg?.color ?? '#7C3AED';
  const accentBg    = gsCfg?.bg    ?? 'rgba(124,58,237,0.08)';

  const ed = article.enrichedData;
  const whyInNews = ed?.whyInNews || article.summary;
  const previewFacts = article.keyFacts.slice(0, 4);
  const previewPrelims = ed?.prelimsFacts?.slice(0, 4) ?? [];
  const totalFacts = article.keyFacts.length + (ed?.prelimsFacts?.length ?? 0);
  const hasMCQ = (article.practiceQuestions?.length ?? 0) > 0;

  return (
    <article
      className="rounded-2xl bg-white overflow-hidden"
      style={{
        border: `1px solid ${accentColor}18`,
        boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
        animationDelay: `${index * 0.06}s`,
      }}
    >
      {/* Color bar */}
      <div className="h-0.75" style={{ background: accentColor }} />

      <div className="p-6 space-y-5">

        {/* Title row */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0 space-y-2">
            {/* GS chips */}
            <div className="flex flex-wrap gap-1.5">
              {article.gsPaperTags.map((tag) => {
                const cfg = GS_CONFIG[tag];
                return cfg ? (
                  <span
                    key={tag}
                    className="text-[10px] font-extrabold px-2 py-0.5 rounded-full"
                    style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
                  >
                    {tag} · {cfg.desc}
                  </span>
                ) : null;
              })}
            </div>
            <h2
              className="font-bold leading-snug"
              style={{ fontSize: '1.05rem', color: '#111827' }}
            >
              {article.title}
            </h2>
            {article.sourceName && (
              <div className="flex items-center gap-2 text-[11px]" style={{ color: '#9CA3AF' }}>
                <span>{article.sourceName}</span>
                {article.sourceUrl && (
                  <a
                    href={article.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-0.5 hover:underline"
                    style={{ color: accentColor }}
                  >
                    <ExternalLink className="h-2.5 w-2.5" />Source
                  </a>
                )}
              </div>
            )}
          </div>
          {/* Serial number */}
          <span
            className="h-8 w-8 rounded-xl flex items-center justify-center text-sm font-extrabold shrink-0"
            style={{ background: accentBg, color: accentColor }}
          >
            {index + 1}
          </span>
        </div>

        {/* Why in news */}
        {whyInNews && (
          <div>
            <p
              className="text-[10px] font-extrabold uppercase tracking-widest mb-1.5"
              style={{ color: accentColor, opacity: 0.7 }}
            >
              Why in News
            </p>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.85, color: '#374151' }}>
              {whyInNews}
            </p>
          </div>
        )}

        {/* Prelims quick facts table */}
        {previewPrelims.length > 0 && (
          <div>
            <p
              className="text-[10px] font-extrabold uppercase tracking-widest mb-2"
              style={{ color: accentColor, opacity: 0.7 }}
            >
              Prelims Quick Facts
            </p>
            <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${accentColor}18` }}>
              {previewPrelims.map((f, i) => (
                <div
                  key={i}
                  className="flex"
                  style={{ borderBottom: i < previewPrelims.length - 1 ? `1px solid ${accentColor}12` : 'none' }}
                >
                  <div
                    className="w-5/12 px-3 py-2 text-[11px] font-medium flex items-center"
                    style={{ background: i % 2 === 0 ? `${accentColor}06` : 'transparent', color: '#6B7280', borderRight: `1px solid ${accentColor}12` }}
                  >
                    {f.label}
                  </div>
                  <div className="flex-1 px-3 py-2 text-[12px] font-bold flex items-center" style={{ color: '#111827' }}>
                    {f.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Key points */}
        {previewFacts.length > 0 && (
          <div>
            <p
              className="text-[10px] font-extrabold uppercase tracking-widest mb-2"
              style={{ color: accentColor, opacity: 0.7 }}
            >
              Key Points
            </p>
            <ul className="space-y-2" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {previewFacts.map((fact, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span
                    className="rounded-full shrink-0 mt-1.25"
                    style={{ width: 5, height: 5, background: accentColor, opacity: 0.6, flexShrink: 0 }}
                  />
                  <span style={{ fontSize: '0.875rem', lineHeight: 1.8, color: '#374151' }}>
                    <RenderFact fact={fact} color={accentColor} />
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Footer row: topics + stats */}
        <div
          className="flex flex-wrap items-center justify-between gap-2 pt-3"
          style={{ borderTop: `1px solid ${accentColor}15` }}
        >
          <div className="flex flex-wrap gap-1.5">
            {article.topicTags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                style={{ background: accentBg, color: '#4B5563', border: `1px solid ${accentColor}18` }}
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-3">
            {totalFacts > 0 && (
              <span className="flex items-center gap-1 text-[11px]" style={{ color: '#9CA3AF' }}>
                <BookOpen className="h-3 w-3" style={{ color: accentColor }} />
                {totalFacts} facts
              </span>
            )}
            {hasMCQ && (
              <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md"
                style={{ background: accentBg, color: accentColor }}>
                <Zap className="h-2.5 w-2.5" />MCQ
              </span>
            )}
          </div>
        </div>

        {/* ── Animated Deep Dive CTA ── */}
        <Link
          href={`/current-affairs/${article.id}`}
          className="dd-cta group relative block overflow-hidden rounded-2xl"
          style={{
            background: `linear-gradient(135deg, ${accentColor} 0%, #C026D3 100%)`,
            '--accent': accentColor,
          } as React.CSSProperties}
        >
          {/* Shimmer sweep */}
          <div className="dd-shimmer" />

          {/* Glow behind */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{ background: `radial-gradient(ellipse at 50% 120%, ${accentColor}55, transparent 70%)` }}
          />

          <div className="relative flex items-center justify-between px-5 py-4">
            {/* Left: label + subtitle */}
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-white/80 dd-sparkle" />
                <span className="text-white font-extrabold text-sm tracking-wide">
                  Deep Dive
                </span>
              </div>
              <p className="text-white/65 text-[11px] font-medium pl-5.5">
                {[
                  'Historical Background',
                  hasMCQ && 'MCQ Practice',
                  (ed?.keyTerms?.length ?? 0) > 0 && 'Key Terms',
                  (ed?.wayForward?.length ?? 0) > 0 && 'Way Forward',
                ].filter(Boolean).slice(0, 3).join(' · ')}
                {(!ed?.historicalBackground && !hasMCQ && !ed?.keyTerms?.length) && 'Key Terms · Mains Angles · Way Forward'}
              </p>
            </div>

            {/* Right: pill + arrow */}
            <div className="flex items-center gap-3 shrink-0">
              <div
                className="hidden sm:flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full"
                style={{ background: 'rgba(255,255,255,0.15)', color: '#FFFFFF' }}
              >
                <BookMarked className="h-3 w-3" />
                Full Analysis
              </div>
              <div
                className="h-8 w-8 rounded-full flex items-center justify-center dd-arrow"
                style={{ background: 'rgba(255,255,255,0.2)' }}
              >
                <ArrowRight className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>
        </Link>
      </div>
    </article>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────

function DigestSkeleton() {
  return (
    <>
      <section style={{ background: MIDNIGHT }}>
        <div className="max-w-6xl mx-auto px-6 pt-10 pb-14 space-y-4 animate-pulse">
          <div className="h-3 w-40 rounded bg-white/10" />
          <div className="h-10 w-64 rounded bg-white/10" />
          <div className="flex gap-2 mt-2">
            <div className="h-5 w-16 rounded-full bg-white/10" />
            <div className="h-5 w-16 rounded-full bg-white/10" />
          </div>
        </div>
      </section>
      <section style={{ background: '#FFFFFF' }}>
        <div className="max-w-6xl mx-auto px-6 py-10 space-y-5 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl bg-white p-6 space-y-3" style={{ border: '1px solid rgba(124,58,237,0.1)' }}>
              <div className="flex gap-2">
                <Skeleton className="h-5 w-24 rounded-full" />
              </div>
              <Skeleton className="h-6 w-full rounded" />
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-4/5 rounded" />
              <Skeleton className="h-4 w-3/4 rounded" />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

// ── Main page ─────────────────────────────────────────────────────

export default function DailyDigestPage() {
  const { date } = useParams<{ date: string }>();
  const userExam = useAuthStore((s) => s.user?.target_exam);

  const { data: articles, isLoading, isError } = useQuery({
    queryKey: ['current-affairs', 'date', date, userExam ?? null],
    queryFn: () => currentAffairsService.getByDate(date, userExam),
    staleTime: 60 * 60 * 1000,
    retry: false,
    enabled: !!date,
  });

  // Format the date param for display
  const displayDate = (() => {
    const d = new Date(`${date}T00:00:00`);
    if (isNaN(d.getTime())) return date;
    return {
      dayOfWeek: d.toLocaleDateString('en-IN', { weekday: 'long' }),
      full:      d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
    };
  })();

  const allGS = Array.from(new Set((articles ?? []).flatMap((a) => a.gsPaperTags))).sort();
  const totalFacts = (articles ?? []).reduce(
    (acc, a) => acc + a.keyFacts.length + (a.enrichedData?.prelimsFacts?.length ?? 0), 0,
  );

  if (isLoading) return <DigestSkeleton />;

  if (isError || !articles) {
    return (
      <section style={{ background: '#FFFFFF', minHeight: '60vh' }}>
        <div className="max-w-6xl mx-auto px-6 py-20 flex flex-col items-center gap-4 text-center">
          <AlertCircle className="h-12 w-12" style={{ color: '#DC2626', opacity: 0.5 }} />
          <p className="text-lg font-semibold" style={{ color: '#1A1836' }}>No articles found for this date</p>
          <Link
            href="/current-affairs"
            className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl text-white"
            style={{ background: BRAND_GRAD }}
          >
            <ArrowLeft className="h-4 w-4" />Back to Current Affairs
          </Link>
        </div>
      </section>
    );
  }

  return (
    <div style={{ fontFamily: 'var(--font-poppins), system-ui, sans-serif' }}>

      <style>{`
        @keyframes digest-in {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .digest-article {
          animation: digest-in 0.4s ease both;
        }

        /* Deep Dive CTA animations */
        @keyframes dd-sweep {
          0%   { transform: translateX(-120%) skewX(-18deg); opacity: 0; }
          15%  { opacity: 1; }
          85%  { opacity: 1; }
          100% { transform: translateX(420%) skewX(-18deg); opacity: 0; }
        }
        @keyframes dd-pulse-glow {
          0%, 100% { box-shadow: 0 4px 24px rgba(124,58,237,0.25); }
          50%       { box-shadow: 0 8px 40px rgba(192,38,211,0.45); }
        }
        @keyframes dd-sparkle-spin {
          0%   { transform: rotate(0deg) scale(1); }
          50%  { transform: rotate(20deg) scale(1.2); }
          100% { transform: rotate(0deg) scale(1); }
        }
        @keyframes dd-arrow-bounce {
          0%, 100% { transform: translateX(0); }
          50%       { transform: translateX(4px); }
        }

        .dd-cta {
          animation: dd-pulse-glow 3s ease-in-out infinite;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .dd-cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 48px rgba(124,58,237,0.4) !important;
          animation: none;
        }

        .dd-shimmer {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255,255,255,0.22) 50%,
            transparent 100%
          );
          pointer-events: none;
          animation: dd-sweep 3s ease-in-out infinite;
        }
        .dd-cta:hover .dd-shimmer {
          animation: dd-sweep 1s ease-in-out infinite;
        }

        .dd-sparkle {
          animation: dd-sparkle-spin 3s ease-in-out infinite;
        }
        .dd-arrow {
          animation: dd-arrow-bounce 1.8s ease-in-out infinite;
          transition: background 0.2s ease;
        }
        .dd-cta:hover .dd-arrow {
          background: rgba(255,255,255,0.35) !important;
          animation: none;
          transform: translateX(4px);
        }
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
            top: 0, right: '-8%', width: 400, height: 400, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 68%)',
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
            <span style={{ color: 'rgba(196,181,253,0.75)' }}>Daily Digest</span>
          </div>

          {/* Label */}
          <div
            className="inline-flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full mb-4"
            style={{ background: 'rgba(124,58,237,0.18)', border: '1px solid rgba(124,58,237,0.35)', color: '#C4B5FD' }}
          >
            Daily Current Affairs
          </div>

          {/* Date heading */}
          {typeof displayDate === 'object' ? (
            <>
              <p className="text-sm font-semibold mb-1" style={{ color: 'rgba(196,181,253,0.5)' }}>
                {displayDate.dayOfWeek}
              </p>
              <h1
                className="font-extrabold tracking-tight mb-5"
                style={{ fontSize: 'clamp(1.8rem, 4vw, 2.75rem)', lineHeight: 1.1, color: '#F0EEFF' }}
              >
                {displayDate.full}
              </h1>
            </>
          ) : (
            <h1
              className="font-extrabold tracking-tight mb-5"
              style={{ fontSize: 'clamp(1.8rem, 4vw, 2.75rem)', lineHeight: 1.1, color: '#F0EEFF' }}
            >
              {displayDate}
            </h1>
          )}

          {/* Stats row */}
          <div className="flex flex-wrap items-center gap-5">
            <div>
              <span className="font-extrabold text-white text-lg">{articles.length}</span>
              <span className="text-[11px] ml-1.5" style={{ color: 'rgba(196,181,253,0.5)' }}>
                {articles.length === 1 ? 'Article' : 'Articles'}
              </span>
            </div>
            {totalFacts > 0 && (
              <div>
                <span className="font-extrabold text-white text-lg">{totalFacts}</span>
                <span className="text-[11px] ml-1.5" style={{ color: 'rgba(196,181,253,0.5)' }}>Facts</span>
              </div>
            )}
            {/* GS chips */}
            <div className="flex flex-wrap gap-1.5">
              {allGS.map((tag) => {
                const cfg = GS_CONFIG[tag];
                return cfg ? (
                  <span
                    key={tag}
                    className="text-[10px] font-extrabold px-2.5 py-1 rounded-full"
                    style={{ background: `${cfg.color}22`, color: cfg.color, border: `1px solid ${cfg.color}44` }}
                  >
                    {tag}
                  </span>
                ) : null;
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── Articles ── */}
      <section style={{ background: '#FFFFFF' }}>
        <div className="max-w-6xl mx-auto px-6 py-10 space-y-6">
          {articles.map((article, i) => (
            <div key={article.id} className="digest-article" style={{ animationDelay: `${i * 0.07}s` }}>
              <ArticleSection article={article} index={i} />
            </div>
          ))}

          {/* Back + navigation */}
          <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid rgba(124,58,237,0.1)' }}>
            <Link
              href="/current-affairs"
              className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl transition-all hover:shadow-sm"
              style={{ border: '1px solid rgba(124,58,237,0.2)', color: '#7C3AED', background: 'rgba(124,58,237,0.04)' }}
            >
              <ArrowLeft className="h-4 w-4" />All Dates
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl text-white hover:opacity-90 transition-opacity"
              style={{ background: BRAND_GRAD }}
            >
              Get Full Access
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
