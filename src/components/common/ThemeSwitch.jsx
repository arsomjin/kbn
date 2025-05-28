import React, { useEffect, useRef } from 'react';
import { Button } from 'antd';
import { BulbOutlined, BulbFilled, MoonFilled, SunOutlined, SunFilled } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from 'store/slices/themeSlice';
import './ThemeSwitch.css';

const ThemeSwitch = () => {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme.theme);
  const isDarkMode = theme === 'dark';
  const buttonRef = useRef(null);
  const prevTheme = useRef(theme);

  // Trigger animation when theme changes
  useEffect(() => {
    if (prevTheme.current !== theme && buttonRef.current) {
      // Add animation class
      buttonRef.current.classList.add('theme-switching');

      // Remove animation class after animation completes
      setTimeout(() => {
        if (buttonRef.current) {
          buttonRef.current.classList.remove('theme-switching');
        }
      }, 600);
    }
    prevTheme.current = theme;
  }, [theme]);

  const handleThemeToggle = () => {
    // Add click ripple effect
    if (buttonRef.current) {
      const ripple = document.createElement('span');
      ripple.classList.add('theme-ripple');
      buttonRef.current.appendChild(ripple);

      // Remove ripple after animation
      setTimeout(() => {
        if (ripple.parentNode) {
          ripple.parentNode.removeChild(ripple);
        }
      }, 500);

      // Add click scale effect
      buttonRef.current.style.transform = 'scale(0.9)';
      setTimeout(() => {
        if (buttonRef.current) {
          buttonRef.current.style.transform = '';
        }
      }, 150);
    }

    dispatch(toggleTheme());
  };

  return (
    <Button
      ref={buttonRef}
      type="text"
      shape="circle"
      icon={
        <div className={`theme-icon-container ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
          <div className="icon-wrapper">
            {isDarkMode ? (
              <MoonFilled className="theme-icon moon-icon" />
            ) : (
              <SunFilled className="theme-icon sun-icon" />
            )}
          </div>
        </div>
      }
      onClick={handleThemeToggle}
      className={`theme-switch-btn ${isDarkMode ? 'dark-theme' : 'light-theme'}`}
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    />
  );
};

export default ThemeSwitch;
