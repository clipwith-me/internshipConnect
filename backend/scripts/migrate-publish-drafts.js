/**
 * Migration Script: Publish Draft Internships
 *
 * This script publishes all internships that are stuck in 'draft' status.
 * This fixes the issue where internships created before the publish fix
 * are not visible to students.
 *
 * Usage:
 *   node scripts/migrate-publish-drafts.js
 *
 * Options:
 *   --dry-run    Show what would be updated without making changes
 *   --revert     Revert published internships back to draft
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

// Import model
import Internship from '../src/models/Internship.js';

async function migrate() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  const isRevert = args.includes('--revert');

  console.log('🔧 Internship Status Migration Script');
  console.log('=====================================');

  if (isDryRun) {
    console.log('📋 DRY RUN MODE - No changes will be made\n');
  }
  if (isRevert) {
    console.log('⚠️  REVERT MODE - Will change active back to draft\n');
  }

  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DB_NAME || 'internship_connect'
    });
    console.log('✅ Connected to MongoDB\n');

    // Find internships to update
    const fromStatus = isRevert ? 'active' : 'draft';
    const toStatus = isRevert ? 'draft' : 'active';

    const internships = await Internship.find({ status: fromStatus })
      .populate('organization', 'companyInfo.companyName')
      .lean();

    console.log(`Found ${internships.length} internships with status '${fromStatus}':\n`);

    if (internships.length === 0) {
      console.log('No internships to update. Exiting.\n');
      process.exit(0);
    }

    // Display internships
    internships.forEach((internship, index) => {
      console.log(`  ${index + 1}. ${internship.title}`);
      console.log(`     Organization: ${internship.organization?.companyInfo?.companyName || 'Unknown'}`);
      console.log(`     Created: ${new Date(internship.createdAt).toLocaleDateString()}`);
      console.log(`     ID: ${internship._id}\n`);
    });

    if (isDryRun) {
      console.log(`\n📋 Would update ${internships.length} internships from '${fromStatus}' to '${toStatus}'`);
      console.log('Run without --dry-run to apply changes.\n');
    } else {
      // Perform the update
      console.log(`Updating ${internships.length} internships to '${toStatus}'...`);

      const result = await Internship.updateMany(
        { status: fromStatus },
        { $set: { status: toStatus } }
      );

      console.log(`\n✅ Successfully updated ${result.modifiedCount} internships`);
      console.log(`   From: '${fromStatus}'`);
      console.log(`   To: '${toStatus}'\n`);

      // Verify
      const remaining = await Internship.countDocuments({ status: fromStatus });
      console.log(`Remaining internships with '${fromStatus}' status: ${remaining}\n`);
    }

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

migrate();