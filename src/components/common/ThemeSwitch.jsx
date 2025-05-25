import React from 'react';
import { Button } from 'antd';
import { BulbOutlined, BulbFilled, MoonFilled, SunOutlined, SunFilled } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from 'store/slices/themeSlice';

const ThemeSwitch = () => {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme.theme);
  const isDarkMode = theme === 'dark';

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

  return (
    <Button
      type="text"
      icon={
        isDarkMode ? (
          <MoonFilled className="text-secondary" />
        ) : (
          <SunOutlined className="text-secondary" />
        )
      }
      onClick={handleThemeToggle}
      className="theme-switch-btn"
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    />
  );
};

export default ThemeSwitch;
