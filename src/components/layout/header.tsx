'use client';

import { useAuthStore } from '@/store/use-auth-store';
import { useSidebarStore } from '@/store/use-sidebar-store';
import { BookOpen, Menu } from 'lucide-react';

interface HeaderProps {
  title?: string;
  action?: React.ReactNode;
}

export function Header({ title, action }: HeaderProps) {
  const { user }   = useAuthStore();
  const { toggle } = useSidebarStore();

  return (
    <header className="flex h-17 shrink-0 items-center justify-between border-b border-border bg-card px-4 md:px-8 gap-3 min-w-0">

      {/* Left: hamburger (mobile) + title */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Hamburger — only on mobile/tablet */}
        <button
          onClick={toggle}
          className="lg:hidden shrink-0 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        {title ? (
          <h1 className="text-lg font-semibold tracking-tight text-foreground truncate">{title}</h1>
        ) : (
          <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium min-w-0">
            <BookOpen className="h-4 w-4 text-primary shrink-0" />
            <span className="truncate hidden sm:inline">UPSC Learning Platform</span>
          </div>
        )}
      </div>

      {/* Right: action + user info */}
      <div className="flex items-center gap-2 md:gap-4 shrink-0">
        {action && <div className="flex items-center gap-2">{action}</div>}
        <div className="h-5 w-px bg-border hidden sm:block" />
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-primary/80 to-purple-600/80 text-white font-semibold text-xs shadow-sm">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          {/* Name — hide on very small screens to avoid overflow */}
          <div className="hidden sm:flex flex-col leading-tight min-w-0 max-w-35">
            <span className="text-sm font-semibold text-foreground truncate">{user?.name || 'Aspirant'}</span>
            <span className="text-[11px] text-muted-foreground truncate">{user?.email || 'Aspirant'}</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
