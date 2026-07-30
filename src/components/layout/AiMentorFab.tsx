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
      {/* Subtle pulse ring */}
      <span
        className="absolute inset-0 rounded-2xl animate-ping opacity-20 pointer-events-none"
        style={{ background: 'linear-gradient(135deg, #7C3AED, #6D28D9)', animationDuration: '2.5s' }}
      />

      <Link
        href="/ai-mentor"
        className="relative flex items-center gap-2.5 rounded-2xl px-4 py-3 text-white text-sm font-semibold shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl"
        style={{
          background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
          boxShadow: '0 8px 28px rgba(124,58,237,0.45)',
        }}
      >
        <Sparkles className="h-4.5 w-4.5 text-white shrink-0" />
        <span>Ask Remi</span>
      </Link>

      {/* Tooltip */}
      <div className="absolute bottom-full right-0 mb-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none">
        <div className="bg-popover text-popover-foreground border border-border text-[11px] font-semibold px-3 py-1.5 rounded-xl whitespace-nowrap shadow-md">
          Ask anything about your exam
        </div>
        <div className="absolute top-full right-5 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-border" />
      </div>
    </div>
  );
}
