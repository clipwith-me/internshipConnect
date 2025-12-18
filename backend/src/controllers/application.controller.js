// backend/src/controllers/application.controller.js
import Application from '../models/Application.js';
import Internship from '../models/Internship.js';
import StudentProfile from '../models/StudentProfile.js';
import OrganizationProfile from '../models/OrganizationProfile.js';
import Notification from '../models/Notification.js';
import mongoose from 'mongoose';
import { notificationService } from '../services/notification.service.js';

/**
 * @desc    Submit application
 * @route   POST /api/applications
 * @access  Private (Student only)
 *
 * Supports both JSON and multipart/form-data:
 * - JSON: { internshipId, coverLetter }
 * - FormData: internshipId, coverLetter (text), coverLetterFile (file)
 */
export const submitApplication = async (req, res) => {
  try {
    // Role check handled by authorize middleware, but double-check
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        error: 'Only students can submit applications'
      });
    }

    const { internshipId, coverLetter } = req.body;

    // ✅ Validate internshipId is provided
    if (!internshipId) {
      return res.status(400).json({
        success: false,
        error: 'Internship ID is required',
        field: 'internshipId'
      });
    }

    // ✅ Validate internshipId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(internshipId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid internship ID format',
        field: 'internshipId'
      });
    }

    // ✅ Validate cover letter length if provided
    if (coverLetter && coverLetter.length > 3000) {
      return res.status(400).json({
        success: false,
        error: 'Cover letter cannot exceed 3000 characters',
        field: 'coverLetter'
      });
    }

    // Get student profile
    const studentProfile = await StudentProfile.findOne({ user: req.user._id });
    if (!studentProfile) {
      return res.status(400).json({
        success: false,
        error: 'Student profile not found. Please complete your profile first.'
      });
    }

    // Verify internship exists and is active
    const internship = await Internship.findById(internshipId);
    if (!internship) {
      return res.status(404).json({
        success: false,
        error: 'Internship not found'
      });
    }

    if (internship.status !== 'active') {
      return res.status(400).json({
        success: false,
        error: 'This internship is not accepting applications'
      });
    }

    // ✅ Check application deadline
    if (internship.timeline?.applicationDeadline && new Date(internship.timeline.applicationDeadline) < new Date()) {
      return res.status(400).json({
        success: false,
        error: 'The application deadline for this internship has passed'
      });
    }

    // ✅ Check if already applied - return 409 Conflict
    const existingApplication = await Application.findOne({
      student: studentProfile._id,
      internship: internshipId
    });

    if (existingApplication) {
      return res.status(409).json({
        success: false,
        error: 'You have already applied to this internship',
        applicationId: existingApplication._id
      });
    }

    // ✅ Build application data with correct field names matching schema
    const applicationData = {
      student: studentProfile._id,
      internship: internshipId,
      status: 'submitted'
    };

    // Add cover letter text if provided
    if (coverLetter && coverLetter.trim()) {
      applicationData.coverLetter = coverLetter.trim();
    }

    // ✅ Handle file upload if present
    if (req.file) {
      applicationData.coverLetterFile = {
        fileName: req.file.originalname,
        fileUrl: `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
        mimeType: req.file.mimetype,
        fileSize: req.file.size,
        uploadedAt: new Date()
      };
    }

    // Create application
    const application = await Application.create(applicationData);

    // Update internship statistics
    internship.statistics.applications = (internship.statistics.applications || 0) + 1;
    await internship.save();

    // Populate for response
    await application.populate([
      { path: 'internship', select: 'title organization' },
      { path: 'student', select: 'personalInfo user' }
    ]);

    // Get organization profile with user email for notification
    const organizationProfile = await OrganizationProfile.findById(internship.organization)
      .populate('user', 'email');

    // Emit notification event (non-blocking) - APPLICATION_SUBMITTED
    setImmediate(() => {
      notificationService.emit('APPLICATION_SUBMITTED', {
        application,
        student: studentProfile,
        organization: organizationProfile
      });
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: application
    });
  } catch (error) {
    console.error('Submit application error:', error);

    // ✅ Handle Mongoose validation errors
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

    // ✅ Handle CastError (invalid ObjectId)
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid ID format',
        field: error.path
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to submit application'
    });
  }
};

/**
 * @desc    Get student's applications
 * @route   GET /api/applications
 * @access  Private (Student only)
 */
export const getMyApplications = async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        error: 'Only students can access this route'
      });
    }

    const studentProfile = await StudentProfile.findOne({ user: req.user._id });
    if (!studentProfile) {
      return res.status(404).json({
        success: false,
        error: 'Student profile not found'
      });
    }

    const applications = await Application.find({ student: studentProfile._id })
      .populate({
        path: 'internship',
        populate: { path: 'organization', select: 'companyInfo' }
      })
      .sort({ createdAt: -1 })
      .lean(); // ✅ Use lean() for better performance

    // ✅ Filter out applications with deleted internships
    const validApplications = applications.filter(app => app.internship !== null);

    res.json({
      success: true,
      data: validApplications
    });
  } catch (error) {
    console.error('Get applications error:', error);

    // ✅ Better error logging for debugging
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });

    // ✅ Handle database connection errors
    if (error.name === 'MongooseError' || error.name === 'MongoError' ||
        error.message.includes('buffering timed out') ||
        error.message.includes('ECONNREFUSED')) {
      return res.status(503).json({
        success: false,
        error: 'Service temporarily unavailable. Please try again in a moment.'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to retrieve applications',
      ...(process.env.NODE_ENV === 'development' && { details: error.message })
    });
  }
};

/**
 * @desc    Get applications for internship
 * @route   GET /api/applications/internship/:id
 * @access  Private (Organization owner only)
 */
export const getInternshipApplications = async (req, res) => {
  try {
    if (req.user.role !== 'organization') {
      return res.status(403).json({
        success: false,
        error: 'Only organizations can access this route'
      });
    }

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
        error: 'Not authorized to view these applications'
      });
    }

    const applications = await Application.find({ internship: req.params.id })
      .populate({
        path: 'student',
        populate: { path: 'user', select: 'email subscription' }
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: applications
    });
  } catch (error) {
    console.error('Get internship applications error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve applications'
    });
  }
};

/**
 * @desc    Update application status
 * @route   PATCH /api/applications/:id/status
 * @access  Private (Organization owner only)
 */
export const updateApplicationStatus = async (req, res) => {
  try {
    if (req.user.role !== 'organization') {
      return res.status(403).json({
        success: false,
        error: 'Only organizations can update application status'
      });
    }

    const { status } = req.body;
    const validStatuses = ['submitted', 'under-review', 'shortlisted', 'interview', 'offered', 'accepted', 'rejected'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status'
      });
    }

    const application = await Application.findById(req.params.id)
      .populate({
        path: 'internship',
        populate: { path: 'organization' }
      });

    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Application not found'
      });
    }

    // Verify ownership
    if (application.internship.organization.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this application'
      });
    }

    // Store previous status for notification
    const previousStatus = application.status;
    application.status = status;
    await application.save();

    // Populate student with user for notification
    await application.populate({
      path: 'student',
      populate: { path: 'user', select: 'email' }
    });

    // Emit notification events (non-blocking)
    setImmediate(() => {
      // APPLICATION_STATUS_CHANGED - notify student
      notificationService.emit('APPLICATION_STATUS_CHANGED', {
        application,
        previousStatus,
        newStatus: status,
        student: application.student
      });

      // Special case: OFFER_EXTENDED
      if (status === 'offered') {
        notificationService.emit('OFFER_EXTENDED', {
          application,
          student: application.student
        });
      }
    });

    res.json({
      success: true,
      message: 'Application status updated',
      data: application
    });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update application status'
    });
  }
};

/**
 * @desc    Withdraw application
 * @route   DELETE /api/applications/:id
 * @access  Private (Student owner only)
 */
export const withdrawApplication = async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        error: 'Only students can withdraw applications'
      });
    }

    const studentProfile = await StudentProfile.findOne({ user: req.user._id });
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Application not found'
      });
    }

    // Verify ownership
    if (application.student.toString() !== studentProfile._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to withdraw this application'
      });
    }

    application.status = 'withdrawn';
    await application.save();

    res.json({
      success: true,
      message: 'Application withdrawn successfully'
    });
  } catch (error) {
    console.error('Withdraw application error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to withdraw application'
    });
  }
};

/**
 * @desc    Get ALL applications for organization (OPTIMIZED - single query)
 * @route   GET /api/applications/organization
 * @access  Private (Organization only)
 */
export const getOrganizationApplications = async (req, res) => {
  try {
    if (req.user.role !== 'organization') {
      return res.status(403).json({
        success: false,
        error: 'Only organizations can access this route'
      });
    }

    // Get organization profile
    const orgProfile = await OrganizationProfile.findOne({ user: req.user._id });
    if (!orgProfile) {
      return res.status(404).json({
        success: false,
        error: 'Organization profile not found'
      });
    }

    // Get pagination params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    const status = req.query.status;

    // Get all internship IDs for this organization in one query
    const internshipIds = await Internship.find(
      { organization: orgProfile._id },
      { _id: 1 }
    ).lean();

    const ids = internshipIds.map(i => i._id);

    // Build query
    const query = { internship: { $in: ids } };
    if (status && status !== 'all') {
      query.status = status;
    }

    // Get total count for pagination
    const total = await Application.countDocuments(query);

    // Get all applications in ONE query with pagination
    const applications = await Application.find(query)
      .populate({
        path: 'student',
        select: 'personalInfo user',
        populate: { path: 'user', select: 'email subscription' }
      })
      .populate({
        path: 'internship',
        select: 'title status timeline location'
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.json({
      success: true,
      data: applications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get organization applications error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve applications'
    });
  }
};
