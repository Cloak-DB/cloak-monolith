import type { Metadata } from 'next';
import type { Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { Footer } from '@/components/sections/Footer';
import { HomeClient } from './client';
import { CANONICAL_DOMAIN } from '@/lib/site';

const metadataByLocale = {
  en: {
    title: 'Cloak DB - Postgres Studio for Development',
    description:
      'Open-source Postgres studio with Time Machine, Resource Inspector, and data anonymization. Develop with confidence. Ship faster.',
    keywords: [
      'postgres studio',
      'database development',
      'time machine',
      'database snapshots',
      'data anonymization',
      'PostgreSQL',
      'development tools',
      'database debugging',
      'open source',
    ] as string[],
  },
  fr: {
    title: 'Cloak DB - Studio Postgres pour le Développement',
    description:
      'Studio Postgres open-source avec Time Machine, Inspecteur de Ressources et anonymisation des données. Développez avec confiance. Livrez plus vite.',
    keywords: [
      'studio postgres',
      'développement base de données',
      'time machine',
      'snapshots base de données',
      'anonymisation données',
      'PostgreSQL',
      'outils développement',
      'débogage base de données',
      'open source',
    ] as string[],
  },
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = localeParam as Locale;
  const meta = metadataByLocale[locale];

  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    openGraph: {
      title: meta.title,
      description: meta.description,
      type: 'website',
      locale: locale === 'en' ? 'en_US' : 'fr_FR',
      url: locale === 'en' ? CANONICAL_DOMAIN : `${CANONICAL_DOMAIN}/fr`,
      siteName: 'Cloak DB',
      images: [
        {
          url:
            locale === 'en'
              ? `${CANONICAL_DOMAIN}/images/og-home-en.png`
              : `${CANONICAL_DOMAIN}/images/og-home-fr.png`,
          width: 1200,
          height: 630,
          alt: 'Cloak DB - Postgres Studio for Development',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description,
      images: [
        locale === 'en'
          ? `${CANONICAL_DOMAIN}/images/og-home-en.png`
          : `${CANONICAL_DOMAIN}/images/og-home-fr.png`,
      ],
    },
    alternates: {
      canonical: locale === 'en' ? '/' : `/${locale}`,
      languages: {
        en: '/',
        fr: '/fr',
      },
    },
  };
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale = localeParam as Locale;
  const dict = await getDictionary(locale);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Cloak DB',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Cross-platform',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    description:
      locale === 'en'
        ? 'Open-source Postgres studio with Time Machine, Resource Inspector, and data anonymization. Develop with confidence.'
        : 'Studio Postgres open-source avec Time Machine, Inspecteur de Ressources et anonymisation des données. Développez avec confiance.',
    featureList: [
      'Time Machine - Database state snapshots',
      'Resource Inspector - Instant relationship visualization',
      'Data anonymization',
      'PostgreSQL support',
    ],
    softwareVersion: 'Beta',
    url: locale === 'en' ? CANONICAL_DOMAIN : `${CANONICAL_DOMAIN}/fr`,
    screenshot: `${CANONICAL_DOMAIN}/images/og-image.png`,
    author: {
      '@type': 'Organization',
      name: 'Cloak DB',
      url: CANONICAL_DOMAIN,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen flex flex-col">
        <HomeClient
          locale={locale}
          dict={{
            navbar: dict.navbar,
            hero: dict.hero,
            differentiators: dict.differentiators,
            problemSolution: dict.problemSolution,
            whyNow: dict.whyNow,
            emailCapture: dict.emailCapture,
          }}
        />
        <Footer dict={dict.footer} locale={locale} />
      </div>
    </>
  );
}
