'use client';

import { type ReactNode, useState } from 'react';
import Link from 'next/link';
import { Button } from '@cloak/ui/components/button';
import { ArrowRight, Sparkles, Menu, X } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { useAnalytics } from '@/lib/analytics/client';
import type { Locale } from '@/lib/i18n/config';
import type { DocContent } from '@/lib/mdx';

// Canonical domain - no www, with hyphen
const CANONICAL_DOMAIN = 'https://cloak-db.com';

type DocsPageClientProps = {
  locale: Locale;
  slugString: string;
  docTitle: string;
  renderedContent: ReactNode;
  allDocs: DocContent[];
  basePath: string;
  navbarDict: {
    docs: string;
    github: string;
    getStarted: string;
  };
};

const betaBannerContent = {
  en: {
    badge: 'Beta Access',
    title: 'Join the Beta Program',
    description:
      'Cloak DB is currently in beta. Get early access and help shape the future of database seeding.',
    buttonText: 'Request Beta Access',
    home: 'Home',
    docs: 'Documentation',
  },
  fr: {
    badge: 'Accès Bêta',
    title: 'Rejoindre le Programme Bêta',
    description:
      "Cloak DB est actuellement en bêta. Obtenez un accès anticipé et aidez à façonner l'avenir du seeding de bases de données.",
    buttonText: "Demander l'Accès Bêta",
    home: 'Accueil',
    docs: 'Documentation',
  },
};

export function DocsPageClient({
  locale,
  slugString,
  docTitle,
  renderedContent,
  allDocs,
  basePath,
  navbarDict,
}: DocsPageClientProps) {
  const { track } = useAnalytics();
  const dict = locale === 'fr' ? betaBannerContent.fr : betaBannerContent.en;
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handleJoinBeta = () => {
    track('button_clicked', {
      button_id: 'join_beta',
      location: 'docs_banner',
      page: slugString,
      destination: '/#beta',
    });
    window.location.href = locale === 'en' ? '/#beta' : `/${locale}/#beta`;
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: dict.home,
        item:
          locale === 'en' ? CANONICAL_DOMAIN : `${CANONICAL_DOMAIN}/${locale}`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: dict.docs,
        item:
          locale === 'en'
            ? `${CANONICAL_DOMAIN}/docs`
            : `${CANONICAL_DOMAIN}/${locale}/docs`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: docTitle,
        item:
          locale === 'en'
            ? `${CANONICAL_DOMAIN}/docs/${slugString}`
            : `${CANONICAL_DOMAIN}/${locale}/docs/${slugString}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="min-h-screen flex flex-col">
        <Navbar locale={locale} dict={navbarDict} />

        <div className="flex flex-1">
          {/* Mobile Docs Navigation Toggle */}
          <div className="lg:hidden fixed bottom-4 right-4 z-50">
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="flex items-center justify-center w-14 h-14 bg-yellow-500 border-2 border-black dark:border-yellow-500 shadow-[4px_4px_0px_theme(colors.black)] dark:shadow-[4px_4px_0px_rgba(234,179,8,0.3)] hover:shadow-[6px_6px_0px_theme(colors.black)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200"
              aria-label={
                mobileNavOpen
                  ? 'Close documentation menu'
                  : 'Open documentation menu'
              }
              aria-expanded={mobileNavOpen}
            >
              {mobileNavOpen ? (
                <X size={24} strokeWidth={2.5} className="text-black" />
              ) : (
                <Menu size={24} strokeWidth={2.5} className="text-black" />
              )}
            </button>
          </div>

          {/* Mobile Docs Navigation Drawer */}
          {mobileNavOpen && (
            <div
              className="lg:hidden fixed inset-0 top-[73px] z-40 bg-black/50"
              onClick={() => setMobileNavOpen(false)}
            >
              <aside
                className="absolute left-0 top-0 bottom-0 w-72 bg-white dark:bg-gray-950 border-r-2 border-black dark:border-white p-6 pt-4 overflow-y-auto animate-slide-in"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-lg text-black dark:text-white">
                    Documentation
                  </h2>
                  <button
                    onClick={() => setMobileNavOpen(false)}
                    className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    aria-label="Close menu"
                  >
                    <X size={20} strokeWidth={2.5} />
                  </button>
                </div>
                <nav>
                  <ul className="space-y-2">
                    {allDocs.map((d) => (
                      <li key={d.meta.slug}>
                        <Link
                          href={`${basePath}/docs/${d.meta.slug}`}
                          onClick={() => {
                            setMobileNavOpen(false);
                            track('link_clicked', {
                              link_type: 'docs_nav_mobile',
                              from_page: slugString,
                              to_page: d.meta.slug,
                            });
                          }}
                          className={`block p-3 rounded-lg border-2 transition text-base ${
                            d.meta.slug === slugString
                              ? 'border-yellow-500 bg-yellow-500 dark:bg-transparent text-black dark:text-yellow-500 font-bold'
                              : 'border-transparent hover:border-yellow-500 hover:text-yellow-500'
                          }`}
                        >
                          {d.meta.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              </aside>
            </div>
          )}

          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 border-r-2 border-black dark:border-white p-6 bg-white dark:bg-gray-950">
            <h2 className="font-bold text-lg mb-4 text-black dark:text-white">
              Documentation
            </h2>
            <nav>
              <ul className="space-y-2">
                {allDocs.map((d) => (
                  <li key={d.meta.slug}>
                    <Link
                      href={`${basePath}/docs/${d.meta.slug}`}
                      onClick={() =>
                        track('link_clicked', {
                          link_type: 'docs_nav',
                          from_page: slugString,
                          to_page: d.meta.slug,
                        })
                      }
                      className={`block p-2 rounded-lg border-2 transition ${
                        d.meta.slug === slugString
                          ? 'border-yellow-500 bg-yellow-500 dark:bg-transparent text-black dark:text-yellow-500 font-bold'
                          : 'border-transparent hover:border-yellow-500 hover:text-yellow-500'
                      }`}
                    >
                      {d.meta.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          <main className="flex-1 bg-white dark:bg-gray-950 min-w-0">
            {/* Breadcrumbs */}
            <nav
              aria-label="Breadcrumb"
              className="border-b-2 border-black dark:border-white bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 py-3 overflow-x-auto"
            >
              <ol className="max-w-4xl mx-auto flex items-center space-x-2 text-sm font-bold text-gray-600 dark:text-gray-400 whitespace-nowrap">
                <li className="flex-shrink-0">
                  <Link
                    href={basePath}
                    className="hover:text-yellow-600 dark:hover:text-yellow-500 transition-colors"
                  >
                    {dict.home}
                  </Link>
                </li>
                <li aria-hidden="true" className="flex-shrink-0">
                  /
                </li>
                <li className="flex-shrink-0">
                  <Link
                    href={`${basePath}/docs`}
                    className="hover:text-yellow-600 dark:hover:text-yellow-500 transition-colors"
                  >
                    {dict.docs}
                  </Link>
                </li>
                <li aria-hidden="true" className="flex-shrink-0">
                  /
                </li>
                <li
                  className="text-black dark:text-white truncate"
                  aria-current="page"
                >
                  {docTitle}
                </li>
              </ol>
            </nav>

            <div
              id="main-content"
              className="border-b-2 border-black dark:border-white bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10 p-6"
            >
              <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-start md:items-center gap-4 justify-between">
                <div className="flex-1">
                  <div className="inline-block bg-gradient-to-r from-yellow-400 to-orange-400 border-2 border-black dark:border-yellow-500 text-black dark:text-black px-2 py-1 font-black text-xs uppercase rotate-[-1deg] shadow-[2px_2px_0px_theme(colors.black)] dark:shadow-[2px_2px_0px_rgba(234,179,8,0.3)] mb-3">
                    <Sparkles className="inline w-3 h-3 mr-1 mb-0.5" />
                    {dict.badge}
                  </div>
                  <h3 className="text-xl font-black text-black dark:text-white mb-1">
                    {dict.title}
                  </h3>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {dict.description}
                  </p>
                </div>
                <Button
                  onClick={handleJoinBeta}
                  variant="yellow"
                  className="font-black uppercase group whitespace-nowrap"
                >
                  {dict.buttonText}
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </div>
            </div>

            <div className="p-4 sm:p-6 md:p-8 lg:p-12 max-w-4xl mx-auto">
              {renderedContent}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
