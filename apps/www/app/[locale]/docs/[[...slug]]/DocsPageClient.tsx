'use client';

import { type ReactNode, useState, useCallback } from 'react';
import Link from 'next/link';
import { ChevronRight, Menu, X } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { useAnalytics } from '@/lib/analytics/client';
import type { Locale } from '@/lib/i18n/config';
import type { DocContent } from '@/lib/mdx';
import { CANONICAL_DOMAIN } from '@/lib/site';
import { cn } from '@cloak-db/ui/lib/utils';

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

const breadcrumbDict = {
  en: {
    home: 'Home',
    docs: 'Docs',
  },
  fr: {
    home: 'Accueil',
    docs: 'Documentation',
  },
};

// Group docs by category (based on order ranges)
function groupDocs(docs: DocContent[]) {
  const groups: Record<string, DocContent[]> = {
    'Getting Started': [],
    'Studio Features': [],
    Reference: [],
  };

  docs.forEach((doc) => {
    const order = doc.meta.order || 999;
    if (order <= 1) {
      groups['Getting Started'].push(doc);
    } else if (order <= 3) {
      groups['Studio Features'].push(doc);
    } else {
      groups['Reference'].push(doc);
    }
  });

  // Filter out empty groups
  return Object.entries(groups).filter(([, docs]) => docs.length > 0);
}

type TableOfContentsProps = {
  headings: Array<{ id: string; text: string; level: number }>;
  activeId: string | null;
};

function TableOfContents({ headings, activeId }: TableOfContentsProps) {
  if (headings.length === 0) return null;

  return (
    <nav className="space-y-1">
      <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
        On this page
      </h4>
      <ul className="space-y-1">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              className={cn(
                'block text-sm py-1 transition-colors',
                heading.level === 3 && 'pl-3',
                activeId === heading.id
                  ? 'text-yellow-600 dark:text-yellow-500 font-medium'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white',
              )}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

type SidebarSectionProps = {
  title: string;
  docs: DocContent[];
  currentSlug: string;
  basePath: string;
  defaultOpen?: boolean;
  onNavigate?: () => void;
};

function SidebarSection({
  title,
  docs,
  currentSlug,
  basePath,
  defaultOpen = false,
  onNavigate,
}: SidebarSectionProps) {
  const hasActivePage = docs.some((d) => d.meta.slug === currentSlug);
  const [isOpen, setIsOpen] = useState(defaultOpen || hasActivePage);
  const { track } = useAnalytics();

  return (
    <div className="mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left py-1.5 group"
      >
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
          {title}
        </span>
        <ChevronRight
          className={cn(
            'w-4 h-4 text-gray-400 transition-transform duration-200',
            isOpen && 'rotate-90',
          )}
        />
      </button>
      <div
        className={cn(
          'grid transition-all duration-200 ease-out',
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
        )}
      >
        <ul className="overflow-hidden mt-1 space-y-0.5">
          {docs.map((d, index) => (
            <li
              key={d.meta.slug}
              className={cn(
                'transition-all duration-200',
                isOpen
                  ? 'translate-y-0 opacity-100'
                  : '-translate-y-2 opacity-0',
              )}
              style={{
                transitionDelay: isOpen ? `${index * 50}ms` : '0ms',
              }}
            >
              <Link
                href={`${basePath}/docs/${d.meta.slug}`}
                onClick={() => {
                  onNavigate?.();
                  track('link_clicked', {
                    link_type: 'docs_nav',
                    from_page: currentSlug,
                    to_page: d.meta.slug,
                  });
                }}
                className={cn(
                  'block py-1.5 px-3 text-sm rounded-md transition-colors',
                  d.meta.slug === currentSlug
                    ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-500 font-medium'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800',
                )}
              >
                {d.meta.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

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
  const dict = locale === 'fr' ? breadcrumbDict.fr : breadcrumbDict.en;
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [headings, setHeadings] = useState<
    Array<{ id: string; text: string; level: number }>
  >([]);
  const [activeHeadingId, setActiveHeadingId] = useState<string | null>(null);

  const groupedDocs = groupDocs(allDocs);

  const handleHeadingsExtracted = useCallback(
    (extracted: Array<{ id: string; text: string; level: number }>) => {
      setHeadings(extracted);
    },
    [],
  );

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
      <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
        <Navbar locale={locale} dict={navbarDict} />

        <div className="flex flex-1">
          {/* Mobile Nav Toggle */}
          <div className="lg:hidden fixed bottom-4 right-4 z-[70]">
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className={cn(
                'flex items-center justify-center w-12 h-12 bg-yellow-500 rounded-full shadow-lg hover:bg-yellow-400 transition-all duration-300 hover:scale-110 active:scale-95',
                mobileNavOpen && 'rotate-90',
              )}
              aria-label={mobileNavOpen ? 'Close menu' : 'Open menu'}
            >
              <div className="relative w-5 h-5">
                <Menu
                  size={20}
                  className={cn(
                    'text-black absolute inset-0 transition-all duration-300',
                    mobileNavOpen
                      ? 'opacity-0 rotate-90 scale-50'
                      : 'opacity-100 rotate-0 scale-100',
                  )}
                />
                <X
                  size={20}
                  className={cn(
                    'text-black absolute inset-0 transition-all duration-300',
                    mobileNavOpen
                      ? 'opacity-100 rotate-0 scale-100'
                      : 'opacity-0 -rotate-90 scale-50',
                  )}
                />
              </div>
            </button>
          </div>

          {/* Mobile Nav Drawer */}
          <div
            className={cn(
              'lg:hidden fixed inset-0 top-0 z-[60] transition-all duration-300',
              mobileNavOpen
                ? 'bg-black/50 pointer-events-auto'
                : 'bg-transparent pointer-events-none',
            )}
            onClick={() => setMobileNavOpen(false)}
          >
            <aside
              className={cn(
                'absolute left-0 top-0 bottom-0 w-72 bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 p-4 pt-6 overflow-y-auto transition-transform duration-300 ease-out shadow-xl',
                mobileNavOpen ? 'translate-x-0' : '-translate-x-full',
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {groupedDocs.map(([title, docs]) => (
                <SidebarSection
                  key={title}
                  title={title}
                  docs={docs}
                  currentSlug={slugString}
                  basePath={basePath}
                  defaultOpen
                  onNavigate={() => setMobileNavOpen(false)}
                />
              ))}
            </aside>
          </div>

          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-56 flex-shrink-0 border-r border-gray-200 dark:border-gray-800 p-4 sticky top-[57px] h-[calc(100vh-57px)] overflow-y-auto">
            {groupedDocs.map(([title, docs]) => (
              <SidebarSection
                key={title}
                title={title}
                docs={docs}
                currentSlug={slugString}
                basePath={basePath}
              />
            ))}
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Page Header */}
            <div className="border-b border-gray-200 dark:border-gray-800 px-6 py-4">
              <nav className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                <Link
                  href={basePath || '/'}
                  className="hover:text-gray-700 dark:hover:text-gray-300"
                >
                  {dict.home}
                </Link>
                <span className="mx-2">/</span>
                <Link
                  href={`${basePath}/docs`}
                  className="hover:text-gray-700 dark:hover:text-gray-300"
                >
                  {dict.docs}
                </Link>
                <span className="mx-2">/</span>
                <span className="text-gray-900 dark:text-white">
                  {docTitle}
                </span>
              </nav>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {docTitle}
              </h1>
            </div>

            <div className="flex">
              {/* Content */}
              <div className="flex-1 px-6 py-8 max-w-3xl">
                {renderedContent}
              </div>

              {/* Right Sidebar - Table of Contents */}
              <aside className="hidden xl:block w-56 flex-shrink-0 p-4 sticky top-[57px] h-[calc(100vh-57px)] overflow-y-auto">
                <TableOfContents
                  headings={headings}
                  activeId={activeHeadingId}
                />
              </aside>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
