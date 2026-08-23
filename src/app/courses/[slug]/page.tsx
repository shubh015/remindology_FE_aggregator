import type { Metadata } from 'next';
import { cache } from 'react';
import { courseService } from '@/services/course.service';
import { CourseDetailClient } from './CourseDetailClient';

type Props = { params: Promise<{ slug: string }> };

// cache() dedupes this across generateMetadata and the page component within a single request.
const getCourse = cache((slug: string) => courseService.getCourseBySlug(slug));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const course = await getCourse(slug);
    const title = `${course.name} — Exam Pattern, Booklist & Notifications`;
    return {
      title,
      description: course.shortDescription || undefined,
      alternates: { canonical: `/courses/${slug}` },
      openGraph: { title, description: course.shortDescription || undefined, type: 'website', url: `/courses/${slug}` },
    };
  } catch {
    return {};
  }
}

export default function CoursePage() {
  return <CourseDetailClient />;
}
