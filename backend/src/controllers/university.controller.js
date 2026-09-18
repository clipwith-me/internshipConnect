// backend/src/controllers/university.controller.js
import mongoose from 'mongoose';
import { University, StudentProfile, Application } from '../models/index.js';

/**
 * University layer controller.
 *
 * A university account is a school's career-services / SIWES coordinator.
 * Everything here reads real platform data (student profiles, applications)
 * scoped to the students affiliated with the requesting university.
 */

// Helper: resolve the University document owned by the logged-in user.
async function requireUniversity(req, res) {
  const uni = await University.findOne({ user: req.user._id });
  if (!uni) {
    res.status(404).json({ success: false, message: 'University profile not found' });
    return null;
  }
  return uni;
}

/**
 * GET /api/universities
 * Public directory used by the student "join your university" selector.
 * Returns only the fields a student needs to pick their school.
 */
export const listUniversities = async (req, res) => {
  try {
    const q = (req.query.search || '').trim();
    const filter = q
      ? { name: { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } }
      : {};
    const universities = await University.find(filter)
      .select('name shortName location.state location.city isVerified')
      .sort({ name: 1 })
      .limit(200)
      .lean();
    res.json({ success: true, data: universities });
  } catch (err) {
    console.error('listUniversities error:', err);
    res.status(500).json({ success: false, message: 'Failed to load universities' });
  }
};

/**
 * GET /api/universities/me — the logged-in university's own profile.
 */
export const getMyUniversity = async (req, res) => {
  try {
    const uni = await requireUniversity(req, res);
    if (!uni) return;
    res.json({ success: true, data: uni });
  } catch (err) {
    console.error('getMyUniversity error:', err);
    res.status(500).json({ success: false, message: 'Failed to load university profile' });
  }
};

/**
 * PUT /api/universities/me — update profile details.
 */
export const updateMyUniversity = async (req, res) => {
  try {
    const uni = await requireUniversity(req, res);
    if (!uni) return;
    const { name, shortName, contact, location, website } = req.body;
    if (name) uni.name = name;
    if (shortName !== undefined) uni.shortName = shortName;
    if (contact) uni.contact = { ...uni.contact?.toObject?.() ?? uni.contact, ...contact };
    if (location) uni.location = { ...uni.location?.toObject?.() ?? uni.location, ...location };
    if (website !== undefined) uni.website = website;
    await uni.save();
    res.json({ success: true, data: uni });
  } catch (err) {
    console.error('updateMyUniversity error:', err);
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
};

/**
 * GET /api/universities/me/dashboard
 * Aggregated KPIs for this university's affiliated students.
 */
export const getDashboard = async (req, res) => {
  try {
    const uni = await requireUniversity(req, res);
    if (!uni) return;

    // Affiliated student profiles
    const students = await StudentProfile.find({ university: uni._id })
      .select('_id')
      .lean();
    const studentIds = students.map((s) => s._id);
    const totalStudents = studentIds.length;

    let applicationsSubmitted = 0;
    let placements = 0;
    let activeStudents = 0;
    let topEmployers = [];
    let statusBreakdown = {};

    if (totalStudents > 0) {
      applicationsSubmitted = await Application.countDocuments({ student: { $in: studentIds } });

      // "Placement" = an accepted offer.
      placements = await Application.countDocuments({
        student: { $in: studentIds },
        status: 'accepted',
      });

      // Active = students who have submitted at least one application.
      const activeAgg = await Application.distinct('student', { student: { $in: studentIds } });
      activeStudents = activeAgg.length;

      // Status breakdown across all their applications.
      const breakdownAgg = await Application.aggregate([
        { $match: { student: { $in: studentIds } } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]);
      statusBreakdown = breakdownAgg.reduce((acc, r) => {
        acc[r._id || 'unknown'] = r.count;
        return acc;
      }, {});

      // Top employers hiring this university's students (by application volume).
      topEmployers = await Application.aggregate([
        { $match: { student: { $in: studentIds } } },
        {
          $lookup: {
            from: 'internships',
            localField: 'internship',
            foreignField: '_id',
            as: 'internship',
          },
        },
        { $unwind: '$internship' },
        {
          $lookup: {
            from: 'organizationprofiles',
            localField: 'internship.organization',
            foreignField: '_id',
            as: 'org',
          },
        },
        { $unwind: '$org' },
        {
          $group: {
            _id: '$org._id',
            name: { $first: '$org.companyInfo.name' },
            applications: { $sum: 1 },
          },
        },
        { $sort: { applications: -1 } },
        { $limit: 5 },
      ]);
    }

    res.json({
      success: true,
      data: {
        university: { id: uni._id, name: uni.name, joinCode: uni.joinCode },
        kpis: {
          totalStudents,
          activeStudents,
          applicationsSubmitted,
          placements,
        },
        statusBreakdown,
        topEmployers,
      },
    });
  } catch (err) {
    console.error('getDashboard error:', err);
    res.status(500).json({ success: false, message: 'Failed to load dashboard' });
  }
};

/**
 * GET /api/universities/me/students
 * Roster of affiliated students with their live application/placement status.
 */
export const getStudents = async (req, res) => {
  try {
    const uni = await requireUniversity(req, res);
    if (!uni) return;

    const students = await StudentProfile.find({ university: uni._id })
      .select('personalInfo education universityJoinedAt user')
      .populate('user', 'email createdAt')
      .sort({ universityJoinedAt: -1 })
      .lean();

    const ids = students.map((s) => s._id);

    // Per-student application counts + placement flag, in one pass.
    const agg = ids.length
      ? await Application.aggregate([
          { $match: { student: { $in: ids } } },
          {
            $group: {
              _id: '$student',
              applications: { $sum: 1 },
              placements: {
                $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] },
              },
              lastStatus: { $last: '$status' },
            },
          },
        ])
      : [];
    const byStudent = agg.reduce((acc, r) => {
      acc[r._id.toString()] = r;
      return acc;
    }, {});

    const roster = students.map((s) => {
      const stats = byStudent[s._id.toString()] || {};
      return {
        id: s._id,
        name: `${s.personalInfo?.firstName || ''} ${s.personalInfo?.lastName || ''}`.trim() || 'Unnamed student',
        email: s.user?.email || '',
        course: s.education?.[0]?.fieldOfStudy || s.education?.[0]?.institution || '',
        joinedAt: s.universityJoinedAt,
        applications: stats.applications || 0,
        placements: stats.placements || 0,
        placed: (stats.placements || 0) > 0,
      };
    });

    res.json({ success: true, data: roster });
  } catch (err) {
    console.error('getStudents error:', err);
    res.status(500).json({ success: false, message: 'Failed to load students' });
  }
};

/**
 * POST /api/universities/join   (student only)
 * Body: { joinCode } or { universityId }
 * Affiliates the logged-in student with a university.
 */
export const joinUniversity = async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ success: false, message: 'Only students can join a university' });
    }
    const { joinCode, universityId } = req.body;

    let uni;
    if (joinCode) {
      uni = await University.findOne({ joinCode: String(joinCode).toUpperCase().trim() });
    } else if (universityId && mongoose.isValidObjectId(universityId)) {
      uni = await University.findById(universityId);
    }
    if (!uni) {
      return res.status(404).json({ success: false, message: 'University not found. Check the code and try again.' });
    }

    const profile = await StudentProfile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }
    profile.university = uni._id;
    profile.universityJoinedAt = new Date();
    await profile.save();

    res.json({
      success: true,
      message: `You're now linked to ${uni.name}.`,
      data: { universityId: uni._id, name: uni.name },
    });
  } catch (err) {
    console.error('joinUniversity error:', err);
    res.status(500).json({ success: false, message: 'Failed to join university' });
  }
};

/**
 * POST /api/universities/leave  (student only) — unlink.
 */
export const leaveUniversity = async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({ user: req.user._id });
    if (!profile) return res.status(404).json({ success: false, message: 'Student profile not found' });
    profile.university = null;
    profile.universityJoinedAt = null;
    await profile.save();
    res.json({ success: true, message: 'You have left your university.' });
  } catch (err) {
    console.error('leaveUniversity error:', err);
    res.status(500).json({ success: false, message: 'Failed to leave university' });
  }
};
