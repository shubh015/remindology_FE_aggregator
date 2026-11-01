'use client';

import { Sparkles, TrendingUp, Brain, Upload } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { TARGET_EXAM_LABELS } from '@/types/auth';
import type { User } from '@/types/auth';

interface WelcomeBannerProps {
  user: User | null;
  completionRate: number;
  recentCount: number;
  total: number;
  isLoading: boolean;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export function WelcomeBanner({ user, completionRate, recentCount, total, isLoading }: WelcomeBannerProps) {
  const greeting = getGreeting();
  const examLabel = user?.target_exam ? TARGET_EXAM_LABELS[user.target_exam] : null;
  const circumference = 2 * Math.PI * 38;
  const offset = circumference - (Math.min(completionRate, 100) / 100) * circumference;

  return (
    <div className="flex items-start justify-between gap-4 border-b border-rule pb-5">

      {/* Left */}
      <div className="flex flex-col gap-2 min-w-0 flex-1">
        <h2 className="flex items-center gap-2 text-2xl font-semibold text-ink leading-tight">
          <Sparkles className="h-5 w-5 text-ink shrink-0" />
          <span className="min-w-0">
            {greeting}, {user?.name?.split(' ')[0] || 'Aspirant'}
          </span>
        </h2>

        {/* Sub-line */}
        <p className="text-sm text-ink-muted">
          {total === 0
            ? 'Upload your first material to unlock your AI study kit.'
            : `You've indexed ${total} material${total === 1 ? '' : 's'} — keep the momentum going.`}
        </p>

        {/* Tags row */}
        <div className="flex flex-wrap items-center gap-2 mt-1">
          <span className="ks-tag">
            <Brain className="h-3 w-3" />
            AI Engine Active
          </span>
          {examLabel && (
            <span className="ks-tag ks-tag-outline">
              🎯 {examLabel}
            </span>
          )}
          {!isLoading && recentCount > 0 && (
            <span className="ks-tag ks-tag-gold">
              <TrendingUp className="h-3 w-3" />
              {recentCount} new this week
            </span>
          )}
        </div>
      </div>

      {/* Right – progress ring */}
      {isLoading ? (
        <Skeleton className="h-24 w-24 rounded-full shrink-0" />
      ) : total === 0 ? (
        <div className="shrink-0 flex flex-col items-center justify-center w-[88px] h-[88px] rounded-[2px] gap-2 border border-dashed border-rule-strong bg-paper-deep">
          <Upload className="h-6 w-6 text-ink-muted" />
          <span className="font-label text-[9px] uppercase tracking-[0.1em] text-center leading-tight text-ink-muted">Upload to<br/>begin</span>
        </div>
      ) : (
        <div className="relative shrink-0 flex items-center justify-center w-[96px] h-[96px]">
          <svg width={96} height={96} style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={48} cy={48} r={38} fill="none" strokeWidth={6} stroke="var(--color-paper-gray)" />
            <circle cx={48} cy={48} r={38} fill="none" strokeWidth={6}
              stroke="var(--color-ink)"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.7s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[1.25rem] font-semibold tabular-nums text-ink leading-none">{completionRate}%</span>
            <span className="font-label text-[9px] uppercase tracking-[0.1em] mt-1 text-ink-muted">AI Ready</span>
          </div>
        </div>
      )}
    </div>
  );
}
