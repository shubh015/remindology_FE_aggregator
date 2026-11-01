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
        <section className="bg-paper border-b border-rule">
          <div className="ks-container pt-10 pb-12">
            <div className="flex items-center gap-2 text-sm mb-6 text-ink-muted">
              <Link href="/general-studies" className="nav-link text-sm! flex items-center gap-1">
                <ArrowLeft className="h-3.5 w-3.5" />
                General Studies
              </Link>
            </div>
            <h1 className="doc-title mb-3">
              {subjectsLoading ? 'Loading…' : subject?.name ?? subjectSlug}
            </h1>
          </div>
        </section>
        <section className="bg-paper">
          <div className="ks-container py-20 flex flex-col items-center gap-3 text-center">
            <Clock className="h-10 w-10 text-ink-muted" />
            <p className="doc-h3">Coming soon</p>
            <p className="text-sm max-w-sm text-ink-muted">
              We're still writing notes for this subject. Check back soon, or explore History and Environment &amp; Ecology in the meantime.
            </p>
            <Link href="/general-studies" className="btn-ink mt-2">
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
      <section className="bg-paper border-b border-rule">
        <div className="ks-container pt-10 pb-12">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm mb-6 text-ink-muted">
            <Link href="/general-studies" className="nav-link text-sm! flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" />
              General Studies
            </Link>
          </div>

          <h1 className="doc-title mb-3">
            {subjectsLoading ? 'Loading…' : subject?.name ?? subjectSlug}
          </h1>
          {subject?.gsPaperTag && (
            <span className="ks-tag">
              {subject.gsPaperTag}
            </span>
          )}
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="bg-paper">
        <div className="ks-container py-14">
          {isLoading ? (
            <div className="ks-card-grid">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-64 rounded-[2px]" />)}
            </div>
          ) : isError ? (
            <div className="flex items-center gap-2 rounded-[3px] bg-paper-raised border border-rule p-4 text-sm text-[oklch(52%_.16_35)]">
              <AlertCircle className="h-4 w-4 shrink-0" />
              Could not load categories. Please try again later.
            </div>
          ) : categories && categories.length > 0 ? (
            <div className="ks-card-grid">
              {categories.map((category) => (
                <GSPlaceholderCard
                  key={category.id}
                  title={category.name}
                  description={`Explore ${category.name} for UPSC preparation`}
                  href={`/general-studies/${subjectSlug}/${category.slug}`}
                  icon={getGSIcon(category.slug || category.name)}
                />
              ))}
            </div>
          ) : articlesLoading ? (
            <div className="grid gap-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-[3px]" />)}
            </div>
          ) : articlesError ? (
            <div className="flex items-center gap-2 rounded-[3px] bg-paper-raised border border-rule p-4 text-sm text-[oklch(52%_.16_35)]">
              <AlertCircle className="h-4 w-4 shrink-0" />
              Could not load articles. Please try again later.
            </div>
          ) : subjectArticles && subjectArticles.length > 0 ? (
            <div className="border-b border-rule">
              {subjectArticles.map((article) => (
                <ArticleListItem key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <FileText className="h-8 w-8 text-ink-muted" />
              <p className="text-sm text-ink-muted">
                No articles published yet for this subject.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
