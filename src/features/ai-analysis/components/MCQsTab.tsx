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
import { QuestionText } from '@/components/mcq/QuestionText';
import { ExplanationText } from '@/components/mcq/ExplanationText';

type SelectedAnswers = Record<string, string>;

function DetectivePanel({ wrongExplanations, selected }: {
  wrongExplanations: Record<string, string>;
  selected: string;
}) {
  const [open, setOpen] = useState(false);
  const wrongMsg = wrongExplanations[selected];
  if (!wrongMsg) return null;

  return (
    <div className="rounded-[2px] border border-gold/55 bg-gold/10 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-ink cursor-pointer"
      >
        <span>🔍 Prelims Detective — Why was your choice wrong?</span>
        {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
      </button>
      {open && (
        <div className="px-4 pb-3 border-t border-gold/30">
          <p className="text-xs text-ink-soft leading-relaxed mt-2">{wrongMsg}</p>
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
          <div key={i} className="space-y-3 p-6 ks-card">
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
      <div className="flex min-h-65 flex-col items-center justify-center rounded-[2px] border border-dashed border-rule-strong p-8 text-center bg-paper-raised mt-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-[3px] border border-rule bg-paper-deep text-ink mb-4">
          <HelpCircle className="h-5 w-5" />
        </div>
        <h3 className="text-base font-semibold text-ink mb-1.5">No practice questions yet</h3>
        <p className="text-sm text-ink-muted max-w-xs mb-6 leading-relaxed">
          Generate exam-calibrated MCQs with AI-powered explanations for each wrong option.
        </p>
        {isGenerateError && (
          <div className="mb-4 flex items-start gap-2 rounded-[2px] bg-[oklch(52%_.16_35/.06)] p-3 text-sm text-[oklch(52%_.16_35)] border border-[oklch(52%_.16_35/.25)] max-w-xs text-left">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>
              {(generateError as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                generateError?.message || 'Failed to generate MCQs.'}
            </span>
          </div>
        )}
        <Button onClick={() => generate()} disabled={isGenerating || isAiLimitReached} className="cursor-pointer text-sm font-semibold gap-2 px-5">
          {isGenerating ? <><Loader2 className="h-4 w-4 animate-spin" />Generating MCQs…</> : <><Sparkles className="h-4 w-4" />Generate MCQs</>}
        </Button>
        {isAiLimitReached && (
          <p className="font-label text-[11px] text-ink-muted mt-2">Daily AI limit reached · Resets at midnight</p>
        )}
      </div>
    );
  }

  const answeredCount = Object.keys(selectedAnswers).length;
  const correctCount  = mcqs.filter((m) => selectedAnswers[m.id] === m.correctAnswer).length;

  return (
    <div className="space-y-5 py-3">
      {/* Score bar */}
      <div className="flex items-center justify-between p-4 ks-card bg-paper-deep">
        <div>
          <p className="text-sm font-semibold text-ink">Interactive Practice Quiz</p>
          <p className="font-label text-[11px] text-ink-muted mt-0.5">Answered {answeredCount} of {mcqs.length} · Prelims Detective enabled</p>
        </div>
        <div className="flex items-center gap-4">
          {answeredCount > 0 && (
            <span className="text-sm font-semibold tabular-nums text-ink">
              {correctCount} / {answeredCount} ({Math.round((correctCount / answeredCount) * 100)}%)
            </span>
          )}
          {answeredCount > 0 && (
            <Button onClick={() => setSelectedAnswers({})} variant="outline" size="sm" className="h-8 gap-1.5 text-sm font-medium cursor-pointer">
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
            <Card key={mcq.id} className="overflow-hidden">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-label text-[11px] font-medium text-ink-muted uppercase tracking-[0.14em]">Question {idx + 1}</span>
                  <Badge variant={mcq.difficulty === 'EASY' ? 'success' : mcq.difficulty === 'MEDIUM' ? 'warning' : 'destructive'} >
                    {mcq.difficulty}
                  </Badge>
                </div>

                <QuestionText text={mcq.question} />

                <div className="grid gap-2.5">
                  {mcq.options.map((option, optIdx) => {
                    const letter = String.fromCharCode(65 + optIdx); // A B C D
                    const isCurrentCorrect  = option === mcq.correctAnswer;
                    const isCurrentSelected = selected === option;

                    let wrapStyle    = 'border-rule bg-paper-raised hover:border-rule-strong hover:bg-paper-deep text-ink-soft';
                    let badgeStyle   = 'bg-paper-deep text-ink-muted border-rule';
                    let icon: React.ReactNode = null;

                    if (isAnswered) {
                      if (isCurrentCorrect) {
                        wrapStyle  = 'bg-paper-deep border-ink text-ink';
                        badgeStyle = 'bg-ink text-paper border-ink';
                        icon = <Check className="h-4 w-4 text-ink shrink-0" />;
                      } else if (isCurrentSelected) {
                        wrapStyle  = 'bg-[oklch(52%_.16_35/.06)] border-[oklch(52%_.16_35/.6)] text-[oklch(52%_.16_35)]';
                        badgeStyle = 'bg-[oklch(52%_.16_35)] text-paper border-[oklch(52%_.16_35)]';
                        icon = <X className="h-4 w-4 text-[oklch(52%_.16_35)] shrink-0" />;
                      } else {
                        wrapStyle  = 'opacity-45 border-rule bg-paper-deep text-ink-muted';
                        badgeStyle = 'bg-paper-gray text-ink-muted border-rule';
                      }
                    }

                    return (
                      <button
                        key={option}
                        onClick={() => handleSelectOption(mcq.id, option)}
                        disabled={isAnswered}
                        className={cn(
                          'w-full flex items-center gap-3 text-left px-3.5 py-3 rounded-[3px] border transition-colors duration-150 ease-ks',
                          !isAnswered && 'cursor-pointer',
                          wrapStyle,
                        )}
                      >
                        <span className={cn(
                          'flex h-7 w-7 shrink-0 items-center justify-center rounded-[3px] border font-label text-xs font-semibold transition-colors',
                          badgeStyle,
                        )}>
                          {letter}
                        </span>
                        <span className="flex-1 text-sm font-medium leading-snug">{option}</span>
                        {icon}
                      </button>
                    );
                  })}
                </div>

                {isAnswered && (
                  <div className="space-y-2">
                    {/* Explanation */}
                    <div className={cn('p-4 rounded-[2px] border text-sm leading-relaxed space-y-2', isCorrect ? 'bg-paper-deep border-rule-strong' : 'bg-paper-deep border-rule')}>
                      <p className={cn('font-semibold', isCorrect ? 'text-ink' : 'text-[oklch(52%_.16_35)]')}>{isCorrect ? '✓ Correct!' : '✗ Incorrect'}</p>
                      <ExplanationText text={mcq.explanation} className="text-sm text-ink-soft leading-relaxed" />
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
