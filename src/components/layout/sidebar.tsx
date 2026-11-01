'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import {
  LayoutDashboard, FileText, User, LogOut,
  Newspaper, BookOpenCheck, BarChart2, Flame, PenLine, CalendarDays, X, ShieldCheck, Database, Milestone, BookOpen, MapPin, GraduationCap,
} from 'lucide-react';
import { useAuthStore } from '@/store/use-auth-store';
import { useSidebarStore } from '@/store/use-sidebar-store';
import { cn, deleteCookie } from '@/lib/utils';
import { StreakBadge } from './StreakBadge';
import { Logo } from '@/components/landing/Logo';

// ── Nav data ──────────────────────────────────────────────────────────────────

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  soon?: true;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Study',
    items: [
      { name: 'Dashboard',   href: '/dashboard',      icon: LayoutDashboard },
      { name: 'My Contents', href: '/contents',        icon: FileText        },
      { name: 'Study Plan',  href: '/study-plan',      icon: CalendarDays    },
    ],
  },
  {
    label: 'Practice',
    items: [
      { name: 'Daily Challenge', href: '/daily-challenge', icon: Flame          },
      { name: 'Current Affairs', href: '/current-affairs', icon: Newspaper      },
      { name: 'Places in News',  href: '/current-affairs/places-in-news', icon: MapPin },
      { name: 'Revision Trail',  href: '/revision-trail',  icon: Milestone      },
      { name: 'Answer Writing',  href: '/mains',           icon: PenLine        },
      { name: 'MCQ Analytics',   href: '/subject-mcqs',    icon: BookOpenCheck },
    ],
  },
  {
    label: 'Progress',
    items: [
      { name: 'Report Card', href: '/report-card', icon: BarChart2, soon: true },
    ],
  },
  {
    label: 'Account',
    items: [
      { name: 'Profile', href: '/profile', icon: User },
    ],
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function isActive(href: string, pathname: string) {
  if (href === '/dashboard') return pathname === href;
  return pathname.startsWith(href);
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ActiveNavItem({ item, active, onNavigate }: { item: NavItem; active: boolean; onNavigate: () => void }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        'flex items-center gap-2.5 border-l-2 pl-3 pr-2 py-1.5 text-sm transition-colors duration-150 ease-ks group',
        active
          ? 'border-gold text-ink font-semibold'
          : 'border-transparent text-ink-muted font-normal hover:text-ink'
      )}
    >
      <Icon className={cn(
        'h-4 w-4 shrink-0 transition-colors',
        active ? 'text-ink' : 'text-ink-muted group-hover:text-ink'
      )} />
      <span className="truncate">{item.name}</span>
    </Link>
  );
}

function SoonNavItem({ item }: { item: NavItem }) {
  const Icon = item.icon;
  return (
    <div className="flex items-center gap-2.5 border-l-2 border-transparent pl-3 pr-2 py-1.5 text-sm text-ink-faint cursor-not-allowed select-none">
      <Icon className="h-4 w-4 shrink-0" />
      <span className="truncate">{item.name}</span>
      <span className="ks-tag ks-tag-outline ml-auto shrink-0">
        Soon
      </span>
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

export function Sidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const { user, clearAuth } = useAuthStore();
  const { isOpen, close } = useSidebarStore();

  // Close drawer on route change (mobile)
  useEffect(() => {
    close();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const handleLogout = () => {
    clearAuth();
    deleteCookie('remindology_logged_in');
    router.replace('/login');
  };

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-20 bg-ink/40 transition-opacity duration-200 lg:hidden',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={close}
        aria-hidden="true"
      />

      {/* Sidebar panel */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-rule bg-paper-deep',
          'transition-transform duration-200 ease-ks',
          // Mobile: slide in/out; Desktop: always visible
          isOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0'
        )}
      >
        {/* Logo + mobile close */}
        <div className="flex h-17 items-center justify-between px-6 border-b border-rule">
          <Link href="/dashboard" className="flex items-center min-w-0" aria-label="Remindology">
            <Logo variant="mono" size={32} />
          </Link>
          {/* Close button — mobile only */}
          <button
            onClick={close}
            className="lg:hidden ml-2 shrink-0 p-1.5 rounded-md text-ink-muted hover:text-ink hover:bg-paper-gray transition-colors"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation groups */}
        <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="pl-3.5 mb-2 font-label text-[10.5px] font-medium uppercase tracking-[0.16em] text-ink-muted">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) =>
                  item.soon ? (
                    <SoonNavItem key={item.name} item={item} />
                  ) : (
                    <ActiveNavItem
                      key={item.name}
                      item={item}
                      active={isActive(item.href, pathname)}
                      onNavigate={close}
                    />
                  )
                )}
              </div>
            </div>
          ))}

          {/* Admin-only group */}
          {(user?.is_admin || user?.isAdmin) && (
            <div>
              <p className="pl-3.5 mb-2 font-label text-[10.5px] font-medium uppercase tracking-[0.16em] text-ink-muted">
                Admin
              </p>
              <div className="space-y-0.5">
                <ActiveNavItem
                  item={{ name: 'Publish Articles', href: '/admin/current-affairs', icon: ShieldCheck }}
                  active={isActive('/admin/current-affairs', pathname)}
                  onNavigate={close}
                />
                <ActiveNavItem
                  item={{ name: 'Knowledge Base', href: '/admin/rag', icon: Database }}
                  active={isActive('/admin/rag', pathname)}
                  onNavigate={close}
                />
                <ActiveNavItem
                  item={{ name: 'General Studies', href: '/admin/general-studies', icon: BookOpen }}
                  active={isActive('/admin/general-studies', pathname)}
                  onNavigate={close}
                />
                <ActiveNavItem
                  item={{ name: 'Places in News', href: '/admin/places-in-news', icon: MapPin }}
                  active={isActive('/admin/places-in-news', pathname)}
                  onNavigate={close}
                />
                <ActiveNavItem
                  item={{ name: 'Courses', href: '/admin/courses', icon: GraduationCap }}
                  active={isActive('/admin/courses', pathname)}
                  onNavigate={close}
                />
              </div>
            </div>
          )}
        </nav>

        {/* Streak */}
        <StreakBadge />

        {/* User footer */}
        <div className="border-t border-rule p-4">
          <div className="flex items-center gap-3 rounded-[2px] border border-rule px-3 py-2.5 bg-paper-raised min-w-0 overflow-hidden">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink text-paper font-semibold text-xs">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0 overflow-hidden">
              <p className="text-sm font-semibold text-ink truncate leading-tight">{user?.name || 'Aspirant'}</p>
              <p className="text-[11px] text-ink-muted leading-tight break-all">{user?.email || ''}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 mt-1.5 text-sm font-medium text-ink-muted hover:text-[oklch(52%_.16_35)] hover:bg-paper-gray transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
