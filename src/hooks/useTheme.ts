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
  
  const root = document.documentElement;
  const body = document.body;
  
  // Remove existing theme classes
  root.classList.remove('light', 'dark');
  body.classList.remove('light', 'dark');
  
  // Add new theme class
  root.classList.add(resolvedTheme);
  body.classList.add(resolvedTheme);
  
  // Set data attribute for CSS selectors
  root.setAttribute(THEME_ATTRIBUTE, resolvedTheme);
  
  // Update meta theme-color for mobile browsers
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', resolvedTheme === 'dark' ? '#0f172a' : '#ffffff');
  }
  
  // Dispatch custom event for other components
  window.dispatchEvent(new CustomEvent('theme-changed', { 
    detail: { theme: resolvedTheme } 
  }));
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

  // Toggle between light and dark (skips system)
  const toggleTheme = useCallback(() => {
    setTheme(themeState.resolvedTheme === 'light' ? 'dark' : 'light');
  }, [themeState.resolvedTheme, setTheme]);

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

  // Provide theme utilities
  const themeUtils = {
    isDark: themeState.resolvedTheme === 'dark',
    isLight: themeState.resolvedTheme === 'light',
    isSystem: themeState.theme === 'system',
    systemPrefersDark: themeState.systemTheme === 'dark',
    
    // CSS custom properties for dynamic theming
    getCSSVariables: () => ({
      '--theme-background': themeState.resolvedTheme === 'dark' ? '#0f172a' : '#ffffff',
      '--theme-foreground': themeState.resolvedTheme === 'dark' ? '#f8fafc' : '#0f172a',
      '--theme-primary': themeState.resolvedTheme === 'dark' ? '#3b82f6' : '#1e40af',
      '--theme-secondary': themeState.resolvedTheme === 'dark' ? '#64748b' : '#475569',
      '--theme-accent': themeState.resolvedTheme === 'dark' ? '#10b981' : '#059669',
      '--theme-muted': themeState.resolvedTheme === 'dark' ? '#1e293b' : '#f1f5f9',
      '--theme-border': themeState.resolvedTheme === 'dark' ? '#334155' : '#e2e8f0',
    }),
    
    // Chart colors that adapt to theme
    getChartColors: () => ({
      background: themeState.resolvedTheme === 'dark' ? '#0f172a' : '#ffffff',
      text: themeState.resolvedTheme === 'dark' ? '#f8fafc' : '#0f172a',
      grid: themeState.resolvedTheme === 'dark' ? '#334155' : '#e2e8f0',
      tooltip: themeState.resolvedTheme === 'dark' ? '#1e293b' : '#ffffff',
    })
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

// Hook for components that only need to know the current resolved theme
export const useResolvedTheme = () => {
  const { resolvedTheme } = useTheme();
  return resolvedTheme;
};

// Hook for theme-aware styling
export const useThemeStyles = () => {
  const { resolvedTheme, getCSSVariables, getChartColors } = useTheme();
  
  return {
    resolvedTheme,
    cssVariables: getCSSVariables(),
    chartColors: getChartColors(),
    
    // Common theme-aware class combinations
    cardClass: resolvedTheme === 'dark' 
      ? 'bg-slate-800 border-slate-700 text-slate-100' 
      : 'bg-white border-gray-200 text-gray-900',
    
    inputClass: resolvedTheme === 'dark'
      ? 'bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500',
    
    buttonClass: resolvedTheme === 'dark'
      ? 'bg-blue-600 hover:bg-blue-700 text-white'
      : 'bg-blue-500 hover:bg-blue-600 text-white',
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

// Export for use in main.tsx or App.tsx
export default useTheme;
