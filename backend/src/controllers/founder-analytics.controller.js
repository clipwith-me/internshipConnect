import mongoose from 'mongoose';
import User from '../models/User.js';
import StudentProfile from '../models/StudentProfile.js';
import OrganizationProfile from '../models/OrganizationProfile.js';
import Internship from '../models/Internship.js';
import Application from '../models/Application.js';
import Notification from '../models/Notification.js';
import Payment from '../models/Payment.js';
import AnalyticsEvent from '../models/AnalyticsEvent.js';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const startOf = (unit) => {
  const d = new Date();
  if (unit === 'day')   { d.setHours(0,0,0,0); }
  if (unit === 'week')  { d.setDate(d.getDate() - d.getDay()); d.setHours(0,0,0,0); }
  if (unit === 'month') { d.setDate(1); d.setHours(0,0,0,0); }
  if (unit === 'year')  { d.setMonth(0,1); d.setHours(0,0,0,0); }
  return d;
};

const daysAgo = (n) => new Date(Date.now() - n * 86400000);

const pct = (a, b) => b === 0 ? 0 : Math.round((a / b) * 100 * 10) / 10;

const growthRate = (current, previous) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100 * 10) / 10;
};

// ─── 1. Executive Overview ────────────────────────────────────────────────────

export const getExecutiveOverview = async (req, res) => {
  try {
    const now = new Date();
    const todayStart   = startOf('day');
    const weekStart    = startOf('week');
    const monthStart   = startOf('month');
    const prevMonth    = new Date(monthStart); prevMonth.setMonth(prevMonth.getMonth() - 1);
    const prevMonthEnd = new Date(monthStart);

    // ── User counts by role ──
    const [
      totalStudents, totalOrgs, totalAdmins,
      newToday, newThisWeek, newThisMonth, newLastMonth,
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'organization' }),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ createdAt: { $gte: todayStart } }),
      User.countDocuments({ createdAt: { $gte: weekStart } }),
      User.countDocuments({ createdAt: { $gte: monthStart } }),
      User.countDocuments({ createdAt: { $gte: prevMonth, $lt: prevMonthEnd } }),
    ]);

    const totalUsers = totalStudents + totalOrgs + totalAdmins;

    // ── Internship & Application counts ──
    const [totalInternships, activeInternships, totalApplications] = await Promise.all([
      Internship.countDocuments({}),
      Internship.countDocuments({ status: 'active' }),
      Application.countDocuments({}),
    ]);

    // ── Application status breakdown ──
    const statusAgg = await Application.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const statusMap = {};
    statusAgg.forEach(s => { statusMap[s._id] = s.count; });

    const successfulPlacements = (statusMap['accepted'] || 0);
    const placementRate = pct(successfulPlacements, totalApplications);

    // ── User growth trend (last 30 days) ──
    const userGrowthTrend = await User.aggregate([
      { $match: { createdAt: { $gte: daysAgo(30) } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // ── Profile completeness ──
    const profileCompleteness = await StudentProfile.aggregate([
      {
        $group: {
          _id: null,
          avgCompleteness: { $avg: '$profileCompleteness' },
          complete: { $sum: { $cond: [{ $gte: ['$profileCompleteness', 80] }, 1, 0] } },
        },
      },
    ]);

    const monthlyGrowth = growthRate(newThisMonth, newLastMonth);

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          students: totalStudents,
          employers: totalOrgs,
          admins: totalAdmins,
          newToday,
          newThisWeek,
          newThisMonth,
          newLastMonth,
          monthlyGrowthRate: monthlyGrowth,
        },
        marketplace: {
          totalInternships,
          activeInternships,
          closedInternships: totalInternships - activeInternships,
          totalApplications,
          applicationsPerInternship: totalInternships > 0
            ? Math.round((totalApplications / totalInternships) * 10) / 10
            : 0,
        },
        placements: {
          submitted:    statusMap['submitted']    || 0,
          underReview:  statusMap['under-review'] || 0,
          shortlisted:  statusMap['shortlisted']  || 0,
          interview:    statusMap['interview']    || 0,
          offered:      statusMap['offered']      || 0,
          accepted:     statusMap['accepted']     || 0,
          rejected:     statusMap['rejected']     || 0,
          placementRate,
        },
        profile: {
          avgCompleteness: Math.round(profileCompleteness[0]?.avgCompleteness || 0),
          fullyComplete: profileCompleteness[0]?.complete || 0,
        },
        trends: {
          userGrowth: userGrowthTrend,
        },
      },
    });
  } catch (err) {
    console.error('getExecutiveOverview error:', err);
    res.status(500).json({ error: 'Failed to fetch executive overview' });
  }
};

// ─── 2. User Growth Analytics ─────────────────────────────────────────────────

export const getUserGrowth = async (req, res) => {
  try {
    const { days = 90 } = req.query;
    const since = daysAgo(parseInt(days));

    const [byDay, byRole, byMonth, retentionProxy] = await Promise.all([
      // Daily signups
      User.aggregate([
        { $match: { createdAt: { $gte: since } } },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              role: '$role',
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.date': 1 } },
      ]),

      // Total by role
      User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } },
      ]),

      // Monthly signups last 12 months
      User.aggregate([
        { $match: { createdAt: { $gte: daysAgo(365) } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
            students: { $sum: { $cond: [{ $eq: ['$role', 'student'] }, 1, 0] } },
            employers: { $sum: { $cond: [{ $eq: ['$role', 'organization'] }, 1, 0] } },
            total: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // Retention proxy: users who applied (engaged) vs total students
      Application.aggregate([
        { $group: { _id: '$student', appCount: { $sum: 1 } } },
        { $count: 'activeStudents' },
      ]),
    ]);

    const totalStudents = byRole.find(r => r._id === 'student')?.count || 0;
    const activeStudents = retentionProxy[0]?.activeStudents || 0;
    const engagementRate = pct(activeStudents, totalStudents);

    // Pivot daily data into a cleaner structure
    const dailyMap = {};
    byDay.forEach(({ _id, count }) => {
      if (!dailyMap[_id.date]) dailyMap[_id.date] = { date: _id.date, students: 0, employers: 0, total: 0 };
      if (_id.role === 'student')       dailyMap[_id.date].students += count;
      if (_id.role === 'organization')  dailyMap[_id.date].employers += count;
      dailyMap[_id.date].total += count;
    });

    res.json({
      success: true,
      data: {
        daily: Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date)),
        monthly: byMonth,
        byRole: byRole.reduce((acc, r) => { acc[r._id] = r.count; return acc; }, {}),
        engagement: { activeStudents, totalStudents, engagementRate },
      },
    });
  } catch (err) {
    console.error('getUserGrowth error:', err);
    res.status(500).json({ error: 'Failed to fetch user growth' });
  }
};

// ─── 3. Marketplace Analytics ─────────────────────────────────────────────────

export const getMarketplaceAnalytics = async (req, res) => {
  try {
    const [
      internshipsByStatus,
      internshipsByType,
      internshipsByIndustry,
      topInternships,
      applicationsByDay,
      applicationsByStatus,
      topCompanies,
    ] = await Promise.all([
      Internship.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Internship.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } },
      ]),
      Internship.aggregate([
        { $group: { _id: '$industry', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      // Top internships by application count
      Application.aggregate([
        { $group: { _id: '$internship', applications: { $sum: 1 } } },
        { $sort: { applications: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'internships',
            localField: '_id',
            foreignField: '_id',
            as: 'internship',
          },
        },
        { $unwind: '$internship' },
        {
          $project: {
            title: '$internship.title',
            applications: 1,
            views: '$internship.statistics.views',
          },
        },
      ]),
      // Daily applications last 30 days
      Application.aggregate([
        { $match: { createdAt: { $gte: daysAgo(30) } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Application.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      // Top hiring companies
      Internship.aggregate([
        {
          $lookup: {
            from: 'organizationprofiles',
            localField: 'organization',
            foreignField: '_id',
            as: 'org',
          },
        },
        { $unwind: { path: '$org', preserveNullAndEmpty: true } },
        {
          $group: {
            _id: '$organization',
            name: { $first: '$org.companyInfo.name' },
            postings: { $sum: 1 },
            verified: { $first: '$org.verified' },
          },
        },
        { $sort: { postings: -1 } },
        { $limit: 10 },
      ]),
    ]);

    const totalApps  = applicationsByStatus.reduce((s, a) => s + a.count, 0);
    const accepted   = applicationsByStatus.find(a => a._id === 'accepted')?.count || 0;
    const offered    = applicationsByStatus.find(a => a._id === 'offered')?.count || 0;
    const convRate   = pct(accepted, totalApps);
    const offerRate  = pct(offered, totalApps);

    res.json({
      success: true,
      data: {
        internships: {
          byStatus: internshipsByStatus,
          byType: internshipsByType,
          byIndustry: internshipsByIndustry,
          top: topInternships,
        },
        applications: {
          daily: applicationsByDay.map(d => ({ date: d._id, count: d.count })),
          byStatus: applicationsByStatus,
          conversionRate: convRate,
          offerRate,
        },
        companies: { top: topCompanies },
      },
    });
  } catch (err) {
    console.error('getMarketplaceAnalytics error:', err);
    res.status(500).json({ error: 'Failed to fetch marketplace analytics' });
  }
};

// ─── 4. Placement Funnel ─────────────────────────────────────────────────────

export const getPlacementFunnel = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });

    const profilesWithResume = await StudentProfile.countDocuments({
      'resume.original.fileUrl': { $exists: true, $ne: null },
    });

    const studentsWhoApplied = await Application.aggregate([
      { $group: { _id: '$student' } },
      { $count: 'count' },
    ]);

    const statusCounts = await Application.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const sc = {};
    statusCounts.forEach(s => { sc[s._id] = s.count; });

    const applied       = studentsWhoApplied[0]?.count || 0;
    const shortlisted   = sc['shortlisted']  || 0;
    const interviewed   = sc['interview']    || 0;
    const offered       = sc['offered']      || 0;
    const accepted      = sc['accepted']     || 0;

    // Profile completion proxy
    const profilesWithSkills = await StudentProfile.countDocuments({
      'skills.0': { $exists: true },
    });

    const funnel = [
      { stage: 'Registered',           count: totalStudents,       pctOfPrev: 100 },
      { stage: 'Completed Profile',     count: profilesWithSkills,  pctOfPrev: pct(profilesWithSkills, totalStudents) },
      { stage: 'Uploaded Resume',       count: profilesWithResume,  pctOfPrev: pct(profilesWithResume, profilesWithSkills || 1) },
      { stage: 'Applied',               count: applied,             pctOfPrev: pct(applied, profilesWithResume || 1) },
      { stage: 'Shortlisted',           count: shortlisted,         pctOfPrev: pct(shortlisted, applied || 1) },
      { stage: 'Interviewed',           count: interviewed,         pctOfPrev: pct(interviewed, shortlisted || 1) },
      { stage: 'Received Offer',        count: offered,             pctOfPrev: pct(offered, interviewed || 1) },
      { stage: 'Accepted / Placed',     count: accepted,            pctOfPrev: pct(accepted, offered || 1) },
    ];

    // Drop-off at each stage
    for (let i = 1; i < funnel.length; i++) {
      funnel[i].dropOff = Math.max(0, funnel[i - 1].count - funnel[i].count);
      funnel[i].dropOffPct = pct(funnel[i].dropOff, funnel[i - 1].count || 1);
    }
    funnel[0].dropOff = 0;
    funnel[0].dropOffPct = 0;

    // Overall conversion
    const overallConversion = pct(accepted, totalStudents);

    res.json({
      success: true,
      data: {
        funnel,
        overallConversion,
        summary: {
          totalStudents,
          totalPlaced: accepted,
          placementRate: overallConversion,
        },
      },
    });
  } catch (err) {
    console.error('getPlacementFunnel error:', err);
    res.status(500).json({ error: 'Failed to fetch placement funnel' });
  }
};

// ─── 5. Geographic Analytics ─────────────────────────────────────────────────

export const getGeographicAnalytics = async (req, res) => {
  try {
    const [studentsByCity, studentsByCountry, internshipsByType] = await Promise.all([
      StudentProfile.aggregate([
        { $match: { 'personalInfo.location.city': { $exists: true, $ne: '' } } },
        { $group: { _id: '$personalInfo.location.city', count: { $sum: 1 }, state: { $first: '$personalInfo.location.state' } } },
        { $sort: { count: -1 } },
        { $limit: 20 },
      ]),
      StudentProfile.aggregate([
        { $match: { 'personalInfo.nationality': { $exists: true, $ne: '' } } },
        { $group: { _id: '$personalInfo.nationality', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 20 },
      ]),
      Internship.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } },
      ]),
    ]);

    const orgsByCity = await OrganizationProfile.aggregate([
      { $match: { 'companyInfo.headquarters.city': { $exists: true, $ne: '' } } },
      { $group: { _id: '$companyInfo.headquarters.city', count: { $sum: 1 }, country: { $first: '$companyInfo.headquarters.country' } } },
      { $sort: { count: -1 } },
      { $limit: 20 },
    ]);

    res.json({
      success: true,
      data: {
        students: {
          byCity: studentsByCity.map(c => ({ city: c._id, count: c.count, state: c.state })),
          byCountry: studentsByCountry.map(c => ({ country: c._id, count: c.count })),
        },
        employers: {
          byCity: orgsByCity.map(c => ({ city: c._id, count: c.count, country: c.country })),
        },
        internships: {
          byType: internshipsByType,
        },
      },
    });
  } catch (err) {
    console.error('getGeographicAnalytics error:', err);
    res.status(500).json({ error: 'Failed to fetch geographic analytics' });
  }
};

// ─── 6. Revenue Dashboard ────────────────────────────────────────────────────

export const getRevenueAnalytics = async (req, res) => {
  try {
    const [payments, revenueByMonth, revenueByPlan] = await Promise.all([
      Payment.aggregate([
        { $match: { status: 'completed' } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$amount' },
            totalTransactions: { $sum: 1 },
            avgOrderValue: { $avg: '$amount' },
          },
        },
      ]),
      Payment.aggregate([
        { $match: { status: 'completed', createdAt: { $gte: daysAgo(365) } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
            revenue: { $sum: '$amount' },
            transactions: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Payment.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: '$planId', revenue: { $sum: '$amount' }, count: { $sum: 1 } } },
        { $sort: { revenue: -1 } },
      ]),
    ]);

    const totalRevenue = payments[0]?.totalRevenue || 0;
    // MRR = last month's completed payments
    const lastMonthStart = new Date(); lastMonthStart.setMonth(lastMonthStart.getMonth() - 1); lastMonthStart.setDate(1); lastMonthStart.setHours(0,0,0,0);
    const lastMonthEnd   = new Date(); lastMonthEnd.setDate(0); lastMonthEnd.setHours(23,59,59,999);

    const mrrData = await Payment.aggregate([
      { $match: { status: 'completed', createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd } } },
      { $group: { _id: null, mrr: { $sum: '$amount' } } },
    ]);

    const mrr = mrrData[0]?.mrr || 0;
    const arr = mrr * 12;

    res.json({
      success: true,
      data: {
        summary: {
          totalRevenue,
          mrr,
          arr,
          totalTransactions: payments[0]?.totalTransactions || 0,
          avgOrderValue: Math.round(payments[0]?.avgOrderValue || 0),
        },
        monthly: revenueByMonth.map(m => ({ month: m._id, revenue: m.revenue, transactions: m.transactions })),
        byPlan: revenueByPlan,
      },
    });
  } catch (err) {
    console.error('getRevenueAnalytics error:', err);
    res.status(500).json({ error: 'Failed to fetch revenue analytics' });
  }
};

// ─── 7. AI-Generated Insights ────────────────────────────────────────────────

export const getAIInsights = async (req, res) => {
  try {
    const [
      weekSignups, prevWeekSignups,
      topIndustry, topCity,
      appThisWeek, appLastWeek,
      profileAvg,
      topUniRaw,
    ] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: daysAgo(7) } }),
      User.countDocuments({ createdAt: { $gte: daysAgo(14), $lt: daysAgo(7) } }),
      Application.aggregate([
        {
          $lookup: { from: 'internships', localField: 'internship', foreignField: '_id', as: 'i' },
        },
        { $unwind: '$i' },
        { $group: { _id: '$i.industry', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 1 },
      ]),
      StudentProfile.aggregate([
        { $match: { 'personalInfo.location.city': { $exists: true, $ne: '' } } },
        { $group: { _id: '$personalInfo.location.city', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 1 },
      ]),
      Application.countDocuments({ createdAt: { $gte: daysAgo(7) } }),
      Application.countDocuments({ createdAt: { $gte: daysAgo(14), $lt: daysAgo(7) } }),
      StudentProfile.aggregate([
        { $group: { _id: null, avg: { $avg: '$profileCompleteness' } } },
      ]),
      StudentProfile.aggregate([
        { $match: { 'education.0': { $exists: true } } },
        { $unwind: '$education' },
        { $group: { _id: '$education.institution', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 1 },
      ]),
    ]);

    const insights = [];
    const signupGrowth = growthRate(weekSignups, prevWeekSignups);
    const appGrowth    = growthRate(appThisWeek, appLastWeek);
    const avgProfile   = Math.round(profileAvg[0]?.avg || 0);

    // Signup trend
    if (signupGrowth > 0) {
      insights.push({ type: 'growth', icon: '📈', severity: 'positive',
        text: `Student signups increased ${signupGrowth}% this week (${weekSignups} new users vs ${prevWeekSignups} last week).`,
      });
    } else if (signupGrowth < -10) {
      insights.push({ type: 'warning', icon: '⚠️', severity: 'warning',
        text: `Student signups dropped ${Math.abs(signupGrowth)}% this week. Consider boosting acquisition campaigns.`,
      });
    }

    // Application trend
    if (appGrowth > 20) {
      insights.push({ type: 'growth', icon: '🚀', severity: 'positive',
        text: `Application volume surged ${appGrowth}% this week — platform engagement is accelerating.`,
      });
    } else if (appGrowth < -15) {
      insights.push({ type: 'warning', icon: '⚠️', severity: 'warning',
        text: `Applications dropped ${Math.abs(appGrowth)}% this week. Check if new internship postings are declining.`,
      });
    }

    // Top city
    if (topCity[0]) {
      insights.push({ type: 'geographic', icon: '📍', severity: 'info',
        text: `${topCity[0]._id} is your strongest market with ${topCity[0].count} registered students.`,
      });
    }

    // Top industry
    if (topIndustry[0]) {
      insights.push({ type: 'marketplace', icon: '🏭', severity: 'info',
        text: `${topIndustry[0]._id || 'Technology'} internships are the most applied-to category with ${topIndustry[0].count} applications.`,
      });
    }

    // Profile completeness
    if (avgProfile < 50) {
      insights.push({ type: 'product', icon: '💡', severity: 'warning',
        text: `Average profile completeness is ${avgProfile}%. Students with complete profiles get 3x more employer views — consider an onboarding nudge.`,
      });
    } else {
      insights.push({ type: 'product', icon: '✅', severity: 'positive',
        text: `Average profile completeness is ${avgProfile}% — strong signal of student engagement.`,
      });
    }

    // Top university
    if (topUniRaw[0]) {
      insights.push({ type: 'university', icon: '🎓', severity: 'info',
        text: `${topUniRaw[0]._id} has the most registered students (${topUniRaw[0].count}) — a partnership opportunity.`,
      });
    }

    // Opportunity insight
    insights.push({ type: 'opportunity', icon: '🌍', severity: 'opportunity',
      text: `Nigeria's youth population is 70M+. With ${weekSignups} weekly signups, InternshipConnect is on track to become the dominant early-career platform.`,
    });

    res.json({ success: true, data: { insights, generatedAt: new Date() } });
  } catch (err) {
    console.error('getAIInsights error:', err);
    res.status(500).json({ error: 'Failed to generate insights' });
  }
};

// ─── 8. Real-Time Activity ────────────────────────────────────────────────────

export const getRealTimeActivity = async (req, res) => {
  try {
    const fiveMinAgo  = new Date(Date.now() - 5  * 60000);
    const thirtyMinAgo= new Date(Date.now() - 30 * 60000);
    const oneHourAgo  = new Date(Date.now() - 60 * 60000);

    const [
      signupsLastHour,
      appsLastHour,
      appsLast30Min,
      newInternshipsToday,
      recentApplications,
      recentSignups,
    ] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: oneHourAgo } }),
      Application.countDocuments({ createdAt: { $gte: oneHourAgo } }),
      Application.countDocuments({ createdAt: { $gte: thirtyMinAgo } }),
      Internship.countDocuments({ createdAt: { $gte: startOf('day') } }),
      Application.find({ createdAt: { $gte: thirtyMinAgo } })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate({ path: 'internship', select: 'title' })
        .populate({ path: 'student', select: 'personalInfo.firstName personalInfo.lastName' })
        .lean(),
      User.find({ createdAt: { $gte: thirtyMinAgo } })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('email role createdAt')
        .lean(),
    ]);

    res.json({
      success: true,
      data: {
        live: {
          signupsLastHour,
          applicationsLastHour: appsLastHour,
          applicationsLast30Min: appsLast30Min,
          newInternshipsToday,
          timestamp: new Date(),
        },
        feed: {
          recentApplications: recentApplications.map(a => ({
            id: a._id,
            internshipTitle: a.internship?.title || 'Unknown',
            appliedAt: a.createdAt,
          })),
          recentSignups: recentSignups.map(u => ({
            id: u._id,
            role: u.role,
            email: u.email?.replace(/(.{2}).*(@.*)/, '$1***$2'),
            joinedAt: u.createdAt,
          })),
        },
      },
    });
  } catch (err) {
    console.error('getRealTimeActivity error:', err);
    res.status(500).json({ error: 'Failed to fetch real-time activity' });
  }
};

// ─── 9. Investor Dashboard ────────────────────────────────────────────────────

export const getInvestorMetrics = async (req, res) => {
  try {
    const [
      totalUsers, totalStudents, totalOrgs,
      newThisMonth, newLastMonth,
      totalApps, accepted,
      totalInternships, activeInternships,
      mrr,
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'organization' }),
      User.countDocuments({ createdAt: { $gte: startOf('month') } }),
      User.countDocuments({ createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 1, 1)), $lt: startOf('month') } }),
      Application.countDocuments({}),
      Application.countDocuments({ status: 'accepted' }),
      Internship.countDocuments({}),
      Internship.countDocuments({ status: 'active' }),
      Payment.aggregate([
        {
          $match: {
            status: 'completed',
            createdAt: {
              $gte: new Date(new Date().setDate(1)),
            },
          },
        },
        { $group: { _id: null, mrr: { $sum: '$amount' } } },
      ]),
    ]);

    const userGrowthRate    = growthRate(newThisMonth, newLastMonth);
    const placementRate     = pct(accepted, totalApps);
    const mrrValue          = mrr[0]?.mrr || 0;

    // Monthly user trend (12 months)
    const monthlyTrend = await User.aggregate([
      { $match: { createdAt: { $gte: daysAgo(365) } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          total: { $sum: 1 },
          students: { $sum: { $cond: [{ $eq: ['$role', 'student'] }, 1, 0] } },
          employers: { $sum: { $cond: [{ $eq: ['$role', 'organization'] }, 1, 0] } },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      data: {
        headline: {
          totalUsers,
          totalStudents,
          totalEmployers: totalOrgs,
          newThisMonth,
          userGrowthRate,
          placementRate,
          activeOpportunities: activeInternships,
          mrr: mrrValue,
          arr: mrrValue * 12,
        },
        impact: {
          studentsHelped: accepted,
          internshipsPosted: totalInternships,
          employersServed: totalOrgs,
          applicationsProcessed: totalApps,
        },
        growth: { monthly: monthlyTrend },
        investabilityScore: Math.min(100, Math.round(
          (totalUsers / 100) * 0.3 +
          (userGrowthRate > 0 ? userGrowthRate : 0) * 0.3 +
          placementRate * 0.4
        )),
      },
    });
  } catch (err) {
    console.error('getInvestorMetrics error:', err);
    res.status(500).json({ error: 'Failed to fetch investor metrics' });
  }
};
