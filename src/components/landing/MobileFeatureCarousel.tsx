'use client';

import { useRef, useState } from 'react';
import type { LucideIcon } from 'lucide-react';

export interface MobileCarouselItem {
  id: string;
  icon: LucideIcon;
  label: string;
  tagline: string;
  color?: string;
}

// Mobile-only feature browser — deliberately has NO auto-rotate, NO CSS
// keyframe animation, and NO IntersectionObserver. It's pure native scroll +
// tap state, so it cannot flicker the way the desktop auto-rotating progress
// bar can on mobile viewports (address-bar resize / touch-scroll causing the
// observer to cross its threshold repeatedly).
export function MobileFeatureCarousel({
  items, renderMockup, accent = '#7C3AED',
}: {
  items: readonly MobileCarouselItem[];
  renderMockup: (id: string) => React.ReactNode;
  accent?: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const scrollToIndex = (i: number) => {
    setActiveIndex(i);
    cardRefs.current[i]?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  };

  // Keeps the mockup panel in sync when the user swipes the strip directly
  // (without tapping a card) — cheap arithmetic, no animation involved.
  const handleScroll = () => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const center = scroller.scrollLeft + scroller.clientWidth / 2;
    let closest = 0;
    let closestDist = Infinity;
    cardRefs.current.forEach((el, i) => {
      if (!el) return;
      const cardCenter = el.offsetLeft + el.offsetWidth / 2;
      const dist = Math.abs(cardCenter - center);
      if (dist < closestDist) { closestDist = dist; closest = i; }
    });
    setActiveIndex((prev) => (prev === closest ? prev : closest));
  };

  const active = items[activeIndex];
  const activeAccent = active.color ?? accent;

  return (
    <div>
      {/* Icon strip — native scroll-snap, no JS-driven motion */}
      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {items.map((item, i) => {
          const Icon = item.icon;
          const isActive = i === activeIndex;
          const itemAccent = item.color ?? accent;
          return (
            <button
              key={item.id}
              ref={(el) => { cardRefs.current[i] = el; }}
              onClick={() => scrollToIndex(i)}
              className="shrink-0 flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-2xl transition-colors cursor-pointer"
              style={{
                scrollSnapAlign: 'center',
                background: isActive ? `${itemAccent}14` : 'transparent',
                border: `1.5px solid ${isActive ? `${itemAccent}40` : 'rgba(124,58,237,0.08)'}`,
                minWidth: 78,
              }}
            >
              <div
                className="h-9 w-9 rounded-xl flex items-center justify-center transition-colors"
                style={{ background: isActive ? itemAccent : `${itemAccent}18` }}
              >
                <Icon className="h-4 w-4" style={{ color: isActive ? '#FFFFFF' : itemAccent }} />
              </div>
              <span
                className="text-[10px] font-semibold text-center leading-tight max-w-16"
                style={{ color: isActive ? '#1A1836' : '#6B63A0' }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Dot indicator — plain state, no animation */}
      <div className="flex items-center justify-center gap-1.5 mt-3 mb-4">
        {items.map((item, i) => (
          <button
            key={item.id}
            aria-label={`Go to ${item.label}`}
            onClick={() => scrollToIndex(i)}
            className="rounded-full transition-all cursor-pointer"
            style={{
              width: i === activeIndex ? 16 : 6,
              height: 6,
              background: i === activeIndex ? activeAccent : 'rgba(124,58,237,0.18)',
            }}
          />
        ))}
      </div>

      {/* Active feature heading */}
      <div className="flex items-center gap-2 mb-3">
        <div
          className="h-8 w-8 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: `${activeAccent}18` }}
        >
          {(() => {
            const Icon = active.icon;
            return <Icon className="h-4 w-4" style={{ color: activeAccent }} />;
          })()}
        </div>
        <div>
          <p className="text-sm font-bold" style={{ color: '#1A1836' }}>{active.label}</p>
          <p className="text-[11px]" style={{ color: '#9D95C4' }}>{active.tagline}</p>
        </div>
      </div>

      {/* Mockup — direct swap, no opacity-fade timer */}
      <div style={{ minHeight: 260 }}>
        {renderMockup(active.id)}
      </div>
    </div>
  );
}
