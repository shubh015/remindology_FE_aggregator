'use client';

import { useEffect, useState } from 'react';

export interface TocItem {
  id: string;
  label: string;
}

/**
 * Anchor nav with scroll-spy highlighting, for long structured content pages
 * (current-affairs articles, GS articles). `items` should only include
 * sections that actually render for this piece of content — build it from
 * the same conditional checks that decide what's in the JSX, don't
 * re-derive the logic here.
 */
export function TableOfContents({ items, accentColor }: { items: TocItem[]; accentColor: string }) {
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    if (items.length === 0) return;
    const elements = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => !!el);
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: '-15% 0px -65% 0px', threshold: 0 },
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <nav className="space-y-1" aria-label="Table of contents">
      {items.map((item) => {
        const active = item.id === activeId;
        return (
          <a
            key={item.id}
            href={`#${item.id}`}
            className="block pl-3 pr-2.5 py-1.5 rounded-r-lg text-sm transition-all"
            style={active
              ? {
                  background: `linear-gradient(90deg, ${accentColor}18, ${accentColor}03)`,
                  borderLeft: `2px solid ${accentColor}`,
                  color: accentColor,
                  fontWeight: 700,
                }
              : {
                  background: 'transparent',
                  borderLeft: `2px solid ${accentColor}15`,
                  color: '#5B6478',
                  fontWeight: 400,
                }}
          >
            {item.label}
          </a>
        );
      })}
    </nav>
  );
}
