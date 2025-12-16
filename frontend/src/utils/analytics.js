/**
 * Analytics Utility for InternshipConnect
 *
 * This utility provides a simple interface for tracking user events.
 * It's designed to work with Google Analytics, Mixpanel, or any analytics service.
 *
 * Usage:
 * import { trackEvent, trackPageView } from './utils/analytics';
 *
 * trackEvent('Button Clicked', { button: 'Sign Up', location: 'Hero' });
 * trackPageView('/landing');
 */

// Initialize analytics (add your GA tracking ID here)
export const ANALYTICS_ID = import.meta.env.VITE_ANALYTICS_ID || '';

/**
 * Initialize Google Analytics
 * Add this to your index.html or call it on app mount
 */
export function initAnalytics() {
  if (!ANALYTICS_ID) {
    console.warn('Analytics ID not configured. Set VITE_ANALYTICS_ID in your .env file');
    return;
  }

  // Google Analytics 4 initialization
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', ANALYTICS_ID, {
      page_path: window.location.pathname
    });
  }
}

/**
 * Track custom events
 * @param {string} eventName - Name of the event (e.g., 'Button Clicked')
 * @param {object} properties - Additional event properties
 */
export function trackEvent(eventName, properties = {}) {
  // Development mode - log to console
  if (import.meta.env.DEV) {
    console.log('📊 Analytics Event:', eventName, properties);
    return;
  }

  // Google Analytics
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, properties);
  }

  // Mixpanel (if configured)
  if (typeof window !== 'undefined' && window.mixpanel) {
    window.mixpanel.track(eventName, properties);
  }

  // Add other analytics services here
}

/**
 * Track page views
 * @param {string} path - Page path
 */
export function trackPageView(path) {
  // Development mode
  if (import.meta.env.DEV) {
    console.log('📄 Page View:', path);
    return;
  }

  // Google Analytics
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', ANALYTICS_ID, {
      page_path: path
    });
  }

  // Mixpanel
  if (typeof window !== 'undefined' && window.mixpanel) {
    window.mixpanel.track('Page View', { path });
  }
}

/**
 * Track user identification (when user logs in)
 * @param {string} userId - User ID
 * @param {object} traits - User traits (email, name, etc.)
 */
export function identifyUser(userId, traits = {}) {
  if (import.meta.env.DEV) {
    console.log('👤 User Identified:', userId, traits);
    return;
  }

  // Google Analytics
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('set', { user_id: userId });
  }

  // Mixpanel
  if (typeof window !== 'undefined' && window.mixpanel) {
    window.mixpanel.identify(userId);
    window.mixpanel.people.set(traits);
  }
}

/**
 * Track conversions (signups, upgrades, etc.)
 * @param {string} conversionType - Type of conversion
 * @param {number} value - Monetary value (optional)
 */
export function trackConversion(conversionType, value = 0) {
  trackEvent('Conversion', {
    conversion_type: conversionType,
    value: value
  });
}

/**
 * Common event tracking helpers
 */
export const analytics = {
  // Landing page events
  landingPage: {
    waitlistSignup: (email) => trackEvent('Waitlist Signup', { email }),
    ctaClick: (cta) => trackEvent('CTA Clicked', { cta }),
    pricingView: (plan) => trackEvent('Pricing Viewed', { plan }),
    faqExpanded: (question) => trackEvent('FAQ Expanded', { question })
  },

  // Auth events
  auth: {
    signup: (role) => trackEvent('Signup Completed', { role }),
    login: (role) => trackEvent('Login', { role }),
    logout: () => trackEvent('Logout')
  },

  // Application events
  application: {
    submitted: (internshipId) => trackEvent('Application Submitted', { internship_id: internshipId }),
    viewed: (internshipId) => trackEvent('Internship Viewed', { internship_id: internshipId }),
    saved: (internshipId) => trackEvent('Internship Saved', { internship_id: internshipId })
  },

  // Resume events
  resume: {
    created: () => trackEvent('Resume Created'),
    downloaded: (resumeId) => trackEvent('Resume Downloaded', { resume_id: resumeId }),
    optimized: () => trackEvent('Resume Optimized')
  },

  // Subscription events
  subscription: {
    upgraded: (plan) => trackConversion('Subscription Upgrade', getPlanValue(plan)),
    downgraded: (plan) => trackEvent('Subscription Downgraded', { plan }),
    cancelled: (plan) => trackEvent('Subscription Cancelled', { plan })
  }
};

// Helper function to get monetary value of plans
function getPlanValue(plan) {
  const values = {
    free: 0,
    pro: 9.99,
    enterprise: 499
  };
  return values[plan.toLowerCase()] || 0;
}

export default analytics;
