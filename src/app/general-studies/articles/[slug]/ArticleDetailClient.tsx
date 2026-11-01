'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, ArrowRight, Clock, AlertCircle, List, HelpCircle, BadgeCheck,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  useGSArticle, useGSSubjects, useGSCategories, useGSCategoryArticles, useGSSubjectArticles,
} from '@/features/general-studies/hooks/use-general-studies';
import { sanitizeHtml } from '@/lib/sanitize-html';
import { TableOfContents, type TocItem } from '@/components/content/TableOfContents';
import { ArticleListItem } from '@/features/general-studies/components/ArticleListItem';
import type { GSArticle } from '@/types/features';

// Monochrome docs style (impeccable.style/docs). All GS papers look
// identical and differ by label only.
const LABEL = 'font-label text-[11px] uppercase tracking-[0.14em] text-ink-muted';

const GS_CONFIG: Record<string, { label: string }> = {
  GS1: { label: 'GS1 · Indian Heritage & Society' },
  GS2: { label: 'GS2 · Polity & International' },
  GS3: { label: 'GS3 · Economy & Environment' },
  GS4: { label: 'GS4 · Ethics & Integrity' },
};

function stripHtml(text: string | undefined | null): string {
  if (!text) return '';
  return text.includes('<') ? text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : text;
}

function SectionHeading({ children }: { children: string }) {
  return <h2 className="doc-h2">{children}</h2>;
}

function slugify(heading: string): string {
  return heading.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function ArticleSkeleton() {
  return (
    <div className="ks-container py-14 space-y-4">
      <Skeleton className="h-9 w-2/3 rounded-[2px]" />
      <Skeleton className="h-4 w-full max-w-[68ch] rounded-[2px]" />
      <Skeleton className="h-4 w-5/6 max-w-[60ch] rounded-[2px]" />
      <Skeleton className="h-40 w-full max-w-[68ch] rounded-[2px] mt-6" />
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
        <section>
          <ArticleSkeleton />
        </section>
      </div>
    );
  }

  if (isError || !article) {
    return (
      <div>
        <section className="min-h-[60vh]">
          <div className="max-w-3xl mx-auto px-6 py-20 flex flex-col items-center gap-4 text-center">
            <AlertCircle className="h-10 w-10 text-[oklch(52%_.16_35)]" />
            <p className="doc-h3">Article not found</p>
            <Link href="/general-studies" className="btn-ink btn-sm gap-2">
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
    <div className="font-ui text-ink-soft">

      {/* ── Header ── */}
      <header className="ks-container">
        <div className="pt-10 pb-8 border-b border-rule">

          {/* Breadcrumb */}
          <div className={cn('flex items-center gap-2 mb-8 flex-wrap', LABEL)}>
            <Link href="/general-studies" className="hover:text-ink transition-colors duration-150 flex items-center gap-1.5">
              <ArrowLeft className="h-3.5 w-3.5" />
              General Studies
            </Link>
            {subject && (
              <>
                <span aria-hidden="true">/</span>
                <Link href={`/general-studies/${subject.slug}`} className="hover:text-ink transition-colors duration-150">
                  {subject.name}
                </Link>
              </>
            )}
            {category && subject && (
              <>
                <span aria-hidden="true">/</span>
                <Link href={`/general-studies/${subject.slug}/${category.slug}`} className="hover:text-ink transition-colors duration-150">
                  {category.name}
                </Link>
              </>
            )}
          </div>

          {/* Kicker */}
          <p className="eyebrow mb-4">General Studies</p>

          {/* GS tags — all papers look identical, differ by label only */}
          {(article.gsPaperTags ?? []).some((tag) => GS_CONFIG[tag]) && (
            <div className="flex flex-wrap gap-2 mb-5">
              {(article.gsPaperTags ?? []).map((tag) => {
                const cfg = GS_CONFIG[tag];
                return cfg ? (
                  <span key={tag} className="ks-tag">
                    {tag} · {cfg.label.split('· ')[1]}
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
            <span>{publishedDate}</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />{article.readTimeMins} min read
            </span>
          </div>

          {/* Credibility line — AI-written study notes, not a human byline */}
          <p className="doc-note flex items-center gap-1.5 text-[12px] mt-3">
            <BadgeCheck className="h-3.5 w-3.5 text-ink-muted" />
            AI-written study notes, last updated {publishedDate}
          </p>
        </div>
      </header>

      {/* ── Content ── */}
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

            {/* Summary */}
            <section id="summary" className="scroll-mt-24">
              <SectionHeading>Summary</SectionHeading>
              <p className="doc-lede max-w-none">
                {stripHtml(article.summary)}
              </p>
            </section>

            {/* Key Points */}
            {(article.keyPoints?.length ?? 0) > 0 && (
              <section id="key-points" className="scroll-mt-24">
                <SectionHeading>Key Points</SectionHeading>
                <ul className="space-y-3" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {(article.keyPoints ?? []).map((point, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="h-1.5 w-1.5 rounded-full bg-ink-muted shrink-0 mt-[0.65rem]" />
                      <span className="doc-prose">{stripHtml(point)}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* AI-picked sections — generic loop, never switch on heading text */}
            {(article.sections ?? []).map((s) => (
              <section key={s.heading} id={slugify(s.heading)} className="scroll-mt-24">
                <SectionHeading>{s.heading}</SectionHeading>
                {s.content.includes('<') ? (
                  <div
                    className="rich-editor-content doc-prose"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(s.content) }}
                  />
                ) : (
                  <p className="doc-prose">{s.content}</p>
                )}
              </section>
            ))}

            {/* Mains Angle Questions */}
            {(article.mainsAngles?.length ?? 0) > 0 && (
              <section id="mains-angles" className="scroll-mt-24">
                <SectionHeading>Mains Angle Questions</SectionHeading>
                <ol className="space-y-3" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {(article.mainsAngles ?? []).map((angle, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="font-label text-[12px] text-ink-muted tabular-nums shrink-0 w-6 mt-[0.2rem]">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="doc-prose">{angle}</span>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {/* FAQs */}
            {(article.faqs?.length ?? 0) > 0 && (
              <section id="faqs" className="scroll-mt-24">
                <SectionHeading>Frequently Asked Questions</SectionHeading>
                <div className="space-y-5">
                  {(article.faqs ?? []).map((faq, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <HelpCircle className="h-4 w-4 shrink-0 mt-1 text-ink-muted" />
                      <div>
                        <h3 className="doc-h3 mb-1">
                          {faq.question}
                        </h3>
                        <p className="doc-prose text-[0.95rem]">
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
              <div className="flex flex-wrap items-center gap-2 pt-6 border-t border-rule">
                {(article.topicTags ?? []).map((tag) => (
                  <span key={tag} className="ks-tag ks-tag-outline">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Closing CTA */}
            <div className="ks-card">
              <div className="ks-card-body">
                <p className="ks-card-title text-[14px]">Practice with MCQs</p>
                <p className="ks-card-desc text-[12.5px]">
                  Turn this topic into revision notes, MCQs &amp; daily challenges — free with Remindology.
                </p>
                <Link href="/signup" className="btn-ink btn-sm gap-1.5 justify-self-start mt-2">
                  Try for Free<ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Related articles — same category, or same subject when there are no categories */}
            {relatedArticles.length > 0 && (
              <section className="pt-2">
                <SectionHeading>{`More in ${category?.name ?? subject?.name ?? 'this topic'}`}</SectionHeading>
                <div className="mt-2 border-b border-rule">
                  {relatedArticles.map((related) => (
                    <ArticleListItem key={related.id} article={related} />
                  ))}
                </div>
              </section>
            )}
          </article>

          {/* ── Sidebar: table of contents ── */}
          {tocItems.length > 1 && (
            <aside className="hidden lg:block sticky top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
              <TableOfContents items={tocItems} label="On this page" />
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
