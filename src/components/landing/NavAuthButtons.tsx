'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, LayoutDashboard, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/use-auth-store';
import { deleteCookie } from '@/lib/utils';

const BRAND_GRAD = 'linear-gradient(135deg, #7C3AED, #C026D3)';

// Derives initials from a display name: "Shubham Singh" → "SS"
function initials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

interface Props {
  /** true = dark navbar (landing), false = current-affairs public layout */
  dark?: boolean;
  onNavigate?: () => void;
}

export function NavAuthButtons({ dark = true, onNavigate }: Props) {
  const { isAuthenticated, user, clearAuth } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    clearAuth();
    deleteCookie('remindology_logged_in');
    onNavigate?.();
    router.replace('/');
  };

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center gap-2.5">
        {/* User avatar + name */}
        <div className="flex items-center gap-2">
          <div
            className="h-8 w-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
            style={{ background: BRAND_GRAD }}
          >
            {initials(user.name)}
          </div>
          <span
            className="text-sm font-semibold hidden lg:block truncate max-w-28"
            style={{ color: dark ? 'rgba(240,238,255,0.85)' : '#1A1836' }}
          >
            {user.name.split(' ')[0]}
          </span>
        </div>

        {/* Dashboard link */}
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="hidden md:flex items-center gap-1.5 text-sm font-semibold px-3.5 py-2 rounded-xl transition-all hover:opacity-90"
          style={{ background: BRAND_GRAD, color: '#FFFFFF', boxShadow: '0 4px 16px rgba(124,58,237,0.35)' }}
        >
          <LayoutDashboard className="h-3.5 w-3.5" />
          Dashboard
        </Link>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="hidden md:flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition-colors cursor-pointer hover:bg-white/5"
          style={{
            border: dark ? '1px solid rgba(167,139,250,0.22)' : '1px solid rgba(124,58,237,0.2)',
            color: dark ? 'rgba(196,181,253,0.7)' : '#7C3AED',
          }}
        >
          <LogOut className="h-3.5 w-3.5" />
          Log out
        </button>
      </div>
    );
  }

  // Guest
  return (
    <div className="hidden md:flex items-center gap-3">
      <Link
        href="/login"
        onClick={onNavigate}
        className="text-sm font-medium transition-colors hover:text-white px-3 py-1.5 rounded-lg"
        style={{ color: dark ? 'rgba(240,238,255,0.58)' : '#6B63A0' }}
      >
        Sign In
      </Link>
      <Link
        href="/signup"
        onClick={onNavigate}
        className="inline-flex items-center gap-1.5 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition-opacity whitespace-nowrap"
        style={{ background: BRAND_GRAD, boxShadow: '0 4px 20px rgba(124,58,237,0.4)' }}
      >
        Get Started
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

// ── Mobile drawer variant ─────────────────────────────────────────

export function MobileNavAuthButtons({ onClose }: { onClose: () => void }) {
  const { isAuthenticated, user, clearAuth } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    clearAuth();
    deleteCookie('remindology_logged_in');
    onClose();
    router.replace('/');
  };

  if (isAuthenticated && user) {
    return (
      <div className="flex flex-col gap-3 py-5">
        {/* Greeting */}
        <div className="flex items-center gap-3 px-2 pb-2" style={{ borderBottom: '1px solid rgba(124,58,237,0.1)' }}>
          <div
            className="h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
            style={{ background: BRAND_GRAD }}
          >
            {initials(user.name)}
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'rgba(240,238,255,0.9)' }}>{user.name}</p>
            <p className="text-[11px]" style={{ color: 'rgba(196,181,253,0.5)' }}>{user.email}</p>
          </div>
        </div>

        <Link
          href="/dashboard"
          onClick={onClose}
          className="flex items-center justify-center gap-2 text-white text-sm font-bold py-3.5 px-4 rounded-xl"
          style={{ background: BRAND_GRAD, boxShadow: '0 4px 20px rgba(124,58,237,0.4)' }}
        >
          <LayoutDashboard className="h-4 w-4" />
          Go to Dashboard
        </Link>

        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 text-sm font-semibold py-3 px-4 rounded-xl cursor-pointer transition-colors hover:bg-white/5"
          style={{ border: '1px solid rgba(167,139,250,0.28)', color: '#C4B5FD' }}
        >
          <LogOut className="h-4 w-4" />
          Log Out
        </button>
      </div>
    );
  }

  // Guest
  return (
    <div className="flex flex-col gap-3 py-5">
      <Link
        href="/login"
        onClick={onClose}
        className="text-center text-sm font-semibold py-3 px-4 rounded-xl transition-colors hover:bg-white/5"
        style={{ border: '1px solid rgba(167,139,250,0.28)', color: '#C4B5FD' }}
      >
        Sign In
      </Link>
      <Link
        href="/signup"
        onClick={onClose}
        className="flex items-center justify-center gap-2 text-white text-sm font-bold py-3.5 px-4 rounded-xl"
        style={{ background: BRAND_GRAD, boxShadow: '0 4px 20px rgba(124,58,237,0.4)' }}
      >
        Get Started Free
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
