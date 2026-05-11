'use client';

import {useState, type FormEvent} from 'react';
import Link from 'next/link';
import type {Score} from '../hooks/useScores';
import type {SyncStatus} from '../hooks/useLiveSync';
import {scoresToCompact} from '../../lib/syncFormat';
import {PrintCertificates} from './PrintCertificates';

const NAME_STORAGE_KEY = 'quest_leaderboard_name';
const GAME_NAME_STORAGE_KEY = 'quest_game_name';
const DEFAULT_NAME = 'Quest High Scores';
const DEFAULT_GAME_NAME = 'Quest High Scores';

/**
 * Self-contained name editor — manages its own state and localStorage.
 * Completely isolated from parent re-renders and polling hooks.
 */
function LeaderboardNameEditor() {
  const [value, setValue] = useState(() => {
    if (typeof window === 'undefined') return '';
    try {
      return localStorage.getItem(NAME_STORAGE_KEY) ?? '';
    } catch {
      return '';
    }
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    const trimmed = value.trim();
    try {
      if (trimmed) {
        localStorage.setItem(NAME_STORAGE_KEY, trimmed);
      } else {
        localStorage.removeItem(NAME_STORAGE_KEY);
      }
    } catch {
      // ignore
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div
      className="rounded-xl border border-white/5 p-4"
      style={{background: 'rgba(255,255,255,0.02)'}}>
      <label
        htmlFor="leaderboard-name"
        className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/40">
        Event / Leaderboard Title
      </label>
      <div className="flex gap-2">
        <input
          id="leaderboard-name"
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder="Quest High Scores"
          maxLength={60}
          className="h-12 flex-1 rounded-lg border border-white/10 bg-white/5 px-4 text-lg font-bold text-white placeholder-white/20 outline-none transition-colors focus:border-[#0081FB] focus:ring-1 focus:ring-[#0081FB]"
        />
        <button
          onClick={handleSave}
          className="h-12 flex-shrink-0 rounded-lg px-5 text-sm font-semibold text-white transition-all hover:brightness-110"
          style={{background: saved ? '#22c55e' : '#0081FB'}}>
          {saved ? '✓ Saved' : 'Save'}
        </button>
      </div>
      <p className="mt-1.5 text-xs text-white/20">
        Shown on the kiosk display, mode selector, and certificate header
      </p>
    </div>
  );
}

/**
 * Self-contained game name editor — same pattern as LeaderboardNameEditor.
 */
function GameNameEditor() {
  const [value, setValue] = useState(() => {
    if (typeof window === 'undefined') return '';
    try {
      return localStorage.getItem(GAME_NAME_STORAGE_KEY) ?? '';
    } catch {
      return '';
    }
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    const trimmed = value.trim();
    try {
      if (trimmed) {
        localStorage.setItem(GAME_NAME_STORAGE_KEY, trimmed);
      } else {
        localStorage.removeItem(GAME_NAME_STORAGE_KEY);
      }
    } catch {
      // ignore
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div
      className="rounded-xl border border-white/5 p-4"
      style={{background: 'rgba(255,255,255,0.02)'}}>
      <label
        htmlFor="game-name"
        className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/40">
        Game Name
      </label>
      <div className="flex gap-2">
        <input
          id="game-name"
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder="Quest High Scores"
          maxLength={60}
          className="h-12 flex-1 rounded-lg border border-white/10 bg-white/5 px-4 text-base font-semibold text-white placeholder-white/20 outline-none transition-colors focus:border-[#0081FB] focus:ring-1 focus:ring-[#0081FB]"
        />
        <button
          onClick={handleSave}
          className="h-12 flex-shrink-0 rounded-lg px-5 text-sm font-semibold text-white transition-all hover:brightness-110"
          style={{background: saved ? '#22c55e' : '#0081FB'}}>
          {saved ? '✓ Saved' : 'Save'}
        </button>
      </div>
      <p className="mt-1.5 text-xs text-white/20">
        Shown at the bottom of printed certificates (e.g. &quot;Beat Saber&quot;, &quot;Superhot VR&quot;)
      </p>
    </div>
  );
}

interface AdminPanelProps {
  scores: Score[];
  onAddScore: (name: string, score: number) => void;
  onEditScore: (id: string, name: string, score: number) => void;
  onRemoveScore: (id: string) => void;
  onClearAll: () => void;
  onClose: string;
  onSwitchMode?: string;
  liveSyncEnabled: boolean;
  liveSyncStatus: SyncStatus;
  onToggleLiveSync: () => void;
}

function AddScoreForm({
  onAddScore,
}: {
  onAddScore: (name: string, score: number) => void;
}) {
  const [name, setName] = useState('');
  const [scoreValue, setScoreValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    const parsed = parseInt(scoreValue, 10);
    if (!trimmed || isNaN(parsed) || parsed < 0) return;
    onAddScore(trimmed, parsed);
    setName('');
    setScoreValue('');
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex h-12 items-center gap-2 rounded-xl px-6 text-base font-semibold text-white transition-all hover:brightness-110 active:scale-[0.97]"
        style={{background: '#0081FB'}}>
        <span className="text-lg">+</span>
        Add Score
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-white/10 p-5"
      style={{background: 'rgba(255,255,255,0.03)'}}>
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/40">
        New Score
      </h3>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label
            htmlFor="player-name"
            className="mb-1.5 block text-xs font-medium text-white/50">
            Player Name
          </label>
          <input
            id="player-name"
            type="text"
            placeholder="Enter player name"
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={20}
            autoFocus
            className="h-12 w-full rounded-lg border border-white/10 bg-white/5 px-4 text-base text-white placeholder-white/30 outline-none transition-colors focus:border-[#0081FB] focus:ring-1 focus:ring-[#0081FB]"
          />
        </div>
        <div className="w-full sm:w-36">
          <label
            htmlFor="player-score"
            className="mb-1.5 block text-xs font-medium text-white/50">
            Score
          </label>
          <input
            id="player-score"
            type="number"
            placeholder="0"
            value={scoreValue}
            onChange={e => setScoreValue(e.target.value)}
            min={0}
            className="h-12 w-full rounded-lg border border-white/10 bg-white/5 px-4 text-base text-white placeholder-white/30 outline-none transition-colors focus:border-[#0081FB] focus:ring-1 focus:ring-[#0081FB] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
        </div>
        <div className="flex gap-2 sm:flex-shrink-0">
          <button
            type="submit"
            disabled={!name.trim() || !scoreValue}
            className="h-12 flex-1 rounded-lg px-6 text-base font-semibold text-white transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-30 sm:flex-none"
            style={{background: '#0081FB'}}>
            Submit
          </button>
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              setName('');
              setScoreValue('');
            }}
            className="h-12 flex-1 rounded-lg border border-white/10 px-4 text-base font-semibold text-white/60 transition-colors hover:bg-white/5 hover:text-white sm:flex-none">
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}

function ScoreRow({
  score,
  rank,
  onEdit,
  onRemove,
}: {
  score: Score;
  rank: number;
  onEdit: (id: string, name: string, score: number) => void;
  onRemove: (id: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(score.name);
  const [editScore, setEditScore] = useState(String(score.score));
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleSave = () => {
    const trimmed = editName.trim();
    const parsed = parseInt(editScore, 10);
    if (!trimmed || isNaN(parsed) || parsed < 0) return;
    onEdit(score.id, trimmed, parsed);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditName(score.name);
    setEditScore(String(score.score));
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    onRemove(score.id);
  };

  const isEven = rank % 2 === 0;

  if (isEditing) {
    return (
      <tr
        style={{
          background: isEven ? 'rgba(255,255,255,0.03)' : 'transparent',
        }}>
        <td className="px-4 py-3 text-center text-sm font-bold text-white/40 md:px-6">
          {rank}
        </td>
        <td className="px-4 py-2 md:px-6">
          <input
            type="text"
            value={editName}
            onChange={e => setEditName(e.target.value)}
            maxLength={20}
            autoFocus
            className="h-10 w-full rounded-lg border border-[#0081FB] bg-white/5 px-3 text-sm text-white outline-none focus:ring-1 focus:ring-[#0081FB]"
          />
        </td>
        <td className="px-4 py-2 md:px-6">
          <input
            type="number"
            value={editScore}
            onChange={e => setEditScore(e.target.value)}
            min={0}
            className="h-10 w-28 rounded-lg border border-[#0081FB] bg-white/5 px-3 text-sm text-white outline-none focus:ring-1 focus:ring-[#0081FB] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
        </td>
        <td className="px-4 py-2 md:px-6">
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex h-10 items-center rounded-lg px-4 text-sm font-semibold text-white transition-all hover:brightness-110"
              style={{background: '#0081FB'}}>
              Save
            </button>
            <button
              onClick={handleCancelEdit}
              className="flex h-10 items-center rounded-lg border border-white/10 px-4 text-sm font-semibold text-white/60 transition-colors hover:bg-white/5 hover:text-white">
              Cancel
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr
      style={{
        background: isEven ? 'rgba(255,255,255,0.03)' : 'transparent',
      }}>
      <td className="px-4 py-3 text-center text-sm font-bold text-white/40 md:px-6 md:py-4">
        {rank}
      </td>
      <td className="px-4 py-3 text-sm font-medium text-white md:px-6 md:py-4 md:text-base">
        <span className="block max-w-[200px] truncate sm:max-w-none">
          {score.name}
        </span>
      </td>
      <td className="px-4 py-3 text-sm font-bold tabular-nums text-white/80 md:px-6 md:py-4 md:text-base">
        {score.score.toLocaleString()}
      </td>
      <td className="px-4 py-3 md:px-6 md:py-4">
        <div className="flex gap-1">
          {/* Edit Button */}
          <button
            onClick={() => setIsEditing(true)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/10 hover:text-white"
            aria-label={`Edit ${score.name}`}
            title="Edit">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <path
                d="M11.5 1.5L14.5 4.5L5 14H2V11L11.5 1.5Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9.5 3.5L12.5 6.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
          {/* Delete Button */}
          <button
            onClick={handleDelete}
            onBlur={() => setConfirmDelete(false)}
            className="flex h-10 items-center justify-center rounded-lg px-2 text-sm font-semibold transition-colors"
            style={{
              color: confirmDelete ? '#FFFFFF' : '#E74C3C',
              background: confirmDelete ? '#E74C3C' : 'transparent',
              minWidth: confirmDelete ? '5rem' : '2.5rem',
            }}
            aria-label={
              confirmDelete ? `Confirm delete ${score.name}` : `Delete ${score.name}`
            }
            title={confirmDelete ? 'Click again to confirm' : 'Delete'}>
            {confirmDelete ? (
              'Confirm'
            ) : (
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M2 4H14M5 4V2.5C5 2.22386 5.22386 2 5.5 2H10.5C10.7761 2 11 2.22386 11 2.5V4M6.5 7V11.5M9.5 7V11.5M3.5 4L4.5 13.5C4.5 13.7761 4.72386 14 5 14H11C11.2761 14 11.5 13.7761 11.5 13.5L12.5 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
        </div>
      </td>
    </tr>
  );
}

function SyncToKiosk({
  scores,
  liveSyncEnabled,
  liveSyncStatus,
  onToggleLiveSync,
}: {
  scores: Score[];
  liveSyncEnabled: boolean;
  liveSyncStatus: SyncStatus;
  onToggleLiveSync: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const compactJson = scoresToCompact(scores);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(compactJson);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard API failed — user can manually select from the textbox
    }
  };

  const syncStatusLabel = (() => {
    switch (liveSyncStatus) {
      case 'connected':
        return '🟢 Live sync active — kiosk updates automatically';
      case 'connecting':
        return '🟡 Connecting...';
      case 'error':
        return '🔴 Sync error — retrying...';
      default:
        return '';
    }
  })();

  const serverUrl =
    typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <div
      className="mt-8 rounded-xl border border-white/5 p-5"
      style={{background: 'rgba(255,255,255,0.02)'}}>
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-white/40">
        <span>📡</span> Sync to Kiosk
      </h3>

      {/* Live Sync Toggle */}
      <div className="mb-5 rounded-lg border border-white/5 p-4"
        style={{background: 'rgba(255,255,255,0.02)'}}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-white">Live Sync</p>
            <p className="mt-0.5 text-xs text-white/30">
              Auto-push score changes to connected kiosks
            </p>
          </div>
          <button
            onClick={onToggleLiveSync}
            className="flex h-10 items-center rounded-lg px-4 text-sm font-semibold text-white transition-all"
            style={{
              background: liveSyncEnabled ? '#22c55e' : '#0081FB',
            }}>
            {liveSyncEnabled ? '● Enabled' : 'Start Live Sync'}
          </button>
        </div>
        {liveSyncEnabled && (
          <div className="mt-3 space-y-2">
            <p className="text-xs text-white/50">
              {syncStatusLabel}
            </p>
            <p className="text-xs text-white/25">
              Kiosk connect URL:{' '}
              <span className="font-mono text-white/40">{serverUrl}</span>
            </p>
          </div>
        )}
      </div>

      {/* Manual Copy Fallback */}
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/25">
        Manual copy/paste
      </p>
      <p className="mb-3 text-xs text-white/30">
        If live sync isn&apos;t available, copy this data and paste it on your
        kiosk device.
      </p>
      <button
        onClick={handleCopy}
        className="mb-3 flex h-10 items-center gap-2 rounded-lg px-5 text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-[0.97]"
        style={{
          background: copied ? '#22c55e' : '#0081FB',
        }}>
        {copied ? (
          <>
            <span>✓</span> Copied!
          </>
        ) : (
          <>
            <span>📋</span> Copy Scores for Kiosk
          </>
        )}
      </button>
      <textarea
        readOnly
        value={compactJson}
        rows={2}
        className="w-full resize-none rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-xs font-mono text-white/50 outline-none"
        onFocus={e => e.target.select()}
      />
    </div>
  );
}

export function AdminPanel({
  scores,
  onAddScore,
  onEditScore,
  onRemoveScore,
  onClearAll,
  onClose,
  onSwitchMode,
  liveSyncEnabled,
  liveSyncStatus,
  onToggleLiveSync,
}: AdminPanelProps) {
  const [clearStep, setClearStep] = useState<0 | 1 | 2>(0);
  const [showPrintCerts, setShowPrintCerts] = useState(false);

  const handleClearAll = () => {
    if (clearStep === 0) {
      setClearStep(1);
      return;
    }
    if (clearStep === 1) {
      setClearStep(2);
      return;
    }
    onClearAll();
    setClearStep(0);
  };

  const clearButtonLabel = (() => {
    switch (clearStep) {
      case 0:
        return 'Clear All Scores';
      case 1:
        return 'Are you sure?';
      case 2:
        return 'Really delete all?';
    }
  })();

  return (
    <div
      className="flex min-h-screen flex-col"
      style={{
        background: 'linear-gradient(180deg, #1a2332 0%, #0d1b2a 100%)',
        fontFamily: "'Outfit', sans-serif",
      }}>
      {/* Admin Header Bar */}
      <header
        className="flex-shrink-0 border-b border-white/10"
        style={{background: 'rgba(0, 129, 251, 0.08)'}}>
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-white">
              Admin Panel
            </h1>
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs font-medium text-white/40">
              {scores.length} {scores.length === 1 ? 'score' : 'scores'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {onSwitchMode && (
              <Link
                href={onSwitchMode}
                className="flex h-11 items-center gap-1.5 rounded-xl px-4 text-sm font-medium text-white/40 transition-colors hover:bg-white/5 hover:text-white/70">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M1 4L5 1V3H10C11.6569 3 13 4.34315 13 6V6M13 10L9 13V11H4C2.34315 11 1 9.65685 1 8V8"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Switch Mode
              </Link>
            )}
            <Link
              href={onClose}
            className="flex h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 text-sm font-semibold text-white transition-colors hover:bg-white/10">
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 7H2M2 7L6 3M2 7L6 11"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Back to Kiosk
          </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 md:px-6">
        {/* Leaderboard Name & Game Name */}
        <div className="mb-6 flex flex-col gap-4">
          <LeaderboardNameEditor />
          <GameNameEditor />
        </div>

        {/* Top Actions */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-wrap gap-3">
            <AddScoreForm onAddScore={onAddScore} />
            {scores.length >= 2 && (
              <button
                onClick={() => setShowPrintCerts(true)}
                className="flex h-12 items-center gap-2 rounded-xl border-2 px-6 text-base font-semibold text-white transition-all hover:bg-white/5 active:scale-[0.97]"
                style={{borderColor: '#0081FB'}}>
                <span>🏆</span>
                Print Certificates
              </button>
            )}
          </div>
          {scores.length > 0 && (
            <button
              onClick={handleClearAll}
              onBlur={() => setClearStep(0)}
              className="flex h-12 items-center rounded-xl border px-5 text-sm font-semibold transition-all active:scale-[0.97]"
              style={{
                color: clearStep > 0 ? '#FFFFFF' : '#E74C3C',
                background: clearStep > 0 ? '#E74C3C' : 'transparent',
                borderColor:
                  clearStep > 0 ? '#E74C3C' : 'rgba(231, 76, 60, 0.25)',
              }}>
              {clearButtonLabel}
            </button>
          )}
        </div>

        {/* Scores Table */}
        {scores.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-white/5 py-20"
            style={{background: 'rgba(255,255,255,0.02)'}}>
            <div className="mb-4 text-5xl">🎮</div>
            <p className="text-lg font-semibold text-white/40">No scores yet</p>
            <p className="mt-1 text-sm text-white/20">
              Add a score to get started
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-white/5"
            style={{background: 'rgba(255,255,255,0.02)'}}>
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="w-16 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-white/30 md:px-6">
                    Rank
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/30 md:px-6">
                    Player Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/30 md:px-6">
                    Score
                  </th>
                  <th className="w-32 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/30 md:px-6">
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
                    onEdit={onEditScore}
                    onRemove={onRemoveScore}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {scores.length > 10 && (
          <p className="mt-4 text-center text-sm text-white/30">
            Only the top 10 scores are displayed on the kiosk
          </p>
        )}

        {/* Sync to Kiosk */}
        <SyncToKiosk
          scores={scores}
          liveSyncEnabled={liveSyncEnabled}
          liveSyncStatus={liveSyncStatus}
          onToggleLiveSync={onToggleLiveSync}
        />
      </main>

      {/* Print Certificates Overlay */}
      {showPrintCerts && (
        <PrintCertificates
          scores={scores}
          eventName={
            (() => {
              try {
                return localStorage.getItem(NAME_STORAGE_KEY)?.trim() || DEFAULT_NAME;
              } catch {
                return DEFAULT_NAME;
              }
            })()
          }
          gameName={
            (() => {
              try {
                return localStorage.getItem(GAME_NAME_STORAGE_KEY)?.trim() || DEFAULT_GAME_NAME;
              } catch {
                return DEFAULT_GAME_NAME;
              }
            })()
          }
          onClose={() => setShowPrintCerts(false)}
        />
      )}
    </div>
  );
}