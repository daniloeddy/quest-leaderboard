'use client';

import { useMemo } from 'react';

interface Score {
  id: string;
  name: string;
  score: number;
}

/* ── Dynamic sizing helper ─────────────────────────────────────── */
function getScoreSizing(count: number) {
  // Fewer scores = bigger text for far-away visibility
  if (count <= 3) {
    return {
      row: 'px-6 py-5 md:px-10 md:py-7 rounded-2xl',
      rank: 'text-4xl md:text-5xl',
      name: 'text-3xl md:text-4xl',
      score: 'text-3xl md:text-4xl',
      gap: 'gap-4',
    };
  }
  if (count <= 5) {
    return {
      row: 'px-5 py-4 md:px-8 md:py-5 rounded-xl',
      rank: 'text-3xl md:text-4xl',
      name: 'text-2xl md:text-3xl',
      score: 'text-2xl md:text-3xl',
      gap: 'gap-3',
    };
  }
  if (count <= 7) {
    return {
      row: 'px-4 py-3 md:px-6 md:py-4 rounded-xl',
      rank: 'text-2xl md:text-3xl',
      name: 'text-xl md:text-2xl',
      score: 'text-xl md:text-2xl',
      gap: 'gap-2.5',
    };
  }
  // 8-10 scores: original compact sizing
  return {
    row: 'px-4 py-3 md:px-6 md:py-4 rounded-xl',
    rank: 'text-xl md:text-2xl',
    name: 'text-lg md:text-xl',
    score: 'text-lg md:text-xl',
    gap: 'gap-2',
  };
}

/* ── Medal/rank display ────────────────────────────────────────── */
function getRankDisplay(rank: number) {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return `#${rank}`;
}

/* ── Empty State ───────────────────────────────────────────────── */
function EmptyState({ leaderboardName, heroText, heroImage }: {
  leaderboardName: string;
  heroText: string;
  heroImage: string;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-8">
      {heroImage ? (
        <img
          src={heroImage}
          alt="Hero"
          className="mb-8 max-h-[200px] w-auto max-w-[80%] object-contain"
        />
      ) : heroText ? (
        <p className="mb-8 text-center text-3xl font-bold text-white/80 md:text-4xl"
           style={{ fontFamily: "'Outfit', sans-serif" }}>
          {heroText}
        </p>
      ) : null}

      <div className="kiosk-controller-float text-8xl mb-6">🎮</div>

      <h2
        className="kiosk-header-glow text-center text-4xl font-extrabold tracking-tight text-white md:text-5xl"
        style={{ fontFamily: "'Outfit', sans-serif" }}>
        READY TO PLAY
      </h2>
      <p className="mt-4 text-lg text-white/40">Scores will appear here</p>
    </div>
  );
}

/* ── Ranked State (multiple scores) ────────────────────────────── */
function RankedState({ scores, highlightIds, heroText, heroImage }: {
  scores: Score[];
  highlightIds: Set<string>;
  heroText: string;
  heroImage: string;
}) {
  const sizing = getScoreSizing(scores.length);

  return (
    <div className="flex w-full flex-1 flex-col px-4 py-2 md:px-8">
      {/* Hero Area: image OR custom text (replaces the old duplicate event name) */}
      {heroImage ? (
        <div className="mb-4 flex justify-center md:mb-6">
          <img
            src={heroImage}
            alt="Hero"
            className="max-h-[120px] w-auto max-w-[70%] object-contain md:max-h-[160px]"
          />
        </div>
      ) : heroText ? (
        <h2
          className="kiosk-header-glow mb-4 text-center text-2xl font-extrabold tracking-tight text-white md:mb-6 md:text-3xl"
          style={{ fontFamily: "'Outfit', sans-serif" }}>
          {heroText}
        </h2>
      ) : (
        <div className="mb-4 md:mb-6" /> /* Small spacer if no hero content */
      )}

      {/* Score Rows - dynamically sized */}
      <div className={`flex flex-1 flex-col justify-center ${sizing.gap}`}>
        {scores.map((score, index) => {
          const rank = index + 1;
          const isTopThree = rank <= 3;
          const isHighlighted = highlightIds.has(score.id);
          const entranceClass = isTopThree ? 'kiosk-row-enter-podium' : 'kiosk-row-enter';

          return (
            <div
              key={score.id}
              className={`flex items-center ${sizing.row} transition-all ${entranceClass} ${isHighlighted ? 'kiosk-golden-glow' : ''}`}
              style={{
                '--row-delay': `${index * 80}ms`,
                background: isTopThree
                  ? 'rgba(255, 215, 0, 0.08)'
                  : 'rgba(255, 255, 255, 0.03)',
                border: isTopThree
                  ? '1px solid rgba(255, 215, 0, 0.2)'
                  : '1px solid rgba(255, 255, 255, 0.05)',
              } as React.CSSProperties}
            >
              {/* Rank */}
              <span className={`${sizing.rank} font-bold w-16 md:w-20 text-center`}
                    style={{ color: isTopThree ? '#FFD700' : 'rgba(255,255,255,0.5)' }}>
                {getRankDisplay(rank)}
              </span>

              {/* Player Name */}
              <span className={`${sizing.name} flex-1 font-semibold text-white truncate`}
                    style={{ fontFamily: "'Outfit', sans-serif" }}>
                {score.name}
              </span>

              {/* Score */}
              <span className={`${sizing.score} font-black tabular-nums`}
                    style={{ color: isTopThree ? '#FFD700' : '#0081FB' }}>
                {score.score.toLocaleString()}
              </span>
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
  leaderboardName,
  heroText = '',
  heroImage = '',
}: {
  scores: Score[];
  highlightIds?: Set<string>;
  leaderboardName: string;
  heroText?: string;
  heroImage?: string;
}) {
  if (scores.length === 0) {
    return <EmptyState leaderboardName={leaderboardName} heroText={heroText} heroImage={heroImage} />;
  }

  return <RankedState scores={scores} highlightIds={highlightIds} heroText={heroText} heroImage={heroImage} />;
}
