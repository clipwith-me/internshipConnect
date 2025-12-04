// frontend/src/components/MetricsCard.jsx
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

/**
 * MetricsCard Component
 * Displays a single metric with value, label, icon, and trend
 */
const MetricsCard = ({
  label,
  value,
  icon: Icon,
  trend = null, // { value: "+12%", direction: "up" | "down" | "neutral" }
  subtitle = null,
  color = 'blue',
  loading = false
}) => {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      icon: 'text-blue-600',
      iconBg: 'bg-blue-100'
    },
    green: {
      bg: 'bg-green-50',
      icon: 'text-green-600',
      iconBg: 'bg-green-100'
    },
    purple: {
      bg: 'bg-purple-50',
      icon: 'text-purple-600',
      iconBg: 'bg-purple-100'
    },
    orange: {
      bg: 'bg-orange-50',
      icon: 'text-orange-600',
      iconBg: 'bg-orange-100'
    },
    gray: {
      bg: 'bg-gray-50',
      icon: 'text-gray-600',
      iconBg: 'bg-gray-100'
    }
  };

  const trendConfig = {
    up: {
      icon: TrendingUp,
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    down: {
      icon: TrendingDown,
      color: 'text-red-600',
      bg: 'bg-red-50'
    },
    neutral: {
      icon: Minus,
      color: 'text-gray-600',
      bg: 'bg-gray-50'
    }
  };

  const colors = colorClasses[color] || colorClasses.blue;

  if (loading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="animate-pulse">
          <div className="mb-4 h-12 w-12 rounded-lg bg-gray-200"></div>
          <div className="mb-2 h-8 w-24 bg-gray-200"></div>
          <div className="h-4 w-32 bg-gray-200"></div>
        </div>
      </div>
    );
  }

  const TrendIcon = trend?.direction ? trendConfig[trend.direction].icon : null;
  const trendColor = trend?.direction ? trendConfig[trend.direction].color : '';
  const trendBg = trend?.direction ? trendConfig[trend.direction].bg : '';

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md">
      {/* Icon */}
      {Icon && (
        <div className={`mb-4 inline-flex rounded-lg p-3 ${colors.iconBg}`}>
          <Icon className={`h-6 w-6 ${colors.icon}`} />
        </div>
      )}

      {/* Value */}
      <div className="mb-1 text-3xl font-bold text-gray-900">
        {value}
      </div>

      {/* Label */}
      <div className="mb-2 text-sm font-medium text-gray-600">
        {label}
      </div>

      {/* Trend or Subtitle */}
      {trend && (
        <div className="flex items-center gap-1">
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${trendBg} ${trendColor}`}>
            {TrendIcon && <TrendIcon className="h-3 w-3" />}
            {trend.value}
          </span>
          {trend.label && (
            <span className="text-xs text-gray-500">{trend.label}</span>
          )}
        </div>
      )}

      {subtitle && !trend && (
        <div className="text-xs text-gray-500">{subtitle}</div>
      )}
    </div>
  );
};

export default MetricsCard;
