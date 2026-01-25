import { Avatar, Button } from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'
import { useSocket } from '@/contexts/SocketContext'
import { useTheme } from '@/contexts/ThemeContext'
import { notificationsApi } from '@/lib/api'
import { getFileUrl } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'
import { Bell, Briefcase, LogOut, Menu, MessageSquare, Moon, Settings, Sun, User, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export function Header() {
  const { user, isAuthenticated, logout } = useAuth()
  const { resolvedTheme, setTheme } = useTheme()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  // Real-time socket connection
  const { isConnected, newNotification, unreadNotificationsCount, unreadMessagesCount } = useSocket()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close dropdown on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsProfileOpen(false)
        setIsMenuOpen(false)
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await notificationsApi.getUnreadCount()
      if (response.success && response.data) {
        setUnreadCount(response.data.unreadCount)
      }
    } catch {
      // Silent fail - network error
    }
  }, [])

  // Fetch unread count on mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount()
    }
  }, [isAuthenticated, fetchUnreadCount])

  // Update count from socket or notification
  useEffect(() => {
    if (unreadNotificationsCount > 0) {
      setUnreadCount(unreadNotificationsCount)
    }
  }, [unreadNotificationsCount])

  // Also update when new notification arrives
  useEffect(() => {
    if (newNotification) {
      setUnreadCount(prev => prev + 1)
    }
  }, [newNotification])

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${isScrolled
        ? 'bg-white/90 dark:bg-secondary-900/90 backdrop-blur-xl border-b border-secondary-200/50 dark:border-secondary-800/50 shadow-lg shadow-black/5'
        : 'bg-transparent'
        }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <motion.div
              className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center"
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              <Briefcase className="h-5 w-5 text-white" />
            </motion.div>
            <span className="text-xl font-bold gradient-text">Vakans.uz</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/jobs"
              className="text-secondary-600 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium"
            >
              Ishlar
            </Link>
            {isAuthenticated && user?.role === 'employer' && (
              <Link
                to="/dashboard"
                className="text-secondary-600 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium"
              >
                Boshqaruv paneli
              </Link>
            )}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <motion.button
              onClick={toggleTheme}
              className="p-2 rounded-xl hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors"
              aria-label="Temani o'zgartirish"
              whileHover={{ scale: 1.1, rotate: 15 }}
              whileTap={{ scale: 0.9 }}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={resolvedTheme}
                  initial={{ y: -20, opacity: 0, rotate: -180 }}
                  animate={{ y: 0, opacity: 1, rotate: 0 }}
                  exit={{ y: 20, opacity: 0, rotate: 180 }}
                  transition={{ duration: 0.3 }}
                >
                  {resolvedTheme === 'dark' ? (
                    <Sun className="h-5 w-5 text-secondary-500" />
                  ) : (
                    <Moon className="h-5 w-5 text-secondary-500" />
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.button>

            {isAuthenticated ? (
              <>
                {/* Chat */}
                <Link to="/chat">
                  <motion.button
                    className="relative p-2 rounded-xl hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors"
                    aria-label="Xabarlar"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <MessageSquare className="h-5 w-5 text-secondary-500" />
                    {unreadMessagesCount > 0 && (
                      <motion.span
                        className="absolute -top-0.5 -right-0.5 min-w-[20px] h-5 px-1.5 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-[10px] font-bold text-white shadow-lg shadow-green-500/50"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                      >
                        {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
                      </motion.span>
                    )}
                  </motion.button>
                </Link>

                {/* Notifications */}
                <Link to="/notifications">
                  <motion.button
                    className="relative p-2 rounded-xl hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors"
                    aria-label="Bildirishnomalar"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Bell className="h-5 w-5 text-secondary-500" />
                    {unreadCount > 0 && (
                      <motion.span
                        className="absolute -top-0.5 -right-0.5 min-w-[20px] h-5 px-1.5 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-[10px] font-bold text-white shadow-lg shadow-red-500/50"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                      >
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </motion.span>
                    )}
                    {isConnected && (
                      <motion.div
                        className="absolute bottom-1 right-1 h-2 w-2 rounded-full bg-green-500"
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        title="Real-time ulanish aktiv"
                      />
                    )}
                  </motion.button>
                </Link>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors"
                  >
                    <Avatar
                      src={getFileUrl(user?.avatar)}
                      name={user?.firstName || 'User'}
                      size="sm"
                    />
                    <span className="hidden sm:block text-sm font-medium text-secondary-700 dark:text-secondary-300">
                      {user?.firstName}
                    </span>
                  </button>

                  <AnimatePresence>
                    {isProfileOpen && (
                      <>
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="fixed inset-0 z-40"
                          onClick={() => setIsProfileOpen(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-white dark:bg-secondary-900 shadow-xl border border-secondary-200 dark:border-secondary-800 py-2 z-50"
                        >
                          <div className="px-4 py-2 border-b border-secondary-100 dark:border-secondary-800">
                            <p className="font-medium text-secondary-900 dark:text-secondary-100">
                              {user?.firstName} {user?.lastName}
                            </p>
                            <p className="text-sm text-secondary-500">{user?.phone}</p>
                          </div>
                          <Link
                            to="/profile"
                            className="flex items-center gap-3 px-4 py-2.5 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <User className="h-4 w-4" />
                            Profil
                          </Link>
                          <Link
                            to="/settings"
                            className="flex items-center gap-3 px-4 py-2.5 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <Settings className="h-4 w-4" />
                            Sozlamalar
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          >
                            <LogOut className="h-4 w-4" />
                            Chiqish
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Button variant="ghost" onClick={() => navigate('/login')}>
                  Kirish
                </Button>
                <Button onClick={() => navigate('/register')}>
                  Ro'yxatdan o'tish
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="sm:hidden p-2 rounded-xl hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors"
              aria-label={isMenuOpen ? 'Menyuni yopish' : 'Menyuni ochish'}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6 text-secondary-500" />
              ) : (
                <Menu className="h-6 w-6 text-secondary-500" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="sm:hidden border-t border-secondary-200 dark:border-secondary-800 overflow-hidden"
            >
              <nav className="flex flex-col gap-2 py-4">
                <motion.div whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    to="/jobs"
                    className="block px-4 py-2 rounded-xl hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Ishlar
                  </Link>
                </motion.div>
                {!isAuthenticated && (
                  <>
                    <motion.div whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}>
                      <Link
                        to="/login"
                        className="block px-4 py-2 rounded-xl hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Kirish
                      </Link>
                    </motion.div>
                    <motion.div whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}>
                      <Link
                        to="/register"
                        className="block px-4 py-2 rounded-xl hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Ro'yxatdan o'tish
                      </Link>
                    </motion.div>
                  </>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  )
}
