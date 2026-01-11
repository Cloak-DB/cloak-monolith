import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import type { Locale } from '@/lib/i18n/config';
import { getDocBySlug, getDocSlugs, getAllDocs } from '@/lib/mdx';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { DocsPageClient } from './DocsPageClient';
import { DocsContent } from './DocsContent';
import { CANONICAL_DOMAIN } from '@/lib/site';

export async function generateStaticParams() {
  const locales = ['en', 'fr'] as const;
  const params = [];

  for (const locale of locales) {
    const slugs = getDocSlugs(locale);
    for (const slug of slugs) {
      params.push({ locale, slug: [slug] });
    }
    params.push({ locale, slug: [] });
  }

  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug?: string[] }>;
}): Promise<Metadata> {
  const { locale: localeParam, slug } = await params;
  const locale = localeParam as Locale;
  const slugString = slug?.[0] || 'getting-started';
  const doc = getDocBySlug(slugString, locale);

  if (!doc) {
    return {
      title: 'Page Not Found - Cloak DB Docs',
    };
  }

  const title = `${doc.meta.title} | Cloak DB Documentation`;
  const description =
    doc.meta.description ||
    `Learn about ${doc.meta.title} in Cloak DB. Production-realistic database seeding for development environments.`;
  const canonical =
    locale === 'en' ? `/docs/${slugString}` : `/${locale}/docs/${slugString}`;

  return {
    title,
    description,
    keywords: [
      'Cloak DB documentation',
      'database seeding guide',
      'PostgreSQL tutorial',
      'database anonymization',
      'test data',
      doc.meta.title.toLowerCase(),
    ],
    openGraph: {
      title,
      description,
      type: 'article',
      locale: locale === 'en' ? 'en_US' : 'fr_FR',
      url: `${CANONICAL_DOMAIN}${canonical}`,
      siteName: 'Cloak DB',
      images: [
        {
          url:
            locale === 'en'
              ? '/images/og-docs-en.png'
              : '/images/og-docs-fr.png',
          width: 1200,
          height: 630,
          alt: `${doc.meta.title} - Cloak DB Documentation`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [
        locale === 'en' ? '/images/og-docs-en.png' : '/images/og-docs-fr.png',
      ],
    },
    alternates: {
      canonical,
      languages: {
        en: `/docs/${slugString}`,
        fr: `/fr/docs/${slugString}`,
      },
    },
  };
}

export default async function DocsPage({
  params,
}: {
  params: Promise<{ locale: string; slug?: string[] }>;
}) {
  const { locale: localeParam, slug } = await params;
  const locale = localeParam as Locale;
  const slugString = slug?.[0] || 'getting-started';

  const doc = getDocBySlug(slugString, locale);
  if (!doc) notFound();

  const allDocs = getAllDocs(locale);
  const basePath = locale === 'en' ? '' : `/${locale}`;
  const dict = await getDictionary(locale);

  const renderedContent = <DocsContent content={doc.content} />;

  return (
    <DocsPageClient
      locale={locale}
      slugString={slugString}
      docTitle={doc.meta.title}
      renderedContent={renderedContent}
      allDocs={allDocs}
      basePath={basePath}
      navbarDict={dict.navbar}
    />
  );
}
