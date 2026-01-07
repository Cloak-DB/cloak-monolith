# @cloak/analytics

Shared PostHog analytics configuration for Cloak DB.

## Architecture

### Server-Side Tracking (Marketing Site)
- Uses `posthog-node` for server-side tracking
- Bypasses ad blockers (no client-side scripts)
- No sensitive data - safe for public tracking
- Implements via Next.js Route Handlers

## Configuration

| App | `app_name` | `app_type` | Tracking |
|-----|-----------|-----------|----------|
| `apps/www` | `marketing-site` | `www` | Server-side |

## Usage

### Server-Side (Marketing)

```typescript
import { getServerAnalytics } from '@cloak/analytics/server';

const analytics = getServerAnalytics({
  appName: 'marketing-site',
  appType: 'www',
});

// Track page view
await analytics.trackPageView({
  distinctId: anonymousId,
  path: '/docs/getting-started',
  referrer: document.referrer,
});

// Track event
await analytics.trackEvent({
  distinctId: anonymousId,
  event: 'cta_clicked',
  properties: {
    location: 'hero',
    ctaText: 'Get Started',
  },
});
```

## Environment Variables

```bash
# Server-side analytics
NEXT_PUBLIC_POSTHOG_KEY=phc_xxx
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

Note: Server-side analytics will check `NEXT_PUBLIC_POSTHOG_KEY` first, then fall back to `POSTHOG_API_KEY` for backwards compatibility.

## Privacy

- No client-side scripts, server-side only
- No PII without consent
- Respects DNT headers
- GDPR compliant
