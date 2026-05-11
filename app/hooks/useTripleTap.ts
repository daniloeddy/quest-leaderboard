'use client';

import {useCallback, useRef} from 'react';

const TAP_WINDOW_MS = 800;
const REQUIRED_TAPS = 3;
const CORNER_SIZE = 80; // px from bottom-left corner

/**
 * Returns a click/touch handler to attach to the kiosk container.
 * Fires `onTripleTap` when the user taps the bottom-left corner
 * three times within TAP_WINDOW_MS.
 */
export function useTripleTap(onTripleTap: () => void) {
  const tapsRef = useRef<number[]>([]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      // Only count taps in the bottom-left corner
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const isBottomLeft =
        x <= CORNER_SIZE && y >= rect.height - CORNER_SIZE;

      if (!isBottomLeft) {
        tapsRef.current = [];
        return;
      }

      const now = Date.now();
      tapsRef.current.push(now);

      // Keep only taps within the time window
      tapsRef.current = tapsRef.current.filter(
        t => now - t < TAP_WINDOW_MS,
      );

      if (tapsRef.current.length >= REQUIRED_TAPS) {
        tapsRef.current = [];
        onTripleTap();
      }
    },
    [onTripleTap],
  );

  return handlePointerDown;
}