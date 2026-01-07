'use client';

import Script from 'next/script';
import { useEffect } from 'react';

const GA_MEASUREMENT_ID = 'G-QYN31GRZDZ';

export function GoogleAnalytics() {
  useEffect(() => {
    const consent = localStorage.getItem('cloakdb_cookie_preferences');

    if (consent) {
      try {
        const preferences = JSON.parse(consent);

        if (typeof (window as any).gtag === 'function') {
          if (preferences.analytics) {
            (window as any).gtag('consent', 'update', {
              analytics_storage: 'granted',
            });
          }

          if (preferences.marketing) {
            (window as any).gtag('consent', 'update', {
              ad_storage: 'granted',
              ad_user_data: 'granted',
              ad_personalization: 'granted',
            });
          }
        }
      } catch (e) {
        console.error('Failed to parse cookie preferences', e);
      }
    }
  }, []);

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="lazyOnload"
      />
      <Script id="google-analytics" strategy="lazyOnload">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          
          gtag('consent', 'default', {
            'analytics_storage': 'denied',
            'ad_storage': 'denied',
            'ad_user_data': 'denied',
            'ad_personalization': 'denied',
            'wait_for_update': 500
          });
          
          gtag('config', '${GA_MEASUREMENT_ID}', {
            page_path: window.location.pathname,
            anonymize_ip: true,
            cookie_flags: 'SameSite=None;Secure'
          });
        `}
      </Script>
    </>
  );
}
