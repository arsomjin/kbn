import { ThemeConfig } from 'antd/es/config-provider/context';
import { theme } from 'antd';

export type ThemeMode = 'light' | 'dark';

interface ColorPalette {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  secondaryLight: string;
  secondaryDark: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  bg: string;
  paper: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
}

interface ThemeColors {
  light: ColorPalette;
  dark: ColorPalette;
}

// Define the theme colors
export const themeColors: ThemeColors = {
  light: {
    primary: '#4B6043', // Deep olive green
    primaryLight: '#7A8450', // Muted olive
    primaryDark: '#2E3D27', // Dark forest
    secondary: '#A67C52', // Earthy brown
    secondaryLight: '#D9B382', // Sand
    secondaryDark: '#7C5A36', // Deep brown
    success: '#7BAE7F', // Fresh green
    warning: '#D9B382', // Wheat/sand
    error: '#B85C38', // Brick red
    info: '#6C8E7B', // Muted teal
    bg: '#F5F3EB', // Light beige
    paper: '#FFFFFF', // White
    surface: '#F0EEE7', // Soft cream
    text: '#2E3D27', // Deep forest green
    textSecondary: '#6B705C', // Muted text
    border: '#D6CFC2' // Subtle border
  },
  dark: {
    primary: '#7FA97F', // Moss green
    primaryLight: '#A3C9A8', // Light sage
    primaryDark: '#5A7D5A', // Forest green
    secondary: '#8C6E54', // Dark bark
    secondaryLight: '#A68B76', // Weathered wood
    secondaryDark: '#6E5544', // Deep bark
    success: '#A3C9A8', // Night forest green
    warning: '#D9B382', // Amber moonlight
    error: '#B85C38', // Dark rust
    info: '#79A27A', // Night moss
    bg: '#23241E', // Midnight forest
    paper: '#2E2C26', // Dark earth
    surface: '#39382D', // Forest floor
    text: '#E9E5DD', // Moonlight
    textSecondary: '#B9B5AD', // Twilight
    border: '#434239' // Night contour
  }
};

// CSS variable naming convention
const cssVariableNames = {
  primary: '--color-primary',
  primaryLight: '--color-primary-light',
  primaryDark: '--color-primary-dark',
  secondary: '--color-secondary',
  secondaryLight: '--color-secondary-light',
  secondaryDark: '--color-secondary-dark',
  success: '--color-success',
  warning: '--color-warning',
  error: '--color-error',
  info: '--color-info',
  bg: '--color-bg',
  paper: '--color-paper',
  surface: '--color-surface',
  text: '--color-text',
  textSecondary: '--color-textSecondary',
  border: '--color-border'
};

// Apply theme to CSS variables
export const applyTheme = (mode: ThemeMode): void => {
  const colors = themeColors[mode];
  const root = document.documentElement;

  // Set CSS variables
  Object.entries(colors).forEach(([key, value]) => {
    const varName = cssVariableNames[key as keyof ColorPalette];
    if (varName) {
      root.style.setProperty(varName, value);
    }
  });

  // Apply class for dark mode
  if (mode === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
};

// Get theme colors for the current mode
export const getThemeColors = (mode: ThemeMode): ColorPalette => {
  return themeColors[mode];
};

// Define Ant Design theme config
export const getAntDesignConfig = (mode: ThemeMode) => {
  const colors = themeColors[mode];

  return {
    token: {
      colorPrimary: colors.primary,
      colorSuccess: colors.success,
      colorWarning: colors.warning,
      colorError: colors.error,
      colorInfo: colors.info,
      colorTextBase: colors.text,
      colorBgBase: mode === 'dark' ? colors.paper : colors.bg,
      borderRadius: 4
    },
    algorithm: mode === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm
  };
};

export const antdTheme = {
  token: {
    colorPrimary: '#4B6043', // Deep olive green
    colorSuccess: '#7BAE7F', // Fresh green
    colorWarning: '#D9B382', // Wheat
    colorError: '#B85C38', // Brick red
    colorInfo: '#6C8E7B', // Muted teal
    colorBgBase: '#F5F3EB', // Light beige
    colorBgContainer: '#FFFFFF', // Card/Panel backgrounds
    colorTextBase: '#2E3D27', // Main text
    colorBorder: '#D6CFC2', // Subtle border
    borderRadius: 8,
    fontFamily: 'Inter, ui-sans-serif, system-ui'
  },
  components: {
    Button: {
      borderRadius: 8,
      colorPrimary: '#4B6043',
      colorPrimaryHover: '#7A8450',
      colorPrimaryActive: '#2E3D27',
      colorText: '#2E3D27',
      colorTextLightSolid: '#fff',
      controlHeight: 40,
      fontWeight: 600,
      boxShadow: 'none'
    },
    Card: {
      borderRadius: 12,
      colorBgContainer: '#FFFFFF',
      boxShadow: '0 2px 8px rgba(75, 96, 67, 0.04)'
    },
    Input: {
      borderRadius: 8,
      colorBgContainer: '#F5F3EB',
      colorBorder: '#D6CFC2',
      colorText: '#2E3D27'
    },
    Modal: {
      borderRadius: 16,
      colorBgContainer: '#FFFFFF',
      colorText: '#2E3D27'
    },
    Table: {
      borderRadius: 8,
      colorBgContainer: '#FFFFFF',
      colorBorder: '#D6CFC2',
      colorText: '#2E3D27'
    }
  }
};
