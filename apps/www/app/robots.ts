import { MetadataRoute } from 'next';
import { CANONICAL_DOMAIN } from '@/lib/site';

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
