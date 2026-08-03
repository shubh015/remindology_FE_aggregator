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
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
      onClick={hideLimitModal}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={hideLimitModal}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center justify-center mb-4">
          <div
            className="h-14 w-14 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)' }}
          >
            <Zap className="h-6 w-6 text-primary" />
          </div>
        </div>

        <h2 className="text-base font-bold text-foreground text-center mb-1">Daily AI limit reached</h2>
        <p className="text-sm text-muted-foreground text-center mb-5 leading-relaxed">
          You&apos;ve used all {limit} AI calls for today. Your limit resets at {resetLabel}.
        </p>

        <div className="rounded-xl bg-secondary/60 border border-border p-3.5 mb-5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-foreground">Today&apos;s usage</span>
            <span className="font-bold text-primary">{used} / {limit}</span>
          </div>
          <div className="h-2 rounded-full bg-border overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${limit > 0 ? Math.min((used / limit) * 100, 100) : 100}%` }}
            />
          </div>
        </div>

        <div className="space-y-2.5">
          <a
            href="/pricing"
            className="flex items-center justify-center w-full h-11 rounded-xl text-sm font-bold text-white cursor-pointer transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #C026D3)' }}
          >
            Upgrade for more AI calls
          </a>
          <button
            onClick={hideLimitModal}
            className="w-full h-10 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground border border-border hover:bg-secondary/50 transition-all cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
