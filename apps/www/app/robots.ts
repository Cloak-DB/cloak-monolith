import { MetadataRoute } from 'next';

// Canonical domain - no www, with hyphen
const CANONICAL_DOMAIN = 'https://cloak-db.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/design-system/'],
    },
    sitemap: `${CANONICAL_DOMAIN}/sitemap.xml`,
  };
}
