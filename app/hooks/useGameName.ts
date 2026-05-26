'use client';

import { useState, useEffect, useCallback } from 'react';

const GAME_NAME_STORAGE_KEY = 'quest_game_name';
const DEFAULT_GAME_NAME = 'Quest High Scores';
const POLL_INTERVAL_MS = 3000;

function loadRawGameName(): string {
  if (typeof window === 'undefined') return '';
  try {
    return localStorage.getItem(GAME_NAME_STORAGE_KEY) ?? '';
  } catch {
    return '';
  }
}

function saveGameName(name: string): void {
  try {
    const trimmed = name.trim();
    if (!trimmed) {
      localStorage.removeItem(GAME_NAME_STORAGE_KEY);
    } else {
      localStorage.setItem(GAME_NAME_STORAGE_KEY, trimmed);
    }
  } catch {}
}

function displayGameName(raw: string): string {
  return raw.trim() || DEFAULT_GAME_NAME;
}

export function useGameName() {
  const [raw, setRaw] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setRaw(loadRawGameName());
    setIsLoaded(true);
  }, []);

  // Poll localStorage (same-browser) + server (cross-device)
  useEffect(() => {
    const interval = setInterval(async () => {
      const stored = loadRawGameName();
      if (stored !== raw) {
        setRaw(stored);
        return;
      }

      try {
        const res = await fetch('/api/sync-game-name', { cache: 'no-store' });
        if (res.ok) {
          const serverName = await res.text();
          if (serverName !== raw) {
            setRaw(serverName);
            saveGameName(serverName);
          }
        }
      } catch {}
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [raw]);

  return {
    name: displayGameName(raw),
    isLoaded,
    defaultName: DEFAULT_GAME_NAME,
  };
}
