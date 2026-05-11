'use client';

import {useState, useEffect, useCallback, useRef} from 'react';

export interface Score {
  id: string;
  name: string;
  score: number;
  createdAt: number;
}

const STORAGE_KEY = 'quest_scores';
const HIGHLIGHT_DURATION_MS = 2500;
const POLL_INTERVAL_MS = 5000;

function loadScores(): Score[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (item): item is Score =>
          typeof item === 'object' &&
          item !== null &&
          typeof (item as Record<string, unknown>).id === 'string' &&
          typeof (item as Record<string, unknown>).name === 'string' &&
          typeof (item as Record<string, unknown>).score === 'number' &&
          typeof (item as Record<string, unknown>).createdAt === 'number',
      )
      .sort((a, b) => b.score - a.score);
  } catch {
    return [];
  }
}

function saveScores(scores: Score[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
  } catch {
    // localStorage may be full or unavailable
  }
}

export function useScores() {
  const [scores, setScores] = useState<Score[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [highlightIds, setHighlightIds] = useState<Set<string>>(new Set());
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  useEffect(() => {
    setScores(loadScores());
    setIsLoaded(true);
  }, []);

  // Cleanup timers on unmount
  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach(t => clearTimeout(t));
    };
  }, []);

  // Poll localStorage every 5s for cross-tab sync.
  // Compares the raw JSON string to avoid unnecessary re-renders.
  useEffect(() => {
    const interval = setInterval(() => {
      const raw = localStorage.getItem(STORAGE_KEY) ?? '[]';
      const current = JSON.stringify(scores);
      if (raw !== current) {
        setScores(loadScores());
      }
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [scores]);

  const scheduleHighlightClear = useCallback((id: string) => {
    const timer = setTimeout(() => {
      setHighlightIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      timersRef.current.delete(id);
    }, HIGHLIGHT_DURATION_MS);
    timersRef.current.set(id, timer);
  }, []);

  const addScore = useCallback(
    (name: string, score: number) => {
      const newId = crypto.randomUUID();
      setScores(prev => {
        const newScore: Score = {
          id: newId,
          name: name.trim(),
          score,
          createdAt: Date.now(),
        };
        const updated = [...prev, newScore].sort((a, b) => b.score - a.score);
        saveScores(updated);
        return updated;
      });
      setHighlightIds(prev => new Set(prev).add(newId));
      scheduleHighlightClear(newId);
    },
    [scheduleHighlightClear],
  );

  const editScore = useCallback(
    (id: string, name: string, score: number) => {
      setScores(prev => {
        const updated = prev
          .map(s => (s.id === id ? {...s, name: name.trim(), score} : s))
          .sort((a, b) => b.score - a.score);
        saveScores(updated);
        return updated;
      });
    },
    [],
  );

  const removeScore = useCallback((id: string) => {
    setScores(prev => {
      const updated = prev.filter(s => s.id !== id);
      saveScores(updated);
      return updated;
    });
  }, []);

  const clearAllScores = useCallback(() => {
    setScores([]);
    saveScores([]);
    setHighlightIds(new Set());
    timersRef.current.forEach(t => clearTimeout(t));
    timersRef.current.clear();
  }, []);

  const replaceAllScores = useCallback((newScores: Score[]) => {
    const sorted = [...newScores].sort((a, b) => b.score - a.score);
    setScores(sorted);
    saveScores(sorted);
  }, []);

  return {
    scores,
    isLoaded,
    highlightIds,
    addScore,
    editScore,
    removeScore,
    clearAllScores,
    replaceAllScores,
  };
}