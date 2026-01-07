import { NextRequest, NextResponse } from 'next/server';
import { getServerAnalytics } from '@cloak/analytics/server';

const analytics = getServerAnalytics({
  appName: 'marketing-site',
  appType: 'www',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { distinctId, path, referrer, properties } = body;

    if (!distinctId || !path) {
      return NextResponse.json(
        { error: 'Missing distinctId or path' },
        { status: 400 }
      );
    }

    await analytics.trackPageView({
      distinctId,
      path,
      referrer,
      properties,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Analytics] Failed to track pageview:', error);
    return NextResponse.json(
      { error: 'Failed to track pageview' },
      { status: 500 }
    );
  }
}
