import { PublicHeader } from '@/components/landing/PublicHeader';
import { PublicFooter } from '@/components/landing/PublicFooter';

/**
 * Shared shell for every public route (current-affairs, courses,
 * general-studies, …). Replaces the near-duplicate per-route layout.tsx files that
 * previously redeclared the same header/footer markup with a different tagline.
 */
export function PublicLayout({
  children,
  tagline,
}: {
  children: React.ReactNode;
  tagline: string;
}) {
  return (
    <div className="theme-mono relative min-h-screen bg-paper text-ink-soft">
      <PublicHeader />
      {children}
      <PublicFooter tagline={tagline} />
    </div>
  );
}
