'use client';

import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { MobileNavAuthButtons } from './NavAuthButtons';

const NAV_LINKS = [
  ['Features', '#features'],
  ['Current Affairs', '#current-affairs'],
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

              {/* Auth buttons — auth-aware */}
              <MobileNavAuthButtons onClose={() => setOpen(false)} />
            </nav>
          </div>
        </>
      )}
    </div>
  );
}
