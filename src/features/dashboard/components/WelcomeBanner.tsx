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
    <div
      className="relative rounded-2xl overflow-hidden p-5"
      style={{ background: 'linear-gradient(135deg, #3B0764 0%, #6D28D9 50%, #7C3AED 100%)' }}
    >
      {/* Dot grid */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }} />
      {/* Corner glow */}
      <div className="absolute -top-10 -right-10 w-56 h-56 pointer-events-none rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(167,139,250,0.2) 0%, transparent 70%)' }} />

      <div className="relative flex items-start justify-between gap-4">

        {/* Left */}
        <div className="flex flex-col gap-2.5 min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 shrink-0">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.65)' }}>{greeting}</span>
          </div>

          <h2 className="text-[1.6rem] font-bold text-white leading-tight">
            {user?.name?.split(' ')[0] || 'Aspirant'}
          </h2>

          {/* Tags row */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: 'rgba(52,211,153,0.2)', color: '#6EE7B7' }}>
              <Brain className="h-3 w-3" />
              AI Engine Active
            </span>
            {examLabel && (
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.85)' }}>
                🎯 {examLabel}
              </span>
            )}
            {!isLoading && recentCount > 0 && (
              <span className="flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.75)' }}>
                <TrendingUp className="h-3 w-3" />
                {recentCount} new this week
              </span>
            )}
          </div>

          {/* Sub-line */}
          <p className="text-[13px] mt-0.5" style={{ color: 'rgba(255,255,255,0.6)' }}>
            {total === 0
              ? 'Upload your first material to unlock your AI study kit.'
              : `You've indexed ${total} material${total === 1 ? '' : 's'} — keep the momentum going.`}
          </p>
        </div>

        {/* Right – progress ring */}
        {isLoading ? (
          <Skeleton className="h-24 w-24 rounded-full shrink-0" style={{ background: 'rgba(255,255,255,0.1)' }} />
        ) : total === 0 ? (
          <div className="shrink-0 flex flex-col items-center justify-center w-[88px] h-[88px] rounded-2xl gap-2"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
            <Upload className="h-6 w-6" style={{ color: 'rgba(255,255,255,0.45)' }} />
            <span className="text-[9px] font-semibold text-center leading-tight" style={{ color: 'rgba(255,255,255,0.45)' }}>Upload to<br/>begin</span>
          </div>
        ) : (
          <div className="relative shrink-0 flex items-center justify-center w-[96px] h-[96px]">
            {/* Outer glow ring */}
            <div className="absolute inset-0 rounded-full" style={{ background: 'rgba(167,139,250,0.15)', filter: 'blur(10px)' }} />
            <svg width={96} height={96} style={{ transform: 'rotate(-90deg)' }}>
              <circle cx={48} cy={48} r={38} fill="none" strokeWidth={6} stroke="rgba(255,255,255,0.12)" />
              <circle cx={48} cy={48} r={38} fill="none" strokeWidth={6}
                stroke="white"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.7s ease' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[1.25rem] font-bold text-white leading-none">{completionRate}%</span>
              <span className="text-[9px] font-semibold mt-0.5" style={{ color: 'rgba(255,255,255,0.55)' }}>AI Ready</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
