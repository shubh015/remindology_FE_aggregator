'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, AlertCircle, FileText } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useGSSubjects, useGSCategories, useGSCategoryArticles,
} from '@/features/general-studies/hooks/use-general-studies';
import { ArticleListItem } from '@/features/general-studies/components/ArticleListItem';

const MIDNIGHT = '#09091F';

export default function GSCategoryPage() {
  const { subject: subjectSlug, category: categorySlug } = useParams<{ subject: string; category: string }>();
  const { data: subjects } = useGSSubjects();
  const { data: categories } = useGSCategories(subjectSlug);
  const { data: articles, isLoading, isError } = useGSCategoryArticles(subjectSlug, categorySlug);

  const subject  = subjects?.find((s) => s.slug === subjectSlug);
  const category = categories?.find((c) => c.slug === categorySlug);

  return (
    <div style={{ fontFamily: 'var(--font-poppins), system-ui, sans-serif' }}>

      {/* ── Dark hero ── */}
      <section className="relative overflow-hidden" style={{ background: MIDNIGHT }}>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(167,139,250,0.07) 1px, transparent 1px)', backgroundSize: '30px 30px' }}
        />
        <div className="relative max-w-4xl mx-auto px-6 pt-10 pb-14">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs mb-6 flex-wrap" style={{ color: 'rgba(196,181,253,0.5)' }}>
            <Link href="/general-studies" className="hover:text-white transition-colors flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" />
              General Studies
            </Link>
            <span>/</span>
            <Link href={`/general-studies/${subjectSlug}`} className="hover:text-white transition-colors">
              {subject?.name ?? subjectSlug}
            </Link>
          </div>

          <h1
            className="font-extrabold tracking-tight mb-3"
            style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', lineHeight: 1.15, color: '#F0EEFF' }}
          >
            {category?.name ?? categorySlug}
          </h1>
          <p className="text-sm max-w-xl" style={{ color: 'rgba(196,181,253,0.6)' }}>
            Major topics, events &amp; developments in {category?.name ?? categorySlug} for UPSC preparation.
          </p>
        </div>
      </section>

      {/* ── Articles ── */}
      <section style={{ background: '#FFFFFF' }}>
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
              <FileText className="h-8 w-8" style={{ color: '#D1D5DB' }} />
              <p className="text-sm" style={{ color: '#9CA3AF' }}>
                No articles published yet in this category.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
