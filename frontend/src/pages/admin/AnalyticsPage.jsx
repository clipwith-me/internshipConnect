// frontend/src/pages/admin/AnalyticsPage.jsx
import { useState } from 'react';
import { TrendingUp, Users, Briefcase, DollarSign, Calendar } from 'lucide-react';

const AnalyticsPage = () => {
  const [timeRange, setTimeRange] = useState('30d');

  const stats = {
    userGrowth: { current: 1247, change: '+12.5%', trend: 'up' },
    activeInternships: { current: 423, change: '+8.2%', trend: 'up' },
    revenue: { current: 12450, change: '+22.1%', trend: 'up' },
    conversionRate: { current: 18.3, change: '-2.3%', trend: 'down' }
  };

  const chartData = {
    users: [120, 142, 165, 180, 201, 235, 267, 298, 325, 362, 401, 445],
    applications: [450, 520, 580, 640, 710, 780, 850, 920, 990, 1050, 1120, 1200],
    revenue: [3200, 3800, 4200, 4800, 5400, 6100, 6800, 7500, 8200, 9000, 10200, 11500]
  };

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-neutral-900">Analytics</h1>
            <p className="text-neutral-600 mt-2">Track platform performance and trends</p>
          </div>
          <div className="flex items-center gap-2">
            {['7d', '30d', '90d', '1y'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-primary-600 text-white'
                    : 'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Users"
            value={stats.userGrowth.current.toLocaleString()}
            change={stats.userGrowth.change}
            trend={stats.userGrowth.trend}
            icon={Users}
            color="blue"
          />
          <MetricCard
            title="Active Internships"
            value={stats.activeInternships.current}
            change={stats.activeInternships.change}
            trend={stats.activeInternships.trend}
            icon={Briefcase}
            color="green"
          />
          <MetricCard
            title="Monthly Revenue"
            value={`$${stats.revenue.current.toLocaleString()}`}
            change={stats.revenue.change}
            trend={stats.revenue.trend}
            icon={DollarSign}
            color="purple"
          />
          <MetricCard
            title="Conversion Rate"
            value={`${stats.conversionRate.current}%`}
            change={stats.conversionRate.change}
            trend={stats.conversionRate.trend}
            icon={TrendingUp}
            color="amber"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* User Growth Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200/50 p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">User Growth</h3>
            <div className="h-64 flex items-end justify-between gap-2">
              {chartData.users.map((value, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors cursor-pointer"
                    style={{ height: `${(value / Math.max(...chartData.users)) * 100}%` }}
                    title={`${value} users`}
                  />
                  <span className="text-xs text-neutral-500">
                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][idx]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Applications Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200/50 p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Application Volume</h3>
            <div className="h-64 flex items-end justify-between gap-2">
              {chartData.applications.map((value, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-green-500 rounded-t hover:bg-green-600 transition-colors cursor-pointer"
                    style={{ height: `${(value / Math.max(...chartData.applications)) * 100}%` }}
                    title={`${value} applications`}
                  />
                  <span className="text-xs text-neutral-500">
                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][idx]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200/50 p-6 mb-8">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Revenue Growth</h3>
          <div className="h-80 flex items-end justify-between gap-3">
            {chartData.revenue.map((value, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-purple-500 rounded-t hover:bg-purple-600 transition-colors cursor-pointer"
                  style={{ height: `${(value / Math.max(...chartData.revenue)) * 100}%` }}
                  title={`$${value.toLocaleString()}`}
                />
                <span className="text-xs text-neutral-500">
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][idx]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200/50 p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Top Organizations</h3>
            <div className="space-y-3">
              {[
                { name: 'Tech Corp', internships: 45, applications: 892 },
                { name: 'StartupXYZ', internships: 32, applications: 654 },
                { name: 'Digital Agency', internships: 28, applications: 521 },
                { name: 'Finance Co', internships: 24, applications: 478 },
                { name: 'Media Group', internships: 19, applications: 367 }
              ].map((org, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                  <div>
                    <div className="font-medium text-neutral-900">{org.name}</div>
                    <div className="text-sm text-neutral-600">{org.internships} internships</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-primary-600">{org.applications}</div>
                    <div className="text-xs text-neutral-500">applications</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-neutral-200/50 p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Popular Skills</h3>
            <div className="space-y-3">
              {[
                { skill: 'JavaScript', demand: 95 },
                { skill: 'Python', demand: 88 },
                { skill: 'React', demand: 82 },
                { skill: 'Data Analysis', demand: 76 },
                { skill: 'UI/UX Design', demand: 71 }
              ].map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-neutral-900">{item.skill}</span>
                    <span className="text-neutral-600">{item.demand}%</span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all"
                      style={{ width: `${item.demand}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ title, value, change, trend, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    amber: 'bg-amber-500'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200/50 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${colorClasses[color]} rounded-lg flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <span className={`text-sm font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
          {change}
        </span>
      </div>
      <div className="text-3xl font-bold text-neutral-900 mb-1">{value}</div>
      <div className="text-sm text-neutral-600">{title}</div>
    </div>
  );
};

export default AnalyticsPage;
