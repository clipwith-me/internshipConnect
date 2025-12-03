// backend/src/controllers/analytics.controller.js

/**
 * Analytics Controller for Organizations
 * Provides HTTP endpoints for analytics data
 */

import {
  getOrganizationAnalytics,
  getInternshipAnalytics
} from '../services/analytics.service.js';
import OrganizationProfile from '../models/OrganizationProfile.js';
import Internship from '../models/Internship.js';

/**
 * @desc    Get organization overview analytics
 * @route   GET /api/analytics/organization
 * @access  Private (Organization only)
 * @query   timeRange - '7d' | '30d' | '90d' | '1y'
 */
export const getOrganizationOverview = async (req, res) => {
  try {
    // Verify user is an organization
    if (req.user.role !== 'organization') {
      return res.status(403).json({
        success: false,
        error: 'This endpoint is only accessible to organizations'
      });
    }

    // Get organization profile
    const organizationProfile = await OrganizationProfile.findOne({
      user: req.user._id
    });

    if (!organizationProfile) {
      return res.status(404).json({
        success: false,
        error: 'Organization profile not found'
      });
    }

    // Get time range from query params (default: 30d)
    const timeRange = req.query.timeRange || '30d';
    const validRanges = ['7d', '30d', '90d', '1y'];

    if (!validRanges.includes(timeRange)) {
      return res.status(400).json({
        success: false,
        error: `Invalid time range. Must be one of: ${validRanges.join(', ')}`
      });
    }

    // Get analytics data
    const analytics = await getOrganizationAnalytics(
      organizationProfile._id,
      timeRange
    );

    res.json({
      success: true,
      data: {
        timeRange,
        ...analytics
      }
    });
  } catch (error) {
    console.error('Get organization analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch organization analytics',
      details: error.message
    });
  }
};

/**
 * @desc    Get analytics for specific internship
 * @route   GET /api/analytics/internship/:id
 * @access  Private (Organization owner only)
 */
export const getInternshipDetail = async (req, res) => {
  try {
    // Verify user is an organization
    if (req.user.role !== 'organization') {
      return res.status(403).json({
        success: false,
        error: 'This endpoint is only accessible to organizations'
      });
    }

    const { id } = req.params;

    // Validate internship ID
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Internship ID is required'
      });
    }

    // Get organization profile
    const organizationProfile = await OrganizationProfile.findOne({
      user: req.user._id
    });

    if (!organizationProfile) {
      return res.status(404).json({
        success: false,
        error: 'Organization profile not found'
      });
    }

    // Verify internship belongs to this organization
    const internship = await Internship.findOne({
      _id: id,
      organization: organizationProfile._id
    });

    if (!internship) {
      return res.status(404).json({
        success: false,
        error: 'Internship not found or you do not have access to it'
      });
    }

    // Get analytics data
    const analytics = await getInternshipAnalytics(id);

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Get internship analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch internship analytics',
      details: error.message
    });
  }
};

/**
 * @desc    Get analytics summary for dashboard
 * @route   GET /api/analytics/summary
 * @access  Private (Organization only)
 */
export const getAnalyticsSummary = async (req, res) => {
  try {
    // Verify user is an organization
    if (req.user.role !== 'organization') {
      return res.status(403).json({
        success: false,
        error: 'This endpoint is only accessible to organizations'
      });
    }

    // Get organization profile
    const organizationProfile = await OrganizationProfile.findOne({
      user: req.user._id
    });

    if (!organizationProfile) {
      return res.status(404).json({
        success: false,
        error: 'Organization profile not found'
      });
    }

    // Get quick summary (last 30 days)
    const analytics = await getOrganizationAnalytics(
      organizationProfile._id,
      '30d'
    );

    // Return only key metrics for dashboard summary
    res.json({
      success: true,
      data: {
        overview: analytics.overview,
        topInternships: analytics.topInternships.slice(0, 3), // Top 3 only
        recentTrend: analytics.trends.slice(-7) // Last 7 days
      }
    });
  } catch (error) {
    console.error('Get analytics summary error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics summary',
      details: error.message
    });
  }
};

export default {
  getOrganizationOverview,
  getInternshipDetail,
  getAnalyticsSummary
};
