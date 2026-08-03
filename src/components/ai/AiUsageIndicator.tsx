'use client';

import { useAiLimitStore } from '@/store/use-ai-limit-store';
import { Sparkles } from 'lucide-react';

export function AiUsageIndicator() {
  const remaining = useAiLimitStore((s) => s.remaining);
  const limit     = useAiLimitStore((s) => s.limit);

  const styles =
    remaining === 0
      ? 'bg-red-500/10 text-red-600 border-red-500/20'
      : remaining <= 3
      ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
      : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';

  return (
    <span className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border ${styles}`}>
      <Sparkles className="h-3 w-3" />
      {remaining === 0 ? 'No AI calls left' : `${remaining}/${limit} AI`}
    </span>
  );
}
