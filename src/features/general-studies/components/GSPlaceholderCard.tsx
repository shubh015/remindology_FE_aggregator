import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

// Flat slop-style card: a grey visual strip holding an ink outline icon,
// then title, description and a "Read Now" link. Fixed visual height so
// grid rows stay aligned regardless of title length.
export function GSPlaceholderCard({
  title, description, href, icon: Icon,
}: {
  title: string;
  description: string;
  href: string;
  /** @deprecated Ignored: all cards are monochrome. Kept for API compatibility. */
  accentColor?: string;
  icon: LucideIcon;
}) {
  return (
    <Link href={href} className="ks-card">
      <div className="ks-card-visual h-[120px]!">
        <Icon className="h-10 w-10 text-ink" strokeWidth={1.25} aria-hidden="true" />
      </div>
      <div className="ks-card-body">
        <p className="ks-card-title truncate">{title}</p>
        <p className="ks-card-desc line-clamp-2">{description}</p>
        <span className="ks-card-link">Read Now</span>
      </div>
    </Link>
  );
}
