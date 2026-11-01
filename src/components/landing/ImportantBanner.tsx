'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { X, ArrowRight } from 'lucide-react';
import { useImportantArticle } from '@/features/current-affairs/hooks/use-current-affairs';

const DISMISSED_KEY = 'remindology-dismissed-important-ca';
const REVEAL_DELAY_MS = 900;

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
      className={`fixed z-50 left-4 right-4 bottom-4 sm:left-auto sm:right-6 sm:bottom-6 sm:w-full sm:max-w-sm transition-[opacity,translate] duration-200 ease-out ${
        revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 pointer-events-none'
      }`}
    >
      <div className="relative rounded-lg overflow-hidden bg-paper-raised border border-rule shadow-lift-2">
        <div className="p-4 pr-10">
          <p className="eyebrow mb-2">
            <span className="eyebrow-dot" aria-hidden="true" />
            Important Update
          </p>

          <Link
            href={`/current-affairs/${article.id}`}
            className="block text-sm font-semibold leading-snug mb-3 line-clamp-2 text-ink hover:underline underline-offset-2"
          >
            {article.title}
          </Link>
          <Link href={`/current-affairs/${article.id}`} className="btn-ink btn-sm group">
            Read full story
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-150 ease-out group-hover:translate-x-0.5" />
          </Link>
        </div>

        <button
          onClick={dismiss}
          className="absolute top-3 right-3 h-6 w-6 flex items-center justify-center rounded-md text-ink-muted hover:text-ink hover:bg-paper-deep transition-colors duration-150 cursor-pointer"
          aria-label="Dismiss"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

export default ImportantBanner;
