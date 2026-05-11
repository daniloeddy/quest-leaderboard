import { NextRequest } from 'next/server';
import { getLatestScores, setLatestScores } from '@/lib/syncRelay';

export const dynamic = 'force-dynamic';

export async function GET() {
  const scores = await getLatestScores();
  return new Response(scores, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const parsed: unknown = JSON.parse(body);
    if (!Array.isArray(parsed)) {
      return new Response('Invalid format', { status: 400 });
    }
    await setLatestScores(body);
    return new Response('OK', { status: 200 });
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }
}
