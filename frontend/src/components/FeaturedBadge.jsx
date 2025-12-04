// frontend/src/components/FeaturedBadge.jsx
import { Star, Crown, Sparkles } from 'lucide-react';

/**
 * FeaturedBadge Component
 * Displays a badge for featured Pro profiles
 */
const FeaturedBadge = ({ variant = 'default', size = 'md', showText = true }) => {
  const variants = {
    default: {
      bg: 'bg-gradient-to-r from-amber-500 to-yellow-500',
      text: 'text-white',
      icon: Star,
      label: 'Featured'
    },
    pro: {
      bg: 'bg-gradient-to-r from-purple-600 to-blue-600',
      text: 'text-white',
      icon: Crown,
      label: 'Pro'
    },
    premium: {
      bg: 'bg-gradient-to-r from-pink-500 to-rose-500',
      text: 'text-white',
      icon: Sparkles,
      label: 'Premium'
    }
  };

  const sizes = {
    sm: {
      padding: 'px-2 py-0.5',
      text: 'text-xs',
      icon: 'h-3 w-3'
    },
    md: {
      padding: 'px-2.5 py-1',
      text: 'text-sm',
      icon: 'h-4 w-4'
    },
    lg: {
      padding: 'px-3 py-1.5',
      text: 'text-base',
      icon: 'h-5 w-5'
    }
  };

  const config = variants[variant] || variants.default;
  const sizeConfig = sizes[size] || sizes.md;
  const Icon = config.icon;

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full font-semibold ${config.bg} ${config.text} ${sizeConfig.padding} ${sizeConfig.text}`}
      title={`${config.label} Profile - Higher visibility in search`}
    >
      <Icon className={sizeConfig.icon} />
      {showText && <span>{config.label}</span>}
    </div>
  );
};

export default FeaturedBadge;
