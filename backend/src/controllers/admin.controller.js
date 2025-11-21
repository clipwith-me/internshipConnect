// backend/src/controllers/admin.controller.js

import User from '../models/User.js';
import StudentProfile from '../models/StudentProfile.js';
import OrganizationProfile from '../models/OrganizationProfile.js';
import Internship from '../models/Internship.js';
import Application from '../models/Application.js';
import Payment from '../models/Payment.js';

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/admin/stats
 * @access  Private (Admin only)
 */
export const getDashboardStats = async (req, res) => {
  try {
    // Get counts
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalOrganizations = await User.countDocuments({ role: 'organization' });
    const totalInternships = await Internship.countDocuments();
    const totalApplications = await Application.countDocuments();

    // Get active internships
    const activeInternships = await Internship.countDocuments({
      status: 'active',
      applicationDeadline: { $gte: new Date() }
    });

    // Get revenue this month
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const revenueThisMonth = await Payment.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: startOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    // Get growth metrics (compare with last month)
    const lastMonthStart = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1);
    const lastMonthEnd = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    const usersLastMonth = await User.countDocuments({
      createdAt: { $gte: lastMonthStart, $lt: lastMonthEnd }
    });

    const usersThisMonth = await User.countDocuments({
      createdAt: { $gte: startOfMonth }
    });

    const userGrowth = usersLastMonth > 0
      ? ((usersThisMonth - usersLastMonth) / usersLastMonth * 100).toFixed(1)
      : 0;

    res.json({
      success: true,
      data: {
        totalUsers,
        totalStudents,
        totalOrganizations,
        totalInternships,
        activeInternships,
        totalApplications,
        revenueThisMonth: revenueThisMonth[0]?.total || 0,
        userGrowth: `${userGrowth}%`,
        usersThisMonth,
        usersLastMonth
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard statistics'
    });
  }
};

/**
 * @desc    Get all users with filters
 * @route   GET /api/admin/users
 * @access  Private (Admin only)
 */
export const getUsers = async (req, res) => {
  try {
    const { search, role, status, page = 1, limit = 20 } = req.query;

    // Build filter
    const filter = {};

    if (search) {
      filter.email = { $regex: search, $options: 'i' };
    }

    if (role && role !== 'all') {
      filter.role = role;
    }

    if (status && status !== 'all') {
      filter.isActive = status === 'active';
    }

    // Get users with pagination
    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await User.countDocuments(filter);

    // Get profile info for each user
    const usersWithProfiles = await Promise.all(
      users.map(async (user) => {
        let profile = null;
        if (user.role === 'student') {
          profile = await StudentProfile.findOne({ user: user._id })
            .select('personalInfo.firstName personalInfo.lastName');
        } else if (user.role === 'organization') {
          profile = await OrganizationProfile.findOne({ user: user._id })
            .select('companyInfo.name');
        }

        return {
          ...user.toObject(),
          profileName: user.role === 'student'
            ? `${profile?.personalInfo?.firstName || ''} ${profile?.personalInfo?.lastName || ''}`.trim()
            : profile?.companyInfo?.name || 'N/A'
        };
      })
    );

    res.json({
      success: true,
      data: {
        users: usersWithProfiles,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users'
    });
  }
};

/**
 * @desc    Update user status (activate/deactivate)
 * @route   PATCH /api/admin/users/:id/status
 * @access  Private (Admin only)
 */
export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: user
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user status'
    });
  }
};

/**
 * @desc    Delete user
 * @route   DELETE /api/admin/users/:id
 * @access  Private (Admin only)
 */
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Delete associated profile
    if (user.role === 'student') {
      await StudentProfile.deleteOne({ user: id });
      await Application.deleteMany({ student: id });
    } else if (user.role === 'organization') {
      await OrganizationProfile.deleteOne({ user: id });
      await Internship.deleteMany({ organization: id });
    }

    await user.deleteOne();

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete user'
    });
  }
};

/**
 * @desc    Get analytics data
 * @route   GET /api/admin/analytics
 * @access  Private (Admin only)
 */
export const getAnalytics = async (req, res) => {
  try {
    const { timeRange = '30d' } = req.query;

    // Calculate date range
    let startDate = new Date();
    switch (timeRange) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }

    // User growth over time
    const userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Application volume
    const applicationVolume = await Application.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Revenue growth
    const revenueGrowth = await Payment.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m', date: '$createdAt' }
          },
          total: { $sum: '$amount' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Top organizations by applications
    const topOrganizations = await Application.aggregate([
      {
        $lookup: {
          from: 'internships',
          localField: 'internship',
          foreignField: '_id',
          as: 'internshipData'
        }
      },
      {
        $unwind: '$internshipData'
      },
      {
        $lookup: {
          from: 'organizationprofiles',
          localField: 'internshipData.organization',
          foreignField: '_id',
          as: 'orgData'
        }
      },
      {
        $unwind: '$orgData'
      },
      {
        $group: {
          _id: '$orgData._id',
          name: { $first: '$orgData.companyInfo.name' },
          applications: { $sum: 1 },
          internships: { $addToSet: '$internship' }
        }
      },
      {
        $project: {
          name: 1,
          applications: 1,
          internships: { $size: '$internships' }
        }
      },
      {
        $sort: { applications: -1 }
      },
      {
        $limit: 5
      }
    ]);

    // Popular skills
    const popularSkills = await StudentProfile.aggregate([
      {
        $unwind: '$skills'
      },
      {
        $group: {
          _id: '$skills.name',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 5
      },
      {
        $project: {
          skill: '$_id',
          demand: {
            $multiply: [
              { $divide: ['$count', { $literal: 100 }] },
              100
            ]
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        userGrowth,
        applicationVolume,
        revenueGrowth,
        topOrganizations,
        popularSkills
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics'
    });
  }
};

/**
 * @desc    Get recent activity
 * @route   GET /api/admin/activity
 * @access  Private (Admin only)
 */
export const getRecentActivity = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // Get recent users
    const recentUsers = await User.find()
      .select('email role createdAt')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    // Get recent applications
    const recentApplications = await Application.find()
      .populate('student', 'user')
      .populate('internship', 'title')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    // Get recent internships
    const recentInternships = await Internship.find()
      .populate('organization', 'companyInfo.name')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: {
        recentUsers,
        recentApplications,
        recentInternships
      }
    });
  } catch (error) {
    console.error('Get recent activity error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recent activity'
    });
  }
};
