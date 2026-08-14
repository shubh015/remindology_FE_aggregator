import type { Metadata } from 'next';
import { cache } from 'react';
import { generalStudiesService } from '@/services/general-studies.service';
import { GSArticleDetailClient } from './ArticleDetailClient';

type Props = { params: Promise<{ slug: string }> };

const SITE_URL = 'https://www.remindology.com';

function stripHtml(text: string): string {
  return text.includes('<') ? text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : text;
}

// cache() dedupes this across generateMetadata and the page component within
// a single request — the underlying axios client isn't covered by Next's
// automatic fetch() memoization, so without this it would fetch twice.
const getArticle = cache((slug: string) => generalStudiesService.getArticleBySlug(slug));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const article = await getArticle(slug);
    const description = stripHtml(article.summary || '').slice(0, 160) || undefined;
    const title = `${article.title} — General Studies`;
    return {
      title,
      description,
      alternates: { canonical: `/general-studies/articles/${slug}` },
      openGraph: {
        title,
        description,
        type: 'article',
        url: `/general-studies/articles/${slug}`,
      },
    };
  } catch {
    // Falls back to root layout's metadata if the article can't be fetched
    // (e.g. bad slug, backend momentarily down) — never breaks the page render.
    return {};
  }
}

export default async function GSArticlePage({ params }: Props) {
  const { slug } = await params;

  let jsonLd: string | null = null;
  try {
    const article = await getArticle(slug);
    const description = stripHtml(article.summary || '').slice(0, 300);
    const data = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.title,
      description,
      datePublished: article.publishedAt,
      dateModified: article.updatedAt || article.publishedAt,
      author: { '@type': 'Organization', name: 'Remindology' },
      publisher: {
        '@type': 'Organization',
        name: 'Remindology',
        logo: { '@type': 'ImageObject', url: `${SITE_URL}/opengraph-image` },
      },
      mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/general-studies/articles/${slug}` },
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
      <GSArticleDetailClient />
    </>
  );
}
