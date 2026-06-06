'use client';
import { useState, useEffect } from 'react';
import { Theme } from '@/types';

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('crimson-noir');

  useEffect(() => {
    const stored = (localStorage.getItem('equinox-theme') as Theme) ?? 'crimson-noir';
    setThemeState(stored);
    applyTheme(stored);
  }, []);

  function applyTheme(t: Theme) {
    const root = document.documentElement;
    root.classList.remove('theme-crimson-noir', 'theme-dark', 'light', 'dark');
    if (t === 'light') {
      root.classList.add('light');
    } else {
      root.classList.add('dark', `theme-${t}`);
    }
  }

  function setTheme(t: Theme) {
    setThemeState(t);
    localStorage.setItem('equinox-theme', t);
    applyTheme(t);
  }

  return { theme, setTheme };
}
