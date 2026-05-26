'use client';

import { useState, useEffect, useCallback } from 'react';

const HERO_TEXT_KEY = 'quest_hero_text';
const HERO_IMAGE_KEY = 'quest_hero_image';
const POLL_INTERVAL = 3000;

interface HeroContent {
  heroText: string;
  heroImage: string; // base64 data URL or empty
  setHeroText: (text: string) => void;
  setHeroImage: (dataUrl: string) => void;
  clearHeroImage: () => void;
}

export function useHeroContent(isAdmin = false): HeroContent {
  const [heroText, setHeroTextState] = useState('');
  const [heroImage, setHeroImageState] = useState('');

  // Load from localStorage on mount
  useEffect(() => {
    setHeroTextState(localStorage.getItem(HERO_TEXT_KEY) || '');
    setHeroImageState(localStorage.getItem(HERO_IMAGE_KEY) || '');
  }, []);

  // Poll server for cross-device sync (kiosk mode)
  useEffect(() => {
    if (isAdmin) return; // Admin doesn't need to poll

    const poll = async () => {
      try {
        const res = await fetch('/api/sync-hero');
        if (res.ok) {
          const data = await res.json();
          if (data.heroText !== undefined) {
            setHeroTextState(data.heroText);
            localStorage.setItem(HERO_TEXT_KEY, data.heroText);
          }
          if (data.heroImage !== undefined) {
            setHeroImageState(data.heroImage);
            localStorage.setItem(HERO_IMAGE_KEY, data.heroImage);
          }
        }
      } catch {}
    };

    poll(); // Initial fetch
    const interval = setInterval(poll, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [isAdmin]);

  const setHeroText = useCallback((text: string) => {
    setHeroTextState(text);
    localStorage.setItem(HERO_TEXT_KEY, text);
    // Always sync to server
    fetch('/api/sync-hero', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ heroText: text }),
    }).catch(() => {});
  }, []);

  const setHeroImage = useCallback((dataUrl: string) => {
    setHeroImageState(dataUrl);
    localStorage.setItem(HERO_IMAGE_KEY, dataUrl);
    // Sync to server
    fetch('/api/sync-hero', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ heroImage: dataUrl }),
    }).catch(() => {});
  }, []);

  const clearHeroImage = useCallback(() => {
    setHeroImageState('');
    localStorage.removeItem(HERO_IMAGE_KEY);
    fetch('/api/sync-hero', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ heroImage: '' }),
    }).catch(() => {});
  }, []);

  return { heroText, heroImage, setHeroText, setHeroImage, clearHeroImage };
}
