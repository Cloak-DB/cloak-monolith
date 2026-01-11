/**
 * Site configuration - single source of truth for site-wide constants
 */

/**
 * The canonical domain for the site.
 * Used for SEO metadata, sitemaps, robots.txt, and structured data.
 *
 * IMPORTANT: This must match your hosting redirect configuration.
 * If Vercel/DNS redirects to www, use 'https://www.cloak-db.com'
 * If Vercel/DNS redirects to non-www, use 'https://cloak-db.com'
 */
export const CANONICAL_DOMAIN = 'https://www.cloak-db.com';

export const SITE_NAME = 'Cloak DB';

export const SITE_DESCRIPTION = {
  en: 'Open-source Postgres studio built for development. Time Machine, Resource Inspector, and data anonymization.',
  fr: 'Studio Postgres open-source conçu pour le développement. Time Machine, Resource Inspector et anonymisation des données.',
} as const;
