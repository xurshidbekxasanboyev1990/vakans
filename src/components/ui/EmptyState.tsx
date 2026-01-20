import { motion } from 'framer-motion'
import { FileQuestion, Search, AlertCircle, XCircle, CheckCircle } from 'lucide-react'
import { Button } from './Button'
import { cn } from '@/lib/utils'

type IconType = 'search' | 'error' | 'success' | 'notfound'

interface EmptyStateProps {
  icon?: IconType | React.ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
    variant?: 'primary' | 'secondary' | 'outline'
  }
  className?: string
}

const iconMap: Record<IconType, React.FC<{ className?: string }>> = {
  search: Search,
  error: XCircle,
  success: CheckCircle,
  notfound: FileQuestion,
}

export function EmptyState({ icon = 'notfound', title, description, action, className }: EmptyStateProps) {
  const IconComponent = typeof icon === 'string' ? iconMap[icon as IconType] : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn('flex flex-col items-center justify-center text-center py-16 px-4', className)}
    >
      {/* Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
        className="mb-6 relative"
      >
        <div className="absolute inset-0 bg-primary-500/10 rounded-full blur-2xl" />
        <div className="relative bg-secondary-100 dark:bg-secondary-800 rounded-full p-6">
          {IconComponent ? (
            <IconComponent className="h-16 w-16 text-secondary-400 dark:text-secondary-500" />
          ) : (
            icon
          )}
        </div>
      </motion.div>

      {/* Text */}
      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-2xl font-semibold text-secondary-900 dark:text-white mb-2"
      >
        {title}
      </motion.h3>

      {description && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-secondary-500 dark:text-secondary-400 max-w-md mb-6"
        >
          {description}
        </motion.p>
      )}

      {/* Action */}
      {action && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button variant={action.variant || 'primary'} onClick={action.onClick}>
            {action.label}
          </Button>
        </motion.div>
      )}
    </motion.div>
  )
}

// Pre-built empty states
export function NoJobsFound({ onReset }: { onReset?: () => void }) {
  return (
    <EmptyState
      icon="search"
      title="Ish topilmadi"
      description="Ushbu filterlar bo'yicha hech qanday ish topilmadi. Boshqa qidiruv so'zlarini sinab ko'ring."
      action={
        onReset
          ? {
              label: "Filtrlarni tozalash",
              onClick: onReset,
              variant: 'outline',
            }
          : undefined
      }
    />
  )
}

export function NoApplications() {
  return (
    <EmptyState
      icon="notfound"
      title="Arizalar yo'q"
      description="Siz hali biror ishga ariza bermagansiz. Ish qidirishni boshlang!"
      action={{
        label: "Ishlarni ko'rish",
        onClick: () => window.location.href = '/jobs',
      }}
    />
  )
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <EmptyState
      icon="error"
      title="Xatolik yuz berdi"
      description={message || "Ma'lumotlarni yuklashda xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring."}
      action={
        onRetry
          ? {
              label: "Qayta urinish",
              onClick: onRetry,
              variant: 'primary',
            }
          : undefined
      }
    />
  )
}

export function NoNotifications() {
  return (
    <EmptyState
      icon={<AlertCircle className="h-16 w-16 text-secondary-400" />}
      title="Bildirishnomalar yo'q"
      description="Sizda yangi bildirishnomalar mavjud emas."
    />
  )
}

export function NoMessages() {
  return (
    <EmptyState
      icon="notfound"
      title="Xabarlar yo'q"
      description="Siz hali hech kim bilan suhbat boshlamagansiz."
    />
  )
}
