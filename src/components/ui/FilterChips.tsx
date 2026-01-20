import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface FilterChip {
  id: string
  label: string
  value: string
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
}

interface FilterChipsProps {
  filters: FilterChip[]
  onRemove: (id: string) => void
  onClearAll?: () => void
  className?: string
}

export function FilterChips({ filters, onRemove, onClearAll, className }: FilterChipsProps) {
  if (filters.length === 0) return null

  const colorVariants = {
    primary: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 hover:bg-primary-200 dark:hover:bg-primary-900/50',
    secondary: 'bg-secondary-100 text-secondary-700 dark:bg-secondary-800 dark:text-secondary-300 hover:bg-secondary-200 dark:hover:bg-secondary-700',
    success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50',
    warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/50',
    danger: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50',
  }

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <AnimatePresence>
        {filters.map((filter) => (
          <motion.div
            key={filter.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
              colorVariants[filter.color || 'secondary']
            )}
          >
            <span>{filter.label}: {filter.value}</span>
            <button
              onClick={() => onRemove(filter.id)}
              className="hover:opacity-70 transition-opacity"
              aria-label={`Remove ${filter.label} filter`}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>

      {onClearAll && filters.length > 1 && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={onClearAll}
          className="text-sm text-secondary-600 dark:text-secondary-400 hover:text-red-600 dark:hover:text-red-400 font-medium transition-colors"
        >
          Hammasini tozalash
        </motion.button>
      )}
    </div>
  )
}
