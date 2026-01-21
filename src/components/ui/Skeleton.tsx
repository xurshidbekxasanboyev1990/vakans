import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded'
  width?: string | number
  height?: string | number
  animation?: 'pulse' | 'wave' | 'none'
}

export function Skeleton({
  className,
  variant = 'text',
  width,
  height,
  animation = 'pulse',
}: SkeletonProps) {
  const variants = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-xl',
  }

  const animations = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer bg-gradient-to-r from-secondary-200 via-secondary-100 to-secondary-200 dark:from-secondary-800 dark:via-secondary-700 dark:to-secondary-800 bg-[length:200%_100%]',
    none: '',
  }

  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Yuklanmoqda..."
      className={cn(
        'bg-secondary-200 dark:bg-secondary-800',
        variants[variant],
        animations[animation],
        className
      )}
      style={{
        width: width,
        height: height || (variant === 'text' ? '1em' : undefined),
      }}
    />
  )
}

// Job Card Skeleton
export function JobCardSkeleton() {
  return (
    <div className="bg-white dark:bg-secondary-900 rounded-2xl p-6 border border-secondary-200 dark:border-secondary-800">
      <div className="flex items-start gap-4">
        <Skeleton variant="rounded" className="w-14 h-14 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <Skeleton className="h-5 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2 mb-3" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-secondary-100 dark:border-secondary-800 flex items-center justify-between">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  )
}

// User Card Skeleton
export function UserCardSkeleton() {
  return (
    <div className="bg-white dark:bg-secondary-900 rounded-2xl p-6 border border-secondary-200 dark:border-secondary-800">
      <div className="flex items-center gap-4">
        <Skeleton variant="circular" className="w-12 h-12" />
        <div className="flex-1">
          <Skeleton className="h-5 w-32 mb-2" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </div>
  )
}

// Stats Card Skeleton
export function StatsCardSkeleton() {
  return (
    <div className="bg-white dark:bg-secondary-900 rounded-2xl p-6 border border-secondary-200 dark:border-secondary-800">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-8 w-16" />
        </div>
        <Skeleton variant="circular" className="w-12 h-12" />
      </div>
    </div>
  )
}

// Table Row Skeleton
export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <tr className="border-b border-secondary-100 dark:border-secondary-800">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="py-4 px-4">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  )
}

// Profile Skeleton
export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-6">
        <Skeleton variant="circular" className="w-24 h-24" />
        <div className="flex-1">
          <Skeleton className="h-7 w-48 mb-2" />
          <Skeleton className="h-5 w-32 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i}>
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  )
}
