'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import {
  LayoutDashboard, FileText, User, LogOut,
  Newspaper, BookOpenCheck, BarChart2, Flame, PenLine, CalendarDays, X, ShieldCheck, Database, Milestone, BookOpen, MapPin,
} from 'lucide-react';
import { useAuthStore } from '@/store/use-auth-store';
import { useSidebarStore } from '@/store/use-sidebar-store';
import { cn, deleteCookie } from '@/lib/utils';
import { StreakBadge } from './StreakBadge';

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
        'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 group',
        active
          ? 'bg-primary/10 text-primary shadow-sm'
          : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
      )}
    >
      <div className={cn(
        'flex h-7 w-7 items-center justify-center rounded-lg transition-all shrink-0',
        active ? 'bg-primary/15 text-primary' : 'text-muted-foreground group-hover:text-foreground'
      )}>
        <Icon className="h-4 w-4" />
      </div>
      <span className="truncate">{item.name}</span>
      {active && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary shrink-0" />}
    </Link>
  );
}

function SoonNavItem({ item }: { item: NavItem }) {
  const Icon = item.icon;
  return (
    <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground/50 cursor-not-allowed select-none">
      <div className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground/40 shrink-0">
        <Icon className="h-4 w-4" />
      </div>
      <span className="truncate">{item.name}</span>
      <span className="ml-auto shrink-0 inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary uppercase tracking-wide">
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
          'fixed inset-0 z-20 bg-black/50 backdrop-blur-sm transition-opacity duration-200 lg:hidden',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={close}
        aria-hidden="true"
      />

      {/* Sidebar panel */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-border bg-card shadow-sm',
          'transition-transform duration-200 ease-in-out',
          // Mobile: slide in/out; Desktop: always visible
          isOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0'
        )}
      >
        {/* Logo + mobile close */}
        <div className="flex h-17 items-center justify-between px-6 border-b border-border">
          <Link href="/dashboard" className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-base shadow-md shadow-primary/30">
              R
            </div>
            <span className="text-[17px] font-semibold tracking-tight bg-linear-to-r from-primary to-purple-500 bg-clip-text text-transparent truncate">
              Remindology
            </span>
          </Link>
          {/* Close button — mobile only */}
          <button
            onClick={close}
            className="lg:hidden ml-2 shrink-0 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation groups */}
        <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-5">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
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
              <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-amber-500/70">
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
              </div>
            </div>
          )}
        </nav>

        {/* Streak */}
        <StreakBadge />

        {/* User footer */}
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 bg-secondary/60 min-w-0 overflow-hidden">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-primary/80 to-purple-600/80 text-white font-semibold text-xs shadow-sm">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0 overflow-hidden">
              <p className="text-sm font-semibold text-foreground truncate leading-tight">{user?.name || 'Aspirant'}</p>
              <p className="text-[11px] text-muted-foreground leading-tight break-all">{user?.email || ''}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 mt-1.5 text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/8 transition-colors cursor-pointer"
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
