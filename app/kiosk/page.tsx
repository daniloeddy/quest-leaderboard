'use client';

import { useState } from 'react';
import { useScores } from '../hooks/useScores';
import { useLeaderboardName } from '../hooks/useLeaderboardName';
import { useHeroContent } from '../hooks/useHeroContent';
import { useTripleTap } from '../hooks/useTripleTap';
import { useLiveSyncSubscriber } from '../hooks/useLiveSync';
import { KioskDisplay } from '../components/KioskDisplay';
import { PasteScoresOverlay } from '../components/PasteScoresOverlay';

const KIOSK_TOP_N = 10;

export default function KioskPage() {
  const { scores, isLoaded, highlightIds, replaceAllScores } = useScores();
  const { name: leaderboardName } = useLeaderboardName();
  const { heroText, heroImage } = useHeroContent(false); // false = kiosk/subscriber mode
  const [showPasteOverlay, setShowPasteOverlay] = useState(false);
  const [kioskLiveSyncOn, setKioskLiveSyncOn] = useState(true);

  const kioskSyncStatus = useLiveSyncSubscriber(
    replaceAllScores,
    kioskLiveSyncOn,
  );

  const tripleTapHandler = useTripleTap(() => {
    setShowPasteOverlay(true);
  });

  // Wait for localStorage to load before rendering
  if (!isLoaded) {
    return (
      <div
        className="kiosk-view flex items-center justify-center"
        style={{
          background: 'linear-gradient(180deg, #1a2332 0%, #0d1b2a 100%)',
        }}
      >
        <div className="text-xl text-white/30">Loading...</div>
      </div>
    );
  }

  const kioskScores = scores.slice(0, KIOSK_TOP_N);

  return (
    <div
      className="kiosk-view relative flex flex-col"
      style={{
        background: 'linear-gradient(180deg, #1a2332 0%, #0d1b2a 100%)',
      }}
      {...tripleTapHandler}
    >
      {/* Header — event name (single instance, NOT repeated in KioskDisplay) */}
      <header className="flex-shrink-0 px-6 pt-6 pb-2 md:px-10 md:pt-8">
        <h1
          className="kiosk-header-glow text-center text-3xl font-extrabold tracking-tight text-white md:text-4xl"
          style={{ fontFamily: "'Outfit', sans-serif" }}
        >
          {leaderboardName.toUpperCase()}
        </h1>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 flex-col overflow-hidden">
        <KioskDisplay
          scores={kioskScores}
          highlightIds={highlightIds}
          leaderboardName={leaderboardName}
          heroText={heroText}
          heroImage={heroImage}
        />
      </main>

      {/* Triple-tap zone (invisible, bottom-left corner) */}
      <div className="fixed bottom-0 left-0 h-24 w-24 z-50" />

      {/* Live sync indicator */}
      {kioskLiveSyncOn && (
        <span
          className="fixed bottom-4 right-4 text-xs"
          style={{
            color:
              kioskSyncStatus === 'connected'
                ? '#22c55e'
                : kioskSyncStatus === 'error'
                  ? '#ef4444'
                  : '#eab308',
            fontFamily: "'Outfit', sans-serif",
          }}
        >
          {kioskSyncStatus === 'connected'
            ? '● Live'
            : kioskSyncStatus === 'error'
              ? '● Offline'
              : '● Syncing...'}
        </span>
      )}

      {/* Version badge */}
      <span
        className="fixed bottom-4 left-4 text-xs text-white"
        style={{ opacity: 0.15, fontFamily: "'Outfit', sans-serif" }}
      >
        v1.1
      </span>

      {/* Paste overlay (hidden until triple-tap) */}
      {showPasteOverlay && (
        <PasteScoresOverlay
          onLoadScores={replaceAllScores}
          onClose={() => setShowPasteOverlay(false)}
          liveSyncStatus={kioskSyncStatus}
          liveSyncEnabled={kioskLiveSyncOn}
          onToggleLiveSync={() => setKioskLiveSyncOn((prev) => !prev)}
        />
      )}
    </div>
  );
}
