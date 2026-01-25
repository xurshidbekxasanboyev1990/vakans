import { jobsApi } from '@/lib/api'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Briefcase,
  Building2,
  CheckCircle,
  MapPin,
  Search,
  Shield,
  Sparkles,
  Star,
  TrendingUp,
  UserCircle,
  Users,
  Zap
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

interface PublicStats {
  totalJobs: number;
  totalUsers: number;
  totalCompanies: number;
  satisfactionRate: number;
}

interface FeaturedJob {
  id: string;
  title: string;
  company: string;
  salary: string;
  location: string;
  type: string;
}

export function LandingPage() {
  // Real data from API
  const [stats, setStats] = useState<PublicStats>({
    totalJobs: 0,
    totalUsers: 0,
    totalCompanies: 0,
    satisfactionRate: 0,
  })
  const [featuredJobs, setFeaturedJobs] = useState<FeaturedJob[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, jobsRes] = await Promise.all([
          jobsApi.getPublicStats(),
          jobsApi.getFeaturedJobs(3),
        ])
        if (statsRes.success && statsRes.data) {
          setStats(statsRes.data)
        }
        if (jobsRes.success && jobsRes.data) {
          setFeaturedJobs(jobsRes.data)
        }
      } catch (error) {
        console.error('Error fetching landing page data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  // Format number with + suffix
  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return `${Math.floor(num / 1000)},${String(num % 1000).padStart(3, '0')}+`
    }
    return num > 0 ? `${num}+` : '0'
  }

  // Simple fast animations
  const staggerContainer = {
    animate: { transition: { staggerChildren: 0.08 } }
  }

  const staggerItem = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.35 } }
  }

  return (
    <div className="relative min-h-screen bg-white dark:bg-secondary-950 overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary-50 via-white to-white dark:from-secondary-900 dark:via-secondary-950 dark:to-secondary-950" />
        
        {/* Static gradient orb */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 md:w-96 h-64 md:h-96 bg-gradient-to-r from-primary-400/20 to-purple-400/20 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 py-20 relative z-10">
          <motion.div
            className="max-w-5xl mx-auto text-center"
            initial="initial"
            animate="animate"
            variants={staggerContainer}
          >
            {/* Premium Badge */}
            <motion.div
              variants={staggerItem}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary-500/10 to-purple-500/10 border border-primary-200/50 dark:border-primary-800/50 text-primary-700 dark:text-primary-300 text-sm font-semibold mb-8 backdrop-blur-sm"
            >
              <Sparkles className="h-4 w-4" />
              O'zbekistonning #1 ish qidirish platformasi
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              variants={staggerItem}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8"
            >
              <span className="text-secondary-900 dark:text-white">Kelajagingizni</span>
              <br />
              <span className="bg-gradient-to-r from-primary-600 via-purple-600 to-primary-600 bg-clip-text text-transparent">
                bugun boshlang
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={staggerItem}
              className="text-xl sm:text-2xl text-secondary-600 dark:text-secondary-400 mb-12 max-w-2xl mx-auto font-light leading-relaxed"
            >
              Minglab ish e'lonlari. Bir platformada.
              <br className="hidden sm:block" />
              Tez, oson va mutlaqo bepul.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={staggerItem}
              className="flex flex-col sm:flex-row items-center justify-center gap-6"
            >
              <Link to="/register?role=worker" className="w-full sm:w-auto">
                <button className="group relative w-full sm:w-auto px-12 py-6 bg-gradient-to-r from-primary-600 to-primary-700 text-white text-xl font-bold rounded-2xl shadow-2xl shadow-primary-500/30 hover:shadow-primary-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
                  <span className="flex items-center justify-center gap-3">
                    <UserCircle className="h-7 w-7" />
                    Ish qidiraman
                    <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
              </Link>

              <Link to="/register?role=employer" className="w-full sm:w-auto">
                <button className="group w-full sm:w-auto px-12 py-6 bg-white dark:bg-secondary-900 text-secondary-900 dark:text-white text-xl font-bold rounded-2xl border-2 border-secondary-200 dark:border-secondary-700 shadow-xl hover:border-primary-500 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
                  <span className="flex items-center justify-center gap-3">
                    <Building2 className="h-7 w-7" />
                    Ishchi qidiraman
                    <ArrowRight className="h-6 w-6 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </span>
                </button>
              </Link>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              variants={staggerItem}
              className="flex flex-wrap items-center justify-center gap-8 mt-14 text-secondary-500 text-base"
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-green-500" />
                100% bepul
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-blue-500" />
                Xavfsiz
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-6 w-6 text-yellow-500" />
                Tezkor
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-secondary-50 dark:bg-secondary-900/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { number: formatNumber(stats.totalJobs), label: "Faol ish e'lonlari", icon: Briefcase },
              { number: formatNumber(stats.totalUsers), label: "Foydalanuvchilar", icon: Users },
              { number: formatNumber(stats.totalCompanies), label: "Kompaniyalar", icon: Building2 },
              { number: `${stats.satisfactionRate || 85}%`, label: "Mamnunlik darajasi", icon: Star },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <p className="text-secondary-600 dark:text-secondary-400 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 bg-white dark:bg-secondary-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-secondary-900 dark:text-white mb-6">
              Nima uchun
              <span className="bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent"> Vakans.uz</span>?
            </h2>
            <p className="text-xl text-secondary-600 dark:text-secondary-400 max-w-2xl mx-auto">
              Eng zamonaviy texnologiyalar bilan qurilgan platforma
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Zap,
                title: "Tezkor",
                description: "Bir necha daqiqada ish toping yoki e'lon qiling",
                gradient: "from-yellow-400 to-orange-500"
              },
              {
                icon: Shield,
                title: "Xavfsiz",
                description: "Barcha e'lonlar moderatsiyadan o'tadi",
                gradient: "from-green-400 to-emerald-500"
              },
              {
                icon: Search,
                title: "Qulay qidiruv",
                description: "Kategoriya, hudud va maosh bo'yicha filtrlash",
                gradient: "from-blue-400 to-cyan-500"
              },
              {
                icon: Users,
                title: "To'g'ridan-to'g'ri",
                description: "Ish beruvchi bilan bevosita bog'laning",
                gradient: "from-purple-400 to-pink-500"
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group relative bg-secondary-50 dark:bg-secondary-900 rounded-3xl p-8 hover:bg-white dark:hover:bg-secondary-800 transition-all duration-300 border border-transparent hover:border-secondary-200 dark:hover:border-secondary-700 hover:shadow-2xl hover:-translate-y-2"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-secondary-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-secondary-600 dark:text-secondary-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Timeline Style */}
      <section className="py-32 bg-gradient-to-b from-secondary-50 to-white dark:from-secondary-900 dark:to-secondary-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-secondary-900 dark:text-white mb-6">
              3 oddiy qadam
            </h2>
            <p className="text-xl text-secondary-600 dark:text-secondary-400">
              Orzuingizdagi ishni topish oson
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {[
              { step: 1, title: "Ro'yxatdan o'ting", desc: "Telefon raqamingiz bilan bepul ro'yxatdan o'ting" },
              { step: 2, title: "Profilingizni to'ldiring", desc: "Ko'nikmalaringiz va tajribangizni kiriting" },
              { step: 3, title: "Ish toping!", desc: "O'zingizga mos ishni topib, ariza yuboring" },
            ].map((item, i) => (
              <div
                key={i}
                className="relative flex items-start gap-4 sm:gap-8 mb-8 sm:mb-12 last:mb-0"
              >
                {/* Step Number */}
                <div className="relative z-10 flex-shrink-0 w-14 h-14 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-primary-600 to-purple-600 flex items-center justify-center text-white text-xl sm:text-3xl font-bold shadow-xl hover:scale-110 transition-transform duration-300">
                  {item.step}
                </div>

                {/* Connector Line */}
                {i < 2 && (
                  <div className="absolute left-7 sm:left-10 top-14 sm:top-20 w-0.5 h-8 sm:h-12 bg-gradient-to-b from-primary-500 to-primary-300" />
                )}

                {/* Content */}
                <div className="flex-1 pt-2 sm:pt-4">
                  <h3 className="text-lg sm:text-2xl font-bold text-secondary-900 dark:text-white mb-1 sm:mb-2">
                    {item.title}
                  </h3>
                  <p className="text-base sm:text-lg text-secondary-600 dark:text-secondary-400">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Jobs Preview */}
      <section className="py-32 bg-white dark:bg-secondary-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-secondary-900 dark:text-white mb-6">
              Eng so'nggi ish e'lonlari
            </h2>
            <p className="text-xl text-secondary-600 dark:text-secondary-400">
              Hoziroq ko'ring va ariza yuboring
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {isLoading ? (
              // Loading skeleton
              [1, 2, 3].map((i) => (
                <div key={i} className="bg-secondary-50 dark:bg-secondary-900 rounded-3xl p-6 border border-secondary-100 dark:border-secondary-800 animate-pulse">
                  <div className="h-6 bg-secondary-200 dark:bg-secondary-700 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-secondary-200 dark:bg-secondary-700 rounded w-1/2 mb-4"></div>
                  <div className="h-4 bg-secondary-200 dark:bg-secondary-700 rounded w-2/3"></div>
                </div>
              ))
            ) : featuredJobs.length > 0 ? (
              featuredJobs.map((job) => (
                <div
                  key={job.id}
                  className="group bg-secondary-50 dark:bg-secondary-900 rounded-3xl p-6 border border-secondary-100 dark:border-secondary-800 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-secondary-900 dark:text-white group-hover:text-primary-600 transition-colors">
                        {job.title}
                      </h3>
                      <p className="text-secondary-500">{job.company}</p>
                    </div>
                    <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-medium rounded-full">
                      {job.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-secondary-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      {job.salary} so'm
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-1 md:col-span-2 lg:col-span-3">
                <div className="bg-secondary-50 dark:bg-secondary-900 rounded-3xl p-10 border border-secondary-100 dark:border-secondary-800 text-center">
                  <p className="text-secondary-600 dark:text-secondary-400">Hozircha featured ishlar mavjud emas.</p>
                </div>
              </div>
            )}
          </div>

          <div className="text-center">
            <Link to="/jobs">
              <button className="px-10 py-5 bg-secondary-900 dark:bg-white text-white dark:text-secondary-900 text-lg font-bold rounded-2xl hover:scale-105 active:scale-95 transition-transform duration-200">
                Barcha ishlarni ko'rish
                <ArrowRight className="inline-block ml-2 h-5 w-5" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-purple-600 to-primary-700" />

        {/* Static decorative shapes */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-8">
              Hoziroq boshlang
            </h2>
            <p className="text-xl sm:text-2xl text-white/80 mb-12 max-w-2xl mx-auto">
              Minglab foydalanuvchilar allaqachon Vakans.uz orqali o'z ishini topdi.
              Siz ham ularga qo'shiling!
            </p>
            <Link to="/register">
              <button className="px-14 py-6 bg-white text-primary-600 text-xl font-bold rounded-2xl shadow-2xl hover:scale-105 active:scale-95 transition-transform duration-200">
                <Briefcase className="inline-block mr-3 h-6 w-6" />
                Bepul ro'yxatdan o'tish
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-secondary-950 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <Link to="/" className="flex items-center gap-2 mb-4">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">Vakans.uz</span>
              </Link>
              <p className="text-secondary-400 text-sm">
                O'zbekistonning eng ishonchli ish qidirish platformasi
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Sahifalar</h4>
              <ul className="space-y-2 text-secondary-400 text-sm">
                <li><Link to="/" className="hover:text-white transition-colors">Bosh sahifa</Link></li>
                <li><Link to="/jobs" className="hover:text-white transition-colors">Ishlar</Link></li>
                <li><Link to="/register" className="hover:text-white transition-colors">Ro'yxatdan o'tish</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Yordam</h4>
              <ul className="space-y-2 text-secondary-400 text-sm">
                <li><Link to="#" className="hover:text-white transition-colors">Ko'p so'raladigan savollar</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Bog'lanish</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Maxfiylik siyosati</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Ijtimoiy tarmoqlar</h4>
              <ul className="space-y-2 text-secondary-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Telegram</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Instagram</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Facebook</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-secondary-800 text-center text-secondary-500 text-sm">
            © 2024 Vakans.uz. Barcha huquqlar himoyalangan.
          </div>
        </div>
      </footer>
    </div>
  )
}
