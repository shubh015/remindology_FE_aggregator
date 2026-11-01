'use client';

import { useRef, useState } from 'react';
import type { LucideIcon } from 'lucide-react';

export interface MobileCarouselItem {
  id: string;
  icon: LucideIcon;
  label: string;
  tagline: string;
  /** Ignored by the mono theme — kept for API compatibility. */
  color?: string;
}

// Mobile-only feature browser — deliberately has NO auto-rotate, NO CSS
// keyframe animation, and NO IntersectionObserver. It's pure native scroll +
// tap state, so it cannot flicker the way the desktop auto-rotating progress
// bar can on mobile viewports (address-bar resize / touch-scroll causing the
// observer to cross its threshold repeatedly).
export function MobileFeatureCarousel({
  items, renderMockup,
}: {
  items: readonly MobileCarouselItem[];
  renderMockup: (id: string) => React.ReactNode;
  /** Ignored by the mono theme — kept for API compatibility. */
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

  return (
    <div>
      {/* Icon strip — native scroll-snap, no JS-driven motion */}
      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        className="flex gap-1 overflow-x-auto -mx-4 px-4 border-b border-rule"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {items.map((item, i) => {
          const Icon = item.icon;
          const isActive = i === activeIndex;
          return (
            <button
              key={item.id}
              ref={(el) => { cardRefs.current[i] = el; }}
              onClick={() => scrollToIndex(i)}
              aria-current={isActive ? 'true' : undefined}
              className={`relative shrink-0 flex flex-col items-center gap-1.5 px-3 pt-2 pb-3 cursor-pointer transition-colors duration-150 ease-out ${
                isActive ? 'text-ink' : 'text-ink-muted'
              }`}
              style={{ scrollSnapAlign: 'center', minWidth: 78 }}
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
              <span
                className={`text-[11px] text-center leading-tight max-w-16 ${isActive ? 'font-semibold' : 'font-medium'}`}
              >
                {item.label}
              </span>
              {/* 2px ink indicator */}
              <span
                aria-hidden
                className={`absolute left-2 right-2 -bottom-px h-0.5 bg-ink transition-opacity duration-150 ease-out ${
                  isActive ? 'opacity-100' : 'opacity-0'
                }`}
              />
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
            className={`rounded-full cursor-pointer transition-all duration-150 ease-out ${
              i === activeIndex ? 'bg-gold' : 'bg-rule-strong'
            }`}
            style={{
              width: i === activeIndex ? 16 : 6,
              height: 6,
            }}
          />
        ))}
      </div>

      {/* Active feature heading */}
      <div className="flex items-center gap-3 mb-3">
        <div className="h-8 w-8 rounded-md border border-rule bg-paper-deep flex items-center justify-center shrink-0">
          {(() => {
            const Icon = active.icon;
            return <Icon className="h-4 w-4 text-ink" strokeWidth={1.75} />;
          })()}
        </div>
        <div>
          <p className="card-title">{active.label}</p>
          <p className="text-[12px] text-ink-muted">{active.tagline}</p>
        </div>
      </div>

      {/* Mockup — direct swap, no opacity-fade timer */}
      <div style={{ minHeight: 260 }}>
        {renderMockup(active.id)}
      </div>
    </div>
  );
}
