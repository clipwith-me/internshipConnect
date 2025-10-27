// ═══════════════════════════════════════════════════════════
// backend/src/config/database.js
// ═══════════════════════════════════════════════════════════

/**
 * 🎓 LEARNING: Database Configuration
 * 
 * This file handles MongoDB connection with proper error handling
 * and connection pooling for optimal performance.
 */

import mongoose from 'mongoose';

/**
 * 🎓 CONNECTION OPTIONS EXPLAINED:
 * 
 * These options optimize how Mongoose connects to MongoDB:
 */
const options = {
  // Maximum number of sockets the MongoDB driver will keep open
  // More = handle more concurrent requests, but uses more memory
  maxPoolSize: 10,
  
  // Minimum number of connections to keep open
  minPoolSize: 5,
  
  // Close sockets after 45 seconds of inactivity
  socketTimeoutMS: 45000,
  
  // Wait 10 seconds for initial connection
  serverSelectionTimeoutMS: 10000,
  
  // Database name (useful if connection string doesn't include it)
  dbName: process.env.DB_NAME || 'internship_connect'
};

/**
 * 🎓 CONNECT TO DATABASE
 * 
 * This function:
 * 1. Establishes connection to MongoDB
 * 2. Sets up event listeners for connection status
 * 3. Handles errors gracefully
 */
const connectDB = async () => {
  try {
    // Get MongoDB connection string from environment variables
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/internship_connect';
    
    console.log('🔄 Connecting to MongoDB...');
    
    // Attempt connection
    const conn = await mongoose.connect(mongoURI, options);
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    
    // Return connection for testing purposes
    return conn;
    
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    
    // Exit process with failure code
    // In production, you might want to retry instead
    process.exit(1);
  }
};

/**
 * 🎓 CONNECTION EVENT LISTENERS
 * 
 * MongoDB connection can disconnect/reconnect, so we monitor it
 */

// When connection is established
mongoose.connection.on('connected', () => {
  console.log('✅ Mongoose connected to MongoDB');
});

// When connection encounters an error
mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err);
});

// When connection is disconnected
mongoose.connection.on('disconnected', () => {
  console.log('⚠️  Mongoose disconnected from MongoDB');
});

// When Node.js process ends, close connection
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('🛑 Mongoose connection closed due to app termination');
  process.exit(0);
});

export default connectDB;

/**
 * 🎓 USAGE IN server.js:
 * 
 * import connectDB from './config/database.js';
 * 
 * // Connect to database before starting server
 * await connectDB();
 */