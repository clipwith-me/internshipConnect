import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import authRoutes from './routes/auth.routes.js';

// Load environment variables from .env file
dotenv.config();

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

// 1. HELMET - Security headers
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

// 2. CORS - Cross-Origin Resource Sharing
/**
 * 🎓 WHY CORS?
 * 
 * Your frontend (localhost:5173) and backend (localhost:5000) are on
 * different origins. Browsers block this by default for security.
 * 
 * CORS tells the browser: "It's okay, these two can talk to each other"
 */
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true, // Allow cookies to be sent
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 3. JSON PARSER - Parse request bodies
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

// 4. URL ENCODED - Parse form data
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/auth', authRoutes);
 app.get("/api/auth/test", (req, res) => {
  res.json({ message: "Backend is working ✅" });
});
// 5. LOGGING - Development only
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
// ROUTES
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
 */

// Health check route
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
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
  
  // Default error
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
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
    
    // Get port from environment or use 5000
    const PORT = process.env.PORT || 5000;
    
    // Start listening for requests
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📝 API URL: http://localhost:${PORT}`);
    });
    
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
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  // Close server & exit
  process.exit(1);
});
