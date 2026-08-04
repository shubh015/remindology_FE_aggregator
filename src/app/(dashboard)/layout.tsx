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

      {/* AI daily limit modal */}
      <AiLimitModal />
    </div>
  );
}
