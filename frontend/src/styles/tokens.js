// frontend/src/styles/tokens.js

/**
 * 🎓 LEARNING: Design Tokens
 * 
 * Design tokens are the visual DNA of your application.
 * They ensure consistency across all components.
 * 
 * Why use tokens?
 * - Change colors once, update everywhere
 * - Maintain brand consistency
 * - Easy to switch themes (light/dark mode)
 * - Designer-developer collaboration
 */

export const tokens = {
  // ═══════════════════════════════════════════════════════════
  // COLORS - Microsoft Fluent Design inspired
  // ═══════════════════════════════════════════════════════════
  
  colors: {
    // Primary palette (Microsoft Blue)
    primary: {
      50: '#E6F2FF',   // Lightest - backgrounds
      100: '#CCE5FF',  // Very light - hover states
      200: '#99CBFF',  // Light
      300: '#66B0FF',  // 
      400: '#3395FF',  // 
      500: '#0078D4',  // Main brand color (Microsoft Blue)
      600: '#006CBE',  // Darker - pressed states
      700: '#005BA1',  // Even darker
      800: '#004A84',  // 
      900: '#003966',  // Darkest
    },
    
    // Neutral grays (Microsoft uses these extensively)
    neutral: {
      0: '#FFFFFF',    // Pure white
      50: '#FAFAFA',   // Off-white
      100: '#F5F5F5',  // Very light gray - backgrounds
      200: '#E1E1E1',  // Light gray - borders
      300: '#C8C8C8',  // Medium-light gray
      400: '#A0A0A0',  // Medium gray
      500: '#616161',  // Medium-dark gray - body text
      600: '#464646',  // Dark gray
      700: '#323130',  // Very dark gray - headings
      800: '#252423',  // Almost black
      900: '#11100F',  // Pure black
    },
    
    // Semantic colors (for alerts, success, etc.)
    success: {
      50: '#E8F5E9',
      100: '#C8E6C9',
      500: '#107C10',  // Microsoft green
      600: '#0E6B0E',
      700: '#0B5A0B',
    },
    
    warning: {
      50: '#FFF8E1',
      100: '#FFECB3',
      500: '#FFB900',  // Microsoft yellow
      600: '#E6A700',
      700: '#CC9500',
    },
    
    error: {
      50: '#FFEBEE',
      100: '#FFCDD2',
      500: '#D13438',  // Microsoft red
      600: '#BC2F32',
      700: '#A72A2D',
    },
    
    info: {
      50: '#E3F2FD',
      100: '#BBDEFB',
      500: '#0078D4',  // Same as primary
      600: '#006CBE',
      700: '#005BA1',
    },
  },
  
  // ═══════════════════════════════════════════════════════════
  // TYPOGRAPHY
  // ═══════════════════════════════════════════════════════════
  
  typography: {
    fontFamily: {
      // Microsoft uses Segoe UI, we'll add fallbacks
      body: "'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif",
      heading: "'Segoe UI Semibold', 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
      mono: "'Consolas', 'Monaco', 'Courier New', monospace",
    },
    
    fontSize: {
      xs: '0.75rem',      // 12px - captions, labels
      sm: '0.875rem',     // 14px - small text
      base: '1rem',       // 16px - body text
      lg: '1.125rem',     // 18px - large body
      xl: '1.25rem',      // 20px - subtitle
      '2xl': '1.5rem',    // 24px - section heading
      '3xl': '1.875rem',  // 30px - page heading
      '4xl': '2.25rem',   // 36px - hero heading
      '5xl': '3rem',      // 48px - display
    },
    
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
    
    letterSpacing: {
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em',
    },
  },
  
  // ═══════════════════════════════════════════════════════════
  // SPACING (8px base grid - Microsoft standard)
  // ═══════════════════════════════════════════════════════════
  
  spacing: {
    0: '0',
    0.5: '0.125rem',  // 2px
    1: '0.25rem',     // 4px
    2: '0.5rem',      // 8px
    3: '0.75rem',     // 12px
    4: '1rem',        // 16px
    5: '1.25rem',     // 20px
    6: '1.5rem',      // 24px
    8: '2rem',        // 32px
    10: '2.5rem',     // 40px
    12: '3rem',       // 48px
    16: '4rem',       // 64px
    20: '5rem',       // 80px
    24: '6rem',       // 96px
  },
  
  // ═══════════════════════════════════════════════════════════
  // BORDER RADIUS
  // ═══════════════════════════════════════════════════════════
  
  borderRadius: {
    none: '0',
    sm: '2px',        // Small elements
    base: '4px',      // Default buttons, inputs
    md: '6px',        // Cards, containers
    lg: '8px',        // Large cards
    xl: '12px',       // Hero sections
    '2xl': '16px',    // Special containers
    full: '9999px',   // Pills, circular
  },
  
  // ═══════════════════════════════════════════════════════════
  // SHADOWS (Microsoft depth system)
  // ═══════════════════════════════════════════════════════════
  
  shadows: {
    // Elevation levels
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 2px 4px -1px rgba(0, 0, 0, 0.04)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    
    // Special shadows
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    focus: '0 0 0 3px rgba(0, 120, 212, 0.2)', // Primary color ring
  },
  
  // ═══════════════════════════════════════════════════════════
  // TRANSITIONS
  // ═══════════════════════════════════════════════════════════
  
  transitions: {
    duration: {
      fast: '150ms',
      base: '200ms',
      slow: '300ms',
    },
    
    timing: {
      ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
  
  // ═══════════════════════════════════════════════════════════
  // Z-INDEX (Layering system)
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
  // BREAKPOINTS (Responsive design)
  // ═══════════════════════════════════════════════════════════
  
  breakpoints: {
    sm: '640px',   // Mobile landscape
    md: '768px',   // Tablet
    lg: '1024px',  // Desktop
    xl: '1280px',  // Large desktop
    '2xl': '1536px', // Extra large
  },
};

/**
 * 🎓 USAGE EXAMPLES:
 * 
 * In JavaScript/JSX:
 * 
 * import { tokens } from './styles/tokens';
 * 
 * const buttonStyle = {
 *   backgroundColor: tokens.colors.primary[500],
 *   padding: tokens.spacing[4],
 *   borderRadius: tokens.borderRadius.base,
 *   fontSize: tokens.typography.fontSize.base,
 * };
 * 
 * 
 * In Tailwind (after configuration):
 * 
 * <button className="bg-primary-500 px-4 rounded-base text-base">
 *   Click me
 * </button>
 */

export default tokens;