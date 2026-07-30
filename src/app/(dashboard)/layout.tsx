'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/layout/sidebar';
import { AiMentorFab } from '@/components/layout/AiMentorFab';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/use-auth-store';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Sync client-side check with middleware state
  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.replace('/login');
    }
  }, [mounted, isAuthenticated, router]);

  if (!mounted || !isAuthenticated) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-xs text-muted-foreground font-medium animate-pulse">Loading workspace...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main workspace container — no left pad on mobile, full pad on lg+ */}
      <div className="lg:pl-64 flex-1 flex flex-col min-h-screen min-w-0">
        <main className="flex-1 flex flex-col bg-muted/10 min-w-0 overflow-x-hidden">
          {children}
        </main>
      </div>

      {/* AI Mentor — always one click away */}
      <AiMentorFab />
    </div>
  );
}
