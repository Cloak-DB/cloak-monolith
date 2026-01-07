import { Navbar } from '@/components/Navbar';
import type { Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { DesignSystemClient } from './client';

export default async function DesignSystemPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale = localeParam as Locale;
  const dict = await getDictionary(locale);

  return (
    <div className="min-h-screen">
      <Navbar locale={locale} dict={dict.navbar} />
      <DesignSystemClient />
    </div>
  );
}
