// ✅ FIX: Load environment variables FIRST before any imports
import dotenv from 'dotenv';
dotenv.config(); // Must run before other imports that use process.env

// ✅ Initialize environment configuration
import envConfig from './config/env.config.js';
const config = envConfig.init(); // Validates and logs configuration status

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import connectDB from './config/database.js';
import authRoutes from './routes/auth.routes.js';
import internshipRoutes from './routes/internship.routes.js';
import applicationRoutes from './routes/application.routes.js';
import resumeRoutes from './routes/resume.routes.js';
import matchingRoutes from './routes/matching.routes.js';
import studentRoutes from './routes/student.routes.js';
import organizationRoutes from './routes/organization.routes.js';
import adminRoutes from './routes/admin.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import {
  apiLimiter,
  authLimiter,
  sanitizeInput,
  preventXSS,
  validateInput,
  securityHeaders,
  enforceHTTPS,
  secureErrorHandler
} from './middleware/security.middleware.js';

/**
 * 🎓 WHAT IS EXPRESS?
 * 
 * Express is a web framework for Node.js that makes it easy to:
 * - Create API endpoints (routes)
 * - Handle HTTP requests (GET, POST, PUT, DELETE)
 * - Use middleware (authentication, logging, etc.)
 */
const app = express();

// ═══════════════════════════════════════════════════════════
// MIDDLEWARE SETUP
// ═══════════════════════════════════════════════════════════

/**
 * 🎓 WHAT IS MIDDLEWARE?
 * 
 * Middleware are functions that run BEFORE your route handlers.
 * They can:
 * - Modify the request/response objects
 * - End the request-response cycle
 * - Call the next middleware in the stack
 * 
 * Flow: Request → Middleware 1 → Middleware 2 → Route Handler → Response
 */

// 1. HTTPS ENFORCEMENT (Production only)
app.use(enforceHTTPS);

// 2. HELMET - Security headers
/**
 * 🎓 WHY HELMET?
 *
 * Helmet sets HTTP headers that protect against common attacks:
 * - XSS (Cross-Site Scripting)
 * - Clickjacking
 * - MIME type sniffing
 *
 * It's like putting a security guard at the door of your API.
 */
app.use(helmet());

// 3. MICROSOFT-GRADE SECURITY HEADERS
app.use(securityHeaders);

// 4. COMPRESSION - Gzip/Deflate compression
/**
 * 🎓 WHY COMPRESSION?
 *
 * Compresses response bodies for all requests, reducing bandwidth by 60-80%.
 * - Gzip compression for text/JSON responses
 * - Only compresses responses larger than 1KB
 * - Level 6 compression (balance between speed and size)
 *
 * ✅ PERFORMANCE: Faster page loads, reduced bandwidth costs
 */
app.use(compression({
  threshold: 1024, // Only compress responses larger than 1KB
  level: 6 // Compression level (1-9, higher = better compression but slower)
}));

// 5. CORS - Cross-Origin Resource Sharing
/**
 * 🎓 WHY CORS?
 *
 * Your frontend (localhost:5173) and backend (localhost:5000) are on
 * different origins. Browsers block this by default for security.
 *
 * CORS tells the browser: "It's okay, these two can talk to each other"
 *
 * ✅ PRODUCTION-READY: Environment-based origin checking
 */
const isProduction = process.env.NODE_ENV === 'production';

// In production: Only allow FRONTEND_URL
// In development: Allow localhost, 127.0.0.1, and FRONTEND_URL
const allowedOrigins = isProduction
  ? [process.env.FRONTEND_URL].filter(Boolean)
  : [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      process.env.FRONTEND_URL
    ].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests without origin header (Render health checks, server-to-server)
    if (!origin) {
      return callback(null, true);
    }

    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Detailed logging for CORS debugging
    console.warn(`\n⚠️  ════════════════════════════════════════`);
    console.warn(`⚠️  CORS BLOCKED REQUEST`);
    console.warn(`⚠️  ════════════════════════════════════════`);
    console.warn(`❌ Blocked Origin: ${origin}`);
    console.warn(`✅ Allowed Origins:`, allowedOrigins);
    console.warn(`📋 NODE_ENV: ${process.env.NODE_ENV}`);
    console.warn(`📋 FRONTEND_URL env var: ${process.env.FRONTEND_URL || 'NOT SET'}`);
    console.warn(`⚠️  ════════════════════════════════════════\n`);

    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400, // Cache preflight for 24 hours
  optionsSuccessStatus: 204, // Some legacy browsers choke on 204
  preflightContinue: false
}));

// 6. STRIPE WEBHOOK ROUTE - BEFORE JSON PARSER
/**
 * 🎓 CRITICAL: Payment Webhook Route Registration
 *
 * Stripe webhooks MUST be registered BEFORE express.json() because:
 * - Stripe needs the raw request body to verify webhook signatures
 * - If express.json() runs first, it parses the body and breaks verification
 *
 * Note: The webhook route in payment.routes.js uses express.raw() instead
 */
app.use('/api/payments', paymentRoutes);

// 7. JSON PARSER - Parse request bodies
/**
 * 🎓 WHY express.json()?
 *
 * When frontend sends data like { email: 'test@test.com' },
 * it comes as a string. express.json() converts it to a JavaScript object.
 *
 * Without this: req.body = "[object Object]" (useless)
 * With this: req.body = { email: 'test@test.com' } (useful!)
 */
app.use(express.json({ limit: '10mb' })); // Allow up to 10MB JSON payloads

// 8. URL ENCODED - Parse form data
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 9. STATIC FILES - Serve uploaded files
/**
 * 🎓 STATIC FILE SERVING
 *
 * Serve uploaded profile pictures and other static files
 * Files in uploads/ directory will be accessible via /uploads/...
 */
app.use('/uploads', express.static('uploads'));

// 10. INPUT SANITIZATION & XSS PROTECTION
app.use(sanitizeInput); // Prevent NoSQL injection
app.use(preventXSS); // Prevent XSS attacks
app.use(validateInput); // Additional input validation

// 11. GENERAL API RATE LIMITING
// ✅ ENABLED: Protection against API abuse and DoS attacks
app.use('/api/', apiLimiter);

// 12. LOGGING - Development only
/**
 * 🎓 CUSTOM LOGGER MIDDLEWARE
 *
 * Logs every request to help with debugging
 */
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next(); // CRITICAL: Call next() to pass to next middleware
  });
}

// ═══════════════════════════════════════════════════════════
// API ROUTES
// ═══════════════════════════════════════════════════════════

/**
 * 🎓 WHAT ARE ROUTES?
 *
 * Routes are URL patterns that your API responds to.
 * They map HTTP methods + paths to handler functions.
 *
 * Example:
 * GET /api/students → Get all students
 * POST /api/students → Create a student
 * GET /api/students/:id → Get one student
 *
 * IMPORTANT: /api/payments is registered BEFORE json() middleware (line 100)
 */

app.use('/api/auth', authRoutes);
app.use('/api/internships', internshipRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/matching', matchingRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
// Note: /api/payments already registered on line 100 (before JSON parser)

// ✅ ROOT ROUTE - Fixes "Route GET / not found" error on Render
app.get('/', (req, res) => {
  res.json({
    success: true,
    service: 'InternshipConnect API',
    version: '1.0.0',
    status: 'running',
    environment: process.env.NODE_ENV || 'development',
    documentation: '/api',
    health: '/health',
    endpoints: {
      auth: '/api/auth',
      internships: '/api/internships',
      applications: '/api/applications',
      students: '/api/students',
      organizations: '/api/organizations',
      resumes: '/api/resumes',
      payments: '/api/payments',
      notifications: '/api/notifications',
      admin: '/api/admin',
      matching: '/api/matching'
    },
    timestamp: new Date().toISOString()
  });
});

// Test endpoint
app.get("/api/auth/test", (req, res) => {
  res.json({ message: "Backend is working ✅" });
});

// Health check route
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      database: config.database.isConfigured,
      smtp: config.smtp.isConfigured,
      stripe: config.stripe.isConfigured,
      cloudinary: config.cloudinary.isConfigured,
      ai: config.ai.isConfigured
    }
  });
});

// API Routes (we'll create these in Day 3)
/**
 * 🎓 ROUTE ORGANIZATION
 * 
 * Instead of defining all routes here, we create separate files:
 * - routes/auth.routes.js
 * - routes/student.routes.js
 * - routes/internship.routes.js
 * 
 * Then import and mount them:
 */

// Example (uncomment when routes are created):
// import authRoutes from './routes/auth.routes.js';
// import studentRoutes from './routes/student.routes.js';
// import internshipRoutes from './routes/internship.routes.js';

// app.use('/api/auth', authRoutes);
// app.use('/api/students', studentRoutes);
// app.use('/api/internships', internshipRoutes);

// 404 Handler - Route not found
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`
  });
});

// ═══════════════════════════════════════════════════════════
// ERROR HANDLING MIDDLEWARE
// ═══════════════════════════════════════════════════════════

/**
 * 🎓 GLOBAL ERROR HANDLER
 * 
 * This catches ALL errors in your application.
 * It must have 4 parameters (err, req, res, next) for Express to recognize it.
 * 
 * Why global error handler?
 * - Don't repeat try-catch everywhere
 * - Consistent error responses
 * - Log errors in one place
 */
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors
    });
  }
  
  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`
    });
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }
  
  // Default error - use secure error handler
  secureErrorHandler(err, req, res, next);
});

// ═══════════════════════════════════════════════════════════
// START SERVER
// ═══════════════════════════════════════════════════════════

/**
 * 🎓 ASYNC SERVER STARTUP
 * 
 * We use an async function to:
 * 1. Connect to database FIRST
 * 2. Then start the server
 * 
 * This prevents the server from accepting requests before DB is ready
 */
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // ✅ FIX: Verify SMTP connection on server startup (non-blocking)
    const { verifyEmailConnection } = await import('./services/email.service.js');
    verifyEmailConnection().catch((err) => {
      console.warn('⚠️  SMTP verification failed (non-critical):', err.message);
      console.warn('⚠️  Server will continue running - emails will be logged to console');
    });

    // Get port from environment or use 5000
    const PORT = process.env.PORT || 5000;

    // Get network IP dynamically (development only)
    let networkIP = null;
    if (process.env.NODE_ENV === 'development') {
      try {
        const os = await import('os');
        const networkInterfaces = os.networkInterfaces();
        networkIP = Object.values(networkInterfaces)
          .flat()
          .find(iface => iface.family === 'IPv4' && !iface.internal)?.address;
      } catch (err) {
        // Silently fail - network IP is just for convenience
      }
    }

    // ✅ Listen on all network interfaces (0.0.0.0) to allow mobile access
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📝 Local API URL: http://localhost:${PORT}`);

      if (networkIP) {
        console.log(`📱 Network API URL: http://${networkIP}:${PORT}`);
      }
    });

    // Store server reference for graceful shutdown
    global.server = server;

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

/**
 * 🎓 GRACEFUL SHUTDOWN
 *
 * Handle server shutdown properly:
 * - Close database connections
 * - Finish pending requests
 * - Clean up resources
 */
const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} received: Starting graceful shutdown...`);

  if (global.server) {
    global.server.close(async () => {
      console.log('✅ HTTP server closed');

      try {
        const mongoose = await import('mongoose');
        await mongoose.connection.close();
        console.log('✅ MongoDB connection closed');
        process.exit(0);
      } catch (error) {
        console.error('❌ Error during shutdown:', error);
        process.exit(1);
      }
    });

    // Force close after 10 seconds
    setTimeout(() => {
      console.error('⚠️  Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
};

process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  gracefulShutdown('UNHANDLED_REJECTION');
});

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

