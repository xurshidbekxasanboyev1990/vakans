import { useAuth } from '@/contexts/AuthContext'
import { Outlet, useLocation } from 'react-router-dom'
import { BottomNav } from './BottomNav'
import { Footer } from './Footer'
import { Header } from './Header'

export function Layout() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  // Footer faqat home page va login qilinmagan holda ko'rinadi
  const showFooter = !isAuthenticated && (location.pathname === '/' || location.pathname === '/jobs')

  return (
    <div className="min-h-screen flex flex-col bg-secondary-50 dark:bg-secondary-950">
      <Header />
      <main className={`flex-1 ${isAuthenticated ? 'pb-16 md:pb-0' : 'pb-0'}`}>
        <Outlet />
      </main>
      {showFooter && <Footer />}
      {isAuthenticated && <BottomNav />}
    </div>
  )
}

export function DashboardLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-secondary-50 dark:bg-secondary-950">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 pb-20 md:pb-8">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
