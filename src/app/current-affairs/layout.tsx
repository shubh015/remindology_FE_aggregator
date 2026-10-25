import { PublicLayout } from '@/components/landing/PublicLayout';

export default function CurrentAffairsPublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PublicLayout tagline="AI-curated current affairs for UPSC, SSC & State PSCs · Published every morning">
      {children}
    </PublicLayout>
  );
}
