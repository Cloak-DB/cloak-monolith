'use client';

import Link from 'next/link';
import { ExternalLink, ArrowRight } from 'lucide-react';
import { Button } from '@cloak-db/ui/components/button';
import { useAnalytics } from '@/lib/analytics/client';
import type { Locale } from '@/lib/i18n/config';

type FooterProps = {
  locale: Locale;
  dict: {
    tagline: string;
    product: string;
    productLinks: Array<{ label: string; href: string }>;
    resources: string;
    resourceLinks: Array<{ label: string; href: string }>;
    legal: string;
    legalLinks: Array<{ label: string; href: string }>;
    copyright: string;
    joinBeta?: {
      title: string;
      description: string;
      buttonText: string;
    };
  };
};

const GitHubIcon = () => (
  <svg
    className="w-4 h-4 transition-transform duration-300 group-hover:scale-110"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
  </svg>
);

export function Footer({ dict, locale }: FooterProps) {
  const { track } = useAnalytics();
  const basePath = locale === 'en' ? '' : `/${locale}`;

  // Helper to prefix internal links with locale
  const getLocalizedHref = (href: string) => {
    // Don't modify external links
    if (href.startsWith('http') || href.startsWith('//')) {
      return href;
    }
    return `${basePath}${href}`;
  };

  const handleJoinBeta = () => {
    track('button_clicked', {
      button_id: 'join_beta',
      location: 'footer',
      action: 'scroll_to_form',
    });
    const emailSection = document.querySelector(
      'section:has(form[aria-label="Email subscription form"])',
    );
    if (emailSection) {
      emailSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <footer className="border-t-2 border-black dark:border-white bg-white dark:bg-gray-950 relative overflow-hidden">
      {/* Ambient gradient orbs */}
      <div className="absolute top-0 left-0 w-[400px] h-[400px] rounded-full blur-3xl opacity-15 dark:opacity-5 bg-gradient-to-br from-purple-500 to-blue-500 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[350px] h-[350px] rounded-full blur-3xl opacity-15 dark:opacity-5 bg-gradient-to-br from-yellow-400 to-orange-400 pointer-events-none" />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="container mx-auto px-4 sm:px-6 md:px-8 py-12 md:py-16 relative">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link
              href={getLocalizedHref('/')}
              onClick={() =>
                track('link_clicked', {
                  link_type: 'footer',
                  link_text: 'logo',
                  section: 'brand',
                  destination: getLocalizedHref('/'),
                })
              }
              className="inline-block bg-yellow-500 border-2 border-black dark:border-yellow-500 px-4 py-2 shadow-[4px_4px_0px_theme(colors.black)] dark:shadow-[4px_4px_0px_rgba(234,179,8,0.3)] rotate-[-1deg] hover:shadow-[6px_6px_0px_theme(colors.black)] dark:hover:shadow-[6px_6px_0px_rgba(234,179,8,0.4)] hover:rotate-0 transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-500"
            >
              <span className="text-2xl font-black text-black dark:text-black">
                CLOAKDB
              </span>
            </Link>
            <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
              {dict.tagline}
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-lg font-black uppercase mb-4 text-black dark:text-white">
              {dict.product}
            </h4>
            <ul className="space-y-2">
              {dict.productLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={getLocalizedHref(link.href)}
                    onClick={() =>
                      track('link_clicked', {
                        link_type: 'footer',
                        link_text: link.label,
                        section: 'product',
                        destination: getLocalizedHref(link.href),
                      })
                    }
                    className="group text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-yellow-600 dark:hover:text-yellow-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-500 active:translate-y-[1px] transition-all inline-block relative"
                  >
                    <span className="relative">
                      {link.label}
                      <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-yellow-600 dark:bg-yellow-500 group-hover:w-full transition-all duration-300" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-lg font-black uppercase mb-4 text-black dark:text-white">
              {dict.resources}
            </h4>
            <ul className="space-y-2">
              {dict.resourceLinks.map((link) => {
                const isGitHub = link.href.includes('github');
                return (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${link.label} (opens in new tab)`}
                      onClick={() =>
                        track('link_clicked', {
                          link_type: 'footer',
                          link_text: link.label,
                          section: 'resources',
                          destination: link.href,
                          external: true,
                        })
                      }
                      className="group text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-yellow-600 dark:hover:text-yellow-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-500 active:translate-y-[1px] transition-all inline-flex items-center gap-1.5 relative"
                    >
                      <span className="relative">
                        {link.label}
                        <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-yellow-600 dark:bg-yellow-500 group-hover:w-full transition-all duration-300" />
                      </span>
                      {isGitHub ? (
                        <GitHubIcon />
                      ) : (
                        <ExternalLink className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:translate-y-[-1px]" />
                      )}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-lg font-black uppercase mb-4 text-black dark:text-white">
              {dict.legal}
            </h4>
            <ul className="space-y-2">
              {dict.legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={getLocalizedHref(link.href)}
                    onClick={() =>
                      track('link_clicked', {
                        link_type: 'footer',
                        link_text: link.label,
                        section: 'legal',
                        destination: getLocalizedHref(link.href),
                      })
                    }
                    className="group text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-yellow-600 dark:hover:text-yellow-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-500 active:translate-y-[1px] transition-all inline-block relative"
                  >
                    <span className="relative">
                      {link.label}
                      <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-yellow-600 dark:bg-yellow-500 group-hover:w-full transition-all duration-300" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Join Beta CTA */}
        {dict.joinBeta && (
          <div className="mt-16 pt-12 border-t-2 border-black dark:border-white">
            <div className="max-w-2xl mx-auto text-center space-y-6">
              <h3 className="text-3xl md:text-4xl font-black text-black dark:text-white">
                {dict.joinBeta.title}
              </h3>
              <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                {dict.joinBeta.description}
              </p>
              <Button
                onClick={handleJoinBeta}
                variant="yellow"
                size="lg"
                className="h-14 px-8 text-lg font-black uppercase group"
              >
                {dict.joinBeta.buttonText}
                <ArrowRight className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </div>
          </div>
        )}

        <div className="mt-12 pt-8 border-t-2 border-black dark:border-white">
          <p className="text-center font-bold text-gray-600 dark:text-gray-400">
            <small className="text-sm">
              {dict.copyright.replace(
                '{year}',
                new Date().getFullYear().toString(),
              )}
            </small>
          </p>
        </div>
      </div>
    </footer>
  );
}
