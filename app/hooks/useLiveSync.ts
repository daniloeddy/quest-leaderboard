'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Score } from './useScores';
import { scoresToCompact, compactToScores } from '../../lib/syncFormat';

export type SyncStatus = 'off' | 'connecting' | 'connected' | 'error';

const POLL_INTERVAL_MS = 2000;
const BROADCAST_CHANNEL_NAME = 'quest_scores_sync';

export function useLiveSyncPublisher(scores: Score[], enabled: boolean, isLoaded: boolean) {
  const [status, setStatus] = useState<SyncStatus>('off');
  const channelRef = useRef<BroadcastChannel | null>(null);
  const prevScoresRef = useRef<string>('');
  const baselineSetRef = useRef(false);

  useEffect(() => {
    if (!enabled) { channelRef.current?.close(); channelRef.current = null; return; }
    try { channelRef.current = new BroadcastChannel(BROADCAST_CHANNEL_NAME); } catch {}
    return () => { channelRef.current?.close(); channelRef.current = null; };
  }, [enabled]);

  useEffect(() => {
    // Wait for scores to load from localStorage before doing anything
    if (!isLoaded) return;

    const compact = scoresToCompact(scores);

    // First run after load — set baseline, DON'T post (avoids pushing stale localStorage to Redis)
    if (!baselineSetRef.current) {
      prevScoresRef.current = compact;
      baselineSetRef.current = true;
      return;
    }

    // BroadcastChannel — only when toggle is on (same-browser instant sync)
    if (enabled) {
      try { channelRef.current?.postMessage(compact); } catch {}
    }

    // Only post to Redis if scores actually changed (user action: add/edit/clear)
    if (compact === prevScoresRef.current) return;
    prevScoresRef.current = compact;

    const controller = new AbortController();
    if (enabled) setStatus('connecting');

    fetch('/api/sync', {
      method: 'POST',
      body: compact,
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
    })
      .then(res => { if (enabled) setStatus(res.ok ? 'connected' : 'error'); })
      .catch(() => { if (enabled) setStatus('error'); });

    return () => controller.abort();
  }, [enabled, scores, isLoaded]);

  useEffect(() => { if (!enabled) setStatus('off'); }, [enabled]);

  return status;
}

export function useLiveSyncSubscriber(
  onScoresReceived: (scores: Score[]) => void,
  enabled: boolean,
) {
  const [status, setStatus] = useState<SyncStatus>('off');
  const callbackRef = useRef(onScoresReceived);
  callbackRef.current = onScoresReceived;
  const lastDataRef = useRef<string>('');

  const handleCompactData = useCallback((compact: string) => {
    if (compact === lastDataRef.current) return;
    lastDataRef.current = compact;
    const parsed = compactToScores(compact);
    if (parsed !== null) callbackRef.current(parsed);
  }, []);

  // BroadcastChannel (instant, same-browser)
  useEffect(() => {
    if (!enabled) return;
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      channel.onmessage = (event: MessageEvent) => {
        if (typeof event.data === 'string') handleCompactData(event.data);
      };
    } catch {}
    return () => { channel?.close(); };
  }, [enabled, handleCompactData]);

  // HTTP polling (cross-device via Redis)
  useEffect(() => {
    if (!enabled) { setStatus('off'); return; }
    let cancelled = false;
    setStatus('connecting');

    const poll = async () => {
      if (cancelled) return;
      try {
        const res = await fetch('/api/sync', { cache: 'no-store' });
        if (!cancelled && res.ok) {
          setStatus('connected');
          const data = await res.text();
          if (data) {
            handleCompactData(data);
          }
        } else if (!cancelled) { setStatus('error'); }
      } catch { if (!cancelled) setStatus('error'); }
    };

    poll();
    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => { cancelled = true; clearInterval(interval); };
  }, [enabled, handleCompactData]);

  return status;
}
