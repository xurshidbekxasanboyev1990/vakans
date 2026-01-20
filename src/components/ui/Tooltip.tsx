import { useState, useRef, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useClickOutside } from '@/hooks'
import { cn } from '@/lib/utils'

interface TooltipProps {
  children: ReactNode
  content: string | ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
  delay?: number
  className?: string
}

export function Tooltip({
  children,
  content,
  position = 'top',
  delay = 200,
  className,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [timeoutId, setTimeoutId] = useState<number | null>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  useClickOutside(tooltipRef, () => setIsVisible(false))

  const handleMouseEnter = () => {
    const id = setTimeout(() => setIsVisible(true), delay)
    setTimeoutId(id)
  }

  const handleMouseLeave = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      setTimeoutId(null)
    }
    setIsVisible(false)
  }

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 -translate-y-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 translate-y-2',
    left: 'right-full top-1/2 -translate-y-1/2 -translate-x-2',
    right: 'left-full top-1/2 -translate-y-1/2 translate-x-2',
  }

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-secondary-900 dark:border-t-secondary-700',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-secondary-900 dark:border-b-secondary-700',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-secondary-900 dark:border-l-secondary-700',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-secondary-900 dark:border-r-secondary-700',
  }

  return (
    <div
      ref={tooltipRef}
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'absolute z-50 px-3 py-2 text-sm text-white bg-secondary-900 dark:bg-secondary-700 rounded-lg shadow-lg whitespace-nowrap pointer-events-none',
              positionClasses[position],
              className
            )}
            role="tooltip"
          >
            {content}
            
            {/* Arrow */}
            <div
              className={cn(
                'absolute w-0 h-0 border-4 border-transparent',
                arrowClasses[position]
              )}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
