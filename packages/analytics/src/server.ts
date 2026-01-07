import { PostHog } from 'posthog-node';
import type {
  AnalyticsConfig,
  TrackEventParams,
  TrackPageViewParams,
} from './types';

let posthogClient: PostHog | null = null;

function getPostHogClient(): PostHog | null {
  const apiKey =
    process.env.NEXT_PUBLIC_POSTHOG_KEY || process.env.POSTHOG_API_KEY;
  const host =
    process.env.NEXT_PUBLIC_POSTHOG_HOST ||
    process.env.POSTHOG_HOST ||
    'https://us.i.posthog.com';

  console.log('[Analytics] Environment check:', {
    hasNextPublicKey: !!process.env.NEXT_PUBLIC_POSTHOG_KEY,
    hasLegacyKey: !!process.env.POSTHOG_API_KEY,
    hasNextPublicHost: !!process.env.NEXT_PUBLIC_POSTHOG_HOST,
    hasLegacyHost: !!process.env.POSTHOG_HOST,
    nodeEnv: process.env.NODE_ENV,
  });

  if (!apiKey) {
    console.warn(
      '[Analytics] NEXT_PUBLIC_POSTHOG_KEY or POSTHOG_API_KEY not set - analytics disabled'
    );
    return null;
  }

  if (!posthogClient) {
    posthogClient = new PostHog(apiKey, { host });
    console.log('[Analytics] PostHog client initialized', { host });
  }

  return posthogClient;
}

export class ServerAnalytics {
  private config: AnalyticsConfig;
  private client: PostHog | null;

  constructor(config: AnalyticsConfig) {
    this.config = config;
    this.client = getPostHogClient();
  }

  async trackEvent({
    distinctId,
    event,
    properties = {},
  }: TrackEventParams): Promise<void> {
    if (!this.client) {
      console.warn(
        '[Analytics] Client not initialized - skipping event:',
        event
      );
      return;
    }

    const eventData = {
      distinctId,
      event,
      properties: {
        ...properties,
        app_name: this.config.appName,
        app_type: this.config.appType,
        environment: this.config.environment || process.env.NODE_ENV,
      },
    };

    try {
      this.client.capture(eventData);
      await this.client.flush();
      console.log('[Analytics] Event tracked:', event);
    } catch (error) {
      console.error('[Analytics] Failed to track event:', event, error);
    }
  }

  async trackPageView({
    distinctId,
    path,
    referrer,
    properties = {},
  }: TrackPageViewParams): Promise<void> {
    if (!this.client) {
      console.warn(
        '[Analytics] Client not initialized - skipping pageview:',
        path
      );
      return;
    }

    const eventData = {
      distinctId,
      event: '$pageview',
      properties: {
        ...properties,
        $current_url: path,
        $referrer: referrer,
        app_name: this.config.appName,
        app_type: this.config.appType,
        environment: this.config.environment || process.env.NODE_ENV,
      },
    };

    try {
      this.client.capture(eventData);
      await this.client.flush();
      console.log('[Analytics] Pageview tracked:', path);
    } catch (error) {
      console.error('[Analytics] Failed to track pageview:', path, error);
    }
  }

  async shutdown(): Promise<void> {
    if (this.client) {
      await this.client.shutdown();
    }
  }
}

export function getServerAnalytics(config: AnalyticsConfig): ServerAnalytics {
  return new ServerAnalytics(config);
}
