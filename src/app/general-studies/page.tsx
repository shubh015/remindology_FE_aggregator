'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, ArrowRight, BookOpen, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useGSSubjects } from '@/features/general-studies/hooks/use-general-studies';
import { ACTIVE_SUBJECT_SLUGS } from '@/features/general-studies/constants';

// ── Design tokens (matching current-affairs public pages) ─────────

const GS_CONFIG: Record<string, { color: string; bg: string; border: string; label: string }> = {
  GS1: { color: '#7C3AED', bg: 'rgba(124,58,237,0.1)', border: 'rgba(124,58,237,0.25)', label: 'GS1 · Indian Heritage & Society' },
  GS2: { color: '#0891B2', bg: 'rgba(8,145,178,0.1)',  border: 'rgba(8,145,178,0.25)',  label: 'GS2 · Polity & International' },
  GS3: { color: '#059669', bg: 'rgba(5,150,105,0.1)',  border: 'rgba(5,150,105,0.25)',  label: 'GS3 · Economy & Environment' },
  GS4: { color: '#DC2626', bg: 'rgba(220,38,38,0.1)',  border: 'rgba(220,38,38,0.25)',  label: 'GS4 · Ethics & Integrity' },
};

function SubjectSkeleton() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Skeleton key={i} className="h-28 rounded-2xl" />
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
      <section className="relative overflow-hidden bg-background">
        <div
          className="absolute pointer-events-none"
          style={{ top: 0, right: '-8%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(138,106,18,0.06) 0%, transparent 68%)' }}
        />

        <div className="relative max-w-7xl mx-auto px-6 pt-14 pb-16">
          <div className="inline-flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full mb-4 bg-primary/8 border border-primary/18 text-primary">
            <BookOpen className="h-3.5 w-3.5" />
            General Studies
          </div>
          <h1 className="tracking-tight mb-4">
            <span className="block font-semibold text-muted-foreground mb-1" style={{ fontSize: 'clamp(0.9rem, 1.8vw, 1.05rem)' }}>
              All 4 GS papers, AI-written
            </span>
            <span className="block font-black text-foreground" style={{ fontSize: 'var(--text-display-md)', lineHeight: 1.05, letterSpacing: '-0.01em' }}>
              Master every <span className="text-primary">GS subject</span>
            </span>
          </h1>
          <p className="text-sm max-w-xl mb-8 text-muted-foreground">
            AI-written notes covering all 4 GS papers — structured for UPSC, SSC &amp; State PSC preparation.
          </p>

          <form onSubmit={handleSearch} className="max-w-md">
            <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-white border border-border">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search topics, acts, events…"
                className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </form>
        </div>
      </section>

      {/* ── Subjects ── */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-6 py-14 space-y-10">
          {isLoading ? (
            <SubjectSkeleton />
          ) : isError ? (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 shrink-0" />
              Could not load subjects. Please try again later.
            </div>
          ) : (
            paperOrder.map((paper) => {
              const cfg = GS_CONFIG[paper];
              return (
                <div key={paper} className="space-y-4">
                  <h2 className="text-xs font-black uppercase tracking-widest" style={{ color: cfg.color }}>
                    {cfg.label}
                  </h2>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {grouped[paper]!.map((subject) => {
                      const isActive = ACTIVE_SUBJECT_SLUGS.has(subject.slug);

                      if (!isActive) {
                        return (
                          <div
                            key={subject.id}
                            aria-disabled="true"
                            className="rounded-2xl bg-white p-5 cursor-not-allowed border border-border opacity-55"
                          >
                            <p className="font-bold mb-1.5 text-muted-foreground" style={{ fontSize: '1rem' }}>
                              {subject.name}
                            </p>
                            <span className="inline-flex items-center text-[11px] font-bold px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                              Coming Soon
                            </span>
                          </div>
                        );
                      }

                      return (
                        <Link
                          key={subject.id}
                          href={`/general-studies/${subject.slug}`}
                          className="group rounded-2xl bg-white p-5 transition-all hover:-translate-y-0.5"
                          style={{ border: `1px solid ${cfg.border}`, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
                        >
                          <p className="font-bold mb-1.5 text-foreground" style={{ fontSize: '1rem' }}>
                            {subject.name}
                          </p>
                          <span
                            className="inline-flex items-center gap-1 text-xs font-semibold transition-colors"
                            style={{ color: cfg.color }}
                          >
                            Explore topics
                            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                          </span>
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
