'use client';

import { useEffect, useRef, useState } from 'react';
import { Check } from 'lucide-react';
import { Badge } from '@cloak/ui/components/badge';
import { Card } from '@cloak/ui/components/card';
import { cn } from '@cloak/ui/lib/utils';

type HowItWorksProps = {
  dict: {
    badge: string;
    title: string;
    description: string;
    benefitsTitle: string;
    benefits: string[];
    step1Badge: string;
    step2Badge: string;
    arrowText: string;
  };
};

export function HowItWorks({ dict }: HowItWorksProps) {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 },
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="border-t-2 border-black dark:border-white relative overflow-hidden"
    >
      {/* Ambient gradient orbs - like hero */}
      <div className="absolute top-0 left-0 w-[400px] h-[400px] rounded-full blur-3xl opacity-20 dark:opacity-10 bg-gradient-to-br from-yellow-400 to-orange-400 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full blur-3xl opacity-20 dark:opacity-10 bg-gradient-to-br from-purple-400 to-blue-400 pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-12 relative">
        {/* Left Column - Headline & Description */}
        <div className="lg:col-span-7 border-b-2 lg:border-b-0 lg:border-r-2 border-black dark:border-white bg-gradient-to-br from-yellow-50 via-orange-50 to-yellow-100 dark:from-transparent dark:via-transparent dark:to-transparent">
          <div className="container mx-auto px-4 sm:px-6 md:px-8 py-12 md:py-16 lg:py-20 max-w-4xl">
            <div className="space-y-8">
              <div
                className={cn(
                  'inline-block bg-black dark:bg-white text-white dark:text-black px-3 py-1.5 font-black text-xs uppercase rotate-[-2deg] shadow-[4px_4px_0px_theme(colors.black)] dark:shadow-[4px_4px_0px_rgba(255,255,255,0.3)] border-2 border-black dark:border-white transition-all duration-300 ease-out',
                  isVisible
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-4',
                )}
              >
                {dict.badge}
              </div>

              <h2
                className={cn(
                  'text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-[1.05] bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-white dark:via-purple-200 dark:to-blue-200 transition-all duration-500 delay-100',
                  isVisible
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-4',
                )}
              >
                {dict.title}
              </h2>

              <p
                className={cn(
                  'text-lg md:text-xl font-semibold max-w-xl text-slate-700 dark:text-gray-300 leading-relaxed transition-all duration-500 delay-200',
                  isVisible
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-4',
                )}
              >
                {dict.description}
              </p>

              <div
                className={cn(
                  'pt-4 transition-all duration-500 delay-300',
                  isVisible
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-4',
                )}
              >
                <h3 className="text-xl md:text-2xl font-black mb-6 text-slate-900 dark:text-white">
                  {dict.benefitsTitle}
                </h3>
                <ul className="space-y-4">
                  {dict.benefits.map((benefit, index) => (
                    <li
                      key={index}
                      className={cn(
                        'flex items-start gap-3 transition-all duration-300 ease-out group p-2 -ml-2 rounded',
                        isVisible
                          ? 'opacity-100 translate-x-0'
                          : 'opacity-0 translate-x-[-20px]',
                      )}
                      style={{ transitionDelay: `${400 + index * 100}ms` }}
                    >
                      <div className="flex-shrink-0 mt-0.5 bg-black dark:bg-white rounded-full p-1 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                        <Check
                          className="w-3 h-3 text-white dark:text-black"
                          strokeWidth={3}
                        />
                      </div>
                      <span className="font-semibold text-slate-700 dark:text-gray-300">
                        {benefit}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Visual Demo */}
        <div className="lg:col-span-5 bg-gradient-to-br from-purple-50 via-blue-50 to-purple-100 dark:from-transparent dark:via-transparent dark:to-transparent">
          <div className="container mx-auto px-4 sm:px-6 md:px-8 py-12 md:py-16 lg:py-20 max-w-2xl flex items-center justify-center">
            <div className="space-y-8 w-full max-w-md mx-auto">
              {/* Step 1: Before */}
              <div
                className={cn(
                  'space-y-4 transition-all duration-500 delay-100',
                  isVisible
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-8',
                )}
              >
                <Badge
                  variant="outline"
                  className="text-xs font-black uppercase text-white dark:text-purple-500 bg-black dark:bg-transparent border-2 border-black dark:border-purple-500 px-3 py-1 shadow-[4px_4px_0px_theme(colors.black)] dark:shadow-[4px_4px_0px_rgba(168,85,247,0.3)]"
                >
                  {dict.step1Badge}
                </Badge>
                <Card className="bg-white dark:bg-transparent border-2 border-black dark:border-white p-6 shadow-[6px_6px_0px_theme(colors.black)] dark:shadow-[6px_6px_0px_rgba(255,255,255,0.1)] hover:translate-y-[-4px] hover:shadow-[8px_8px_0px_theme(colors.black)] dark:hover:shadow-[8px_8px_0px_rgba(255,255,255,0.15)] transition-all duration-300 ease-out group">
                  <div className="space-y-2">
                    <div className="font-mono text-sm flex justify-between p-2 -mx-2 rounded">
                      <span className="text-gray-500 dark:text-gray-400">
                        id
                      </span>
                      <span className="text-black dark:text-white">1</span>
                    </div>
                    <div className="font-mono text-sm flex justify-between p-2 -mx-2 rounded">
                      <span className="text-gray-500 dark:text-gray-400">
                        email
                      </span>
                      <span className="text-red-600 dark:text-red-500 font-bold">
                        john.doe@gmail.com
                      </span>
                    </div>
                    <div className="font-mono text-sm flex justify-between p-2 -mx-2 rounded">
                      <span className="text-gray-500 dark:text-gray-400">
                        phone
                      </span>
                      <span className="text-red-600 dark:text-red-500 font-bold">
                        555-123-4567
                      </span>
                    </div>
                    <div className="font-mono text-sm flex justify-between p-2 -mx-2 rounded">
                      <span className="text-gray-500 dark:text-gray-400">
                        name
                      </span>
                      <span className="text-red-600 dark:text-red-500 font-bold">
                        John Doe
                      </span>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Arrow */}
              <div
                className={cn(
                  'text-center transition-all duration-500 delay-300',
                  isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-50',
                )}
              >
                <div className="inline-block bg-black dark:bg-white text-white dark:text-black px-6 py-3 font-black text-lg rotate-[-2deg] shadow-[6px_6px_0px_theme(colors.yellow.500)] dark:shadow-[6px_6px_0px_rgba(234,179,8,0.5)] border-2 border-black dark:border-white animate-pulse-subtle">
                  {dict.arrowText}
                </div>
              </div>

              {/* Step 2: After */}
              <div
                className={cn(
                  'space-y-4 transition-all duration-500 delay-500',
                  isVisible
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-8',
                )}
              >
                <Badge
                  variant="outline"
                  className="text-xs font-black uppercase text-white dark:text-green-500 bg-black dark:bg-transparent border-2 border-black dark:border-green-500 px-3 py-1 shadow-[4px_4px_0px_theme(colors.black)] dark:shadow-[4px_4px_0px_rgba(34,197,94,0.3)]"
                >
                  {dict.step2Badge}
                </Badge>
                <Card className="bg-white dark:bg-transparent border-2 border-black dark:border-white p-6 shadow-[6px_6px_0px_theme(colors.black)] dark:shadow-[6px_6px_0px_rgba(255,255,255,0.1)] hover:translate-y-[-4px] hover:shadow-[8px_8px_0px_theme(colors.black)] dark:hover:shadow-[8px_8px_0px_rgba(255,255,255,0.15)] transition-all duration-300 ease-out group">
                  <div className="space-y-2">
                    <div className="font-mono text-sm flex justify-between p-2 -mx-2 rounded">
                      <span className="text-gray-500 dark:text-gray-400">
                        id
                      </span>
                      <span className="text-black dark:text-white">1</span>
                    </div>
                    <div className="font-mono text-sm flex justify-between p-2 -mx-2 rounded">
                      <span className="text-gray-500 dark:text-gray-400">
                        email
                      </span>
                      <span className="text-green-600 dark:text-green-500 font-bold">
                        user_1@anon.local
                      </span>
                    </div>
                    <div className="font-mono text-sm flex justify-between p-2 -mx-2 rounded">
                      <span className="text-gray-500 dark:text-gray-400">
                        phone
                      </span>
                      <span className="text-green-600 dark:text-green-500 font-bold">
                        555-XXX-XXXX
                      </span>
                    </div>
                    <div className="font-mono text-sm flex justify-between p-2 -mx-2 rounded">
                      <span className="text-gray-500 dark:text-gray-400">
                        name
                      </span>
                      <span className="text-green-600 dark:text-green-500 font-bold">
                        Anonymous User
                      </span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
