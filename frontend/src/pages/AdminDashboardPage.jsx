// frontend/src/pages/AdminDashboardPage.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Users, Building2, UserCheck, TrendingUp,
  Calendar, Activity, Lock
} from 'lucide-react';

const AdminDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is admin
    if (user?.role !== 'admin') {
      navigate('/dashboard');
      return;
    }

    loadStats();
  }, [user, navigate]);

  const loadStats = async () => {
    try {
      setLoading(true);

      // Get token from localStorage
      const token = localStorage.getItem('accessToken');

      const response = await fetch('http://localhost:5000/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 403) {
        setError('Access denied. Admin role required.');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to load statistics');
      }

      const data = await response.json();
      setStats(data.data);
      setError(null);
    } catch (err) {
      console.error('Error loading stats:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Access denied screen
  if (error === 'Access denied. Admin role required.') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <Lock className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-6">
            You do not have permission to access the admin dashboard.
            Admin role is required.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={loadStats}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Lock className="w-8 h-8 text-primary-600" />
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Platform statistics and user management (Admin Only)
              </p>
            </div>
            <button
              onClick={loadStats}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Users */}
          <StatCard
            icon={Users}
            label="Total Users"
            value={stats?.totalUsers || 0}
            color="blue"
          />

          {/* Students */}
          <StatCard
            icon={UserCheck}
            label="Students"
            value={stats?.totalStudents || 0}
            color="green"
          />

          {/* Organizations */}
          <StatCard
            icon={Building2}
            label="Organizations"
            value={stats?.totalOrganizations || 0}
            color="purple"
          />

          {/* User Growth */}
          <StatCard
            icon={TrendingUp}
            label="User Growth"
            value={stats?.userGrowth || '0%'}
            color="amber"
            badge={`${stats?.usersThisMonth || 0} this month`}
          />
        </div>

        {/* Internships & Applications */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Internships
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Internships:</span>
                <span className="text-2xl font-bold text-gray-900">
                  {stats?.totalInternships || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Active Internships:</span>
                <span className="text-2xl font-bold text-green-600">
                  {stats?.activeInternships || 0}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Applications
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Applications:</span>
                <span className="text-2xl font-bold text-gray-900">
                  {stats?.totalApplications || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Avg per Internship:</span>
                <span className="text-2xl font-bold text-blue-600">
                  {stats?.activeInternships > 0
                    ? Math.round(stats?.totalApplications / stats?.activeInternships)
                    : 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Monthly Growth */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-6 h-6 text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Monthly Growth
              </h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-gray-700">This Month:</span>
                <span className="text-lg font-bold text-blue-600">
                  {stats?.usersThisMonth || 0} new users
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Last Month:</span>
                <span className="text-lg font-bold text-gray-600">
                  {stats?.usersLastMonth || 0} users
                </span>
              </div>
              <div className="pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Growth Rate:</span>
                  <span className={`text-lg font-bold ${
                    parseFloat(stats?.userGrowth) > 0 ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {stats?.userGrowth}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Revenue (if applicable) */}
          <div className="bg-gradient-to-br from-primary-600 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Activity className="w-6 h-6" />
              <h3 className="text-lg font-semibold">Platform Revenue</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-blue-100 text-sm mb-1">This Month</p>
                <p className="text-3xl font-bold">
                  ${(stats?.revenueThisMonth / 100 || 0).toFixed(2)}
                </p>
              </div>
              <p className="text-blue-100 text-sm">
                From subscriptions and premium features
              </p>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <Lock className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-amber-900 mb-2">
                Admin Access - Security Notice
              </h4>
              <p className="text-amber-800 text-sm mb-2">
                This dashboard contains sensitive platform data and should only be accessed by authorized administrators.
              </p>
              <ul className="text-amber-800 text-sm space-y-1 list-disc list-inside">
                <li>Keep your admin credentials secure</li>
                <li>Never share admin access with unauthorized users</li>
                <li>All admin actions may be logged for security auditing</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Reusable Stat Card Component
const StatCard = ({ icon: Icon, label, value, color, badge }) => {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'text-blue-600',
      text: 'text-blue-900'
    },
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: 'text-green-600',
      text: 'text-green-900'
    },
    purple: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      icon: 'text-purple-600',
      text: 'text-purple-900'
    },
    amber: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      icon: 'text-amber-600',
      text: 'text-amber-900'
    }
  };

  const colors = colorClasses[color] || colorClasses.blue;

  return (
    <div className={`${colors.bg} rounded-xl shadow-sm border ${colors.border} p-6`}>
      <div className="flex items-center justify-between mb-4">
        <Icon className={`w-8 h-8 ${colors.icon}`} />
        {badge && (
          <span className="px-2 py-1 bg-white rounded-full text-xs font-medium text-gray-700">
            {badge}
          </span>
        )}
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
      <div className={`text-sm font-medium ${colors.text}`}>{label}</div>
    </div>
  );
};

export default AdminDashboardPage;
