import { motion } from 'framer-motion';

export function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-secondary-900 rounded-2xl p-6 border border-secondary-200 dark:border-secondary-800">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="h-5 bg-secondary-200 dark:bg-secondary-800 rounded-lg w-3/4 mb-3 shimmer" />
          <div className="h-4 bg-secondary-200 dark:bg-secondary-800 rounded-lg w-1/2 shimmer" />
        </div>
        <div className="h-12 w-12 bg-secondary-200 dark:bg-secondary-800 rounded-xl shimmer" />
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-secondary-200 dark:bg-secondary-800 rounded-lg w-full shimmer" />
        <div className="h-3 bg-secondary-200 dark:bg-secondary-800 rounded-lg w-5/6 shimmer" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white dark:bg-secondary-900 rounded-2xl border border-secondary-200 dark:border-secondary-800 overflow-hidden">
      <div className="p-4 border-b border-secondary-200 dark:border-secondary-800">
        <div className="h-5 bg-secondary-200 dark:bg-secondary-800 rounded-lg w-1/4 shimmer" />
      </div>
      <div className="divide-y divide-secondary-200 dark:divide-secondary-800">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 bg-secondary-200 dark:bg-secondary-800 rounded-full shimmer" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-secondary-200 dark:bg-secondary-800 rounded-lg w-1/3 shimmer" />
              <div className="h-3 bg-secondary-200 dark:bg-secondary-800 rounded-lg w-1/4 shimmer" />
            </div>
            <div className="h-8 w-20 bg-secondary-200 dark:bg-secondary-800 rounded-lg shimmer" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonList({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-secondary-900 rounded-2xl p-4 border border-secondary-200 dark:border-secondary-800 flex items-center gap-4"
        >
          <div className="h-12 w-12 bg-secondary-200 dark:bg-secondary-800 rounded-xl shimmer" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-secondary-200 dark:bg-secondary-800 rounded-lg w-2/3 shimmer" />
            <div className="h-3 bg-secondary-200 dark:bg-secondary-800 rounded-lg w-1/2 shimmer" />
          </div>
          <div className="h-8 w-8 bg-secondary-200 dark:bg-secondary-800 rounded-lg shimmer" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`h-4 bg-secondary-200 dark:bg-secondary-800 rounded-lg shimmer`}
          style={{ width: i === lines - 1 ? '60%' : '100%' }}
        />
      ))}
    </div>
  );
}

export function LoadingOverlay({ message = 'Yuklanmoqda...' }: { message?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="bg-white dark:bg-secondary-900 rounded-3xl p-8 shadow-2xl border border-secondary-200 dark:border-secondary-800 flex flex-col items-center gap-4 min-w-[200px]"
      >
        <div className="relative">
          <div className="w-16 h-16 border-4 border-secondary-200 dark:border-secondary-800 rounded-full" />
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-primary-500 rounded-full animate-spin" />
        </div>
        <p className="text-secondary-900 dark:text-white font-medium">{message}</p>
      </motion.div>
    </motion.div>
  );
}

export function InlineLoader({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3',
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={`${sizes[size]} border-secondary-300 dark:border-secondary-700 border-t-primary-500 rounded-full animate-spin`}
      />
    </div>
  );
}
