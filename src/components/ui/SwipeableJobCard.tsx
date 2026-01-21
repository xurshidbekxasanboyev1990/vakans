import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Heart, X, MapPin, DollarSign, Clock } from 'lucide-react';
import { Job } from '@/types';
import { cn, formatSalary, formatRelativeTime } from '@/lib/utils';
import { Badge } from './Badge';
import { useState } from 'react';

interface SwipeableJobCardProps {
  job: Job;
  onSwipeRight?: (job: Job) => void; // Like/Save
  onSwipeLeft?: (job: Job) => void; // Skip/Reject
  onTap?: (job: Job) => void; // View details
  className?: string;
}

export function SwipeableJobCard({
  job,
  onSwipeRight,
  onSwipeLeft,
  onTap,
  className,
}: SwipeableJobCardProps) {
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-25, 0, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100;

    if (info.offset.x > threshold) {
      // Swipe Right - Like
      setExitDirection('right');
      onSwipeRight?.(job);
    } else if (info.offset.x < -threshold) {
      // Swipe Left - Skip
      setExitDirection('left');
      onSwipeLeft?.(job);
    }
  };

  return (
    <motion.div
      className={cn(
        'absolute inset-0 cursor-grab active:cursor-grabbing',
        className
      )}
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={
        exitDirection
          ? {
              x: exitDirection === 'right' ? 500 : -500,
              opacity: 0,
              transition: { duration: 0.3 },
            }
          : { scale: 1, opacity: 1, x: 0 }
      }
      whileTap={{ scale: 0.95 }}
      onClick={() => !exitDirection && onTap?.(job)}
    >
      {/* Card */}
      <div className="relative h-full bg-white dark:bg-secondary-900 rounded-3xl shadow-2xl overflow-hidden border-2 border-secondary-200 dark:border-secondary-800">
        {/* Swipe Indicators */}
        <motion.div
          className="absolute inset-0 bg-green-500/20 flex items-center justify-center"
          style={{
            opacity: useTransform(x, [0, 100], [0, 1]),
          }}
        >
          <div className="bg-green-500 text-white px-8 py-4 rounded-2xl rotate-[-15deg]">
            <Heart className="h-12 w-12" fill="currentColor" />
          </div>
        </motion.div>

        <motion.div
          className="absolute inset-0 bg-red-500/20 flex items-center justify-center"
          style={{
            opacity: useTransform(x, [-100, 0], [1, 0]),
          }}
        >
          <div className="bg-red-500 text-white px-8 py-4 rounded-2xl rotate-[15deg]">
            <X className="h-12 w-12" />
          </div>
        </motion.div>

        {/* Content */}
        <div className="relative h-full p-8 flex flex-col">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-secondary-900 dark:text-white mb-2 line-clamp-2">
                  {job.title}
                </h3>
                <p className="text-lg text-secondary-600 dark:text-secondary-400">
                  {job.employerName || job.companyName}
                </p>
              </div>
              {job.isFeatured && (
                <Badge variant="warning" className="ml-4">
                  Premium
                </Badge>
              )}
            </div>

            {/* Meta Info */}
            <div className="flex flex-wrap gap-3">
              {job.location && (
                <div className="flex items-center gap-1.5 text-sm text-secondary-600 dark:text-secondary-400">
                  <MapPin className="h-4 w-4" />
                  {job.location}
                </div>
              )}
              {(job.salaryMin || job.salaryMax) && (
                <div className="flex items-center gap-1.5 text-sm text-secondary-600 dark:text-secondary-400">
                  <DollarSign className="h-4 w-4" />
                  {formatSalary(job.salaryMin, job.salaryMax)}
                </div>
              )}
              <div className="flex items-center gap-1.5 text-sm text-secondary-600 dark:text-secondary-400">
                <Clock className="h-4 w-4" />
                {formatRelativeTime(job.createdAt)}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="flex-1 overflow-y-auto mb-6">
            <p className="text-secondary-700 dark:text-secondary-300 leading-relaxed line-clamp-6">
              {job.description}
            </p>
          </div>

          {/* Tags */}
          {job.requirements && typeof job.requirements === 'string' && (
            <div className="flex flex-wrap gap-2 mb-6">
              <Badge variant="info">
                {job.requirements}
              </Badge>
            </div>
          )}

          {/* Work Type Badge */}
          <div className="flex gap-2">
            <Badge variant="info">
              {job.workType === 'remote'
                ? '🏠 Remote'
                : job.workType === 'full-time'
                ? '⏰ To\'liq stavka'
                : job.workType === 'part-time'
                ? '⏱️ Qisman stavka'
                : '📄 Shartnoma'}
            </Badge>
            {job.isUrgent && (
              <Badge variant="danger">🔥 Shoshilinch</Badge>
            )}
          </div>
        </div>

        {/* Instructions Hint */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center pointer-events-none">
          <p className="text-xs text-secondary-400 dark:text-secondary-600">
            ← Rad etish | Saqlash →
          </p>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Usage Example:
 * 
 * <div className="relative h-[600px] w-full max-w-md mx-auto">
 *   {jobs.map((job, index) => (
 *     <SwipeableJobCard
 *       key={job.id}
 *       job={job}
 *       onSwipeRight={(job) => {
 *         saveJob(job);
 *         toast.success('Ish saqlandi!');
 *       }}
 *       onSwipeLeft={(job) => {
 *         skipJob(job);
 *       }}
 *       onTap={(job) => {
 *         navigate(`/jobs/${job.id}`);
 *       }}
 *       style={{ zIndex: jobs.length - index }}
 *     />
 *   ))}
 * </div>
 */
