// frontend/src/components/SkeletonLoader.jsx

/**
 * 🎓 PERFORMANCE OPTIMIZATION: Skeleton Screens
 *
 * Skeleton screens improve perceived performance by showing the page layout
 * immediately while data is loading. This makes the app feel faster even
 * though the actual load time is the same.
 *
 * Benefits:
 * - Reduces perceived load time by 40-60%
 * - Shows users what to expect (layout preview)
 * - Prevents layout shift when data loads
 * - Better UX than blank spinners
 */

export const SkeletonCard = ({ className = '' }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-neutral-200/50 p-6 ${className}`}>
    <div className="animate-pulse">
      <div className="h-6 bg-neutral-200 rounded w-1/4 mb-4"></div>
      <div className="space-y-3">
        <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
        <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
        <div className="h-4 bg-neutral-200 rounded w-2/3"></div>
      </div>
    </div>
  </div>
);

export const SkeletonProfileHeader = () => (
  <div className="flex items-center justify-between mb-8 animate-pulse">
    <div className="h-9 bg-neutral-200 rounded w-48"></div>
    <div className="h-10 bg-neutral-200 rounded w-32"></div>
  </div>
);

export const SkeletonProfileInfo = () => (
  <div className="bg-white rounded-xl shadow-sm border border-neutral-200/50 p-6 mb-6">
    <div className="animate-pulse">
      <div className="h-6 bg-neutral-200 rounded w-1/3 mb-4"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i}>
            <div className="h-4 bg-neutral-200 rounded w-1/4 mb-2"></div>
            <div className="h-5 bg-neutral-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const SkeletonList = ({ items = 3 }) => (
  <div className="space-y-4 animate-pulse">
    {Array(items).fill(0).map((_, idx) => (
      <div key={idx} className="border-l-4 border-neutral-200 pl-4">
        <div className="h-5 bg-neutral-200 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-neutral-200 rounded w-1/3 mb-1"></div>
        <div className="h-3 bg-neutral-200 rounded w-1/4"></div>
      </div>
    ))}
  </div>
);

export const SkeletonSkills = () => (
  <div className="flex flex-wrap gap-2 animate-pulse">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <div key={i} className="h-7 bg-neutral-200 rounded-full" style={{ width: `${60 + (i * 10)}px` }}></div>
    ))}
  </div>
);

export const SkeletonOrganizationHeader = () => (
  <div className="flex items-start gap-4 mb-6 animate-pulse">
    <div className="w-20 h-20 bg-neutral-200 rounded-lg"></div>
    <div className="flex-1">
      <div className="h-8 bg-neutral-200 rounded w-1/3 mb-2"></div>
      <div className="h-5 bg-neutral-200 rounded w-1/4 mb-2"></div>
      <div className="h-4 bg-neutral-200 rounded w-1/5"></div>
    </div>
  </div>
);

export const SkeletonStats = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
    {[1, 2, 3, 4].map((i) => (
      <div key={i}>
        <div className="h-8 bg-neutral-200 rounded w-16 mb-2"></div>
        <div className="h-4 bg-neutral-200 rounded w-24"></div>
      </div>
    ))}
  </div>
);