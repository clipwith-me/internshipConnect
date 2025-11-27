// backend/src/config/env.config.js

/**
 * ✅ PRODUCTION-GRADE ENVIRONMENT CONFIGURATION
 *
 * Safe environment variable loading with fallback values
 * Ensures the backend never crashes due to missing configuration
 *
 * Features:
 * - Lazy initialization (only load when needed)
 * - Fallback values for optional services
 * - Clear warnings for missing critical configs
 * - Development vs Production modes
 */

class EnvConfig {
  constructor() {
    this.initialized = false;
    this.config = {};
  }

  /**
   * Initialize configuration - call this AFTER dotenv.config()
   */
  init() {
    if (this.initialized) return this.config;

    const env = process.env;
    const isProduction = env.NODE_ENV === 'production';
    const isDevelopment = env.NODE_ENV === 'development';

    this.config = {
      // ═══════════════════════════════════════════════════
      // CORE CONFIGURATION (REQUIRED)
      // ═══════════════════════════════════════════════════
      node: {
        env: env.NODE_ENV || 'development',
        port: parseInt(env.PORT) || 5000,
        isProduction,
        isDevelopment
      },

      // Database (REQUIRED)
      database: {
        uri: env.MONGODB_URI,
        name: env.DB_NAME || 'internship_connect',
        isConfigured: Boolean(env.MONGODB_URI)
      },

      // JWT Authentication (REQUIRED)
      jwt: {
        secret: env.JWT_SECRET,
        refreshSecret: env.JWT_REFRESH_SECRET || env.JWT_SECRET,
        expiresIn: env.JWT_EXPIRES_IN || '7d',
        isConfigured: Boolean(env.JWT_SECRET)
      },

      // Frontend URL (REQUIRED for CORS)
      frontend: {
        url: env.FRONTEND_URL || (isProduction
          ? 'https://internship-connect.vercel.app'
          : 'http://localhost:5173'),
        isConfigured: Boolean(env.FRONTEND_URL)
      },

      // ═══════════════════════════════════════════════════
      // OPTIONAL SERVICES (WITH FALLBACKS)
      // ═══════════════════════════════════════════════════

      // SMTP Email Service (Optional - logs to console if not configured)
      smtp: {
        host: env.SMTP_HOST,
        port: parseInt(env.SMTP_PORT) || 587,
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
        isConfigured: Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS),
        fallbackMode: 'console' // Log emails to console if not configured
      },

      // Stripe Payment Service (Optional - disable payment features if not configured)
      stripe: {
        secretKey: env.STRIPE_SECRET_KEY,
        webhookSecret: env.STRIPE_WEBHOOK_SECRET,
        isConfigured: Boolean(env.STRIPE_SECRET_KEY),

        // Price IDs for subscription plans
        plans: {
          student: {
            premium: {
              monthly: env.STRIPE_STUDENT_PREMIUM_MONTHLY,
              yearly: env.STRIPE_STUDENT_PREMIUM_YEARLY
            },
            pro: {
              monthly: env.STRIPE_STUDENT_PRO_MONTHLY,
              yearly: env.STRIPE_STUDENT_PRO_YEARLY
            }
          },
          organization: {
            professional: {
              monthly: env.STRIPE_ORG_PROFESSIONAL_MONTHLY,
              yearly: env.STRIPE_ORG_PROFESSIONAL_YEARLY
            },
            enterprise: {
              monthly: env.STRIPE_ORG_ENTERPRISE_MONTHLY,
              yearly: env.STRIPE_ORG_ENTERPRISE_YEARLY
            }
          }
        }
      },

      // Cloudinary File Upload (Optional - use local storage if not configured)
      cloudinary: {
        cloudName: env.CLOUDINARY_CLOUD_NAME,
        apiKey: env.CLOUDINARY_API_KEY,
        apiSecret: env.CLOUDINARY_API_SECRET,
        isConfigured: Boolean(
          env.CLOUDINARY_CLOUD_NAME &&
          env.CLOUDINARY_API_KEY &&
          env.CLOUDINARY_API_SECRET
        ),
        fallbackMode: 'local' // Use local file storage if not configured
      },

      // AI Services (Optional - disable AI features if not configured)
      ai: {
        openai: {
          apiKey: env.OPENAI_API_KEY,
          isConfigured: Boolean(env.OPENAI_API_KEY)
        },
        anthropic: {
          apiKey: env.ANTHROPIC_API_KEY,
          isConfigured: Boolean(env.ANTHROPIC_API_KEY)
        },
        // At least one AI service should be configured for AI features
        isConfigured: Boolean(env.OPENAI_API_KEY || env.ANTHROPIC_API_KEY)
      },

      // Paystack (Alternative to Stripe for some regions)
      paystack: {
        secretKey: env.PAYSTACK_SECRET_KEY,
        isConfigured: Boolean(env.PAYSTACK_SECRET_KEY)
      }
    };

    this.initialized = true;
    this.validateConfig();
    this.logConfigStatus();

    return this.config;
  }

  /**
   * Validate critical configuration
   */
  validateConfig() {
    const errors = [];
    const warnings = [];

    // Check critical required configs
    if (!this.config.database.isConfigured) {
      errors.push('MONGODB_URI is required but not configured');
    }

    if (!this.config.jwt.isConfigured) {
      errors.push('JWT_SECRET is required but not configured');
    }

    // Check optional configs
    if (!this.config.smtp.isConfigured) {
      warnings.push('SMTP not configured - emails will be logged to console only');
    }

    if (!this.config.stripe.isConfigured && !this.config.paystack.isConfigured) {
      warnings.push('Payment providers not configured - payment features will be disabled');
    }

    if (!this.config.cloudinary.isConfigured) {
      warnings.push('Cloudinary not configured - using local file storage');
    }

    if (!this.config.ai.isConfigured) {
      warnings.push('AI services not configured - AI features will be disabled');
    }

    // Log errors and warnings
    if (errors.length > 0) {
      console.error('\n❌ ═══════════════════════════════════════════════════════');
      console.error('❌ CRITICAL CONFIGURATION ERRORS');
      console.error('❌ ═══════════════════════════════════════════════════════');
      errors.forEach(error => console.error(`❌ ${error}`));
      console.error('❌ ═══════════════════════════════════════════════════════\n');
      throw new Error('Missing critical environment variables. Please check backend/.env file.');
    }

    if (warnings.length > 0) {
      console.warn('\n⚠️  ═══════════════════════════════════════════════════════');
      console.warn('⚠️  CONFIGURATION WARNINGS');
      console.warn('⚠️  ═══════════════════════════════════════════════════════');
      warnings.forEach(warning => console.warn(`⚠️  ${warning}`));
      console.warn('⚠️  ═══════════════════════════════════════════════════════\n');
    }
  }

  /**
   * Log configuration status
   */
  logConfigStatus() {
    if (this.config.node.isDevelopment) {
      console.log('\n📋 ═══════════════════════════════════════════════════════');
      console.log('📋 ENVIRONMENT CONFIGURATION STATUS');
      console.log('📋 ═══════════════════════════════════════════════════════');
      console.log(`📋 Environment: ${this.config.node.env}`);
      console.log(`📋 Port: ${this.config.node.port}`);
      console.log(`📋 Frontend URL: ${this.config.frontend.url}`);
      console.log(`📋 Database: ${this.config.database.isConfigured ? '✅ Configured' : '❌ Not Configured'}`);
      console.log(`📋 JWT: ${this.config.jwt.isConfigured ? '✅ Configured' : '❌ Not Configured'}`);
      console.log(`📋 SMTP: ${this.config.smtp.isConfigured ? '✅ Configured' : '⚠️  Not Configured (console mode)'}`);
      console.log(`📋 Stripe: ${this.config.stripe.isConfigured ? '✅ Configured' : '⚠️  Not Configured'}`);
      console.log(`📋 Cloudinary: ${this.config.cloudinary.isConfigured ? '✅ Configured' : '⚠️  Not Configured (local mode)'}`);
      console.log(`📋 AI Services: ${this.config.ai.isConfigured ? '✅ Configured' : '⚠️  Not Configured'}`);
      console.log('📋 ═══════════════════════════════════════════════════════\n');
    }
  }

  /**
   * Get configuration object
   */
  get() {
    if (!this.initialized) {
      throw new Error('EnvConfig not initialized. Call init() first.');
    }
    return this.config;
  }

  /**
   * Check if a service is configured
   */
  isServiceConfigured(serviceName) {
    if (!this.initialized) this.init();

    switch (serviceName) {
      case 'smtp':
      case 'email':
        return this.config.smtp.isConfigured;
      case 'stripe':
      case 'payment':
        return this.config.stripe.isConfigured || this.config.paystack.isConfigured;
      case 'cloudinary':
      case 'upload':
        return this.config.cloudinary.isConfigured;
      case 'ai':
        return this.config.ai.isConfigured;
      case 'openai':
        return this.config.ai.openai.isConfigured;
      case 'anthropic':
        return this.config.ai.anthropic.isConfigured;
      case 'paystack':
        return this.config.paystack.isConfigured;
      default:
        return false;
    }
  }
}

// Export singleton instance
const envConfig = new EnvConfig();

export default envConfig;

/**
 * USAGE EXAMPLES:
 *
 * // In server.js (after dotenv.config())
 * import envConfig from './config/env.config.js';
 * const config = envConfig.init();
 *
 * // In any service
 * import envConfig from './config/env.config.js';
 * const config = envConfig.get();
 *
 * if (config.stripe.isConfigured) {
 *   // Initialize Stripe
 * } else {
 *   console.log('Stripe not configured - payment features disabled');
 * }
 *
 * // Check if service is available
 * if (envConfig.isServiceConfigured('smtp')) {
 *   // Send email
 * } else {
 *   // Log email to console
 * }
 */
