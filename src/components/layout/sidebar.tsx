'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, FileText, User, LogOut,
  Newspaper, BookOpenCheck, BarChart2, Flame, PenLine, CalendarDays,
} from 'lucide-react';
import { useAuthStore } from '@/store/use-auth-store';
import { cn, deleteCookie } from '@/lib/utils';

// ── Nav data ─────────────────────────────────────────────────────────────────

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
      { name: 'Dashboard',    href: '/dashboard',        icon: LayoutDashboard },
      { name: 'My Contents',  href: '/contents',         icon: FileText        },
      { name: 'Study Plan',   href: '/study-plan',       icon: CalendarDays    },
    ],
  },
  {
    label: 'Practice',
    items: [
      { name: 'Daily Challenge',  href: '/daily-challenge',  icon: Flame          },
      { name: 'Current Affairs',  href: '/current-affairs',  icon: Newspaper      },
      { name: 'Answer Writing',   href: '/mains',            icon: PenLine        },
      { name: 'Subject MCQs',     href: '/subject-mcqs',     icon: BookOpenCheck,  soon: true },
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

// ── Helpers ──────────────────────────────────────────────────────────────────

function isActive(href: string, pathname: string) {
  if (href === '/dashboard') return pathname === href;
  return pathname.startsWith(href);
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ActiveNavItem({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={cn(
        'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 group',
        active
          ? 'bg-primary/10 text-primary shadow-sm'
          : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
      )}
    >
      <div className={cn(
        'flex h-7 w-7 items-center justify-center rounded-lg transition-all',
        active ? 'bg-primary/15 text-primary' : 'text-muted-foreground group-hover:text-foreground'
      )}>
        <Icon className="h-4 w-4 shrink-0" />
      </div>
      {item.name}
      {active && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />}
    </Link>
  );
}

function SoonNavItem({ item }: { item: NavItem }) {
  const Icon = item.icon;
  return (
    <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground/50 cursor-not-allowed select-none">
      <div className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground/40">
        <Icon className="h-4 w-4 shrink-0" />
      </div>
      <span>{item.name}</span>
      <span className="ml-auto inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary uppercase tracking-wide">
        Soon
      </span>
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();

  const handleLogout = () => {
    clearAuth();
    deleteCookie('remindology_logged_in');
    router.replace('/login');
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-20 flex w-64 flex-col border-r border-border bg-card shadow-sm">
      {/* Logo */}
      <div className="flex h-[68px] items-center px-6 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-base shadow-md shadow-primary/30">
            R
          </div>
          <span className="text-[17px] font-semibold tracking-tight bg-linear-to-r from-primary to-purple-500 bg-clip-text text-transparent">
            Remindology
          </span>
        </Link>
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
                  <ActiveNavItem key={item.name} item={item} active={isActive(item.href, pathname)} />
                )
              )}
            </div>
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 bg-secondary/60">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-primary/80 to-purple-600/80 text-white font-semibold text-xs shadow-sm">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate leading-tight">{user?.name || 'Aspirant'}</p>
            <p className="text-[11px] text-muted-foreground truncate leading-tight">{user?.email || ''}</p>
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
  );
}

export default Sidebar;
