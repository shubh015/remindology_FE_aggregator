'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Search, AlertCircle, FileText } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useGSSearch } from '@/features/general-studies/hooks/use-general-studies';
import { ArticleListItem } from '@/features/general-studies/components/ArticleListItem';

const MIDNIGHT = '#09091F';

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
    <div style={{ fontFamily: 'var(--font-poppins), system-ui, sans-serif' }}>

      {/* ── Dark hero ── */}
      <section className="relative overflow-hidden" style={{ background: MIDNIGHT }}>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(167,139,250,0.07) 1px, transparent 1px)', backgroundSize: '30px 30px' }}
        />
        <div className="relative max-w-4xl mx-auto px-6 pt-10 pb-14">
          <div className="flex items-center gap-2 text-xs mb-6" style={{ color: 'rgba(196,181,253,0.5)' }}>
            <Link href="/general-studies" className="hover:text-white transition-colors flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" />
              General Studies
            </Link>
          </div>

          <h1
            className="font-extrabold tracking-tight mb-6"
            style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)', lineHeight: 1.15, color: '#F0EEFF' }}
          >
            Search General Studies
          </h1>

          <form onSubmit={handleSearch} className="max-w-md">
            <div
              className="flex items-center gap-2.5 px-4 py-3 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(124,58,237,0.25)' }}
            >
              <Search className="h-4 w-4 shrink-0" style={{ color: 'rgba(196,181,253,0.5)' }} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search topics, acts, events…"
                className="flex-1 bg-transparent text-sm outline-none"
                style={{ color: '#F0EEFF' }}
              />
            </div>
          </form>
        </div>
      </section>

      {/* ── Results ── */}
      <section style={{ background: '#FFFFFF' }}>
        <div className="max-w-5xl mx-auto px-6 py-14">
          {!initialQuery ? (
            <p className="text-sm text-center py-10" style={{ color: '#9CA3AF' }}>
              Type something to search General Studies articles.
            </p>
          ) : isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="rounded-2xl" style={{ height: 300 }} />)}
            </div>
          ) : isError ? (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 shrink-0" />
              Search failed. Please try again later.
            </div>
          ) : results && results.length > 0 ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#9CA3AF' }}>
                {results.length} result{results.length === 1 ? '' : 's'} for &ldquo;{initialQuery}&rdquo;
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {results.map((article) => (
                  <ArticleListItem key={article.id} article={article} />
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <FileText className="h-8 w-8" style={{ color: '#D1D5DB' }} />
              <p className="text-sm" style={{ color: '#9CA3AF' }}>
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
