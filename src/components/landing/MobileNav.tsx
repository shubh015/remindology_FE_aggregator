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
        className="p-2 rounded-lg transition-colors hover:bg-black/5 text-foreground"
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
          <div className="absolute left-0 right-0 top-full z-50 bg-background/98 backdrop-blur-xl border-b border-border shadow-xl">
            <nav className="px-5 py-3 flex flex-col">
              {NAV_LINKS.map(([label, href]) => (
                <a
                  key={label}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="text-[15px] font-medium py-4 px-2 transition-colors hover:text-foreground text-foreground/72 border-b border-foreground/8"
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
