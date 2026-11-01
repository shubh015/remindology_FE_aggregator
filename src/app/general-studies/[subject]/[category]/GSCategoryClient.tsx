'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, AlertCircle, FileText } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useGSSubjects, useGSCategories, useGSCategoryArticles,
} from '@/features/general-studies/hooks/use-general-studies';
import { ArticleListItem } from '@/features/general-studies/components/ArticleListItem';

export function GSCategoryClient() {
  const { subject: subjectSlug, category: categorySlug } = useParams<{ subject: string; category: string }>();
  const { data: subjects } = useGSSubjects();
  const { data: categories } = useGSCategories(subjectSlug);
  const { data: articles, isLoading, isError } = useGSCategoryArticles(subjectSlug, categorySlug);

  const subject  = subjects?.find((s) => s.slug === subjectSlug);
  const category = categories?.find((c) => c.slug === categorySlug);

  return (
    <div>

      {/* ── Hero ── */}
      <section className="bg-paper border-b border-rule">
        <div className="ks-container pt-10 pb-12">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm mb-6 flex-wrap text-ink-muted">
            <Link href="/general-studies" className="nav-link text-sm! flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" />
              General Studies
            </Link>
            <span>/</span>
            <Link href={`/general-studies/${subjectSlug}`} className="nav-link text-sm!">
              {subject?.name ?? subjectSlug}
            </Link>
          </div>

          <h1 className="doc-title mb-3">
            {category?.name ?? categorySlug}
          </h1>
          <p className="doc-lede max-w-xl text-ink-muted">
            Major topics, events &amp; developments in {category?.name ?? categorySlug} for UPSC preparation.
          </p>
        </div>
      </section>

      {/* ── Articles ── */}
      <section className="bg-paper">
        <div className="ks-container py-14">
          {isLoading ? (
            <div className="grid gap-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-[3px]" />)}
            </div>
          ) : isError ? (
            <div className="flex items-center gap-2 rounded-[3px] bg-paper-raised border border-rule p-4 text-sm text-[oklch(52%_.16_35)]">
              <AlertCircle className="h-4 w-4 shrink-0" />
              Could not load articles. Please try again later.
            </div>
          ) : articles && articles.length > 0 ? (
            <div className="border-b border-rule">
              {articles.map((article) => (
                <ArticleListItem key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <FileText className="h-8 w-8 text-ink-muted" />
              <p className="text-sm text-ink-muted">
                No articles published yet in this category.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
