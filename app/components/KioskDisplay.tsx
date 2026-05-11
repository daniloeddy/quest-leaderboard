'use client';

import {useEffect, useRef, useState} from 'react';
import type {Score} from '../hooks/useScores';

function formatScore(score: number): string {
  return score.toLocaleString();
}

/* ── Empty State ───────────────────────────────────────────────── */

function EmptyState({leaderboardName}: {leaderboardName: string}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6">
      {/* Hero animation — falls back to pulsing emoji if video not available */}
      <video
        src="/hero-animation.mp4"
        autoPlay
        loop
        muted
        playsInline
        className="mb-8 w-48 md:w-56"
        style={{borderRadius: '16px'}}
        onError={e => {
          // Hide video and show fallback emoji
          const el = e.currentTarget;
          el.style.display = 'none';
          const fallback = el.nextElementSibling as HTMLElement | null;
          if (fallback) fallback.style.display = 'block';
        }}
      />
      <div
        className="kiosk-controller-float mb-8 text-8xl"
        style={{display: 'none'}}
        role="img"
        aria-label="Game controller">
        🎮
      </div>

      <h2
        className="kiosk-header-glow mb-4 text-center text-4xl font-extrabold tracking-tight text-white md:text-5xl"
        style={{fontFamily: "'Outfit', sans-serif"}}>
        {leaderboardName}
      </h2>
      <p className="text-center text-xl text-white/60 md:text-2xl">
        Be the first to set a high score!
      </p>
    </div>
  );
}

/* ── Single Score State ────────────────────────────────────────── */

function SingleScoreState({
  score,
  isHighlighted,
}: {
  score: Score;
  isHighlighted: boolean;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6">
      <div className="mb-6 text-7xl" role="img" aria-label="Star celebration">
        ⭐
      </div>
      <h2
        className="mb-3 text-center text-4xl font-extrabold tracking-tight text-white md:text-5xl"
        style={{fontFamily: "'Outfit', sans-serif"}}>
        {score.name}
      </h2>
      <div
        className={`mb-6 text-center text-6xl font-black md:text-7xl ${isHighlighted ? 'kiosk-golden-glow' : ''}`}
        style={{
          color: '#FFD700',
          fontFamily: "'Outfit', sans-serif",
          borderRadius: '16px',
        }}>
        {formatScore(score.score)}
      </div>
      <p className="text-center text-xl text-white/60 md:text-2xl">
        Can you beat them?
      </p>
    </div>
  );
}

/* ── Rank helpers ──────────────────────────────────────────────── */

function getRankEmoji(rank: number): string {
  switch (rank) {
    case 1:
      return '🥇';
    case 2:
      return '🥈';
    case 3:
      return '🥉';
    default:
      return '';
  }
}

function getRankColor(rank: number): string {
  switch (rank) {
    case 1:
      return '#FFD700';
    case 2:
      return '#C0C0C0';
    case 3:
      return '#CD7F32';
    default:
      return '#FFFFFF';
  }
}

/* ── Leaderboard State ─────────────────────────────────────────── */

function LeaderboardState({
  scores,
  highlightIds,
}: {
  scores: Score[];
  highlightIds: Set<string>;
}) {
  // Track whether this is the initial mount so we play entrance
  // animations on first render but not on re-renders from data changes.
  const hasAnimated = useRef(false);
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    if (!hasAnimated.current) {
      hasAnimated.current = true;
      return;
    }
    // Bump key to replay entrance animations when scores list changes
    setAnimationKey(k => k + 1);
  }, [scores.length]);

  return (
    <div className="flex w-full flex-1 flex-col px-4 py-2 md:px-8">
      <h2
        className="kiosk-header-glow mb-6 text-center text-3xl font-extrabold tracking-tight text-white md:mb-8 md:text-4xl"
        style={{fontFamily: "'Outfit', sans-serif"}}>
        HIGH SCORES
      </h2>
      <div className="flex flex-1 flex-col gap-2 md:gap-3">
        {scores.map((score, index) => {
          const rank = index + 1;
          const isTopThree = rank <= 3;
          const emoji = getRankEmoji(rank);
          const color = getRankColor(rank);
          const isHighlighted = highlightIds.has(score.id);
          const entranceClass = isTopThree
            ? 'kiosk-row-enter-podium'
            : 'kiosk-row-enter';

          return (
            <div
              key={`${score.id}-${animationKey}`}
              className={`flex items-center rounded-xl px-4 py-3 transition-all md:px-6 md:py-4 ${entranceClass} ${isHighlighted ? 'kiosk-golden-glow' : ''}`}
              style={
                {
                  '--row-delay': `${index * 100}ms`,
                  background: isTopThree
                    ? `linear-gradient(135deg, ${color}15, ${color}08)`
                    : 'rgba(255, 255, 255, 0.03)',
                  borderLeft: isTopThree
                    ? `4px solid ${color}`
                    : '4px solid transparent',
                } as React.CSSProperties
              }>
              <div
                className="mr-3 w-10 text-center text-lg font-bold md:mr-4 md:w-12 md:text-xl"
                style={{color}}>
                {emoji || `#${rank}`}
              </div>
              <div
                className="min-w-0 flex-1 truncate text-lg font-semibold text-white md:text-xl"
                style={{fontFamily: "'Outfit', sans-serif"}}>
                {score.name}
              </div>
              <div
                className="ml-3 text-right text-lg font-bold tabular-nums md:text-xl"
                style={{color, fontFamily: "'Outfit', sans-serif"}}>
                {formatScore(score.score)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Main Export ────────────────────────────────────────────────── */

export function KioskDisplay({
  scores,
  highlightIds = new Set(),
  leaderboardName = 'Quest High Scores',
}: {
  scores: Score[];
  highlightIds?: Set<string>;
  leaderboardName?: string;
}) {
  if (scores.length === 0) {
    return <EmptyState leaderboardName={leaderboardName} />;
  }

  if (scores.length === 1) {
    return (
      <SingleScoreState
        score={scores[0]}
        isHighlighted={highlightIds.has(scores[0].id)}
      />
    );
  }

  return <LeaderboardState scores={scores} highlightIds={highlightIds} />;
}