'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useScores } from '../hooks/useScores';
import { useLeaderboardName } from '../hooks/useLeaderboardName';
import { useHeroContent } from '../hooks/useHeroContent';

interface Score {
  id: string;
  name: string;
  score: number;
}

/* ── Helper: Generate unique ID ────────────────────────────────── */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/* ── Game Name Editor ──────────────────────────────────────────── */
function GameNameEditor() {
  const [gameName, setGameName] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('quest_game_name') || '';
    }
    return '';
  });
  const [localValue, setLocalValue] = useState(gameName);

  const save = (val: string) => {
    const trimmed = val.trim();
    setGameName(trimmed);
    localStorage.setItem('quest_game_name', trimmed);
    // Sync to server
    fetch('/api/sync-game-name', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: trimmed }),
    }).catch(() => {});
  };

  return (
    <div className="mb-1">
      <label className="mb-1 block text-xs font-medium text-white/50">
        Game Name
      </label>
      <input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={() => save(localValue)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') save(localValue);
        }}
        maxLength={40}
        placeholder="e.g., Pickleball, Beat Saber"
        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/20 focus:border-[#0081FB] focus:outline-none"
      />
      <p className="mt-1 text-xs text-white/20">
        Shown on printed certificates
      </p>
    </div>
  );
}

/* ── Hero Content Section ──────────────────────────────────────── */
function HeroContentEditor() {
  const { heroText, heroImage, setHeroText, setHeroImage, clearHeroImage } = useHeroContent(true);
  const [localText, setLocalText] = useState(heroText);

  // Sync local state when heroText loads from storage
  const textRef = useRef(heroText);
  if (textRef.current !== heroText && localText === textRef.current) {
    setLocalText(heroText);
    textRef.current = heroText;
  }

  return (
    <div className="rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.02)' }}>
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-white/40">
        <span>🖼️</span> Kiosk Hero Area
      </h3>
      <p className="mb-3 text-xs text-white/30">
        Shows above scores on the kiosk display. Use custom text OR upload an image (image takes priority if both are set).
      </p>

      {/* Hero Text */}
      <div className="mb-4">
        <label className="mb-1 block text-xs font-medium text-white/50">
          Custom Text (shown if no image uploaded)
        </label>
        <input
          type="text"
          value={localText}
          onChange={(e) => setLocalText(e.target.value)}
          onBlur={() => setHeroText(localText.trim())}
          onKeyDown={(e) => {
            if (e.key === 'Enter') setHeroText(localText.trim());
          }}
          maxLength={80}
          placeholder="e.g., Beat the High Score! 🏓"
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/20 focus:border-[#0081FB] focus:outline-none"
        />
      </div>

      {/* Hero Image Upload */}
      <div>
        <label className="mb-1 block text-xs font-medium text-white/50">
          Hero Image
        </label>
        <p className="mb-2 text-xs text-white/20">
          Best: 1200×400px PNG with transparent background. Max 500KB.
        </p>

        {heroImage ? (
          <div className="relative rounded-lg border border-white/10 bg-black/30 p-4">
            <img
              src={heroImage}
              alt="Hero preview"
              className="mx-auto max-h-[100px] w-auto object-contain"
            />
            <button
              onClick={clearHeroImage}
              className="absolute right-2 top-2 rounded-full bg-red-500/80 px-2 py-0.5 text-xs font-bold text-white hover:bg-red-500"
            >
              ✕ Remove
            </button>
          </div>
        ) : (
          <label className="flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-white/10 py-6 text-sm text-white/30 transition hover:border-[#0081FB]/50 hover:text-white/50">
            <span>📁 Click to upload image</span>
            <input
              type="file"
              accept="image/png,image/webp,image/svg+xml"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                if (file.size > 512000) {
                  alert('Image too large. Please keep it under 500KB.');
                  return;
                }
                const reader = new FileReader();
                reader.onload = () => {
                  if (typeof reader.result === 'string') {
                    setHeroImage(reader.result);
                  }
                };
                reader.readAsDataURL(file);
              }}
            />
          </label>
        )}
      </div>
    </div>
  );
}

/* ── Score Row (view + edit modes) ─────────────────────────────── */
function ScoreRow({
  score,
  rank,
  onEdit,
  onDelete,
}: {
  score: Score;
  rank: number;
  onEdit: (id: string, name: string, value: number) => void;
  onDelete: (id: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(score.name);
  const [editScore, setEditScore] = useState(score.score.toString());
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleSave = () => {
    const trimmedName = editName.trim();
    const numScore = parseInt(editScore, 10);
    if (trimmedName && !isNaN(numScore)) {
      onEdit(score.id, trimmedName, numScore);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditName(score.name);
    setEditScore(score.score.toString());
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <tr className="border-b border-white/5">
        <td className="px-3 py-2 text-center text-sm text-white/40">{rank}</td>
        <td className="px-3 py-2">
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            maxLength={20}
            className="w-full rounded border border-white/20 bg-white/5 px-2 py-1 text-sm text-white focus:border-[#0081FB] focus:outline-none"
            autoFocus
          />
        </td>
        <td className="px-3 py-2">
          <input
            type="number"
            value={editScore}
            onChange={(e) => setEditScore(e.target.value)}
            className="w-24 rounded border border-white/20 bg-white/5 px-2 py-1 text-sm text-white focus:border-[#0081FB] focus:outline-none"
          />
        </td>
        <td className="px-3 py-2 text-center">
          <button
            onClick={handleSave}
            className="mr-2 rounded bg-[#0081FB] px-2 py-1 text-xs font-bold text-white hover:bg-[#0081FB]/80"
          >
            Save
          </button>
          <button
            onClick={handleCancel}
            className="rounded bg-white/10 px-2 py-1 text-xs text-white/60 hover:bg-white/20"
          >
            Cancel
          </button>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-white/5 hover:bg-white/[0.02]">
      <td className="px-3 py-2 text-center text-sm text-white/40">{rank}</td>
      <td className="px-3 py-2 text-sm font-medium text-white">{score.name}</td>
      <td className="px-3 py-2 text-sm tabular-nums text-white/80">
        {score.score.toLocaleString()}
      </td>
      <td className="px-3 py-2 text-center">
        <button
          onClick={() => setIsEditing(true)}
          className="mr-2 text-white/30 hover:text-white"
          title="Edit"
        >
          ✏️
        </button>
        {confirmDelete ? (
          <button
            onClick={() => {
              onDelete(score.id);
              setConfirmDelete(false);
            }}
            className="rounded bg-[#E74C3C] px-2 py-0.5 text-xs font-bold text-white"
          >
            Confirm?
          </button>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="text-white/30 hover:text-[#E74C3C]"
            title="Delete"
          >
            🗑️
          </button>
        )}
      </td>
    </tr>
  );
}

/* ── Add Score Form ────────────────────────────────────────────── */
function AddScoreForm({ onAdd }: { onAdd: (name: string, score: number) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [score, setScore] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const numScore = parseInt(score, 10);
    if (trimmedName && !isNaN(numScore) && numScore >= 0) {
      onAdd(trimmedName, numScore);
      setName('');
      setScore('');
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full rounded-lg border border-dashed border-[#0081FB]/30 py-3 text-sm font-semibold text-[#0081FB] transition hover:border-[#0081FB] hover:bg-[#0081FB]/5"
      >
        + Add Score
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
      <div className="mb-3 flex gap-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={20}
          placeholder="Player name"
          className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/20 focus:border-[#0081FB] focus:outline-none"
          autoFocus
        />
        <input
          type="number"
          value={score}
          onChange={(e) => setScore(e.target.value)}
          min={0}
          placeholder="Score"
          className="w-28 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/20 focus:border-[#0081FB] focus:outline-none"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded-lg bg-[#0081FB] px-4 py-2 text-sm font-bold text-white hover:bg-[#0081FB]/80"
        >
          Add
        </button>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="rounded-lg bg-white/10 px-4 py-2 text-sm text-white/60 hover:bg-white/20"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

/* ── Main Admin Panel ──────────────────────────────────────────── */
export function AdminPanel() {
  const { scores, addScore, editScore, removeScore, clearAllScores } = useScores();
  const { name: leaderboardName, saveFinalName: setLeaderboardName } = useLeaderboardName();
  const [localName, setLocalName] = useState(leaderboardName);
  const [clearStep, setClearStep] = useState(0); // 0=idle, 1=confirm, 2=really

  // Sync local name state with hook
  const nameRef = useRef(leaderboardName);
  if (nameRef.current !== leaderboardName && localName === nameRef.current) {
    setLocalName(leaderboardName);
    nameRef.current = leaderboardName;
  }

  const handleSaveName = () => {
    const trimmed = localName.trim();
    setLeaderboardName(trimmed);
  };

 const handleAddScore = (name: string, value: number) => {
  addScore(name, value);
};

  const handleEditScore = (id: string, name: string, value: number) => {
  editScore(id, name, value);
};

  const handleClearAll = () => {
    if (clearStep === 0) {
      setClearStep(1);
    } else if (clearStep === 1) {
      setClearStep(2);
    } else {
      clearAllScores();
      setClearStep(0);
    }
  };

  // Reset clear confirmation after 5 seconds
  if (clearStep > 0) {
    setTimeout(() => setClearStep(0), 5000);
  }

  return (
    <div
      className="min-h-screen px-4 py-6 md:px-8"
      style={{
        background: 'linear-gradient(180deg, #1a2332 0%, #0d1b2a 100%)',
        fontFamily: "'Outfit', sans-serif",
      }}
    >
      {/* Header */}
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-white">Admin Panel</h1>
          <div className="flex gap-3">
            <Link
              href="/"
              className="rounded-lg bg-white/5 px-3 py-1.5 text-xs text-white/50 hover:bg-white/10 hover:text-white"
            >
              Switch Mode
            </Link>
            <Link
              href="/kiosk"
              className="flex items-center gap-1 rounded-lg bg-[#0081FB]/10 px-3 py-1.5 text-xs text-[#0081FB] hover:bg-[#0081FB]/20"
            >
              ← Back to Kiosk
            </Link>
          </div>
        </div>

        {/* ── Leaderboard Title ─────────────────────────────── */}
        <div className="mb-6 rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-white/40">
            <span>📝</span> Event Settings
          </h3>

          <div className="mb-4">
            <label className="mb-1 block text-xs font-medium text-white/50">
              Event / Leaderboard Name
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={localName}
                onChange={(e) => setLocalName(e.target.value)}
                onBlur={handleSaveName}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveName();
                }}
                maxLength={60}
                placeholder="e.g., MPMS 2026 Pickleball"
                className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/20 focus:border-[#0081FB] focus:outline-none"
              />
              <button
                onClick={handleSaveName}
                className="rounded-lg bg-[#0081FB] px-4 py-2 text-xs font-bold text-white hover:bg-[#0081FB]/80"
              >
                Save
              </button>
            </div>
            <p className="mt-1.5 text-xs text-white/20">
              Shown on the kiosk display header and certificate
            </p>
          </div>

          <GameNameEditor />
        </div>

        {/* ── Hero Content ──────────────────────────────────── */}
        <div className="mb-6">
          <HeroContentEditor />
        </div>

        {/* ── Scores Table ──────────────────────────────────── */}
        <div className="mb-6 rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-white/40">
            <span>🏆</span> Scores ({scores.length})
          </h3>

          {scores.length > 0 ? (
            <div className="mb-4 overflow-x-auto rounded-lg border border-white/5">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02]">
                    <th className="px-3 py-2 text-center text-xs font-semibold uppercase text-white/30 w-12">
                      #
                    </th>
                    <th className="px-3 py-2 text-xs font-semibold uppercase text-white/30">
                      Player Name
                    </th>
                    <th className="px-3 py-2 text-xs font-semibold uppercase text-white/30 w-24">
                      Score
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-semibold uppercase text-white/30 w-24">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {scores.map((score, index) => (
                    <ScoreRow
                      key={score.id}
                      score={score}
                      rank={index + 1}
                      onEdit={handleEditScore}
                      onDelete={removeScore}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mb-4 text-center text-sm text-white/20">
              No scores yet. Add one below.
            </p>
          )}

          <AddScoreForm onAdd={handleAddScore} />

          {scores.length > 0 && (
            <div className="mt-4 border-t border-white/5 pt-4">
              <button
                onClick={handleClearAll}
                className="rounded-lg px-4 py-2 text-sm font-bold transition"
                style={{
                  background: clearStep > 0 ? 'rgba(231, 76, 60, 0.15)' : 'rgba(231, 76, 60, 0.05)',
                  color: '#E74C3C',
                  border: clearStep > 0 ? '1px solid rgba(231, 76, 60, 0.3)' : '1px solid transparent',
                }}
              >
                {clearStep === 0 && '🗑️ Clear All Scores'}
                {clearStep === 1 && '⚠️ Are you sure?'}
                {clearStep === 2 && '🚨 Really delete all?'}
              </button>
              {scores.length > 10 && (
                <p className="mt-2 text-xs text-white/20">
                  Only the top 10 scores are shown on the kiosk display.
                </p>
              )}
            </div>
          )}
        </div>

        {/* ── Footer ───────────────────────────────────────── */}
        <div className="text-center text-xs text-white/15">
          Quest Digital Leaderboard v1.1
        </div>
      </div>
    </div>
  );
}
