'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Github, Menu, X } from 'lucide-react';
import { cn } from '@cloak/ui/lib/utils';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { Hero } from '@/components/heroes/Hero';
import { Differentiators } from '@/components/sections/Differentiators';
import { ProblemSolution } from '@/components/sections/ProblemSolution';
import { WhyNow } from '@/components/sections/WhyNow';
import { EmailCapture } from '@/components/sections/EmailCapture';
import type { Locale } from '@/lib/i18n/config';

// =============================================================================
// TYPES
// =============================================================================

type HomeClientProps = {
  locale: Locale;
  dict: {
    navbar: {
      docs: string;
      github: string;
      getStarted: string;
    };
    hero: {
      title: string;
      subtitle: string;
      description: string;
      descriptionHighlight: string;
      ctaPrimary: string;
      ctaSecondary: string;
    };
    differentiators: {
      badge: string;
      title: string;
      description: string;
      descriptionHighlight: string;
      descriptionEnd: string;
      timeMachine: {
        title: string;
        tagline: string;
        description: string;
      };
      resourceInspector: {
        title: string;
        tagline: string;
        description: string;
      };
      captureAnonymize: {
        title: string;
        tagline: string;
        description: string;
      };
    };
    problemSolution: {
      problemBadge: string;
      problemTitle: string;
      problemLine1: string;
      problemLine2: string;
      problemQuote: string;
      problemLine3: string;
      problemConclusion: string;
      solutionBadge: string;
      solutionTitle: string;
      solutionLine1: string;
      solutionHighlight: string;
      solutionLine2: string;
      solutionConclusion: string;
    };
    whyNow: {
      badge: string;
      title: string;
      description: string;
      snapletBadge: string;
      snapletTitle: string;
      snapletDescription: string;
      replibyteBadge: string;
      replibyteTitle: string;
      replibyteDescription: string;
      cloakBadge: string;
      cloakTitle: string;
      cloakDescription: string;
      privacyFirst: string;
      openSource: string;
      activelyMaintained: string;
    };
    emailCapture: {
      badge: string;
      title: string;
      description: string;
      placeholder: string;
      buttonText: string;
      successMessage: string;
    };
  };
};

// =============================================================================
// SCROLL-TRIGGERED NAVBAR
// =============================================================================

type NavbarVisibility = 'hidden' | 'peek' | 'full';

function ScrollNavbar({
  locale,
  dict,
  visibility,
}: {
  locale: Locale;
  dict: { docs: string; github: string; getStarted: string };
  visibility: NavbarVisibility;
}) {
  const basePath = locale === 'en' ? '' : `/${locale}`;
  const otherLocale = locale === 'en' ? 'fr' : 'en';
  const languageLabel = locale === 'en' ? 'FR' : 'EN';
  const languageSwitchUrl = otherLocale === 'en' ? '/' : `/${otherLocale}`;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isVisible = visibility !== 'hidden';

  // Close mobile menu when navbar hides
  useEffect(() => {
    if (!isVisible) {
      setMobileMenuOpen(false);
    }
  }, [isVisible]);

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

  // Calculate transform based on visibility state
  const getTransform = () => {
    switch (visibility) {
      case 'full':
        return 'translateY(0)';
      case 'peek':
        return 'translateY(-70%)'; // Show ~30% of navbar
      case 'hidden':
      default:
        return 'translateY(-100%)';
    }
  };

  return (
    <>
      {/* Navbar with partial reveal support */}
      <nav
        className={cn(
          'fixed top-0 left-0 right-0 z-50 border-b-2 border-black dark:border-white bg-white dark:bg-gray-950 transition-all duration-300 ease-out',
          visibility === 'hidden' && 'pointer-events-none',
        )}
        style={{ transform: getTransform() }}
      >
        <div className="container mx-auto">
          {/* Desktop Navigation */}
          <div className="hidden xl:grid grid-cols-12">
            {/* Logo - Left side (3 columns) */}
            <Link
              href={`${basePath}/`}
              className="col-span-3 border-r-2 border-black dark:border-white px-6 py-5 hover:bg-yellow-500 dark:hover:bg-yellow-500 transition-all duration-300 ease-out font-black uppercase group"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                  <Image
                    src="/logo.svg"
                    alt="Cloak DB logo"
                    width={40}
                    height={40}
                    className="object-contain group-hover:brightness-0 dark:group-hover:brightness-0 transition-all duration-300"
                  />
                </div>
                <span className="font-display font-black text-2xl text-black dark:text-white group-hover:text-black dark:group-hover:text-black transition-all duration-300">
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
                    className="h-full px-6 flex items-center font-black uppercase text-sm hover:bg-yellow-500 hover:text-black dark:hover:bg-yellow-500 dark:hover:text-black hover:shadow-[inset_4px_4px_0px_rgba(0,0,0,0.2)] dark:hover:shadow-[inset_4px_4px_0px_rgba(255,255,255,0.1)] hover:scale-105 transition-all duration-300 ease-out"
                  >
                    {dict.docs}
                  </Link>
                </li>

                {/* GitHub */}
                <li className="h-full flex items-center">
                  <a
                    href="https://github.com/Cloak-DB/cloak-monolith"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-full px-6 flex items-center hover:bg-blue-500 hover:text-black dark:hover:bg-blue-500 dark:hover:text-black hover:shadow-[inset_4px_4px_0px_rgba(0,0,0,0.2)] dark:hover:shadow-[inset_4px_4px_0px_rgba(255,255,255,0.1)] hover:scale-105 transition-all duration-300 ease-out group"
                    aria-label="GitHub (opens in new tab)"
                  >
                    <Github
                      size={20}
                      strokeWidth={2.5}
                      className="group-hover:rotate-12 transition-transform duration-300"
                    />
                  </a>
                </li>

                {/* Language Switcher */}
                <li className="h-full flex items-center">
                  <Link
                    href={languageSwitchUrl}
                    className="h-full px-6 flex items-center font-black uppercase text-sm hover:bg-purple-500 hover:text-black dark:hover:bg-purple-500 dark:hover:text-black hover:shadow-[inset_4px_4px_0px_rgba(0,0,0,0.2)] dark:hover:shadow-[inset_4px_4px_0px_rgba(255,255,255,0.1)] hover:scale-105 transition-all duration-300 ease-out"
                    title={`Switch to ${otherLocale === 'en' ? 'English' : 'Français'}`}
                  >
                    {languageLabel}
                  </Link>
                </li>

                {/* Theme Switcher */}
                <li className="h-full flex items-center">
                  <ThemeSwitcher />
                </li>

                {/* Get Started CTA */}
                <li className="h-full flex items-center bg-black dark:bg-white">
                  <Link
                    href={`${basePath}/docs`}
                    className="h-full px-6 flex items-center text-white dark:text-black font-black uppercase text-sm hover:bg-yellow-500 hover:text-black dark:hover:bg-yellow-500 dark:hover:text-black hover:shadow-[inset_6px_6px_0px_rgba(0,0,0,0.3)] dark:hover:shadow-[inset_6px_6px_0px_rgba(255,255,255,0.2)] hover:scale-110 transition-all duration-300 ease-out"
                  >
                    {dict.getStarted}
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="xl:hidden flex items-center justify-between px-4 py-4">
            <Link href={`${basePath}/`} className="flex items-center gap-2">
              <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                <Image
                  src="/logo.svg"
                  alt="Cloak DB logo"
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              <span className="text-lg font-display font-black text-black dark:text-white">
                Cloak DB
              </span>
            </Link>

            <div className="flex items-center gap-3">
              <Link
                href={`${basePath}/docs`}
                className="bg-black dark:bg-white text-white dark:text-black px-6 py-3 text-sm font-black uppercase border-2 border-black dark:border-white shadow-[3px_3px_0px_theme(colors.black)] dark:shadow-[3px_3px_0px_rgba(255,255,255,0.3)] hover:bg-yellow-500 hover:text-black hover:border-yellow-500 dark:hover:bg-yellow-500 dark:hover:text-black hover:shadow-[5px_5px_0px_theme(colors.black)] dark:hover:shadow-[5px_5px_0px_rgba(255,255,255,0.3)] hover:scale-105 active:scale-95 transition-all duration-300 ease-out"
              >
                {dict.getStarted}
              </Link>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-3 min-w-[44px] min-h-[44px] flex items-center justify-center border-2 border-black dark:border-white shadow-[3px_3px_0px_theme(colors.black)] dark:shadow-[3px_3px_0px_rgba(255,255,255,0.3)] hover:bg-yellow-500 hover:border-yellow-500 hover:shadow-[5px_5px_0px_theme(colors.black)] dark:hover:shadow-[5px_5px_0px_rgba(255,255,255,0.3)] active:scale-95 transition-all duration-200 ease-out"
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

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && visibility === 'full' && (
        <div
          className="xl:hidden fixed inset-0 top-[73px] bg-white dark:bg-gray-950 z-40 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <ul className="divide-y-2 divide-black dark:divide-white">
            <li>
              <Link
                href={`${basePath}/docs`}
                className="block px-6 py-5 font-black text-lg uppercase hover:bg-yellow-500 hover:text-black hover:shadow-[inset_6px_0px_0px_rgba(0,0,0,0.2)] dark:hover:shadow-[inset_6px_0px_0px_rgba(255,255,255,0.1)] hover:translate-x-2 transition-all duration-300 ease-out"
                onClick={() => setMobileMenuOpen(false)}
              >
                {dict.docs}
              </Link>
            </li>
            <li>
              <a
                href="https://github.com/Cloak-DB/cloak-monolith"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-6 py-5 font-black text-lg uppercase hover:bg-blue-500 hover:text-black hover:shadow-[inset_6px_0px_0px_rgba(0,0,0,0.2)] dark:hover:shadow-[inset_6px_0px_0px_rgba(255,255,255,0.1)] hover:translate-x-2 transition-all duration-300 ease-out group"
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
                className="block px-6 py-5 font-black text-lg uppercase hover:bg-purple-500 hover:text-black hover:shadow-[inset_6px_0px_0px_rgba(0,0,0,0.2)] dark:hover:shadow-[inset_6px_0px_0px_rgba(255,255,255,0.1)] hover:translate-x-2 transition-all duration-300 ease-out"
                onClick={() => setMobileMenuOpen(false)}
              >
                {languageLabel === 'FR' ? 'Français' : 'English'}
              </Link>
            </li>
            <li>
              <ThemeSwitcher isMobile />
            </li>
          </ul>
        </div>
      )}
    </>
  );
}

// =============================================================================
// MAIN CLIENT COMPONENT
// =============================================================================

export function HomeClient({ locale, dict }: HomeClientProps) {
  const [scrolledPastHero, setScrolledPastHero] = useState(false);
  const [mouseZone, setMouseZone] = useState<'none' | 'peek' | 'full'>('none');
  const mouseLeaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Track mouse proximity to top of viewport with two zones
  useEffect(() => {
    const PEEK_ZONE_TOP = 250; // 80-250px = peek zone (larger area)
    const FULL_ZONE_TOP = 80; // 0-80px = full navbar
    const LEAVE_DELAY = 150; // Faster hide

    const handleMouseMove = (e: MouseEvent) => {
      const y = e.clientY;

      // Clear any pending timeout when mouse moves
      if (mouseLeaveTimeoutRef.current) {
        clearTimeout(mouseLeaveTimeoutRef.current);
        mouseLeaveTimeoutRef.current = null;
      }

      if (y <= FULL_ZONE_TOP) {
        setMouseZone('full');
      } else if (y <= PEEK_ZONE_TOP) {
        setMouseZone('peek');
      } else if (mouseZone !== 'none') {
        // Delay hiding to prevent flickering
        mouseLeaveTimeoutRef.current = setTimeout(() => {
          setMouseZone('none');
          mouseLeaveTimeoutRef.current = null;
        }, LEAVE_DELAY);
      }
    };

    const handleMouseLeave = () => {
      if (!mouseLeaveTimeoutRef.current) {
        mouseLeaveTimeoutRef.current = setTimeout(() => {
          setMouseZone('none');
          mouseLeaveTimeoutRef.current = null;
        }, LEAVE_DELAY);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      if (mouseLeaveTimeoutRef.current) {
        clearTimeout(mouseLeaveTimeoutRef.current);
      }
    };
  }, [mouseZone]);

  // Determine navbar visibility state
  const getNavbarVisibility = (): NavbarVisibility => {
    if (scrolledPastHero) return 'full';
    if (mouseZone === 'none') return 'hidden';
    return mouseZone;
  };

  return (
    <>
      <ScrollNavbar
        locale={locale}
        dict={dict.navbar}
        visibility={getNavbarVisibility()}
      />
      <main id="main-content">
        <Hero
          dict={dict.hero}
          locale={locale}
          onScrollPastHero={setScrolledPastHero}
        />
        <Differentiators dict={dict.differentiators} />
        <ProblemSolution dict={dict.problemSolution} />
        <WhyNow dict={dict.whyNow} />
        <EmailCapture dict={dict.emailCapture} locale={locale} />
      </main>
    </>
  );
}
