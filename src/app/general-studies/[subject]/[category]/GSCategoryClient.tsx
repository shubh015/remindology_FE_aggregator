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
      <section className="relative overflow-hidden bg-background">
        <div
          className="absolute pointer-events-none"
          style={{ top: 0, right: '-8%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(138,106,18,0.06) 0%, transparent 68%)' }}
        />
        <div className="relative max-w-4xl mx-auto px-6 pt-10 pb-14">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs mb-6 flex-wrap text-muted-foreground">
            <Link href="/general-studies" className="hover:text-foreground transition-colors flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" />
              General Studies
            </Link>
            <span>/</span>
            <Link href={`/general-studies/${subjectSlug}`} className="hover:text-foreground transition-colors">
              {subject?.name ?? subjectSlug}
            </Link>
          </div>

          <h1
            className="font-black tracking-tight mb-3 text-foreground"
            style={{ fontSize: 'var(--text-display-sm)', lineHeight: 1.05, letterSpacing: '-0.01em' }}
          >
            {category?.name ?? categorySlug}
          </h1>
          <p className="text-sm max-w-xl text-muted-foreground">
            Major topics, events &amp; developments in {category?.name ?? categorySlug} for UPSC preparation.
          </p>
        </div>
      </section>

      {/* ── Articles ── */}
      <section className="bg-white">
        <div className="max-w-5xl mx-auto px-6 py-14">
          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="rounded-2xl" style={{ height: 300 }} />)}
            </div>
          ) : isError ? (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 shrink-0" />
              Could not load articles. Please try again later.
            </div>
          ) : articles && articles.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {articles.map((article) => (
                <ArticleListItem key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <FileText className="h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                No articles published yet in this category.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
