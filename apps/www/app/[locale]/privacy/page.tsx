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
    title: `${dict.privacy.title} - Cloak DB`,
    description:
      'Privacy policy and data protection information for Cloak DB. Learn about how we collect, use, and protect your personal information.',
    keywords: [
      'privacy policy',
      'data protection',
      'GDPR',
      'data privacy',
      'personal information',
      'cookie policy',
      'Cloak DB privacy',
    ],
    alternates: {
      canonical: locale === 'en' ? '/privacy' : `/${locale}/privacy`,
      languages: {
        en: '/privacy',
        fr: '/fr/privacy',
      },
    },
  };
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale = localeParam as Locale;
  const dict = await getDictionary(locale);
  const { privacy } = dict;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="container mx-auto px-8 py-20 max-w-4xl">
        <article className="space-y-8">
          <header className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-black text-black dark:text-white">
              {privacy.title}
            </h1>
            <p className="text-sm font-bold text-gray-600 dark:text-gray-400">
              {privacy.lastUpdated}
            </p>
          </header>

          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-black text-black dark:text-white mb-4">
                {privacy.sections.introduction.title}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 font-medium leading-relaxed">
                {privacy.sections.introduction.content}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-black dark:text-white mb-4">
                {privacy.sections.informationWeCollect.title}
              </h2>

              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-black dark:text-white mb-2">
                    {privacy.sections.informationWeCollect.personalInfo.title}
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 font-medium whitespace-pre-line leading-relaxed">
                    {privacy.sections.informationWeCollect.personalInfo.content}
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-black dark:text-white mb-2">
                    {privacy.sections.informationWeCollect.usageData.title}
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 font-medium whitespace-pre-line leading-relaxed">
                    {privacy.sections.informationWeCollect.usageData.content}
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-black dark:text-white mb-2">
                    {privacy.sections.informationWeCollect.cookies.title}
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 font-medium whitespace-pre-line leading-relaxed">
                    {privacy.sections.informationWeCollect.cookies.content}
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-black text-black dark:text-white mb-4">
                {privacy.sections.howWeUse.title}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 font-medium whitespace-pre-line leading-relaxed">
                {privacy.sections.howWeUse.content}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-black dark:text-white mb-4">
                {privacy.sections.dataSharing.title}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 font-medium whitespace-pre-line leading-relaxed">
                {privacy.sections.dataSharing.content}
              </p>
            </section>

            <section className="bg-yellow-50 dark:bg-yellow-900/10 border-2 border-yellow-500 p-6">
              <h2 className="text-2xl font-black text-black dark:text-white mb-4">
                {privacy.sections.yourRights.title}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 font-medium whitespace-pre-line leading-relaxed">
                {privacy.sections.yourRights.content}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-black dark:text-white mb-4">
                {privacy.sections.dataRetention.title}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 font-medium whitespace-pre-line leading-relaxed">
                {privacy.sections.dataRetention.content}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-black dark:text-white mb-4">
                {privacy.sections.security.title}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 font-medium whitespace-pre-line leading-relaxed">
                {privacy.sections.security.content}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-black dark:text-white mb-4">
                {privacy.sections.internationalTransfers.title}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 font-medium whitespace-pre-line leading-relaxed">
                {privacy.sections.internationalTransfers.content}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-black dark:text-white mb-4">
                {privacy.sections.childrenPrivacy.title}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 font-medium whitespace-pre-line leading-relaxed">
                {privacy.sections.childrenPrivacy.content}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-black dark:text-white mb-4">
                {privacy.sections.changes.title}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 font-medium whitespace-pre-line leading-relaxed">
                {privacy.sections.changes.content}
              </p>
            </section>

            <section className="bg-gray-50 dark:bg-gray-800 border-2 border-black dark:border-white p-6">
              <h2 className="text-2xl font-black text-black dark:text-white mb-4">
                {privacy.sections.contact.title}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 font-medium whitespace-pre-line leading-relaxed">
                {privacy.sections.contact.content}
              </p>
            </section>
          </div>
        </article>
      </div>
    </div>
  );
}
