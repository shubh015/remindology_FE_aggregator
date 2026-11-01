import Link from 'next/link';
import { Flame, Trophy, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useDailyChallenge } from '@/features/daily-challenge/hooks/use-daily-challenge';

export function DailyChallengeBanner() {
  const { challenge, isLoading } = useDailyChallenge();

  if (isLoading) {
    return <Skeleton className="h-24 w-full" />;
  }

  const completed = challenge?.alreadyCompleted;
  const score = challenge?.score;

  return (
    <div className="ks-card p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[3px] border border-rule bg-paper-deep text-ink">
            {completed ? <Trophy className="h-5 w-5" /> : <Flame className="h-5 w-5 text-gold-deep" />}
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">Daily Challenge</p>
            {completed ? (
              <p className="text-xs text-ink-muted mt-0.5">
                Today's score: <span className="font-semibold tabular-nums text-ink">{score}/10</span> — Come back tomorrow!
              </p>
            ) : (
              <p className="text-xs text-ink-muted mt-0.5">
                10 fresh questions · Personalised for your weak zones
              </p>
            )}
          </div>
        </div>
        {!completed && (
          <Link href="/daily-challenge">
            <Button size="sm" className="cursor-pointer text-xs font-semibold gap-1.5 h-8 px-3 shrink-0">
              Start <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
