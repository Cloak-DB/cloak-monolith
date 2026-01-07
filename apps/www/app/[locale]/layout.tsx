import type { Metadata } from 'next';
import './globals.css';
import { locales, type Locale } from '@/lib/i18n/config';
import localFont from 'next/font/local';
import { PageViewTracker } from '@/lib/analytics/PageViewTracker';
import { CookieConsent } from '@/components/cookie-consent/CookieConsent';
import { GoogleAnalytics } from '@/lib/analytics/GoogleAnalytics';

// Canonical domain - no www, with hyphen
const CANONICAL_DOMAIN = 'https://cloak-db.com';

const epilogue = localFont({
  src: '../../public/fonts/Epilogue/Epilogue-VariableFont_wght.ttf',
  variable: '--font-epilogue',
  weight: '100 900',
  display: 'swap',
});

const lexendMega = localFont({
  src: '../../public/fonts/Lexend_Mega/LexendMega-VariableFont_wght.ttf',
  variable: '--font-lexend-mega',
  weight: '100 900',
  display: 'swap',
});

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

const metadataByLocale = {
  en: {
    title: 'Cloak DB - Production-Realistic Database Seeding',
    description:
      'Local-first, open-source tool for restoring production database snapshots to development with anonymization, smart filtering, and reusable test scenarios.',
    ogLocale: 'en_US',
  },
  fr: {
    title: 'Cloak DB - Population de base de données réaliste',
    description:
      'Outil open-source local pour restaurer les snapshots de base de données de production en développement avec anonymisation, filtrage intelligent et scénarios de test réutilisables.',
    ogLocale: 'fr_FR',
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
    keywords: [
      'database',
      'anonymization',
      'seeding',
      'testing',
      'development',
      'postgresql',
      'privacy',
    ],
    authors: [{ name: 'Cloak DB' }],
    creator: 'Cloak DB',
    publisher: 'Cloak DB',
    metadataBase: new URL(CANONICAL_DOMAIN),
    alternates: {
      canonical: locale === 'en' ? '/' : `/${locale}`,
      languages: {
        en: '/',
        fr: '/fr',
      },
    },
    openGraph: {
      type: 'website',
      locale: meta.ogLocale,
      url: locale === 'en' ? CANONICAL_DOMAIN : `${CANONICAL_DOMAIN}/${locale}`,
      title: meta.title,
      description: meta.description,
      siteName: 'Cloak DB',
      images: [
        {
          url:
            locale === 'en'
              ? `${CANONICAL_DOMAIN}/images/og-default-en.png`
              : `${CANONICAL_DOMAIN}/images/og-default-fr.png`,
          width: 1200,
          height: 630,
          alt: 'Cloak DB - Local-First Database Seeding',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description,
      images: [
        locale === 'en'
          ? `${CANONICAL_DOMAIN}/images/og-default-en.png`
          : `${CANONICAL_DOMAIN}/images/og-default-fr.png`,
      ],
    },
    icons: {
      icon: [
        { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
        { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      ],
      apple: [
        { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      ],
    },
    manifest: '/site.webmanifest',
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale = localeParam as Locale;

  return (
    <html
      lang={locale}
      className={`${epilogue.variable} ${lexendMega.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="preload" href="/logo.svg" as="image" type="image/svg+xml" />
        <link
          rel="preload"
          href="/fonts/Lexend_Mega/LexendMega-VariableFont_wght.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/Epilogue/Epilogue-VariableFont_wght.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme') || 
                  (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                document.documentElement.classList.toggle('dark', theme === 'dark');
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="font-sans overflow-x-hidden">
        <GoogleAnalytics />
        <PageViewTracker />
        {children}
        <CookieConsent locale={locale} />
      </body>
    </html>
  );
}
