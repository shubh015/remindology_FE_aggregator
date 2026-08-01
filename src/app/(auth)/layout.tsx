'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/use-auth-store';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, needsOnboarding, postAuthRedirect, setPostAuthRedirect } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Single redirect controller — fires once when the user becomes authenticated
  useEffect(() => {
    if (mounted && isAuthenticated) {
      if (needsOnboarding) {
        router.replace('/onboarding');
      } else {
        const dest = postAuthRedirect || '/dashboard';
        setPostAuthRedirect(null);
        router.replace(dest);
      }
    }
  }, [mounted, isAuthenticated, needsOnboarding, postAuthRedirect, setPostAuthRedirect, router]);

  if (!mounted || isAuthenticated) {
    return (
      <div className="flex h-screen w-screen items-center justify-center"
        style={{ background: '#09091F' }}>
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-t-transparent"
          style={{ borderColor: 'rgba(167,139,250,0.4)', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center p-6 overflow-hidden"
      style={{ background: '#09091F' }}>

      {/* Dot grid */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle, rgba(167,139,250,0.1) 1px, transparent 1px)', backgroundSize: '36px 36px' }} />

      {/* Glow orbs */}
      <div className="absolute pointer-events-none"
        style={{ top: '-10%', right: '-5%', width: 480, height: 480, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.22) 0%, transparent 68%)' }} />
      <div className="absolute pointer-events-none"
        style={{ bottom: '-8%', left: '-8%', width: 380, height: 380, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(192,38,211,0.14) 0%, transparent 68%)' }} />

      <div className="relative w-full max-w-sm space-y-6">
        {/* Brand */}
        <div className="flex flex-col items-center space-y-2 text-center">
          <Link href="/" className="flex items-center gap-2.5 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl text-white font-bold text-lg shadow-lg"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #C026D3)' }}>
              R
            </div>
            <span className="text-xl font-bold tracking-tight"
              style={{ background: 'linear-gradient(135deg, #A78BFA, #E879F9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Remindology
            </span>
          </Link>
          <p className="text-xs" style={{ color: 'rgba(196,181,253,0.55)' }}>
            AI study tool for every exam &amp; every student
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
