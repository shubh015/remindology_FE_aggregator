'use client';

import { useAiLimitStore } from '@/store/use-ai-limit-store';
import { Sparkles } from 'lucide-react';

export function AiUsageIndicator() {
  const remaining = useAiLimitStore((s) => s.remaining);
  const limit     = useAiLimitStore((s) => s.limit);

  const variant =
    remaining === 0
      ? 'ks-tag-alert'
      : remaining <= 3
      ? 'ks-tag-gold'
      : 'ks-tag-outline';

  return (
    <span className={`ks-tag ${variant}`}>
      <Sparkles className="h-3 w-3" />
      {remaining === 0 ? 'No AI calls left' : `${remaining}/${limit} AI`}
    </span>
  );}
