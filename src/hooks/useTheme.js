import { useDispatch, useSelector } from 'react-redux';
import {
  setTheme,
  toggleTheme as toggleThemeAction,
  syncWithSystemPreference,
} from 'store/slices/themeSlice';

export const useTheme = () => {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme.theme);

  const changeTheme = (newTheme) => {
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
    followSystemPreference,
  };
};
