import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import {
  setTheme,
  toggleTheme as toggleThemeAction,
  Theme,
  syncWithSystemPreference
} from '../store/slices/themeSlice';
import { applyTheme, ThemeMode } from '../theme/themeConfig';

export const useTheme = () => {
  const dispatch = useDispatch();
  const { theme } = useSelector((state: RootState) => state.theme);

  // Apply theme class and CSS variables on component mount and when theme changes
  useEffect(() => {
    // Apply CSS variables and class from our theme configuration
    applyTheme(theme as ThemeMode);

    // Update localStorage
    localStorage.setItem('theme', theme);

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#202124' : '#f8f9fa');
    }
  }, [theme]);

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    // Define the handler function
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      // Only automatically update if user hasn't explicitly set a preference
      if (!localStorage.getItem('theme')) {
        dispatch(syncWithSystemPreference());
      }
    };

    // Add event listener
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemThemeChange);
    } else {
      // For older browsers
      mediaQuery.addListener(handleSystemThemeChange);
    }

    // Cleanup function
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleSystemThemeChange);
      } else {
        // For older browsers
        mediaQuery.removeListener(handleSystemThemeChange);
      }
    };
  }, [dispatch]);

  const changeTheme = (newTheme: Theme) => {
    dispatch(setTheme(newTheme));
  };

  const switchTheme = () => {
    dispatch(toggleThemeAction());
  };

  const followSystemPreference = () => {
    dispatch(syncWithSystemPreference());
    localStorage.removeItem('theme'); // Remove explicit preference to follow system
  };

  return {
    theme,
    isDarkMode: theme === 'dark',
    changeTheme,
    toggleTheme: switchTheme,
    followSystemPreference
  };
};
