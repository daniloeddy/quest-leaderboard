import { kv } from '@vercel/kv';

const SCORES_KEY = 'quest_leaderboard_scores';

export async function getLatestScores(): Promise<string> {
  try {
    const scores = await kv.get<string>(SCORES_KEY);
    return scores ?? '[]';
  } catch {
    return '[]';
  }
}

export async function setLatestScores(data: string): Promise<void> {
  try {
    await kv.set(SCORES_KEY, data);
  } catch {
    console.error('Failed to write scores to KV');
  }
}
