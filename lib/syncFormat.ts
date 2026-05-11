import type {Score} from '../app/hooks/useScores';

/** Compact sync format: shortened keys for clipboard transfer */
export interface CompactScore {
  p: string;
  s: number;
}

/**
 * Serialize full scores to compact JSON for clipboard sync.
 * Example: [{"p":"Alex","s":50000},{"p":"Jordan","s":45000}]
 */
export function scoresToCompact(scores: Score[]): string {
  const compact: CompactScore[] = scores.map(s => ({p: s.name, s: s.score}));
  return JSON.stringify(compact);
}

/**
 * Parse compact JSON back to full Score objects.
 * Generates fresh IDs and timestamps.
 * Returns null if the data is invalid.
 */
export function compactToScores(raw: string): Score[] | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    if (parsed.length === 0) return [];

    const scores: Score[] = [];
    for (const item of parsed) {
      if (
        typeof item !== 'object' ||
        item === null ||
        typeof (item as Record<string, unknown>).p !== 'string' ||
        typeof (item as Record<string, unknown>).s !== 'number'
      ) {
        return null;
      }
      const compact = item as CompactScore;
      if (!compact.p.trim() || compact.s < 0) return null;
      scores.push({
        id: crypto.randomUUID(),
        name: compact.p.trim(),
        score: compact.s,
        createdAt: Date.now(),
      });
    }

    return scores.sort((a, b) => b.score - a.score);
  } catch {
    return null;
  }
}