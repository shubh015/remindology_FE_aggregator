'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, BookOpen, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useGSSubjects } from '@/features/general-studies/hooks/use-general-studies';
import { ACTIVE_SUBJECT_SLUGS } from '@/features/general-studies/constants';

// Every paper is styled identically; only the label differs.
const GS_CONFIG: Record<string, { label: string }> = {
  GS1: { label: 'GS1 · Indian Heritage & Society' },
  GS2: { label: 'GS2 · Polity & International' },
  GS3: { label: 'GS3 · Economy & Environment' },
  GS4: { label: 'GS4 · Ethics & Integrity' },
};

function SubjectSkeleton() {
  return (
    <div className="ks-card-grid">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Skeleton key={i} className="h-28 rounded-[2px]" />
      ))}
    </div>
  );
}

export default function GeneralStudiesIndexPage() {
  const { data: subjects, isLoading, isError } = useGSSubjects();
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) router.push(`/general-studies/search?q=${encodeURIComponent(query.trim())}`);
  };

  const grouped = (subjects ?? []).reduce<Record<string, typeof subjects>>((acc, s) => {
    (acc[s.gsPaperTag] ??= []).push(s);
    return acc;
  }, {});
  const paperOrder = ['GS1', 'GS2', 'GS3', 'GS4'].filter((p) => grouped[p]?.length);

  return (
    <div>

      {/* ── Hero ── */}
      <section className="bg-paper border-b border-rule">
        <div className="ks-container pt-14 pb-14">
          <span className="eyebrow mb-4 inline-flex items-center gap-2">
            <BookOpen className="h-3.5 w-3.5" />
            General Studies · All 4 GS papers
          </span>
          <h1 className="doc-title mb-4">Master every GS subject</h1>
          <p className="doc-lede max-w-xl mb-8 text-ink-muted">
            AI-written notes covering all 4 GS papers — structured for UPSC, SSC &amp; State PSC preparation.
          </p>

          <form onSubmit={handleSearch} className="max-w-md">
            <div className="flex items-center gap-2.5 px-4 h-11 rounded-[3px] bg-paper-raised border border-rule-strong transition-colors duration-150 ease-ks focus-within:border-ink">
              <Search className="h-4 w-4 shrink-0 text-ink-muted" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search topics, acts, events…"
                className="flex-1 bg-transparent text-sm outline-none text-ink placeholder:text-ink-muted"
              />
            </div>
          </form>
        </div>
      </section>

      {/* ── Subjects ── */}
      <section className="bg-paper">
        <div className="ks-container py-14 space-y-12">
          {isLoading ? (
            <SubjectSkeleton />
          ) : isError ? (
            <div className="flex items-center gap-2 rounded-[3px] bg-paper-raised border border-rule p-4 text-sm text-[oklch(52%_.16_35)]">
              <AlertCircle className="h-4 w-4 shrink-0" />
              Could not load subjects. Please try again later.
            </div>
          ) : (
            paperOrder.map((paper) => {
              const cfg = GS_CONFIG[paper];
              return (
                <div key={paper}>
                  <div className="ks-group-head">
                    <h2 className="ks-group-title">{cfg.label}</h2>
                  </div>
                  <div className="ks-card-grid">
                    {grouped[paper]!.map((subject) => {
                      const isActive = ACTIVE_SUBJECT_SLUGS.has(subject.slug);

                      if (!isActive) {
                        return (
                          <div
                            key={subject.id}
                            aria-disabled="true"
                            className="ks-card cursor-not-allowed opacity-60"
                          >
                            <div className="ks-card-body">
                              <div className="ks-card-head">
                                <span className="ks-tag ks-tag-outline">{paper}</span>
                              </div>
                              <p className="ks-card-title text-ink-muted!">{subject.name}</p>
                              <span className="ks-card-meta">Coming Soon</span>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <Link
                          key={subject.id}
                          href={`/general-studies/${subject.slug}`}
                          className="ks-card"
                        >
                          <div className="ks-card-body">
                            <div className="ks-card-head">
                              <span className="ks-tag">{paper}</span>
                            </div>
                            <p className="ks-card-title">{subject.name}</p>
                            <span className="ks-card-link">Explore topics</span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
