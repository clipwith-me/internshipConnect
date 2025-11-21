// Script to drop conflicting indexes from MongoDB
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

async function dropConflictingIndexes() {
  try {
    // Connect to MongoDB
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DB_NAME || 'internship_connect'
    });
    console.log('✅ Connected to MongoDB');

    // Get the database
    const db = mongoose.connection.db;

    // Drop indexes from studentprofiles collection
    console.log('\n📋 Dropping indexes from studentprofiles collection...');
    try {
      const studentprofiles = db.collection('studentprofiles');

      // List all indexes
      const indexes = await studentprofiles.indexes();
      console.log('Current indexes:', indexes.map(i => i.name));

      // Drop problematic indexes
      const indexesToDrop = [
        'preferences.internshipTypes_1_preferences.industries_1',
        'preferences.internshipTypes_1',
        'preferences.industries_1'
      ];

      for (const indexName of indexesToDrop) {
        try {
          await studentprofiles.dropIndex(indexName);
          console.log(`✅ Dropped index: ${indexName}`);
        } catch (err) {
          if (err.code === 27) {
            console.log(`ℹ️  Index ${indexName} doesn't exist (already dropped)`);
          } else {
            console.log(`⚠️  Could not drop ${indexName}:`, err.message);
          }
        }
      }
    } catch (err) {
      console.log('Note: studentprofiles collection might not exist yet');
    }

    console.log('\n✅ Index cleanup complete!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Disconnected from MongoDB');
    process.exit(0);
  }
}

dropConflictingIndexes();
