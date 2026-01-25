import { useAuth } from '@/contexts/AuthContext'
import { useSocket } from '@/contexts/SocketContext'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { Bell, Briefcase, Home, MessageSquare, User } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

export function BottomNav() {
  const location = useLocation()
  const { isAuthenticated } = useAuth()
  const { unreadNotificationsCount, unreadMessagesCount } = useSocket()

  // Don't show on auth pages
  if (location.pathname.startsWith('/login') || location.pathname.startsWith('/register')) {
    return null
  }

  // Don't show on landing page for non-authenticated users
  if (!isAuthenticated && location.pathname === '/') {
    return null
  }

  // Different nav items based on auth status
  const navItems = isAuthenticated ? [
    { path: '/dashboard', icon: Home, label: 'Asosiy', badge: 0 },
    { path: '/jobs', icon: Briefcase, label: 'Ishlar', badge: 0 },
    { path: '/chat', icon: MessageSquare, label: 'Xabarlar', badge: unreadMessagesCount },
    { path: '/notifications', icon: Bell, label: 'Bildirishnoma', badge: unreadNotificationsCount },
    { path: '/profile', icon: User, label: 'Profil', badge: 0 },
  ] : [
    { path: '/', icon: Home, label: 'Bosh sahifa', badge: 0 },
    { path: '/jobs', icon: Briefcase, label: 'Ishlar', badge: 0 },
    { path: '/login', icon: User, label: 'Kirish', badge: 0 },
  ]

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
    >
      <div className="bg-white/95 dark:bg-secondary-900/95 backdrop-blur-xl border-t border-secondary-200 dark:border-secondary-800 px-2 pb-safe">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path ||
              (item.path !== '/' && item.path !== '/dashboard' && location.pathname.startsWith(item.path))

            return (
              <Link
                key={item.path}
                to={item.path}
                aria-current={isActive ? 'page' : undefined}
                aria-label={item.label}
                className="relative flex flex-col items-center justify-center gap-1 px-3 py-2"
              >
                {isActive && (
                  <motion.div
                    layoutId="bottomNavIndicator"
                    className="absolute -top-1 w-12 h-1 bg-primary-500 rounded-full"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
                <motion.div
                  animate={{ scale: isActive ? 1.1 : 1 }}
                  transition={{ type: 'spring', stiffness: 500 }}
                  className="relative"
                >
                  <item.icon
                    className={cn(
                      'w-5 h-5 transition-colors',
                      isActive ? 'text-primary-500' : 'text-secondary-400'
                    )}
                    aria-hidden="true"
                  />
                  {/* Badge for notifications/messages */}
                  {item.badge > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </motion.div>
                <span
                  className={cn(
                    'text-[10px] font-medium transition-colors',
                    isActive ? 'text-primary-500' : 'text-secondary-400'
                  )}
                >
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </motion.nav>
  )
}
