import { useState, useEffect, useCallback, useMemo } from 'react';

const localTheme = localStorage.getItem('theme');

const useDarkSide = () => {
  const [colorTheme, setColorTheme] = useState(localStorage.getItem('theme'));

  const handleThemeChange = useCallback(async (nTheme) => {
    if (
      nTheme === 'dark' ||
      (!nTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      document.documentElement.classList.add('dark');
      setColorTheme('dark');
    } else {
      document.documentElement.classList.remove('dark');
      setColorTheme('light');
    }
  }, []);

  useEffect(() => {
    localTheme && handleThemeChange(localTheme);
  }, [handleThemeChange]);

  return useMemo(
    () => ({ colorTheme, setTheme: handleThemeChange }),
    [colorTheme, handleThemeChange],
  );
};

export default useDarkSide;
