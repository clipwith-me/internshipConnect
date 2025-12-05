/**
 * Health Check and Monitoring Middleware
 *
 * Provides comprehensive health status for load balancers,
 * Kubernetes liveness/readiness probes, and monitoring systems
 *
 * Endpoints:
 * - GET /health - Basic health check
 * - GET /health/liveness - Kubernetes liveness probe
 * - GET /health/readiness - Kubernetes readiness probe
 * - GET /health/detailed - Detailed system status (admin only)
 */

import mongoose from 'mongoose';
import { isCacheAvailable, getCacheStats } from '../config/redis.js';
import { getAllCircuitBreakerStates } from '../utils/circuitBreaker.js';

/**
 * Basic health check - always returns 200 if server is running
 * Used by load balancers to detect if instance is alive
 */
export const healthCheck = async (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
};

/**
 * Liveness probe - checks if application is running
 * Returns 200 if alive, 503 if dead
 * Kubernetes will restart pod if this fails repeatedly
 */
export const livenessProbe = async (req, res) => {
  // Just check if we can respond
  const isAlive = true;

  if (isAlive) {
    res.status(200).json({
      status: 'alive',
      timestamp: new Date().toISOString()
    });
  } else {
    res.status(503).json({
      status: 'dead',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Readiness probe - checks if application is ready to serve traffic
 * Returns 200 if ready, 503 if not ready
 * Kubernetes will remove pod from service if this fails
 */
export const readinessProbe = async (req, res) => {
  const checks = {
    database: false,
    cache: false
  };

  try {
    // Check MongoDB connection
    checks.database = mongoose.connection.readyState === 1; // 1 = connected

    // Check Redis connection (optional - graceful degradation)
    checks.cache = await isCacheAvailable();

    // Service is ready if database is connected
    // Redis is optional (we degrade gracefully if unavailable)
    const isReady = checks.database;

    if (isReady) {
      res.status(200).json({
        status: 'ready',
        checks,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(503).json({
        status: 'not_ready',
        checks,
        reason: !checks.database ? 'Database not connected' : 'Unknown',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    res.status(503).json({
      status: 'error',
      checks,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Detailed health check - comprehensive system status
 * Should be admin-only in production
 */
export const detailedHealthCheck = async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.APP_VERSION || '1.0.0',

      // System resources
      system: {
        uptime: process.uptime(),
        memory: {
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB',
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
          external: Math.round(process.memoryUsage().external / 1024 / 1024) + ' MB',
          rss: Math.round(process.memoryUsage().rss / 1024 / 1024) + ' MB'
        },
        cpu: process.cpuUsage(),
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch
      },

      // Database status
      database: {
        status: 'unknown',
        readyState: mongoose.connection.readyState,
        host: mongoose.connection.host,
        name: mongoose.connection.name
      },

      // Cache status
      cache: {
        available: false,
        stats: null
      },

      // Circuit breakers
      circuitBreakers: null,

      // Application metrics
      metrics: {
        requestsPerSecond: 0, // Would be calculated from actual metrics
        averageResponseTime: 0, // Would be calculated from actual metrics
        errorRate: 0 // Would be calculated from actual metrics
      }
    };

    // Check MongoDB
    if (mongoose.connection.readyState === 1) {
      health.database.status = 'connected';

      // Get database stats
      try {
        const admin = mongoose.connection.db.admin();
        const serverStatus = await admin.serverStatus();

        health.database.collections = await mongoose.connection.db
          .listCollections()
          .toArray()
          .then((collections) => collections.length);

        health.database.connections = serverStatus.connections;
        health.database.uptime = serverStatus.uptime;
      } catch (error) {
        health.database.statsError = error.message;
      }
    } else {
      health.database.status = 'disconnected';
      health.status = 'degraded';
    }

    // Check Redis
    try {
      health.cache.available = await isCacheAvailable();
      if (health.cache.available) {
        health.cache.stats = await getCacheStats();
      }
    } catch (error) {
      health.cache.error = error.message;
    }

    // Get circuit breaker states
    try {
      health.circuitBreakers = getAllCircuitBreakerStates();
    } catch (error) {
      health.circuitBreakers = { error: error.message };
    }

    // Determine overall status
    if (health.database.status !== 'connected') {
      health.status = 'unhealthy';
    } else if (!health.cache.available) {
      health.status = 'degraded'; // Can still function without cache
    }

    const statusCode = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 200 : 503;

    res.status(statusCode).json(health);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Startup probe - checks if application has finished starting
 * Used by Kubernetes to delay liveness/readiness checks during slow startups
 */
export const startupProbe = async (req, res) => {
  // Check if app has completed initialization
  const isStarted =
    mongoose.connection.readyState === 1 && // Database connected
    process.uptime() > 5; // At least 5 seconds uptime

  if (isStarted) {
    res.status(200).json({
      status: 'started',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  } else {
    res.status(503).json({
      status: 'starting',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Metrics endpoint for Prometheus scraping
 * Returns metrics in Prometheus format
 */
export const metricsEndpoint = async (req, res) => {
  try {
    const metrics = [];

    // System metrics
    metrics.push(`# HELP nodejs_heap_size_total_bytes Total heap size`);
    metrics.push(`# TYPE nodejs_heap_size_total_bytes gauge`);
    metrics.push(`nodejs_heap_size_total_bytes ${process.memoryUsage().heapTotal}`);

    metrics.push(`# HELP nodejs_heap_size_used_bytes Used heap size`);
    metrics.push(`# TYPE nodejs_heap_size_used_bytes gauge`);
    metrics.push(`nodejs_heap_size_used_bytes ${process.memoryUsage().heapUsed}`);

    metrics.push(`# HELP nodejs_process_uptime_seconds Process uptime`);
    metrics.push(`# TYPE nodejs_process_uptime_seconds gauge`);
    metrics.push(`nodejs_process_uptime_seconds ${process.uptime()}`);

    // Database metrics
    metrics.push(`# HELP mongodb_connection_status MongoDB connection status`);
    metrics.push(`# TYPE mongodb_connection_status gauge`);
    metrics.push(`mongodb_connection_status ${mongoose.connection.readyState}`);

    // Cache metrics
    const cacheAvailable = await isCacheAvailable();
    metrics.push(`# HELP redis_available Redis availability`);
    metrics.push(`# TYPE redis_available gauge`);
    metrics.push(`redis_available ${cacheAvailable ? 1 : 0}`);

    // Circuit breaker metrics
    const circuitBreakers = getAllCircuitBreakerStates();
    Object.entries(circuitBreakers).forEach(([name, state]) => {
      const stateValue = state.state === 'CLOSED' ? 0 : state.state === 'HALF_OPEN' ? 1 : 2;
      metrics.push(`# HELP circuit_breaker_${name} Circuit breaker state`);
      metrics.push(`# TYPE circuit_breaker_${name} gauge`);
      metrics.push(`circuit_breaker_${name} ${stateValue}`);

      metrics.push(`# HELP circuit_breaker_${name}_failures Failure count`);
      metrics.push(`# TYPE circuit_breaker_${name}_failures gauge`);
      metrics.push(`circuit_breaker_${name}_failures ${state.stats.failedRequests}`);
    });

    res.setHeader('Content-Type', 'text/plain');
    res.send(metrics.join('\n'));
  } catch (error) {
    res.status(500).send(`# Error generating metrics: ${error.message}`);
  }
};

/**
 * Graceful shutdown handler
 * Closes database connections and stops accepting new requests
 */
export const gracefulShutdown = async (signal) => {
  console.log(`\n⚠️ Received ${signal}, starting graceful shutdown...`);

  // Stop accepting new connections (handled by server.close())
  // Give existing requests time to complete
  const shutdownTimeout = setTimeout(() => {
    console.error('❌ Forced shutdown after timeout');
    process.exit(1);
  }, 30000); // 30 second timeout

  try {
    // Close database connection
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('✅ MongoDB connection closed');
    }

    // Close Redis connection
    // Note: redis.quit() would be called here if we imported redis

    clearTimeout(shutdownTimeout);
    console.log('✅ Graceful shutdown complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    clearTimeout(shutdownTimeout);
    process.exit(1);
  }
};

/**
 * Setup shutdown handlers
 */
export function setupShutdownHandlers() {
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  // Handle uncaught errors
  process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    gracefulShutdown('UNCAUGHT_EXCEPTION');
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    // Don't shutdown on unhandled rejection, just log it
  });
}

export default {
  healthCheck,
  livenessProbe,
  readinessProbe,
  detailedHealthCheck,
  startupProbe,
  metricsEndpoint,
  gracefulShutdown,
  setupShutdownHandlers
};
