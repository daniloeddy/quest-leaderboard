'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Score } from './useScores';
import { scoresToCompact, compactToScores } from '../../lib/syncFormat';

export type SyncStatus = 'off' | 'connecting' | 'connected' | 'error';

const POLL_INTERVAL_MS = 2000;
const BROADCAST_CHANNEL_NAME = 'quest_scores_sync';

export function useLiveSyncPublisher(scores: Score[], enabled: boolean) {
  const [status, setStatus] = useState<SyncStatus>('off');
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    if (!enabled) { channelRef.current?.close(); channelRef.current = null; return; }
    try { channelRef.current = new BroadcastChannel(BROADCAST_CHANNEL_NAME); } catch {}
    return () => { channelRef.current?.close(); channelRef.current = null; };
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    const compact = scoresToCompact(scores);

    // Always broadcast via BroadcastChannel (same-browser, instant)
    try { channelRef.current?.postMessage(compact); } catch {}

    // POST to server relay (best-effort, unreliable on serverless)
    const controller = new AbortController();
    setStatus('connecting');
    fetch('/api/sync', {
      method: 'POST',
      body: compact,
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
    })
      .then(res => setStatus(res.ok ? 'connected' : 'error'))
      .catch(() => setStatus('error'));

    return () => controller.abort();
  }, [enabled, scores]);

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
  const lastLocalUpdateRef = useRef<number>(0);

  const handleCompactData = useCallback((compact: string, source: 'broadcast' | 'poll') => {
    if (compact === lastDataRef.current) return;
    // If we received data from BroadcastChannel recently (within 5s),
    // ignore stale poll results from the server
    if (source === 'poll' && Date.now() - lastLocalUpdateRef.current < 5000) {
      return;
    }
    lastDataRef.current = compact;
    if (source === 'broadcast') {
      lastLocalUpdateRef.current = Date.now();
    }
    const parsed = compactToScores(compact);
    if (parsed !== null) callbackRef.current(parsed);
  }, []);

  // BroadcastChannel (instant, same-browser) — PRIORITY SOURCE
  useEffect(() => {
    if (!enabled) return;
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      channel.onmessage = (event: MessageEvent) => {
        if (typeof event.data === 'string') handleCompactData(event.data, 'broadcast');
      };
    } catch {}
    return () => { channel?.close(); };
  }, [enabled, handleCompactData]);

  // HTTP polling (cross-device fallback, deprioritized after BroadcastChannel)
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
            handleCompactData(data, 'poll');
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
