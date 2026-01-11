'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Github, Menu, X } from 'lucide-react';
import { ThemeSwitcher } from './ThemeSwitcher';
import type { Locale } from '@/lib/i18n/config';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@cloak-db/ui/lib/utils';

// =============================================================================
// TYPES
// =============================================================================

export type NavbarVisibility = 'hidden' | 'peek' | 'full';

interface NavbarProps {
  locale: Locale;
  dict: {
    docs: string;
    github: string;
    getStarted: string;
  };
  /**
   * When provided, navbar uses fixed positioning with transform-based visibility.
   * When undefined, navbar uses sticky positioning with scroll-based shrinking.
   */
  visibility?: NavbarVisibility;
  /**
   * External mobile menu state (for visibility mode).
   * When undefined, navbar manages its own mobile menu state.
   */
  mobileMenuOpen?: boolean;
  setMobileMenuOpen?: (open: boolean) => void;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const GITHUB_URL = 'https://github.com/Cloak-DB/cloak-monolith';
const MOBILE_MENU_TOP = 'top-[73px]';

// =============================================================================
// SHARED STYLES
// =============================================================================

const styles = {
  // Desktop nav items
  navItem:
    'h-full px-6 flex items-center font-black uppercase hover:shadow-[inset_4px_4px_0px_rgba(0,0,0,0.2)] dark:hover:shadow-[inset_4px_4px_0px_rgba(255,255,255,0.1)] hover:scale-105 transition-all duration-300 ease-out',
  navItemDocs:
    'hover:bg-yellow-500 hover:text-black dark:hover:bg-yellow-500 dark:hover:text-black relative',
  navItemGithub:
    'hover:bg-blue-500 hover:text-black dark:hover:bg-blue-500 dark:hover:text-black group',
  navItemLang:
    'hover:bg-purple-500 hover:text-black dark:hover:bg-purple-500 dark:hover:text-black',
  navItemCta:
    'text-white dark:text-black hover:bg-yellow-500 hover:text-black dark:hover:bg-yellow-500 dark:hover:text-black hover:shadow-[inset_6px_6px_0px_rgba(0,0,0,0.3)] dark:hover:shadow-[inset_6px_6px_0px_rgba(255,255,255,0.2)] hover:scale-110',

  // Mobile nav items
  mobileNavItem:
    'px-6 py-5 font-black text-lg uppercase hover:shadow-[inset_6px_0px_0px_rgba(0,0,0,0.2)] dark:hover:shadow-[inset_6px_0px_0px_rgba(255,255,255,0.1)] hover:translate-x-2 transition-all duration-300 ease-out',
  mobileNavItemDocs: 'block hover:bg-yellow-500 hover:text-black',
  mobileNavItemGithub:
    'flex items-center gap-3 hover:bg-blue-500 hover:text-black group',
  mobileNavItemLang: 'block hover:bg-purple-500 hover:text-black',

  // Mobile CTA button
  mobileCta:
    'bg-black dark:bg-white text-white dark:text-black px-6 py-3 text-sm font-black uppercase border-2 border-black dark:border-white shadow-[3px_3px_0px_theme(colors.black)] dark:shadow-[3px_3px_0px_rgba(255,255,255,0.3)] hover:bg-yellow-500 hover:text-black hover:border-yellow-500 dark:hover:bg-yellow-500 dark:hover:text-black hover:shadow-[5px_5px_0px_theme(colors.black)] dark:hover:shadow-[5px_5px_0px_rgba(255,255,255,0.3)] hover:scale-105 active:scale-95 transition-all duration-300 ease-out',

  // Hamburger button
  hamburger:
    'p-3 min-w-[44px] min-h-[44px] flex items-center justify-center border-2 border-black dark:border-white shadow-[3px_3px_0px_theme(colors.black)] dark:shadow-[3px_3px_0px_rgba(255,255,255,0.3)] hover:bg-yellow-500 hover:border-yellow-500 hover:shadow-[5px_5px_0px_theme(colors.black)] dark:hover:shadow-[5px_5px_0px_rgba(255,255,255,0.3)] active:scale-95 transition-all duration-200 ease-out',
} as const;

// =============================================================================
// COMPONENT
// =============================================================================

export function Navbar({
  locale,
  dict,
  visibility,
  mobileMenuOpen: externalMobileMenuOpen,
  setMobileMenuOpen: externalSetMobileMenuOpen,
}: NavbarProps) {
  const basePath = locale === 'en' ? '' : `/${locale}`;
  const otherLocale = locale === 'en' ? 'fr' : 'en';
  const languageLabel = locale === 'en' ? 'FR' : 'EN';
  const pathname = usePathname();

  // Determine if using external or internal mobile menu state
  const isVisibilityMode = visibility !== undefined;
  const [internalMobileMenuOpen, setInternalMobileMenuOpen] = useState(false);
  const mobileMenuOpen = isVisibilityMode
    ? (externalMobileMenuOpen ?? false)
    : internalMobileMenuOpen;
  const setMobileMenuOpen = isVisibilityMode
    ? (externalSetMobileMenuOpen ?? (() => {}))
    : setInternalMobileMenuOpen;

  // Scroll-based shrinking (only for sticky mode)
  const [isScrolled, setIsScrolled] = useState(false);

  // Build the language switch URL - keep current path but change locale
  const getLanguageSwitchUrl = () => {
    if (isVisibilityMode) {
      // Simple toggle for home page
      return otherLocale === 'en' ? '/' : `/${otherLocale}`;
    }

    if (!pathname) return otherLocale === 'en' ? '/' : `/${otherLocale}`;

    // Remove current locale from pathname if it exists
    const pathWithoutLocale = pathname.replace(/^\/(en|fr)/, '') || '/';

    // Add new locale (unless it's 'en' which is the default)
    if (otherLocale === 'en') {
      return pathWithoutLocale === '/' ? '/' : pathWithoutLocale;
    }

    return `/${otherLocale}${pathWithoutLocale}`;
  };

  const languageSwitchUrl = getLanguageSwitchUrl();

  // Handle navbar shrink on scroll (sticky mode only)
  useEffect(() => {
    if (isVisibilityMode) return;

    const handleScroll = () => {
      setIsScrolled(window.scrollY > window.innerHeight * 0.8);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isVisibilityMode]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  // Close menu on route change (sticky mode only)
  useEffect(() => {
    if (isVisibilityMode) return;
    setMobileMenuOpen(false);
  }, [pathname, isVisibilityMode, setMobileMenuOpen]);

  const isActive = (path: string) => {
    if (path === '/' || path === `/${locale}`) {
      return pathname === '/' || pathname === `/${locale}`;
    }
    return pathname?.startsWith(path);
  };

  // Calculate transform for visibility mode
  const getTransform = () => {
    if (!isVisibilityMode) return undefined;

    switch (visibility) {
      case 'full':
        return 'translateY(0)';
      case 'peek':
        return 'translateY(-70%)';
      case 'hidden':
      default:
        return 'translateY(-100%)';
    }
  };

  // Determine text/icon sizes based on scroll state (sticky mode only)
  const textSize = isScrolled ? 'text-xs' : 'text-sm';
  const logoTextSize = isScrolled ? 'text-xl' : 'text-2xl';
  const logoContainerSize = isScrolled ? 'w-6 h-6' : 'w-10 h-10';
  const logoSize = isScrolled ? 32 : 40;
  const iconSize = isScrolled ? 18 : 20;
  const logoPadding = isScrolled ? 'py-3' : 'py-5';

  return (
    <>
      {/* Skip to content link for accessibility (sticky mode only) */}
      {!isVisibilityMode && (
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-yellow-500 focus:text-black focus:font-black focus:border-2 focus:border-black focus:shadow-[4px_4px_0px_theme(colors.black)]"
        >
          Skip to main content
        </a>
      )}

      <nav
        className={cn(
          'z-50 border-b-2 border-black dark:border-white bg-white dark:bg-gray-950 transition-all duration-300',
          isVisibilityMode
            ? 'fixed top-0 left-0 right-0 ease-out'
            : 'sticky top-0',
          isVisibilityMode && visibility === 'hidden' && 'pointer-events-none',
          !isVisibilityMode && isScrolled && 'shadow-md',
        )}
        style={isVisibilityMode ? { transform: getTransform() } : undefined}
      >
        <div className="container mx-auto">
          {/* Desktop Navigation */}
          <div className="hidden xl:grid grid-cols-12">
            {/* Logo - Left side (3 columns) */}
            <Link
              href={`${basePath}/`}
              className={cn(
                'col-span-3 border-r-2 border-black dark:border-white px-6 hover:bg-yellow-500 dark:hover:bg-yellow-500 transition-all duration-300 ease-out font-black uppercase group',
                isVisibilityMode ? 'py-5' : logoPadding,
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6',
                    isVisibilityMode ? 'w-10 h-10' : logoContainerSize,
                  )}
                >
                  <Image
                    src="/logo.svg"
                    alt="Cloak DB logo"
                    width={isVisibilityMode ? 40 : logoSize}
                    height={isVisibilityMode ? 40 : logoSize}
                    className="object-contain group-hover:brightness-0 dark:group-hover:brightness-0 transition-all duration-300"
                    priority
                  />
                </div>
                <span
                  className={cn(
                    'font-display font-black text-black dark:text-white group-hover:text-black dark:group-hover:text-black transition-all duration-300',
                    isVisibilityMode ? 'text-2xl' : logoTextSize,
                  )}
                >
                  Cloak DB
                </span>
              </div>
            </Link>

            {/* Right side - Nav items (9 columns) */}
            <div className="col-span-9 flex items-center justify-end">
              <ul className="flex items-center divide-x-2 divide-black dark:divide-white h-full">
                {/* Docs */}
                <li className="h-full flex items-center">
                  <Link
                    href={`${basePath}/docs`}
                    className={cn(
                      styles.navItem,
                      styles.navItemDocs,
                      isVisibilityMode ? 'text-sm' : textSize,
                      !isVisibilityMode &&
                        isActive(`${basePath}/docs`) &&
                        'bg-yellow-100 dark:bg-yellow-900/20',
                    )}
                  >
                    {dict.docs}
                    {!isVisibilityMode && isActive(`${basePath}/docs`) && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-yellow-500" />
                    )}
                  </Link>
                </li>

                {/* GitHub Icon */}
                <li className="h-full flex items-center">
                  <a
                    href={GITHUB_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(styles.navItem, styles.navItemGithub)}
                    aria-label="GitHub (opens in new tab)"
                  >
                    <Github
                      size={isVisibilityMode ? 20 : iconSize}
                      strokeWidth={2.5}
                      className="group-hover:rotate-12 transition-transform duration-300"
                    />
                  </a>
                </li>

                {/* Language Switcher */}
                <li className="h-full flex items-center">
                  <Link
                    href={languageSwitchUrl}
                    className={cn(
                      styles.navItem,
                      styles.navItemLang,
                      isVisibilityMode ? 'text-sm' : textSize,
                    )}
                    title={`Switch to ${otherLocale === 'en' ? 'English' : 'Français'}`}
                  >
                    {languageLabel}
                  </Link>
                </li>

                {/* Theme Switcher */}
                <li className="h-full flex items-center">
                  <ThemeSwitcher
                    isScrolled={isVisibilityMode ? false : isScrolled}
                  />
                </li>

                {/* Get Started CTA */}
                <li className="h-full flex items-center bg-black dark:bg-white">
                  <Link
                    href={`${basePath}/docs`}
                    className={cn(
                      styles.navItem,
                      styles.navItemCta,
                      isVisibilityMode ? 'text-sm' : textSize,
                    )}
                  >
                    {dict.getStarted}
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="xl:hidden flex items-center justify-between px-4 py-4">
            {/* Logo */}
            <Link
              href={`${basePath}/`}
              className="flex items-center gap-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                <Image
                  src="/logo.svg"
                  alt="Cloak DB logo"
                  width={32}
                  height={32}
                  className="object-contain"
                  priority
                />
              </div>
              <span className="text-lg font-display font-black text-black dark:text-white">
                Cloak DB
              </span>
            </Link>

            {/* Mobile: CTA + Hamburger */}
            <div className="flex items-center gap-3">
              <Link href={`${basePath}/docs`} className={styles.mobileCta}>
                {dict.getStarted}
              </Link>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={styles.hamburger}
                aria-label="Toggle menu"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? (
                  <X size={24} strokeWidth={2.5} />
                ) : (
                  <Menu size={24} strokeWidth={2.5} />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu - Full Screen Overlay */}
      {mobileMenuOpen && (!isVisibilityMode || visibility === 'full') && (
        <div
          className={cn(
            'xl:hidden fixed inset-0 bg-white dark:bg-gray-950 z-40 overflow-y-auto',
            MOBILE_MENU_TOP,
            !isVisibilityMode && 'animate-slide-in',
          )}
          role="dialog"
          aria-modal="true"
        >
          <ul className="divide-y-2 divide-black dark:divide-white">
            <li>
              <Link
                href={`${basePath}/docs`}
                className={cn(
                  styles.mobileNavItem,
                  styles.mobileNavItemDocs,
                  !isVisibilityMode &&
                    isActive(`${basePath}/docs`) &&
                    'bg-yellow-100 dark:bg-yellow-900/20 border-l-4 border-yellow-500 shadow-[inset_4px_0px_0px_rgba(234,179,8,0.3)]',
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {dict.docs}
              </Link>
            </li>
            <li>
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(styles.mobileNavItem, styles.mobileNavItemGithub)}
              >
                <Github
                  size={24}
                  strokeWidth={2.5}
                  className="group-hover:rotate-12 transition-transform duration-300"
                />
                {dict.github}
                <span className="text-xs opacity-60 group-hover:translate-x-1 transition-transform duration-300">
                  ↗
                </span>
              </a>
            </li>
            <li>
              <Link
                href={languageSwitchUrl}
                className={cn(styles.mobileNavItem, styles.mobileNavItemLang)}
                onClick={() => setMobileMenuOpen(false)}
              >
                {languageLabel === 'FR' ? 'Français' : 'English'}
              </Link>
            </li>
            <li>
              <ThemeSwitcher isScrolled={false} isMobile />
            </li>
          </ul>
        </div>
      )}
    </>
  );
}
