'use client';

import { useState } from 'react';
import { useMCQs } from '@/features/ai-analysis/hooks/use-mcqs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { HelpCircle, Sparkles, Loader2, AlertCircle, Check, X, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ContentTabProps } from '@/types/props';
import { useAiLimitStore } from '@/store/use-ai-limit-store';

type SelectedAnswers = Record<string, string>;

function DetectivePanel({ wrongExplanations, selected }: {
  wrongExplanations: Record<string, string>;
  selected: string;
}) {
  const [open, setOpen] = useState(false);
  const wrongMsg = wrongExplanations[selected];
  if (!wrongMsg) return null;

  return (
    <div className="rounded-xl border border-amber-500/25 bg-amber-500/6 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-bold text-amber-700 cursor-pointer"
      >
        <span>🔍 Prelims Detective — Why was your choice wrong?</span>
        {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
      </button>
      {open && (
        <div className="px-4 pb-3 border-t border-amber-500/15">
          <p className="text-xs text-muted-foreground leading-relaxed mt-2">{wrongMsg}</p>
        </div>
      )}
    </div>
  );
}

export function MCQsTab({ contentId }: ContentTabProps) {
  const { mcqs, isLoading, generate, isGenerating, isGenerateError, generateError } = useMCQs(contentId);
  const isAiLimitReached = useAiLimitStore((s) => s.remaining === 0);
  const [selectedAnswers, setSelectedAnswers] = useState<SelectedAnswers>({});

  const handleSelectOption = (mcqId: string, option: string) => {
    if (selectedAnswers[mcqId]) return;
    setSelectedAnswers((prev) => ({ ...prev, [mcqId]: option }));
  };

  if (isLoading) {
    return (
      <div className="space-y-4 py-4">
        {[1, 2].map((i) => (
          <div key={i} className="space-y-3 p-6 border border-border rounded-xl bg-card">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (!Array.isArray(mcqs) || mcqs.length === 0) {
    return (
      <div className="flex min-h-[260px] flex-col items-center justify-center rounded-xl border border-dashed border-border p-8 text-center bg-card mt-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
          <HelpCircle className="h-5 w-5" />
        </div>
        <h3 className="text-base font-semibold text-foreground mb-1.5">No practice questions yet</h3>
        <p className="text-sm text-muted-foreground max-w-xs mb-6 leading-relaxed">
          Generate exam-calibrated MCQs with AI-powered explanations for each wrong option.
        </p>
        {isGenerateError && (
          <div className="mb-4 flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20 max-w-xs text-left">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>
              {(generateError as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                generateError?.message || 'Failed to generate MCQs.'}
            </span>
          </div>
        )}
        <Button onClick={() => generate()} disabled={isGenerating || isAiLimitReached} className="cursor-pointer text-sm font-semibold gap-2 rounded-xl px-5">
          {isGenerating ? <><Loader2 className="h-4 w-4 animate-spin" />Generating MCQs…</> : <><Sparkles className="h-4 w-4" />Generate MCQs</>}
        </Button>
        {isAiLimitReached && (
          <p className="text-[11px] text-muted-foreground mt-2">Daily AI limit reached · Resets at midnight</p>
        )}
      </div>
    );
  }

  const answeredCount = Object.keys(selectedAnswers).length;
  const correctCount  = mcqs.filter((m) => selectedAnswers[m.id] === m.correctAnswer).length;

  return (
    <div className="space-y-5 py-3">
      {/* Score bar */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-primary/5 border border-primary/20">
        <div>
          <p className="text-sm font-semibold text-foreground">Interactive Practice Quiz</p>
          <p className="text-xs text-muted-foreground mt-0.5">Answered {answeredCount} of {mcqs.length} · Prelims Detective enabled</p>
        </div>
        <div className="flex items-center gap-4">
          {answeredCount > 0 && (
            <span className="text-sm font-bold text-primary">
              {correctCount} / {answeredCount} ({Math.round((correctCount / answeredCount) * 100)}%)
            </span>
          )}
          {answeredCount > 0 && (
            <Button onClick={() => setSelectedAnswers({})} variant="outline" size="sm" className="h-8 gap-1.5 text-sm font-semibold cursor-pointer rounded-lg">
              <RotateCcw className="h-3.5 w-3.5" />Restart
            </Button>
          )}
        </div>
      </div>

      {/* MCQ list */}
      <div className="grid gap-4">
        {mcqs.map((mcq, idx) => {
          const selected   = selectedAnswers[mcq.id];
          const isAnswered = !!selected;
          const isCorrect  = selected === mcq.correctAnswer;

          return (
            <Card key={mcq.id} className="border-border bg-card shadow-sm overflow-hidden">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-primary uppercase tracking-wider">Question {idx + 1}</span>
                  <Badge variant={mcq.difficulty === 'EASY' ? 'success' : mcq.difficulty === 'MEDIUM' ? 'warning' : 'destructive'} className="text-xs font-semibold">
                    {mcq.difficulty}
                  </Badge>
                </div>

                <p className="text-sm font-semibold text-foreground leading-snug">{mcq.question}</p>

                <div className="grid gap-2">
                  {mcq.options.map((option) => {
                    const isCurrentCorrect  = option === mcq.correctAnswer;
                    const isCurrentSelected = selected === option;
                    let optionStyle = 'border-border hover:bg-secondary/40 text-foreground';
                    let icon: React.ReactNode = null;

                    if (isAnswered) {
                      if (isCurrentCorrect) {
                        optionStyle = 'bg-emerald-500/10 border-emerald-500 text-emerald-700';
                        icon = <Check className="h-4 w-4 text-emerald-500 shrink-0" />;
                      } else if (isCurrentSelected) {
                        optionStyle = 'bg-destructive/10 border-destructive text-destructive';
                        icon = <X className="h-4 w-4 text-destructive shrink-0" />;
                      } else {
                        optionStyle = 'opacity-50 border-border bg-muted/20 text-muted-foreground';
                      }
                    }

                    return (
                      <button
                        key={option}
                        onClick={() => handleSelectOption(mcq.id, option)}
                        disabled={isAnswered}
                        className={cn('w-full flex items-center justify-between text-left p-3 rounded-lg border text-sm font-medium transition-all', !isAnswered && 'cursor-pointer', optionStyle)}
                      >
                        <span>{option}</span>
                        {icon}
                      </button>
                    );
                  })}
                </div>

                {isAnswered && (
                  <div className="space-y-2">
                    {/* Explanation */}
                    <div className={cn('p-4 rounded-lg border text-sm leading-relaxed', isCorrect ? 'bg-emerald-500/6 border-emerald-500/25' : 'bg-muted/50 border-border/80')}>
                      <p className="font-semibold text-foreground mb-1">{isCorrect ? '✓ Correct!' : '✗ Incorrect'}</p>
                      <p className="text-muted-foreground">
                        <span className="font-semibold text-foreground">Explanation: </span>{mcq.explanation}
                      </p>
                    </div>

                    {/* Prelims Detective — wrong option breakdown */}
                    {!isCorrect && mcq.wrongOptionExplanations && (
                      <DetectivePanel wrongExplanations={mcq.wrongOptionExplanations} selected={selected} />
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default MCQsTab;
