// backend/count-users.js
// Run this script to see how many users have signed up
// Usage: node backend/count-users.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const User = mongoose.model('User', new mongoose.Schema({
  email: String,
  role: String,
  subscription: {
    plan: String,
    status: String
  },
  createdAt: Date
}, { strict: false }));

async function countUsers() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DB_NAME || 'internship_connect'
    });
    console.log('✅ Connected to MongoDB\n');

    // Total user count
    const totalUsers = await User.countDocuments();

    // Count by role
    const studentCount = await User.countDocuments({ role: 'student' });
    const organizationCount = await User.countDocuments({ role: 'organization' });
    const adminCount = await User.countDocuments({ role: 'admin' });

    // Count by subscription
    const freeUsers = await User.countDocuments({
      $or: [
        { 'subscription.plan': 'free' },
        { 'subscription.plan': { $exists: false } }
      ]
    });
    const premiumUsers = await User.countDocuments({ 'subscription.plan': 'premium' });
    const proUsers = await User.countDocuments({ 'subscription.plan': 'pro' });

    // Recent signups (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentSignups = await User.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    // Recent signups (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const monthlySignups = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Get first 5 users with details
    const sampleUsers = await User.find()
      .select('email role subscription.plan createdAt')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Display results
    console.log('📊 ═══════════════════════════════════════════════════════');
    console.log('📊 USER SIGNUP STATISTICS');
    console.log('📊 ═══════════════════════════════════════════════════════\n');

    console.log('👥 TOTAL USERS:', totalUsers);
    console.log('');

    console.log('📋 BY ROLE:');
    console.log(`   👨‍🎓 Students:       ${studentCount}`);
    console.log(`   🏢 Organizations:  ${organizationCount}`);
    console.log(`   👑 Admins:         ${adminCount}`);
    console.log('');

    console.log('💎 BY SUBSCRIPTION:');
    console.log(`   🆓 Free:          ${freeUsers}`);
    console.log(`   ⭐ Premium:       ${premiumUsers}`);
    console.log(`   👑 Pro:           ${proUsers}`);
    console.log('');

    console.log('📈 GROWTH:');
    console.log(`   📅 Last 7 days:   ${recentSignups} new users`);
    console.log(`   📆 Last 30 days:  ${monthlySignups} new users`);
    console.log('');

    if (sampleUsers.length > 0) {
      console.log('👤 RECENT SIGNUPS (Last 5):');
      sampleUsers.forEach((user, index) => {
        const plan = user.subscription?.plan || 'free';
        const date = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A';
        console.log(`   ${index + 1}. ${user.email}`);
        console.log(`      Role: ${user.role} | Plan: ${plan} | Joined: ${date}`);
      });
    }

    console.log('\n📊 ═══════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error counting users:', error);
  } finally {
    await mongoose.connection.close();
    console.log('👋 Database connection closed');
  }
}

countUsers();
