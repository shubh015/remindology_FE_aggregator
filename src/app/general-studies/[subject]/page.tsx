import type { Metadata } from 'next';
import { generalStudiesService } from '@/services/general-studies.service';
import { GSSubjectClient } from './GSSubjectClient';

type Props = { params: Promise<{ subject: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subject: subjectSlug } = await params;
  try {
    const subjects = await generalStudiesService.getSubjects();
    const subject = subjects.find((s) => s.slug === subjectSlug);
    if (!subject) return {};

    const title = `${subject.name} — General Studies`;
    const description = `${subject.name} notes for UPSC, SSC & State PSC preparation — structured categories, key points, and mains angles.`;
    return {
      title,
      description,
      alternates: { canonical: `/general-studies/${subjectSlug}` },
      openGraph: { title, description, type: 'website', url: `/general-studies/${subjectSlug}` },
    };
  } catch {
    return {};
  }
}

export default function GSSubjectPage() {
  return <GSSubjectClient />;
}
