'use client';

import { useSummary } from '@/features/ai-analysis/hooks/use-summary';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import type { ContentTabProps } from '@/types/props';
import { useAiLimitStore } from '@/store/use-ai-limit-store';

export function SummaryTab({ contentId }: ContentTabProps) {
  const { data, isLoading, generate, isGenerating, isGenerateError, generateError } = useSummary(contentId);
  const isAiLimitReached = useAiLimitStore((s) => s.remaining === 0);

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
        <div className="ks-card p-6">
          <h3 className="font-label text-[11px] font-medium uppercase tracking-[0.14em] text-ink-muted flex items-center gap-2 mb-4">
            <FileText className="h-3.5 w-3.5 text-ink" />
            AI Executive Summary
          </h3>
          <div className="doc-prose whitespace-pre-wrap">
            {data.summary}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center rounded-[2px] border border-dashed border-rule-strong p-8 text-center bg-paper-raised mt-2">
      <div className="flex h-10 w-10 items-center justify-center rounded-[3px] border border-rule bg-paper-deep text-ink mb-4">
        <Sparkles className="h-5 w-5" />
      </div>
      <h3 className="text-base font-semibold text-ink mb-1.5">No summary generated yet</h3>
      <p className="text-sm text-ink-muted max-w-xs mb-6 leading-relaxed">
        Let AI analyse your study material and extract a concise executive summary.
      </p>
      {isGenerateError && (
        <div className="mb-4 flex items-start gap-2 rounded-[2px] bg-[oklch(52%_.16_35/.06)] p-3 text-sm text-[oklch(52%_.16_35)] border border-[oklch(52%_.16_35/.25)] max-w-xs text-left">
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
        disabled={isGenerating || isAiLimitReached}
        className="cursor-pointer text-sm font-semibold gap-2 px-5"
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
      {isAiLimitReached && (
        <p className="font-label text-[11px] text-ink-muted mt-2">Daily AI limit reached · Resets at midnight</p>
      )}
    </div>
  );
}

export default SummaryTab;
