'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, LayoutDashboard, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/use-auth-store';
import { deleteCookie } from '@/lib/utils';

const BRAND = '#8A6A12';
const BRAND_SHADOW = 'rgba(138,106,18,0.28)';
const BRAND_SHADOW_STRONG = 'rgba(138,106,18,0.32)';

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
  onNavigate?: () => void;
}

export function NavAuthButtons({ onNavigate }: Props = {}) {
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
            style={{ background: BRAND }}
          >
            {initials(user.name)}
          </div>
          <span className="text-sm font-semibold hidden lg:block truncate max-w-28 text-foreground">
            {user.name.split(' ')[0]}
          </span>
        </div>

        {/* Dashboard link */}
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="hidden md:flex items-center gap-1.5 text-sm font-semibold px-3.5 py-2 rounded-xl transition-all hover:opacity-90"
          style={{ background: BRAND, color: '#FFFFFF', boxShadow: `0 4px 16px ${BRAND_SHADOW}` }}
        >
          <LayoutDashboard className="h-3.5 w-3.5" />
          Dashboard
        </Link>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="hidden md:flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition-colors cursor-pointer hover:bg-black/5 whitespace-nowrap"
          style={{ border: '1px solid rgba(138,106,18,0.25)', color: BRAND }}
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
        className="text-sm font-medium transition-colors hover:text-foreground px-3 py-1.5 rounded-lg text-muted-foreground"
      >
        Sign In
      </Link>
      <Link
        href="/signup"
        onClick={onNavigate}
        className="inline-flex items-center gap-1.5 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition-opacity whitespace-nowrap"
        style={{ background: BRAND, boxShadow: `0 4px 20px ${BRAND_SHADOW_STRONG}` }}
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
        <div className="flex items-center gap-3 px-2 pb-2 border-b border-foreground/8">
          <div
            className="h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
            style={{ background: BRAND }}
          >
            {initials(user.name)}
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{user.name}</p>
            <p className="text-[11px] text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <Link
          href="/dashboard"
          onClick={onClose}
          className="flex items-center justify-center gap-2 text-white text-sm font-bold py-3.5 px-4 rounded-xl"
          style={{ background: BRAND, boxShadow: `0 4px 20px ${BRAND_SHADOW}` }}
        >
          <LayoutDashboard className="h-4 w-4" />
          Go to Dashboard
        </Link>

        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 text-sm font-semibold py-3 px-4 rounded-xl cursor-pointer transition-colors hover:bg-black/5"
          style={{ border: '1px solid rgba(138,106,18,0.25)', color: BRAND }}
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
        className="text-center text-sm font-semibold py-3 px-4 rounded-xl transition-colors hover:bg-black/5"
        style={{ border: '1px solid rgba(138,106,18,0.25)', color: BRAND }}
      >
        Sign In
      </Link>
      <Link
        href="/signup"
        onClick={onClose}
        className="flex items-center justify-center gap-2 text-white text-sm font-bold py-3.5 px-4 rounded-xl"
        style={{ background: BRAND, boxShadow: `0 4px 20px ${BRAND_SHADOW}` }}
      >
        Get Started Free
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
