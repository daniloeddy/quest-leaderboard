// lib/themes.ts

// Theme configuration for Quest Leaderboard

export interface Theme {
  id: string;
  name: string;
  // Colors
  background: string;
  backgroundGradient?: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  accentSecondary?: string;
  cardBg: string;
  cardBorder: string;
  divider: string;
  // Typography
  fontHeadline: string;
  fontSubhead: string;
  fontBody: string;
  fontScore: string;
  // Headline styling
  headlineCase: 'uppercase' | 'none';
  headlineLetterSpacing: string;
  headlineLineHeight: string;
  // Subhead styling
  subheadLetterSpacing: string;
  subheadLineHeight: string;
  // Body styling
  bodyLetterSpacing: string;
  bodyLineHeight: string;
  // Top 3 accent
  rank1Color: string;
  rank2Color: string;
  rank3Color: string;
}

export const themes: Record<string, Theme> = {
  'meta-quest': {
    id: 'meta-quest',
    name: 'Meta Quest',
    // Colors
    background: '#0a1628',
    backgroundGradient: 'linear-gradient(135deg, #0a1628 0%, #1a2a4a 50%, #0d2137 100%)',
    textPrimary: '#ffffff',
    textSecondary: '#94a3b8',
    accent: '#0081FB',
    cardBg: 'rgba(255, 255, 255, 0.05)',
    cardBorder: 'rgba(255, 255, 255, 0.1)',
    divider: 'rgba(255, 255, 255, 0.1)',
    // Typography
    fontHeadline: 'var(--font-outfit)',
    fontSubhead: 'var(--font-outfit)',
    fontBody: 'var(--font-outfit)',
    fontScore: 'var(--font-outfit)',
    // Headline styling
    headlineCase: 'none',
    headlineLetterSpacing: '-0.02em',
    headlineLineHeight: '1.1',
    // Subhead styling
    subheadLetterSpacing: '0',
    subheadLineHeight: '1.3',
    // Body styling
    bodyLetterSpacing: '0',
    bodyLineHeight: '1.2',
    // Top 3 accent
    rank1Color: '#FFD700',
    rank2Color: '#C0C0C0',
    rank3Color: '#CD7F32',
  },
  'oakley-meta': {
    id: 'oakley-meta',
    name: 'Oakley Meta',
    // Colors
    background: '#000000',
    backgroundGradient: undefined,
    textPrimary: '#ffffff',
    textSecondary: '#acc1c7',
    accent: '#FF8000',
    accentSecondary: '#0064E0',
    cardBg: 'rgba(255, 255, 255, 0.03)',
    cardBorder: 'rgba(172, 193, 199, 0.2)',
    divider: 'rgba(172, 193, 199, 0.15)',
    // Typography
    fontHeadline: 'var(--font-avenir-heavy)',
    fontSubhead: 'var(--font-garamond-narrow)',
    fontBody: 'var(--font-avenir-regular)',
    fontScore: 'var(--font-avenir-heavy)',
    // Headline styling (per brand guidelines)
    headlineCase: 'uppercase',
    headlineLetterSpacing: '-0.03em',
    headlineLineHeight: '0.8',
    // Subhead styling
    subheadLetterSpacing: '-0.03em',
    subheadLineHeight: '1.0',
    // Body styling
    bodyLetterSpacing: '0.01em',
    bodyLineHeight: '1.2',
    // Top 3 accent (orange for rank 1-3)
    rank1Color: '#FF8000',
    rank2Color: '#FF8000',
    rank3Color: '#FF8000',
  },
  'outdoor': {
    id: 'outdoor',
    name: '☀️ Outdoor (Light)',
    // Colors
    background: '#FFFFFF',
    backgroundGradient: 'linear-gradient(180deg, #FFFFFF 0%, #F0F0F0 100%)',
    textPrimary: '#000000',
    textSecondary: '#1A1A1A',
    accent: '#0064E0',
    accentSecondary: '#FF8000',
    cardBg: '#F5F5F5',
    cardBorder: '#E0E0E0',
    divider: '#E0E0E0',
    // Typography
    fontHeadline: 'var(--font-outfit)',
    fontSubhead: 'var(--font-outfit)',
    fontBody: 'var(--font-outfit)',
    fontScore: 'var(--font-outfit)',
    // Headline styling
    headlineCase: 'uppercase',
    headlineLetterSpacing: '-0.02em',
    headlineLineHeight: '1.1',
    // Subhead styling
    subheadLetterSpacing: '0',
    subheadLineHeight: '1.2',
    // Body styling
    bodyLetterSpacing: '0',
    bodyLineHeight: '1.3',
    // Top 3 accent (orange pops on white)
    rank1Color: '#FF8000',
    rank2Color: '#FF8000',
    rank3Color: '#FF8000',
  },
};

export const defaultThemeId = 'meta-quest';

export function getTheme(id: string): Theme {
  return themes[id] || themes[defaultThemeId];
}

export function getThemeList(): { id: string; name: string }[] {
  return Object.values(themes).map((t) => ({ id: t.id, name: t.name }));
}
