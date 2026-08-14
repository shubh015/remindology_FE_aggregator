import type { Metadata } from 'next';
import { cache } from 'react';
import { currentAffairsService } from '@/services/current-affairs.service';
import { ArticleDetailClient } from './ArticleDetailClient';

type Props = { params: Promise<{ id: string }> };

const SITE_URL = 'https://www.remindology.com';

function stripHtml(text: string): string {
  return text.includes('<') ? text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : text;
}

// cache() dedupes this across generateMetadata and the page component within
// a single request — the underlying axios client isn't covered by Next's
// automatic fetch() memoization, so without this it would fetch twice.
const getArticle = cache((id: string) => currentAffairsService.getById(id, true));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const article = await getArticle(id);
    const description = stripHtml(article.summary || '').slice(0, 160) || undefined;
    const title = `${article.title} — Current Affairs`;
    return {
      title,
      description,
      alternates: { canonical: `/current-affairs/${id}` },
      openGraph: {
        title,
        description,
        type: 'article',
        url: `/current-affairs/${id}`,
      },
    };
  } catch {
    // Falls back to root layout's metadata if the article can't be fetched
    // (e.g. bad id, backend momentarily down) — never breaks the page render.
    return {};
  }
}

export default async function ArticleDetailPage({ params }: Props) {
  const { id } = await params;

  let jsonLd: string | null = null;
  try {
    const article = await getArticle(id);
    const description = stripHtml(article.summary || '').slice(0, 300);
    const data = {
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      headline: article.title,
      description,
      datePublished: article.publishedDate,
      dateModified: article.publishedDate,
      author: { '@type': 'Organization', name: 'Remindology' },
      publisher: {
        '@type': 'Organization',
        name: 'Remindology',
        logo: { '@type': 'ImageObject', url: `${SITE_URL}/opengraph-image` },
      },
      mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/current-affairs/${id}` },
    };
    // Escape "<" so article content can never break out of the script tag
    // (e.g. a title/summary containing literal "</script>").
    jsonLd = JSON.stringify(data).replace(/</g, '\\u003c');
  } catch {
    jsonLd = null;
  }

  return (
    <>
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      )}
      <ArticleDetailClient />
    </>
  );
}
