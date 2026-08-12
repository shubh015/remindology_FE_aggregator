import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// A "photo card" that doesn't need a photo — a gradient + dot-texture +
// large faded icon cover, styled to read as an image without one. Fixed
// height throughout so title-length variance never changes the card's
// footprint (grid rows stay aligned).
export function GSPlaceholderCard({
  title, description, href, accentColor, icon: Icon,
}: {
  title: string;
  description: string;
  href: string;
  accentColor: string;
  icon: LucideIcon;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-2xl bg-white overflow-hidden transition-all hover:-translate-y-1"
      style={{ border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', height: 300 }}
    >
      {/* Cover — gradient + dot texture + oversized faded icon */}
      <div
        className="relative shrink-0 overflow-hidden"
        style={{ height: 140, background: `linear-gradient(135deg, ${accentColor}26, ${accentColor}0A)` }}
      >
        <div
          className="absolute inset-0"
          style={{ backgroundImage: `radial-gradient(circle, ${accentColor}33 1px, transparent 1px)`, backgroundSize: '18px 18px' }}
        />
        <Icon
          className="absolute transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
          style={{ color: accentColor, opacity: 0.22, height: 108, width: 108, right: -20, bottom: -24 }}
        />
        <div
          className="absolute top-3 left-3 h-9 w-9 rounded-xl flex items-center justify-center"
          style={{ background: '#FFFFFF', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
        >
          <Icon className="h-4.5 w-4.5" style={{ color: accentColor }} />
        </div>
      </div>

      {/* Text zone */}
      <div className="flex-1 flex flex-col p-5 min-h-0">
        <p
          className="font-bold mb-1.5 truncate"
          style={{ fontSize: '1rem', color: '#111827', lineHeight: 1.3 }}
        >
          {title}
        </p>
        <p
          className="text-sm flex-1 overflow-hidden"
          style={{
            color: '#9CA3AF', lineHeight: 1.5,
            display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2,
          }}
        >
          {description}
        </p>
        <span
          className="inline-flex items-center gap-1.5 text-xs font-bold mt-3 transition-transform group-hover:translate-x-0.5"
          style={{ color: accentColor }}
        >
          Read Now
          <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  );
}
