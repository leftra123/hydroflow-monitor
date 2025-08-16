/**
 * 🎨 Professional Theme Management Hook
 * 
 * Robust theme system for 24/7 monitoring operations
 * Supports system preference detection and manual override
 */

import { useState, useEffect, useCallback } from 'react';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  systemTheme: 'light' | 'dark';
}

const STORAGE_KEY = 'hydroflow-theme';
const THEME_ATTRIBUTE = 'data-theme';

// Detect system theme preference
const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

// Get stored theme preference
const getStoredTheme = (): Theme => {
  if (typeof window === 'undefined') return 'system';
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && ['light', 'dark', 'system'].includes(stored)) {
      return stored as Theme;
    }
  } catch (error) {
    console.warn('Failed to read theme from localStorage:', error);
  }
  return 'system';
};

// Apply theme to document
const applyTheme = (resolvedTheme: 'light' | 'dark') => {
  if (typeof document === 'undefined') return;

  console.log(`🎨 Aplicando tema: ${resolvedTheme}`);

  const root = document.documentElement;
  const body = document.body;

  // Remove existing theme classes
  root.classList.remove('light', 'dark');
  body.classList.remove('light', 'dark');

  // Add new theme class (only add 'dark' class for dark theme, light is default)
  if (resolvedTheme === 'dark') {
    root.classList.add('dark');
    body.classList.add('dark');
  }

  // Set data attribute for CSS selectors
  root.setAttribute(THEME_ATTRIBUTE, resolvedTheme);

  // Update meta theme-color for mobile browsers
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', resolvedTheme === 'dark' ? '#0f172a' : '#ffffff');
  }

  // Force re-render of all components by adding a class that triggers CSS transitions
  body.classList.add('theme-transition');
  setTimeout(() => {
    body.classList.remove('theme-transition');
  }, 300);

  // Dispatch custom event for other components
  window.dispatchEvent(new CustomEvent('theme-changed', {
    detail: { theme: resolvedTheme }
  }));

  console.log(`✅ Tema aplicado: ${resolvedTheme}, HTML classes:`, root.className);
};

// Store theme preference
const storeTheme = (theme: Theme) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch (error) {
    console.warn('Failed to store theme in localStorage:', error);
  }
};

export const useTheme = () => {
  const [themeState, setThemeState] = useState<ThemeState>(() => {
    const systemTheme = getSystemTheme();
    const storedTheme = getStoredTheme();
    const resolvedTheme = storedTheme === 'system' ? systemTheme : storedTheme;
    
    return {
      theme: storedTheme,
      resolvedTheme,
      systemTheme
    };
  });

  // Resolve theme based on preference and system
  const resolveTheme = useCallback((theme: Theme, systemTheme: 'light' | 'dark'): 'light' | 'dark' => {
    return theme === 'system' ? systemTheme : theme;
  }, []);

  // Set theme preference
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(prevState => {
      const resolvedTheme = resolveTheme(newTheme, prevState.systemTheme);
      
      // Apply theme immediately
      applyTheme(resolvedTheme);
      
      // Store preference
      storeTheme(newTheme);
      
      return {
        ...prevState,
        theme: newTheme,
        resolvedTheme
      };
    });
  }, [resolveTheme]);

  // Toggle through all three theme options: light → dark → system → light
  const toggleTheme = useCallback(() => {
    const currentTheme = themeState.theme;
    let nextTheme: Theme;

    if (currentTheme === 'light') {
      nextTheme = 'dark';
    } else if (currentTheme === 'dark') {
      nextTheme = 'system';
    } else {
      nextTheme = 'light';
    }

    console.log(`🎨 Cambiando tema: ${currentTheme} → ${nextTheme}`);
    setTheme(nextTheme);
  }, [themeState.theme, setTheme]);

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      const newSystemTheme = e.matches ? 'dark' : 'light';
      
      setThemeState(prevState => {
        const resolvedTheme = resolveTheme(prevState.theme, newSystemTheme);
        
        // Only apply if theme is set to 'system'
        if (prevState.theme === 'system') {
          applyTheme(resolvedTheme);
        }
        
        return {
          ...prevState,
          systemTheme: newSystemTheme,
          resolvedTheme
        };
      });
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemThemeChange);
      return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
    } 
    // Legacy browsers
    else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleSystemThemeChange);
      return () => mediaQuery.removeListener(handleSystemThemeChange);
    }
  }, [resolveTheme]);

  // Apply theme on mount and when resolved theme changes
  useEffect(() => {
    applyTheme(themeState.resolvedTheme);
  }, [themeState.resolvedTheme]);

  // Handle storage events (theme changed in another tab)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        const newTheme = e.newValue as Theme;
        if (['light', 'dark', 'system'].includes(newTheme)) {
          setTheme(newTheme);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [setTheme]);

  // Simple theme utilities
  const themeUtils = {
    isDark: themeState.resolvedTheme === 'dark',
    isLight: themeState.resolvedTheme === 'light',
    isSystem: themeState.theme === 'system',
    systemPrefersDark: themeState.systemTheme === 'dark'
  };

  return {
    theme: themeState.theme,
    resolvedTheme: themeState.resolvedTheme,
    systemTheme: themeState.systemTheme,
    setTheme,
    toggleTheme,
    ...themeUtils
  };
};

// Initialize theme on app startup
export const initializeTheme = () => {
  if (typeof document === 'undefined') return;

  const systemTheme = getSystemTheme();
  const storedTheme = getStoredTheme();
  const resolvedTheme = storedTheme === 'system' ? systemTheme : storedTheme;

  applyTheme(resolvedTheme);
};
