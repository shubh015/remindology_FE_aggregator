import Link from 'next/link';
import { Logo } from '@/components/landing/Logo';

const FOOTER_LINKS = [
  ['Home', '/'],
  ['Pricing', '/#pricing'],
  ['Sign Up', '/signup'],
] as const;

/** Shared footer for all Clean Editorial public pages. `tagline` is the only per-section copy. */
export function PublicFooter({ tagline }: { tagline: string }) {
  return (
    <footer className="bg-foreground border-t border-background/10">
      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <Link href="/">
          <Logo size={28} />
        </Link>
        <p className="text-xs text-center text-background/40">
          {tagline}
        </p>
        <div className="flex items-center gap-5">
          {FOOTER_LINKS.map(([l, h]) => (
            <Link
              key={l}
              href={h}
              className="text-xs transition-colors hover:text-background text-background/65"
            >
              {l}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
