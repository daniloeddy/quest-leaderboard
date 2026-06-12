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
};
// Add to your themes config (alongside 'meta-quest' and 'oakley')
export const outdoorTheme = {
  id: 'outdoor',
  name: 'Outdoor (Light)',
  description: 'High-contrast light mode for outdoor/sunlight kiosks',
  fonts: {
    heading: 'Outfit',
    subheading: 'Outfit',
    body: 'Outfit',
    scores: 'Outfit',
  },
  colors: {
    background: '#FFFFFF',
    backgroundGradient: 'linear-gradient(180deg, #FFFFFF 0%, #F0F0F0 100%)',
    text: '#000000',
    textSecondary: '#1A1A1A',
    primary: '#0064E0',       // Meta blue for accents
    accent: '#FF8000',        // Orange for top 3 ranks
    rankTop3: '#FF8000',
    rankDefault: '#333333',
    scoreBg: '#F5F5F5',
    border: '#E0E0E0',
    headerBg: '#FFFFFF',
  },
  fontWeights: {
    heading: 800,      // Extra bold for sun readability
    subheading: 700,
    body: 600,         // Semi-bold minimum outdoors
    scores: 800,
  },
  fontSizes: {
    // Bumped +25% vs standard for outdoor visibility
    eventTitle: '3.5rem',
    gameName: '2rem',
    playerName: '2.2rem',
    score: '2.5rem',
    rank: '2.8rem',
  },
  textTransform: {
    heading: 'uppercase',
    subheading: 'none',
  },
  letterSpacing: {
    heading: '-0.02em',
    body: '0',
  },
};
export const defaultThemeId = 'meta-quest';

export function getTheme(id: string): Theme {
  return themes[id] || themes[defaultThemeId];
}

export function getThemeList(): { id: string; name: string }[] {
  return Object.values(themes).map((t) => ({ id: t.id, name: t.name }));
}
