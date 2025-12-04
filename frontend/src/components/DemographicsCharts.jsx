// frontend/src/components/DemographicsCharts.jsx
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

/**
 * DemographicsCharts Component
 * Displays applicant demographics with pie and bar charts
 */
const DemographicsCharts = ({ demographics, loading = false }) => {
  const COLORS = ['#2563eb', '#7c3aed', '#db2777', '#ea580c', '#ca8a04', '#059669', '#0891b2'];

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        {[1, 2].map((i) => (
          <div key={i} className="flex h-80 items-center justify-center rounded-lg border border-gray-200 bg-white p-6">
            <div className="text-center">
              <div className="mx-auto mb-3 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
              <p className="text-gray-600">Loading demographics...</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!demographics) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="text-center">
          <p className="text-gray-600">No demographic data available</p>
        </div>
      </div>
    );
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
          <p className="font-semibold text-gray-900">{data.name}</p>
          <p className="text-sm text-blue-600">
            <span className="font-medium">{data.value}</span> applicant{data.value !== 1 ? 's' : ''}
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom label for pie chart
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null; // Hide labels for small slices
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-xs font-semibold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Education Levels - Pie Chart */}
      {demographics.education && demographics.education.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Education Levels</h3>

          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={demographics.education}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
                nameKey="name"
              >
                {demographics.education.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div className="mt-4 space-y-2">
            {demographics.education.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-gray-700">{item.name}</span>
                </div>
                <span className="font-semibold text-gray-900">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Skills - Bar Chart */}
      {demographics.topSkills && demographics.topSkills.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Top Skills</h3>

          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={demographics.topSkills.slice(0, 8)} layout="vertical" margin={{ left: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" stroke="#6b7280" style={{ fontSize: '12px' }} allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="name"
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
                width={100}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="#2563eb" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Experience Levels - Bar Chart */}
      {demographics.experience && demographics.experience.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Experience Levels</h3>

          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={demographics.experience}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="level"
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
                angle={-15}
                textAnchor="end"
                height={60}
              />
              <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="#7c3aed" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Application Status Funnel */}
      {demographics.statusBreakdown && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Application Status</h3>

          <div className="space-y-3">
            {Object.entries(demographics.statusBreakdown).map(([status, count]) => {
              const total = Object.values(demographics.statusBreakdown).reduce((sum, val) => sum + val, 0);
              const percentage = total > 0 ? (count / total) * 100 : 0;

              const statusColors = {
                submitted: 'bg-blue-500',
                'under-review': 'bg-yellow-500',
                shortlisted: 'bg-purple-500',
                interview: 'bg-indigo-500',
                offered: 'bg-green-500',
                accepted: 'bg-emerald-500',
                rejected: 'bg-red-500'
              };

              const statusLabels = {
                submitted: 'Submitted',
                'under-review': 'Under Review',
                shortlisted: 'Shortlisted',
                interview: 'Interview',
                offered: 'Offered',
                accepted: 'Accepted',
                rejected: 'Rejected'
              };

              return (
                <div key={status}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">{statusLabels[status] || status}</span>
                    <span className="font-semibold text-gray-900">
                      {count} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                    <div
                      className={`h-full transition-all ${statusColors[status] || 'bg-gray-500'}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DemographicsCharts;
