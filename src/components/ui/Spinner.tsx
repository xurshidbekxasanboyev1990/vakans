import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  }

  return (
    <Loader2 className={cn('animate-spin text-primary-500', sizes[size], className)} />
  )
}

interface LoadingScreenProps {
  message?: string
}

export function LoadingScreen({ message = 'Yuklanmoqda...' }: LoadingScreenProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <Spinner size="lg" />
      <p className="text-secondary-500 dark:text-secondary-400">{message}</p>
    </div>
  )
}

interface LoadingOverlayProps {
  message?: string
}

export function LoadingOverlay({ message = 'Yuklanmoqda...' }: LoadingOverlayProps) {
  return (
    <div className="absolute inset-0 bg-white/80 dark:bg-secondary-900/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4 z-50">
      <Spinner size="lg" />
      <p className="text-secondary-500 dark:text-secondary-400">{message}</p>
    </div>
  )
}
