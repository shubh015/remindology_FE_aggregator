'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useDailyChallenge } from '@/features/daily-challenge/hooks/use-daily-challenge';
import { Flame, Trophy, CheckCircle2, XCircle, AlertCircle, RotateCcw, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ChallengeMCQ } from '@/types/features';

const DIFF_VARIANT: Record<string, 'success' | 'warning' | 'destructive'> = {
  EASY: 'success', MEDIUM: 'warning', HARD: 'destructive',
};

function ScoreBadge({ score, total }: { score: number; total: number }) {
  const pct = Math.round((score / total) * 100);
  const color = pct >= 70 ? 'text-emerald-600' : pct >= 40 ? 'text-amber-600' : 'text-red-600';
  return (
    <div className="flex flex-col items-center gap-1">
      <span className={`text-5xl font-bold ${color}`}>{score}<span className="text-2xl text-muted-foreground">/{total}</span></span>
      <span className="text-sm text-muted-foreground font-medium">{pct}% accuracy</span>
    </div>
  );
}

function QuizCard({ mcq, index, selected, onSelect }: {
  mcq: ChallengeMCQ;
  index: number;
  selected?: string;
  onSelect: (option: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-primary uppercase tracking-wider">Q {index + 1}</span>
        <Badge variant={DIFF_VARIANT[mcq.difficulty] ?? 'warning'} className="text-[10px]">
          {mcq.difficulty}
        </Badge>
      </div>
      <p className="text-sm font-semibold text-foreground leading-snug">{mcq.question}</p>
      <div className="grid gap-2">
        {mcq.options.map((opt) => (
          <button
            key={opt}
            onClick={() => !selected && onSelect(opt)}
            disabled={!!selected}
            className={cn(
              'w-full text-left px-4 py-2.5 rounded-xl border text-sm font-medium transition-all',
              !selected && 'cursor-pointer hover:bg-secondary/50 hover:border-primary/30 border-border',
              selected === opt && 'border-primary bg-primary/10 text-primary cursor-default',
              selected && selected !== opt && 'opacity-40 border-border bg-muted/20 cursor-default',
            )}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function DailyChallengePage() {
  const { challenge, isLoading, isError, submit, isSubmitting, result, isSubmitted } = useDailyChallenge();
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleSelect = (mcqId: string, option: string) => {
    setAnswers((prev) => ({ ...prev, [mcqId]: option }));
  };

  const handleSubmit = () => {
    if (!challenge) return;
    submit({ challengeId: challenge.challengeId, answers });
  };

  const answeredCount = Object.keys(answers).length;
  const total = challenge?.mcqs.length ?? 10;

  return (
    <div className="flex-1 flex flex-col">
      <Header title="Daily Challenge" />

      <div className="flex-1 p-6 sm:p-8 max-w-3xl w-full mx-auto space-y-6">

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full rounded-xl" />
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-40 w-full rounded-2xl" />)}
          </div>
        ) : isError ? (
          <div className="flex items-center gap-2 rounded-xl bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>Failed to load today's challenge. Please try again later.</span>
          </div>
        ) : challenge?.alreadyCompleted && !isSubmitted ? (
          /* Already completed today */
          <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
              <Trophy className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Challenge Complete!</h2>
            <p className="text-sm text-muted-foreground">
              Today's score: <span className="font-bold text-emerald-600">{challenge.score}/10</span>
            </p>
            <p className="text-xs text-muted-foreground">Come back tomorrow for a fresh challenge.</p>
          </div>
        ) : isSubmitted && result ? (
          /* Results screen */
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-8 flex flex-col items-center gap-3 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Trophy className="h-7 w-7" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Challenge Complete!</h2>
              <ScoreBadge score={result.score} total={result.total} />
            </div>

            <div className="space-y-3">
              {result.results.map((r, idx) => (
                <div key={r.mcqId} className={cn(
                  'rounded-2xl border p-4 space-y-2',
                  r.isCorrect ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-red-500/30 bg-red-500/5'
                )}>
                  <div className="flex items-start gap-2">
                    {r.isCorrect
                      ? <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      : <XCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />}
                    <p className="text-sm font-semibold text-foreground leading-snug">Q{idx + 1}. {r.question}</p>
                  </div>
                  {!r.isCorrect && (
                    <div className="pl-6 space-y-1">
                      <p className="text-xs text-red-600 font-medium">Your answer: {r.selectedAnswer}</p>
                      <p className="text-xs text-emerald-700 font-medium">Correct: {r.correctAnswer}</p>
                    </div>
                  )}
                  <p className="pl-6 text-xs text-muted-foreground leading-relaxed">{r.explanation}</p>
                  {!r.isCorrect && r.wrongOptionExplanations && r.wrongOptionExplanations[r.selectedAnswer] && (
                    <div className="pl-6 mt-1 rounded-lg bg-amber-500/8 border border-amber-500/20 px-3 py-2">
                      <p className="text-[11px] font-semibold text-amber-700 mb-0.5">Why your answer was wrong:</p>
                      <p className="text-xs text-muted-foreground">{r.wrongOptionExplanations[r.selectedAnswer]}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Quiz interface */
          <div className="space-y-4">
            {/* Progress bar */}
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-bold text-foreground">Today's Challenge</p>
                  <p className="text-xs text-muted-foreground">{answeredCount}/{total} answered</p>
                </div>
              </div>
              <Button
                onClick={handleSubmit}
                disabled={answeredCount < total || isSubmitting}
                size="sm"
                className="cursor-pointer h-9 gap-1.5 text-sm font-semibold rounded-xl"
              >
                {isSubmitting ? 'Submitting…' : <>Submit <ChevronRight className="h-3.5 w-3.5" /></>}
              </Button>
            </div>

            {/* Progress track */}
            <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${(answeredCount / total) * 100}%` }}
              />
            </div>

            {challenge?.mcqs.map((mcq, idx) => (
              <QuizCard
                key={mcq.id}
                mcq={mcq}
                index={idx}
                selected={answers[mcq.id]}
                onSelect={(opt) => handleSelect(mcq.id, opt)}
              />
            ))}

            {answeredCount === total && (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full cursor-pointer font-semibold text-sm h-11 rounded-xl gap-2"
              >
                {isSubmitting ? <><RotateCcw className="h-4 w-4 animate-spin" />Evaluating…</> : <>Submit Challenge <ChevronRight className="h-4 w-4" /></>}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
