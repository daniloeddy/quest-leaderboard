'use client';

import {useState, useEffect, useCallback} from 'react';

const NAME_STORAGE_KEY = 'quest_leaderboard_name';
const DEFAULT_NAME = 'Quest High Scores';
const POLL_INTERVAL_MS = 3000;

function loadRawName(): string {
  if (typeof window === 'undefined') return '';
  try {
    return localStorage.getItem(NAME_STORAGE_KEY) ?? '';
  } catch {
    return '';
  }
}

function saveName(name: string): void {
  try {
    const trimmed = name.trim();
    if (!trimmed) {
      localStorage.removeItem(NAME_STORAGE_KEY);
    } else {
      localStorage.setItem(NAME_STORAGE_KEY, trimmed);
    }
  } catch {
    // ignore
  }
}

/** Returns the display name (never empty). */
function displayName(raw: string): string {
  return raw.trim() || DEFAULT_NAME;
}

export function useLeaderboardName() {
  const [raw, setRaw] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setRaw(loadRawName());
    setIsLoaded(true);
  }, []);

  // Poll for cross-tab sync (read-only consumers like kiosk/mode selector)
  useEffect(() => {
    const interval = setInterval(() => {
      const stored = loadRawName();
      if (stored !== raw) {
        setRaw(stored);
      }
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [raw]);

  /** Save the final value — call on blur, not on every keystroke. */
  const saveFinalName = useCallback((value: string) => {
    const trimmed = value.trim();
    setRaw(trimmed);
    saveName(trimmed);
  }, []);

  return {
    /** Display name — always non-empty, safe for rendering. */
    name: displayName(raw),
    isLoaded,
    saveFinalName,
    defaultName: DEFAULT_NAME,
  };
}