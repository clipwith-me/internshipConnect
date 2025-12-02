// backend/src/controllers/premium.controller.js

import {
  generateResumeOptimizationTips,
  generateInterviewPreparationGuide,
  hasPrioritySupport,
  getPriorityBadgeData
} from '../services/premium.service.js';
import Resume from '../models/Resume.js';
import Internship from '../models/Internship.js';
import StudentProfile from '../models/StudentProfile.js';
import User from '../models/User.js';

/**
 * @desc    Get resume optimization tips (Premium feature)
 * @route   GET /api/premium/resume-tips/:resumeId
 * @access  Private (Premium/Pro students)
 */
export const getResumeOptimizationTips = async (req, res) => {
  try {
    // Check if user has premium/pro plan
    const user = await User.findById(req.user._id);
    const plan = user.subscription?.plan || 'free';

    if (!['premium', 'pro'].includes(plan)) {
      return res.status(403).json({
        success: false,
        error: 'This feature requires a Premium or Pro subscription',
        upgradeRequired: true,
        feature: 'Resume Optimization Tips'
      });
    }

    // Get resume
    const resume = await Resume.findById(req.params.resumeId).populate('student');

    if (!resume) {
      return res.status(404).json({
        success: false,
        error: 'Resume not found'
      });
    }

    // Verify ownership
    if (resume.student.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'You can only view tips for your own resumes'
      });
    }

    // Generate optimization tips
    const optimizationTips = generateResumeOptimizationTips(
      resume,
      resume.aiGenerated?.analysis || {}
    );

    res.json({
      success: true,
      data: optimizationTips
    });
  } catch (error) {
    console.error('Get resume optimization tips error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate optimization tips'
    });
  }
};

/**
 * @desc    Get interview preparation guide (Premium feature)
 * @route   GET /api/premium/interview-guide/:internshipId
 * @access  Private (Premium/Pro students)
 */
export const getInterviewPreparationGuide = async (req, res) => {
  try {
    // Check if user has premium/pro plan
    const user = await User.findById(req.user._id);
    const plan = user.subscription?.plan || 'free';

    if (!['premium', 'pro'].includes(plan)) {
      return res.status(403).json({
        success: false,
        error: 'This feature requires a Premium or Pro subscription',
        upgradeRequired: true,
        feature: 'Interview Preparation Guide'
      });
    }

    // Get student profile
    const studentProfile = await StudentProfile.findOne({ user: req.user._id });

    if (!studentProfile) {
      return res.status(404).json({
        success: false,
        error: 'Student profile not found'
      });
    }

    // Get internship
    const internship = await Internship.findById(req.params.internshipId)
      .populate('organization');

    if (!internship) {
      return res.status(404).json({
        success: false,
        error: 'Internship not found'
      });
    }

    // Generate interview preparation guide
    const guide = generateInterviewPreparationGuide(studentProfile, internship);

    res.json({
      success: true,
      data: guide
    });
  } catch (error) {
    console.error('Get interview preparation guide error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate interview guide'
    });
  }
};

/**
 * @desc    Check priority support eligibility
 * @route   GET /api/premium/priority-support/check
 * @access  Private
 */
export const checkPrioritySupportEligibility = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const eligible = hasPrioritySupport(user);

    res.json({
      success: true,
      data: {
        eligible,
        plan: user.subscription?.plan || 'free',
        message: eligible
          ? 'You have access to priority customer support'
          : 'Upgrade to Premium or Pro for priority support'
      }
    });
  } catch (error) {
    console.error('Check priority support error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check eligibility'
    });
  }
};

/**
 * @desc    Get priority badge data
 * @route   GET /api/premium/priority-badge
 * @access  Private (Students only)
 */
export const getPriorityBadge = async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        error: 'Only students can have priority badges'
      });
    }

    const user = await User.findById(req.user._id);
    const badgeData = getPriorityBadgeData(user);

    res.json({
      success: true,
      data: badgeData
    });
  } catch (error) {
    console.error('Get priority badge error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get badge data'
    });
  }
};

/**
 * @desc    Get all premium features status
 * @route   GET /api/premium/features
 * @access  Private (Students only)
 */
export const getPremiumFeaturesStatus = async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        error: 'Premium features are only available for students'
      });
    }

    const user = await User.findById(req.user._id);
    const plan = user.subscription?.plan || 'free';

    // Get resume usage this month
    const studentProfile = await StudentProfile.findOne({ user: req.user._id });
    const monthlyResumes = studentProfile
      ? await Resume.getMonthlyUsage(studentProfile._id)
      : 0;

    const features = {
      plan,
      aiResumeLimit: plan === 'free' ? 3 : plan === 'premium' ? 10 : -1,
      aiResumesUsed: monthlyResumes,
      aiResumesRemaining: plan === 'free'
        ? Math.max(0, 3 - monthlyResumes)
        : plan === 'premium'
        ? Math.max(0, 10 - monthlyResumes)
        : -1, // -1 means unlimited

      features: {
        aiInternshipMatching: plan !== 'free',
        advancedSearchFilters: plan !== 'free',
        priorityApplicationBadge: plan !== 'free',
        resumeOptimizationTips: plan !== 'free',
        interviewPreparationGuide: plan !== 'free',
        priorityCustomerSupport: plan !== 'free',
        directMessaging: plan === 'pro',
        featuredProfile: plan === 'pro',
        unlimitedAIResumes: plan === 'pro'
      },

      upgradeAvailable: plan !== 'pro',
      currentTier: plan,
      nextTier: plan === 'free' ? 'premium' : plan === 'premium' ? 'pro' : null
    };

    res.json({
      success: true,
      data: features
    });
  } catch (error) {
    console.error('Get premium features status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get features status'
    });
  }
};

export default {
  getResumeOptimizationTips,
  getInterviewPreparationGuide,
  checkPrioritySupportEligibility,
  getPriorityBadge,
  getPremiumFeaturesStatus
};
