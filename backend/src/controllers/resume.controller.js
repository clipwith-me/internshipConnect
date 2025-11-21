// backend/src/controllers/resume.controller.js
import Resume from '../models/Resume.js';
import StudentProfile from '../models/StudentProfile.js';
import OrganizationProfile from '../models/OrganizationProfile.js';
import Application from '../models/Application.js';
import Internship from '../models/Internship.js';
import User from '../models/User.js';
import { generateResume as generateAIResumeContent } from '../services/ai.service.js';

/**
 * @desc    Generate AI resume
 * @route   POST /api/resumes/generate
 * @access  Private (Student only)
 */
export const generateAIResume = async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        error: 'Only students can generate resumes'
      });
    }

    const { customization } = req.body;
    const studentProfile = await StudentProfile.findOne({ user: req.user._id });

    if (!studentProfile) {
      return res.status(404).json({
        success: false,
        error: 'Student profile not found'
      });
    }

    // Check monthly limit based on subscription plan
    const monthlyUsage = await Resume.getMonthlyUsage(studentProfile._id);
    const user = await User.findById(req.user._id);
    const subscriptionPlan = user.subscription?.plan || 'free';

    const limits = {
      free: 3,
      premium: 10,
      pro: -1 // unlimited
    };

    if (limits[subscriptionPlan] !== -1 && monthlyUsage >= limits[subscriptionPlan]) {
      return res.status(403).json({
        success: false,
        error: `${subscriptionPlan === 'free' ? 'Free' : 'Premium'} plan allows ${limits[subscriptionPlan]} AI resumes per month. Upgrade to ${subscriptionPlan === 'free' ? 'Premium' : 'Pro'} for ${subscriptionPlan === 'free' ? 'more' : 'unlimited'}.`,
        upgradeRequired: true
      });
    }

    // Generate AI resume using the AI service
    const aiResult = await generateAIResumeContent(studentProfile, customization || {});
    const { personalInfo } = studentProfile;

    const fileName = `${personalInfo?.firstName}_${personalInfo?.lastName}_resume_${Date.now()}.pdf`
      .toLowerCase()
      .replace(/\s+/g, '_');

    const mockFileUrl = `https://res.cloudinary.com/internshipconnect/resumes/${fileName}`;
    const mockPublicId = `resumes/${Date.now()}`;

    const resume = await Resume.create({
      student: studentProfile._id,
      aiGenerated: {
        fileName,
        fileUrl: mockFileUrl,
        publicId: mockPublicId,
        generatedAt: new Date(),
        customization: {
          targetRole: customization?.targetRole || 'Internship Position',
          targetCompany: customization?.targetCompany,
          targetIndustry: customization?.targetIndustry || 'General',
          template: customization?.template || 'professional',
          emphasis: customization?.emphasis || [],
          aiModel: aiResult.aiModel,
          prompt: aiResult.prompt
        },
        analysis: aiResult.analysis
      },
      status: 'active',
      version: monthlyUsage + 1
    });

    res.status(201).json({
      success: true,
      message: 'Resume generated successfully',
      data: resume,
      resumeContent: aiResult.content,
      usage: {
        current: monthlyUsage + 1,
        limit: limits[subscriptionPlan] === -1 ? 'unlimited' : limits[subscriptionPlan]
      }
    });
  } catch (error) {
    console.error('Generate resume error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate resume'
    });
  }
};

/**
 * @desc    Get all resumes
 * @route   GET /api/resumes
 * @access  Private (Student only)
 */
export const getMyResumes = async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        error: 'Only students can access resumes'
      });
    }

    const studentProfile = await StudentProfile.findOne({ user: req.user._id });
    if (!studentProfile) {
      return res.status(404).json({
        success: false,
        error: 'Student profile not found'
      });
    }

    const resumes = await Resume.find({ student: studentProfile._id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: resumes
    });
  } catch (error) {
    console.error('Get resumes error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve resumes'
    });
  }
};

/**
 * @desc    Get resume by ID
 * @route   GET /api/resumes/:id
 * @access  Private (Student owner only)
 */
export const getResumeById = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id)
      .populate('student');

    if (!resume) {
      return res.status(404).json({
        success: false,
        error: 'Resume not found'
      });
    }

    const studentProfile = await StudentProfile.findOne({ user: req.user._id });

    // Verify ownership
    if (resume.student._id.toString() !== studentProfile._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this resume'
      });
    }

    res.json({
      success: true,
      data: resume
    });
  } catch (error) {
    console.error('Get resume error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve resume'
    });
  }
};

/**
 * @desc    Delete resume
 * @route   DELETE /api/resumes/:id
 * @access  Private (Student owner only)
 */
export const deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({
        success: false,
        error: 'Resume not found'
      });
    }

    const studentProfile = await StudentProfile.findOne({ user: req.user._id });

    // Verify ownership
    if (resume.student.toString() !== studentProfile._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this resume'
      });
    }

    await resume.deleteOne();

    res.json({
      success: true,
      message: 'Resume deleted successfully'
    });
  } catch (error) {
    console.error('Delete resume error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete resume'
    });
  }
};

/**
 * @desc    View applicant's profile and resume (for organizations)
 * @route   GET /api/resumes/applicant/:applicationId
 * @access  Private (Organization that owns the internship)
 */
export const viewApplicantProfile = async (req, res) => {
  try {
    if (req.user.role !== 'organization') {
      return res.status(403).json({
        success: false,
        error: 'Only organizations can view applicant profiles'
      });
    }

    const { applicationId } = req.params;

    // Get the application
    const application = await Application.findById(applicationId)
      .populate('student')
      .populate('internship');

    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Application not found'
      });
    }

    // Get the organization profile
    const orgProfile = await OrganizationProfile.findOne({ user: req.user._id });
    if (!orgProfile) {
      return res.status(404).json({
        success: false,
        error: 'Organization profile not found'
      });
    }

    // Verify the internship belongs to this organization
    const internship = await Internship.findById(application.internship._id);
    if (!internship || internship.organization.toString() !== orgProfile._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this applicant'
      });
    }

    // Get the student profile with full details
    const studentProfile = await StudentProfile.findById(application.student._id)
      .populate('user', 'email');

    if (!studentProfile) {
      return res.status(404).json({
        success: false,
        error: 'Student profile not found'
      });
    }

    // Get the student's resumes
    const resumes = await Resume.find({ student: studentProfile._id })
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        application: {
          _id: application._id,
          status: application.status,
          coverLetter: application.coverLetter,
          coverLetterFile: application.coverLetterFile,
          createdAt: application.createdAt
        },
        student: {
          _id: studentProfile._id,
          email: studentProfile.user?.email,
          personalInfo: studentProfile.personalInfo,
          education: studentProfile.education,
          skills: studentProfile.skills,
          experience: studentProfile.experience
        },
        resumes: resumes.map(resume => ({
          _id: resume._id,
          fileName: resume.aiGenerated?.fileName || resume.originalFile?.fileName,
          fileUrl: resume.aiGenerated?.fileUrl || resume.originalFile?.fileUrl,
          createdAt: resume.createdAt,
          version: resume.version
        }))
      }
    });
  } catch (error) {
    console.error('View applicant profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve applicant profile'
    });
  }
};
