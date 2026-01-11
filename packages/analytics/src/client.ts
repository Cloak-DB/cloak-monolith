import type { AnalyticsConfig } from './types';

export interface ClientAnalyticsOptions extends AnalyticsConfig {
  apiKey: string;
  apiHost: string;
}

export class ClientAnalytics {
  private config: AnalyticsConfig;
  private apiKey: string;
  private apiHost: string;

  constructor(options: ClientAnalyticsOptions) {
    this.config = {
      appName: options.appName,
      appType: options.appType,
      environment: options.environment,
    };
    this.apiKey = options.apiKey;
    this.apiHost = options.apiHost;
  }

  async track(
    event: string,
    properties: Record<string, unknown> = {},
  ): Promise<void> {
    if (!this.apiKey) return;

    const distinctId = this.getDistinctId();
    const payload = {
      distinctId,
      event,
      properties: {
        ...properties,
        app_name: this.config.appName,
        app_type: this.config.appType,
        environment: this.config.environment || 'production',
      },
    };

    try {
      await fetch('/api/analytics/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error('[@cloak-db/analytics] Failed to track event:', error);
    }
  }

  async trackPageView(path: string, referrer?: string): Promise<void> {
    if (!this.apiKey) return;

    const distinctId = this.getDistinctId();
    const payload = {
      distinctId,
      path,
      referrer,
    };

    try {
      await fetch('/api/analytics/pageview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error('[@cloak-db/analytics] Failed to track pageview:', error);
    }
  }

  identify(userId: string, properties: Record<string, unknown> = {}): void {
    this.setDistinctId(userId);
    this.track('$identify', properties);
  }

  private getDistinctId(): string {
    if (typeof window === 'undefined') return 'unknown';

    let id = localStorage.getItem('ph_distinct_id');
    if (!id) {
      id = `anon_${Math.random().toString(36).substring(2, 15)}`;
      localStorage.setItem('ph_distinct_id', id);
    }
    return id;
  }

  private setDistinctId(userId: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ph_distinct_id', userId);
    }
  }
}

export function getClientAnalytics(
  config: AnalyticsConfig,
  apiKey?: string,
  apiHost?: string,
): ClientAnalytics {
  return new ClientAnalytics({
    ...config,
    apiKey: apiKey || process.env.NEXT_PUBLIC_POSTHOG_KEY || '',
    apiHost:
      apiHost ||
      process.env.NEXT_PUBLIC_POSTHOG_HOST ||
      'https://us.i.posthog.com',
  });
}
