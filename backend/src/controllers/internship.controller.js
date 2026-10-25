// backend/src/controllers/internship.controller.js

/**
 * 🎓 LEARNING: Internship Controller
 *
 * This controller handles all internship-related operations.
 *
 * Key Concepts:
 * - CRUD operations (Create, Read, Update, Delete)
 * - Pagination for performance (don't load all internships at once)
 * - Search & filtering for user experience
 * - Authorization (only organizations can create/edit their internships)
 * - Data validation and error handling
 *
 * Microsoft Engineering Principle:
 * "Build scalable APIs from day one - pagination and filtering are not optional"
 */

import Internship from '../models/Internship.js';
import OrganizationProfile from '../models/OrganizationProfile.js';
import { escapeRegex, validatePagination } from '../utils/security.js';

// Fields an employer may set on their own listing. Everything else (featured,
// statistics, aiMetadata, positions.filled, organization, ...) is system-managed.
const EMPLOYER_EDITABLE_FIELDS = [
  'title', 'description', 'requirements', 'location', 'compensation', 'duration',
  'timeline', 'positions', 'tags', 'categories', 'visibility', 'applicationProcess',
];

// 'expired' is set by the system when a deadline passes.
const EMPLOYER_SETTABLE_STATUSES = ['draft', 'active', 'paused', 'closed', 'filled'];

/**
 * @desc    Get all internships (with pagination, search, and filters)
 * @route   GET /api/internships
 * @access  Public
 *
 * 🎓 Query Parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 10)
 * - search: Search in title and description
 * - location: Filter by location
 * - type: Filter by type (remote, onsite, hybrid)
 * - status: Filter by status (default: active)
 */
export const getInternships = async (req, res) => {
  try {
    // Extract and validate pagination parameters with bounds
    const { page, limit, skip } = validatePagination(
      req.query.page,
      req.query.limit,
      100 // Max 100 items per page
    );

    // Build query object
    const query = {};

    // This endpoint is public, so it only ever returns live listings. The status
    // used to come straight from the query string, which let anyone read
    // employers' unpublished drafts (?status=draft). Owners use /my-internships.
    query.status = 'active';

    // Respect each listing's visibility (documents without the field are public).
    query.visibility = { $nin: ['unlisted', 'private'] };

    // Search filter (case-insensitive) - escape regex to prevent ReDoS
    if (req.query.search) {
      const escapedSearch = escapeRegex(req.query.search.slice(0, 100)); // Limit length
      query.$or = [
        { title: { $regex: escapedSearch, $options: 'i' } },
        { description: { $regex: escapedSearch, $options: 'i' } }
      ];
    }

    // Location filter - escape regex to prevent ReDoS
    if (req.query.location) {
      const escapedLocation = escapeRegex(req.query.location.slice(0, 100));
      query['location.city'] = { $regex: escapedLocation, $options: 'i' };
    }

    // Type filter (remote, onsite, hybrid)
    if (['remote', 'onsite', 'hybrid'].includes(req.query.type)) {
      query['location.type'] = req.query.type;
    }

    // Industry filter
    if (typeof req.query.industry === 'string' && req.query.industry) {
      query.industry = req.query.industry;
    }

    // Compensation type filter (paid, unpaid, stipend)
    if (['paid', 'unpaid', 'stipend', 'commission', 'negotiable'].includes(req.query.compensationType)) {
      query['compensation.type'] = req.query.compensationType;
    }

    // Execute query with pagination
    const internships = await Internship.find(query)
      .populate('organization', 'companyInfo.name companyInfo.logo companyInfo.industry')
      .sort({ createdAt: -1 }) // Newest first
      .skip(skip)
      .limit(limit);

    // Get total count for pagination metadata
    const total = await Internship.countDocuments(query);

    res.json({
      success: true,
      data: {
        internships,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage: page < Math.ceil(total / limit),
          hasPreviousPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get internships error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve internships'
    });
  }
};

/**
 * @desc    Get single internship by ID
 * @route   GET /api/internships/:id
 * @access  Public
 */
export const getInternshipById = async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id)
      .populate('organization', 'companyInfo user');

    if (!internship) {
      return res.status(404).json({
        success: false,
        error: 'Internship not found'
      });
    }

    // Unpublished (draft) and private listings are only visible to their owner
    // and admins. Closed/filled listings stay readable so applicants can still
    // open the internship behind an existing application.
    const isOwner =
      req.user.role === 'organization' &&
      internship.organization?.user?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin && (internship.status === 'draft' || internship.visibility === 'private')) {
      return res.status(404).json({
        success: false,
        error: 'Internship not found'
      });
    }

    // Count the view atomically (a read-modify-save loses concurrent increments
    // and re-runs full validation on a simple GET). Owners' own views don't count.
    if (!isOwner) {
      Internship.updateOne({ _id: internship._id }, { $inc: { 'statistics.views': 1 } }).catch((err) =>
        console.error('View count update failed:', err.message)
      );
    }

    res.json({
      success: true,
      data: internship
    });
  } catch (error) {
    console.error('Get internship error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid internship ID'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to retrieve internship'
    });
  }
};

/**
 * @desc    Create new internship
 * @route   POST /api/internships
 * @access  Private (Organization only)
 *
 * 🎓 Business Logic:
 * - Only organizations can create internships
 * - Must have complete organization profile
 * - Validate all required fields
 * - Set initial status to 'draft'
 */
export const createInternship = async (req, res) => {
  try {
    // Verify user is an organization
    if (req.user.role !== 'organization') {
      return res.status(403).json({
        success: false,
        error: 'Only organizations can create internships'
      });
    }

    // Get organization profile
    const orgProfile = await OrganizationProfile.findOne({ user: req.user._id });

    if (!orgProfile) {
      return res.status(400).json({
        success: false,
        error: 'Organization profile not found. Please complete your profile first.'
      });
    }

    // Create internship with organization reference
    // ✅ FIX: Allow immediate publishing if publish=true is sent in request body
    // Only whitelisted, employer-editable fields are accepted. Spreading the
    // whole body let an employer set paid/system fields such as
    // featured.isFeatured, statistics, positions.filled or aiMetadata.
    const fields = {};
    for (const path of EMPLOYER_EDITABLE_FIELDS) {
      if (req.body[path] !== undefined) fields[path] = req.body[path];
    }
    const internship = await Internship.create({
      ...fields,
      organization: orgProfile._id,
      status: req.body.publish === true ? 'active' : 'draft' // Publish immediately or start as draft
    });

    // Populate organization data for response
    await internship.populate('organization', 'companyInfo.name companyInfo.logo');

    res.status(201).json({
      success: true,
      message: 'Internship created successfully',
      data: internship
    });
  } catch (error) {
    console.error('Create internship error:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));

      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        errors
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to create internship'
    });
  }
};

/**
 * @desc    Update internship
 * @route   PUT /api/internships/:id
 * @access  Private (Organization owner only)
 *
 * 🎓 Authorization:
 * - Only the organization that created the internship can update it
 * - This prevents organizations from editing each other's internships
 */
export const updateInternship = async (req, res) => {
  try {
    // Find internship
    const internship = await Internship.findById(req.params.id)
      .populate('organization');

    if (!internship) {
      return res.status(404).json({
        success: false,
        error: 'Internship not found'
      });
    }

    // Verify ownership (organization must own this internship)
    if (internship.organization.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this internship'
      });
    }

    // Update only the fields sent in the request body.
    // internship.set() is the Mongoose-safe way to merge nested subdocuments —
    // Object.assign does a shallow replace that can corrupt subdocument validators.
    const update = {};
    for (const path of EMPLOYER_EDITABLE_FIELDS) {
      if (req.body[path] !== undefined) {
        update[path] = req.body[path];
      }
    }
    // Status is employer-settable, but only to values an employer may choose
    // (validators are off on this update, so enforce the enum here).
    if (req.body.status !== undefined) {
      if (!EMPLOYER_SETTABLE_STATUSES.includes(req.body.status)) {
        return res.status(400).json({
          success: false,
          error: `Invalid status. Allowed: ${EMPLOYER_SETTABLE_STATUSES.join(', ')}`
        });
      }
      update.status = req.body.status;
    }
    const updated = await Internship.findByIdAndUpdate(
      req.params.id,
      { $set: update, lastModified: new Date() },
      { new: true, runValidators: false }
    );

    res.json({
      success: true,
      message: 'Internship updated successfully',
      data: updated
    });
  } catch (error) {
    console.error('Update internship error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid internship ID'
      });
    }

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));

      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        errors
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to update internship'
    });
  }
};

/**
 * @desc    Delete internship
 * @route   DELETE /api/internships/:id
 * @access  Private (Organization owner only)
 *
 * 🎓 Soft Delete Pattern:
 * - We don't actually delete from database (soft delete)
 * - Just mark as 'closed' to preserve data for analytics
 * - Applications remain intact for historical records
 */
export const deleteInternship = async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id)
      .populate('organization');

    if (!internship) {
      return res.status(404).json({
        success: false,
        error: 'Internship not found'
      });
    }

    // Verify ownership
    if (internship.organization.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this internship'
      });
    }

    // Soft delete - mark as closed instead of removing
    internship.status = 'closed';
    await internship.save();

    res.json({
      success: true,
      message: 'Internship closed successfully'
    });
  } catch (error) {
    console.error('Delete internship error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid internship ID'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to delete internship'
    });
  }
};

/**
 * @desc    Get organization's internships
 * @route   GET /api/internships/my-internships
 * @access  Private (Organization only)
 */
export const getMyInternships = async (req, res) => {
  try {
    if (req.user.role !== 'organization') {
      return res.status(403).json({
        success: false,
        error: 'Only organizations can access this route'
      });
    }

    const orgProfile = await OrganizationProfile.findOne({ user: req.user._id });

    if (!orgProfile) {
      return res.status(404).json({
        success: false,
        error: 'Organization profile not found'
      });
    }

    const internships = await Internship.find({ organization: orgProfile._id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: internships
    });
  } catch (error) {
    console.error('Get my internships error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve your internships'
    });
  }
};

/**
 * @desc    Publish internship (change status from draft to active)
 * @route   PATCH /api/internships/:id/publish
 * @access  Private (Organization owner only)
 */
export const publishInternship = async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id)
      .populate('organization');

    if (!internship) {
      return res.status(404).json({
        success: false,
        error: 'Internship not found'
      });
    }

    // Verify ownership
    if (internship.organization.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to publish this internship'
      });
    }

    // Publish internship
    internship.status = 'active';
    await internship.save();

    res.json({
      success: true,
      message: 'Internship published successfully',
      data: internship
    });
  } catch (error) {
    console.error('Publish internship error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to publish internship'
    });
  }
};

/**
 * 🎓 EXPORT NOTE:
 * We export each function individually for better tree-shaking
 * and easier testing. This is a best practice in modern JavaScript.
 */
