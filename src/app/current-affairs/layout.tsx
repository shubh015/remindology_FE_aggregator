import Link from 'next/link';
import { MobileNav } from '@/components/landing/MobileNav';
import { NavAuthButtons } from '@/components/landing/NavAuthButtons';

const BRAND_GRAD = 'linear-gradient(135deg, #7C3AED, #C026D3)';
const TEXT_GRAD  = {
  background: 'linear-gradient(135deg, #A78BFA, #E879F9)',
  WebkitBackgroundClip: 'text' as const,
  WebkitTextFillColor: 'transparent',
};
const BORDER_D = '1px solid rgba(124,58,237,0.2)';

export default function CurrentAffairsPublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ fontFamily: 'var(--font-poppins), system-ui, sans-serif' }}>

      {/* Sticky nav */}
      <header className="sticky top-0 z-50">
        <div
          style={{
            background: 'rgba(9,9,31,0.92)',
            backdropFilter: 'blur(16px)',
            borderBottom: BORDER_D,
          }}
        >
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0">
              <div
                className="h-8 w-8 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg"
                style={{ background: BRAND_GRAD }}
              >
                R
              </div>
              <span className="font-bold text-[17px]" style={TEXT_GRAD}>Remindology</span>
            </Link>

            {/* Centre nav */}
            <nav className="hidden md:flex items-center gap-7">
              {[
                ['Home', '/'],
                ['Current Affairs', '/current-affairs'],
                ['Features', '/#features'],
                ['Pricing', '/#pricing'],
              ].map(([label, href]) => (
                <Link
                  key={label}
                  href={href}
                  className="text-sm font-medium transition-colors hover:text-white"
                  style={{ color: 'rgba(240,238,255,0.58)' }}
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* CTA — auth-aware */}
            <NavAuthButtons dark />

            <MobileNav />
          </div>
        </div>
      </header>

      {children}

      {/* Footer */}
      <footer style={{ background: '#09091F', borderTop: BORDER_D }}>
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div
              className="h-7 w-7 rounded-xl flex items-center justify-center text-white font-bold text-xs"
              style={{ background: BRAND_GRAD }}
            >
              R
            </div>
            <span className="font-bold text-base" style={TEXT_GRAD}>Remindology</span>
          </Link>
          <p className="text-xs text-center" style={{ color: 'rgba(196,181,253,0.4)' }}>
            AI-curated current affairs for UPSC, SSC &amp; State PSCs · Published every morning
          </p>
          <div className="flex items-center gap-5">
            {[['Home', '/'], ['Pricing', '/#pricing'], ['Sign Up', '/signup']].map(([l, h]) => (
              <Link
                key={l}
                href={h}
                className="text-xs transition-colors hover:text-white"
                style={{ color: 'rgba(196,181,253,0.45)' }}
              >
                {l}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
