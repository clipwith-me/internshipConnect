// frontend/src/pages/DashboardPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { applicationAPI, internshipAPI } from '../services/api';
import { useApi } from '../hooks/useApi';
import {
  Briefcase,
  FileText,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Eye
} from 'lucide-react';

const DashboardPage = () => {
  const { user, loading } = useAuth();

  // ✅ SECURITY FIX: Wait for user to be loaded before rendering role-specific content
  // This prevents the wrong dashboard from flashing during initial load
  if (loading || !user) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="inline-block w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // ✅ SECURITY FIX: Explicit role check with proper validation
  const isStudent = user.role === 'student';
  const isOrganization = user.role === 'organization';

  // ✅ SECURITY FIX: Handle invalid/unknown roles gracefully
  if (!isStudent && !isOrganization) {
    console.error('Invalid user role:', user.role);
    return (
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-error-50 border border-error-200 rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-error-800">Invalid Account Role</h2>
            <p className="text-error-600 mt-2">
              Your account has an invalid role configuration. Please contact support.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Get display name based on role
  const displayName = isStudent
    ? (user.name || 'User')
    : (user.name || 'User');

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-neutral-900">
            Welcome back, {displayName}
          </h1>
          <p className="text-neutral-600 mt-2">
            {isStudent
              ? 'Track your internship applications and discover new opportunities'
              : 'Manage your internship postings and review applications'}
          </p>
        </div>

        {isStudent ? <StudentDashboard /> : <OrganizationDashboard />}
      </div>
    </div>
  );
};

const StudentDashboard = () => {
  const navigate = useNavigate();
  const abortController = useApi();
  const [stats, setStats] = useState({
    totalApplications: 0,
    underReview: 0,
    shortlisted: 0,
    rejected: 0,
  });
  const [recentApplications, setRecentApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await applicationAPI.getMyApplications({
          signal: abortController?.signal
        });

        if (!isMounted) return; // Component unmounted

        if (response.data.success) {
          const applications = response.data.data;

          // Calculate stats
          setStats({
            totalApplications: applications.length,
            underReview: applications.filter(app =>
              ['submitted', 'under-review'].includes(app.status)
            ).length,
            shortlisted: applications.filter(app =>
              ['shortlisted', 'interview', 'offered'].includes(app.status)
            ).length,
            rejected: applications.filter(app =>
              app.status === 'rejected'
            ).length,
          });

          // Get recent applications (last 5)
          setRecentApplications(applications.slice(0, 5));
        }
      } catch (err) {
        if (err.name === 'AbortError' || err.name === 'CanceledError') {
          return; // Request was cancelled
        }
        if (isMounted) {
          console.error('Failed to fetch dashboard data:', err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDashboardData();

    return () => {
      isMounted = false; // Cleanup
    };
  }, []); // ✅ FIX: Empty dependency array - only fetch once on mount

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="inline-block w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Applications"
          value={stats.totalApplications}
          icon={FileText}
          color="bg-blue-500"
          trend="+12% from last month"
        />
        <StatCard
          title="Under Review"
          value={stats.underReview}
          icon={Clock}
          color="bg-amber-500"
        />
        <StatCard
          title="Shortlisted"
          value={stats.shortlisted}
          icon={CheckCircle}
          color="bg-green-500"
        />
        <StatCard
          title="Rejected"
          value={stats.rejected}
          icon={XCircle}
          color="bg-red-500"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <QuickActionCard
          title="Browse Internships"
          description="Discover new internship opportunities"
          icon={Briefcase}
          onClick={() => navigate('/dashboard/internships')}
          buttonText="Browse Now"
        />
        <QuickActionCard
          title="Generate Resume"
          description="Create an AI-powered resume"
          icon={FileText}
          onClick={() => navigate('/dashboard/resumes')}
          buttonText="Generate"
        />
      </div>

      {/* Recent Applications */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200/50 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-neutral-900">Recent Applications</h2>
          <button
            onClick={() => navigate('/dashboard/applications')}
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            View All
          </button>
        </div>

        {recentApplications.length === 0 ? (
          <div className="text-center py-8">
            <Briefcase className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
            <p className="text-neutral-600">No applications yet</p>
            <button
              onClick={() => navigate('/dashboard/internships')}
              className="mt-4 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
            >
              Start Applying
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {recentApplications.map((application) => (
              <ApplicationItem
                key={application._id}
                application={application}
                onClick={() => navigate(`/dashboard/internships/${application.internship._id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

const OrganizationDashboard = () => {
  const navigate = useNavigate();
  const abortController = useApi();
  const [stats, setStats] = useState({
    totalInternships: 0,
    activeInternships: 0,
    totalApplications: 0,
    pendingReview: 0,
  });
  const [recentInternships, setRecentInternships] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await internshipAPI.getMyInternships({
          signal: abortController?.signal
        });

        if (!isMounted) return; // Component unmounted

        if (response.data.success) {
          const internships = response.data.data;

          // Calculate stats
          const activeCount = internships.filter(i => i.status === 'active').length;
          const totalApps = internships.reduce((sum, i) => sum + (i.statistics?.totalApplications || 0), 0);

          setStats({
            totalInternships: internships.length,
            activeInternships: activeCount,
            totalApplications: totalApps,
            pendingReview: 0, // Will be calculated from applications endpoint if implemented
          });

          // Get recent internships (last 5)
          setRecentInternships(internships.slice(0, 5));
        }
      } catch (err) {
        if (err.name === 'AbortError' || err.name === 'CanceledError') {
          return; // Request was cancelled
        }
        if (isMounted) {
          console.error('Failed to fetch dashboard data:', err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDashboardData();

    return () => {
      isMounted = false; // Cleanup
    };
  }, []); // ✅ FIX: Empty dependency array - only fetch once on mount

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="inline-block w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Internships"
          value={stats.totalInternships}
          icon={Briefcase}
          color="bg-blue-500"
        />
        <StatCard
          title="Active Postings"
          value={stats.activeInternships}
          icon={TrendingUp}
          color="bg-green-500"
        />
        <StatCard
          title="Total Applications"
          value={stats.totalApplications}
          icon={Users}
          color="bg-purple-500"
        />
        <StatCard
          title="Pending Review"
          value={stats.pendingReview}
          icon={Clock}
          color="bg-amber-500"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <QuickActionCard
          title="Post New Internship"
          description="Create a new internship opportunity"
          icon={Briefcase}
          onClick={() => navigate('/dashboard/internships/create')}
          buttonText="Create Posting"
        />
        <QuickActionCard
          title="View Applications"
          description="Review and manage applications"
          icon={Users}
          onClick={() => navigate('/dashboard/applications')}
          buttonText="View All"
        />
      </div>

      {/* Recent Internships */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200/50 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-neutral-900">Recent Internships</h2>
          <button
            onClick={() => navigate('/dashboard/my-internships')}
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            View All
          </button>
        </div>

        {recentInternships.length === 0 ? (
          <div className="text-center py-8">
            <Briefcase className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
            <p className="text-neutral-600">No internships posted yet</p>
            <button
              onClick={() => navigate('/dashboard/internships/create')}
              className="mt-4 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
            >
              Post Internship
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {recentInternships.map((internship) => (
              <InternshipItem
                key={internship._id}
                internship={internship}
                onClick={() => navigate(`/dashboard/internships/${internship._id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

const StatCard = ({ title, value, icon: Icon, color, trend }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200/50 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <div className="mb-1">
        <div className="text-3xl font-bold text-neutral-900">{value}</div>
      </div>
      <div className="text-sm text-neutral-600">{title}</div>
      {trend && (
        <div className="mt-2 text-xs text-green-600 font-medium">{trend}</div>
      )}
    </div>
  );
};

const QuickActionCard = ({ title, description, icon: Icon, onClick, buttonText }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200/50 p-6 hover:shadow-md transition-all">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
          <Icon className="w-6 h-6 text-primary-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-neutral-900 mb-1">{title}</h3>
          <p className="text-sm text-neutral-600 mb-4">{description}</p>
          <button
            onClick={onClick}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors text-sm font-medium"
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

const ApplicationItem = ({ application, onClick }) => {
  const getStatusColor = (status) => {
    const colors = {
      submitted: 'bg-blue-100 text-blue-700',
      'under-review': 'bg-purple-100 text-purple-700',
      shortlisted: 'bg-cyan-100 text-cyan-700',
      interview: 'bg-amber-100 text-amber-700',
      offered: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-neutral-100 text-neutral-600';
  };

  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between p-4 rounded-lg border border-neutral-200 hover:border-primary-300 hover:bg-primary-50/50 transition-all cursor-pointer"
    >
      <div className="flex-1">
        <h4 className="font-medium text-neutral-900">
          {application.internship?.title || 'Internship Title'}
        </h4>
        <p className="text-sm text-neutral-600">
          {application.internship?.organization?.companyInfo?.companyName || 'Company'}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
          {application.status?.replace('-', ' ').charAt(0).toUpperCase() + application.status?.slice(1).replace('-', ' ')}
        </span>
        <Eye className="w-5 h-5 text-neutral-400" />
      </div>
    </div>
  );
};

const InternshipItem = ({ internship, onClick }) => {
  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-neutral-100 text-neutral-600',
      active: 'bg-green-100 text-green-700',
      paused: 'bg-amber-100 text-amber-700',
      closed: 'bg-red-100 text-red-700',
      filled: 'bg-blue-100 text-blue-700',
    };
    return colors[status] || 'bg-neutral-100 text-neutral-600';
  };

  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between p-4 rounded-lg border border-neutral-200 hover:border-primary-300 hover:bg-primary-50/50 transition-all cursor-pointer"
    >
      <div className="flex-1">
        <h4 className="font-medium text-neutral-900">{internship.title}</h4>
        <p className="text-sm text-neutral-600">
          {internship.location?.city || 'Location'} • {internship.statistics?.totalApplications || 0} applications
        </p>
      </div>
      <div className="flex items-center gap-3">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(internship.status)}`}>
          {internship.status?.charAt(0).toUpperCase() + internship.status?.slice(1)}
        </span>
        <Eye className="w-5 h-5 text-neutral-400" />
      </div>
    </div>
  );
};

export default DashboardPage;
