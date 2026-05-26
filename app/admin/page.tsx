'use client';

import {useState} from 'react';
import {useScores} from '../hooks/useScores';
import {useLiveSyncPublisher} from '../hooks/useLiveSync';
import {AdminPanel} from '../components/AdminPanel';

export default function AdminPage() {
  const {scores, isLoaded, addScore, editScore, removeScore, clearAllScores} =
    useScores();

  const [liveSyncOn, setLiveSyncOn] = useState(false);
  const syncStatus = useLiveSyncPublisher(scores, liveSyncOn, isLoaded);

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

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap"
        rel="stylesheet"
      />
      <AdminPanel
        scores={scores}
        onAddScore={addScore}
        onEditScore={editScore}
        onRemoveScore={removeScore}
        onClearAll={clearAllScores}
        onClose="/kiosk"
        onSwitchMode="/"
        liveSyncEnabled={liveSyncOn}
        liveSyncStatus={syncStatus}
        onToggleLiveSync={() => setLiveSyncOn(prev => !prev)}
      />
    </>
  );
}
