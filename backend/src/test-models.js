import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// MongoDB connection URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/internship_connect';

// Connect to MongoDB
console.log('🔄 Attempting to connect to MongoDB...');

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Successfully connected to MongoDB.');
    
    // Test creating a simple document
    const Test = mongoose.model('Test', new mongoose.Schema({
      name: String,
      timestamp: { type: Date, default: Date.now }
    }));

    return Test.create({ name: 'test entry' });
  })
  .then(doc => {
    console.log('✅ Successfully created test document:', doc);
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
  })
  .finally(() => {
    // Close the connection
    mongoose.connection.close()
      .then(() => console.log('📡 Connection closed'))
      .catch(err => console.error('Error closing connection:', err))
      .finally(() => process.exit());
  });