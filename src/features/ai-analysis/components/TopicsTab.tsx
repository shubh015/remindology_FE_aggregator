'use client';

import { useTopics } from '@/features/ai-analysis/hooks/use-topics';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tag, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import type { ContentTabProps } from '@/types/props';
import { useAiLimitStore } from '@/store/use-ai-limit-store';

export function TopicsTab({ contentId }: ContentTabProps) {
  const { topics, isLoading, generate, isGenerating, isGenerateError, generateError } = useTopics(contentId);
  const isAiLimitReached = useAiLimitStore((s) => s.remaining === 0);

  if (isLoading) {
    return (
      <div className="flex flex-wrap gap-2 py-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-7 w-20" />
        ))}
      </div>
    );
  }

  if (Array.isArray(topics) && topics.length > 0) {
    return (
      <div className="py-3">
        <div className="ks-card p-6 space-y-4">
          <h3 className="text-sm font-semibold text-ink flex items-center gap-2">
            <Tag className="h-4 w-4 text-ink" />
            Key UPSC Topics & Categories
          </h3>
          <p className="text-sm text-ink-muted leading-relaxed">
            Concepts identified in your material — click to explore related syllabus associations.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {topics.map((topic) => (
              <Badge
                key={topic.id || topic.name}
                variant="secondary"
                className="px-2.5 py-1 hover:border-ink transition-colors cursor-pointer"
              >
                {topic.name}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center rounded-[2px] border border-dashed border-rule-strong p-8 text-center bg-paper-raised mt-2">
      <div className="flex h-10 w-10 items-center justify-center rounded-[3px] border border-rule bg-paper-deep text-ink mb-4">
        <Tag className="h-5 w-5" />
      </div>
      <h3 className="text-base font-semibold text-ink mb-1.5">No topics extracted yet</h3>
      <p className="text-sm text-ink-muted max-w-xs mb-6 leading-relaxed">
        Extract relevant UPSC keywords, policies, and concepts to build syllabus linkings.
      </p>
      {isGenerateError && (
        <div className="mb-4 flex items-start gap-2 rounded-[2px] bg-[oklch(52%_.16_35/.06)] p-3 text-sm text-[oklch(52%_.16_35)] border border-[oklch(52%_.16_35/.25)] max-w-xs text-left">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>
            {(generateError as { response?: { data?: { message?: string } } })?.response?.data?.message ||
              generateError?.message ||
              'Failed to extract topics.'}
          </span>
        </div>
      )}
      <Button
        onClick={() => generate()}
        disabled={isGenerating || isAiLimitReached}
        className="cursor-pointer text-sm font-semibold gap-2 px-5"
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Extracting Topics…
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            Extract Syllabus Topics
          </>
        )}
      </Button>
      {isAiLimitReached && (
        <p className="font-label text-[11px] text-ink-muted mt-2">Daily AI limit reached · Resets at midnight</p>
      )}
    </div>
  );
}

export default TopicsTab;
