'use client';

import {useState, useEffect, useRef, useCallback} from 'react';
import type {Score} from '../hooks/useScores';
import type {SyncStatus} from '../hooks/useLiveSync';
import {compactToScores} from '../../lib/syncFormat';

const AUTO_HIDE_MS = 10_000;

type FlashState = null | 'success' | 'error';

interface PasteScoresOverlayProps {
  onLoadScores: (scores: Score[]) => void;
  onClose: () => void;
  liveSyncStatus: SyncStatus;
  liveSyncEnabled: boolean;
  onToggleLiveSync: () => void;
}

export function PasteScoresOverlay({
  onLoadScores,
  onClose,
  liveSyncStatus,
  liveSyncEnabled,
  onToggleLiveSync,
}: PasteScoresOverlayProps) {
  const [pasteValue, setPasteValue] = useState('');
  const [flash, setFlash] = useState<FlashState>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-hide after inactivity (only when live sync is off)
  const resetAutoHide = useCallback(() => {
    if (activityTimerRef.current) clearTimeout(activityTimerRef.current);
    if (!liveSyncEnabled) {
      activityTimerRef.current = setTimeout(onClose, AUTO_HIDE_MS);
    }
  }, [onClose, liveSyncEnabled]);

  useEffect(() => {
    resetAutoHide();
    return () => {
      if (activityTimerRef.current) clearTimeout(activityTimerRef.current);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [resetAutoHide]);

  // Focus textarea on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleLoad = () => {
    resetAutoHide();
    const trimmed = pasteValue.trim();
    if (!trimmed) return;

    const parsed = compactToScores(trimmed);
    if (parsed === null) {
      setFlash('error');
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setFlash(null), 2000);
      return;
    }

    onLoadScores(parsed);
    setFlash('success');
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setFlash(null);
      onClose();
    }, 1500);
  };

  const handleInput = (value: string) => {
    setPasteValue(value);
    resetAutoHide();
  };

  const syncStatusLabel = (() => {
    switch (liveSyncStatus) {
      case 'connected':
        return '🟢 Connected to admin';
      case 'connecting':
        return '🟡 Connecting...';
      case 'error':
        return '🔴 Disconnected — retrying every 10s';
      default:
        return '';
    }
  })();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div
        className="relative flex w-full max-w-lg flex-col gap-4 overflow-y-auto rounded-2xl border border-white/10 p-6 shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, #1e3044, #162636)',
          fontFamily: "'Outfit', sans-serif",
          maxHeight: '90vh',
        }}>
        {/* Header */}
        <div className="flex items-center gap-2">
          <span className="text-xl">📋</span>
          <h2 className="text-lg font-bold text-white">Receive Scores</h2>
        </div>

        {/* Live Sync Section */}
        <div className="rounded-lg border border-white/5 p-4"
          style={{background: 'rgba(255,255,255,0.02)'}}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">
                Live Sync
              </p>
              <p className="mt-0.5 text-xs text-white/30">
                Auto-receive scores from admin device
              </p>
            </div>
            <button
              onClick={onToggleLiveSync}
              className="flex h-10 items-center rounded-lg px-4 text-sm font-semibold text-white transition-all"
              style={{
                background: liveSyncEnabled ? '#22c55e' : '#0081FB',
              }}>
              {liveSyncEnabled ? '● Connected' : 'Connect'}
            </button>
          </div>
          {liveSyncEnabled && (
            <p className="mt-2 text-xs text-white/50">
              {syncStatusLabel}
            </p>
          )}
          {liveSyncStatus === 'error' && (
            <p className="mt-1 text-xs text-white/25">
              Live sync not available on this network. Use copy/paste instead.
            </p>
          )}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-xs text-white/20">or paste manually</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={pasteValue}
          onChange={e => handleInput(e.target.value)}
          placeholder="Paste score data from admin device here"
          rows={4}
          className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-[#0081FB] focus:ring-1 focus:ring-[#0081FB]"
          style={{userSelect: 'text', WebkitUserSelect: 'text'}}
        />

        {/* Flash messages */}
        {flash === 'success' && (
          <div
            className="kiosk-toast-flash flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold"
            style={{
              background: 'rgba(34, 197, 94, 0.15)',
              color: '#22c55e',
            }}>
            <span>✓</span> Scores updated!
          </div>
        )}
        {flash === 'error' && (
          <div
            className="kiosk-toast-flash flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold"
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#ef4444',
            }}>
            <span>✗</span> Invalid data format
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleLoad}
            disabled={!pasteValue.trim() || flash === 'success'}
            className="flex h-12 flex-1 items-center justify-center rounded-xl text-base font-semibold text-white transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-30"
            style={{background: '#0081FB'}}>
            Load Scores
          </button>
          <button
            onClick={onClose}
            className="flex h-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-6 text-base font-semibold text-white/60 transition-colors hover:bg-white/10 hover:text-white">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}