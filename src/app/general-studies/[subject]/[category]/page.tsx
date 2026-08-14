import type { Metadata } from 'next';
import { generalStudiesService } from '@/services/general-studies.service';
import { GSCategoryClient } from './GSCategoryClient';

type Props = { params: Promise<{ subject: string; category: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subject: subjectSlug, category: categorySlug } = await params;
  try {
    const [subjects, categories] = await Promise.all([
      generalStudiesService.getSubjects(),
      generalStudiesService.getCategories(subjectSlug),
    ]);
    const subject = subjects.find((s) => s.slug === subjectSlug);
    const category = categories.find((c) => c.slug === categorySlug);
    if (!subject || !category) return {};

    const title = `${category.name} — ${subject.name}`;
    const description = `Major topics, events & developments in ${category.name} (${subject.name}) for UPSC preparation.`;
    return {
      title,
      description,
      alternates: { canonical: `/general-studies/${subjectSlug}/${categorySlug}` },
      openGraph: { title, description, type: 'website', url: `/general-studies/${subjectSlug}/${categorySlug}` },
    };
  } catch {
    return {};
  }
}

export default function GSCategoryPage() {
  return <GSCategoryClient />;
}
