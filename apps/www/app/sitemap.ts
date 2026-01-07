import { MetadataRoute } from 'next';

// Canonical domain - no www, with hyphen
const CANONICAL_DOMAIN = 'https://cloak-db.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = CANONICAL_DOMAIN;
  const lastModified = new Date();

  const routes = [
    '',
    '/fr',
    '/docs',
    '/fr/docs',
    '/docs/getting-started',
    '/fr/docs/getting-started',
    '/privacy',
    '/fr/privacy',
    '/terms',
    '/fr/terms',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified,
    changeFrequency:
      route.includes('privacy') || route.includes('terms')
        ? 'monthly'
        : 'weekly',
    priority:
      route === '' || route === '/fr' ? 1 : route.includes('docs') ? 0.8 : 0.5,
  }));
}
