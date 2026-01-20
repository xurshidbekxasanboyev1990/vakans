import { Link, useNavigate } from 'react-router-dom'
import { Menu, X, Sun, Moon, Bell, MessageSquare, LogOut, User, Settings, Briefcase } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { Button, Avatar } from '@/components/ui'

export function Header() {
  const { user, isAuthenticated, logout } = useAuth()
  const { resolvedTheme, setTheme } = useTheme()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }

  return (
    <header className="sticky top-0 z-40 w-full glass border-b border-secondary-200/50 dark:border-secondary-800/50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
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
                to="/employer"
                className="text-secondary-600 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium"
              >
                Ish e'lon qilish
              </Link>
            )}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors"
              aria-label="Temani o'zgartirish"
            >
              {resolvedTheme === 'dark' ? (
                <Sun className="h-5 w-5 text-secondary-500" />
              ) : (
                <Moon className="h-5 w-5 text-secondary-500" />
              )}
            </button>

            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <button 
                  className="relative p-2 rounded-xl hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors"
                  aria-label="Bildirishnomalar"
                >
                  <Bell className="h-5 w-5 text-secondary-500" />
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" aria-hidden="true" />
                </button>

                {/* Messages */}
                <button 
                  className="relative p-2 rounded-xl hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors"
                  aria-label="Xabarlar"
                >
                  <MessageSquare className="h-5 w-5 text-secondary-500" />
                </button>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors"
                  >
                    <Avatar
                      src={user?.avatar}
                      name={user?.firstName || 'User'}
                      size="sm"
                    />
                    <span className="hidden sm:block text-sm font-medium text-secondary-700 dark:text-secondary-300">
                      {user?.firstName}
                    </span>
                  </button>

                  {isProfileOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsProfileOpen(false)}
                      />
                      <div className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-white dark:bg-secondary-900 shadow-xl border border-secondary-200 dark:border-secondary-800 py-2 z-50 animate-slide-down">
                        <div className="px-4 py-2 border-b border-secondary-100 dark:border-secondary-800">
                          <p className="font-medium text-secondary-900 dark:text-secondary-100">
                            {user?.firstName} {user?.lastName}
                          </p>
                          <p className="text-sm text-secondary-500">{user?.phone}</p>
                        </div>
                        <Link
                          to="/profile"
                          className="flex items-center gap-3 px-4 py-2.5 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-800"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <User className="h-4 w-4" />
                          Profil
                        </Link>
                        <Link
                          to="/settings"
                          className="flex items-center gap-3 px-4 py-2.5 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-800"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <Settings className="h-4 w-4" />
                          Sozlamalar
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <LogOut className="h-4 w-4" />
                          Chiqish
                        </button>
                      </div>
                    </>
                  )}
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
              className="md:hidden p-2 rounded-xl hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors"
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
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-secondary-200 dark:border-secondary-800 animate-slide-down">
            <nav className="flex flex-col gap-2">
              <Link
                to="/jobs"
                className="px-4 py-2 rounded-xl hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Ishlar
              </Link>
              {!isAuthenticated && (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 rounded-xl hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Kirish
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 rounded-xl hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Ro'yxatdan o'tish
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
