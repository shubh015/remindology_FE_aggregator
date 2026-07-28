'use client';

import { useMnemonics } from '@/features/ai-analysis/hooks/use-mnemonics';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Lightbulb, Sparkles, Loader2, AlertCircle, Brain } from 'lucide-react';
import type { ContentTabProps } from '@/types/props';

const TYPE_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  pattern:      { bg: 'bg-amber-500/10',   text: 'text-amber-600',   label: 'Pattern'      },
  acronym:      { bg: 'bg-violet-500/10',  text: 'text-violet-600',  label: 'Acronym'      },
  story:        { bg: 'bg-rose-500/10',    text: 'text-rose-600',    label: 'Story'        },
  association:  { bg: 'bg-sky-500/10',     text: 'text-sky-600',     label: 'Association'  },
  visualization:{ bg: 'bg-emerald-500/10', text: 'text-emerald-600', label: 'Visualization'},
};

function typeStyle(type: string) {
  return TYPE_COLORS[type.toLowerCase()] ?? { bg: 'bg-primary/10', text: 'text-primary', label: type };
}

export function MnemonicsTab({ contentId }: ContentTabProps) {
  const { mnemonics, isLoading, generate, isGenerating, isGenerateError, generateError } = useMnemonics(contentId);

  if (isLoading) {
    return (
      <div className="space-y-4 py-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl border border-border p-5 space-y-3">
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
      <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-border p-8 text-center bg-card mt-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-500 mb-4">
          <Brain className="h-5 w-5" />
        </div>
        <h3 className="text-base font-semibold text-foreground mb-1.5">No memory tricks yet</h3>
        <p className="text-sm text-muted-foreground max-w-xs mb-6 leading-relaxed">
          Generate AI-crafted mnemonics, patterns, and memory tricks for the hardest facts in this content.
        </p>
        {isGenerateError && (
          <div className="mb-4 flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20 max-w-xs text-left">
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
          disabled={isGenerating}
          className="cursor-pointer text-sm font-semibold gap-2 rounded-xl px-5 bg-amber-500 hover:bg-amber-600 text-white"
        >
          {isGenerating ? (
            <><Loader2 className="h-4 w-4 animate-spin" />Generating tricks…</>
          ) : (
            <><Sparkles className="h-4 w-4" />Generate Memory Tricks</>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 py-3">
      <div className="flex items-center gap-2">
        <Lightbulb className="h-4 w-4 text-amber-500" />
        <span className="text-sm font-semibold text-foreground">
          {mnemonics.length} Memory Trick{mnemonics.length !== 1 ? 's' : ''}
        </span>
        <span className="text-xs text-muted-foreground">— AI-crafted for fast recall</span>
      </div>

      <div className="space-y-3">
        {mnemonics.map((m, idx) => {
          const style = typeStyle(m.type);
          return (
            <div
              key={idx}
              className="rounded-2xl border border-border bg-card overflow-hidden hover:shadow-sm transition-shadow"
            >
              {/* Amber accent top */}
              <div className="h-[3px] bg-linear-to-r from-amber-400 via-yellow-300 to-lime-400" />
              <div className="p-5">
                {/* Type badge + fact */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <p className="text-[13px] text-muted-foreground leading-snug flex-1">
                    <span className="font-semibold text-foreground">Fact: </span>{m.fact}
                  </p>
                  <span className={`shrink-0 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${style.bg} ${style.text}`}>
                    {style.label}
                  </span>
                </div>
                {/* Mnemonic */}
                <div className="flex items-start gap-2.5 rounded-xl bg-amber-500/6 border border-amber-500/15 p-3.5">
                  <span className="text-amber-500 mt-0.5 shrink-0">💡</span>
                  <p className="text-[13px] font-medium text-foreground leading-relaxed">{m.mnemonic}</p>
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
