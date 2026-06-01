// app/components/ThemeSelector.tsx
'use client';

import { getThemeList } from '@/lib/themes';
import { Theme } from '@/lib/themes';

interface ThemeSelectorProps {
  currentThemeId: string;
  onThemeChange: (themeId: string) => void;
  theme: Theme;
}

export default function ThemeSelector({ currentThemeId, onThemeChange, theme }: ThemeSelectorProps) {
  const themeList = getThemeList();

  return (
    <div className="mb-6">
      <label
        className="block text-sm font-medium mb-2"
        style={{ color: theme.textSecondary }}
      >
        Theme
      </label>
      <div className="flex gap-2">
        {themeList.map((t) => (
          <button
            key={t.id}
            onClick={() => onThemeChange(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              currentThemeId === t.id
                ? 'ring-2 ring-offset-2 ring-offset-black'
                : 'opacity-70 hover:opacity-100'
            }`}
            style={{
              backgroundColor: currentThemeId === t.id ? theme.accent : theme.cardBg,
              color: theme.textPrimary,
              borderColor: theme.cardBorder,
              border: `1px solid ${theme.cardBorder}`,
            }}
          >
            {t.name}
          </button>
        ))}
      </div>
    </div>
  );
}
