import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

export const ADMIN_THEME_STORAGE_KEY = 'saydalety_admin_theme';

const ThemeContext = createContext({
  theme: 'light',
  isDark: false,
  toggleTheme: () => {},
  setTheme: () => {},
});

const resolveInitialTheme = () => {
  if (typeof window === 'undefined') return 'light';
  try {
    const stored = localStorage.getItem(ADMIN_THEME_STORAGE_KEY);
    if (stored === 'dark' || stored === 'light') {
      return stored;
    }
  } catch {
    // Ignore storage errors
  }
  return 'light';
};

const applyDocumentTheme = (nextTheme) => {
  if (typeof document === 'undefined') return;
  const isDark = nextTheme === 'dark';
  const root = document.documentElement;
  root.classList.toggle('dark', isDark);
  root.setAttribute('data-theme', nextTheme);
  root.style.colorScheme = isDark ? 'dark' : 'light';
};

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(resolveInitialTheme);

  const setTheme = useCallback((next) => {
    setThemeState((prev) => {
      const resolved = typeof next === 'function' ? next(prev) : next;
      const valid = resolved === 'dark' ? 'dark' : 'light';
      try {
        localStorage.setItem(ADMIN_THEME_STORAGE_KEY, valid);
      } catch {
        // Ignore storage errors
      }
      applyDocumentTheme(valid);
      return valid;
    });
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, [setTheme]);

  useEffect(() => {
    applyDocumentTheme(theme);
  }, [theme]);

  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === ADMIN_THEME_STORAGE_KEY && (e.newValue === 'dark' || e.newValue === 'light')) {
        setThemeState(e.newValue);
        applyDocumentTheme(e.newValue);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark: theme === 'dark',
        toggleTheme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
