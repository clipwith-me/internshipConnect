import { redis, cacheKeys } from '../config/redis.js';

/**
 * Distributed Rate Limiting Middleware
 *
 * Redis-based rate limiting for horizontal scaling
 * Target: Handle 1M+ RPS with fair resource allocation
 * Prevents abuse and ensures system stability
 */

/**
 * Create distributed rate limiter
 * @param {Object} options - Rate limiting options
 * @param {number} options.windowMs - Time window in milliseconds (default: 60000 = 1 minute)
 * @param {number} options.max - Maximum requests per window (default: 100)
 * @param {string} options.keyPrefix - Redis key prefix (default: 'ratelimit')
 * @param {Function} options.keyGenerator - Custom key generator function
 * @param {Function} options.handler - Custom rate limit exceeded handler
 * @param {boolean} options.skipSuccessfulRequests - Don't count successful requests (default: false)
 * @param {boolean} options.skipFailedRequests - Don't count failed requests (default: false)
 * @returns {Function} Express middleware
 */
export const createRateLimiter = (options = {}) => {
  const {
    windowMs = 60000, // 1 minute
    max = 100,
    keyPrefix = 'ratelimit',
    keyGenerator = defaultKeyGenerator,
    handler = defaultHandler,
    skipSuccessfulRequests = false,
    skipFailedRequests = false
  } = options;

  return async (req, res, next) => {
    try {
      // Generate unique key for this client
      const identifier = keyGenerator(req);
      const key = `${keyPrefix}:${identifier}`;

      // Increment request count
      const requests = await redis.incr(key);

      // Set expiry on first request
      if (requests === 1) {
        await redis.pexpire(key, windowMs);
      }

      // Get TTL for rate limit headers
      const ttl = await redis.pttl(key);
      const resetTime = Date.now() + ttl;

      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, max - requests));
      res.setHeader('X-RateLimit-Reset', new Date(resetTime).toISOString());

      // Check if limit exceeded
      if (requests > max) {
        return handler(req, res, next);
      }

      // Handle skip options
      if (skipSuccessfulRequests || skipFailedRequests) {
        const originalJson = res.json.bind(res);

        res.json = async function (data) {
          const shouldSkip =
            (skipSuccessfulRequests && res.statusCode < 400) ||
            (skipFailedRequests && res.statusCode >= 400);

          if (shouldSkip) {
            try {
              await redis.decr(key);
            } catch (error) {
              console.error('Rate limit decrement error:', error.message);
            }
          }

          return originalJson(data);
        };
      }

      next();
    } catch (error) {
      console.error('Rate limit middleware error:', error.message);
      // Graceful degradation - allow request if Redis fails
      next();
    }
  };
};

/**
 * Default key generator - uses user ID or IP address
 * @param {Request} req - Express request object
 * @returns {string} Unique identifier
 */
function defaultKeyGenerator(req) {
  // Prefer user ID for authenticated requests
  if (req.user?.id) {
    return `user:${req.user.id}`;
  }

  // Fall back to IP address
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  return `ip:${ip}`;
}

/**
 * Default rate limit exceeded handler
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {Function} next - Express next function
 */
function defaultHandler(req, res, next) {
  return res.status(429).json({
    success: false,
    message: 'Too many requests, please try again later.',
    error: 'Rate limit exceeded'
  });
}

/**
 * Preset rate limiters for different endpoints
 */

/**
 * General API rate limiter
 * 100 requests per minute per user/IP
 */
export const apiLimiter = createRateLimiter({
  windowMs: 60000, // 1 minute
  max: 100,
  keyPrefix: 'api'
});

/**
 * Strict rate limiter for authentication endpoints
 * 5 login attempts per minute to prevent brute force
 */
export const authLimiter = createRateLimiter({
  windowMs: 60000, // 1 minute
  max: 5,
  keyPrefix: 'auth',
  skipSuccessfulRequests: true, // Only count failed login attempts
  handler: (req, res) => {
    return res.status(429).json({
      success: false,
      message: 'Too many login attempts. Please try again later.',
      error: 'Authentication rate limit exceeded'
    });
  }
});

/**
 * Lenient rate limiter for read-only endpoints
 * 1000 requests per minute for browsing
 */
export const readLimiter = createRateLimiter({
  windowMs: 60000, // 1 minute
  max: 1000,
  keyPrefix: 'read'
});

/**
 * Strict rate limiter for write operations
 * 20 requests per minute to prevent spam
 */
export const writeLimiter = createRateLimiter({
  windowMs: 60000, // 1 minute
  max: 20,
  keyPrefix: 'write',
  handler: (req, res) => {
    return res.status(429).json({
      success: false,
      message: 'Too many actions. Please slow down.',
      error: 'Write rate limit exceeded'
    });
  }
});

/**
 * Very strict rate limiter for expensive operations
 * 5 requests per hour for analytics, reports, etc.
 */
export const expensiveLimiter = createRateLimiter({
  windowMs: 3600000, // 1 hour
  max: 5,
  keyPrefix: 'expensive',
  handler: (req, res) => {
    return res.status(429).json({
      success: false,
      message: 'This operation is rate limited. Please try again later.',
      error: 'Expensive operation rate limit exceeded'
    });
  }
});

/**
 * Premium rate limiter for Pro users
 * 10x higher limits for paying customers
 */
export const premiumLimiter = createRateLimiter({
  windowMs: 60000, // 1 minute
  max: 1000,
  keyPrefix: 'premium',
  keyGenerator: (req) => {
    // Check if user has premium/pro subscription
    const isPremium =
      req.user?.subscription?.plan === 'premium' ||
      req.user?.subscription?.plan === 'pro';

    if (isPremium) {
      return `premium:${req.user.id}`;
    }

    // Fall back to standard rate limit
    return defaultKeyGenerator(req);
  }
});

/**
 * Admin rate limiter
 * Higher limits for admin operations
 */
export const adminLimiter = createRateLimiter({
  windowMs: 60000, // 1 minute
  max: 500,
  keyPrefix: 'admin'
});

/**
 * File upload rate limiter
 * 10 uploads per hour to prevent storage abuse
 */
export const uploadLimiter = createRateLimiter({
  windowMs: 3600000, // 1 hour
  max: 10,
  keyPrefix: 'upload',
  handler: (req, res) => {
    return res.status(429).json({
      success: false,
      message: 'Upload limit exceeded. Please try again later.',
      error: 'File upload rate limit exceeded'
    });
  }
});

/**
 * Search rate limiter
 * 100 searches per minute to prevent scraping
 */
export const searchLimiter = createRateLimiter({
  windowMs: 60000, // 1 minute
  max: 100,
  keyPrefix: 'search',
  handler: (req, res) => {
    return res.status(429).json({
      success: false,
      message: 'Too many search requests. Please slow down.',
      error: 'Search rate limit exceeded'
    });
  }
});

/**
 * Get current rate limit status for a user
 * @param {string} identifier - User ID or IP address
 * @param {string} keyPrefix - Rate limit key prefix
 * @returns {Promise<Object>} Rate limit status
 */
export async function getRateLimitStatus(identifier, keyPrefix = 'api') {
  try {
    const key = `${keyPrefix}:${identifier}`;
    const requests = await redis.get(key);
    const ttl = await redis.pttl(key);

    return {
      requests: parseInt(requests) || 0,
      resetAt: ttl > 0 ? new Date(Date.now() + ttl) : null
    };
  } catch (error) {
    console.error('Get rate limit status error:', error.message);
    return {
      requests: 0,
      resetAt: null
    };
  }
}

/**
 * Clear rate limit for a specific user (admin function)
 * @param {string} identifier - User ID or IP address
 * @param {string} keyPrefix - Rate limit key prefix
 * @returns {Promise<boolean>} Success status
 */
export async function clearRateLimit(identifier, keyPrefix = 'api') {
  try {
    const key = `${keyPrefix}:${identifier}`;
    await redis.del(key);
    return true;
  } catch (error) {
    console.error('Clear rate limit error:', error.message);
    return false;
  }
}

export default {
  createRateLimiter,
  apiLimiter,
  authLimiter,
  readLimiter,
  writeLimiter,
  expensiveLimiter,
  premiumLimiter,
  adminLimiter,
  uploadLimiter,
  searchLimiter,
  getRateLimitStatus,
  clearRateLimit
};
