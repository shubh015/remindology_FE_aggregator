'use client';

import Link from 'next/link';
import { Flame, Newspaper, PenLine, CalendarDays, Milestone, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useDailyChallenge } from '@/features/daily-challenge/hooks/use-daily-challenge';
import { cn } from '@/lib/utils';

const ACTIONS = [
  {
    href: '/daily-challenge',
    icon: Flame,
    title: 'Daily Challenge',
    isDailyChallenge: true,
  },
  {
    href: '/current-affairs',
    icon: Newspaper,
    title: 'Current Affairs',
    isDailyChallenge: false,
  },
  {
    href: '/mains',
    icon: PenLine,
    title: 'Answer Writing',
    isDailyChallenge: false,
  },
  {
    href: '/study-plan',
    icon: CalendarDays,
    title: '30-Day Plan',
    isDailyChallenge: false,
  },
  {
    href: '/revision-trail',
    icon: Milestone,
    title: 'Revision Trail',
    isDailyChallenge: false,
  },
] as const;

export function QuickActions() {
  const { challenge } = useDailyChallenge();
  const completed = challenge?.alreadyCompleted;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {ACTIONS.map((action) => {
        const Icon = action.icon;
        const showCheck = action.isDailyChallenge && completed;

        return (
          <Link
            key={action.href}
            href={action.href}
            className={cn(
              'ks-card group flex items-center gap-3 px-4 py-3.5 cursor-pointer',
            )}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[3px] border border-rule bg-paper-deep">
              <Icon className="h-4 w-4 text-ink" />
            </div>

            <span className="flex-1 min-w-0 text-[13px] font-semibold text-ink truncate">
              {action.title}
            </span>

            {showCheck ? (
              <CheckCircle2 className="h-4 w-4 text-ink shrink-0" />
            ) : (
              <ArrowRight className="h-4 w-4 text-ink-faint group-hover:text-ink transition-colors shrink-0" />
            )}
          </Link>
        );
      })}
    </div>
  );
}
