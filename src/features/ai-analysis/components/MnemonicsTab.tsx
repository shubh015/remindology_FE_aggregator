'use client';

import { useMnemonics } from '@/features/ai-analysis/hooks/use-mnemonics';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Lightbulb, Sparkles, Loader2, AlertCircle, Brain } from 'lucide-react';
import type { ContentTabProps } from '@/types/props';
import { useAiLimitStore } from '@/store/use-ai-limit-store';

// All mnemonic types share one neutral tag style — they differ by label only.
const TYPE_LABELS: Record<string, { label: string }> = {
  pattern:      { label: 'Pattern'      },
  acronym:      { label: 'Acronym'      },
  story:        { label: 'Story'        },
  association:  { label: 'Association'  },
  visualization:{ label: 'Visualization'},
};

function typeStyle(type: string) {
  return TYPE_LABELS[type.toLowerCase()] ?? { label: type };
}

export function MnemonicsTab({ contentId }: ContentTabProps) {
  const { mnemonics, isLoading, generate, isGenerating, isGenerateError, generateError } = useMnemonics(contentId);
  const isAiLimitReached = useAiLimitStore((s) => s.remaining === 0);

  if (isLoading) {
    return (
      <div className="space-y-4 py-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="ks-card p-5 space-y-3">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
          </div>
        ))}
      </div>
    );
  }

  if (!Array.isArray(mnemonics) || mnemonics.length === 0) {
    return (
      <div className="flex min-h-[280px] flex-col items-center justify-center rounded-[2px] border border-dashed border-rule-strong p-8 text-center bg-paper-raised mt-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-[3px] border border-rule bg-paper-deep text-ink mb-4">
          <Brain className="h-5 w-5" />
        </div>
        <h3 className="text-base font-semibold text-ink mb-1.5">No memory tricks yet</h3>
        <p className="text-sm text-ink-muted max-w-xs mb-6 leading-relaxed">
          Generate AI-crafted mnemonics, patterns, and memory tricks for the hardest facts in this content.
        </p>
        {isGenerateError && (
          <div className="mb-4 flex items-start gap-2 rounded-[2px] bg-[oklch(52%_.16_35/.06)] p-3 text-sm text-[oklch(52%_.16_35)] border border-[oklch(52%_.16_35/.25)] max-w-xs text-left">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>
              {(generateError as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                (generateError as Error)?.message ||
                'Failed to generate memory tricks.'}
            </span>
          </div>
        )}
        <Button
          onClick={() => generate()}
          disabled={isGenerating || isAiLimitReached}
          className="cursor-pointer text-sm font-semibold gap-2 px-5"
        >
          {isGenerating ? (
            <><Loader2 className="h-4 w-4 animate-spin" />Generating tricks…</>
          ) : (
            <><Sparkles className="h-4 w-4" />Generate Memory Tricks</>
          )}
        </Button>
        {isAiLimitReached && (
          <p className="font-label text-[11px] text-ink-muted mt-2">Daily AI limit reached · Resets at midnight</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4 py-3">
      <div className="flex items-center gap-2">
        <Lightbulb className="h-4 w-4 text-ink" />
        <span className="text-sm font-semibold text-ink">
          {mnemonics.length} Memory Trick{mnemonics.length !== 1 ? 's' : ''}
        </span>
        <span className="text-xs text-ink-muted">— AI-crafted for fast recall</span>
      </div>

      <div className="space-y-3">
        {mnemonics.map((m, idx) => {
          const style = typeStyle(m.type);
          return (
            <div
              key={idx}
              className="ks-card is-interactive"
            >
              <div className="p-5">
                {/* Type badge + fact */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <p className="text-[13px] text-ink-muted leading-snug flex-1">
                    <span className="font-semibold text-ink">Fact: </span>{m.fact}
                  </p>
                  <span className="ks-tag shrink-0">
                    {style.label}
                  </span>
                </div>
                {/* Mnemonic */}
                <div className="flex items-start gap-2.5 rounded-[2px] bg-paper-deep border border-rule border-l-2 border-l-gold p-3.5">
                  <span className="mt-0.5 shrink-0">💡</span>
                  <p className="text-[13px] font-medium text-ink leading-relaxed">{m.mnemonic}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MnemonicsTab;
