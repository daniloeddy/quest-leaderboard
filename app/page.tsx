'use client';

import {useEffect} from 'react';
import {ModeSelector} from './components/ModeSelector';

export default function Home() {
  // Register service worker on mount
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap"
        rel="stylesheet"
      />
      <ModeSelector />
    </>
  );
}