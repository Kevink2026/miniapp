import { NextResponse } from 'next/server';

export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_URL || 'https://how-early-base.vercel.app';

  const manifest = {
    accountAssociation: {
      header: process.env.FARCASTER_HEADER || '',
      payload: process.env.FARCASTER_PAYLOAD || '',
      signature: process.env.FARCASTER_SIGNATURE || '',
    },
    frame: {
      version: '1',
      name: 'How Early on Base?',
      iconUrl: `${appUrl}/icon.png`,
      splashImageUrl: `${appUrl}/splash.png`,
      splashBackgroundColor: '#0A0B0D',
      homeUrl: appUrl,
    },
  };

  return NextResponse.json(manifest);
}
