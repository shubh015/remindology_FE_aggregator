'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, LayoutDashboard, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/use-auth-store';
import { deleteCookie } from '@/lib/utils';

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
  /** @deprecated only the monochrome style exists now */
  variant?: 'default' | 'mono';
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
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0 bg-paper-gray text-ink border border-rule">
            {initials(user.name)}
          </div>
          <span className="text-sm font-medium hidden lg:block truncate max-w-28 text-ink">
            {user.name.split(' ')[0]}
          </span>
        </div>
        <Link href="/dashboard" onClick={onNavigate} className="btn-ink btn-sm rounded-full hidden md:inline-flex">
          <LayoutDashboard className="h-3.5 w-3.5" />
          Dashboard
        </Link>
        <button onClick={handleLogout} className="btn-outline btn-sm rounded-full hidden md:inline-flex">
          <LogOut className="h-3.5 w-3.5" />
          Log out
        </button>
      </div>
    );
  }

  // Guest
  return (
    <div className="hidden md:flex items-center gap-4">
      <Link href="/login" onClick={onNavigate} className="nav-link text-[0.9rem]!">
        Sign in
      </Link>
      <Link href="/signup" onClick={onNavigate} className="btn-ink btn-sm rounded-full">
        Get started
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

// ── Mobile drawer variant ─────────────────────────────────────────

export function MobileNavAuthButtons({
  onClose,
}: {
  onClose: () => void;
  /** @deprecated only the monochrome style exists now */
  variant?: 'default' | 'mono';
}) {
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
        <div className="flex items-center gap-3 px-2 pb-3 border-b border-rule">
          <div className="h-9 w-9 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 bg-paper-gray text-ink border border-rule">
            {initials(user.name)}
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">{user.name}</p>
            <p className="text-[12px] text-ink-muted">{user.email}</p>
          </div>
        </div>
        <Link href="/dashboard" onClick={onClose} className="btn-ink w-full">
          <LayoutDashboard className="h-4 w-4" />
          Go to dashboard
        </Link>
        <button onClick={handleLogout} className="btn-outline w-full">
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </div>
    );
  }

  // Guest
  return (
    <div className="flex flex-col gap-3 py-5">
      <Link href="/login" onClick={onClose} className="btn-outline w-full">
        Sign in
      </Link>
      <Link href="/signup" onClick={onClose} className="btn-ink w-full">
        Get started free
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
