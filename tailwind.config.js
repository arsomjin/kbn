module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx,html}'],
  darkMode: 'class',
  theme: {
    screens: {
      xs: '480px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    extend: {
      fontSize: {
        custom: 'var(--font-size-custom)',
      },
      colors: {
        primary: 'var(--colors-primary)',
        'primary-light': 'var(--colors-primary-light)',
        'primary-dark': 'var(--colors-primary-dark)',
        secondary: 'var(--colors-secondary)',
        'secondary-light': 'var(--colors-secondary-light)',
        'secondary-dark': 'var(--colors-secondary-dark)',
        success: 'var(--colors-success)',
        'success-light': 'var(--colors-success-light)',
        warning: 'var(--colors-warning)',
        'warning-light': 'var(--colors-warning-light)',
        danger: 'var(--colors-danger)',
        'danger-light': 'var(--colors-danger-light)',
        black: 'var(--colors-black)',
        white: 'var(--colors-white)',
        background1: 'var(--colors-background1)',
        background2: 'var(--colors-background2)',
        'tw-white': 'var(--colors-tw-white)',
        'tw-black': 'var(--colors-tw-black)',
        'scrollbar-background': 'var(--colors-scrollbar-background)',
        'scrollbar-thumb': 'var(--colors-scrollbar-thumb)',
        'text-primary': 'var(--colors-text-primary)',
        'text-secondary': 'var(--colors-text-secondary)',
        'text-disabled': 'var(--colors-text-disabled)',
        'border-base': 'var(--colors-border-base)',
        'border-split': 'var(--colors-border-split)',
        'hover-bg': 'var(--colors-hover-bg)',
        'selected-bg': 'var(--colors-selected-bg)',
        leaf: 'var(--colors-leaf)',
        moss: 'var(--colors-moss)',
        bark: 'var(--colors-bark)',
        soil: 'var(--colors-soil)',
        stone: 'var(--colors-stone)',
        forest: 'var(--colors-forest)',
        primary: {
          DEFAULT: '#4B6043', // Deep olive green
          light: '#7A8450', // Muted olive
          dark: '#2E3D27', // Dark forest
        },
        secondary: {
          DEFAULT: '#A67C52', // Earthy brown
          light: '#D9B382', // Sand
          dark: '#7C5A36', // Deep brown
        },
        accent: {
          DEFAULT: '#6C8E7B', // Muted teal
          light: '#A3C1AD', // Pale green
          dark: '#46685B', // Dark teal
        },
        background: {
          DEFAULT: '#F5F3EB', // Light beige
          dark: '#E9E5D6', // Slightly darker beige
        },
        surface: {
          DEFAULT: '#FFFFFF', // Card/Panel backgrounds
          dark: '#F0EEE7',
        },
        border: {
          DEFAULT: '#D6CFC2', // Subtle border
        },
        text: {
          DEFAULT: '#2E3D27', // Main text
          muted: '#6B705C', // Muted text
        },
        error: {
          light: '#FDECEA', // Soft error background
          DEFAULT: '#B85C38', // Main error color
        },
      },
      backgroundColor: {
        'group-header-light': 'var(--colors-group-header-light)',
        'group-header-dark': 'var(--colors-group-header-dark)',
      },
      borderColor: {
        DEFAULT: 'var(--colors-border-base)',
        split: 'var(--colors-border-split)',
      },
      fontWeight: {
        'group-header': '700', // Bold text for group header
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        dropdown: 'var(--shadow-dropdown)',
        hover: 'var(--shadow-hover)',
        soft: '0 4px 12px rgba(166, 123, 91, 0.08)',
        natural: '0 6px 24px rgba(122, 169, 127, 0.1)',
      },
      borderRadius: {
        natural: '0.85rem', // Slightly softer corners for a natural feel
        DEFAULT: '0.5rem', // Modern rounded corners
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      variables: {
        DEFAULT: {
          colors: {
            primary: '#7FA97F', // moss green
            'primary-light': '#A3C9A8', // lighter sage
            'primary-dark': '#5A7D5A', // forest green
            secondary: '#A67B5B', // warm terracotta
            'secondary-light': '#C19778', // light clay
            'secondary-dark': '#8C6E54', // rich soil
            success: '#7BAE7F', // fresh green
            'success-light': '#A3CDA6', // light mint
            danger: '#B85C38', // brick red
            'danger-light': '#D8836A', // light terracotta
            warning: '#D9B382', // wheat/sand
            'warning-light': '#E4CBA9', // light sand
            background1: '#F9F7F4', // softer warm white (paper texture)
            background2: '#F0EDE8', // soft cream (natural material)
            'tw-white': '#FAF9F7', // pure natural white
            'tw-black': '#332F29', // deep earth brown
            white: '#FFFFFF',
            black: '#000000',
            'scrollbar-background': '#E0D9CF', // lighter parchment
            'scrollbar-thumb': '#A67B5B', // terracotta accent
            'group-header-light': '#EAE6DD', // light parchment
            'text-primary': '#332F29', // deep earth (near black)
            'text-secondary': '#5F5B54', // medium earth
            'text-disabled': '#A6A29A', // light stone
            'border-base': '#D1CCC3', // soft parchment
            'border-split': '#E9E5DD', // lighter parchment
            'hover-bg': '#F5F2ED', // cream highlight
            'selected-bg': '#EBF3EB', // soft sage highlight
            leaf: '#6B9080', // blue-green leaf
            moss: '#7FA97F', // moss green
            bark: '#8C6E54', // tree bark
            soil: '#A67B5B', // rich soil
            stone: '#BFB8AB', // weathered stone
            forest: '#5A7D5A', // forest green
          },
          font_size_custom: '1.7rem',
          shadow_card: '0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)',
          shadow_dropdown:
            '0 3px 16px -4px rgba(0, 0, 0, 0.08), 0 6px 16px 0 rgba(0, 0, 0, 0.05), 0 9px 28px 8px rgba(0, 0, 0, 0.03)',
          shadow_hover: '0 6px 16px rgba(166, 123, 91, 0.1), 0 3px 6px rgba(127, 169, 127, 0.05)',
        },
        '.card': {
          font_size_custom: '2rem',
        },
      },
      darkVariables: {
        DEFAULT: {
          colors: {
            primary: '#A3C9A8', // moonlit sage
            'primary-light': '#BFD9C3', // light sage in moonlight
            'primary-dark': '#7B9C7F', // shadowed forest
            secondary: '#8C6E54', // dark bark
            'secondary-light': '#A68B76', // weathered wood
            'secondary-dark': '#6E5544', // deep bark
            success: '#A3C9A8', // night forest green
            'success-light': '#BFD9C3', // misty forest
            warning: '#D9B382', // amber moonlight
            'warning-light': '#E4CBA9', // distant campfire
            danger: '#B85C38', // dark rust
            'danger-light': '#D8836A', // glowing ember
            background1: '#23241E', // midnight forest
            background2: '#2E2C26', // dark earth
            white: '#23241E', // midnight forest (inverted)
            black: '#F4F1EE', // moonlit path (inverted)
            'tw-white': '#2A2C25', // night shadow
            'tw-black': '#E9E5DD', // moonlit clearing
            'scrollbar-background': '#35332D', // night shadow
            'scrollbar-thumb': '#A3C9A8', // moonlit leaf
            'group-header-dark': '#2E2C26', // night clearing
            'text-primary': '#E9E5DD', // moonlight
            'text-secondary': '#B9B5AD', // twilight
            'text-disabled': '#69675F', // distant shadow
            'border-base': '#434239', // night contour
            'border-split': '#343330', // deeper night
            'hover-bg': '#39382D', // forest floor
            'selected-bg': '#3A423A', // moonlit moss
            leaf: '#5A7A6F', // moonlit leaf
            moss: '#79A27A', // night moss
            bark: '#6E5544', // night bark
            soil: '#6E5544', // night soil
            stone: '#78756D', // moonlit stone
            forest: '#4A6749', // midnight forest
          },
          font_size_custom: '1rem',
          shadow_card: '0 2px 8px rgba(0, 0, 0, 0.15), 0 1px 3px rgba(0, 0, 0, 0.1)',
          shadow_dropdown:
            '0 3px 6px -4px rgba(0, 0, 0, 0.48), 0 6px 16px 0 rgba(0, 0, 0, 0.32), 0 9px 28px 8px rgba(0, 0, 0, 0.2)',
          shadow_hover: '0 6px 16px rgba(0, 0, 0, 0.25), 0 3px 6px rgba(163, 201, 168, 0.1)',
        },
        '.card': {
          font_size_custom: '1.3rem',
        },
      },
    },
  },
  variants: {},
  plugins: [
    require('@mertasan/tailwindcss-variables')({
      darkToRoot: true,
    }),
  ],
};
