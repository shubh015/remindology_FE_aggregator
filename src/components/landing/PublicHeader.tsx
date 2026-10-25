import Link from 'next/link';
import { MobileNav } from '@/components/landing/MobileNav';
import { NavAuthButtons } from '@/components/landing/NavAuthButtons';
import { CoursesNavDropdown } from '@/components/landing/CoursesNavDropdown';
import { Logo } from '@/components/landing/Logo';

const PRIMARY_LINKS = [
  ['Home', '/'],
  ['Current Affairs', '/current-affairs'],
  ['General Studies', '/general-studies'],
] as const;

const SECONDARY_LINKS = [
  ['Features', '/#features'],
  ['Pricing', '/#pricing'],
] as const;

/** Shared sticky nav for all Clean Editorial public pages (current-affairs, courses, general-studies). */
export function PublicHeader() {
  return (
    <header className="sticky top-0 z-50">
      <div className="bg-background/92 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/">
            <Logo size={32} />
          </Link>

          {/* Centre nav */}
          <nav className="hidden md:flex items-center gap-1">
            {PRIMARY_LINKS.map(([label, href]) => (
              <Link
                key={label}
                href={href}
                className="text-sm font-medium transition-colors hover:text-foreground px-3 py-1.5 rounded-lg hover:bg-foreground/5 whitespace-nowrap text-foreground/65"
              >
                {label}
              </Link>
            ))}
            <CoursesNavDropdown />
            {SECONDARY_LINKS.map(([label, href]) => (
              <Link
                key={label}
                href={href}
                className="text-sm font-medium transition-colors hover:text-foreground px-3 py-1.5 rounded-lg hover:bg-foreground/5 whitespace-nowrap text-foreground/65"
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* CTA — auth-aware */}
          <NavAuthButtons />

          <MobileNav />
        </div>
      </div>
    </header>
  );
}
