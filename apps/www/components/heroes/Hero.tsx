'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@cloak/ui/components/button';
import { Badge } from '@cloak/ui/components/badge';
import { Card, CardContent } from '@cloak/ui/components/card';
import { cn } from '@cloak/ui/lib/utils';
import {
  Camera,
  EyeOff,
  Database,
  Sparkles,
  LockOpen,
  Terminal,
  ShieldCheck,
} from 'lucide-react';
import { useAnalytics } from '@/lib/analytics/client';
import type { Locale } from '@/lib/i18n/config';

type HeroProps = {
  locale: Locale;
  dict: {
    title: string;
    tagline: string;
    taglineHighlight: string;
    problemBadge: string;
    problemLine1: string;
    problemLine2: string;
    badge1Title: string;
    badge2Title: string;
    badge3Title: string;
    ctaPrimary: string;
    ctaSecondary: string;
    featuresTitle: string;
    feature1Title: string;
    feature1Description: string;
    feature2Title: string;
    feature2Description: string;
    feature3Title: string;
    feature3Description: string;
    feature4Highlight: string;
  };
};

const FeatureCard = ({
  icon: Icon,
  title,
  description,
  delay = 0,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  delay?: number;
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  return (
    <Card
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'p-5 opacity-0 animate-fade-in-up group relative overflow-hidden',
        'hover:translate-y-[-4px] hover:shadow-[6px_6px_0px_theme(colors.black)] dark:hover:shadow-[6px_6px_0px_rgba(255,255,255,0.1)]',
        'transition-all duration-300 ease-out',
      )}
      style={{
        animationDelay: `${delay}ms`,
      }}
    >
      {/* Border glow effect */}
      {isHovered && (
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(168, 85, 247, 0.15), transparent 40%)`,
          }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <CardContent className="p-0 relative z-10">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <Icon className="w-6 h-6 text-purple-700 dark:text-purple-400 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
          </div>
          <div className="min-w-0">
            <h3 className="font-black text-lg mb-1 text-black dark:text-white">
              {title}
            </h3>
            <p className="font-bold text-sm text-gray-700 dark:text-gray-300 leading-snug">
              {description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ValueBadge = ({
  icon: Icon,
  title,
  variant,
  delay = 0,
}: {
  icon: React.ElementType;
  title: string;
  variant: 'blue' | 'yellow' | 'default';
  delay?: number;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'bg-blue-700 dark:bg-transparent border-2 border-blue-700 p-5 text-center shadow-[4px_4px_0px_theme(colors.black)] dark:shadow-none opacity-0 animate-fade-in-up',
        'hover:scale-105 hover:rotate-2 hover:shadow-[6px_6px_0px_theme(colors.black)] dark:hover:shadow-[6px_6px_0px_rgba(255,255,255,0.1)]',
        'transition-all duration-300 ease-out',
        variant === 'yellow' &&
          'bg-orange-800 border-orange-800 dark:border-orange-500',
        variant === 'default' && 'bg-purple-800 border-purple-800',
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex justify-center mb-2">
        <Icon
          className={cn(
            'w-6 h-6 text-white dark:text-blue-400 transition-transform duration-300',
            variant === 'yellow' && 'dark:text-orange-400',
            variant === 'default' && 'dark:text-purple-400',
            isHovered && 'scale-125',
          )}
        />
      </div>
      <div
        className={cn(
          'font-bold text-xs text-white dark:text-blue-400',
          variant === 'yellow' && 'text-white dark:text-orange-400',
          variant === 'default' && 'dark:text-purple-400',
        )}
      >
        {title}
      </div>
    </div>
  );
};

export function Hero({ dict, locale }: HeroProps) {
  const basePath = locale === 'en' ? '' : `/${locale}`;
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [cursorPosition, setCursorPosition] = useState({ x: -100, y: -100 });
  const [buttonTransforms, setButtonTransforms] = useState({
    primary: '',
    secondary: '',
  });
  // Static spotlight positions (no state needed - CSS animated)
  const spotlights = [
    { x: 20, y: 30, size: 400, color: 'purple' },
    { x: 70, y: 60, size: 500, color: 'blue' },
    { x: 40, y: 80, size: 350, color: 'orange' },
  ];
  const [particles, setParticles] = useState<
    Array<{
      id: number;
      x: number;
      delay: number;
      duration: number;
      size: number;
    }>
  >([]);
  const heroRef = useRef<HTMLElement>(null);
  const primaryButtonRef = useRef<HTMLDivElement>(null);
  const secondaryButtonRef = useRef<HTMLDivElement>(null);
  const { track } = useAnalytics();

  useEffect(() => {
    setParticles(
      Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 10,
        duration: 15 + Math.random() * 10,
        size: 2 + Math.random() * 4,
      })),
    );
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setMousePosition({ x, y });
        setCursorPosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });

        if (primaryButtonRef.current) {
          const btnRect = primaryButtonRef.current.getBoundingClientRect();
          const btnCenterX = btnRect.left + btnRect.width / 2;
          const btnCenterY = btnRect.top + btnRect.height / 2;
          const distance = Math.sqrt(
            Math.pow(e.clientX - btnCenterX, 2) +
              Math.pow(e.clientY - btnCenterY, 2),
          );

          if (distance < 120) {
            const offsetX = (e.clientX - btnCenterX) * 0.08;
            const offsetY = (e.clientY - btnCenterY) * 0.08;
            setButtonTransforms((prev) => ({
              ...prev,
              primary: `translate(${offsetX}px, ${offsetY}px)`,
            }));
          } else {
            setButtonTransforms((prev) => ({ ...prev, primary: '' }));
          }
        }

        if (secondaryButtonRef.current) {
          const btnRect = secondaryButtonRef.current.getBoundingClientRect();
          const btnCenterX = btnRect.left + btnRect.width / 2;
          const btnCenterY = btnRect.top + btnRect.height / 2;
          const distance = Math.sqrt(
            Math.pow(e.clientX - btnCenterX, 2) +
              Math.pow(e.clientY - btnCenterY, 2),
          );

          if (distance < 120) {
            const offsetX = (e.clientX - btnCenterX) * 0.08;
            const offsetY = (e.clientY - btnCenterY) * 0.08;
            setButtonTransforms((prev) => ({
              ...prev,
              secondary: `translate(${offsetX}px, ${offsetY}px)`,
            }));
          } else {
            setButtonTransforms((prev) => ({ ...prev, secondary: '' }));
          }
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Spotlight animation now handled by CSS - no JavaScript needed!

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-b from-slate-50 to-white dark:from-gray-950 dark:to-black"
    >
      {/* Floating particles - data being cloaked */}
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
            opacity: 0.7,
            boxShadow:
              '0 0 8px rgba(168, 85, 247, 0.8), 0 0 4px rgba(168, 85, 247, 0.6)',
          }}
        />
      ))}

      {/* CSS-animated spotlights - No layout shift! */}
      {spotlights.map((spotlight, i) => (
        <div
          key={i}
          className={`absolute rounded-full pointer-events-none spotlight-orb spotlight-${spotlight.color}`}
          style={{
            left: `${spotlight.x}%`,
            top: `${spotlight.y}%`,
            width: `${spotlight.size}px`,
            height: `${spotlight.size}px`,
            animationDelay: `${i * -7}s`,
          }}
        />
      ))}

      {/* Cursor follower */}
      <div
        className="absolute w-8 h-8 rounded-full pointer-events-none transition-all duration-300 ease-out z-50"
        style={{
          left: `${cursorPosition.x}px`,
          top: `${cursorPosition.y}px`,
          transform: 'translate(-50%, -50%)',
          background:
            'radial-gradient(circle, rgba(168, 85, 247, 0.6) 0%, rgba(168, 85, 247, 0.2) 50%, transparent 70%)',
          filter: 'blur(8px)',
        }}
      />

      {/* Ambient gradient orbs */}
      <div
        className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full blur-3xl opacity-35 dark:opacity-10 bg-gradient-to-br from-purple-500 to-blue-500 pointer-events-none transition-all duration-700 ease-out"
        style={{
          transform: `translate(${mousePosition.x * 0.05}%, ${
            mousePosition.y * 0.05
          }%)`,
        }}
      />
      <div
        className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full blur-3xl opacity-35 dark:opacity-10 bg-gradient-to-br from-yellow-500 to-orange-500 pointer-events-none transition-all duration-700 ease-out"
        style={{
          transform: `translate(-${mousePosition.x * 0.05}%, -${
            mousePosition.y * 0.05
          }%)`,
        }}
      />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="container mx-auto px-4 sm:px-6 md:px-8 py-16 md:py-24 lg:py-32 w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start w-full">
          {/* Left - Message */}
          <div className="space-y-10">
            {/* Hero Title & Tagline */}
            <div className="space-y-6 opacity-0 animate-fade-in-up">
              <div className="inline-block">
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.05] bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-white dark:via-purple-200 dark:to-blue-200">
                  {dict.title}
                </h1>
              </div>
              <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-gray-200 leading-tight">
                {dict.tagline}
              </p>
              <p className="text-lg sm:text-xl md:text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-blue-700 dark:from-purple-400 dark:to-blue-400 leading-tight">
                {dict.taglineHighlight}
              </p>
            </div>

            {/* Key Points */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <ValueBadge
                icon={LockOpen}
                title={dict.badge1Title}
                variant="blue"
                delay={100}
              />
              <ValueBadge
                icon={Terminal}
                title={dict.badge2Title}
                variant="yellow"
                delay={200}
              />
              <ValueBadge
                icon={ShieldCheck}
                title={dict.badge3Title}
                variant="default"
                delay={300}
              />
            </div>

            {/* CTA */}
            <div
              className="flex flex-col sm:flex-row gap-4 opacity-0 animate-fade-in-up"
              style={{ animationDelay: '400ms' }}
            >
              <div
                ref={primaryButtonRef}
                style={{ transform: buttonTransforms.primary }}
                className="transition-transform duration-200 ease-out"
              >
                <Button
                  asChild
                  variant="yellow"
                  className="h-auto px-10 py-5 text-lg font-bold hover:shadow-[8px_8px_0px_theme(colors.black)] dark:hover:shadow-[8px_8px_0px_rgba(255,255,255,0.2)] hover:brightness-110 transition-all duration-300"
                >
                  <Link
                    href={`${basePath}/docs`}
                    onClick={() =>
                      track('button_clicked', {
                        button_id: 'docs_cta',
                        location: 'hero',
                        destination: `${basePath}/docs`,
                      })
                    }
                  >
                    {dict.ctaPrimary}
                  </Link>
                </Button>
              </div>
              <div
                ref={secondaryButtonRef}
                style={{ transform: buttonTransforms.secondary }}
                className="transition-transform duration-200 ease-out"
              >
                <Button
                  asChild
                  variant="outline"
                  className="h-auto px-10 py-5 text-lg font-bold hover:shadow-[8px_8px_0px_theme(colors.black)] dark:hover:shadow-[8px_8px_0px_rgba(255,255,255,0.2)] hover:scale-105 transition-all duration-300"
                >
                  <a
                    href="https://github.com/Cloak-DB/cloakdb"
                    onClick={() =>
                      track('button_clicked', {
                        button_id: 'github_cta',
                        location: 'hero',
                        destination: 'https://github.com/Cloak-DB/cloakdb',
                      })
                    }
                  >
                    {dict.ctaSecondary}
                  </a>
                </Button>
              </div>
            </div>

            {/* Problem Statement */}
            <div
              className="pt-4 border-t-2 border-black dark:border-white opacity-0 animate-fade-in-up"
              style={{ animationDelay: '500ms' }}
            >
              <div className="space-y-3">
                <Badge
                  variant="red"
                  className="px-3 py-1.5 font-black text-xs uppercase text-white dark:text-red-500"
                >
                  {dict.problemBadge}
                </Badge>
                <p className="text-lg md:text-xl font-bold text-gray-600 dark:text-gray-400 leading-relaxed">
                  <span className="line-through opacity-75">
                    {dict.problemLine1}
                  </span>
                  <br />
                  <span className="line-through opacity-75">
                    {dict.problemLine2}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Right - Features */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white opacity-0 animate-fade-in-up">
              {dict.featuresTitle}
            </h2>

            <div className="space-y-4">
              <FeatureCard
                icon={Camera}
                title={dict.feature1Title}
                description={dict.feature1Description}
                delay={100}
              />
              <FeatureCard
                icon={EyeOff}
                title={dict.feature2Title}
                description={dict.feature2Description}
                delay={200}
              />
              <FeatureCard
                icon={Database}
                title={dict.feature3Title}
                description={dict.feature3Description}
                delay={300}
              />
              <Card
                className="p-5 bg-orange-800 dark:bg-transparent border-2 border-orange-800 dark:border-orange-500 shadow-[4px_4px_0px_theme(colors.black)] dark:shadow-none opacity-0 animate-fade-in-up group relative overflow-hidden"
                style={{ animationDelay: '400ms' }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-yellow-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                <CardContent className="p-0 relative z-10 group-hover:translate-y-[-4px] transition-transform duration-300">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <Sparkles className="w-6 h-6 text-white dark:text-orange-400 group-hover:rotate-12 group-hover:scale-110 transition-all duration-300" />
                    </div>
                    <div className="font-bold text-base text-white dark:text-orange-400 leading-tight">
                      {dict.feature4Highlight}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
