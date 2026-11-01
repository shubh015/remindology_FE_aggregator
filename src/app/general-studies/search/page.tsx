'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Search, AlertCircle, FileText } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useGSSearch } from '@/features/general-studies/hooks/use-general-studies';
import { ArticleListItem } from '@/features/general-studies/components/ArticleListItem';

function GSSearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') ?? '';
  const [query, setQuery] = useState(initialQuery);

  const { data: results, isLoading, isError } = useGSSearch(initialQuery);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) router.push(`/general-studies/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div>

      {/* ── Hero ── */}
      <section className="bg-paper border-b border-rule">
        <div className="ks-container pt-10 pb-12">
          <div className="flex items-center gap-2 text-sm mb-6 text-ink-muted">
            <Link href="/general-studies" className="nav-link text-sm! flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" />
              General Studies
            </Link>
          </div>

          <h1 className="doc-title mb-6">
            Search General Studies
          </h1>

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

      {/* ── Results ── */}
      <section className="bg-paper">
        <div className="ks-container py-14">
          {!initialQuery ? (
            <p className="text-sm text-center py-10 text-ink-muted">
              Type something to search General Studies articles.
            </p>
          ) : isLoading ? (
            <div className="grid gap-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-[3px]" />)}
            </div>
          ) : isError ? (
            <div className="flex items-center gap-2 rounded-[3px] bg-paper-raised border border-rule p-4 text-sm text-[oklch(52%_.16_35)]">
              <AlertCircle className="h-4 w-4 shrink-0" />
              Search failed. Please try again later.
            </div>
          ) : results && results.length > 0 ? (
            <div>
              <p className="font-label text-[11px] uppercase tracking-[0.14em] mb-2 text-ink-muted">
                {results.length} result{results.length === 1 ? '' : 's'} for &ldquo;{initialQuery}&rdquo;
              </p>
              <div className="border-b border-rule">
                {results.map((article) => (
                  <ArticleListItem key={article.id} article={article} />
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <FileText className="h-8 w-8 text-ink-muted" />
              <p className="text-sm text-ink-muted">
                No articles found for &ldquo;{initialQuery}&rdquo;.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default function GSSearchPage() {
  return (
    <Suspense fallback={null}>
      <GSSearchContent />
    </Suspense>
  );
}
