import { kv } from '@vercel/kv';

const SCORES_KEY = 'quest_leaderboard_scores';

export async function getLatestScores(): Promise<string> {
  try {
    const scores = await kv.get(SCORES_KEY);
    if (scores === null || scores === undefined) return '[]';
    // @vercel/kv auto-parses JSON, so we need to re-stringify it
    if (typeof scores === 'string') return scores;
    return JSON.stringify(scores);
  } catch {
    return '[]';
  }
}

export async function setLatestScores(data: string): Promise<void> {
  try {
    const parsed = JSON.parse(data);
    await kv.set(SCORES_KEY, parsed);
  } catch {
    console.error('Failed to write scores to KV');
  }
}

const NAME_KEY = 'quest_leaderboard_name_sync';

export async function getLatestName(): Promise<string> {
  try {
    const name = await kv.get(NAME_KEY);
    if (name === null || name === undefined) return '';
    return typeof name === 'string' ? name : String(name);
  } catch {
    return '';
  }
}

export async function setLatestName(name: string): Promise<void> {
  try {
    await kv.set(NAME_KEY, name);
  } catch {
    console.error('Failed to write name to KV');
  }
}
// ─── Game Name ────────────────────────────────────────────

const GAME_NAME_KEY = 'quest_game_name_sync';

export async function getLatestGameName(): Promise<string> {
  try {
    const name = await kv.get(GAME_NAME_KEY);
    if (name === null || name === undefined) return '';
    return typeof name === 'string' ? name : String(name);
  } catch {
    return '';
  }
}

export async function setLatestGameName(name: string): Promise<void> {
  try {
    await kv.set(GAME_NAME_KEY, name);
  } catch {
    console.error('Failed to write game name to KV');
  }
}
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
