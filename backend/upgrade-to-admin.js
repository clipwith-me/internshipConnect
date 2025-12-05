// backend/upgrade-to-admin.js
// Run this script to upgrade an existing user to admin role
// Usage: node backend/upgrade-to-admin.js <email> [new-password]
// Example: node backend/upgrade-to-admin.js student@example.com NewPassword123!

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
  email: String,
  password: String,
  role: String,
  isActive: Boolean,
  personalInfo: {
    firstName: String,
    lastName: String
  },
  subscription: Object,
  createdAt: Date,
  updatedAt: Date
}, { strict: false }));

async function upgradeToAdmin(email, newPassword) {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DB_NAME || 'internship_connect'
    });
    console.log('✅ Connected to MongoDB\n');

    // Check if user exists
    const user = await User.findOne({ email });

    if (!user) {
      console.error(`❌ User not found with email: ${email}`);
      console.log('\n💡 Available users:');
      const users = await User.find({}).select('email role').limit(10);
      users.forEach(u => {
        console.log(`   - ${u.email} (${u.role})`);
      });
      process.exit(1);
    }

    console.log(`✅ Found user: ${user.email}`);
    console.log(`   Current role: ${user.role}`);
    console.log(`   Status: ${user.isActive ? 'Active' : 'Inactive'}`);

    // Store old role
    const oldRole = user.role;

    // Update to admin role
    user.role = 'admin';
    user.isActive = true;
    user.updatedAt = new Date();

    // If new password provided, update it
    if (newPassword) {
      console.log('\n🔐 Updating password...');

      if (newPassword.length < 8) {
        console.error('❌ Password must be at least 8 characters long');
        process.exit(1);
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      user.password = hashedPassword;
      console.log('✅ Password updated');
    }

    await user.save();

    console.log('\n🎉 ═══════════════════════════════════════════════════════');
    console.log('🎉 USER UPGRADED TO ADMIN SUCCESSFULLY!');
    console.log('🎉 ═══════════════════════════════════════════════════════');
    console.log(`✅ Email: ${user.email}`);
    console.log(`✅ Previous Role: ${oldRole}`);
    console.log(`✅ New Role: ${user.role}`);
    console.log(`✅ Status: ${user.isActive ? 'Active' : 'Inactive'}`);

    if (newPassword) {
      console.log('\n🔑 NEW LOGIN CREDENTIALS:');
      console.log(`   Email: ${email}`);
      console.log(`   Password: ${newPassword}`);
    } else {
      console.log('\n🔑 LOGIN CREDENTIALS:');
      console.log(`   Email: ${email}`);
      console.log(`   Password: (unchanged - use your existing password)`);
    }

    console.log('\n✨ ADMIN ACCESS GRANTED:');
    console.log('   - Access admin dashboard at: http://localhost:5173/dashboard/admin');
    console.log('   - Use /api/admin/* endpoints');
    console.log('   - Manage all users and platform data');

    console.log('\n⚠️  IMPORTANT:');
    console.log('   - Keep these credentials secure');
    console.log('   - Only share with authorized team members');
    console.log('   - This user now has full admin privileges\n');

  } catch (error) {
    console.error('❌ Error upgrading user:', error);
  } finally {
    await mongoose.connection.close();
    console.log('👋 Database connection closed\n');
  }
}

// Get arguments from command line
const email = process.argv[2];
const newPassword = process.argv[3]; // Optional

if (!email) {
  console.error('❌ Please provide an email address');
  console.log('\nUsage: node backend/upgrade-to-admin.js <email> [new-password]');
  console.log('\nExamples:');
  console.log('  node backend/upgrade-to-admin.js student@example.com');
  console.log('  node backend/upgrade-to-admin.js student@example.com NewPassword123!');
  process.exit(1);
}

upgradeToAdmin(email, newPassword);
