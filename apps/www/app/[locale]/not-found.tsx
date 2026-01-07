import Link from 'next/link';
import type { Locale } from '@/lib/i18n/config';

const messages = {
  en: {
    title: '404',
    subtitle: 'Page not found',
    description: "Sorry, we couldn't find the page you're looking for.",
    home: 'Go back home',
    docs: 'Browse documentation',
  },
  fr: {
    title: '404',
    subtitle: 'Page introuvable',
    description: "Désolé, nous n'avons pas trouvé la page que vous recherchez.",
    home: "Retour à l'accueil",
    docs: 'Parcourir la documentation',
  },
};

export default function NotFound() {
  const locale = 'en' as Locale;

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold mb-4">{messages[locale].title}</h1>
        <h2 className="text-2xl font-semibold mb-4">
          {messages[locale].subtitle}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          {messages[locale].description}
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href={`/${locale === 'en' ? '/' : `/${locale}`}`}
            className="px-6 py-3 bg-yellow-500 dark:bg-transparent text-black dark:text-yellow-500 font-medium rounded-lg border-2 border-yellow-500 hover:opacity-80 transition"
          >
            {messages[locale].home}
          </Link>
          <Link
            href={`/${locale === 'en' ? '' : `/${locale}`}/docs`}
            className="px-6 py-3 border-2 border-black dark:border-white rounded-lg font-medium hover:border-yellow-500 hover:text-yellow-500 transition"
          >
            {messages[locale].docs}
          </Link>
        </div>
      </div>
    </div>
  );
}
