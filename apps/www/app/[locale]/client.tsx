'use client';

import { useEffect, useRef, useState } from 'react';
import { Hero } from '@/components/heroes/Hero';
import { Differentiators } from '@/components/sections/Differentiators';
import { ProblemSolution } from '@/components/sections/ProblemSolution';
import { WhyNow } from '@/components/sections/WhyNow';
import { EmailCapture } from '@/components/sections/EmailCapture';
import { Navbar, type NavbarVisibility } from '@/components/Navbar';
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
// MAIN CLIENT COMPONENT
// =============================================================================

export function HomeClient({ locale, dict }: HomeClientProps) {
  const [scrolledPastHero, setScrolledPastHero] = useState(false);
  const [mouseZone, setMouseZone] = useState<'none' | 'peek' | 'full'>('none');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
    // Keep navbar fully visible when mobile menu is open
    if (mobileMenuOpen) return 'full';
    if (scrolledPastHero) return 'full';
    if (mouseZone === 'none') return 'hidden';
    return mouseZone;
  };

  return (
    <>
      <Navbar
        locale={locale}
        dict={dict.navbar}
        visibility={getNavbarVisibility()}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
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
