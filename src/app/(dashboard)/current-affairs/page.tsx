'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useTodaysCurrentAffairs } from '@/features/current-affairs/hooks/use-current-affairs';
import { Newspaper, ChevronDown, ChevronUp, ExternalLink, AlertCircle, BookOpen, Tag } from 'lucide-react';
import type { CurrentAffairsArticle } from '@/types/features';

const GS_COLORS: Record<string, string> = {
  GS1: 'bg-violet-500/10 text-violet-600',
  GS2: 'bg-sky-500/10 text-sky-600',
  GS3: 'bg-emerald-500/10 text-emerald-600',
  GS4: 'bg-rose-500/10 text-rose-600',
};

function ArticleCard({ article }: { article: CurrentAffairsArticle }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden hover:shadow-md transition-all duration-200">
      {/* Gradient accent */}
      <div className="h-[3px] bg-linear-to-r from-sky-400 via-cyan-400 to-teal-500" />

      <div className="p-5">
        {/* Source + date */}
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">{article.sourceName}</span>
            <span className="text-muted-foreground/40">·</span>
            {article.publishedDate && (
              <span className="text-[11px] text-muted-foreground">
                {new Date(article.publishedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </span>
            )}
          </div>
          <a
            href={article.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground/50 hover:text-primary transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        {/* Title */}
        <h3 className="text-[15px] font-semibold text-foreground leading-snug mb-3">{article.title}</h3>

        {/* GS tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {article.gsPaperTags.map((tag) => (
            <span key={tag} className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${GS_COLORS[tag] ?? 'bg-muted text-muted-foreground'}`}>
              {tag}
            </span>
          ))}
          {article.topicTags.slice(0, 2).map((tag) => (
            <span key={tag} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-secondary text-muted-foreground flex items-center gap-1">
              <Tag className="h-2.5 w-2.5" />{tag}
            </span>
          ))}
        </div>

        {/* Summary */}
        <p className="text-sm text-muted-foreground leading-relaxed">{article.summary}</p>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 mt-3 text-xs font-semibold text-primary cursor-pointer hover:underline"
        >
          {expanded ? <><ChevronUp className="h-3.5 w-3.5" />Show less</> : <><ChevronDown className="h-3.5 w-3.5" />Key facts & Mains angle</>}
        </button>

        {expanded && (
          <div className="mt-4 space-y-4">
            {/* Key facts */}
            {article.keyFacts.length > 0 && (
              <div className="rounded-xl bg-secondary/50 border border-border p-4">
                <p className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-primary" />Key Facts
                </p>
                <ul className="space-y-1.5">
                  {article.keyFacts.map((fact, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed">
                      <span className="text-primary font-bold mt-0.5 shrink-0">·</span>{fact}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Mains angle */}
            {article.mainsAngle && (
              <div className="rounded-xl bg-primary/5 border border-primary/20 p-4">
                <p className="text-xs font-bold text-primary mb-1.5">Mains Angle</p>
                <p className="text-xs text-foreground leading-relaxed">{article.mainsAngle}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CurrentAffairsPage() {
  const { data: articles, isLoading, isError } = useTodaysCurrentAffairs();

  return (
    <div className="flex-1 flex flex-col">
      <Header title="Current Affairs" />

      <div className="flex-1 p-6 sm:p-8 max-w-3xl w-full mx-auto space-y-5">

        {/* Date header */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600">
            <Newspaper className="h-4.5 w-4.5" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">Today's Digest</p>
            <p className="text-xs text-muted-foreground">
              {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          {!isLoading && articles && (
            <Badge variant="secondary" className="ml-auto text-xs font-semibold">
              {articles.length} article{articles.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-2xl border border-border overflow-hidden">
                <div className="h-[3px] bg-muted" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-5 w-4/5" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="flex items-center gap-2 rounded-xl bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>Could not load current affairs. The pipeline may still be processing — check back shortly.</span>
          </div>
        ) : !articles || articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border p-12 text-center gap-3">
            <Newspaper className="h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm font-semibold text-foreground">No articles for today yet</p>
            <p className="text-xs text-muted-foreground">The AI pipeline runs every day at 6 AM IST. Check back soon.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
