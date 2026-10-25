'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/use-auth-store';
import { Logo } from '@/components/landing/Logo';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, needsOnboarding, postAuthRedirect, setPostAuthRedirect } = useAuthStore();

  // Redirect authenticated users — fires after Zustand rehydrates from localStorage.
  // The app-shell fade-in (0.28s) covers the brief flash for returning users.
  useEffect(() => {
    if (isAuthenticated) {
      if (needsOnboarding) {
        router.replace('/onboarding');
      } else {
        const dest = postAuthRedirect || '/dashboard';
        setPostAuthRedirect(null);
        router.replace(dest);
      }
    }
  }, [isAuthenticated, needsOnboarding, postAuthRedirect, setPostAuthRedirect, router]);

  return (
    <div className="relative flex min-h-screen items-center justify-center p-6 overflow-hidden bg-background">

      {/* Quiet accent wash — matches the rest of the public site's hero treatment */}
      <div className="absolute pointer-events-none"
        style={{ top: '-10%', right: '-5%', width: 480, height: 480, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(138,106,18,0.06) 0%, transparent 68%)' }} />

      <div className="relative w-full max-w-sm space-y-6">
        {/* Brand */}
        <div className="flex flex-col items-center space-y-2 text-center">
          <Link href="/" className="mb-1 inline-flex">
            <Logo size={40} />
          </Link>
          <p className="text-xs text-muted-foreground">
            AI study tool for every exam &amp; every student
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
