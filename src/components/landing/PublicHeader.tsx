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

/**
 * Shared floating nav for the homepage and all public pages. A rounded,
 * translucent bar inset from the top and sides that stays pinned while the
 * page scrolls underneath it (impeccable.style-style floating nav).
 */
export function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 px-[clamp(12px,3vw,24px)] pt-3 pointer-events-none">
      <div
        className="pointer-events-auto relative mx-auto max-w-[1200px] h-14 flex items-center justify-between gap-4 rounded-full border border-rule shadow-lift-2 pl-5 pr-2.5 sm:pr-3"
        style={{
          background: 'color-mix(in oklch, var(--color-paper-raised) 88%, transparent)',
          backdropFilter: 'blur(14px) saturate(1.2)',
          WebkitBackdropFilter: 'blur(14px) saturate(1.2)',
        }}
      >
        {/* Logo */}
        <Link href="/" aria-label="Remindology home" className="shrink-0">
          <Logo size={26} />
        </Link>

        {/* Centre nav */}
        <nav className="hidden lg:flex items-center gap-[clamp(16px,2vw,30px)]">
          {PRIMARY_LINKS.map(([label, href]) => (
            <Link key={label} href={href} className="nav-link text-[0.9rem]! whitespace-nowrap">
              {label}
            </Link>
          ))}
          <CoursesNavDropdown />
          {SECONDARY_LINKS.map(([label, href]) => (
            <Link key={label} href={href} className="nav-link text-[0.9rem]! whitespace-nowrap">
              {label}
            </Link>
          ))}
        </nav>

        {/* Right side: auth-aware CTA + mobile menu */}
        <div className="flex items-center gap-2">
          <NavAuthButtons />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
