'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, AlertCircle, Clock, FileText } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useGSSubjects, useGSCategories, useGSSubjectArticles,
} from '@/features/general-studies/hooks/use-general-studies';
import { ACTIVE_SUBJECT_SLUGS } from '@/features/general-studies/constants';
import { GSPlaceholderCard } from '@/features/general-studies/components/GSPlaceholderCard';
import { getGSIcon } from '@/features/general-studies/components/gs-icons';
import { ArticleListItem } from '@/features/general-studies/components/ArticleListItem';

const ACCENT = '#8A6A12';

export function GSSubjectClient() {
  const { subject: subjectSlug } = useParams<{ subject: string }>();
  const { data: subjects, isLoading: subjectsLoading } = useGSSubjects();
  const isActiveSubject = ACTIVE_SUBJECT_SLUGS.has(subjectSlug);
  const { data: categories, isLoading, isError } = useGSCategories(isActiveSubject ? subjectSlug : '');

  // Subjects with no categories (Ethics, Art & Culture, ...) attach articles directly
  // to the subject — only fetch this once we know categories came back empty.
  const noCategories = !isLoading && !isError && (!categories || categories.length === 0);
  const {
    data: subjectArticles, isLoading: articlesLoading, isError: articlesError,
  } = useGSSubjectArticles(subjectSlug, isActiveSubject && noCategories);

  const subject = subjects?.find((s) => s.slug === subjectSlug);

  if (!isActiveSubject) {
    return (
      <div>
        <section className="relative overflow-hidden bg-background">
          <div className="relative max-w-4xl mx-auto px-6 pt-10 pb-14">
            <div className="flex items-center gap-2 text-xs mb-6 text-muted-foreground">
              <Link href="/general-studies" className="hover:text-foreground transition-colors flex items-center gap-1">
                <ArrowLeft className="h-3.5 w-3.5" />
                General Studies
              </Link>
            </div>
            <h1
              className="font-black tracking-tight mb-3 text-foreground"
              style={{ fontSize: 'var(--text-display-sm)', lineHeight: 1.05, letterSpacing: '-0.01em' }}
            >
              {subjectsLoading ? 'Loading…' : subject?.name ?? subjectSlug}
            </h1>
          </div>
        </section>
        <section className="bg-white">
          <div className="max-w-4xl mx-auto px-6 py-20 flex flex-col items-center gap-3 text-center">
            <Clock className="h-10 w-10 text-muted-foreground/40" />
            <p className="text-lg font-semibold text-foreground">Coming soon</p>
            <p className="text-sm max-w-sm text-muted-foreground">
              We're still writing notes for this subject. Check back soon, or explore History and Environment &amp; Ecology in the meantime.
            </p>
            <Link
              href="/general-studies"
              className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl text-white bg-primary mt-2"
            >
              <ArrowLeft className="h-4 w-4" />Back to General Studies
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-background">
        <div
          className="absolute pointer-events-none"
          style={{ top: 0, right: '-8%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(138,106,18,0.06) 0%, transparent 68%)' }}
        />
        <div className="relative max-w-6xl mx-auto px-6 pt-10 pb-14">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs mb-6 text-muted-foreground">
            <Link href="/general-studies" className="hover:text-foreground transition-colors flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" />
              General Studies
            </Link>
          </div>

          <h1
            className="font-black tracking-tight mb-3 text-foreground"
            style={{ fontSize: 'var(--text-display-sm)', lineHeight: 1.05, letterSpacing: '-0.01em' }}
          >
            {subjectsLoading ? 'Loading…' : subject?.name ?? subjectSlug}
          </h1>
          {subject?.gsPaperTag && (
            <span className="inline-flex text-xs font-bold px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary">
              {subject.gsPaperTag}
            </span>
          )}
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="bg-white">
        <div className="max-w-5xl mx-auto px-6 py-14">
          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="rounded-2xl" style={{ height: 300 }} />)}
            </div>
          ) : isError ? (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 shrink-0" />
              Could not load categories. Please try again later.
            </div>
          ) : categories && categories.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {categories.map((category) => (
                <GSPlaceholderCard
                  key={category.id}
                  title={category.name}
                  description={`Explore ${category.name} for UPSC preparation`}
                  href={`/general-studies/${subjectSlug}/${category.slug}`}
                  accentColor={ACCENT}
                  icon={getGSIcon(category.slug || category.name)}
                />
              ))}
            </div>
          ) : articlesLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="rounded-2xl" style={{ height: 300 }} />)}
            </div>
          ) : articlesError ? (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 shrink-0" />
              Could not load articles. Please try again later.
            </div>
          ) : subjectArticles && subjectArticles.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {subjectArticles.map((article) => (
                <ArticleListItem key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <FileText className="h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                No articles published yet for this subject.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
