'use client';

import { useAuthStore } from '@/store/use-auth-store';
import { BookOpen } from 'lucide-react';

interface HeaderProps {
  title?: string;
  action?: React.ReactNode;
}

export function Header({ title, action }: HeaderProps) {
  const { user } = useAuthStore();

  return (
    <header className="flex h-[68px] shrink-0 items-center justify-between border-b border-border bg-card px-8">
      <div className="flex items-center gap-2">
        {title ? (
          <h1 className="text-xl font-semibold tracking-tight text-foreground">{title}</h1>
        ) : (
          <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
            <BookOpen className="h-4 w-4 text-primary" />
            <span>UPSC Learning Platform</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        {action && <div className="flex items-center gap-2">{action}</div>}
        <div className="h-5 w-px bg-border" />
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-primary/80 to-purple-600/80 text-white font-semibold text-xs shadow-sm">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-foreground">{user?.name || 'UPSC Candidate'}</span>
            <span className="text-[11px] text-muted-foreground">Aspirant</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
