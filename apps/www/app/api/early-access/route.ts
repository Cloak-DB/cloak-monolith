import { NextRequest, NextResponse } from 'next/server';
import { render } from '@react-email/components';
import { EarlyAccessRequestEmail } from '@cloak-db/email-templates/early-access-request';
import { EarlyAccessWelcomeEmail } from '@cloak-db/email-templates/early-access-welcome';
import { getEmail } from '@/lib/email/client';
import { getServerAnalytics } from '@cloak-db/analytics/server';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { isValidLocale, defaultLocale, type Locale } from '@/lib/i18n/config';

const analytics = getServerAnalytics({
  appName: 'marketing-site',
  appType: 'www',
});

interface EarlyAccessRequest {
  email: string;
  company?: string;
  useCase?: string;
  locale?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: EarlyAccessRequest = await request.json();
    const { email, company, useCase, locale: requestLocale } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 },
      );
    }

    const locale: Locale =
      requestLocale && isValidLocale(requestLocale)
        ? requestLocale
        : defaultLocale;

    const dict = await getDictionary(locale);
    const teamTranslations = dict.emails.earlyAccess;
    const userTranslations = dict.emails.welcome;

    const emailClient = getEmail();

    if (!emailClient.isConfigured()) {
      console.warn('[Early Access] Email not configured, skipping send');

      await analytics.trackEvent({
        distinctId: email,
        event: 'early_access_requested',
        properties: {
          email_domain: email.split('@')[1],
          company,
          use_case: useCase,
          locale,
          email_configured: false,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Request received (email not configured)',
      });
    }

    const teamHtml = await render(
      EarlyAccessRequestEmail({
        email,
        company,
        useCase,
        submittedAt: new Date().toLocaleString(
          locale === 'fr' ? 'fr-CA' : 'en-US',
          {
            dateStyle: 'long',
            timeStyle: 'short',
          },
        ),
        translations: {
          heading: teamTranslations.heading,
          intro: teamTranslations.intro,
          emailLabel: teamTranslations.emailLabel,
          companyLabel: teamTranslations.companyLabel,
          useCaseLabel: teamTranslations.useCaseLabel,
          submittedAtLabel: teamTranslations.submittedAtLabel,
          note: teamTranslations.note,
          footerTagline: teamTranslations.footerTagline,
          footerWebsite: teamTranslations.footerWebsite,
        },
      }),
    );

    const userHtml = await render(
      EarlyAccessWelcomeEmail({
        translations: {
          heading: userTranslations.heading,
          intro: userTranslations.intro,
          resourcesHeading: userTranslations.resourcesHeading,
          docsLabel: userTranslations.docsLabel,
          docsDescription: userTranslations.docsDescription,
          githubLabel: userTranslations.githubLabel,
          githubDescription: userTranslations.githubDescription,
          outro: userTranslations.outro,
          footerTagline: userTranslations.footerTagline,
          footerWebsite: userTranslations.footerWebsite,
        },
        docsUrl: `https://cloak-db.com/${locale}/docs`,
        githubUrl: 'https://github.com/Cloak-DB/cloak-monolith',
      }),
    );

    const recipientEmail =
      process.env.EARLY_ACCESS_EMAIL || 'info@cloak-db.com';

    const teamResult = await emailClient.send({
      to: recipientEmail,
      subject: teamTranslations.subject,
      html: teamHtml,
      tags: [
        { name: 'category', value: 'early-access' },
        { name: 'source', value: 'marketing-site' },
        { name: 'type', value: 'team-notification' },
        { name: 'locale', value: locale },
      ],
    });

    const userResult = await emailClient.send({
      to: email,
      subject: userTranslations.subject,
      html: userHtml,
      tags: [
        { name: 'category', value: 'early-access' },
        { name: 'source', value: 'marketing-site' },
        { name: 'type', value: 'user-welcome' },
        { name: 'locale', value: locale },
      ],
    });

    if (!teamResult || !userResult) {
      console.error('[Early Access] Failed to send email');

      await analytics.trackEvent({
        distinctId: email,
        event: 'early_access_email_failed',
        properties: {
          email_domain: email.split('@')[1],
          company,
          use_case: useCase,
          locale,
          team_email_sent: !!teamResult,
          user_email_sent: !!userResult,
        },
      });

      return NextResponse.json(
        { error: 'Failed to send notification' },
        { status: 500 },
      );
    }

    await analytics.trackEvent({
      distinctId: email,
      event: 'early_access_requested',
      properties: {
        email_domain: email.split('@')[1],
        company,
        use_case: useCase,
        locale,
        team_email_id: teamResult.id,
        user_email_id: userResult.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Early access request submitted successfully',
    });
  } catch (error) {
    console.error('[Early Access] Exception:', error);

    await analytics.trackEvent({
      distinctId: 'unknown',
      event: 'early_access_error',
      properties: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
