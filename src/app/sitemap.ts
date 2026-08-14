import type { MetadataRoute } from 'next';
import { currentAffairsService } from '@/services/current-affairs.service';
import { generalStudiesService } from '@/services/general-studies.service';

const SITE_URL = 'https://www.remindology.com';

const STATIC_ROUTES: MetadataRoute.Sitemap = [
  { url: `${SITE_URL}/`, changeFrequency: 'daily', priority: 1 },
  { url: `${SITE_URL}/current-affairs`, changeFrequency: 'daily', priority: 0.9 },
  { url: `${SITE_URL}/current-affairs/places-in-news`, changeFrequency: 'daily', priority: 0.7 },
  { url: `${SITE_URL}/general-studies`, changeFrequency: 'weekly', priority: 0.8 },
  { url: `${SITE_URL}/privacy`, changeFrequency: 'yearly', priority: 0.2 },
  { url: `${SITE_URL}/terms`, changeFrequency: 'yearly', priority: 0.2 },
];

// Recent-articles window rather than the full historical archive — the
// current-affairs API has no unbounded "list everything" endpoint, and a
// rolling window of the latest content is what search engines actually
// need re-crawled; older articles have typically already been indexed once.
const RECENT_CURRENT_AFFAIRS_LIMIT = 200;

async function getCurrentAffairsEntries(): Promise<MetadataRoute.Sitemap> {
  try {
    const articles = await currentAffairsService.getRecent(RECENT_CURRENT_AFFAIRS_LIMIT);
    return articles.map((a) => ({
      url: `${SITE_URL}/current-affairs/${a.id}`,
      lastModified: a.publishedDate || undefined,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));
  } catch {
    return [];
  }
}

async function getGeneralStudiesEntries(): Promise<MetadataRoute.Sitemap> {
  try {
    const subjects = await generalStudiesService.getSubjects();
    const entries: MetadataRoute.Sitemap = [];

    for (const subject of subjects) {
      entries.push({
        url: `${SITE_URL}/general-studies/${subject.slug}`,
        changeFrequency: 'weekly',
        priority: 0.7,
      });

      const categories = await generalStudiesService.getCategories(subject.slug);
      if (categories.length === 0) {
        const articles = await generalStudiesService.getArticlesBySubject(subject.slug);
        for (const article of articles) {
          entries.push({
            url: `${SITE_URL}/general-studies/articles/${article.slug}`,
            lastModified: article.updatedAt || article.publishedAt || undefined,
            changeFrequency: 'monthly',
            priority: 0.6,
          });
        }
        continue;
      }

      for (const category of categories) {
        entries.push({
          url: `${SITE_URL}/general-studies/${subject.slug}/${category.slug}`,
          changeFrequency: 'weekly',
          priority: 0.6,
        });
        const articles = await generalStudiesService.getArticles(subject.slug, category.slug);
        for (const article of articles) {
          entries.push({
            url: `${SITE_URL}/general-studies/articles/${article.slug}`,
            lastModified: article.updatedAt || article.publishedAt || undefined,
            changeFrequency: 'monthly',
            priority: 0.6,
          });
        }
      }
    }

    return entries;
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [currentAffairsEntries, generalStudiesEntries] = await Promise.all([
    getCurrentAffairsEntries(),
    getGeneralStudiesEntries(),
  ]);

  return [...STATIC_ROUTES, ...currentAffairsEntries, ...generalStudiesEntries];
}
