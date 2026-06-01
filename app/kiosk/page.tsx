'use client';

import { useState } from 'react';
import { useScores } from '../hooks/useScores';
import { useLeaderboardName } from '../hooks/useLeaderboardName';
import { useHeroContent } from '../hooks/useHeroContent';
import { useTripleTap } from '../hooks/useTripleTap';
import { useLiveSyncSubscriber } from '../hooks/useLiveSync';
import { useTheme } from '../hooks/useTheme';
import { KioskDisplay } from '../components/KioskDisplay';
import { PasteScoresOverlay } from '../components/PasteScoresOverlay';

const KIOSK_TOP_N = 10;

export default function KioskPage() {
  const { scores, isLoaded, highlightIds, replaceAllScores } = useScores();
  const { name: leaderboardName } = useLeaderboardName();
  const { heroText, heroImage } = useHeroContent(false);
  const { theme } = useTheme(true); // true = kiosk mode (polls Redis for theme changes)
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
          background: theme.backgroundGradient || theme.background,
        }}
      >
        <div className="text-xl" style={{ color: theme.textSecondary }}>Loading...</div>
      </div>
    );
  }

  const kioskScores = scores.slice(0, KIOSK_TOP_N);

  return (
    <div
      className="kiosk-view relative flex flex-col"
      style={{
        background: theme.backgroundGradient || theme.background,
      }}
      {...tripleTapHandler}
    >
      {/* Header — event name */}
      <header className="flex-shrink-0 px-6 pt-6 pb-2 md:px-10 md:pt-8">
        <h1
          className="kiosk-header-glow text-center text-3xl font-extrabold tracking-tight md:text-4xl"
          style={{
            fontFamily: theme.fontHeadline,
            color: theme.textPrimary,
            textTransform: theme.headlineCase,
            letterSpacing: theme.headlineLetterSpacing,
            lineHeight: theme.headlineLineHeight,
          }}
        >
          {leaderboardName}
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
          theme={theme}
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
            fontFamily: theme.fontBody,
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
        className="fixed bottom-4 left-4 text-xs"
        style={{ opacity: 0.15, fontFamily: theme.fontBody, color: theme.textPrimary }}
      >
        v2.0
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
