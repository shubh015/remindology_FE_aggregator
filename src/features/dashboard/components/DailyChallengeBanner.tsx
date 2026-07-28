import Link from 'next/link';
import { Flame, Trophy, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useDailyChallenge } from '@/features/daily-challenge/hooks/use-daily-challenge';

export function DailyChallengeBanner() {
  const { challenge, isLoading } = useDailyChallenge();

  if (isLoading) {
    return <Skeleton className="h-24 w-full rounded-xl" />;
  }

  const completed = challenge?.alreadyCompleted;
  const score = challenge?.score;

  return (
    <div className="relative rounded-xl overflow-hidden border border-primary/20 bg-linear-to-br from-primary/8 via-violet-500/5 to-transparent p-5">
      {/* Decorative glow */}
      <div className="absolute right-4 top-4 opacity-10">
        <Flame className="h-16 w-16 text-primary" />
      </div>

      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
            {completed ? <Trophy className="h-5 w-5" /> : <Flame className="h-5 w-5" />}
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">Daily Challenge</p>
            {completed ? (
              <p className="text-xs text-muted-foreground mt-0.5">
                Today's score: <span className="font-bold text-emerald-600">{score}/10</span> — Come back tomorrow!
              </p>
            ) : (
              <p className="text-xs text-muted-foreground mt-0.5">
                10 fresh questions · Personalised for your weak zones
              </p>
            )}
          </div>
        </div>
        {!completed && (
          <Link href="/daily-challenge">
            <Button size="sm" className="cursor-pointer text-xs font-semibold gap-1.5 h-8 rounded-xl px-3 shrink-0">
              Start <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
