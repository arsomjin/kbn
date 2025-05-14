import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Theme types
export type Theme = 'light' | 'dark';

// Types
interface ThemeState {
  theme: Theme;
  darkMode: boolean; // Added darkMode property
}

// Get initial theme from local storage or system preference
const getInitialTheme = (): Theme => {
  const savedTheme = localStorage.getItem('theme') as Theme | null;

  if (savedTheme) {
    return savedTheme;
  }

  // Check system preference
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }

  return 'light';
};

// Initial state
const initialState: ThemeState = {
  theme: getInitialTheme(),
  darkMode: getInitialTheme() === 'dark'
};

// Slice
const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme(state, action: PayloadAction<Theme>) {
      state.theme = action.payload;
      state.darkMode = action.payload === 'dark';
      // Save to local storage
      localStorage.setItem('theme', action.payload);

      // Update document element class for CSS
      if (action.payload === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },
    toggleTheme(state) {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      state.theme = newTheme;
      state.darkMode = newTheme === 'dark';
      // Save to local storage
      localStorage.setItem('theme', newTheme);

      // Update document element class for CSS
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },
    syncWithSystemPreference(state) {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      state.theme = isDark ? 'dark' : 'light';
      state.darkMode = isDark;
    }
  }
});

// Actions
export const { setTheme, toggleTheme, syncWithSystemPreference } = themeSlice.actions;

export default themeSlice.reducer;
