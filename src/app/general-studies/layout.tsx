import { PublicLayout } from '@/components/landing/PublicLayout';

export default function GeneralStudiesPublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PublicLayout tagline="AI-curated General Studies notes for UPSC, SSC & State PSCs">
      {children}
    </PublicLayout>
  );
}
