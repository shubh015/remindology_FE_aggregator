import { PublicLayout } from '@/components/landing/PublicLayout';

export default function CoursesPublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PublicLayout tagline="Exam pattern, booklists & notifications for UPSC, SSC & State PSCs">
      {children}
    </PublicLayout>
  );
}
