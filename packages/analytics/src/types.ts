export type AppName = 'marketing-site' | 'web-app' | 'api';
export type AppType = 'www' | 'product' | 'backend';

export interface AnalyticsConfig {
  appName: AppName;
  appType: AppType;
  environment?: string;
}

export interface TrackEventParams {
  distinctId: string;
  event: string;
  properties?: Record<string, unknown>;
}

export interface TrackPageViewParams {
  distinctId: string;
  path: string;
  referrer?: string;
  properties?: Record<string, unknown>;
}
