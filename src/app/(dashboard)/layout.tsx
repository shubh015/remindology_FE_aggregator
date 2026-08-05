'use client';

import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Sidebar from '@/components/layout/sidebar';
import { AiMentorFab } from '@/components/layout/AiMentorFab';
import { AiLimitModal } from '@/components/ai/AiLimitModal';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/use-auth-store';
import { authService } from '@/services/auth.service';
import { streakService } from '@/services/streak.service';

// ── Skeleton shown while Zustand rehydrates from localStorage ────────
// Matches the real layout shape so there's no jarring layout shift.

function DashboardSkeleton() {
  return (
    <div className="flex h-screen w-screen bg-background overflow-hidden">
      {/* Sidebar — desktop only */}
      <div className="hidden lg:flex w-64 shrink-0 flex-col border-r border-border bg-card">
        {/* Logo row */}
        <div className="flex h-17 items-center gap-3 px-6 border-b border-border">
          <div className="skeleton h-9 w-9 rounded-xl" />
          <div className="skeleton h-4 w-28 rounded" />
        </div>
        {/* Nav groups */}
        <div className="flex-1 px-4 py-5 space-y-6">
          {[3, 4, 2, 1].map((count, gi) => (
            <div key={gi} className="space-y-1.5">
              <div className="skeleton h-2.5 w-16 rounded mx-3 mb-2.5" />
              {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2.5">
                  <div className="skeleton h-7 w-7 rounded-lg shrink-0" />
                  <div className="skeleton h-3.5 rounded" style={{ width: `${55 + (i % 3) * 15}%` }} />
                </div>
              ))}
            </div>
          ))}
        </div>
        {/* Footer */}
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3 px-3 py-2.5">
            <div className="skeleton h-8 w-8 rounded-full shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="skeleton h-3 w-3/4 rounded" />
              <div className="skeleton h-2.5 w-full rounded" />
            </div>
          </div>
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex h-17 shrink-0 items-center justify-between px-4 md:px-8 border-b border-border bg-card gap-3">
          <div className="flex items-center gap-3">
            <div className="skeleton h-8 w-8 rounded-lg lg:hidden" />
            <div className="skeleton h-4 w-32 rounded hidden sm:block" />
          </div>
          <div className="flex items-center gap-3">
            <div className="skeleton h-8 w-8 rounded-full" />
            <div className="hidden sm:block space-y-1.5">
              <div className="skeleton h-3 w-24 rounded" />
              <div className="skeleton h-2.5 w-32 rounded" />
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 bg-muted/10 p-4 md:p-8 space-y-5 overflow-hidden">
          {/* Page title */}
          <div className="space-y-2">
            <div className="skeleton h-6 w-48 rounded" />
            <div className="skeleton h-3.5 w-72 rounded" />
          </div>
          {/* Stats / cards row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton h-24 rounded-xl" />
            ))}
          </div>
          {/* Main content block */}
          <div className="skeleton h-52 rounded-2xl" />
          {/* Secondary blocks */}
          <div className="grid md:grid-cols-2 gap-3">
            <div className="skeleton h-36 rounded-xl" />
            <div className="skeleton h-36 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  // Fetch /user/me on dashboard load — populates streak + AI usage in one round-trip
  useQuery({
    queryKey: ['user-me'],
    queryFn: async () => {
      const user = await authService.getMe();
      useAuthStore.getState().updateUser(user);
      return user;
    },
    enabled: isAuthenticated && mounted,
    staleTime: 30_000,
    retry: 1,
  });

  // Record streak activity on app open (fire-and-forget)
  useEffect(() => {
    if (mounted && isAuthenticated) {
      streakService.recordActivity().catch(() => undefined);
    }
  }, [mounted, isAuthenticated]);

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

  // Onboarding guard — bounce users without a target exam to /onboarding
  useEffect(() => {
    if (
      mounted &&
      isAuthenticated &&
      user !== null &&
      !user.target_exam &&
      !user.targetExam &&
      pathname !== '/onboarding'
    ) {
      router.replace('/onboarding');
    }
  }, [mounted, isAuthenticated, user, pathname, router]);

  // Show skeleton instead of a blank spinner — matches the real layout shape
  if (!mounted || !isAuthenticated) {
    return <DashboardSkeleton />;
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

      {/* AI daily limit modal */}
      <AiLimitModal />
    </div>
  );
}
