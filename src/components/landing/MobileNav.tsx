'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, ArrowRight } from 'lucide-react';

const BRAND_GRAD = 'linear-gradient(135deg, #7C3AED, #C026D3)';

const NAV_LINKS = [
  ['Features', '#features'],
  ['How it Works', '#how-it-works'],
  ['Pricing', '#pricing'],
  ['FAQ', '#faq'],
] as const;

export function MobileNav() {
  const [open, setOpen] = useState(false);

  // Close on Escape key
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="p-2 rounded-lg transition-colors hover:bg-white/5"
        style={{ color: 'rgba(240,238,255,0.78)' }}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open && (
        <>
          {/* Backdrop — click anywhere outside to dismiss */}
          <div
            className="fixed inset-0 z-40"
            aria-hidden="true"
            onClick={() => setOpen(false)}
          />

          {/* Drawer */}
          <div
            className="absolute left-0 right-0 top-full z-50"
            style={{
              background: 'rgba(9,9,31,0.98)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderBottom: '1px solid rgba(124,58,237,0.22)',
              boxShadow: '0 24px 48px rgba(0,0,0,0.45)',
            }}
          >
            <nav className="px-5 py-3 flex flex-col">
              {NAV_LINKS.map(([label, href]) => (
                <a
                  key={label}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="text-[15px] font-medium py-4 px-2 transition-colors hover:text-white"
                  style={{
                    color: 'rgba(240,238,255,0.72)',
                    borderBottom: '1px solid rgba(124,58,237,0.1)',
                  }}
                >
                  {label}
                </a>
              ))}

              {/* Auth buttons */}
              <div className="flex flex-col gap-3 py-5">
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="text-center text-sm font-semibold py-3 px-4 rounded-xl transition-colors hover:bg-white/5"
                  style={{ border: '1px solid rgba(167,139,250,0.28)', color: '#C4B5FD' }}
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-2 text-white text-sm font-bold py-3.5 px-4 rounded-xl"
                  style={{ background: BRAND_GRAD, boxShadow: '0 4px 20px rgba(124,58,237,0.4)' }}
                >
                  Get Started Free
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </nav>
          </div>
        </>
      )}
    </div>
  );
}
