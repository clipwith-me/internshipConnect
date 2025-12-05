// test-scripts/upgrade-user-to-pro.js
// Run this script to upgrade a user to Pro subscription for testing
// Usage: node test-scripts/upgrade-user-to-pro.js <email>

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from backend
dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const User = mongoose.model('User', new mongoose.Schema({
  email: String,
  subscription: {
    plan: String,
    status: String,
    startDate: Date,
    endDate: Date,
    features: [String]
  }
}, { strict: false }));

async function upgradeUserToPro(email) {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DB_NAME || 'internship_connect'
    });
    console.log('✅ Connected to MongoDB\n');

    console.log(`🔍 Looking for user with email: ${email}`);
    const user = await User.findOne({ email });

    if (!user) {
      console.error(`❌ User not found with email: ${email}`);
      console.log('\n💡 Available users:');
      const users = await User.find({}).select('email role subscription.plan').limit(10);
      users.forEach(u => {
        console.log(`   - ${u.email} (${u.role}) - Current plan: ${u.subscription?.plan || 'free'}`);
      });
      process.exit(1);
    }

    console.log(`✅ Found user: ${user.email} (${user.role})`);
    console.log(`📊 Current subscription: ${user.subscription?.plan || 'free'} (${user.subscription?.status || 'active'})\n`);

    // Upgrade to Pro
    user.subscription = {
      plan: 'pro',
      status: 'active',
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      features: [
        'ai-resume-optimization',
        'interview-prep',
        'unlimited-applications',
        'priority-support',
        'advanced-analytics',
        'direct-messaging',
        'featured-profile'
      ]
    };

    await user.save();

    console.log('🎉 ═══════════════════════════════════════════════════════');
    console.log('🎉 USER UPGRADED TO PRO SUCCESSFULLY!');
    console.log('🎉 ═══════════════════════════════════════════════════════');
    console.log(`✅ Email: ${user.email}`);
    console.log(`✅ Role: ${user.role}`);
    console.log(`✅ Plan: ${user.subscription.plan}`);
    console.log(`✅ Status: ${user.subscription.status}`);
    console.log(`✅ Features: ${user.subscription.features.length} features enabled`);
    console.log(`✅ Valid until: ${user.subscription.endDate.toLocaleDateString()}`);
    console.log('\n📝 Features enabled:');
    user.subscription.features.forEach(feature => {
      console.log(`   - ${feature}`);
    });
    console.log('\n🧪 You can now test Pro features in the frontend!');
    console.log('🔄 Refresh the page at http://localhost:5173 to see changes\n');

  } catch (error) {
    console.error('❌ Error upgrading user:', error);
  } finally {
    await mongoose.connection.close();
    console.log('👋 Database connection closed');
  }
}

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.error('❌ Please provide an email address');
  console.log('Usage: node test-scripts/upgrade-user-to-pro.js <email>');
  console.log('Example: node test-scripts/upgrade-user-to-pro.js student@example.com');
  process.exit(1);
}

upgradeUserToPro(email);
