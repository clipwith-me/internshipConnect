// frontend/src/styles/tokens.js

/**
 * Design tokens - the single source of truth for InternshipConnect's visual
 * language. Tailwind (tailwind.config.js) consumes these, so changing a value
 * here re-themes the whole product.
 *
 * Direction: credible, calm, optimistic. Derived from the logo:
 *   brand blue  #1E6FE8  -> primary
 *   brand green #22C45A  -> success / "growth" accent (text uses darker steps)
 *   brand navy  #0D1426  -> neutral-900 (headings, dark surfaces)
 *
 * Contrast notes (WCAG 2.2 AA, measured against white):
 *   primary-500 4.7:1  | neutral-500 4.8:1 | success-500 5.0:1 | error-500 4.9:1
 *   Use neutral-500 or darker for any text that carries meaning.
 */

export const tokens = {
  // ═══════════════════════════════════════════════════════════
  // COLORS
  // ═══════════════════════════════════════════════════════════
  colors: {
    // Brand blue
    primary: {
      50: '#EEF4FE',
      100: '#DCE8FD',
      200: '#BCD3FB',
      300: '#8DB4F7',
      400: '#5A90F0',
      500: '#1E6FE8', // main brand colour
      600: '#1859C4', // hover
      700: '#14459A', // pressed
      800: '#103675',
      900: '#0B2759',
    },

    // Cool neutrals tinted toward the brand navy
    neutral: {
      0: '#FFFFFF',
      50: '#F8F9FB',
      100: '#F1F3F7',
      200: '#E4E7EC',
      300: '#CFD4DC',
      400: '#98A2B3',
      500: '#667085',
      600: '#475467',
      700: '#344054',
      800: '#1D2939',
      900: '#0D1426', // brand navy
    },

    // Semantic colours
    success: {
      50: '#F0FDF4',
      100: '#DCFCE7',
      500: '#15803D',
      600: '#166534',
      700: '#14532D',
    },

    warning: {
      50: '#FFFAEB',
      100: '#FEF0C7',
      500: '#F79009',
      600: '#B54708',
      700: '#93370D',
    },

    error: {
      50: '#FEF3F2',
      100: '#FEE4E2',
      500: '#D92D20',
      600: '#B42318',
      700: '#912018',
    },

    info: {
      50: '#EEF4FE',
      100: '#DCE8FD',
      500: '#1E6FE8',
      600: '#1859C4',
      700: '#14459A',
    },
  },

  // ═══════════════════════════════════════════════════════════
  // TYPOGRAPHY
  // Inter is self-hosted (@fontsource-variable/inter), so it renders the same
  // on Android, iOS and desktop with no third-party request. The system stack
  // is the fallback while it loads (font-display: swap).
  // ═══════════════════════════════════════════════════════════
  typography: {
    fontFamily: {
      body: "'Inter Variable', Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      heading: "'Inter Variable', Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      mono: "ui-monospace, 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace",
    },

    fontSize: {
      xs: '0.75rem', // 12px - captions, labels
      sm: '0.875rem', // 14px - secondary text, table cells
      base: '1rem', // 16px - body
      lg: '1.125rem', // 18px - lead text
      xl: '1.25rem', // 20px - card titles
      '2xl': '1.5rem', // 24px - section headings
      '3xl': '1.875rem', // 30px - page headings
      '4xl': '2.25rem', // 36px - hero (mobile)
      '5xl': '3rem', // 48px - hero (desktop)
    },

    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },

    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.7,
    },

    letterSpacing: {
      tight: '-0.02em',
      normal: '0',
      wide: '0.025em',
    },
  },

  // ═══════════════════════════════════════════════════════════
  // SPACING (4px base)
  // ═══════════════════════════════════════════════════════════
  spacing: {
    0: '0',
    0.5: '0.125rem', // 2px
    1: '0.25rem', // 4px
    2: '0.5rem', // 8px
    3: '0.75rem', // 12px
    4: '1rem', // 16px
    5: '1.25rem', // 20px
    6: '1.5rem', // 24px
    8: '2rem', // 32px
    10: '2.5rem', // 40px
    12: '3rem', // 48px
    16: '4rem', // 64px
    20: '5rem', // 80px
    24: '6rem', // 96px
  },

  // ═══════════════════════════════════════════════════════════
  // BORDER RADIUS - restrained: controls 8px, cards 12px
  // ═══════════════════════════════════════════════════════════
  borderRadius: {
    none: '0',
    sm: '4px', // chips, small elements
    base: '6px', // legacy default
    md: '8px', // buttons, inputs
    lg: '10px', // small cards
    xl: '12px', // cards, panels
    '2xl': '16px', // hero panels
    full: '9999px', // pills, avatars
  },

  // ═══════════════════════════════════════════════════════════
  // SHADOWS - low, cool-toned; elevation is hinted, not shouted
  // ═══════════════════════════════════════════════════════════
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(13, 20, 38, 0.06)',
    base: '0 1px 3px 0 rgba(13, 20, 38, 0.08), 0 1px 2px -1px rgba(13, 20, 38, 0.05)',
    md: '0 4px 8px -2px rgba(13, 20, 38, 0.08), 0 2px 4px -2px rgba(13, 20, 38, 0.05)',
    lg: '0 12px 16px -4px rgba(13, 20, 38, 0.08), 0 4px 6px -2px rgba(13, 20, 38, 0.04)',
    xl: '0 20px 24px -4px rgba(13, 20, 38, 0.1), 0 8px 8px -4px rgba(13, 20, 38, 0.04)',
    '2xl': '0 24px 48px -12px rgba(13, 20, 38, 0.22)',
    inner: 'inset 0 2px 4px 0 rgba(13, 20, 38, 0.05)',
    focus: '0 0 0 4px rgba(30, 111, 232, 0.2)',
  },

  // ═══════════════════════════════════════════════════════════
  // TRANSITIONS
  // ═══════════════════════════════════════════════════════════
  transitions: {
    duration: {
      fast: '120ms',
      base: '180ms',
      slow: '280ms',
    },

    timing: {
      ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },

  // ═══════════════════════════════════════════════════════════
  // Z-INDEX (layering)
  // ═══════════════════════════════════════════════════════════
  zIndex: {
    hide: -1,
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },

  // ═══════════════════════════════════════════════════════════
  // BREAKPOINTS
  // ═══════════════════════════════════════════════════════════
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
};

export default tokens;
