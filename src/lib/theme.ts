/** Thème visuel, mémorisé sur l'appareil (simple confort : sans stockage, on revient au kawaii). */
import { useCallback, useEffect, useState } from 'react';

export type Theme = 'kawaii' | 'aquarelle';
const KEY = 'pulse_kids_theme';

function readTheme(): Theme {
  try {
    return localStorage.getItem(KEY) === 'aquarelle' ? 'aquarelle' : 'kawaii';
  } catch {
    return 'kawaii';
  }
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(readTheme);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'aquarelle' ? '#a9d2ee' : '#ffe9f3');
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
