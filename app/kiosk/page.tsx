'use client';

import {useState, useCallback} from 'react';
import {useScores} from '../hooks/useScores';
import {useLeaderboardName} from '../hooks/useLeaderboardName';
import {useTripleTap} from '../hooks/useTripleTap';
import {useLiveSyncSubscriber} from '../hooks/useLiveSync';
import {KioskDisplay} from '../components/KioskDisplay';
import {PasteScoresOverlay} from '../components/PasteScoresOverlay';

const KIOSK_TOP_N = 10;

export default function KioskPage() {
  const {scores, isLoaded, highlightIds, replaceAllScores} = useScores();
  const {name: leaderboardName} = useLeaderboardName();
  const [showPasteOverlay, setShowPasteOverlay] = useState(false);
  const [kioskLiveSyncOn, setKioskLiveSyncOn] = useState(true);

  const kioskSyncStatus = useLiveSyncSubscriber(
    replaceAllScores,
    kioskLiveSyncOn,
  );

  // Triple-tap bottom-left corner → show paste overlay
  const handleTripleTap = useCallback(() => {
    setShowPasteOverlay(true);
  }, []);

  const onPointerDown = useTripleTap(handleTripleTap);

  if (!isLoaded) {
    return (
      <div
        className="flex items-center justify-center"
        style={{
          height: '100dvh',
          background: 'linear-gradient(180deg, #1a2332 0%, #0d1b2a 100%)',
        }}>
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white"
          role="status"
          aria-label="Loading"
        />
      </div>
    );
  }

  const kioskScores = scores.slice(0, KIOSK_TOP_N);

  return (
    <div
      className="kiosk-view relative flex flex-col"
      style={{
        background: 'linear-gradient(180deg, #1a2332 0%, #0d1b2a 100%)',
        fontFamily: "'Outfit', sans-serif",
      }}
      onPointerDown={onPointerDown}>
      <link
        href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap"
        rel="stylesheet"
      />

      {/* Header */}
      <header className="flex-shrink-0 px-6 pt-8 pb-4 text-center md:pt-12 md:pb-6">
        <div className="mb-2 flex items-center justify-center gap-3">
          <h1
            className="text-2xl font-extrabold tracking-tight text-white md:text-3xl"
            style={{fontFamily: "'Outfit', sans-serif"}}>
            {leaderboardName.toUpperCase()}
          </h1>
        </div>
        <div
          className="mx-auto h-1 w-20 rounded-full md:w-24"
          style={{background: '#0081FB'}}
        />
      </header>

      {/* Main Content */}
      <main className="flex flex-1 flex-col">
        <KioskDisplay scores={kioskScores} highlightIds={highlightIds} leaderboardName={leaderboardName} />
      </main>

      {/* Footer */}
      <footer className="flex-shrink-0 py-4 text-center">
        <p className="text-xs text-white/20">{leaderboardName}</p>
      </footer>

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
            opacity: 0.4,
            fontFamily: "'Outfit', sans-serif",
          }}>
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
        style={{opacity: 0.15, fontFamily: "'Outfit', sans-serif"}}>
        v1.0
      </span>

      {/* Paste Scores Overlay — triggered by triple-tap */}
      {showPasteOverlay && (
        <PasteScoresOverlay
          onLoadScores={replaceAllScores}
          onClose={() => setShowPasteOverlay(false)}
          liveSyncStatus={kioskSyncStatus}
          liveSyncEnabled={kioskLiveSyncOn}
          onToggleLiveSync={() => setKioskLiveSyncOn(prev => !prev)}
        />
      )}
    </div>
  );
}
