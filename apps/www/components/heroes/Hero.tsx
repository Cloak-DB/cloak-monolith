'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@cloak-db/ui/components/button';
import { ChevronDown, Github } from 'lucide-react';
import type { Locale } from '@/lib/i18n/config';

type HeroProps = {
  locale: Locale;
  dict: {
    title: string;
    subtitle: string;
    description: string;
    descriptionHighlight: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  onScrollPastHero: (past: boolean) => void;
};

export function Hero({ dict, locale, onScrollPastHero }: HeroProps) {
  const basePath = locale === 'en' ? '' : `/${locale}`;
  const heroRef = useRef<HTMLElement>(null);
  const [particles, setParticles] = useState<
    Array<{
      id: number;
      x: number;
      delay: number;
      duration: number;
      size: number;
    }>
  >([]);

  useEffect(() => {
    setParticles(
      Array.from({ length: 15 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 10,
        duration: 15 + Math.random() * 10,
        size: 2 + Math.random() * 4,
      })),
    );
  }, []);

  // Track scroll position to show/hide navbar (trigger at 50% of viewport)
  useEffect(() => {
    const handleScroll = () => {
      const scrollThreshold = window.innerHeight * 0.5;
      onScrollPastHero(window.scrollY > scrollThreshold);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [onScrollPastHero]);

  const scrollToFeatures = () => {
    document
      .getElementById('differentiators')
      ?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-slate-50 to-white dark:from-gray-950 dark:to-black"
    >
      {/* Floating particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full bg-purple-500 dark:bg-purple-500 pointer-events-none"
          style={{
            left: `${particle.x}%`,
            bottom: '-20px',
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animation: `float-up ${particle.duration}s linear infinite`,
            animationDelay: `${particle.delay}s`,
            opacity: 0.5,
          }}
        />
      ))}

      {/* Ambient gradient orbs */}
      <div className="absolute top-20 left-10 w-[400px] h-[400px] rounded-full blur-3xl opacity-20 dark:opacity-10 bg-gradient-to-br from-purple-500 to-blue-500 pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-[500px] h-[500px] rounded-full blur-3xl opacity-20 dark:opacity-10 bg-gradient-to-br from-yellow-500 to-orange-500 pointer-events-none" />

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 md:px-8 text-center relative z-10 max-w-4xl">
        {/* Logo */}
        <div className="mb-8 opacity-0 animate-fade-in-up">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white dark:bg-gray-900 border-2 border-black dark:border-white shadow-[4px_4px_0px_theme(colors.black)] dark:shadow-[4px_4px_0px_rgba(255,255,255,0.2)]">
            <Image
              src="/logo.svg"
              alt="Cloak DB logo"
              width={32}
              height={32}
              className="object-contain"
              priority
            />
            <span className="font-display font-black text-xl text-black dark:text-white">
              Cloak DB
            </span>
          </div>
        </div>

        {/* Main headline */}
        <div
          className="space-y-6 mb-12 opacity-0 animate-fade-in-up"
          style={{ animationDelay: '100ms' }}
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.1] text-slate-900 dark:text-white">
            {dict.title}
          </h1>
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-600 dark:text-gray-400">
            {dict.subtitle}
          </p>
        </div>

        {/* Value proposition */}
        <div
          className="mb-12 opacity-0 animate-fade-in-up"
          style={{ animationDelay: '200ms' }}
        >
          <p className="text-lg sm:text-xl text-slate-700 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            {dict.description}
            <br />
            <span className="font-bold text-purple-700 dark:text-purple-400">
              {dict.descriptionHighlight}
            </span>
          </p>
        </div>

        {/* CTAs */}
        <div
          className="flex flex-col sm:flex-row gap-4 justify-center mb-16 opacity-0 animate-fade-in-up"
          style={{ animationDelay: '300ms' }}
        >
          <Button
            asChild
            variant="yellow"
            className="h-auto px-10 py-5 text-lg font-bold hover:shadow-[8px_8px_0px_theme(colors.black)] dark:hover:shadow-[8px_8px_0px_rgba(255,255,255,0.2)] hover:brightness-110 transition-all duration-300"
          >
            <Link href={`${basePath}/docs`}>{dict.ctaPrimary}</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-auto px-10 py-5 text-lg font-bold hover:shadow-[8px_8px_0px_theme(colors.black)] dark:hover:shadow-[8px_8px_0px_rgba(255,255,255,0.2)] hover:scale-105 transition-all duration-300"
          >
            <a href="https://github.com/Cloak-DB/cloak-monolith">
              <Github className="w-5 h-5 mr-2" />
              {dict.ctaSecondary}
            </a>
          </Button>
        </div>

        {/* Scroll indicator */}
        <button
          onClick={scrollToFeatures}
          className="opacity-0 animate-fade-in-up"
          style={{ animationDelay: '500ms' }}
          aria-label="Scroll to features"
        >
          <ChevronDown className="w-8 h-8 text-slate-400 dark:text-gray-600 mx-auto animate-bounce" />
        </button>
      </div>
    </section>
  );
}
