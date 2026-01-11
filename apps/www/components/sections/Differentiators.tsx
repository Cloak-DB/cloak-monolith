'use client';

import { Undo2, Search, Camera } from 'lucide-react';
import { cn } from '@cloak-db/ui/lib/utils';

type DifferentiatorsProps = {
  dict: {
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
};

const accentStyles = {
  purple: {
    bg: 'bg-purple-600',
    text: 'text-purple-700 dark:text-purple-400',
  },
  blue: {
    bg: 'bg-blue-600',
    text: 'text-blue-700 dark:text-blue-400',
  },
  orange: {
    bg: 'bg-orange-500',
    text: 'text-orange-700 dark:text-orange-400',
  },
};

export function Differentiators({ dict }: DifferentiatorsProps) {
  const differentiators = [
    {
      ...dict.timeMachine,
      icon: Undo2,
      accent: 'purple' as const,
    },
    {
      ...dict.resourceInspector,
      icon: Search,
      accent: 'blue' as const,
    },
    {
      ...dict.captureAnonymize,
      icon: Camera,
      accent: 'orange' as const,
    },
  ];

  return (
    <section
      id="differentiators"
      className="py-24 bg-slate-100 dark:bg-gray-900 border-y-2 border-black dark:border-white scroll-mt-20"
    >
      <div className="container mx-auto px-4 sm:px-6 md:px-8">
        {/* Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <p className="text-sm font-black uppercase tracking-wider text-purple-700 dark:text-purple-400 mb-4">
            {dict.badge}
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6">
            {dict.title}
          </h2>
          <p className="text-lg sm:text-xl text-slate-600 dark:text-gray-400">
            {dict.description}{' '}
            <span className="font-bold text-slate-900 dark:text-white">
              {dict.descriptionHighlight}
            </span>{' '}
            {dict.descriptionEnd}
          </p>
        </div>

        {/* Differentiator cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {differentiators.map((diff, index) => (
            <div
              key={index}
              className={cn(
                'relative p-8 bg-white dark:bg-gray-950',
                'border-2 border-black dark:border-white',
                'shadow-[4px_4px_0px_theme(colors.black)] dark:shadow-[4px_4px_0px_rgba(255,255,255,0.1)]',
                'hover:shadow-[8px_8px_0px_theme(colors.black)] dark:hover:shadow-[8px_8px_0px_rgba(255,255,255,0.15)]',
                'hover:translate-x-[-2px] hover:translate-y-[-2px]',
                'transition-all duration-300 group',
              )}
            >
              {/* Icon */}
              <div
                className={cn(
                  'w-14 h-14 flex items-center justify-center mb-6',
                  'group-hover:scale-110 transition-transform duration-300',
                  accentStyles[diff.accent].bg,
                )}
              >
                <diff.icon className="w-7 h-7 text-white" strokeWidth={2.5} />
              </div>

              {/* Content */}
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                {diff.title}
              </h3>
              <p
                className={cn(
                  'text-sm font-bold mb-4',
                  accentStyles[diff.accent].text,
                )}
              >
                {diff.tagline}
              </p>
              <p className="text-slate-600 dark:text-gray-400 leading-relaxed">
                {diff.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
