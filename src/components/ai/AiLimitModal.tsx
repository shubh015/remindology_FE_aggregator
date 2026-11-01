'use client';

import { useAiLimitStore } from '@/store/use-ai-limit-store';
import { Zap, X } from 'lucide-react';

export function AiLimitModal() {
  const { showModal, used, limit, resetsAt, hideLimitModal } = useAiLimitStore();

  const resetLabel = resetsAt
    ? new Date(resetsAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
    : 'midnight';

  if (!showModal) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50"
      onClick={hideLimitModal}
    >
      <div
        className="relative w-full max-w-sm rounded-[4px] border border-rule bg-paper-raised p-6 shadow-lift-2"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={hideLimitModal}
          className="absolute top-4 right-4 text-ink-muted hover:text-ink transition-colors cursor-pointer"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center justify-center mb-4">
          <div className="h-12 w-12 rounded-[3px] border border-rule bg-paper-deep flex items-center justify-center">
            <Zap className="h-5 w-5 text-ink" />
          </div>
        </div>

        <h2 className="text-base font-semibold text-ink text-center mb-1">Daily AI limit reached</h2>
        <p className="text-sm text-ink-muted text-center mb-5 leading-relaxed">
          You&apos;ve used all {limit} AI calls for today. Your limit resets at {resetLabel}.
        </p>

        <div className="rounded-[2px] bg-paper-deep border border-rule p-3.5 mb-5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-label text-[10.5px] uppercase tracking-[0.14em] text-ink-muted">Today&apos;s usage</span>
            <span className="font-semibold tabular-nums text-ink">{used} / {limit}</span>
          </div>
          <div className="h-1.5 rounded-full bg-paper-gray overflow-hidden">
            <div
              className="h-full rounded-full bg-ink transition-all duration-500"
              style={{ width: `${limit > 0 ? Math.min((used / limit) * 100, 100) : 100}%` }}
            />
          </div>
        </div>

        <div className="space-y-2.5">
          <a
            href="/pricing"
            className="flex items-center justify-center w-full h-11 rounded-md bg-ink text-sm font-semibold text-paper cursor-pointer transition-colors hover:bg-ink-soft"
          >
            Upgrade for more AI calls
          </a>
          <button
            onClick={hideLimitModal}
            className="w-full h-10 rounded-md text-sm font-medium text-ink-muted hover:text-ink border border-rule-strong hover:border-ink transition-colors cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
