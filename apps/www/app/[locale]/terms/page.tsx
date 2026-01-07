import { Metadata } from 'next';
import type { Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = localeParam as Locale;
  const dict = await getDictionary(locale);

  return {
    title: `${dict.terms.title} - Cloak DB`,
    description:
      'Terms of service and conditions of use for Cloak DB. Learn about your rights and responsibilities when using our services.',
    keywords: [
      'terms of service',
      'terms and conditions',
      'user agreement',
      'service agreement',
      'legal terms',
      'Cloak DB terms',
      'open source license',
    ],
    alternates: {
      canonical: locale === 'en' ? '/terms' : `/${locale}/terms`,
      languages: {
        en: '/terms',
        fr: '/fr/terms',
      },
    },
  };
}

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale = localeParam as Locale;
  const dict = await getDictionary(locale);
  const { terms } = dict;

  const sections = [
    terms.sections.acceptance,
    terms.sections.description,
    terms.sections.license,
    terms.sections.userResponsibilities,
    terms.sections.dataPrivacy,
    terms.sections.intellectualProperty,
    terms.sections.prohibitedUses,
    terms.sections.disclaimerWarranties,
    terms.sections.limitationLiability,
    terms.sections.indemnification,
    terms.sections.changes,
    terms.sections.termination,
    terms.sections.governingLaw,
    terms.sections.contact,
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="container mx-auto px-8 py-20 max-w-4xl">
        <article className="space-y-8">
          <header className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-black text-black dark:text-white">
              {terms.title}
            </h1>
            <p className="text-sm font-bold text-gray-600 dark:text-gray-400">
              {terms.lastUpdated}
            </p>
          </header>

          <div className="prose prose-lg max-w-none space-y-8">
            {sections.map((section, idx) => (
              <section
                key={idx}
                className={
                  idx === sections.length - 1
                    ? 'bg-gray-50 dark:bg-gray-800 border-2 border-black dark:border-white p-6'
                    : ''
                }
              >
                <h2 className="text-2xl font-black text-black dark:text-white mb-4">
                  {section.title}
                </h2>
                <p className="text-gray-700 dark:text-gray-300 font-medium whitespace-pre-line leading-relaxed">
                  {section.content}
                </p>
              </section>
            ))}
          </div>
        </article>
      </div>
    </div>
  );
}
