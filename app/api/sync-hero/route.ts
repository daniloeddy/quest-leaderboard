import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

const HERO_KEY = 'quest_hero_content';

export async function GET() {
  try {
    const data = await kv.get<{ heroText?: string; heroImage?: string }>(HERO_KEY);
    return NextResponse.json(data || { heroText: '', heroImage: '' });
  } catch {
    return NextResponse.json({ heroText: '', heroImage: '' });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Merge with existing data (partial updates)
    const existing = (await kv.get<{ heroText?: string; heroImage?: string }>(HERO_KEY)) || {};
    const updated = { ...existing, ...body };
    await kv.set(HERO_KEY, updated);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to sync' }, { status: 500 });
  }
}
