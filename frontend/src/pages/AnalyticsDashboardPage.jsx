// frontend/src/pages/AnalyticsDashboardPage.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { analyticsAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import MetricsCard from '../components/MetricsCard';
import ApplicationTrendChart from '../components/ApplicationTrendChart';
import DemographicsCharts from '../components/DemographicsCharts';
import {
  Briefcase,
  Users,
  Eye,
  TrendingUp,
  Download,
  RefreshCw,
  Calendar
} from 'lucide-react';

/**
 * AnalyticsDashboardPage Component
 * Comprehensive analytics dashboard for organizations
 */
const AnalyticsDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('30d');

  // Redirect non-organizations
  useEffect(() => {
    if (user && user.role !== 'organization') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Load analytics data
  const loadAnalytics = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await analyticsAPI.getOverview(timeRange);
      setAnalytics(response.data.data);
      setError(null);
    } catch (error) {
      console.error('Failed to load analytics:', error);
      setError('Failed to load analytics data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'organization') {
      loadAnalytics();
    }
  }, [timeRange, user]);

  // Handle time range change
  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
  };

  // Handle refresh
  const handleRefresh = () => {
    loadAnalytics(true);
  };

  // Handle export (placeholder)
  const handleExport = () => {
    // In a real implementation, generate and download CSV/PDF
    alert('Export functionality coming soon!');
  };

  // Time range options
  const timeRangeOptions = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: '90 days' },
    { value: '1y', label: '1 year' }
  ];

  if (user?.role !== 'organization') {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="mt-1 text-gray-600">
              Track your internship performance and applicant insights
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Time Range Selector */}
            <div className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white p-1">
              <Calendar className="ml-2 h-4 w-4 text-gray-500" />
              <select
                value={timeRange}
                onChange={(e) => handleTimeRangeChange(e.target.value)}
                className="border-none bg-transparent pr-8 text-sm font-medium text-gray-700 focus:outline-none focus:ring-0"
                disabled={loading}
              >
                {timeRangeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>

            {/* Export Button */}
            <button
              onClick={handleExport}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-red-800">{error}</p>
            <button
              onClick={() => loadAnalytics()}
              className="mt-2 text-sm font-medium text-red-600 hover:text-red-700"
            >
              Try again
            </button>
          </div>
        )}

        {/* Overview Metrics */}
        <div className="mb-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <MetricsCard
            label="Total Internships"
            value={analytics?.overview?.totalInternships || 0}
            icon={Briefcase}
            color="blue"
            subtitle={`${analytics?.overview?.activeInternships || 0} active`}
            loading={loading}
          />
          <MetricsCard
            label="Total Applications"
            value={analytics?.overview?.totalApplications || 0}
            icon={Users}
            color="green"
            loading={loading}
          />
          <MetricsCard
            label="Total Views"
            value={analytics?.overview?.totalViews || 0}
            icon={Eye}
            color="purple"
            loading={loading}
          />
          <MetricsCard
            label="Conversion Rate"
            value={analytics?.overview?.conversionRate || '0%'}
            icon={TrendingUp}
            color="orange"
            subtitle="Applications / Views"
            loading={loading}
          />
        </div>

        {/* Secondary Metrics */}
        <div className="mb-6 grid gap-6 sm:grid-cols-2">
          <MetricsCard
            label="Offer Acceptance Rate"
            value={analytics?.overview?.offerAcceptanceRate || '0%'}
            icon={TrendingUp}
            color="green"
            subtitle="Accepted / Offered"
            loading={loading}
          />
          <MetricsCard
            label="Active Internships"
            value={analytics?.overview?.activeInternships || 0}
            icon={Briefcase}
            color="blue"
            subtitle="Currently accepting applications"
            loading={loading}
          />
        </div>

        {/* Application Trend Chart */}
        <div className="mb-6">
          <ApplicationTrendChart
            data={analytics?.trends || []}
            loading={loading}
          />
        </div>

        {/* Top Performing Internships */}
        {analytics?.topInternships && analytics.topInternships.length > 0 && (
          <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Top Performing Internships</h3>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200">
                  <tr>
                    <th className="pb-3 text-left text-sm font-semibold text-gray-700">Internship Title</th>
                    <th className="pb-3 text-right text-sm font-semibold text-gray-700">Applications</th>
                    <th className="pb-3 text-right text-sm font-semibold text-gray-700">Views</th>
                    <th className="pb-3 text-right text-sm font-semibold text-gray-700">Conversion</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {analytics.topInternships.map((internship, index) => (
                    <tr key={internship.id || index} className="hover:bg-gray-50">
                      <td className="py-3 text-sm text-gray-900">
                        <div className="font-medium">{internship.title}</div>
                      </td>
                      <td className="py-3 text-right text-sm font-medium text-gray-900">
                        {internship.applications}
                      </td>
                      <td className="py-3 text-right text-sm text-gray-600">
                        {internship.views}
                      </td>
                      <td className="py-3 text-right text-sm font-semibold text-blue-600">
                        {internship.conversionRate}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Demographics Charts */}
        <DemographicsCharts
          demographics={{
            ...analytics?.demographics,
            statusBreakdown: analytics?.statusBreakdown
          }}
          loading={loading}
        />

        {/* Last Updated */}
        {analytics && (
          <div className="mt-6 text-center text-sm text-gray-500">
            Last updated: {new Date().toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboardPage;
