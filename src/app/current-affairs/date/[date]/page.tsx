import type { Metadata } from 'next';
import { currentAffairsService } from '@/services/current-affairs.service';
import { DailyDigestClient } from './DailyDigestClient';

type Props = { params: Promise<{ date: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { date } = await params;
  try {
    const articles = await currentAffairsService.getByDate(date);
    const d = new Date(`${date}T00:00:00`);
    const displayDate = isNaN(d.getTime())
      ? date
      : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    const title = `Current Affairs — ${displayDate}`;
    const description = articles.length > 0
      ? `${articles.length} UPSC, SSC & State PSC current affairs ${articles.length === 1 ? 'story' : 'stories'} for ${displayDate}, GS paper tagged with key facts and mains angles.`
      : `Current affairs digest for ${displayDate}.`;
    return {
      title,
      description,
      alternates: { canonical: `/current-affairs/date/${date}` },
      openGraph: { title, description, type: 'website', url: `/current-affairs/date/${date}` },
    };
  } catch {
    return {};
  }
}

export default function DailyDigestPage() {
  return <DailyDigestClient />;
}
