'use client';

import { useState, useRef, useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useDailyChallenge } from '@/features/daily-challenge/hooks/use-daily-challenge';
import {
  Flame, Trophy, CheckCircle2, XCircle, AlertCircle,
  RotateCcw, ChevronRight, ChevronLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ChallengeMCQ } from '@/types/features';
import { QuestionText } from '@/components/mcq/QuestionText';
import { ExplanationText } from '@/components/mcq/ExplanationText';
import { Confetti } from '@/components/ui/confetti';

// ── Constants ───────────────────────────────────────────────────────

const DIFF_VARIANT: Record<string, 'success' | 'warning' | 'destructive'> = {
  EASY: 'success', MEDIUM: 'warning', HARD: 'destructive',
};

const ADVANCE_MS = 1100;

// ── Submitting overlay ────────────────────────────────────────────

function SubmittingOverlay() {
  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-6">
        <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10">
          <Trophy className="h-10 w-10 text-primary" style={{ animation: 'trophyTada 1.2s ease-in-out infinite' }} />
        </div>
        <div>
          <p className="text-base font-bold text-foreground text-center mb-1">Evaluating your answers…</p>
          <p className="text-xs text-muted-foreground text-center">Hang tight, calculating your score</p>
        </div>
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <span key={i} className="h-2 w-2 rounded-full bg-primary"
              style={{ animation: `pulseDot 0.9s ease-in-out ${i * 0.18}s infinite` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Circular score ring + animated counter ─────────────────────────

function ScoreDisplay({ score, total }: { score: number; total: number }) {
  const [displayed, setDisplayed] = useState(0);
  const pct       = Math.round((score / total) * 100);
  const ringColor = pct >= 70 ? '#10B981' : pct >= 40 ? '#F59E0B' : '#EF4444';
  const textColor = pct >= 70 ? 'text-emerald-500' : pct >= 40 ? 'text-amber-500' : 'text-red-500';
  const emoji     = pct >= 80 ? '🏆' : pct >= 60 ? '⭐' : pct >= 40 ? '💪' : '📚';

  useEffect(() => {
    if (displayed >= score) return;
    const delay = score <= 3 ? 350 : score <= 6 ? 250 : 180;
    const t = setTimeout(() => setDisplayed((d) => Math.min(d + 1, score)), delay);
    return () => clearTimeout(t);
  }, [displayed, score]);

  const radius        = 50;
  const circumference = 2 * Math.PI * radius;
  const offset         = circumference * (1 - pct / 100);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative flex items-center justify-center" style={{ width: 128, height: 128 }}>
        <svg width={128} height={128} viewBox="0 0 128 128" className="absolute inset-0 -rotate-90">
          <circle cx={64} cy={64} r={radius} fill="none" strokeWidth={9} stroke="currentColor" className="text-secondary" />
          <circle
            cx={64} cy={64} r={radius} fill="none" strokeWidth={9} strokeLinecap="round"
            stroke={ringColor}
            strokeDasharray={circumference}
            style={{
              strokeDashoffset: circumference,
              animation: 'ringFill 1.2s cubic-bezier(0.22,1,0.36,1) 0.35s forwards',
              '--ring-target': offset,
            } as React.CSSProperties}
          />
        </svg>
        <div className="relative flex flex-col items-center">
          <span className="text-2xl mb-0.5" style={{ animation: 'scorePop 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.15s both' }}>
            {emoji}
          </span>
          <div className="flex items-end gap-0.5">
            <span className={cn('text-4xl font-black tabular-nums', textColor)}>{displayed}</span>
            <span className="text-base font-bold text-muted-foreground mb-0.5">/{total}</span>
          </div>
        </div>
      </div>
      <span className="text-sm font-semibold text-muted-foreground">{pct}% accuracy</span>
    </div>
  );
}

// ── Progress dots ─────────────────────────────────────────────────

function ProgressDots({ total, current, answers, mcqIds }: {
  total: number; current: number; answers: Record<string, string>; mcqIds: string[];
}) {
  return (
    <div className="flex items-center justify-center gap-1.5 flex-wrap">
      {Array.from({ length: total }, (_, i) => {
        const isAnswered = !!answers[mcqIds[i]];
        const isCurrent  = i === current;
        return (
          <span
            key={i}
            className={cn(
              'rounded-full transition-all duration-300',
              isCurrent ? 'w-5 h-2.5 bg-primary' : isAnswered ? 'w-2.5 h-2.5 bg-primary/50' : 'w-2.5 h-2.5 bg-border',
            )}
          />
        );
      })}
    </div>
  );
}

// ── Single QuizCard — answer stays editable until submission ───────

function QuizCard({ mcq, selected, onSelect, dir }: {
  mcq: ChallengeMCQ;
  selected?: string;
  onSelect: (option: string) => void;
  dir: 'forward' | 'back';
}) {
  const [justPicked, setJustPicked] = useState<string | null>(null);

  const handleClick = (opt: string) => {
    if (opt === selected) return;
    setJustPicked(opt);
    onSelect(opt);
  };

  const flipAnim = dir === 'forward'
    ? 'cardFlipInRight 0.45s cubic-bezier(0.22,1,0.36,1) both'
    : 'cardFlipInLeft 0.45s cubic-bezier(0.22,1,0.36,1) both';

  return (
    <div style={{ perspective: '1200px' }}>
      <div
        className="rounded-2xl border border-border bg-card p-5 space-y-4"
        style={{ animation: flipAnim, transformStyle: 'preserve-3d' }}
      >
        <Badge variant={DIFF_VARIANT[mcq.difficulty] ?? 'warning'} className="text-[10px]">
          {mcq.difficulty}
        </Badge>

        <QuestionText text={mcq.question} introClassName="text-sm font-semibold text-foreground leading-snug" />

        <div className="grid gap-2">
          {mcq.options.map((opt) => {
            const isSelected = selected === opt;
            const isJustPicked = justPicked === opt;

            return (
              <button
                key={opt}
                onClick={() => handleClick(opt)}
                className={cn(
                  'relative w-full text-left px-4 py-3 rounded-xl border text-sm font-medium overflow-hidden',
                  'transition-all duration-200 cursor-pointer hover:scale-[1.006] active:scale-[0.995]',
                  isSelected
                    ? 'border-primary bg-primary/10 text-primary shadow-sm'
                    : 'border-border text-foreground hover:border-primary/30 hover:bg-primary/5',
                )}
                style={isJustPicked ? { animation: 'optionPop 0.4s cubic-bezier(0.34,1.56,0.64,1)' } : undefined}
              >
                {/* One-shot light sweep on selection */}
                {isJustPicked && (
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-y-0 left-0 w-1/3"
                    style={{
                      background: 'linear-gradient(115deg, transparent, rgba(124,58,237,0.35), transparent)',
                      animation: 'shimmerSweep 0.55s ease-out',
                    }}
                  />
                )}
                <span className="relative flex items-center justify-between gap-2">
                  <span>{opt}</span>
                  {isSelected && (
                    <CheckCircle2
                      className="h-4 w-4 shrink-0 text-primary"
                      style={{ animation: 'checkPop 0.35s cubic-bezier(0.34,1.56,0.64,1) both' }}
                    />
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Results screen ────────────────────────────────────────────────

function ResultsScreen({ result }: {
  result: {
    score: number; total: number;
    results: {
      mcqId: string; question: string; isCorrect: boolean;
      selectedAnswer: string; correctAnswer: string; explanation: string;
      wrongOptionExplanations?: Record<string, string>;
    }[];
  };
}) {
  const [visibleCount, setVisibleCount] = useState(0);
  const pct           = Math.round((result.score / result.total) * 100);
  const isGreat        = pct >= 70;
  const confettiCount = 20 + Math.round((result.score / result.total) * 50);

  useEffect(() => {
    if (visibleCount >= result.results.length) return;
    const t = setTimeout(() => setVisibleCount((c) => c + 1), 130);
    return () => clearTimeout(t);
  }, [visibleCount, result.results.length]);

  return (
    <div className="space-y-6">
      <Confetti count={confettiCount} />

      {/* Score card */}
      <div
        className="rounded-2xl border border-border bg-card p-8 flex flex-col items-center gap-3 text-center overflow-hidden relative"
        style={{ animation: 'slideUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) both' }}
      >
        {isGreat && (
          <div className="absolute inset-0 opacity-20 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at 50% 20%, #7C3AED 0%, transparent 65%)' }} />
        )}
        <div
          className={cn('relative flex h-14 w-14 items-center justify-center rounded-2xl', isGreat ? 'bg-primary/15' : 'bg-muted')}
          style={{ animation: 'trophyTada 0.9s cubic-bezier(0.36, 0.07, 0.19, 0.97) 0.3s both' }}
        >
          <Trophy className={cn('h-7 w-7', isGreat ? 'text-primary' : 'text-muted-foreground')} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">
            {isGreat ? 'Excellent work!' : pct >= 40 ? 'Good effort!' : 'Keep practising!'}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">Challenge complete · Review your answers below</p>
        </div>
        <ScoreDisplay score={result.score} total={result.total} />
      </div>

      {/* Per-question breakdown */}
      <div className="space-y-3">
        {result.results.map((r, idx) => (
          <div
            key={r.mcqId}
            className={cn('rounded-2xl border p-4 space-y-2',
              r.isCorrect ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-red-500/30 bg-red-500/5')}
            style={{
              opacity: idx < visibleCount ? 1 : 0,
              animation: idx < visibleCount ? 'resultSlide 0.35s cubic-bezier(0.22, 1, 0.36, 1) both' : undefined,
            }}
          >
            <div className="flex items-start gap-2">
              <div style={{ animation: idx < visibleCount ? 'checkPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) 0.15s both' : undefined }}>
                {r.isCorrect
                  ? <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  : <XCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />}
              </div>
              <div className="flex items-start gap-1 min-w-0">
                <span className="text-sm font-semibold text-foreground shrink-0">Q{idx + 1}.</span>
                <QuestionText text={r.question} introClassName="text-sm font-semibold text-foreground leading-snug" />
              </div>
            </div>
            {!r.isCorrect && (
              <div className="pl-6 space-y-1">
                <p className="text-xs text-red-600 font-medium">Your answer: {r.selectedAnswer}</p>
                <p className="text-xs text-emerald-700 font-medium">Correct: {r.correctAnswer}</p>
              </div>
            )}
            <div className="pl-6">
              <ExplanationText text={r.explanation} />
            </div>
            {!r.isCorrect && r.wrongOptionExplanations?.[r.selectedAnswer] && (
              <div className="pl-6 mt-1 rounded-lg bg-amber-500/8 border border-amber-500/20 px-3 py-2">
                <p className="text-[11px] font-semibold text-amber-700 mb-0.5">Why your answer was wrong:</p>
                <p className="text-xs text-muted-foreground">{r.wrongOptionExplanations[r.selectedAnswer]}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────

export default function DailyChallengePage() {
  const { challenge, isLoading, isError, submit, isSubmitting, result, isSubmitted } = useDailyChallenge();
  const [answers, setAnswers]       = useState<Record<string, string>>({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [dir, setDir]               = useState<'forward' | 'back'>('forward');
  const autoAdvRef                  = useRef<ReturnType<typeof setTimeout> | null>(null);

  const mcqs          = challenge?.mcqs ?? [];
  const currentMCQ     = mcqs[currentIdx];
  const isLast         = currentIdx === mcqs.length - 1;
  const isFirstQ       = currentIdx === 0;
  const isAnswered     = currentMCQ ? !!answers[currentMCQ.id] : false;
  const answeredCount  = Object.keys(answers).length;
  const allAnswered    = answeredCount === mcqs.length;

  const clearAutoAdv = () => {
    if (autoAdvRef.current) { clearTimeout(autoAdvRef.current); autoAdvRef.current = null; }
  };

  useEffect(() => clearAutoAdv, []);

  const goNext = () => {
    clearAutoAdv();
    setDir('forward');
    setCurrentIdx((i) => Math.min(i + 1, mcqs.length - 1));
  };

  const goPrev = () => {
    clearAutoAdv();
    setDir('back');
    setCurrentIdx((i) => Math.max(i - 1, 0));
  };

  const handleSelect = (mcqId: string, option: string) => {
    clearAutoAdv();
    setAnswers((prev) => ({ ...prev, [mcqId]: option }));
    if (!isLast) {
      autoAdvRef.current = setTimeout(() => {
        setDir('forward');
        setCurrentIdx((i) => Math.min(i + 1, mcqs.length - 1));
        autoAdvRef.current = null;
      }, ADVANCE_MS);
    }
  };

  const handleSubmit = () => {
    if (!challenge) return;
    clearAutoAdv();
    submit({ challengeId: challenge.challengeId, answers });
  };

  return (
    <div className="flex-1 flex flex-col">
      <Header title="Daily Challenge" />

      {isSubmitting && <SubmittingOverlay />}

      <div className="flex-1 p-6 sm:p-8 max-w-2xl w-full mx-auto">

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        ) : isError ? (
          <div className="flex items-center gap-2 rounded-xl bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>Failed to load today's challenge. Please try again later.</span>
          </div>
        ) : challenge?.alreadyCompleted && !isSubmitted ? (
          <div className="flex flex-col items-center justify-center gap-4 py-16 text-center"
            style={{ animation: 'slideUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) both' }}>
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
              <Trophy className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Already Crushed It!</h2>
            <p className="text-sm text-muted-foreground">
              Today's score: <span className="font-bold text-emerald-600">{challenge.score}/10</span>
            </p>
            <p className="text-xs text-muted-foreground">Come back tomorrow for a fresh challenge.</p>
          </div>
        ) : isSubmitted && result ? (
          <ResultsScreen result={result} />
        ) : currentMCQ ? (
          /* ── One-question-at-a-time quiz ── */
          <div className="flex flex-col gap-4">

            {/* Header row: flame + counter + dots */}
            <div className="flex flex-col gap-3" style={{ animation: 'slideUp 0.3s cubic-bezier(0.22, 1, 0.36, 1) both' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-primary" />
                  <span className="text-sm font-bold text-foreground">Daily Challenge</span>
                </div>
                <span className="text-xs font-semibold text-muted-foreground tabular-nums">
                  {currentIdx + 1} <span className="text-border">/ {mcqs.length}</span>
                </span>
              </div>

              <ProgressDots
                total={mcqs.length}
                current={currentIdx}
                answers={answers}
                mcqIds={mcqs.map((m) => m.id)}
              />

              {/* Thin progress bar with a subtle moving shimmer */}
              <div className="relative h-1 w-full rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500 ease-out relative overflow-hidden"
                  style={{ width: `${((currentIdx + (isAnswered ? 1 : 0)) / mcqs.length) * 100}%` }}
                >
                  <span
                    className="absolute inset-0"
                    style={{
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
                      backgroundSize: '200% 100%',
                      animation: 'shimmerSubmit 1.8s linear infinite',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Question card — key forces remount → flip animation replays each question */}
            <div key={currentIdx} className="min-h-70">
              <QuizCard
                mcq={currentMCQ}
                selected={answers[currentMCQ.id]}
                onSelect={(opt) => handleSelect(currentMCQ.id, opt)}
                dir={dir}
              />
            </div>

            {/* Auto-advance countdown — cancel by picking a different option */}
            {isAnswered && !isLast && (
              <div key={`${currentMCQ.id}-${answers[currentMCQ.id]}`} className="space-y-1.5 -mt-1">
                <div className="h-0.5 w-full rounded-full bg-secondary overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ animation: `countdownBar ${ADVANCE_MS}ms linear forwards` }} />
                </div>
                <p className="text-center text-[11px] text-muted-foreground/70">
                  Advancing… tap another option to change your answer
                </p>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={goPrev}
                disabled={isFirstQ}
                className="gap-1.5 text-sm font-semibold rounded-xl cursor-pointer"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Back
              </Button>

              <div className="flex-1" />

              {isLast ? (
                <Button
                  onClick={handleSubmit}
                  disabled={!allAnswered || isSubmitting}
                  className="gap-1.5 text-sm font-semibold rounded-xl cursor-pointer px-5"
                >
                  {isSubmitting
                    ? <><RotateCcw className="h-3.5 w-3.5 animate-spin" />Submitting…</>
                    : <>Submit Challenge <ChevronRight className="h-3.5 w-3.5" /></>}
                </Button>
              ) : (
                <Button
                  variant={isAnswered ? 'default' : 'outline'}
                  size="sm"
                  onClick={goNext}
                  disabled={!isAnswered}
                  className="gap-1.5 text-sm font-semibold rounded-xl cursor-pointer"
                >
                  Next <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>

            {/* Hints */}
            {!isAnswered && (
              <p className="text-center text-xs text-muted-foreground/60" style={{ animation: 'slideUp 0.4s ease 0.2s both' }}>
                Select an answer to continue
              </p>
            )}
            {isLast && allAnswered && (
              <p className="text-center text-xs text-emerald-600 font-semibold" style={{ animation: 'slideUp 0.4s ease both' }}>
                All questions answered — tap any option to change, then submit when ready!
              </p>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
