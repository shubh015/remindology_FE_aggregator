'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Zap, X, ArrowRight } from 'lucide-react';
import { useImportantArticle } from '@/features/current-affairs/hooks/use-current-affairs';

const DISMISSED_KEY = 'remindology-dismissed-important-ca';
const REVEAL_DELAY_MS = 900;

const BRAND_GRAD = 'linear-gradient(135deg, #7C3AED, #C026D3)';
const TEXT_GRAD_LT = {
  background: BRAND_GRAD,
  WebkitBackgroundClip: 'text' as const,
  WebkitTextFillColor: 'transparent',
};

export function ImportantBanner() {
  const { data: article } = useImportantArticle();
  const [dismissedId, setDismissedId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reading localStorage requires the client-only effect
      setDismissedId(localStorage.getItem(DISMISSED_KEY));
    } catch {
      // ignore — private window / blocked storage, card just won't remember dismissal
    }
    setHydrated(true);
  }, []);

  // Slight delay before sliding in — feels like a notification arriving, not a layout element popping.
  useEffect(() => {
    if (!hydrated) return;
    const timer = setTimeout(() => setRevealed(true), REVEAL_DELAY_MS);
    return () => clearTimeout(timer);
  }, [hydrated]);

  const show = hydrated && !!article && article.id !== dismissedId;

  const dismiss = () => {
    if (!article) return;
    try {
      localStorage.setItem(DISMISSED_KEY, article.id);
    } catch {
      // ignore
    }
    setDismissedId(article.id);
  };

  if (!show) return null;

  return (
    <div
      className={`fixed z-50 left-4 right-4 bottom-4 sm:left-auto sm:right-6 sm:bottom-6 sm:w-full sm:max-w-sm transition-all duration-500 ease-out ${
        revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 pointer-events-none'
      }`}
    >
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: '#FFFFFF',
          border: '1px solid rgba(124,58,237,0.14)',
          boxShadow: '0 20px 48px rgba(32,18,77,0.18), 0 2px 8px rgba(32,18,77,0.08)',
        }}
      >
        <div className="h-1" style={{ background: BRAND_GRAD }} />

        <div className="p-4 pr-10">
          <div className="flex items-center gap-2 mb-2">
            <div
              className="h-6 w-6 rounded-full flex items-center justify-center shrink-0"
              style={{ background: BRAND_GRAD }}
            >
              <Zap className="h-3 w-3 text-white" fill="white" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-wider" style={TEXT_GRAD_LT}>
              Important Update
            </p>
          </div>

          <Link href={`/current-affairs/${article.id}`} className="block group">
            <p className="text-sm font-bold leading-snug mb-2 line-clamp-2" style={{ color: '#1A1836' }}>
              {article.title}
            </p>
            <span
              className="inline-flex items-center gap-1 text-xs font-semibold"
              style={TEXT_GRAD_LT}
            >
              Read full story
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" style={{ color: '#C026D3' }} />
            </span>
          </Link>
        </div>

        <button
          onClick={dismiss}
          className="absolute top-3 right-3 h-6 w-6 flex items-center justify-center rounded-full text-muted-foreground hover:bg-black/5 transition-colors cursor-pointer"
          aria-label="Dismiss"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

export default ImportantBanner;
