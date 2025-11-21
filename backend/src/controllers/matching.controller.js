// backend/src/controllers/matching.controller.js

import Internship from '../models/Internship.js';
import StudentProfile from '../models/StudentProfile.js';
import Application from '../models/Application.js';

/**
 * @desc    Get AI-powered internship recommendations for student
 * @route   GET /api/matching/recommendations
 * @access  Private (Student only)
 */
export const getRecommendations = async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        error: 'Only students can get recommendations'
      });
    }

    const { limit = 10 } = req.query;

    // Get student profile
    const studentProfile = await StudentProfile.findOne({ user: req.user._id });

    if (!studentProfile) {
      return res.status(404).json({
        success: false,
        error: 'Student profile not found. Please complete your profile first.'
      });
    }

    // Get student's existing applications to exclude
    const existingApplications = await Application.find({
      student: studentProfile._id
    }).select('internship');
    const appliedInternshipIds = existingApplications.map(app => app.internship.toString());

    // Get active internships
    const activeInternships = await Internship.find({
      status: 'active',
      _id: { $nin: appliedInternshipIds }
    }).populate('organization');

    // Calculate match scores using AI algorithm
    const scoredInternships = activeInternships.map(internship => {
      const matchScore = calculateMatchScore(studentProfile, internship);
      return {
        internship,
        matchScore: matchScore.score,
        matchReasons: matchScore.reasons,
        skillsMatch: matchScore.skillsMatch
      };
    });

    // Sort by match score and limit results
    const recommendations = scoredInternships
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, parseInt(limit));

    res.json({
      success: true,
      data: recommendations,
      total: recommendations.length
    });
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get recommendations'
    });
  }
};

/**
 * Calculate match score between student profile and internship
 * AI-powered matching algorithm
 */
function calculateMatchScore(studentProfile, internship) {
  let score = 0;
  const reasons = [];
  const skillsMatch = [];

  // 1. Skills Matching (40% weight)
  const studentSkills = studentProfile.skills?.map(s => s.name.toLowerCase()) || [];
  const requiredSkills = internship.requirements?.skills?.map(s => s.toLowerCase()) || [];

  if (requiredSkills.length > 0 && studentSkills.length > 0) {
    const matchingSkills = studentSkills.filter(skill =>
      requiredSkills.some(req => req.includes(skill) || skill.includes(req))
    );

    const skillMatchPercentage = (matchingSkills.length / requiredSkills.length) * 100;
    const skillScore = (skillMatchPercentage / 100) * 40;
    score += skillScore;

    if (matchingSkills.length > 0) {
      reasons.push(`You have ${matchingSkills.length} of ${requiredSkills.length} required skills`);
      skillsMatch.push(...matchingSkills);
    }
  }

  // 2. Education Level Matching (20% weight)
  const studentEducation = studentProfile.education?.[0];
  const requiredEducation = internship.requirements?.educationLevel;

  if (studentEducation && requiredEducation) {
    const educationLevels = ['high-school', 'associate', 'bachelor', 'master', 'phd'];
    const studentLevel = educationLevels.indexOf(studentEducation.degree?.toLowerCase());
    const requiredLevel = educationLevels.indexOf(requiredEducation.toLowerCase());

    if (studentLevel >= requiredLevel) {
      score += 20;
      reasons.push('Your education level meets requirements');
    } else {
      score += 10;
      reasons.push('Close education level match');
    }
  }

  // 3. Location Preference (15% weight)
  const studentLocation = studentProfile.personalInfo?.location;
  const internshipLocation = internship.location;

  if (internshipLocation?.type === 'remote') {
    score += 15;
    reasons.push('Remote position - location flexible');
  } else if (studentLocation && internshipLocation) {
    if (studentLocation.city?.toLowerCase() === internshipLocation.city?.toLowerCase()) {
      score += 15;
      reasons.push('Located in your city');
    } else if (studentLocation.country?.toLowerCase() === internshipLocation.country?.toLowerCase()) {
      score += 10;
      reasons.push('Located in your country');
    } else {
      score += 5;
    }
  }

  // 4. Industry/Field Preference (15% weight)
  const studentPreferences = studentProfile.preferences;
  const internshipIndustry = internship.organization?.companyInfo?.industry;

  if (studentPreferences?.industries?.includes(internshipIndustry)) {
    score += 15;
    reasons.push('Matches your industry preference');
  } else if (internshipIndustry) {
    score += 7;
  }

  // 5. Experience Level (10% weight)
  const studentExperience = studentProfile.experience?.length || 0;
  const requiredExperience = internship.requirements?.experienceLevel;

  if (requiredExperience === 'entry-level' || requiredExperience === 'internship') {
    score += 10;
    reasons.push('Entry-level position - perfect for you');
  } else if (studentExperience > 0) {
    score += 8;
    reasons.push('Your experience is valuable for this role');
  } else {
    score += 5;
  }

  // 6. Compensation Match (bonus points, not weighted)
  if (internship.compensation?.type === 'paid') {
    score += 5;
    reasons.push('Paid internship');
  }

  // Normalize score to 0-100 range
  score = Math.min(Math.max(score, 0), 100);

  return {
    score: Math.round(score),
    reasons: reasons.slice(0, 3), // Top 3 reasons
    skillsMatch
  };
}

/**
 * @desc    Get match score for specific internship
 * @route   GET /api/matching/score/:internshipId
 * @access  Private (Student only)
 */
export const getMatchScore = async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        error: 'Only students can get match scores'
      });
    }

    const studentProfile = await StudentProfile.findOne({ user: req.user._id });

    if (!studentProfile) {
      return res.status(404).json({
        success: false,
        error: 'Student profile not found'
      });
    }

    const internship = await Internship.findById(req.params.internshipId)
      .populate('organization');

    if (!internship) {
      return res.status(404).json({
        success: false,
        error: 'Internship not found'
      });
    }

    const matchScore = calculateMatchScore(studentProfile, internship);

    res.json({
      success: true,
      data: {
        internshipId: internship._id,
        matchScore: matchScore.score,
        matchReasons: matchScore.reasons,
        skillsMatch: matchScore.skillsMatch
      }
    });
  } catch (error) {
    console.error('Get match score error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate match score'
    });
  }
};

/**
 * FUTURE ENHANCEMENT: Advanced AI Matching
 *
 * This could be enhanced with:
 * 1. Machine Learning models trained on successful applications
 * 2. Natural Language Processing for better skill matching
 * 3. Career path analysis and recommendations
 * 4. Collaborative filtering (students similar to you applied to...)
 * 5. Time-series analysis for optimal application timing
 *
 * Example with embeddings:
 *
 * async function calculateAdvancedMatchScore(studentProfile, internship) {
 *   // Generate embeddings for student skills and internship requirements
 *   const studentEmbedding = await generateEmbedding(studentProfile.skills.join(' '));
 *   const internshipEmbedding = await generateEmbedding(internship.requirements.description);
 *
 *   // Calculate cosine similarity
 *   const similarityScore = cosineSimilarity(studentEmbedding, internshipEmbedding);
 *
 *   // Combine with other factors using weighted scoring
 *   return combineScores([
 *     { score: similarityScore, weight: 0.5 },
 *     { score: educationMatch, weight: 0.2 },
 *     { score: locationMatch, weight: 0.15 },
 *     { score: experienceMatch, weight: 0.15 }
 *   ]);
 * }
 */
