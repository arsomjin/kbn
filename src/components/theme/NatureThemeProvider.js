import React from 'react';
import { ConfigProvider } from 'antd';
import PropTypes from 'prop-types';

/**
 * Nature-Inspired Theme Provider for KBN Application
 * Provides unified earthy tones and modern flat design across all Ant Design components
 * Compatible with older versions of Ant Design using CSS-based theming
 */

// Nature-inspired color palette
const NATURE_COLORS = {
  // Primary Colors - Medium Forest Greens
  primary: '#3f8b18', // Medium Forest Green (between #2d5016 and #52c41a)
  primaryLight: '#52c41a', // Mint Green (was #73d13d)
  primaryLighter: '#73d13d', // Leaf Green (was #95de64)

  // Secondary Colors - Fresh Greens
  secondary: '#52c41a', // Mint Green
  secondaryLight: '#73d13d', // Leaf Green
  secondaryLighter: '#95de64', // Spring Green

  // Earthy Browns
  earth: '#8b4513', // Dark Earth
  earthLight: '#a0522d', // Wood Brown
  earthLighter: '#cd853f', // Clay Brown

  // Natural Grays
  gray: '#6b7280', // Stone Gray
  grayLight: '#9ca3af', // Pebble Gray
  grayLighter: '#d1d5db', // Cloud Gray

  // State Colors
  success: '#16a34a', // Natural Success Green
  warning: '#f59e0b', // Autumn Warning
  error: '#dc2626', // Natural Error Red
  info: '#0ea5e9', // Stream Blue

  // Background Colors
  bgPrimary: '#fefefe', // Pure White
  bgSecondary: '#f8fafc', // Misty White
  bgTertiary: '#f1f5f9', // Cloud White

  // Text Colors
  textPrimary: '#1f2937', // Dark Forest Text
  textSecondary: '#4b5563', // Medium Gray Text
  textTertiary: '#6b7280', // Light Gray Text
  textDisabled: '#9ca3af', // Disabled Text
};

const NatureThemeProvider = ({
  children,
  darkMode = false,
  locale,
  ...configProps
}) => {
  // For older versions of Ant Design, we'll apply theme via CSS custom properties
  React.useEffect(() => {
    const root = document.documentElement;

    // Set theme attribute for CSS targeting
    root.setAttribute('data-theme', darkMode ? 'dark' : 'light');

    // Apply CSS custom properties for dynamic theming
    const colors = darkMode
      ? {
          '--nature-primary': '#4a7c1f',
          '--nature-primary-light': '#73d13d',
          '--nature-secondary': '#73d13d',
          '--nature-success': '#16a34a',
          '--nature-warning': '#f59e0b',
          '--nature-error': '#dc2626',
          '--nature-info': '#0ea5e9',
          '--nature-gray': '#6b7280',
          '--nature-bg-primary': '#1f2937',
          '--nature-bg-secondary': '#374151',
          '--nature-bg-tertiary': '#4b5563',
          '--nature-text-primary': '#f9fafb',
          '--nature-text-secondary': '#d1d5db',
          '--nature-text-tertiary': '#9ca3af',
        }
      : {
          '--nature-primary': NATURE_COLORS.primary,
          '--nature-primary-light': NATURE_COLORS.primaryLight,
          '--nature-secondary': NATURE_COLORS.secondary,
          '--nature-success': NATURE_COLORS.success,
          '--nature-warning': NATURE_COLORS.warning,
          '--nature-error': NATURE_COLORS.error,
          '--nature-info': NATURE_COLORS.info,
          '--nature-gray': NATURE_COLORS.gray,
          '--nature-bg-primary': NATURE_COLORS.bgPrimary,
          '--nature-bg-secondary': NATURE_COLORS.bgSecondary,
          '--nature-bg-tertiary': NATURE_COLORS.bgTertiary,
          '--nature-text-primary': NATURE_COLORS.textPrimary,
          '--nature-text-secondary': NATURE_COLORS.textSecondary,
          '--nature-text-tertiary': NATURE_COLORS.textTertiary,
        };

    // Apply each color as a CSS custom property
    Object.entries(colors).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });
  }, [darkMode]);

  // 🔧 CRITICAL FIX: Avoid nested ConfigProvider conflicts
  // Only wrap with ConfigProvider if we have specific config props to apply
  // and no locale is being passed (to avoid conflicts with parent ConfigProvider)
  const shouldWrapWithConfigProvider =
    !locale && Object.keys(configProps).length > 0;

  const content = <div className='nature-theme-wrapper'>{children}</div>;

  if (shouldWrapWithConfigProvider) {
    return <ConfigProvider {...configProps}>{content}</ConfigProvider>;
  }

  return content;
};

NatureThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
  darkMode: PropTypes.bool,
  locale: PropTypes.object,
};

NatureThemeProvider.defaultProps = {
  darkMode: false,
  locale: undefined,
};

// Export color palette for use in other components
export { NATURE_COLORS };

export default NatureThemeProvider;
