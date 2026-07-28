'use client';

import { useSummary } from '@/features/ai-analysis/hooks/use-summary';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import type { ContentTabProps } from '@/types/props';

export function SummaryTab({ contentId }: ContentTabProps) {
  const { data, isLoading, generate, isGenerating, isGenerateError, generateError } = useSummary(contentId);

  if (isLoading) {
    return (
      <div className="space-y-4 py-4">
        <Skeleton className="h-5 w-1/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    );
  }

  if (data?.summary) {
    return (
      <div className="py-3">
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
            <FileText className="h-4 w-4 text-primary" />
            AI Executive Summary
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {data.summary}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center rounded-xl border border-dashed border-border p-8 text-center bg-card mt-2">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
        <Sparkles className="h-5 w-5 animate-pulse" />
      </div>
      <h3 className="text-base font-semibold text-foreground mb-1.5">No summary generated yet</h3>
      <p className="text-sm text-muted-foreground max-w-xs mb-6 leading-relaxed">
        Let AI analyse your study material and extract a concise executive summary.
      </p>
      {isGenerateError && (
        <div className="mb-4 flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20 max-w-xs text-left">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>
            {(generateError as { response?: { data?: { message?: string } } })?.response?.data?.message ||
              generateError?.message ||
              'Failed to generate summary.'}
          </span>
        </div>
      )}
      <Button
        onClick={() => generate()}
        disabled={isGenerating}
        className="cursor-pointer text-sm font-semibold gap-2 rounded-xl px-5"
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Generating Summary…
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            Generate AI Summary
          </>
        )}
      </Button>
    </div>
  );
}

export default SummaryTab;
