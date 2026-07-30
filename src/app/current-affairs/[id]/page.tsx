'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { currentAffairsService } from '@/services/current-affairs.service';
import {
  ArrowLeft, ExternalLink, BookOpen, Target,
  Tag, Share2, AlertCircle, ArrowRight,
} from 'lucide-react';

// ── Design tokens (matching landing page) ─────────────────────────

const MIDNIGHT  = '#09091F';
const TEXT_GRAD = {
  background: 'linear-gradient(135deg, #A78BFA, #E879F9)',
  WebkitBackgroundClip: 'text' as const,
  WebkitTextFillColor: 'transparent',
};
const TEXT_GRAD_LT = {
  background: 'linear-gradient(135deg, #7C3AED, #C026D3)',
  WebkitBackgroundClip: 'text' as const,
  WebkitTextFillColor: 'transparent',
};
const BORDER_D = '1px solid rgba(124,58,237,0.2)';
const BRAND_GRAD = 'linear-gradient(135deg, #7C3AED, #C026D3)';

const GS_CONFIG: Record<string, { color: string; bg: string; border: string; desc: string }> = {
  GS1: { color: '#7C3AED', bg: 'rgba(124,58,237,0.1)',  border: 'rgba(124,58,237,0.25)', desc: 'Indian Heritage & Society' },
  GS2: { color: '#0891B2', bg: 'rgba(8,145,178,0.1)',   border: 'rgba(8,145,178,0.25)',  desc: 'Polity & International' },
  GS3: { color: '#059669', bg: 'rgba(5,150,105,0.1)',   border: 'rgba(5,150,105,0.25)',  desc: 'Economy & Environment' },
  GS4: { color: '#DC2626', bg: 'rgba(220,38,38,0.1)',   border: 'rgba(220,38,38,0.25)',  desc: 'Ethics & Integrity' },
};

// ── Loading skeleton ──────────────────────────────────────────────

function DetailSkeleton() {
  return (
    <>
      <section className="relative" style={{ background: MIDNIGHT }}>
        <div className="max-w-4xl mx-auto px-6 pt-10 pb-14 space-y-5 animate-pulse">
          <div className="h-3 w-40 rounded bg-white/10" />
          <div className="flex gap-2">
            <div className="h-6 w-12 rounded-full bg-white/10" />
            <div className="h-6 w-12 rounded-full bg-white/10" />
          </div>
          <div className="h-8 w-full rounded bg-white/10" />
          <div className="h-8 w-4/5 rounded bg-white/10" />
          <div className="h-4 w-48 rounded bg-white/10" />
        </div>
      </section>

      <section style={{ background: '#F5F4FF' }}>
        <div className="max-w-4xl mx-auto px-6 py-12 space-y-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-4 rounded bg-muted" style={{ width: `${90 - i * 5}%` }} />
          ))}
          <div className="h-40 rounded-2xl bg-muted" />
          <div className="h-32 rounded-2xl bg-muted" />
        </div>
      </section>
    </>
  );
}

// ── Main page ─────────────────────────────────────────────────────

export default function ArticleDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: article, isLoading, isError } = useQuery({
    queryKey: ['current-affairs', 'detail', id],
    queryFn: () => currentAffairsService.getById(id),
    staleTime: 60 * 60 * 1000,
    retry: false,
    enabled: !!id,
  });

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: article?.title ?? 'Current Affairs',
        url: window.location.href,
      });
    } else if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (isLoading) return <DetailSkeleton />;

  if (isError || !article) {
    return (
      <section style={{ background: '#F5F4FF', minHeight: '60vh' }}>
        <div className="max-w-4xl mx-auto px-6 py-20 flex flex-col items-center gap-4 text-center">
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

  const primaryGS   = article.gsPaperTags[0];
  const gsCfg       = primaryGS ? GS_CONFIG[primaryGS] : null;
  const accentColor = gsCfg?.color ?? '#7C3AED';

  const dateStr = article.publishedDate
    ? new Date(article.publishedDate).toLocaleDateString('en-IN', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      })
    : '';

  return (
    <div style={{ color: '#1A1836', fontFamily: 'var(--font-poppins), system-ui, sans-serif' }}>

      {/* ── Dark hero header ── */}
      <section className="relative overflow-hidden" style={{ background: MIDNIGHT }}>
        {/* Dot grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(167,139,250,0.07) 1px, transparent 1px)',
            backgroundSize: '30px 30px',
          }}
        />
        {/* Glow */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: 0, right: '-10%',
            width: 440, height: 440,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${accentColor}28 0%, transparent 68%)`,
          }}
        />

        <div className="relative max-w-4xl mx-auto px-6 pt-10 pb-14">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs mb-6" style={{ color: 'rgba(196,181,253,0.5)' }}>
            <Link
              href="/current-affairs"
              className="hover:text-white transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Current Affairs
            </Link>
            <span>/</span>
            <span
              className="truncate max-w-xs"
              style={{ color: 'rgba(196,181,253,0.75)' }}
            >
              {article.title.slice(0, 50)}{article.title.length > 50 ? '…' : ''}
            </span>
          </div>

          {/* GS paper tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {article.gsPaperTags.map((tag) => {
              const cfg = GS_CONFIG[tag];
              return cfg ? (
                <span
                  key={tag}
                  className="text-xs font-bold px-3 py-1 rounded-full"
                  style={{
                    background: `${cfg.color}22`,
                    color: cfg.color,
                    border: `1px solid ${cfg.color}44`,
                  }}
                >
                  {tag} · {cfg.desc}
                </span>
              ) : null;
            })}
          </div>

          {/* Title */}
          <h1
            className="font-extrabold tracking-tight mb-5"
            style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)', lineHeight: 1.15, color: '#F0EEFF' }}
          >
            {article.title}
          </h1>

          {/* Meta row */}
          <div
            className="flex flex-wrap items-center gap-4 text-xs"
            style={{ color: 'rgba(196,181,253,0.55)' }}
          >
            {article.sourceName && (
              <span className="font-semibold" style={{ color: 'rgba(196,181,253,0.75)' }}>
                {article.sourceName}
              </span>
            )}
            {dateStr && <span>{dateStr}</span>}
            {article.sourceUrl && (
              <a
                href={article.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 hover:text-white transition-colors"
              >
                <ExternalLink className="h-3 w-3" />
                Source
              </a>
            )}

            {/* Share button */}
            <button
              onClick={handleShare}
              className="ml-auto inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all hover:bg-white/10 cursor-pointer"
              style={{ border: BORDER_D, color: 'rgba(196,181,253,0.7)' }}
            >
              <Share2 className="h-3.5 w-3.5" />
              Share
            </button>
          </div>
        </div>
      </section>

      {/* ── Content area ── */}
      <section style={{ background: '#F5F4FF' }}>
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="grid lg:grid-cols-[1fr_280px] gap-8 items-start">

            {/* ── Main column ── */}
            <div className="space-y-8">

              {/* Summary */}
              <div
                className="rounded-2xl p-7"
                style={{ background: '#FFFFFF', border: '1px solid rgba(124,58,237,0.1)', boxShadow: '0 2px 12px rgba(124,58,237,0.06)' }}
              >
                <h2
                  className="text-base font-bold mb-4"
                  style={TEXT_GRAD_LT}
                >
                  Summary
                </h2>
                <p
                  className="leading-relaxed"
                  style={{ color: '#374151', fontSize: '0.98rem', lineHeight: 1.9 }}
                >
                  {article.summary}
                </p>
              </div>

              {/* Key Facts */}
              {article.keyFacts.length > 0 && (
                <div
                  className="rounded-2xl p-7"
                  style={{ background: '#FFFFFF', border: '1px solid rgba(124,58,237,0.1)', boxShadow: '0 2px 12px rgba(124,58,237,0.06)' }}
                >
                  <h2 className="text-base font-bold mb-5 flex items-center gap-2" style={TEXT_GRAD_LT}>
                    <BookOpen className="h-4.5 w-4.5" style={{ color: '#7C3AED' }} />
                    Key Facts
                  </h2>
                  <ol className="space-y-4">
                    {article.keyFacts.map((fact, i) => (
                      <li key={i} className="flex gap-4">
                        <span
                          className="h-6 w-6 rounded-full flex items-center justify-center text-[11px] font-extrabold shrink-0 mt-0.5"
                          style={{ background: 'rgba(124,58,237,0.1)', color: '#7C3AED' }}
                        >
                          {i + 1}
                        </span>
                        <p style={{ color: '#374151', lineHeight: 1.75, fontSize: '0.9rem' }}>{fact}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Mains Angle */}
              {article.mainsAngle && (
                <div
                  className="rounded-2xl p-7"
                  style={{
                    background: 'linear-gradient(135deg, rgba(124,58,237,0.04) 0%, rgba(192,38,211,0.04) 100%)',
                    border: '1px solid rgba(124,58,237,0.18)',
                  }}
                >
                  <h2 className="text-base font-bold mb-3 flex items-center gap-2">
                    <Target className="h-4.5 w-4.5" style={{ color: accentColor }} />
                    <span style={TEXT_GRAD_LT}>Mains Angle</span>
                  </h2>
                  <p
                    style={{
                      color: '#374151',
                      lineHeight: 1.9,
                      fontSize: '0.95rem',
                      borderLeft: `3px solid ${accentColor}`,
                      paddingLeft: '1rem',
                    }}
                  >
                    {article.mainsAngle}
                  </p>
                </div>
              )}

              {/* Topic tags */}
              {article.topicTags.length > 0 && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-1.5" style={{ color: '#6B63A0' }}>
                    <Tag className="h-3.5 w-3.5" />
                    Topics
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {article.topicTags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs font-medium px-3 py-1.5 rounded-xl"
                        style={{
                          background: '#FFFFFF',
                          color: '#6B63A0',
                          border: '1px solid rgba(124,58,237,0.15)',
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <Link
                  href="/current-affairs"
                  className="inline-flex items-center gap-2 text-sm font-semibold rounded-xl px-5 py-2.5 transition-all hover:shadow-sm"
                  style={{
                    border: '1px solid rgba(124,58,237,0.2)',
                    color: '#7C3AED',
                    background: 'rgba(124,58,237,0.04)',
                  }}
                >
                  <ArrowLeft className="h-4 w-4" />
                  All Articles
                </Link>
                <button
                  onClick={handleShare}
                  className="inline-flex items-center gap-2 text-sm font-semibold rounded-xl px-5 py-2.5 text-white transition-opacity hover:opacity-90 cursor-pointer"
                  style={{ background: BRAND_GRAD }}
                >
                  <Share2 className="h-4 w-4" />
                  Share Article
                </button>
              </div>
            </div>

            {/* ── Sidebar ── */}
            <aside className="space-y-5">

              {/* GS Paper info card */}
              {gsCfg && (
                <div
                  className="rounded-2xl p-5"
                  style={{ background: '#FFFFFF', border: `1px solid ${gsCfg.border}` }}
                >
                  <div
                    className="h-0.75 rounded-full mb-4"
                    style={{ background: gsCfg.color }}
                  />
                  <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: gsCfg.color }}>
                    {primaryGS}
                  </p>
                  <p className="text-sm font-semibold" style={{ color: '#1A1836' }}>
                    {gsCfg.desc}
                  </p>
                  <p className="text-xs mt-2 leading-relaxed" style={{ color: '#6B63A0' }}>
                    This article is relevant to the {primaryGS} syllabus for UPSC CSE &amp; State PSC exams.
                  </p>
                </div>
              )}

              {/* CTA card */}
              <div
                className="rounded-2xl p-5 relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #5B21B6 0%, #7C3AED 100%)' }}
              >
                <div
                  className="absolute top-0 right-0 w-32 h-32 pointer-events-none"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    borderRadius: '50%',
                    transform: 'translate(30%, -30%)',
                  }}
                />
                <div className="relative">
                  <p className="text-white font-bold text-sm mb-1">Go deeper with AI</p>
                  <p className="text-xs mb-4 leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>
                    Ask Remi about this topic — get examples, case studies, and model answers.
                  </p>
                  <Link
                    href="/signup"
                    className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl hover:opacity-90 transition-opacity"
                    style={{ background: '#FFFFFF', color: '#7C3AED' }}
                  >
                    Try for Free
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>

              {/* Source card */}
              {article.sourceName && (
                <div
                  className="rounded-2xl p-4"
                  style={{ background: '#FFFFFF', border: '1px solid rgba(124,58,237,0.1)' }}
                >
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: '#6B63A0' }}>
                    Source
                  </p>
                  <p className="text-sm font-semibold" style={{ color: '#1A1836' }}>{article.sourceName}</p>
                  {article.sourceUrl && (
                    <a
                      href={article.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs mt-2 hover:underline"
                      style={{ color: '#7C3AED' }}
                    >
                      <ExternalLink className="h-3 w-3" />
                      Read original
                    </a>
                  )}
                </div>
              )}
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}
