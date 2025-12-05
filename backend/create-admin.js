// backend/create-admin.js
// Run this script to create an admin user for accessing admin dashboard
// Usage: node backend/create-admin.js <email> <password> <name>
// Example: node backend/create-admin.js admin@yourcompany.com SecurePass123! "Your Name"

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const User = mongoose.model('User', new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
  role: String,
  isActive: Boolean,
  personalInfo: {
    firstName: String,
    lastName: String
  },
  createdAt: Date,
  updatedAt: Date
}, { strict: false }));

async function createAdmin(email, password, name) {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DB_NAME || 'internship_connect'
    });
    console.log('✅ Connected to MongoDB\n');

    // Validate inputs
    if (!email || !password || !name) {
      console.error('❌ Missing required arguments');
      console.log('Usage: node backend/create-admin.js <email> <password> <name>');
      console.log('Example: node backend/create-admin.js admin@yourcompany.com SecurePass123! "Your Name"');
      process.exit(1);
    }

    // Check password strength
    if (password.length < 8) {
      console.error('❌ Password must be at least 8 characters long');
      process.exit(1);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (existingUser.role === 'admin') {
        console.log('ℹ️  Admin user already exists with this email');
        console.log(`   Email: ${existingUser.email}`);
        console.log(`   Role: ${existingUser.role}`);
        console.log(`   Active: ${existingUser.isActive}`);
        console.log('\n⚠️  If you want to reset the password, delete this user first or use a different email\n');
        process.exit(0);
      } else {
        console.error(`❌ User with email ${email} already exists with role: ${existingUser.role}`);
        console.error('   Please use a different email or delete the existing user');
        process.exit(1);
      }
    }

    // Parse name
    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || firstName;

    // Hash password
    console.log('🔐 Hashing password...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create admin user
    const admin = new User({
      email,
      password: hashedPassword,
      role: 'admin',
      isActive: true,
      personalInfo: {
        firstName,
        lastName
      },
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await admin.save();

    console.log('\n🎉 ═══════════════════════════════════════════════════════');
    console.log('🎉 ADMIN USER CREATED SUCCESSFULLY!');
    console.log('🎉 ═══════════════════════════════════════════════════════');
    console.log(`✅ Email: ${admin.email}`);
    console.log(`✅ Name: ${firstName} ${lastName}`);
    console.log(`✅ Role: ${admin.role}`);
    console.log(`✅ Status: Active`);
    console.log('\n🔒 SECURITY NOTES:');
    console.log('   1. This user has full admin access to:');
    console.log('      - /api/admin/stats (dashboard statistics)');
    console.log('      - /api/admin/users (user management)');
    console.log('      - /api/admin/analytics (platform analytics)');
    console.log('      - /api/admin/activity (recent activity)');
    console.log('   2. Keep these credentials secure');
    console.log('   3. Do NOT share with unauthorized personnel');
    console.log('   4. Only you and your team should have admin access');
    console.log('\n🔑 LOGIN CREDENTIALS:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log('\n⚠️  IMPORTANT: Save these credentials securely!');
    console.log('   Change your password after first login.\n');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    if (error.code === 11000) {
      console.error('   Duplicate key error - user already exists');
    }
  } finally {
    await mongoose.connection.close();
    console.log('👋 Database connection closed\n');
  }
}

// Get arguments from command line
const email = process.argv[2];
const password = process.argv[3];
const name = process.argv[4];

createAdmin(email, password, name);
