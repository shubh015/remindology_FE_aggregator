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
export function TableOfContents({
  items,
  label,
}: {
  items: TocItem[];
  /** Optional heading rendered as a `.doc-nav-label` above the links. */
  label?: string;
  /** @deprecated No longer used: the TOC is monochrome. Kept for API compatibility. */
  accentColor?: string;
}) {
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
    <nav aria-label="Table of contents">
      {label && <p className="doc-nav-label">{label}</p>}
      <div className="grid gap-0.5">
        {items.map((item) => {
          const active = item.id === activeId;
          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={active ? 'doc-nav-link is-active' : 'doc-nav-link'}
              aria-current={active ? 'location' : undefined}
            >
              {item.label}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
