import { NextResponse } from 'next/server';

const IPFS_GATEWAYS = [
  'https://ipfs.io/ipfs/',
  'https://gateway.pinata.cloud/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
  'https://dweb.link/ipfs/',
  'https://ipfs.fleek.co/ipfs/',
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const hash = searchParams.get('hash');
  const action = searchParams.get('action') || 'check';

  if (!hash) {
    return NextResponse.json({ error: 'IPFS hash is required' }, { status: 400 });
  }

  try {
    switch (action) {
      case 'check':
        // Check availability across multiple gateways
        const availability = await Promise.allSettled(
          IPFS_GATEWAYS.map(async (gateway) => {
            const url = `${gateway}${hash}`;
            const response = await fetch(url, { method: 'HEAD' });
            return {
              gateway: gateway.replace('/ipfs/', ''),
              available: response.ok,
              url,
            };
          })
        );

        const results = availability.map((result, index) => {
          if (result.status === 'fulfilled') {
            return result.value;
          }
          return {
            gateway: IPFS_GATEWAYS[index]?.replace('/ipfs/', '') || 'unknown',
            available: false,
            url: `${IPFS_GATEWAYS[index]}${hash}`,
          };
        });

        return NextResponse.json({
          hash,
          gateways: results,
          available: results.some(r => r.available),
        });

      case 'metadata':
        // Fetch metadata from IPFS
        const metadataUrl = `${IPFS_GATEWAYS[0]}${hash}`;
        const response = await fetch(metadataUrl);
        
        if (!response.ok) {
          return NextResponse.json({ error: 'Failed to fetch metadata' }, { status: 404 });
        }

        const metadata = await response.json();
        return NextResponse.json({ hash, metadata });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('IPFS API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 