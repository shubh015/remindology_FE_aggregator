import type { MetadataRoute } from 'next';

const SITE_URL = 'https://www.remindology.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/',
        '/dashboard',
        '/ai-mentor',
        '/contents',
        '/daily-challenge',
        '/mains',
        '/onboarding',
        '/profile',
        '/revision-trail',
        '/study-plan',
        '/subject-mcqs',
        '/forgot-password',
        '/reset-password',
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
