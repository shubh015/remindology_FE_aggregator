'use client';

import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function AiMentorFab() {
  const pathname = usePathname();

  // Hide when already on the AI Mentor page
  if (pathname === '/ai-mentor') return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 group">
      <Link
        href="/ai-mentor"
        className="relative flex items-center gap-2.5 rounded-full bg-ink px-4 py-3 text-paper text-sm font-semibold shadow-lift-2 transition-colors duration-200 ease-ks hover:bg-ink-soft"
      >
        <Sparkles className="h-4.5 w-4.5 text-paper shrink-0" />
        <span>Ask Remi</span>
      </Link>

      {/* Tooltip */}
      <div className="absolute bottom-full right-0 mb-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none">
        <div className="bg-paper-raised text-ink border border-rule text-[11px] font-medium px-3 py-1.5 rounded-[3px] whitespace-nowrap shadow-lift-2">
          Ask anything about your exam
        </div>
        <div className="absolute top-full right-5 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-rule-strong" />
      </div>
    </div>
  );
}
