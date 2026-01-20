import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, Briefcase, MessageSquare, Bell, User } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

const navItems = [
  { path: '/', icon: Home, label: 'Bosh sahifa' },
  { path: '/jobs', icon: Briefcase, label: 'Ishlar' },
  { path: '/chat', icon: MessageSquare, label: 'Xabarlar' },
  { path: '/notifications', icon: Bell, label: 'Bildirishnoma' },
  { path: '/dashboard', icon: User, label: 'Profil' },
]

export function BottomNav() {
  const location = useLocation()
  const { isAuthenticated } = useAuth()

  // Don't show on auth pages
  if (location.pathname.startsWith('/login') || location.pathname.startsWith('/register')) {
    return null
  }

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
    >
      <div className="bg-white/90 dark:bg-secondary-900/90 backdrop-blur-xl border-t border-secondary-200 dark:border-secondary-800 px-2 pb-safe">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path !== '/' && location.pathname.startsWith(item.path))
            
            // Hide auth-required items for guests
            if (!isAuthenticated && ['chat', 'notifications', 'dashboard'].some(p => item.path.includes(p))) {
              if (item.path === '/dashboard') {
                return (
                  <Link
                    key={item.path}
                    to="/login"
                    className="flex flex-col items-center justify-center gap-1 px-3 py-2"
                  >
                    <item.icon className="w-5 h-5 text-secondary-400" />
                    <span className="text-[10px] text-secondary-400">Kirish</span>
                  </Link>
                )
              }
              return null
            }

            return (
              <Link
                key={item.path}
                to={item.path}
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
                >
                  <item.icon 
                    className={cn(
                      'w-5 h-5 transition-colors',
                      isActive ? 'text-primary-500' : 'text-secondary-400'
                    )} 
                  />
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
