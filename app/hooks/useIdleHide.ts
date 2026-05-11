'use client';

import {useState, useEffect, useCallback, useRef} from 'react';

const IDLE_TIMEOUT_MS = 10_000;

/**
 * Returns `true` when the user has been idle (no touch/click/mouse)
 * for IDLE_TIMEOUT_MS. Resets on any interaction.
 */
export function useIdleHide(): boolean {
  const [isIdle, setIsIdle] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetTimer = useCallback(() => {
    setIsIdle(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setIsIdle(true), IDLE_TIMEOUT_MS);
  }, []);

  useEffect(() => {
    // Start the idle timer immediately
    timerRef.current = setTimeout(() => setIsIdle(true), IDLE_TIMEOUT_MS);

    const events: Array<keyof WindowEventMap> = [
      'pointerdown',
      'pointermove',
      'click',
      'touchstart',
      'keydown',
    ];
    events.forEach(e => window.addEventListener(e, resetTimer, {passive: true}));

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach(e => window.removeEventListener(e, resetTimer));
    };
  }, [resetTimer]);

  return isIdle;
}