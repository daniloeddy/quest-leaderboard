// app/api/sync-theme/route.ts
import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

const THEME_KEY = 'quest_theme_sync';

export async function GET() {
  try {
    const themeId = await kv.get<string>(THEME_KEY);
    return NextResponse.json({ themeId: themeId || 'meta-quest' });
  } catch (error) {
    return NextResponse.json({ themeId: 'meta-quest' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { themeId } = await request.json();
    if (!themeId) {
      return NextResponse.json({ error: 'themeId required' }, { status: 400 });
    }
    await kv.set(THEME_KEY, themeId);
    return NextResponse.json({ success: true, themeId });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save theme' }, { status: 500 });
  }
}
