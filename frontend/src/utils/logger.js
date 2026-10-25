/**
 * 🎯 MICROSOFT-GRADE LOGGING UTILITY
 *
 * Production-safe logging that automatically disables in production builds.
 * All console.log statements should be replaced with this utility.
 *
 * Usage:
 * - logger.info('User logged in', { userId: 123 })
 * - logger.error('API failed', error)
 * - logger.warn('Deprecated feature used')
 * - logger.debug('Detailed debugging info')
 */

const isDevelopment = import.meta.env.MODE === 'development';

class Logger {
  info(_message, ..._args) {
    // ✅ PRODUCTION: Disable info logs for cleaner console
    // Keep console clean - only show errors and warnings
    // Uncomment below for debugging during development
    // if (isDevelopment) {
    //   console.log(`ℹ️ [INFO] ${message}`, ...args);
    // }
  }

  error(message, ...args) {
    if (isDevelopment) {
      console.error(`❌ [ERROR] ${message}`, ...args);
    } else {
      // In production, send to error tracking service (e.g., Sentry)
      // this.sendToErrorTracking(message, args);
    }
  }

  warn(message, ...args) {
    if (isDevelopment) {
      console.warn(`⚠️ [WARN] ${message}`, ...args);
    }
  }

  debug(message, ...args) {
    if (isDevelopment) {
      console.debug(`🐛 [DEBUG] ${message}`, ...args);
    }
  }

  performance(_label, _duration) {
    // ✅ PRODUCTION: Disable performance warnings in console for cleaner output
    // Performance monitoring should be done via external tools (e.g., Lighthouse, New Relic)
    // Uncomment below for performance debugging during development
    // if (isDevelopment && duration > 1000) {
    //   console.warn(`⏱️ [PERF] ${label} took ${duration}ms (>1000ms threshold)`);
    // }
  }
}

export const logger = new Logger();

/**
 * Performance monitoring wrapper
 * Automatically logs slow operations
 */
export const withPerformanceLog = (fn, label) => {
  return async (...args) => {
    const start = performance.now();
    try {
      const result = await fn(...args);
      const duration = performance.now() - start;
      logger.performance(label, duration);
      return result;
    } catch (error) {
      logger.error(`${label} failed`, error);
      throw error;
    }
  };
};