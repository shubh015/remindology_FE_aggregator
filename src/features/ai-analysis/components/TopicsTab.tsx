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
          <Skeleton key={i} className="h-7 w-20 rounded-full" />
        ))}
      </div>
    );
  }

  if (Array.isArray(topics) && topics.length > 0) {
    return (
      <div className="py-3">
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-4">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Tag className="h-4 w-4 text-primary" />
            Key UPSC Topics & Categories
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Concepts identified in your material — click to explore related syllabus associations.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {topics.map((topic) => (
              <Badge
                key={topic.id || topic.name}
                variant="secondary"
                className="text-sm px-3 py-1 bg-primary/5 text-primary border-primary/20 hover:bg-primary/10 transition-colors cursor-pointer"
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
    <div className="flex min-h-[260px] flex-col items-center justify-center rounded-xl border border-dashed border-border p-8 text-center bg-card mt-2">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
        <Tag className="h-5 w-5" />
      </div>
      <h3 className="text-base font-semibold text-foreground mb-1.5">No topics extracted yet</h3>
      <p className="text-sm text-muted-foreground max-w-xs mb-6 leading-relaxed">
        Extract relevant UPSC keywords, policies, and concepts to build syllabus linkings.
      </p>
      {isGenerateError && (
        <div className="mb-4 flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20 max-w-xs text-left">
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
        className="cursor-pointer text-sm font-semibold gap-2 rounded-xl px-5"
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
        <p className="text-[11px] text-muted-foreground mt-2">Daily AI limit reached · Resets at midnight</p>
      )}
    </div>
  );
}

export default TopicsTab;
