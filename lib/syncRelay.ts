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
