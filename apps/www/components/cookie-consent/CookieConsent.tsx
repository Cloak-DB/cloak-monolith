'use client';

import { useState, useEffect } from 'react';
import { Button } from '@cloak/ui/components/button';
import { X, Cookie, Settings } from 'lucide-react';
import Link from 'next/link';

type CookiePreferences = {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
};

type CookieConsentProps = {
  locale: string;
};

const content = {
  en: {
    title: 'Cookie Settings',
    description:
      'We use cookies to enhance your experience. You can choose which cookies to accept.',
    necessary: 'Necessary',
    necessaryDesc: 'Essential cookies for website functionality',
    analytics: 'Analytics',
    analyticsDesc: 'Help us understand how you use our website',
    marketing: 'Marketing',
    marketingDesc: 'Used to deliver relevant content and ads',
    acceptAll: 'Accept All',
    rejectAll: 'Reject All',
    savePreferences: 'Save Preferences',
    customize: 'Customize',
    learnMore: 'Learn more',
    privacyPolicy: 'Privacy Policy',
  },
  fr: {
    title: 'Paramètres des Témoins',
    description:
      'Nous utilisons des témoins pour améliorer votre expérience. Vous pouvez choisir quels témoins accepter.',
    necessary: 'Nécessaires',
    necessaryDesc: 'Témoins essentiels au fonctionnement du site',
    analytics: 'Analytiques',
    analyticsDesc: 'Nous aident à comprendre comment vous utilisez notre site',
    marketing: 'Marketing',
    marketingDesc:
      'Utilisés pour diffuser du contenu et des publicités pertinents',
    acceptAll: 'Tout Accepter',
    rejectAll: 'Tout Refuser',
    savePreferences: 'Sauvegarder',
    customize: 'Personnaliser',
    learnMore: 'En savoir plus',
    privacyPolicy: 'Politique de Confidentialité',
  },
};

const COOKIE_CONSENT_KEY = 'cloakdb_cookie_consent';
const COOKIE_PREFERENCES_KEY = 'cloakdb_cookie_preferences';

export function CookieConsent({ locale }: CookieConsentProps) {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
  });

  const dict = locale === 'fr' ? content.fr : content.en;

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    const savedPreferences = localStorage.getItem(COOKIE_PREFERENCES_KEY);

    if (!consent) {
      setTimeout(() => {
        setShowBanner(true);
      }, 4000);
    } else if (savedPreferences) {
      try {
        const parsed = JSON.parse(savedPreferences);
        setPreferences(parsed);
        applyConsent(parsed);
      } catch (e) {
        console.error('Failed to parse cookie preferences', e);
      }
    }
  }, []);

  const applyConsent = (prefs: CookiePreferences) => {
    if (typeof window !== 'undefined' && (window as any).posthog) {
      if (prefs.analytics) {
        (window as any).posthog.opt_in_capturing();
      } else {
        (window as any).posthog.opt_out_capturing();
      }
    }

    if (typeof (window as any).gtag === 'function') {
      if (prefs.analytics) {
        (window as any).gtag('consent', 'update', {
          analytics_storage: 'granted',
        });
      } else {
        (window as any).gtag('consent', 'update', {
          analytics_storage: 'denied',
        });
      }

      if (prefs.marketing) {
        (window as any).gtag('consent', 'update', {
          ad_storage: 'granted',
          ad_user_data: 'granted',
          ad_personalization: 'granted',
        });
      } else {
        (window as any).gtag('consent', 'update', {
          ad_storage: 'denied',
          ad_user_data: 'denied',
          ad_personalization: 'denied',
        });
      }
    }
  };

  const saveConsent = (prefs: CookiePreferences) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(prefs));
    applyConsent(prefs);
    setShowBanner(false);
    setShowSettings(false);
  };

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
    };
    setPreferences(allAccepted);
    saveConsent(allAccepted);
  };

  const handleRejectAll = () => {
    const onlyNecessary = {
      necessary: true,
      analytics: false,
      marketing: false,
    };
    setPreferences(onlyNecessary);
    saveConsent(onlyNecessary);
  };

  const handleSavePreferences = () => {
    saveConsent(preferences);
  };

  const togglePreference = (key: keyof CookiePreferences) => {
    if (key === 'necessary') return;
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (!showBanner) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fade-in" />

      <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up">
        <div className="container mx-auto px-4 pb-4">
          <div className="bg-white dark:bg-gray-900 border-2 border-black dark:border-white shadow-[8px_8px_0px_theme(colors.black)] dark:shadow-[8px_8px_0px_rgba(255,255,255,0.2)] p-6 max-w-4xl mx-auto">
            {!showSettings ? (
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <Cookie className="w-8 h-8 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="text-xl font-black text-black dark:text-white mb-2">
                      {dict.title}
                    </h3>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                      {dict.description}{' '}
                      <Link
                        href={`/${locale}/privacy`}
                        className="text-yellow-700 dark:text-yellow-400 hover:underline font-bold"
                      >
                        {dict.learnMore} {dict.privacyPolicy.toLowerCase()}
                      </Link>
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleAcceptAll}
                    variant="yellow"
                    className="flex-1 sm:flex-none font-black uppercase"
                  >
                    {dict.acceptAll}
                  </Button>
                  <Button
                    onClick={handleRejectAll}
                    variant="outline"
                    className="flex-1 sm:flex-none font-black uppercase"
                  >
                    {dict.rejectAll}
                  </Button>
                  <Button
                    onClick={() => setShowSettings(true)}
                    variant="ghost"
                    className="flex-1 sm:flex-none font-black uppercase group"
                  >
                    <Settings className="w-4 h-4 mr-2 transition-transform group-hover:rotate-90 duration-300" />
                    {dict.customize}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black text-black dark:text-white">
                    {dict.title}
                  </h3>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    aria-label="Close settings"
                  >
                    <X className="w-5 h-5 text-black dark:text-white" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4 p-4 border-2 border-black dark:border-white bg-gray-50 dark:bg-gray-800">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-black text-black dark:text-white">
                          {dict.necessary}
                        </h4>
                        <span className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase">
                          (Required)
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {dict.necessaryDesc}
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.necessary}
                      disabled
                      className="w-5 h-5 mt-1 opacity-50 cursor-not-allowed"
                    />
                  </div>

                  <div
                    className="flex items-start justify-between gap-4 p-4 border-2 border-black dark:border-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                    onClick={() => togglePreference('analytics')}
                  >
                    <div className="flex-1">
                      <h4 className="font-black text-black dark:text-white mb-1">
                        {dict.analytics}
                      </h4>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {dict.analyticsDesc}
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={() => togglePreference('analytics')}
                      className="w-5 h-5 mt-1 cursor-pointer accent-yellow-500"
                    />
                  </div>

                  <div
                    className="flex items-start justify-between gap-4 p-4 border-2 border-black dark:border-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                    onClick={() => togglePreference('marketing')}
                  >
                    <div className="flex-1">
                      <h4 className="font-black text-black dark:text-white mb-1">
                        {dict.marketing}
                      </h4>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {dict.marketingDesc}
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.marketing}
                      onChange={() => togglePreference('marketing')}
                      className="w-5 h-5 mt-1 cursor-pointer accent-yellow-500"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t-2 border-black dark:border-white">
                  <Button
                    onClick={handleSavePreferences}
                    variant="yellow"
                    className="flex-1 sm:flex-none font-black uppercase"
                  >
                    {dict.savePreferences}
                  </Button>
                  <Link
                    href={`/${locale}/privacy`}
                    className="text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-yellow-600 dark:hover:text-yellow-500 flex items-center justify-center sm:justify-start"
                  >
                    {dict.privacyPolicy} →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
