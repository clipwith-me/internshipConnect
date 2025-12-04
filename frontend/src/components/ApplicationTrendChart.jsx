// frontend/src/components/ApplicationTrendChart.jsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

/**
 * ApplicationTrendChart Component
 * Displays application trends over time with Recharts
 */
const ApplicationTrendChart = ({ data = [], loading = false }) => {
  if (loading) {
    return (
      <div className="flex h-80 items-center justify-center rounded-lg border border-gray-200 bg-white p-6">
        <div className="text-center">
          <div className="mx-auto mb-3 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
          <p className="text-gray-600">Loading trend data...</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex h-80 items-center justify-center rounded-lg border border-gray-200 bg-white p-6">
        <div className="text-center">
          <div className="mb-3 text-4xl">📊</div>
          <h3 className="mb-1 font-semibold text-gray-900">No Data Available</h3>
          <p className="text-sm text-gray-600">
            Application trends will appear here once you receive applications
          </p>
        </div>
      </div>
    );
  }

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Format data for chart
  const chartData = data.map(item => ({
    ...item,
    displayDate: formatDate(item.date)
  }));

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
          <p className="mb-1 font-semibold text-gray-900">{data.displayDate}</p>
          <p className="text-sm text-blue-600">
            <span className="font-medium">{data.applications}</span> application{data.applications !== 1 ? 's' : ''}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">Application Trends</h3>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="displayDate"
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            interval="preserveStartEnd"
          />
          <YAxis
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: '14px', paddingTop: '20px' }}
          />
          <Line
            type="monotone"
            dataKey="applications"
            stroke="#2563eb"
            strokeWidth={2}
            dot={{ fill: '#2563eb', r: 4 }}
            activeDot={{ r: 6 }}
            name="Applications"
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Summary */}
      <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4">
        <div className="text-sm text-gray-600">
          Showing last <span className="font-semibold text-gray-900">{chartData.length}</span> days
        </div>
        <div className="text-sm text-gray-600">
          Total: <span className="font-semibold text-gray-900">
            {chartData.reduce((sum, item) => sum + item.applications, 0)}
          </span> applications
        </div>
      </div>
    </div>
  );
};

export default ApplicationTrendChart;
