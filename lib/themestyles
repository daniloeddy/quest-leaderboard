// lib/themeStyles.ts
// Helper to generate inline styles from theme for KioskDisplay
import { Theme } from './themes';

export function getKioskStyles(theme: Theme) {
  return {
    container: {
      background: theme.backgroundGradient || theme.background,
      color: theme.textPrimary,
      minHeight: '100vh',
      padding: '3%', // Per Oakley Meta layout guidelines (3% margin)
    },
    header: {
      fontFamily: theme.fontHeadline,
      textTransform: theme.headlineCase as any,
      letterSpacing: theme.headlineLetterSpacing,
      lineHeight: theme.headlineLineHeight,
      color: theme.textPrimary,
    },
    gameName: {
      fontFamily: theme.fontSubhead,
      letterSpacing: theme.subheadLetterSpacing,
      lineHeight: theme.subheadLineHeight,
      color: theme.textSecondary,
    },
    scoreRow: (rank: number) => ({
      fontFamily: theme.fontBody,
      letterSpacing: theme.bodyLetterSpacing,
      lineHeight: theme.bodyLineHeight,
      backgroundColor: theme.cardBg,
      borderColor: rank <= 3 ? getRankColor(theme, rank) : theme.cardBorder,
      borderWidth: rank <= 3 ? '2px' : '1px',
      borderStyle: 'solid',
      borderRadius: '8px',
      padding: '12px 16px',
    }),
    playerName: {
      fontFamily: theme.fontBody,
      fontWeight: 500,
      letterSpacing: theme.bodyLetterSpacing,
      color: theme.textPrimary,
    },
    scoreValue: {
      fontFamily: theme.fontScore,
      fontWeight: 800,
      color: theme.textPrimary,
    },
    rankBadge: (rank: number) => ({
      color: rank <= 3 ? getRankColor(theme, rank) : theme.textSecondary,
      fontFamily: theme.fontBody,
      fontWeight: 500,
    }),
    divider: {
      borderColor: theme.divider,
    },
  };
}

function getRankColor(theme: Theme, rank: number): string {
  switch (rank) {
    case 1: return theme.rank1Color;
    case 2: return theme.rank2Color;
    case 3: return theme.rank3Color;
    default: return theme.textSecondary;
  }
}
