// app/hooks/useTheme.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { getTheme, defaultThemeId, Theme } from '@/lib/themes';

export function useTheme(isKiosk = false) {
  const [themeId, setThemeId] = useState<string>(() => {
    if (typeof window === 'undefined') return defaultThemeId;
    return localStorage.getItem('quest_theme') || defaultThemeId;
  });

  // Save to localStorage + sync to Redis
  const changeTheme = useCallback(async (newThemeId: string) => {
    setThemeId(newThemeId);
    localStorage.setItem('quest_theme', newThemeId);
    // Always push to Redis
    try {
      await fetch('/api/sync-theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ themeId: newThemeId }),
      });
    } catch (e) {
      console.error('Failed to sync theme:', e);
    }
  }, []);

  // Kiosk polls Redis for theme changes
  useEffect(() => {
    if (!isKiosk) return;

    const poll = async () => {
      try {
        const res = await fetch('/api/sync-theme');
        if (res.ok) {
          const data = await res.json();
          if (data.themeId && data.themeId !== themeId) {
            setThemeId(data.themeId);
            localStorage.setItem('quest_theme', data.themeId);
          }
        }
      } catch (e) {
        console.error('Theme poll error:', e);
      }
    };

    poll(); // Initial fetch
    const interval = setInterval(poll, 3000);
    return () => clearInterval(interval);
  }, [isKiosk, themeId]);

  const theme: Theme = getTheme(themeId);

  return { themeId, theme, changeTheme };
}
