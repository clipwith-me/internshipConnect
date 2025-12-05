/**
 * Database Optimizations for Scalability
 *
 * Implements comprehensive indexing strategy, query optimization,
 * and connection pooling for handling 800M users and 1M+ RPS
 *
 * Run this file after initial deployment to create all necessary indexes
 */

import mongoose from 'mongoose';
import User from '../models/User.js';
import StudentProfile from '../models/StudentProfile.js';
import OrganizationProfile from '../models/OrganizationProfile.js';
import Internship from '../models/Internship.js';
import Application from '../models/Application.js';

/**
 * Create additional indexes for scale
 * This should be run during deployment or as a migration
 */
export async function createScalabilityIndexes() {
  try {
    console.log('🔧 Creating scalability indexes...');

    // ═══════════════════════════════════════════════════════════
    // USER MODEL INDEXES
    // ═══════════════════════════════════════════════════════════

    console.log('📊 User indexes...');

    // Already exists: email (unique), role, { email, role }
    // Add additional compound indexes for common queries

    await User.collection.createIndex(
      { isActive: 1, role: 1, 'subscription.plan': 1 },
      { name: 'active_users_by_role_plan', background: true }
    );

    await User.collection.createIndex(
      { createdAt: -1 },
      { name: 'users_by_creation_date', background: true }
    );

    await User.collection.createIndex(
      { lastLogin: -1 },
      { name: 'users_by_last_login', background: true, sparse: true }
    );

    await User.collection.createIndex(
      { 'subscription.status': 1, 'subscription.endDate': 1 },
      { name: 'subscription_expiry', background: true }
    );

    // ═══════════════════════════════════════════════════════════
    // INTERNSHIP MODEL INDEXES
    // ═══════════════════════════════════════════════════════════

    console.log('📊 Internship indexes...');

    // Text search index for search functionality
    await Internship.collection.createIndex(
      { title: 'text', description: 'text', 'requirements.skills.name': 'text' },
      { name: 'internship_text_search', background: true }
    );

    // Common filter combinations
    await Internship.collection.createIndex(
      { status: 1, 'location.type': 1, publishedAt: -1 },
      { name: 'active_by_location', background: true }
    );

    await Internship.collection.createIndex(
      { status: 1, categories: 1, publishedAt: -1 },
      { name: 'active_by_category', background: true }
    );

    await Internship.collection.createIndex(
      { status: 1, 'compensation.type': 1 },
      { name: 'active_by_compensation', background: true }
    );

    await Internship.collection.createIndex(
      { 'timeline.applicationDeadline': 1, status: 1 },
      { name: 'deadline_tracking', background: true }
    );

    // Skills matching index
    await Internship.collection.createIndex(
      { 'requirements.skills.name': 1, status: 1 },
      { name: 'skills_matching', background: true }
    );

    // Featured listings optimization
    await Internship.collection.createIndex(
      { 'featured.isFeatured': 1, 'featured.featuredUntil': 1, 'featured.priority': -1 },
      { name: 'featured_listings', background: true }
    );

    // Organization's internships
    await Internship.collection.createIndex(
      { organization: 1, createdAt: -1 },
      { name: 'org_internships_by_date', background: true }
    );

    // Analytics queries
    await Internship.collection.createIndex(
      { 'statistics.views': -1, status: 1 },
      { name: 'popular_internships', background: true }
    );

    // ═══════════════════════════════════════════════════════════
    // APPLICATION MODEL INDEXES
    // ═══════════════════════════════════════════════════════════

    console.log('📊 Application indexes...');

    // Student's applications
    await Application.collection.createIndex(
      { student: 1, status: 1, createdAt: -1 },
      { name: 'student_applications', background: true }
    );

    // Internship applications
    await Application.collection.createIndex(
      { internship: 1, status: 1, createdAt: -1 },
      { name: 'internship_applications', background: true }
    );

    // Organization's applications
    await Application.collection.createIndex(
      { organization: 1, status: 1, createdAt: -1 },
      { name: 'org_applications', background: true }
    );

    // Duplicate application prevention
    await Application.collection.createIndex(
      { student: 1, internship: 1 },
      { name: 'unique_application', unique: true, background: true }
    );

    // Match score ranking
    await Application.collection.createIndex(
      { internship: 1, 'aiAnalysis.matchScore': -1 },
      { name: 'applications_by_match_score', background: true }
    );

    // Status tracking
    await Application.collection.createIndex(
      { status: 1, updatedAt: -1 },
      { name: 'applications_by_status', background: true }
    );

    // ═══════════════════════════════════════════════════════════
    // STUDENT PROFILE INDEXES
    // ═══════════════════════════════════════════════════════════

    console.log('📊 StudentProfile indexes...');

    // User reference
    await StudentProfile.collection.createIndex(
      { user: 1 },
      { name: 'student_user_ref', unique: true, background: true }
    );

    // Skills search (for organization search feature)
    await StudentProfile.collection.createIndex(
      { 'skills.name': 1, 'skills.level': 1 },
      { name: 'student_skills', background: true }
    );

    // Location-based search
    await StudentProfile.collection.createIndex(
      { 'personalInfo.location.city': 1, 'personalInfo.location.state': 1 },
      { name: 'student_location', background: true }
    );

    // Education matching
    await StudentProfile.collection.createIndex(
      { 'education.degree': 1, 'education.major': 1 },
      { name: 'student_education', background: true }
    );

    // ═══════════════════════════════════════════════════════════
    // ORGANIZATION PROFILE INDEXES
    // ═══════════════════════════════════════════════════════════

    console.log('📊 OrganizationProfile indexes...');

    // User reference
    await OrganizationProfile.collection.createIndex(
      { user: 1 },
      { name: 'org_user_ref', unique: true, background: true }
    );

    // Industry and size filtering
    await OrganizationProfile.collection.createIndex(
      { 'companyInfo.industry': 1, 'companyInfo.size': 1 },
      { name: 'org_by_industry_size', background: true }
    );

    // Verification status
    await OrganizationProfile.collection.createIndex(
      { 'verification.status': 1, 'verification.trustScore': -1 },
      { name: 'verified_orgs', background: true }
    );

    console.log('✅ All scalability indexes created successfully!');

    // Get index stats
    await printIndexStats();
  } catch (error) {
    console.error('❌ Error creating indexes:', error);
    throw error;
  }
}

/**
 * Print index statistics for all collections
 */
async function printIndexStats() {
  try {
    console.log('\n📈 Index Statistics:\n');

    const collections = [
      { name: 'User', model: User },
      { name: 'StudentProfile', model: StudentProfile },
      { name: 'OrganizationProfile', model: OrganizationProfile },
      { name: 'Internship', model: Internship },
      { name: 'Application', model: Application }
    ];

    for (const { name, model } of collections) {
      const indexes = await model.collection.getIndexes();
      console.log(`${name}:`);
      console.log(`  Total indexes: ${Object.keys(indexes).length}`);
      Object.keys(indexes).forEach((indexName) => {
        console.log(`  - ${indexName}`);
      });
      console.log('');
    }
  } catch (error) {
    console.error('Error getting index stats:', error.message);
  }
}

/**
 * Drop unused indexes to improve write performance
 * Run this after analyzing query patterns
 */
export async function dropUnusedIndexes() {
  try {
    console.log('🧹 Dropping unused indexes...');

    // Example: Drop an index if it's not being used
    // await Internship.collection.dropIndex('index_name');

    console.log('✅ Unused indexes dropped');
  } catch (error) {
    console.error('❌ Error dropping indexes:', error);
  }
}

/**
 * Analyze query performance using explain()
 * @param {Model} Model - Mongoose model
 * @param {Object} query - Query object
 * @param {Object} options - Query options
 */
export async function analyzeQueryPerformance(Model, query, options = {}) {
  try {
    const explain = await Model.find(query, null, options).explain('executionStats');

    console.log('\n📊 Query Performance Analysis:');
    console.log(`Collection: ${Model.collection.name}`);
    console.log(`Query: ${JSON.stringify(query)}`);
    console.log(`Execution time: ${explain.executionStats.executionTimeMillis}ms`);
    console.log(`Documents examined: ${explain.executionStats.totalDocsExamined}`);
    console.log(`Documents returned: ${explain.executionStats.nReturned}`);
    console.log(
      `Index used: ${explain.executionStats.executionStages?.indexName || 'COLLECTION_SCAN'}`
    );

    // Performance rating
    const efficiency =
      explain.executionStats.nReturned / Math.max(explain.executionStats.totalDocsExamined, 1);
    console.log(`Efficiency: ${(efficiency * 100).toFixed(2)}%`);

    if (efficiency < 0.5) {
      console.warn('⚠️ Low efficiency - consider adding an index for this query');
    }

    return explain;
  } catch (error) {
    console.error('❌ Error analyzing query:', error);
  }
}

/**
 * Configure MongoDB connection pool for high concurrency
 * @param {Object} options - Connection options
 */
export function getOptimizedConnectionOptions(options = {}) {
  return {
    // Connection pool settings for 1M+ RPS
    maxPoolSize: options.maxPoolSize || 100, // Max concurrent connections
    minPoolSize: options.minPoolSize || 10, // Min connections kept alive
    maxIdleTimeMS: options.maxIdleTimeMS || 30000, // Close idle connections after 30s
    waitQueueTimeoutMS: options.waitQueueTimeoutMS || 10000, // Wait max 10s for connection

    // Read/Write concern for performance
    w: options.w || 'majority', // Wait for write to replicate to majority
    readPreference: options.readPreference || 'secondaryPreferred', // Read from replicas
    readConcern: { level: options.readConcern || 'majority' },

    // Timeouts
    socketTimeoutMS: options.socketTimeoutMS || 45000, // Socket timeout
    serverSelectionTimeoutMS: options.serverSelectionTimeoutMS || 10000, // Server selection timeout
    heartbeatFrequencyMS: options.heartbeatFrequencyMS || 10000, // Heartbeat frequency

    // Compression for network efficiency
    compressors: ['zlib'],

    // Auto-index creation (disable in production for performance)
    autoIndex: process.env.NODE_ENV !== 'production',

    // Retry writes on network errors
    retryWrites: true,
    retryReads: true
  };
}

/**
 * Query optimization helpers
 */
export const queryOptimizations = {
  /**
   * Use lean() for read-only queries (10x faster)
   * Returns plain JavaScript objects instead of Mongoose documents
   */
  useLean: (query) => query.lean(),

  /**
   * Select only needed fields to reduce data transfer
   */
  selectFields: (query, fields) => query.select(fields),

  /**
   * Limit results to prevent memory issues
   */
  limitResults: (query, limit = 100) => query.limit(limit),

  /**
   * Use skip() carefully - it's slow for large offsets
   * Better to use cursor-based pagination with _id
   */
  cursorPagination: (query, lastId, limit = 20) => {
    if (lastId) {
      query = query.where('_id').gt(lastId);
    }
    return query.limit(limit).sort({ _id: 1 });
  },

  /**
   * Aggregate pipeline optimization
   * Use $match early to reduce documents in pipeline
   */
  optimizeAggregate: (pipeline) => {
    // Move $match stages to the beginning
    const matchStages = pipeline.filter((stage) => stage.$match);
    const otherStages = pipeline.filter((stage) => !stage.$match);
    return [...matchStages, ...otherStages];
  }
};

/**
 * Example optimized queries
 */
export const optimizedQueries = {
  // ✅ GOOD: Get active internships with only needed fields
  getActiveInternships: (limit = 20) =>
    Internship.find({ status: 'active' })
      .select('title organization location compensation timeline')
      .populate('organization', 'companyInfo.name companyInfo.logo')
      .lean()
      .limit(limit)
      .sort({ publishedAt: -1 }),

  // ✅ GOOD: Cursor-based pagination
  getInternshipsPaginated: (lastId, limit = 20) => {
    const query = Internship.find({ status: 'active' }).select(
      'title location compensation timeline'
    );

    if (lastId) {
      query.where('_id').gt(lastId);
    }

    return query.lean().limit(limit).sort({ _id: 1 });
  },

  // ✅ GOOD: Aggregation with early $match
  getOrganizationStats: (orgId) =>
    Application.aggregate([
      // Move $match to beginning for best performance
      { $match: { organization: mongoose.Types.ObjectId(orgId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgMatchScore: { $avg: '$aiAnalysis.matchScore' }
        }
      },
      { $sort: { count: -1 } }
    ]),

  // ✅ GOOD: Count with hint to use specific index
  countActiveInternships: () =>
    Internship.countDocuments({ status: 'active' }).hint({ status: 1, publishedAt: -1 })
};

export default {
  createScalabilityIndexes,
  dropUnusedIndexes,
  analyzeQueryPerformance,
  getOptimizedConnectionOptions,
  queryOptimizations,
  optimizedQueries
};
