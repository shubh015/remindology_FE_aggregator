import { PublicHeader } from '@/components/landing/PublicHeader';
import { PublicFooter } from '@/components/landing/PublicFooter';

/**
 * Shared shell for every Clean Editorial public route (current-affairs, courses,
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
    <div style={{ fontFamily: 'var(--font-poppins), system-ui, sans-serif' }}>
      <PublicHeader />
      {children}
      <PublicFooter tagline={tagline} />
    </div>
  );
}
