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
    color: '#F97316',
    glow: 'rgba(249,115,22,0.1)',
    border: 'hover:border-orange-400/40',
    isDailyChallenge: true,
  },
  {
    href: '/current-affairs',
    icon: Newspaper,
    title: 'Current Affairs',
    color: '#0EA5E9',
    glow: 'rgba(14,165,233,0.1)',
    border: 'hover:border-sky-400/40',
    isDailyChallenge: false,
  },
  {
    href: '/mains',
    icon: PenLine,
    title: 'Answer Writing',
    color: '#10B981',
    glow: 'rgba(16,185,129,0.1)',
    border: 'hover:border-emerald-400/40',
    isDailyChallenge: false,
  },
  {
    href: '/study-plan',
    icon: CalendarDays,
    title: '30-Day Plan',
    color: '#6366F1',
    glow: 'rgba(99,102,241,0.1)',
    border: 'hover:border-indigo-400/40',
    isDailyChallenge: false,
  },
  {
    href: '/revision-trail',
    icon: Milestone,
    title: 'Revision Trail',
    color: '#8B5CF6',
    glow: 'rgba(139,92,246,0.1)',
    border: 'hover:border-violet-400/40',
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
              'group flex items-center gap-3 px-4 py-3.5 rounded-2xl border border-border bg-card',
              'hover:bg-secondary/40 hover:shadow-sm transition-all duration-150 cursor-pointer',
              action.border,
            )}
          >
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
              style={{ background: action.glow }}
            >
              <Icon className="h-[18px] w-[18px]" style={{ color: action.color }} />
            </div>

            <span className="flex-1 min-w-0 text-[13px] font-semibold text-foreground truncate">
              {action.title}
            </span>

            {showCheck ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            ) : (
              <ArrowRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary transition-colors shrink-0" />
            )}
          </Link>
        );
      })}
    </div>
  );
}
