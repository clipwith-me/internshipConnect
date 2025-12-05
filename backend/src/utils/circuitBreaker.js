/**
 * Circuit Breaker Pattern Implementation
 *
 * Prevents cascading failures and provides graceful degradation
 * Target: 99.99% uptime with automatic failover
 *
 * States:
 * - CLOSED: Normal operation, requests flow through
 * - OPEN: Failure threshold exceeded, requests fail fast
 * - HALF_OPEN: Testing if service recovered
 */

class CircuitBreaker {
  /**
   * @param {Object} options - Circuit breaker configuration
   * @param {number} options.failureThreshold - Number of failures before opening circuit (default: 5)
   * @param {number} options.successThreshold - Number of successes to close circuit (default: 2)
   * @param {number} options.timeout - Request timeout in ms (default: 10000)
   * @param {number} options.resetTimeout - Time before trying half-open in ms (default: 60000)
   * @param {string} options.name - Circuit breaker name for logging
   */
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.successThreshold = options.successThreshold || 2;
    this.timeout = options.timeout || 10000;
    this.resetTimeout = options.resetTimeout || 60000;
    this.name = options.name || 'CircuitBreaker';

    // State
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failureCount = 0;
    this.successCount = 0;
    this.nextAttempt = Date.now();

    // Statistics
    this.stats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      rejectedRequests: 0,
      timeouts: 0,
      lastFailureTime: null,
      lastSuccessTime: null
    };
  }

  /**
   * Execute function with circuit breaker protection
   * @param {Function} fn - Async function to execute
   * @param {Function} fallback - Fallback function if circuit is open
   * @returns {Promise<any>} Function result or fallback result
   */
  async execute(fn, fallback = null) {
    this.stats.totalRequests++;

    // Circuit is OPEN - fail fast
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        this.stats.rejectedRequests++;

        if (fallback) {
          console.warn(`⚠️ [${this.name}] Circuit OPEN - using fallback`);
          return fallback();
        }

        const error = new Error(`Circuit breaker is OPEN for ${this.name}`);
        error.code = 'CIRCUIT_OPEN';
        throw error;
      }

      // Time to try again - move to HALF_OPEN
      this.state = 'HALF_OPEN';
      this.successCount = 0;
      console.log(`🔄 [${this.name}] Circuit HALF_OPEN - testing service`);
    }

    try {
      // Execute with timeout
      const result = await this.executeWithTimeout(fn);

      // Success - update state
      this.onSuccess();

      return result;
    } catch (error) {
      // Failure - update state
      this.onFailure(error);

      // Use fallback if available
      if (fallback) {
        console.warn(`⚠️ [${this.name}] Request failed - using fallback:`, error.message);
        return fallback();
      }

      throw error;
    }
  }

  /**
   * Execute function with timeout
   * @param {Function} fn - Function to execute
   * @returns {Promise<any>} Function result
   */
  async executeWithTimeout(fn) {
    return Promise.race([
      fn(),
      new Promise((_, reject) => {
        setTimeout(() => {
          this.stats.timeouts++;
          reject(new Error(`Request timeout after ${this.timeout}ms`));
        }, this.timeout);
      })
    ]);
  }

  /**
   * Handle successful request
   */
  onSuccess() {
    this.stats.successfulRequests++;
    this.stats.lastSuccessTime = new Date();
    this.failureCount = 0;

    if (this.state === 'HALF_OPEN') {
      this.successCount++;

      if (this.successCount >= this.successThreshold) {
        this.state = 'CLOSED';
        console.log(`✅ [${this.name}] Circuit CLOSED - service recovered`);
      }
    }
  }

  /**
   * Handle failed request
   * @param {Error} error - Error object
   */
  onFailure(error) {
    this.stats.failedRequests++;
    this.stats.lastFailureTime = new Date();
    this.failureCount++;
    this.successCount = 0; // Reset success count on any failure

    console.error(`❌ [${this.name}] Request failed:`, error.message);

    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.resetTimeout;

      console.error(
        `🔴 [${this.name}] Circuit OPEN - ${this.failureCount} failures, retry in ${this.resetTimeout}ms`
      );
    }
  }

  /**
   * Get current circuit breaker state
   * @returns {Object} Current state and statistics
   */
  getState() {
    return {
      name: this.name,
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      nextAttempt: this.state === 'OPEN' ? new Date(this.nextAttempt) : null,
      stats: { ...this.stats }
    };
  }

  /**
   * Reset circuit breaker to CLOSED state
   */
  reset() {
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.successCount = 0;
    this.nextAttempt = Date.now();
    console.log(`🔄 [${this.name}] Circuit breaker manually reset`);
  }

  /**
   * Force circuit breaker to OPEN state
   */
  forceOpen() {
    this.state = 'OPEN';
    this.nextAttempt = Date.now() + this.resetTimeout;
    console.warn(`⚠️ [${this.name}] Circuit breaker manually opened`);
  }
}

/**
 * Create circuit breakers for external services
 */

// MongoDB Circuit Breaker
export const mongoBreaker = new CircuitBreaker({
  name: 'MongoDB',
  failureThreshold: 5,
  successThreshold: 2,
  timeout: 5000,
  resetTimeout: 30000 // Retry after 30 seconds
});

// Redis Circuit Breaker
export const redisBreaker = new CircuitBreaker({
  name: 'Redis',
  failureThreshold: 3,
  successThreshold: 2,
  timeout: 3000,
  resetTimeout: 10000 // Retry after 10 seconds (Redis fails fast)
});

// SMTP Circuit Breaker
export const smtpBreaker = new CircuitBreaker({
  name: 'SMTP',
  failureThreshold: 5,
  successThreshold: 2,
  timeout: 10000,
  resetTimeout: 60000 // Retry after 1 minute
});

// Stripe Circuit Breaker
export const stripeBreaker = new CircuitBreaker({
  name: 'Stripe',
  failureThreshold: 3,
  successThreshold: 2,
  timeout: 15000,
  resetTimeout: 120000 // Retry after 2 minutes
});

// Cloudinary Circuit Breaker
export const cloudinaryBreaker = new CircuitBreaker({
  name: 'Cloudinary',
  failureThreshold: 3,
  successThreshold: 2,
  timeout: 20000,
  resetTimeout: 60000 // Retry after 1 minute
});

/**
 * Get status of all circuit breakers
 * @returns {Object} Status of all circuit breakers
 */
export function getAllCircuitBreakerStates() {
  return {
    mongo: mongoBreaker.getState(),
    redis: redisBreaker.getState(),
    smtp: smtpBreaker.getState(),
    stripe: stripeBreaker.getState(),
    cloudinary: cloudinaryBreaker.getState()
  };
}

/**
 * Reset all circuit breakers
 */
export function resetAllCircuitBreakers() {
  mongoBreaker.reset();
  redisBreaker.reset();
  smtpBreaker.reset();
  stripeBreaker.reset();
  cloudinaryBreaker.reset();
  console.log('✅ All circuit breakers reset');
}

export default CircuitBreaker;
