import { NextRequest, NextResponse } from 'next/server';
import { getServerAnalytics } from '@cloak-db/analytics/server';

const analytics = getServerAnalytics({
  appName: 'marketing-site',
  appType: 'www',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { distinctId, event, properties } = body;

    if (!distinctId || !event) {
      return NextResponse.json(
        { error: 'Missing distinctId or event' },
        { status: 400 },
      );
    }

    await analytics.trackEvent({
      distinctId,
      event,
      properties,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Analytics] Failed to track event:', error);
    return NextResponse.json(
      { error: 'Failed to track event' },
      { status: 500 },
    );
  }
}
