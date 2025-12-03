// backend/src/services/analytics.service.js

/**
 * Analytics Service for Organizations
 * Provides detailed metrics and insights for internship postings
 */

import Internship from '../models/Internship.js';
import Application from '../models/Application.js';
import StudentProfile from '../models/StudentProfile.js';

/**
 * Get overview analytics for organization
 */
export const getOrganizationAnalytics = async (organizationId, timeRange = '30d') => {
  const now = new Date();
  let startDate;

  // Calculate start date based on time range
  switch (timeRange) {
    case '7d':
      startDate = new Date(now.setDate(now.getDate() - 7));
      break;
    case '30d':
      startDate = new Date(now.setDate(now.getDate() - 30));
      break;
    case '90d':
      startDate = new Date(now.setDate(now.getDate() - 90));
      break;
    case '1y':
      startDate = new Date(now.setFullYear(now.getFullYear() - 1));
      break;
    default:
      startDate = new Date(now.setDate(now.getDate() - 30));
  }

  // Get all internships for organization
  const internships = await Internship.find({ organization: organizationId });
  const internshipIds = internships.map(i => i._id);

  // Get all applications for these internships
  const applications = await Application.find({
    internship: { $in: internshipIds }
  }).populate('student');

  // Calculate metrics
  const totalInternships = internships.length;
  const activeInternships = internships.filter(i => i.status === 'active').length;
  const totalApplications = applications.length;
  const totalViews = internships.reduce((sum, i) => sum + (i.statistics?.views || 0), 0);

  // Application status breakdown
  const statusBreakdown = {
    submitted: 0,
    'under-review': 0,
    shortlisted: 0,
    interview: 0,
    offered: 0,
    accepted: 0,
    rejected: 0
  };

  applications.forEach(app => {
    if (statusBreakdown.hasOwnProperty(app.status)) {
      statusBreakdown[app.status]++;
    }
  });

  // Calculate conversion rates
  const conversionRate = totalViews > 0
    ? ((totalApplications / totalViews) * 100).toFixed(2)
    : 0;

  const offerAcceptanceRate = statusBreakdown.offered > 0
    ? ((statusBreakdown.accepted / statusBreakdown.offered) * 100).toFixed(2)
    : 0;

  // Top performing internships
  const topInternships = internships
    .sort((a, b) => (b.statistics?.applications || 0) - (a.statistics?.applications || 0))
    .slice(0, 5)
    .map(i => ({
      id: i._id,
      title: i.title,
      applications: i.statistics?.applications || 0,
      views: i.statistics?.views || 0,
      conversionRate: i.statistics?.views > 0
        ? (((i.statistics?.applications || 0) / i.statistics.views) * 100).toFixed(2)
        : 0
    }));

  // Application trends (last 30 days)
  const trends = await getApplicationTrends(internshipIds, 30);

  // Student demographics
  const demographics = await getApplicantDemographics(applications);

  return {
    overview: {
      totalInternships,
      activeInternships,
      totalApplications,
      totalViews,
      conversionRate: `${conversionRate}%`,
      offerAcceptanceRate: `${offerAcceptanceRate}%`
    },
    statusBreakdown,
    topInternships,
    trends,
    demographics
  };
};

/**
 * Get application trends over time
 */
const getApplicationTrends = async (internshipIds, days) => {
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - days);

  const applications = await Application.find({
    internship: { $in: internshipIds },
    createdAt: { $gte: startDate }
  }).sort({ createdAt: 1 });

  // Group by date
  const trendMap = {};
  applications.forEach(app => {
    const dateKey = app.createdAt.toISOString().split('T')[0];
    trendMap[dateKey] = (trendMap[dateKey] || 0) + 1;
  });

  // Fill in missing dates with 0
  const trends = [];
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateKey = date.toISOString().split('T')[0];
    trends.push({
      date: dateKey,
      applications: trendMap[dateKey] || 0
    });
  }

  return trends;
};

/**
 * Get applicant demographics
 */
const getApplicantDemographics = async (applications) => {
  const demographics = {
    education: {},
    skills: {},
    experience: {}
  };

  applications.forEach(app => {
    const student = app.student;

    // Education level
    if (student.education && student.education.length > 0) {
      const degree = student.education[0].degree || 'Not specified';
      demographics.education[degree] = (demographics.education[degree] || 0) + 1;
    }

    // Top skills
    if (student.skills && student.skills.length > 0) {
      student.skills.slice(0, 5).forEach(skill => {
        const skillName = skill.name;
        demographics.skills[skillName] = (demographics.skills[skillName] || 0) + 1;
      });
    }

    // Experience level
    const expCount = student.experience?.length || 0;
    let level;
    if (expCount === 0) level = 'No experience';
    else if (expCount <= 2) level = '1-2 experiences';
    else level = '3+ experiences';
    demographics.experience[level] = (demographics.experience[level] || 0) + 1;
  });

  // Convert to arrays and sort
  return {
    education: Object.entries(demographics.education)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count),
    topSkills: Object.entries(demographics.skills)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10),
    experience: Object.entries(demographics.experience)
      .map(([level, count]) => ({ level, count }))
      .sort((a, b) => b.count - a.count)
  };
};

/**
 * Get detailed analytics for specific internship
 */
export const getInternshipAnalytics = async (internshipId) => {
  const internship = await Internship.findById(internshipId).populate('organization');

  if (!internship) {
    throw new Error('Internship not found');
  }

  const applications = await Application.find({ internship: internshipId })
    .populate('student')
    .sort({ createdAt: -1 });

  // Calculate time-to-apply (days from posting to application)
  const timeToApply = applications.map(app => {
    const days = Math.floor((app.createdAt - internship.createdAt) / (1000 * 60 * 60 * 24));
    return days;
  });

  const avgTimeToApply = timeToApply.length > 0
    ? (timeToApply.reduce((sum, days) => sum + days, 0) / timeToApply.length).toFixed(1)
    : 0;

  // Status breakdown
  const statusCounts = {};
  applications.forEach(app => {
    statusCounts[app.status] = (statusCounts[app.status] || 0) + 1;
  });

  // Application quality score (based on profile completeness)
  const qualityScores = applications.map(app => {
    let score = 0;
    const student = app.student;

    if (student.education?.length > 0) score += 25;
    if (student.skills?.length >= 3) score += 25;
    if (student.experience?.length > 0) score += 25;
    if (student.personalInfo?.summary) score += 25;

    return score;
  });

  const avgQualityScore = qualityScores.length > 0
    ? (qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length).toFixed(1)
    : 0;

  return {
    internship: {
      id: internship._id,
      title: internship.title,
      status: internship.status,
      createdAt: internship.createdAt,
      views: internship.statistics?.views || 0,
      applications: applications.length
    },
    metrics: {
      totalApplications: applications.length,
      conversionRate: internship.statistics?.views > 0
        ? (((applications.length / internship.statistics.views) * 100).toFixed(2) + '%')
        : '0%',
      avgTimeToApply: `${avgTimeToApply} days`,
      avgQualityScore: `${avgQualityScore}%`
    },
    statusBreakdown: statusCounts,
    recentApplications: applications.slice(0, 10).map(app => ({
      id: app._id,
      studentName: `${app.student.personalInfo?.firstName} ${app.student.personalInfo?.lastName}`,
      status: app.status,
      appliedAt: app.createdAt,
      qualityScore: qualityScores[applications.indexOf(app)]
    }))
  };
};

export default {
  getOrganizationAnalytics,
  getInternshipAnalytics
};
