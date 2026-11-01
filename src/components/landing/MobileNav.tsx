'use client';

import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { MobileNavAuthButtons } from './NavAuthButtons';

const NAV_LINKS = [
  ['Features', '#features'],
  ['Current Affairs', '#current-affairs'],
  ['General Studies', '/general-studies'],
  ['Courses', '/courses'],
  ['Pricing', '#pricing'],
  ['FAQ', '#faq'],
] as const;

// `variant` is accepted for backwards compatibility; only the monochrome style exists now.
export function MobileNav(props: { variant?: 'default' | 'mono' } = {}) {
  void props;
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
    <div className="lg:hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className={'h-9 w-9 inline-flex items-center justify-center rounded-full transition-colors hover:bg-paper-deep text-ink'}
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
          <div className={'absolute left-0 right-0 top-full mt-2 z-50 bg-paper-raised border border-rule rounded-[18px] shadow-lift-2 overflow-hidden'}>
            <nav className="px-5 py-3 flex flex-col">
              {NAV_LINKS.map(([label, href]) => (
                <a
                  key={label}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={'text-[15px] py-4 px-2 transition-colors text-ink-soft hover:text-ink border-b border-rule'}
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
