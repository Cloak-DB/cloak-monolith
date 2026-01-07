import type { Metadata } from 'next';
import type { Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/heroes/Hero';
import { HowItWorks } from '@/components/sections/HowItWorks';
import { EmailCapture } from '@/components/sections/EmailCapture';
import { Footer } from '@/components/sections/Footer';

// Canonical domain - no www, with hyphen
const CANONICAL_DOMAIN = 'https://cloak-db.com';

const metadataByLocale = {
  en: {
    title: 'Cloak DB - Production-Realistic Database Seeding for Development',
    description:
      'Local-first, open-source tool for restoring production database snapshots to development with anonymization, smart filtering, and reusable test scenarios. Work with realistic data locally. No cloud dependency.',
    keywords: [
      'database seeding',
      'test data',
      'database anonymization',
      'QA tools',
      'development tools',
      'PostgreSQL',
      'local-first',
      'data privacy',
      'test scenarios',
      'production data',
    ] as string[],
  },
  fr: {
    title:
      'Cloak DB - Population Réaliste de Base de Données pour le Développement',
    description:
      'Outil open-source local pour restaurer les snapshots de base de données de production en développement avec anonymisation, filtrage intelligent et scénarios de test réutilisables. Travaillez avec des données réalistes localement.',
    keywords: [
      'ensemencement base de données',
      'données de test',
      'anonymisation base de données',
      'outils QA',
      'outils développement',
      'PostgreSQL',
      'local-first',
      'confidentialité données',
      'scénarios test',
      'données production',
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
          alt: 'Cloak DB - Production-Realistic Database Seeding',
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
        ? 'Local-first, open-source tool for restoring production database snapshots to development with anonymization, smart filtering, and reusable test scenarios.'
        : 'Outil open-source local pour restaurer les snapshots de base de données de production en développement avec anonymisation, filtrage intelligent et scénarios de test réutilisables.',
    featureList: [
      'Database schema introspection',
      'Data anonymization',
      'Smart filtering',
      'Reusable test scenarios',
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
        <Navbar locale={locale} dict={dict.navbar} />
        <main id="main-content">
          <Hero dict={dict.hero} locale={locale} />
          <HowItWorks dict={dict.howItWorks} />
          <EmailCapture dict={dict.emailCapture} locale={locale} />
        </main>
        <Footer dict={dict.footer} locale={locale} />
      </div>
    </>
  );
}
