import { CheckCircle, Star, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface VerificationBadgeProps {
  verified?: boolean;
  premium?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function VerificationBadge({
  verified = false,
  premium = false,
  className,
  size = 'md',
  showLabel = false,
}: VerificationBadgeProps) {
  if (!verified && !premium) return null;

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  if (premium) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        className={cn('inline-flex items-center gap-1.5', className)}
        title="Premium foydalanuvchi"
      >
        <div className="relative">
          <Star className={cn(sizeClasses[size], 'text-yellow-500')} fill="currentColor" />
          <motion.div
            className="absolute inset-0"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          >
            <Star className={cn(sizeClasses[size], 'text-yellow-400 opacity-50')} fill="currentColor" />
          </motion.div>
        </div>
        {showLabel && <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Premium</span>}
      </motion.div>
    );
  }

  if (verified) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        className={cn('inline-flex items-center gap-1.5', className)}
        title="Tasdiqlangan foydalanuvchi"
      >
        <div className="relative">
          <div className={cn(
            'rounded-full bg-blue-500 flex items-center justify-center',
            size === 'sm' ? 'h-4 w-4 p-0.5' : size === 'md' ? 'h-5 w-5 p-0.5' : 'h-6 w-6 p-1'
          )}>
            <CheckCircle className="h-full w-full text-white" fill="white" />
          </div>
        </div>
        {showLabel && <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Tasdiqlangan</span>}
      </motion.div>
    );
  }

  return null;
}

interface PremiumBadgeProps {
  variant?: 'default' | 'featured' | 'priority';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function PremiumBadge({ variant = 'default', className, size = 'md' }: PremiumBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  const variantConfig = {
    default: {
      bg: 'bg-gradient-to-r from-yellow-400 to-yellow-600',
      text: 'text-white',
      icon: Star,
      label: 'Premium',
    },
    featured: {
      bg: 'bg-gradient-to-r from-purple-500 to-pink-600',
      text: 'text-white',
      icon: Star,
      label: 'Featured',
    },
    priority: {
      bg: 'bg-gradient-to-r from-blue-500 to-cyan-600',
      text: 'text-white',
      icon: Shield,
      label: 'Priority',
    },
  };

  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ scale: 0, rotate: -10 }}
      animate={{ scale: 1, rotate: 0 }}
      whileHover={{ scale: 1.05 }}
      className={cn(
        'inline-flex items-center gap-1.5 font-semibold rounded-full shadow-lg',
        config.bg,
        config.text,
        sizeClasses[size],
        className
      )}
    >
      <Icon className={size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : 'h-5 w-5'} fill="currentColor" />
      {config.label}
    </motion.div>
  );
}

/**
 * Usage Examples:
 * 
 * // Verified user
 * <VerificationBadge verified showLabel />
 * 
 * // Premium user
 * <VerificationBadge premium showLabel />
 * 
 * // Both
 * <div className="flex gap-2">
 *   <VerificationBadge verified />
 *   <VerificationBadge premium />
 * </div>
 * 
 * // Premium job listing
 * <PremiumBadge variant="featured" size="lg" />
 */
