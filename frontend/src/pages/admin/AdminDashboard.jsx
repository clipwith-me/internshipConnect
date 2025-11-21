// frontend/src/pages/admin/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import { Users, Briefcase, FileText, TrendingUp, Activity, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalOrganizations: 0,
    totalInternships: 0,
    totalApplications: 0,
    activeInternships: 0,
    pendingVerifications: 0,
    revenueThisMonth: 0
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API calls
      setStats({
        totalUsers: 1247,
        totalStudents: 892,
        totalOrganizations: 355,
        totalInternships: 584,
        totalApplications: 3421,
        activeInternships: 423,
        pendingVerifications: 28,
        revenueThisMonth: 12450
      });

      setRecentActivity([
        { id: 1, type: 'user', action: 'New student registered', user: 'John Doe', time: '5 mins ago' },
        { id: 2, type: 'internship', action: 'New internship posted', company: 'Tech Corp', time: '12 mins ago' },
        { id: 3, type: 'application', action: 'Application submitted', user: 'Jane Smith', time: '23 mins ago' },
        { id: 4, type: 'verification', action: 'Organization verified', company: 'StartupXYZ', time: '1 hour ago' },
        { id: 5, type: 'payment', action: 'Premium subscription', user: 'Bob Johnson', time: '2 hours ago' }
      ]);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="inline-block w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-neutral-900">Admin Dashboard</h1>
          <p className="text-neutral-600 mt-2">Overview of platform performance and activity</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            subtitle={`${stats.totalStudents} students, ${stats.totalOrganizations} orgs`}
            icon={Users}
            color="bg-blue-500"
            trend="+12.5%"
          />
          <StatCard
            title="Active Internships"
            value={stats.activeInternships}
            subtitle={`${stats.totalInternships} total posted`}
            icon={Briefcase}
            color="bg-green-500"
            trend="+8.2%"
          />
          <StatCard
            title="Total Applications"
            value={stats.totalApplications}
            subtitle="This month"
            icon={FileText}
            color="bg-purple-500"
            trend="+15.3%"
          />
          <StatCard
            title="Revenue"
            value={`$${stats.revenueThisMonth.toLocaleString()}`}
            subtitle="This month"
            icon={TrendingUp}
            color="bg-amber-500"
            trend="+22.1%"
          />
        </div>

        {/* Alerts */}
        {stats.pendingVerifications > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <p className="text-amber-900">
              <strong>{stats.pendingVerifications}</strong> organizations pending verification
            </p>
            <button className="ml-auto px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-colors">
              Review Now
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200/50 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-neutral-900">Recent Activity</h2>
              <Activity className="w-5 h-5 text-neutral-400" />
            </div>

            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 pb-4 border-b border-neutral-100 last:border-0 last:pb-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    activity.type === 'user' ? 'bg-blue-100' :
                    activity.type === 'internship' ? 'bg-green-100' :
                    activity.type === 'application' ? 'bg-purple-100' :
                    activity.type === 'verification' ? 'bg-amber-100' :
                    'bg-neutral-100'
                  }`}>
                    {activity.type === 'user' && <Users className="w-5 h-5 text-blue-600" />}
                    {activity.type === 'internship' && <Briefcase className="w-5 h-5 text-green-600" />}
                    {activity.type === 'application' && <FileText className="w-5 h-5 text-purple-600" />}
                    {activity.type === 'verification' && <CheckCircle className="w-5 h-5 text-amber-600" />}
                    {activity.type === 'payment' && <TrendingUp className="w-5 h-5 text-green-600" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-neutral-900 font-medium">{activity.action}</p>
                    <p className="text-sm text-neutral-600">
                      {activity.user || activity.company}
                    </p>
                  </div>
                  <span className="text-xs text-neutral-500">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Platform Health */}
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200/50 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-neutral-900">Platform Health</h2>
              <Activity className="w-5 h-5 text-green-500" />
            </div>

            <div className="space-y-4">
              <HealthMetric
                label="API Response Time"
                value="125ms"
                status="good"
                description="Average response time"
              />
              <HealthMetric
                label="Database"
                value="Healthy"
                status="good"
                description="All queries running normally"
              />
              <HealthMetric
                label="Email Service"
                value="Operational"
                status="good"
                description="Delivery rate: 98.7%"
              />
              <HealthMetric
                label="Payment Gateway"
                value="Connected"
                status="good"
                description="Stripe API operational"
              />
              <HealthMetric
                label="Storage"
                value="67% Used"
                status="warning"
                description="2.3TB / 3.5TB"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, subtitle, icon: Icon, color, trend }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200/50 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <span className="text-sm font-medium text-green-600">{trend}</span>
        )}
      </div>
      <div className="text-3xl font-bold text-neutral-900 mb-1">{value}</div>
      <div className="text-sm text-neutral-600">{title}</div>
      {subtitle && (
        <div className="text-xs text-neutral-500 mt-1">{subtitle}</div>
      )}
    </div>
  );
};

const HealthMetric = ({ label, value, status, description }) => {
  const statusColors = {
    good: 'text-green-600 bg-green-100',
    warning: 'text-amber-600 bg-amber-100',
    error: 'text-red-600 bg-red-100'
  };

  const StatusIcon = status === 'good' ? CheckCircle : status === 'warning' ? AlertCircle : XCircle;

  return (
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <StatusIcon className={`w-4 h-4 ${status === 'good' ? 'text-green-600' : status === 'warning' ? 'text-amber-600' : 'text-red-600'}`} />
          <span className="font-medium text-neutral-900">{label}</span>
        </div>
        <p className="text-xs text-neutral-600">{description}</p>
      </div>
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
        {value}
      </span>
    </div>
  );
};

export default AdminDashboard;
