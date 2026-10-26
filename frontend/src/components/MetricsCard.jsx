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
      bg: 'bg-primary-50',
      icon: 'text-primary-600',
      iconBg: 'bg-primary-100'
    },
    green: {
      bg: 'bg-success-50',
      icon: 'text-success-600',
      iconBg: 'bg-success-100'
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
      bg: 'bg-neutral-50',
      icon: 'text-neutral-600',
      iconBg: 'bg-neutral-100'
    }
  };

  const trendConfig = {
    up: {
      icon: TrendingUp,
      color: 'text-success-600',
      bg: 'bg-success-50'
    },
    down: {
      icon: TrendingDown,
      color: 'text-error-600',
      bg: 'bg-error-50'
    },
    neutral: {
      icon: Minus,
      color: 'text-neutral-600',
      bg: 'bg-neutral-50'
    }
  };

  const colors = colorClasses[color] || colorClasses.blue;

  if (loading) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white p-6">
        <div className="animate-pulse">
          <div className="mb-4 h-12 w-12 rounded-lg bg-neutral-200"></div>
          <div className="mb-2 h-8 w-24 bg-neutral-200"></div>
          <div className="h-4 w-32 bg-neutral-200"></div>
        </div>
      </div>
    );
  }

  const TrendIcon = trend?.direction ? trendConfig[trend.direction].icon : null;
  const trendColor = trend?.direction ? trendConfig[trend.direction].color : '';
  const trendBg = trend?.direction ? trendConfig[trend.direction].bg : '';

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-6 transition-shadow hover:shadow-md">
      {/* Icon */}
      {Icon && (
        <div className={`mb-4 inline-flex rounded-lg p-3 ${colors.iconBg}`}>
          <Icon className={`h-6 w-6 ${colors.icon}`} />
        </div>
      )}

      {/* Value */}
      <div className="mb-1 text-3xl font-bold text-neutral-900">
        {value}
      </div>

      {/* Label */}
      <div className="mb-2 text-sm font-medium text-neutral-600">
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
            <span className="text-xs text-neutral-500">{trend.label}</span>
          )}
        </div>
      )}

      {subtitle && !trend && (
        <div className="text-xs text-neutral-500">{subtitle}</div>
      )}
    </div>
  );
};

export default MetricsCard;
