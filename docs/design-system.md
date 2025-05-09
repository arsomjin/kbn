# 🎨 KBN Design System

This document details the comprehensive design system for the KBN platform, covering color palettes, typography, component styling, and implementation guidelines.

## Design Philosophy

The KBN platform employs a nature-inspired design language that combines professionalism with warmth and accessibility:

- **Professional and sleek**: Business-appropriate aesthetics
- **User-friendly**: Reduced cognitive load through intuitive design
- **Modern and clean**: Flat design principles for enhanced usability
- **Nature-inspired**: Organic shapes and earthy tones creating a calming experience

## Color System

### Primary Palette - Earthy Greens

```tsx
export const COLORS = {
  PRIMARY: {
    LIGHTEST: "#E3EEDE", // Background tints, highlights
    LIGHT: "#B5CCA8",    // Secondary buttons, light elements
    MAIN: "#5D8C53",     // Primary buttons, key elements
    DARK: "#3D6E36",     // Hover states, emphasis
    DARKEST: "#2A4D25",  // Active states, strong emphasis
  },
  
  // Secondary palette - Complementary earth tones
  SECONDARY: {
    SAND: "#E6D9B8",     // Neutral backgrounds, form fields
    CLAY: "#C2A887",     // Secondary actions, section dividers
    STONE: "#7D7468",    // Text on light backgrounds
    WOOD: "#5A4E44",     // Headers, important text
  },
  
  // Accent colors - Used sparingly for attention
  ACCENT: {
    WATER: "#6AA5CB",    // Information, links
    SUNSET: "#E09F5E",   // Warnings, notable items
    BERRY: "#A05C7B",    // Special features, promotions
    LEAF: "#85B17C",     // Success states, confirmations
  },
  
  // Feedback colors
  FEEDBACK: {
    SUCCESS: "#5B9A55",  // Success messages
    WARNING: "#E8AD5A",  // Warning messages
    ERROR: "#C15757",    // Error messages, critical alerts
    INFO: "#5A87AD",     // Information messages
  },
  
  // Neutrals
  NEUTRAL: {
    WHITE: "#FFFFFF",
    LIGHTEST: "#F8F8F5", // Page backgrounds
    LIGHT: "#EBEAE6",    // Card backgrounds, dividers
    MEDIUM: "#C4C4C0",   // Disabled elements
    DARK: "#666663",     // Body text
    DARKEST: "#333331",  // Headings, important text
    BLACK: "#1A1A18",    // Highest contrast text
  },
}
```

### Dark Mode Colors

```tsx
export const DARK_MODE_COLORS = {
  PRIMARY: {
    LIGHTEST: "#2A4D25",
    LIGHT: "#3D6E36",
    MAIN: "#5D8C53",     // Maintain brand recognition
    DARK: "#B5CCA8",
    DARKEST: "#E3EEDE",
  },
  
  SECONDARY: {
    SAND: "#3A352D",
    CLAY: "#4D4237",
    STONE: "#7D7468",    // Maintained for recognizability
    WOOD: "#C2A887",
  },
  
  // Accent colors - Slightly muted for dark mode
  ACCENT: {
    WATER: "#4A7A9A",
    SUNSET: "#AA784A",
    BERRY: "#7A4A5F",
    LEAF: "#5B7B55",
  },
  
  // Feedback colors - Maintained but softened
  FEEDBACK: {
    SUCCESS: "#5B9A55",
    WARNING: "#C99645",
    ERROR: "#B54A4A",
    INFO: "#4A7291",
  },
  
  // Neutrals - Inverted
  NEUTRAL: {
    WHITE: "#1A1A18",
    LIGHTEST: "#282826", // Page backgrounds
    LIGHT: "#333331",    // Card backgrounds, dividers
    MEDIUM: "#666663",   // Disabled elements
    DARK: "#C4C4C0",     // Body text
    DARKEST: "#EBEAE6",  // Headings, important text
    BLACK: "#F8F8F5",    // Highest contrast text
  },
}
```

## Typography

The type system uses a combination of readable sans-serif fonts with Thai language support:

```tsx
export const TYPOGRAPHY = {
  FONT_FAMILY: {
    PRIMARY: "'Inter', 'Noto Sans Thai', -apple-system, BlinkMacSystemFont, sans-serif", // Main text
    HEADERS: "'Montserrat', 'Noto Sans Thai', -apple-system, BlinkMacSystemFont, sans-serif", // Headers
    MONOSPACE: "'IBM Plex Mono', monospace", // Code, numbers, data
  },
  
  FONT_SIZE: {
    XS: "0.75rem",    // 12px
    SM: "0.875rem",   // 14px
    BASE: "1rem",     // 16px
    MD: "1.125rem",   // 18px
    LG: "1.25rem",    // 20px
    XL: "1.5rem",     // 24px
    XXL: "1.875rem",  // 30px
    XXXL: "2.25rem",  // 36px
  },
  
  FONT_WEIGHT: {
    LIGHT: 300,
    REGULAR: 400,
    MEDIUM: 500,
    SEMIBOLD: 600,
    BOLD: 700,
  },
  
  LINE_HEIGHT: {
    TIGHT: 1.25,
    NORMAL: 1.5,
    RELAXED: 1.75,
  },
}
```

## Component Styling

### Cards and Containers

```tsx
export const CARD_STYLES = {
  BORDER_RADIUS: {
    SM: "0.25rem",  // 4px
    MD: "0.5rem",   // 8px
    LG: "0.75rem",  // 12px
    XL: "1rem",     // 16px
  },
  
  SHADOWS: {
    SM: "0 1px 2px rgba(0, 0, 0, 0.05)",
    MD: "0 2px 4px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)",
    LG: "0 4px 6px rgba(0, 0, 0, 0.05), 0 2px 4px rgba(0, 0, 0, 0.1)",
    XL: "0 10px 15px rgba(0, 0, 0, 0.05), 0 4px 6px rgba(0, 0, 0, 0.05)",
  },
  
  PADDING: {
    SM: "0.75rem",  // 12px
    MD: "1rem",     // 16px
    LG: "1.5rem",   // 24px
    XL: "2rem",     // 32px
  },
}
```

### Buttons

```tsx
// Use these styles to extend Ant Design buttons
const ButtonStyles = css`
  &.ant-btn {
    border-radius: ${CARD_STYLES.BORDER_RADIUS.MD};
    font-weight: ${TYPOGRAPHY.FONT_WEIGHT.MEDIUM};
    transition: all 0.2s ease;
    
    // Primary button
    &.ant-btn-primary {
      background-color: ${COLORS.PRIMARY.MAIN};
      border-color: ${COLORS.PRIMARY.MAIN};
      
      &:hover {
        background-color: ${COLORS.PRIMARY.DARK};
        border-color: ${COLORS.PRIMARY.DARK};
      }
      
      &:active {
        background-color: ${COLORS.PRIMARY.DARKEST};
        border-color: ${COLORS.PRIMARY.DARKEST};
      }
    }
    
    // Default button
    &.ant-btn-default {
      border-color: ${COLORS.NEUTRAL.MEDIUM};
      color: ${COLORS.NEUTRAL.DARK};
      
      &:hover {
        border-color: ${COLORS.PRIMARY.MAIN};
        color: ${COLORS.PRIMARY.MAIN};
      }
    }
  }
`;
```

### Forms

```tsx
const FormStyles = css`
  .ant-form-item-label {
    font-weight: ${TYPOGRAPHY.FONT_WEIGHT.MEDIUM};
  }
  
  .ant-input, .ant-select-selector {
    border-radius: ${CARD_STYLES.BORDER_RADIUS.SM};
    border-color: ${COLORS.SECONDARY.SAND};
    transition: all 0.2s ease;
    
    &:hover, &:focus {
      border-color: ${COLORS.PRIMARY.MAIN};
      box-shadow: 0 0 0 2px ${rgba(COLORS.PRIMARY.MAIN, 0.2)};
    }
  }
  
  // Field validation states
  .ant-form-item-has-error .ant-input,
  .ant-form-item-has-error .ant-select-selector {
    border-color: ${COLORS.FEEDBACK.ERROR};
    
    &:hover, &:focus {
      border-color: ${COLORS.FEEDBACK.ERROR};
      box-shadow: 0 0 0 2px ${rgba(COLORS.FEEDBACK.ERROR, 0.2)};
    }
  }
`;
```

## Layout Guidelines

### Spacing System

```tsx
export const SPACING = {
  XS: "0.25rem",   // 4px
  SM: "0.5rem",    // 8px
  MD: "1rem",      // 16px
  LG: "1.5rem",    // 24px
  XL: "2rem",      // 32px
  XXL: "3rem",     // 48px
  XXXL: "4rem",    // 64px
}
```

### Navigation Elements

```tsx
const BreadcrumbStyles = css`
  .ant-breadcrumb {
    font-size: ${TYPOGRAPHY.FONT_SIZE.SM};
    margin-bottom: ${SPACING.MD};
    
    .ant-breadcrumb-separator {
      color: ${COLORS.NEUTRAL.MEDIUM};
    }
    
    .ant-breadcrumb-link {
      a {
        color: ${COLORS.ACCENT.WATER};
        
        &:hover {
          color: ${COLORS.PRIMARY.MAIN};
        }
      }
      
      &:last-child {
        color: ${COLORS.NEUTRAL.DARK};
        font-weight: ${TYPOGRAPHY.FONT_WEIGHT.MEDIUM};
      }
    }
  }
`;
```

## Dark Mode Implementation

### Theme Provider

```tsx
const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem('theme') === 'dark' || 
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );
  
  // Effect to handle theme changes
  useEffect(() => {
    document.documentElement.classList.toggle('dark-theme', isDarkMode);
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);
  
  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };
  
  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
```

### CSS Variables

```css
:root {
  /* Light theme variables */
  --color-bg-primary: #FFFFFF;
  --color-bg-secondary: #F8F8F5;
  --color-text-primary: #333331;
  --color-text-secondary: #666663;
  /* ...other variables */
}

:root.dark-theme {
  /* Dark theme variables */
  --color-bg-primary: #1A1A18;
  --color-bg-secondary: #282826;
  --color-text-primary: #EBEAE6;
  --color-text-secondary: #C4C4C0;
  /* ...other variables */
}
```

## Responsive Design

### Breakpoints

```tsx
export const BREAKPOINTS = {
  XS: "480px",    // Mobile
  SM: "768px",    // Tablet
  MD: "992px",    // Small desktop
  LG: "1200px",   // Medium desktop
  XL: "1600px",   // Large desktop
}

// Media query helpers
export const media = {
  xs: `@media (max-width: ${BREAKPOINTS.XS})`,
  sm: `@media (max-width: ${BREAKPOINTS.SM})`,
  md: `@media (max-width: ${BREAKPOINTS.MD})`,
  lg: `@media (max-width: ${BREAKPOINTS.LG})`,
  xl: `@media (max-width: ${BREAKPOINTS.XL})`,
}
```

## Animations and Transitions

```tsx
export const ANIMATION = {
  DURATION: {
    FAST: "150ms",
    MEDIUM: "300ms",
    SLOW: "500ms",
  },
  
  EASING: {
    EASE_OUT: "cubic-bezier(0.16, 1, 0.3, 1)",
    EASE_IN_OUT: "cubic-bezier(0.65, 0, 0.35, 1)",
    BOUNCE: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  },
}
```

## Implementation Examples

### Card Component

```tsx
import styled from 'styled-components';
import { media, CARD_STYLES, ANIMATION } from '../theme';

const Card = styled.div`
  background-color: var(--color-bg-primary);
  border-radius: ${CARD_STYLES.BORDER_RADIUS.MD};
  box-shadow: ${CARD_STYLES.SHADOWS.MD};
  padding: ${CARD_STYLES.PADDING.MD};
  transition: box-shadow ${ANIMATION.DURATION.MEDIUM} ${ANIMATION.EASING.EASE_OUT};
  
  &:hover {
    box-shadow: ${CARD_STYLES.SHADOWS.LG};
  }
  
  // Responsive adjustments
  ${media.sm} {
    padding: ${CARD_STYLES.PADDING.SM};
  }
`;
```

### Feature Card Component

```tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { Card, IconWrapper, Title, Description } from './styled-components';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon }) => {
  const { t } = useTranslation();
  
  return (
    <Card>
      <IconWrapper>{icon}</IconWrapper>
      <Title>{t(title)}</Title>
      <Description>{t(description)}</Description>
    </Card>
  );
};
```

## Accessibility Guidelines

- Maintain WCAG 2.1 AA compliance
- Use semantic HTML elements
- Implement proper focus states
- Ensure color contrast ratios meet standards (4.5:1 for normal text)
- Include aria attributes where necessary
- Support keyboard navigation
- Provide text alternatives for non-text content
- Ensure forms have proper labels and error messages

## Icon Guidelines

- Line icons with 1.5px stroke weight
- Rounded corners matching UI elements
- 24px standard size (scaled as needed)
- Filled variant for selected/active states
- Consistent positioning and alignment
- Color matching with the active theme

## Design Resources

- Icon library: [Refer to project Figma file]
- Color palette: [Refer to project Figma file]
- Component library: Ant Design with custom theme
- Design tokens: Implement using CSS variables and theme context