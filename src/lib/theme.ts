/** Thème visuel, mémorisé sur l'appareil (simple confort : sans stockage, on revient au kawaii). */
import { useCallback, useEffect, useState } from 'react';

export type Theme = 'kawaii' | 'fille' | 'garcon' | 'aquarelle';

/** Ordre du bouton de thème, et ce qu'il affiche. C'est l'enfant qui choisit. */
export const THEMES: Theme[] = ['kawaii', 'fille', 'garcon', 'aquarelle'];
export const THEME_INFO: Record<Theme, { label: string; emoji: string; color: string }> = {
  kawaii: { label: 'Kawaii', emoji: '🌸', color: '#ffe9f3' },
  fille: { label: 'Fille', emoji: '👧', color: '#fde4f2' },
  garcon: { label: 'Garçon', emoji: '👦', color: '#dcedff' },
  aquarelle: { label: 'Aquarelle', emoji: '🍃', color: '#a9d2ee' }
};

export const nextTheme = (t: Theme): Theme => THEMES[(THEMES.indexOf(t) + 1) % THEMES.length];

/** Le fond animé kawaii qui correspond au thème choisi. */
export const kawaiiScene = (t: Theme) => (t === 'fille' ? ('kawaiiFille' as const) : t === 'garcon' ? ('kawaiiGarcon' as const) : ('kawaii' as const));
const KEY = 'pulse_kids_theme';

function readTheme(): Theme {
  try {
    const saved = localStorage.getItem(KEY) as Theme | null;
    return saved && THEMES.includes(saved) ? saved : 'kawaii';
  } catch {
    return 'kawaii';
  }
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(readTheme);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_INFO[theme].color);
  }, [theme]);
  const setTheme = useCallback((t: Theme) => {
    try {
      localStorage.setItem(KEY, t);
    } catch {
      /* navigation privée : le thème reste pour la visite */
    }
    setThemeState(t);
  }, []);
  return { theme, setTheme };
}
