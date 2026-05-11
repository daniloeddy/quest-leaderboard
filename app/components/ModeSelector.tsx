'use client';

import Link from 'next/link';
import {useLeaderboardName} from '../hooks/useLeaderboardName';

export function ModeSelector() {
  const {name} = useLeaderboardName();

  return (
    <div
      className="flex flex-col items-center justify-center px-6"
      style={{
        height: '100dvh',
        background: 'linear-gradient(180deg, #1a2332 0%, #0d1b2a 100%)',
        fontFamily: "'Outfit', sans-serif",
      }}>
      {/* Logo area */}
      <div className="mb-4 flex items-center gap-3">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-2xl text-2xl font-black text-white"
          style={{background: '#0081FB'}}>
          Q
        </div>
      </div>

      {/* Heading with glow */}
      <h1 className="kiosk-header-glow mb-3 text-center text-4xl font-extrabold tracking-tight text-white md:text-5xl">
        {name}
      </h1>

      <p className="mb-12 text-center text-base text-white/40">
        Select a mode for this device
      </p>

      {/* Mode buttons */}
      <div className="flex flex-col gap-4">
        <Link
          href="/kiosk"
          className="mode-selector-btn flex h-[80px] w-[300px] items-center justify-center gap-3 rounded-xl border-2 text-lg font-bold text-white transition-transform"
          style={{borderColor: '#0081FB'}}>
          <span className="text-2xl">🖥️</span>
          Launch Kiosk Display
        </Link>

        <Link
          href="/admin"
          className="mode-selector-btn flex h-[80px] w-[300px] items-center justify-center gap-3 rounded-xl border-2 text-lg font-bold text-white transition-transform"
          style={{background: '#0081FB', borderColor: '#0081FB'}}>
          <span className="text-2xl">⚙️</span>
          Open Admin Panel
        </Link>
      </div>
    </div>
  );
}