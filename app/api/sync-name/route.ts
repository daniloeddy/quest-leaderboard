import { NextRequest } from 'next/server';
import { getLatestGameName, setLatestGameName } from '@/lib/syncRelay';

export const dynamic = 'force-dynamic';

export async function GET() {
  const name = await getLatestGameName();
  return new Response(name, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const name = await request.text();
    if (name.length > 60) {
      return new Response('Too long', { status: 400 });
    }
    await setLatestGameName(name);
    return new Response('OK', { status: 200 });
  } catch {
    return new Response('Error', { status: 500 });
  }
}
