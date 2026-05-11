'use client';

import {useEffect} from 'react';
import type {Score} from '../hooks/useScores';

interface PrintCertificatesProps {
  scores: Score[];
  eventName: string;
  gameName: string;
  onClose: () => void;
}

const MEDAL_CONFIG = [
  {
    label: '1st Place',
    emoji: '🥇',
    color: '#FFD700',
    colorLight: 'rgba(255, 215, 0, 0.08)',
    borderColor: 'rgba(255, 215, 0, 0.4)',
  },
  {
    label: '2nd Place',
    emoji: '🥈',
    color: '#C0C0C0',
    colorLight: 'rgba(192, 192, 192, 0.08)',
    borderColor: 'rgba(192, 192, 192, 0.4)',
  },
  {
    label: '3rd Place',
    emoji: '🥉',
    color: '#CD7F32',
    colorLight: 'rgba(205, 127, 50, 0.08)',
    borderColor: 'rgba(205, 127, 50, 0.4)',
  },
];

function Certificate({
  score,
  rank,
  eventName,
  gameName,
}: {
  score: Score;
  rank: number;
  eventName: string;
  gameName: string;
}) {
  const medal = MEDAL_CONFIG[rank - 1];

  return (
    <div
      className="certificate-page"
      style={{
        width: '11in',
        height: '8.5in',
        background: `linear-gradient(135deg, #0d1b2a, #1a2332, #0d1b2a)`,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Outfit', sans-serif",
        overflow: 'hidden',
        pageBreakAfter: 'always',
        boxSizing: 'border-box',
      }}>
      {/* Decorative corner borders */}
      <div
        style={{
          position: 'absolute',
          inset: '24px',
          border: `2px solid ${medal.borderColor}`,
          borderRadius: '16px',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: '32px',
          border: `1px solid ${medal.borderColor}`,
          borderRadius: '12px',
          opacity: 0.4,
          pointerEvents: 'none',
        }}
      />

      {/* Top decorative line */}
      <div
        style={{
          width: '120px',
          height: '4px',
          background: medal.color,
          borderRadius: '2px',
          marginBottom: '32px',
        }}
      />

      {/* Certificate of Achievement */}
      <p
        style={{
          fontSize: '14px',
          fontWeight: 600,
          letterSpacing: '6px',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.35)',
          marginBottom: '8px',
        }}>
        Certificate of Achievement
      </p>

      {/* Event Name */}
      <h2
        style={{
          fontSize: '20px',
          fontWeight: 700,
          color: '#0081FB',
          marginBottom: '40px',
          textAlign: 'center',
          maxWidth: '8in',
        }}>
        {eventName}
      </h2>

      {/* Medal Emoji */}
      <div style={{fontSize: '72px', marginBottom: '16px'}}>{medal.emoji}</div>

      {/* Placement */}
      <p
        style={{
          fontSize: '18px',
          fontWeight: 700,
          letterSpacing: '4px',
          textTransform: 'uppercase',
          color: medal.color,
          marginBottom: '32px',
        }}>
        {medal.label}
      </p>

      {/* Presented To */}
      <p
        style={{
          fontSize: '13px',
          fontWeight: 500,
          color: 'rgba(255,255,255,0.3)',
          marginBottom: '12px',
          letterSpacing: '3px',
          textTransform: 'uppercase',
        }}>
        Presented to
      </p>

      {/* Player Name */}
      <h1
        style={{
          fontSize: '52px',
          fontWeight: 900,
          color: '#FFFFFF',
          marginBottom: '16px',
          textAlign: 'center',
          maxWidth: '9in',
          lineHeight: 1.1,
        }}>
        {score.name}
      </h1>

      {/* Score */}
      <div
        style={{
          fontSize: '28px',
          fontWeight: 800,
          color: medal.color,
          marginBottom: '48px',
          padding: '8px 32px',
          background: medal.colorLight,
          borderRadius: '12px',
          border: `1px solid ${medal.borderColor}`,
        }}>
        {score.score.toLocaleString()} pts
      </div>

      {/* Bottom decorative line */}
      <div
        style={{
          width: '80px',
          height: '3px',
          background: medal.color,
          borderRadius: '2px',
          marginBottom: '20px',
        }}
      />

      {/* Game branding */}
      <span
        style={{
          fontSize: '13px',
          fontWeight: 600,
            color: 'rgba(255,255,255,0.25)',
            letterSpacing: '2px',
          }}>
          {gameName.toUpperCase()}
        </span>
    </div>
  );
}

export function PrintCertificates({
  scores,
  eventName,
  gameName,
  onClose,
}: PrintCertificatesProps) {
  const top3 = scores.slice(0, 3);

  useEffect(() => {
    // Small delay to let the DOM render before printing
    const timer = setTimeout(() => {
      window.print();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Listen for after print to close the overlay
  useEffect(() => {
    const handleAfterPrint = () => onClose();
    window.addEventListener('afterprint', handleAfterPrint);
    return () => window.removeEventListener('afterprint', handleAfterPrint);
  }, [onClose]);

  return (
    <div className="print-certificates-overlay">
      {/* Screen-only close button */}
      <div className="print-no-print fixed top-4 right-4 z-50 flex gap-3">
        <button
          onClick={() => window.print()}
          className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white"
          style={{background: '#0081FB'}}>
          Print Now
        </button>
        <button
          onClick={onClose}
          className="rounded-lg border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm">
          Cancel
        </button>
      </div>

      {/* Screen-only header */}
      <div className="print-no-print px-6 pt-16 pb-4 text-center">
        <p className="text-sm text-white/40">
          Preview — {top3.length} certificate{top3.length !== 1 ? 's' : ''}{' '}
          ready to print
        </p>
      </div>

      {/* Certificates */}
      <div className="print-certificates-container flex flex-col items-center gap-8 pb-8">
        {top3.map((score, index) => (
          <Certificate
            key={score.id}
            score={score}
            rank={index + 1}
            eventName={eventName}
            gameName={gameName}
          />
        ))}
      </div>
    </div>
  );
}