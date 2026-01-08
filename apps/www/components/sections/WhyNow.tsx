'use client';

import { Shield, Github, Clock } from 'lucide-react';

type WhyNowProps = {
  dict: {
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
};

export function WhyNow({ dict }: WhyNowProps) {
  return (
    <section className="py-24 bg-slate-100 dark:bg-gray-900 border-t-2 border-black dark:border-white">
      <div className="container mx-auto px-4 sm:px-6 md:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <p className="text-sm font-black uppercase tracking-wider text-purple-700 dark:text-purple-400 mb-4">
              {dict.badge}
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6">
              {dict.title}
            </h2>
            <p className="text-lg text-slate-600 dark:text-gray-400 max-w-2xl mx-auto">
              {dict.description}
            </p>
          </div>

          {/* Deprecated tools */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Snaplet - Discontinued */}
            <div className="p-6 bg-white dark:bg-gray-950 border-2 border-slate-200 dark:border-gray-800">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-3 h-3 bg-red-500 rounded-full" />
                <span className="font-black text-red-600 dark:text-red-400 uppercase text-sm">
                  {dict.snapletBadge}
                </span>
              </div>
              <h3 className="text-xl font-black text-slate-400 dark:text-gray-600 mb-2">
                {dict.snapletTitle}
              </h3>
              <p className="text-slate-500 dark:text-gray-500">
                {dict.snapletDescription}
              </p>
            </div>

            {/* RepliByte - Unmaintained */}
            <div className="p-6 bg-white dark:bg-gray-950 border-2 border-slate-200 dark:border-gray-800">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-3 h-3 bg-orange-500 rounded-full" />
                <span className="font-black text-orange-600 dark:text-orange-400 uppercase text-sm">
                  {dict.replibyteBadge}
                </span>
              </div>
              <h3 className="text-xl font-black text-slate-400 dark:text-gray-600 mb-2">
                {dict.replibyteTitle}
              </h3>
              <p className="text-slate-500 dark:text-gray-500">
                {dict.replibyteDescription}
              </p>
            </div>
          </div>

          {/* Cloak DB - The alternative */}
          <div className="p-8 bg-white dark:bg-gray-950 border-2 border-black dark:border-white shadow-[6px_6px_0px_theme(colors.black)] dark:shadow-[6px_6px_0px_rgba(255,255,255,0.1)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <span className="font-black text-green-600 dark:text-green-400 uppercase text-sm">
                {dict.cloakBadge}
              </span>
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3">
              {dict.cloakTitle}
            </h3>
            <p className="text-lg text-slate-600 dark:text-gray-400 mb-6">
              {dict.cloakDescription}
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-gray-300">
                <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                {dict.privacyFirst}
              </div>
              <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-gray-300">
                <Github className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                {dict.openSource}
              </div>
              <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-gray-300">
                <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                {dict.activelyMaintained}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
