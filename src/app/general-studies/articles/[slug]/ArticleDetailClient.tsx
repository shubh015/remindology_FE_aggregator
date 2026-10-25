'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, ArrowRight, Clock, AlertCircle, List, HelpCircle, BadgeCheck,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useGSArticle, useGSSubjects, useGSCategories, useGSCategoryArticles, useGSSubjectArticles,
} from '@/features/general-studies/hooks/use-general-studies';
import { sanitizeHtml } from '@/lib/sanitize-html';
import { TableOfContents, type TocItem } from '@/components/content/TableOfContents';
import { ArticleListItem } from '@/features/general-studies/components/ArticleListItem';
import type { GSArticle } from '@/types/features';

const BORDER_D   = '1px solid rgba(22,35,62,0.1)';
const ACCENT     = '#8A6A12';
const TEXT_BODY  = '#16233E';
const TEXT_MUTED = '#5B6478';
const SERIF      = { fontFamily: 'var(--font-serif-display), Georgia, serif' };

const GS_CONFIG: Record<string, { color: string; label: string }> = {
  GS1: { color: '#7C3AED', label: 'GS1 · Indian Heritage & Society' },
  GS2: { color: '#0891B2', label: 'GS2 · Polity & International' },
  GS3: { color: '#059669', label: 'GS3 · Economy & Environment' },
  GS4: { color: '#DC2626', label: 'GS4 · Ethics & Integrity' },
};

function stripHtml(text: string | undefined | null): string {
  if (!text) return '';
  return text.includes('<') ? text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : text;
}

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

function slugify(heading: string): string {
  return heading.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function ArticleSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-14 space-y-4">
      <Skeleton className="h-8 w-2/3 rounded" />
      <Skeleton className="h-4 w-full rounded" />
      <Skeleton className="h-4 w-5/6 rounded" />
      <Skeleton className="h-40 w-full rounded-2xl mt-6" />
    </div>
  );
}

export function GSArticleDetailClient() {
  const { slug } = useParams<{ slug: string }>();
  const { data: article, isLoading, isError } = useGSArticle(slug);
  const { data: subjects } = useGSSubjects();

  const subject = subjects?.find((s) => s.id === article?.subjectId);
  const { data: categories } = useGSCategories(subject?.slug ?? '');
  const category = categories?.find((c) => c.id === article?.categoryId);

  // Related articles: prefer siblings in the same category; subjects with no
  // categories (Ethics, Art & Culture, ...) fall back to subject-level articles.
  const { data: categoryArticles } = useGSCategoryArticles(subject?.slug ?? '', category?.slug ?? '');
  const { data: subjectArticles } = useGSSubjectArticles(subject?.slug ?? '', !category);
  const relatedArticles = useMemo<GSArticle[]>(() => {
    const pool = category ? categoryArticles : subjectArticles;
    if (!article || !pool) return [];
    return pool.filter((a) => a.id !== article.id).slice(0, 3);
  }, [article, category, categoryArticles, subjectArticles]);

  if (isLoading) {
    return (
      <div>
        <section className="bg-background">
          <ArticleSkeleton />
        </section>
      </div>
    );
  }

  if (isError || !article) {
    return (
      <div>
        <section style={{ background: '#FFFFFF', minHeight: '60vh' }}>
          <div className="max-w-3xl mx-auto px-6 py-20 flex flex-col items-center gap-4 text-center">
            <AlertCircle className="h-12 w-12" style={{ color: '#DC2626', opacity: 0.5 }} />
            <p className="text-lg font-semibold text-foreground">Article not found</p>
            <Link
              href="/general-studies"
              className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl text-white bg-primary"
            >
              <ArrowLeft className="h-4 w-4" />Back to General Studies
            </Link>
          </div>
        </section>
      </div>
    );
  }

  const publishedDate = new Date(article.publishedAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  // Table of contents — covers every section that actually renders below,
  // not just the AI-picked ones; built from the same guards as the JSX.
  const tocItems: TocItem[] = [
    { id: 'summary', label: 'Summary' },
    ...((article.keyPoints?.length ?? 0) > 0 ? [{ id: 'key-points', label: 'Key Points' }] : []),
    ...(article.sections ?? []).map((s) => ({ id: slugify(s.heading), label: s.heading })),
    ...((article.mainsAngles?.length ?? 0) > 0 ? [{ id: 'mains-angles', label: 'Mains Angle Questions' }] : []),
    ...((article.faqs?.length ?? 0) > 0 ? [{ id: 'faqs', label: 'FAQs' }] : []),
  ];

  return (
    <div>

      <style>{`
        @keyframes gs-fade-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .gs-article { animation: gs-fade-in 0.45s ease both; animation-delay: 0.08s; }
        .gs-sidebar { animation: gs-fade-in 0.45s ease both; animation-delay: 0.18s; }
      `}</style>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-background">
        <div
          className="absolute pointer-events-none"
          style={{ top: 0, right: '-10%', width: 440, height: 440, borderRadius: '50%', background: 'radial-gradient(circle, rgba(138,106,18,0.06) 0%, transparent 68%)' }}
        />

        <div className="relative max-w-6xl mx-auto px-6 pt-10 pb-14">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs mb-6 flex-wrap text-muted-foreground">
            <Link href="/general-studies" className="hover:text-foreground transition-colors flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" />
              General Studies
            </Link>
            {subject && (
              <>
                <span>/</span>
                <Link href={`/general-studies/${subject.slug}`} className="hover:text-foreground transition-colors">
                  {subject.name}
                </Link>
              </>
            )}
            {category && subject && (
              <>
                <span>/</span>
                <Link href={`/general-studies/${subject.slug}/${category.slug}`} className="hover:text-foreground transition-colors">
                  {category.name}
                </Link>
              </>
            )}
          </div>

          {/* Kicker — masthead-style section label, newspaper convention */}
          <p
            className="flex items-center gap-2.5 text-[11px] font-bold uppercase mb-4"
            style={{ color: ACCENT, letterSpacing: '0.16em' }}
          >
            <span className="inline-block h-px w-6" style={{ background: ACCENT }} />
            General Studies
          </p>

          {/* GS tags */}
          <div className="flex flex-wrap gap-2 mb-5">
            {(article.gsPaperTags ?? []).map((tag) => {
              const cfg = GS_CONFIG[tag];
              return cfg ? (
                <span
                  key={tag}
                  className="text-xs font-bold px-3 py-1 rounded-full"
                  style={{ background: `${cfg.color}18`, color: cfg.color, border: `1px solid ${cfg.color}35` }}
                >
                  {tag} · {cfg.label.split('· ')[1]}
                </span>
              ) : null;
            })}
          </div>

          <h1
            className="font-semibold tracking-tight mb-6 text-foreground"
            style={{ ...SERIF, fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', lineHeight: 1.2 }}
          >
            {article.title}
          </h1>

          {/* Dateline — newspaper byline strip, bordered top & bottom */}
          <div
            className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] uppercase py-3 text-muted-foreground"
            style={{ borderTop: BORDER_D, borderBottom: BORDER_D, letterSpacing: '0.04em' }}
          >
            <span>{publishedDate}</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />{article.readTimeMins} min read
            </span>
          </div>

          {/* Credibility line — AI-written study notes, not a human byline */}
          <p className="flex items-center gap-1.5 text-[11px] mt-3 text-muted-foreground">
            <BadgeCheck className="h-3.5 w-3.5" style={{ color: ACCENT }} />
            AI-written study notes, last updated {publishedDate}
          </p>
        </div>
      </section>

      {/* ── Content ── */}
      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid lg:grid-cols-[1fr_240px] gap-12 items-start">

            {/* ── Main article ── */}
            <article className="gs-article space-y-10">

              {/* Mobile table of contents — the sidebar version is desktop-only */}
              {tocItems.length > 1 && (
                <details className="lg:hidden rounded-xl" style={{ border: BORDER_D }}>
                  <summary
                    className="flex items-center gap-2 px-4 py-3 text-sm font-bold cursor-pointer select-none"
                    style={{ color: TEXT_BODY }}
                  >
                    <List className="h-4 w-4" style={{ color: ACCENT }} />
                    On this page
                  </summary>
                  <div className="px-4 pb-4">
                    <TableOfContents items={tocItems} accentColor={ACCENT} />
                  </div>
                </details>
              )}

              {/* Summary */}
              <section id="summary" className="space-y-3.5 scroll-mt-24">
                <SectionHeading color={ACCENT}>Summary</SectionHeading>
                <p
                  className="first-letter:float-left first-letter:mr-2.5 first-letter:mt-1 first-letter:text-6xl first-letter:font-semibold first-letter:leading-[0.8] first-letter:font-serif-display first-letter:text-[#8A6A12]"
                  style={{ fontSize: '1.0625rem', lineHeight: 1.75, color: TEXT_BODY, fontWeight: 450, maxWidth: 640 }}
                >
                  {stripHtml(article.summary)}
                </p>
              </section>

              {/* Key Points */}
              {(article.keyPoints?.length ?? 0) > 0 && (
                <section id="key-points" className="space-y-3.5 scroll-mt-24">
                  <SectionHeading color={ACCENT}>Key Points</SectionHeading>
                  <ul className="space-y-3.5" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {(article.keyPoints ?? []).map((point, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span
                          className="rounded-full shrink-0"
                          style={{ width: 6, height: 6, marginTop: '0.55rem', background: ACCENT, opacity: 0.65 }}
                        />
                        <span style={{ fontSize: '1rem', lineHeight: 1.75, color: TEXT_BODY }}>{stripHtml(point)}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* AI-picked sections — generic loop, never switch on heading text */}
              {(article.sections ?? []).map((s) => (
                <section key={s.heading} id={slugify(s.heading)} className="space-y-3.5 scroll-mt-24">
                  <SectionHeading color={ACCENT}>{s.heading}</SectionHeading>
                  {s.content.includes('<') ? (
                    <div
                      className="rich-editor-content"
                      style={{ fontSize: '1rem', lineHeight: 1.78, color: TEXT_BODY }}
                      dangerouslySetInnerHTML={{ __html: sanitizeHtml(s.content) }}
                    />
                  ) : (
                    <p style={{ fontSize: '1rem', lineHeight: 1.78, color: TEXT_BODY }}>{s.content}</p>
                  )}
                </section>
              ))}

              {/* Mains Angle Questions */}
              {(article.mainsAngles?.length ?? 0) > 0 && (
                <section id="mains-angles" className="space-y-3.5 scroll-mt-24">
                  <SectionHeading color={ACCENT}>Mains Angle Questions</SectionHeading>
                  <ol className="space-y-2.5" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {(article.mainsAngles ?? []).map((angle, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span
                          className="h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-extrabold shrink-0"
                          style={{ background: `${ACCENT}12`, color: ACCENT, marginTop: 2 }}
                        >
                          {i + 1}
                        </span>
                        <span style={{ fontSize: '0.975rem', lineHeight: 1.75, color: TEXT_BODY }}>{angle}</span>
                      </li>
                    ))}
                  </ol>
                </section>
              )}

              {/* FAQs */}
              {(article.faqs?.length ?? 0) > 0 && (
                <section id="faqs" className="space-y-3.5 scroll-mt-24">
                  <SectionHeading color={ACCENT}>Frequently Asked Questions</SectionHeading>
                  <div className="space-y-4">
                    {(article.faqs ?? []).map((faq, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <HelpCircle className="h-4 w-4 shrink-0 mt-0.5" style={{ color: ACCENT, opacity: 0.6 }} />
                        <div>
                          <p className="font-bold mb-1 text-foreground" style={{ fontSize: '0.9rem' }}>
                            {faq.question}
                          </p>
                          <p style={{ fontSize: '0.875rem', lineHeight: 1.8, color: TEXT_MUTED }}>
                            {faq.answer}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Topic tags */}
              {(article.topicTags?.length ?? 0) > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2" style={{ borderTop: `1px solid ${ACCENT}12` }}>
                  {(article.topicTags ?? []).map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] font-medium px-2.5 py-1 rounded-full"
                      style={{ background: `${ACCENT}0A`, color: TEXT_MUTED, border: `1px solid ${ACCENT}18` }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Closing CTA */}
              <div
                className="rounded-2xl p-5 relative overflow-hidden"
                style={{ background: ACCENT }}
              >
                <div
                  className="absolute top-0 right-0 w-28 h-28 pointer-events-none"
                  style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '50%', transform: 'translate(30%, -30%)' }}
                />
                <div className="relative">
                  <p className="text-white font-bold text-sm mb-1">Practice with MCQs</p>
                  <p className="text-xs mb-4 leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)' }}>
                    Turn this topic into revision notes, MCQs &amp; daily challenges — free with Remindology.
                  </p>
                  <Link
                    href="/signup"
                    className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl hover:opacity-90 transition-opacity"
                    style={{ background: '#FFFFFF', color: ACCENT }}
                  >
                    Try for Free<ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>

              {/* Related articles — same category, or same subject when there are no categories */}
              {relatedArticles.length > 0 && (
                <section className="space-y-3.5 pt-2">
                  <SectionHeading color={ACCENT}>{`More in ${category?.name ?? subject?.name ?? 'this topic'}`}</SectionHeading>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {relatedArticles.map((related) => (
                      <ArticleListItem key={related.id} article={related} />
                    ))}
                  </div>
                </section>
              )}
            </article>

            {/* ── Sidebar: table of contents ── */}
            {tocItems.length > 1 && (
              <aside className="gs-sidebar hidden lg:block sticky top-24 space-y-3 rounded-2xl p-4" style={{ background: '#FFFFFF', border: BORDER_D }}>
                <p className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest" style={{ color: TEXT_MUTED }}>
                  <List className="h-3 w-3" />
                  On this page
                </p>
                <TableOfContents items={tocItems} accentColor={ACCENT} />
              </aside>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
