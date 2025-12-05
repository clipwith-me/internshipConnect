import Redis from 'ioredis';

/**
 * Redis Configuration for Scalability
 *
 * Supports both single instance (development) and cluster mode (production)
 * Target: Handle 800M users with 1M+ RPS through distributed caching
 */

const isDevelopment = process.env.NODE_ENV !== 'production';

// Redis Cluster Configuration (Production)
const redisCluster = process.env.REDIS_CLUSTER_ENABLED === 'true'
  ? new Redis.Cluster(
      [
        { host: process.env.REDIS_NODE_1 || 'redis-node-1', port: 6379 },
        { host: process.env.REDIS_NODE_2 || 'redis-node-2', port: 6379 },
        { host: process.env.REDIS_NODE_3 || 'redis-node-3', port: 6379 }
      ],
      {
        redisOptions: {
          password: process.env.REDIS_PASSWORD,
          tls: process.env.NODE_ENV === 'production' ? {} : undefined,
          connectTimeout: 10000,
          retryStrategy: (times) => {
            const delay = Math.min(times * 50, 2000);
            return delay;
          }
        },
        enableReadyCheck: true,
        maxRetriesPerRequest: 3,
        retryDelayOnFailover: 100,
        scaleReads: 'slave', // Read from replicas
        clusterRetryStrategy: (times) => {
          const delay = Math.min(100 * Math.pow(2, times), 2000);
          return delay;
        }
      }
    )
  : null;

// Single Redis Instance (Development)
const redisSingle = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
  db: process.env.REDIS_DB || 0,
  retryStrategy: (times) => {
    if (times > 3) {
      console.error('❌ Redis connection failed after 3 retries');
      return null; // Stop retrying in development
    }
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  // Graceful degradation - don't crash app if Redis unavailable in dev
  lazyConnect: isDevelopment,
  enableOfflineQueue: false
});

// Use cluster in production, single instance in development
export const redis = redisCluster || redisSingle;

// Connection event handlers
redis.on('connect', () => {
  console.log('✅ Redis connected');
});

redis.on('ready', () => {
  console.log('✅ Redis ready for commands');
});

redis.on('error', (err) => {
  if (isDevelopment) {
    console.warn('⚠️ Redis error (development mode - gracefully degraded):', err.message);
  } else {
    console.error('❌ Redis error (production):', err);
  }
});

redis.on('close', () => {
  console.warn('⚠️ Redis connection closed');
});

redis.on('reconnecting', () => {
  console.log('🔄 Redis reconnecting...');
});

/**
 * Cache Helper Functions
 */

/**
 * Get cached value with automatic JSON parsing
 * @param {string} key - Cache key
 * @returns {Promise<any|null>} Parsed value or null
 */
export async function getCache(key) {
  try {
    const value = await redis.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error(`Cache GET error for key ${key}:`, error.message);
    return null; // Graceful degradation
  }
}

/**
 * Set cached value with automatic JSON stringification
 * @param {string} key - Cache key
 * @param {any} value - Value to cache
 * @param {number} ttl - Time to live in seconds (default: 300 = 5 minutes)
 * @returns {Promise<boolean>} Success status
 */
export async function setCache(key, value, ttl = 300) {
  try {
    const serialized = JSON.stringify(value);
    await redis.setex(key, ttl, serialized);
    return true;
  } catch (error) {
    console.error(`Cache SET error for key ${key}:`, error.message);
    return false; // Graceful degradation
  }
}

/**
 * Delete cached value(s)
 * @param {string|string[]} keys - Cache key(s) to delete
 * @returns {Promise<number>} Number of keys deleted
 */
export async function deleteCache(keys) {
  try {
    const keyArray = Array.isArray(keys) ? keys : [keys];
    const result = await redis.del(...keyArray);
    return result;
  } catch (error) {
    console.error(`Cache DELETE error:`, error.message);
    return 0;
  }
}

/**
 * Check if cache is available
 * @returns {Promise<boolean>} Cache availability status
 */
export async function isCacheAvailable() {
  try {
    await redis.ping();
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get cache statistics
 * @returns {Promise<object>} Cache statistics
 */
export async function getCacheStats() {
  try {
    const info = await redis.info('stats');
    const keyspace = await redis.info('keyspace');

    return {
      status: 'connected',
      info,
      keyspace
    };
  } catch (error) {
    return {
      status: 'unavailable',
      error: error.message
    };
  }
}

/**
 * Clear all cache (use with caution!)
 * @returns {Promise<boolean>} Success status
 */
export async function clearAllCache() {
  try {
    if (isDevelopment) {
      await redis.flushdb(); // Only current database in dev
      console.log('🧹 Cache cleared (development database)');
    } else {
      // In production, require explicit confirmation
      console.warn('⚠️ clearAllCache() called in production - skipping for safety');
      return false;
    }
    return true;
  } catch (error) {
    console.error('Cache FLUSH error:', error.message);
    return false;
  }
}

/**
 * Cache key generators for consistent naming
 */
export const cacheKeys = {
  user: (userId) => `user:${userId}`,
  studentProfile: (userId) => `student:profile:${userId}`,
  organizationProfile: (userId) => `org:profile:${userId}`,
  internship: (internshipId) => `internship:${internshipId}`,
  internshipList: (orgId, page = 1) => `internships:org:${orgId}:page:${page}`,
  application: (applicationId) => `application:${applicationId}`,
  studentApplications: (studentId) => `applications:student:${studentId}`,
  stats: (type, id) => `stats:${type}:${id}`,
  search: (query, filters) => `search:${query}:${JSON.stringify(filters)}`,
  session: (sessionId) => `session:${sessionId}`,
  rateLimit: (identifier) => `ratelimit:${identifier}`
};

/**
 * Multi-layer cache TTL strategy
 * - Hot data (user sessions): 15 minutes
 * - Warm data (profiles, internships): 5 minutes
 * - Cold data (stats, search): 1 minute
 */
export const cacheTTL = {
  session: 900,        // 15 minutes (hot)
  profile: 300,        // 5 minutes (warm)
  internship: 300,     // 5 minutes (warm)
  application: 180,    // 3 minutes (warm)
  stats: 60,           // 1 minute (cold)
  search: 60,          // 1 minute (cold)
  rateLimit: 60        // 1 minute (rate limiting window)
};

export default redis;
