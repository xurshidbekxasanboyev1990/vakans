import { jobsApi } from '@/lib/api'
import { motion, useScroll, useTransform } from 'framer-motion'
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
import { useEffect, useRef, useState } from 'react'
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
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  })

  const y = useTransform(scrollYProgress, [0, 1], [0, 200])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95])

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

  // Apple-style stagger animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 60 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut" as const,
      },
    },
  }

  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const,
      },
    },
  }

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const,
      },
    },
  }

  return (
    <div className="relative min-h-screen bg-white dark:bg-secondary-950 overflow-hidden">
      {/* Hero Section - Apple Style */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary-50 via-white to-white dark:from-secondary-900 dark:via-secondary-950 dark:to-secondary-950" />

        {/* Floating gradient orbs - Apple style */}
        <motion.div
          className="absolute top-1/4 -left-32 w-96 h-96 bg-gradient-to-r from-primary-400/30 to-purple-400/30 rounded-full blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/4 -right-32 w-96 h-96 bg-gradient-to-r from-blue-400/30 to-cyan-400/30 rounded-full blur-3xl"
          animate={{
            x: [0, -50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        <motion.div
          style={{ y, opacity, scale }}
          className="container mx-auto px-4 py-20 relative z-10"
        >
          <motion.div
            className="max-w-5xl mx-auto text-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Premium Badge */}
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary-500/10 to-purple-500/10 border border-primary-200/50 dark:border-primary-800/50 text-primary-700 dark:text-primary-300 text-sm font-semibold mb-8 backdrop-blur-sm"
            >
              <Sparkles className="h-4 w-4" />
              O'zbekistonning #1 ish qidirish platformasi
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            </motion.div>

            {/* Main Heading - Apple Typography */}
            <motion.h1
              variants={itemVariants}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8"
            >
              <span className="text-secondary-900 dark:text-white">Kelajagingizni</span>
              <br />
              <span className="bg-gradient-to-r from-primary-600 via-purple-600 to-primary-600 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                bugun boshlang
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={itemVariants}
              className="text-xl sm:text-2xl text-secondary-600 dark:text-secondary-400 mb-12 max-w-2xl mx-auto font-light leading-relaxed"
            >
              Minglab ish e'lonlari. Bir platformada.
              <br className="hidden sm:block" />
              Tez, oson va mutlaqo bepul.
            </motion.p>

            {/* CTA Buttons - KATTA & Premium */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-center justify-center gap-6"
            >
              <Link to="/register?role=worker" className="w-full sm:w-auto">
                <motion.button
                  className="group relative w-full sm:w-auto px-12 py-6 bg-gradient-to-r from-primary-600 to-primary-700 text-white text-xl font-bold rounded-2xl shadow-2xl shadow-primary-500/30 overflow-hidden"
                  whileHover={{
                    scale: 1.02,
                    boxShadow: "0 25px 50px -12px rgba(99, 102, 241, 0.4)"
                  }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    <UserCircle className="h-7 w-7" />
                    Ish qidiraman
                    <motion.span
                      className="inline-block"
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight className="h-6 w-6" />
                    </motion.span>
                  </span>
                  {/* Shine effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full"
                    animate={{ translateX: ["100%", "-100%"] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  />
                </motion.button>
              </Link>

              <Link to="/register?role=employer" className="w-full sm:w-auto">
                <motion.button
                  className="group w-full sm:w-auto px-12 py-6 bg-white dark:bg-secondary-900 text-secondary-900 dark:text-white text-xl font-bold rounded-2xl border-2 border-secondary-200 dark:border-secondary-700 shadow-xl"
                  whileHover={{
                    scale: 1.02,
                    borderColor: "rgb(99, 102, 241)",
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)"
                  }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  <span className="flex items-center justify-center gap-3">
                    <Building2 className="h-7 w-7" />
                    Ishchi qidiraman
                    <ArrowRight className="h-6 w-6 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </span>
                </motion.button>
              </Link>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              variants={itemVariants}
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
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-secondary-300 dark:border-secondary-700 rounded-full flex items-start justify-center p-2">
            <motion.div
              className="w-1.5 h-1.5 bg-secondary-400 rounded-full"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      {/* Stats Section - Apple Numbers Style */}
      <section className="py-24 bg-secondary-50 dark:bg-secondary-900/50">
        <div className="container mx-auto px-4">
          <motion.div
            className="grid grid-cols-2 lg:grid-cols-4 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
          >
            {[
              { number: formatNumber(stats.totalJobs), label: "Faol ish e'lonlari", icon: Briefcase },
              { number: formatNumber(stats.totalUsers), label: "Foydalanuvchilar", icon: Users },
              { number: formatNumber(stats.totalCompanies), label: "Kompaniyalar", icon: Building2 },
              { number: `${stats.satisfactionRate || 85}%`, label: "Mamnunlik darajasi", icon: Star },
            ].map((stat, i) => (
              <motion.div
                key={i}
                variants={scaleIn}
                className="text-center"
              >
                <motion.div
                  className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent mb-2"
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  {stat.number}
                </motion.div>
                <p className="text-secondary-600 dark:text-secondary-400 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section - Apple Card Style */}
      <section className="py-32 bg-white dark:bg-secondary-950">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-20"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-secondary-900 dark:text-white mb-6">
              Nima uchun
              <span className="bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent"> Vakans.uz</span>?
            </h2>
            <p className="text-xl text-secondary-600 dark:text-secondary-400 max-w-2xl mx-auto">
              Eng zamonaviy texnologiyalar bilan qurilgan platforma
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
          >
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
              <motion.div
                key={i}
                variants={itemVariants}
                className="group relative bg-secondary-50 dark:bg-secondary-900 rounded-3xl p-8 hover:bg-white dark:hover:bg-secondary-800 transition-all duration-500 border border-transparent hover:border-secondary-200 dark:hover:border-secondary-700 hover:shadow-2xl"
                whileHover={{ y: -10 }}
              >
                <motion.div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-lg`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <feature.icon className="h-8 w-8 text-white" />
                </motion.div>
                <h3 className="text-xl font-bold text-secondary-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-secondary-600 dark:text-secondary-400 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works - Timeline Style */}
      <section className="py-32 bg-gradient-to-b from-secondary-50 to-white dark:from-secondary-900 dark:to-secondary-950">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-20"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-secondary-900 dark:text-white mb-6">
              3 oddiy qadam
            </h2>
            <p className="text-xl text-secondary-600 dark:text-secondary-400">
              Orzuingizdagi ishni topish oson
            </p>
          </motion.div>

          <motion.div
            className="max-w-4xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            {[
              { step: 1, title: "Ro'yxatdan o'ting", desc: "Telefon raqamingiz bilan bepul ro'yxatdan o'ting" },
              { step: 2, title: "Profilingizni to'ldiring", desc: "Ko'nikmalaringiz va tajribangizni kiriting" },
              { step: 3, title: "Ish toping!", desc: "O'zingizga mos ishni topib, ariza yuboring" },
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="relative flex items-start gap-4 sm:gap-8 mb-8 sm:mb-12 last:mb-0"
              >
                {/* Step Number */}
                <motion.div
                  className="relative z-10 flex-shrink-0 w-14 h-14 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-primary-600 to-purple-600 flex items-center justify-center text-white text-xl sm:text-3xl font-bold shadow-xl"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  {item.step}
                </motion.div>

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
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Jobs Preview */}
      <section className="py-32 bg-white dark:bg-secondary-950">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-secondary-900 dark:text-white mb-6">
              Eng so'nggi ish e'lonlari
            </h2>
            <p className="text-xl text-secondary-600 dark:text-secondary-400">
              Hoziroq ko'ring va ariza yuboring
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
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
                <motion.div
                  key={job.id}
                  variants={itemVariants}
                  className="group bg-secondary-50 dark:bg-secondary-900 rounded-3xl p-6 border border-secondary-100 dark:border-secondary-800 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-xl transition-all duration-300"
                  whileHover={{ y: -5 }}
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
                </motion.div>
              ))
            ) : (
              <div className="col-span-1 md:col-span-2 lg:col-span-3">
                <div className="bg-secondary-50 dark:bg-secondary-900 rounded-3xl p-10 border border-secondary-100 dark:border-secondary-800 text-center">
                  <p className="text-secondary-600 dark:text-secondary-400">Hozircha featured ishlar mavjud emas.</p>
                </div>
              </div>
            )}
          </motion.div>

          <motion.div
            className="text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <Link to="/jobs">
              <motion.button
                className="px-10 py-5 bg-secondary-900 dark:bg-white text-white dark:text-secondary-900 text-lg font-bold rounded-2xl"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Barcha ishlarni ko'rish
                <ArrowRight className="inline-block ml-2 h-5 w-5" />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* CTA Section - Apple Style */}
      <section className="py-32 relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-purple-600 to-primary-700" />

        {/* Animated shapes */}
        <motion.div
          className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 12, repeat: Infinity }}
        />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            <motion.h2
              variants={itemVariants}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-8"
            >
              Hoziroq boshlang
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="text-xl sm:text-2xl text-white/80 mb-12 max-w-2xl mx-auto"
            >
              Minglab foydalanuvchilar allaqachon Vakans.uz orqali o'z ishini topdi.
              Siz ham ularga qo'shiling!
            </motion.p>
            <motion.div variants={itemVariants}>
              <Link to="/register">
                <motion.button
                  className="px-14 py-6 bg-white text-primary-600 text-xl font-bold rounded-2xl shadow-2xl"
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.3)"
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Briefcase className="inline-block mr-3 h-6 w-6" />
                  Bepul ro'yxatdan o'tish
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
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
