import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import { BottomNav } from './BottomNav'

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-secondary-50 dark:bg-secondary-950">
      <Header />
      <main className="flex-1 pb-16 md:pb-0">
        <Outlet />
      </main>
      <Footer />
      <BottomNav />
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
