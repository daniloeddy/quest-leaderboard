import { kv } from '@vercel/kv';

const SCORES_KEY = 'quest_leaderboard_scores';

export async function getLatestScores(): Promise<string> {
  try {
    const scores = await kv.get(SCORES_KEY);
    if (scores === null || scores === undefined) return '[]';
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
