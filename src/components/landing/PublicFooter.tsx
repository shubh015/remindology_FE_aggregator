import Link from 'next/link';
import { Logo } from '@/components/landing/Logo';

const FOOTER_LINKS = [
  ['Home', '/'],
  ['Pricing', '/#pricing'],
  ['Sign Up', '/signup'],
] as const;

/** Shared footer for all public pages. `tagline` is the only per-section copy. */
export function PublicFooter({ tagline }: { tagline: string }) {
  return (
    <footer className="bg-paper-deep border-t border-rule">
      <div className="ks-container py-14">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 mb-10">
          <div className="sm:col-span-2 grid gap-4 content-start">
            <Link href="/" className="inline-flex" aria-label="Remindology home">
              <Logo size={28} variant="mono" />
            </Link>
            <p className="text-sm text-ink-muted max-w-[360px] m-0" style={{ lineHeight: 1.7 }}>
              {tagline}
            </p>
          </div>
          <div>
            <h4 className="eyebrow mb-5">Explore</h4>
            <ul className="grid gap-3 list-none p-0 m-0">
              {FOOTER_LINKS.map(([l, h]) => (
                <li key={l}>
                  <Link href={h} className="nav-link text-sm!">
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-rule flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="font-label text-[11px] uppercase tracking-[0.12em] text-ink-muted m-0">
            © 2026 Remindology. All rights reserved.
          </p>
          <p className="font-label text-[11px] uppercase tracking-[0.12em] text-ink-muted m-0">
            Made for students across India
          </p>
        </div>
      </div>
    </footer>
  );
}
