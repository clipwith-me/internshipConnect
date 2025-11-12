// frontend/tailwind.config.js

/**
 * 🎓 LEARNING: Tailwind Configuration
 * 
 * This file extends Tailwind's default theme with our custom tokens.
 * 
 * Why customize Tailwind?
 * - Match your brand colors exactly
 * - Add custom spacing, fonts, shadows
 * - Create consistent design language
 * - Microsoft-specific styles
 */

import { tokens } from './src/styles/tokens.js';

/** @type {import('tailwindcss').Config} */
export default {
  // Tell Tailwind which files to scan for classes
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  
  theme: {
    extend: {
      // ═══════════════════════════════════════════════════════
      // COLORS
      // ═══════════════════════════════════════════════════════
      colors: {
        primary: tokens.colors.primary,
        neutral: tokens.colors.neutral,
        success: tokens.colors.success,
        warning: tokens.colors.warning,
        error: tokens.colors.error,
        info: tokens.colors.info,
      },
      
      // ═══════════════════════════════════════════════════════
      // TYPOGRAPHY
      // ═══════════════════════════════════════════════════════
      fontFamily: {
        sans: tokens.typography.fontFamily.body.split(',').map(f => f.trim()),
        heading: tokens.typography.fontFamily.heading.split(',').map(f => f.trim()),
        mono: tokens.typography.fontFamily.mono.split(',').map(f => f.trim()),
      },
      
      fontSize: tokens.typography.fontSize,
      fontWeight: tokens.typography.fontWeight,
      lineHeight: tokens.typography.lineHeight,
      letterSpacing: tokens.typography.letterSpacing,
      
      // ═══════════════════════════════════════════════════════
      // SPACING
      // ═══════════════════════════════════════════════════════
      spacing: tokens.spacing,
      
      // ═══════════════════════════════════════════════════════
      // BORDER RADIUS
      // ═══════════════════════════════════════════════════════
      borderRadius: tokens.borderRadius,
      
      // ═══════════════════════════════════════════════════════
      // SHADOWS
      // ═══════════════════════════════════════════════════════
      boxShadow: tokens.shadows,
      
      // ═══════════════════════════════════════════════════════
      // TRANSITIONS
      // ═══════════════════════════════════════════════════════
      transitionDuration: tokens.transitions.duration,
      transitionTimingFunction: tokens.transitions.timing,
      
      // ═══════════════════════════════════════════════════════
      // Z-INDEX
      // ═══════════════════════════════════════════════════════
      zIndex: tokens.zIndex,
      
      // ═══════════════════════════════════════════════════════
      // BREAKPOINTS
      // ═══════════════════════════════════════════════════════
      screens: tokens.breakpoints,
      
      // ═══════════════════════════════════════════════════════
      // ANIMATIONS (Microsoft-style subtle animations)
      // ═══════════════════════════════════════════════════════
      keyframes: {
        // Fade in
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        // Slide in from top
        slideInTop: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        // Slide in from bottom
        slideInBottom: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        // Slide in from left
        slideInLeft: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        // Slide in from right
        slideInRight: {
          '0%': { transform: 'translateX(10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        // Scale in
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        // Pulse (for loading states)
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        // Shimmer (for skeleton loading)
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        // Blob animation (for background)
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        // Slide in animation
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },

      animation: {
        fadeIn: 'fadeIn 200ms ease-out',
        slideInTop: 'slideInTop 200ms ease-out',
        slideInBottom: 'slideInBottom 200ms ease-out',
        slideInLeft: 'slideInLeft 200ms ease-out',
        slideInRight: 'slideInRight 200ms ease-out',
        slideIn: 'slideIn 300ms ease-out',
        scaleIn: 'scaleIn 200ms ease-out',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        shimmer: 'shimmer 2s linear infinite',
        blob: 'blob 7s infinite',
      },

      // Animation delays for staggered effects
      animationDelay: {
        '2000': '2s',
        '4000': '4s',
      },
    },
  },
  
  plugins: [],
};

/**
 * 🎓 HOW TO USE:
 * 
 * Now you can use these classes in your components:
 * 
 * COLORS:
 * <div className="bg-primary-500 text-neutral-0">
 * <div className="bg-success-50 text-success-700">
 * 
 * SPACING:
 * <div className="p-4 m-8"> // padding: 16px, margin: 32px
 * 
 * TYPOGRAPHY:
 * <h1 className="font-heading text-3xl font-semibold">
 * <p className="font-sans text-base">
 * 
 * SHADOWS:
 * <div className="shadow-md hover:shadow-lg">
 * 
 * ANIMATIONS:
 * <div className="animate-fadeIn">
 * <div className="animate-slideInTop">
 * 
 * RESPONSIVE:
 * <div className="text-sm md:text-base lg:text-lg">
 */