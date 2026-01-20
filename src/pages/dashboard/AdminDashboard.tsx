import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { 
  Users, Briefcase, FileText, TrendingUp, Shield, ChevronUp, ChevronDown, 
  Eye, CheckCircle, Clock, XCircle, Search, Plus, Edit, Trash2, 
  Settings, Bell, LogOut, Menu, X, Home, FolderOpen,
  UserCheck, Building2, MapPin, Calendar, Filter,
  Download, RefreshCw, MoreVertical, ChevronRight, AlertTriangle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

// Demo ma'lumotlar
const DEMO_STATS = {
  totalUsers: 5234,
  totalJobs: 1847,
  totalApplications: 12453,
  activeJobs: 892,
  pendingJobs: 156,
  closedJobs: 799,
  workers: 4521,
  employers: 698,
  admins: 15,
  todayUsers: 47,
  todayJobs: 23,
  todayApplications: 187,
};

const weeklyData = [
  { name: 'Dush', jobs: 45, users: 28, applications: 124 },
  { name: 'Sesh', jobs: 52, users: 35, applications: 156 },
  { name: 'Chor', jobs: 48, users: 31, applications: 142 },
  { name: 'Pay', jobs: 61, users: 42, applications: 198 },
  { name: 'Jum', jobs: 55, users: 38, applications: 175 },
  { name: 'Shan', jobs: 32, users: 19, applications: 89 },
  { name: 'Yak', jobs: 21, users: 12, applications: 54 },
];

const DEMO_USERS = [
  { id: '1', firstName: 'Aziz', lastName: 'Karimov', phone: '+998901234567', role: 'worker', region: 'Toshkent', isVerified: true, createdAt: '2024-01-15' },
  { id: '2', firstName: 'Jasur', lastName: 'Rahimov', phone: '+998901111111', role: 'employer', region: 'Samarqand', isVerified: true, createdAt: '2024-01-14' },
  { id: '3', firstName: 'Dilnoza', lastName: 'Azizova', phone: '+998907654321', role: 'worker', region: 'Buxoro', isVerified: false, createdAt: '2024-01-13' },
  { id: '4', firstName: 'Sardor', lastName: 'Toshmatov', phone: '+998909876543', role: 'employer', region: 'Toshkent', isVerified: true, createdAt: '2024-01-12' },
  { id: '5', firstName: 'Malika', lastName: 'Xolmatova', phone: '+998903456789', role: 'worker', region: 'Andijon', isVerified: true, createdAt: '2024-01-11' },
];

const DEMO_JOBS = [
  { id: '1', title: 'Senior Frontend Developer', companyName: 'TechUz Solutions', status: 'active', viewsCount: 1234, applicationsCount: 45, location: 'Toshkent', salary: '15-20M', createdAt: '2024-01-15' },
  { id: '2', title: 'Marketing Manager', companyName: 'Digital Agency', status: 'active', viewsCount: 856, applicationsCount: 32, location: 'Toshkent', salary: '8-12M', createdAt: '2024-01-14' },
  { id: '3', title: 'Sotuvchi-konsultant', companyName: 'Market Plus', status: 'pending', viewsCount: 0, applicationsCount: 0, location: 'Samarqand', salary: '3-5M', createdAt: '2024-01-13' },
  { id: '4', title: 'Haydovchi (B toifali)', companyName: 'Logistic Pro', status: 'active', viewsCount: 567, applicationsCount: 23, location: 'Buxoro', salary: '4-6M', createdAt: '2024-01-12' },
  { id: '5', title: 'Accountant', companyName: 'Finance Corp', status: 'closed', viewsCount: 432, applicationsCount: 18, location: 'Toshkent', salary: '6-9M', createdAt: '2024-01-11' },
];

const DEMO_CATEGORIES = [
  { id: '1', name: 'IT va Dasturlash', slug: 'it', jobsCount: 342, icon: '💻' },
  { id: '2', name: 'Marketing va Sotuvlar', slug: 'marketing', jobsCount: 256, icon: '📢' },
  { id: '3', name: 'Moliya va Buxgalteriya', slug: 'finance', jobsCount: 189, icon: '💰' },
  { id: '4', name: 'Ta\'lim', slug: 'education', jobsCount: 167, icon: '📚' },
  { id: '5', name: 'Logistika va Transport', slug: 'logistics', jobsCount: 234, icon: '🚛' },
  { id: '6', name: 'Qurilish', slug: 'construction', jobsCount: 198, icon: '🏗️' },
  { id: '7', name: 'Tibbiyot', slug: 'medicine', jobsCount: 145, icon: '🏥' },
  { id: '8', name: 'Xizmat ko\'rsatish', slug: 'services', jobsCount: 316, icon: '🛎️' },
];

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

type TabType = 'overview' | 'users' | 'jobs' | 'categories' | 'applications' | 'settings';

// StatCard component - tashqarida performance uchun
const StatCard = ({ title, value, icon: Icon, color, trend, trendValue, subtitle }: { 
  title: string; 
  value: number; 
  icon: React.ComponentType<{ className?: string }>; 
  color: string; 
  trend?: 'up' | 'down'; 
  trendValue?: string;
  subtitle?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -4, boxShadow: '0 20px 40px -15px rgba(0,0,0,0.1)' }}
    className="bg-white dark:bg-secondary-900 rounded-2xl p-6 shadow-sm border border-secondary-200 dark:border-secondary-800"
  >
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-secondary-500">{title}</p>
        <motion.p 
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          className="text-3xl font-bold text-secondary-900 dark:text-white mt-1"
        >
          {value.toLocaleString()}
        </motion.p>
        {subtitle && <p className="text-xs text-secondary-400 mt-1">{subtitle}</p>}
        {trend && (
          <div className={`flex items-center gap-1 mt-2 text-sm ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
            {trend === 'up' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            <span>{trendValue}</span>
          </div>
        )}
      </div>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color}`}>
        <Icon className="w-7 h-7 text-white" />
      </div>
    </div>
  </motion.div>
);

export function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const pieData = [
    { name: 'Ishchilar', value: DEMO_STATS.workers },
    { name: 'Ish beruvchilar', value: DEMO_STATS.employers },
    { name: 'Adminlar', value: DEMO_STATS.admins },
  ];

  const jobStatusData = [
    { name: 'Faol', value: DEMO_STATS.activeJobs, color: '#22c55e' },
    { name: 'Kutilmoqda', value: DEMO_STATS.pendingJobs, color: '#f59e0b' },
    { name: 'Yopilgan', value: DEMO_STATS.closedJobs, color: '#6b7280' },
  ];

  const menuItems = [
    { id: 'overview', label: 'Umumiy', icon: Home },
    { id: 'users', label: 'Foydalanuvchilar', icon: Users },
    { id: 'jobs', label: 'Ish e\'lonlari', icon: Briefcase },
    { id: 'categories', label: 'Kategoriyalar', icon: FolderOpen },
    { id: 'applications', label: 'Arizalar', icon: FileText },
    { id: 'settings', label: 'Sozlamalar', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-950 flex">
      {/* Sidebar - Desktop */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: sidebarOpen ? 0 : -280 }}
        className={`hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-72 bg-white dark:bg-secondary-900 border-r border-secondary-200 dark:border-secondary-800 z-40`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-secondary-200 dark:border-secondary-800">
          <Link to="/" className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/30">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-secondary-900 dark:text-white">Vakans.uz</span>
              <p className="text-xs text-secondary-500">Admin Panel</p>
            </div>
          </Link>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item, i) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setActiveTab(item.id as TabType)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                  : 'text-secondary-600 dark:text-secondary-400 hover:bg-secondary-100 dark:hover:bg-secondary-800'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
              {item.id === 'applications' && (
                <span className="ml-auto px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">12</span>
              )}
            </motion.button>
          ))}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-secondary-200 dark:border-secondary-800">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary-50 dark:bg-secondary-800">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold">
              {user?.firstName?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-secondary-900 dark:text-white truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-secondary-500">Administrator</p>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 text-secondary-400 hover:text-red-500 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className="lg:hidden fixed left-0 top-0 bottom-0 w-72 bg-white dark:bg-secondary-900 z-50 shadow-2xl"
          >
            <div className="p-4 flex items-center justify-between border-b border-secondary-200 dark:border-secondary-800">
              <span className="text-xl font-bold text-secondary-900 dark:text-white">Menu</span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2">
                <X className="w-6 h-6" />
              </button>
            </div>
            <nav className="p-4 space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id as TabType); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === item.id
                      ? 'bg-primary-500 text-white'
                      : 'text-secondary-600 dark:text-secondary-400'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </nav>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className={`flex-1 ${sidebarOpen ? 'lg:ml-72' : ''}`}>
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-secondary-900/80 backdrop-blur-xl border-b border-secondary-200 dark:border-secondary-800">
          <div className="flex items-center justify-between px-4 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 text-secondary-600"
              >
                <Menu className="w-6 h-6" />
              </button>
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="hidden lg:block p-2 text-secondary-600 hover:text-secondary-900 dark:hover:text-white"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="hidden sm:block relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                <input
                  type="text"
                  placeholder="Qidirish..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-10 pr-4 py-2 bg-secondary-100 dark:bg-secondary-800 border-0 rounded-xl text-secondary-900 dark:text-white placeholder:text-secondary-400 focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="relative p-2 text-secondary-600 hover:text-secondary-900 dark:hover:text-white">
                <Bell className="w-6 h-6" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <button className="p-2 text-secondary-600 hover:text-secondary-900 dark:hover:text-white">
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-4 lg:p-8 pb-24">
          <AnimatePresence mode="wait">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {/* Welcome */}
                <div className="mb-8">
                  <h1 className="text-2xl lg:text-3xl font-bold text-secondary-900 dark:text-white">
                    Xush kelibsiz, {user?.firstName}! 👋
                  </h1>
                  <p className="text-secondary-500 mt-1">Bugungi statistika va yangiliklar</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
                  <StatCard 
                    title="Jami foydalanuvchilar" 
                    value={DEMO_STATS.totalUsers} 
                    icon={Users} 
                    color="bg-gradient-to-br from-blue-500 to-blue-600" 
                    trend="up" 
                    trendValue="+12% bu oy"
                    subtitle={`Bugun: +${DEMO_STATS.todayUsers}`}
                  />
                  <StatCard 
                    title="Jami ishlar" 
                    value={DEMO_STATS.totalJobs} 
                    icon={Briefcase} 
                    color="bg-gradient-to-br from-green-500 to-green-600" 
                    trend="up" 
                    trendValue="+8% bu oy"
                    subtitle={`Bugun: +${DEMO_STATS.todayJobs}`}
                  />
                  <StatCard 
                    title="Jami arizalar" 
                    value={DEMO_STATS.totalApplications} 
                    icon={FileText} 
                    color="bg-gradient-to-br from-purple-500 to-purple-600" 
                    trend="up" 
                    trendValue="+23% bu oy"
                    subtitle={`Bugun: +${DEMO_STATS.todayApplications}`}
                  />
                  <StatCard 
                    title="Faol ishlar" 
                    value={DEMO_STATS.activeJobs} 
                    icon={TrendingUp} 
                    color="bg-gradient-to-br from-orange-500 to-orange-600"
                    subtitle={`Kutilmoqda: ${DEMO_STATS.pendingJobs}`}
                  />
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  {/* Weekly Stats */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-secondary-900 rounded-2xl p-6 shadow-sm border border-secondary-200 dark:border-secondary-800"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">Haftalik statistika</h3>
                      <button className="text-sm text-primary-500 hover:text-primary-600">Batafsil →</button>
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                      <AreaChart data={weeklyData}>
                        <defs>
                          <linearGradient id="colorJobs" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                        <YAxis stroke="#9ca3af" fontSize={12} />
                        <Tooltip 
                          contentStyle={{ 
                            background: '#1f2937', 
                            border: 'none', 
                            borderRadius: '12px', 
                            color: '#fff',
                            boxShadow: '0 10px 40px -10px rgba(0,0,0,0.3)'
                          }} 
                        />
                        <Area type="monotone" dataKey="jobs" stroke="#6366f1" fillOpacity={1} fill="url(#colorJobs)" strokeWidth={2} name="Ishlar" />
                        <Area type="monotone" dataKey="applications" stroke="#22c55e" fillOpacity={1} fill="url(#colorApps)" strokeWidth={2} name="Arizalar" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </motion.div>

                  {/* User Distribution */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white dark:bg-secondary-900 rounded-2xl p-6 shadow-sm border border-secondary-200 dark:border-secondary-800"
                  >
                    <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">Foydalanuvchilar taqsimoti</h3>
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie 
                          data={pieData} 
                          cx="50%" 
                          cy="50%" 
                          innerRadius={70} 
                          outerRadius={100} 
                          paddingAngle={5} 
                          dataKey="value"
                        >
                          {pieData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex justify-center gap-6 mt-4">
                      {pieData.map((item, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i] }} />
                          <span className="text-sm text-secondary-600 dark:text-secondary-400">{item.name}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>

                {/* Job Status & Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Job Status */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white dark:bg-secondary-900 rounded-2xl p-6 shadow-sm border border-secondary-200 dark:border-secondary-800"
                  >
                    <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">Ish holatlari</h3>
                    <div className="space-y-4">
                      {jobStatusData.map((item, i) => (
                        <div key={i}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-secondary-600 dark:text-secondary-400">{item.name}</span>
                            <span className="text-sm font-semibold text-secondary-900 dark:text-white">{item.value}</span>
                          </div>
                          <div className="h-2 bg-secondary-100 dark:bg-secondary-800 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(item.value / DEMO_STATS.totalJobs) * 100}%` }}
                              transition={{ duration: 1, delay: i * 0.2 }}
                              className="h-full rounded-full"
                              style={{ background: item.color }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Recent Activity */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="lg:col-span-2 bg-white dark:bg-secondary-900 rounded-2xl p-6 shadow-sm border border-secondary-200 dark:border-secondary-800"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">Oxirgi faoliyat</h3>
                      <button className="text-sm text-primary-500 hover:text-primary-600">Barchasi →</button>
                    </div>
                    <div className="space-y-4">
                      {[
                        { icon: UserCheck, text: 'Yangi foydalanuvchi ro\'yxatdan o\'tdi', time: '2 daqiqa oldin', color: 'text-green-500' },
                        { icon: Briefcase, text: 'Yangi ish e\'loni joylandi', time: '15 daqiqa oldin', color: 'text-blue-500' },
                        { icon: FileText, text: 'Yangi ariza yuborildi', time: '32 daqiqa oldin', color: 'text-purple-500' },
                        { icon: AlertTriangle, text: 'E\'lon shikoyat qilindi', time: '1 soat oldin', color: 'text-orange-500' },
                        { icon: CheckCircle, text: 'E\'lon tasdiqlandi', time: '2 soat oldin', color: 'text-green-500' },
                      ].map((item, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + i * 0.1 }}
                          className="flex items-center gap-4 p-3 rounded-xl hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors cursor-pointer"
                        >
                          <div className={`p-2 rounded-lg bg-secondary-100 dark:bg-secondary-800 ${item.color}`}>
                            <item.icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-secondary-900 dark:text-white">{item.text}</p>
                            <p className="text-xs text-secondary-500">{item.time}</p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-secondary-400" />
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <motion.div
                key="users"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <div>
                    <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">Foydalanuvchilar</h1>
                    <p className="text-secondary-500">Jami: {DEMO_STATS.totalUsers} ta foydalanuvchi</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 rounded-xl hover:bg-secondary-50 dark:hover:bg-secondary-700 transition-colors">
                      <Filter className="w-4 h-4" />
                      Filter
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 rounded-xl hover:bg-secondary-50 dark:hover:bg-secondary-700 transition-colors">
                      <Download className="w-4 h-4" />
                      Export
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors">
                      <Plus className="w-4 h-4" />
                      Qo'shish
                    </button>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-white dark:bg-secondary-900 rounded-xl p-4 border border-secondary-200 dark:border-secondary-800">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                        <Users className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-secondary-900 dark:text-white">{DEMO_STATS.totalUsers}</p>
                        <p className="text-xs text-secondary-500">Jami</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-secondary-900 rounded-xl p-4 border border-secondary-200 dark:border-secondary-800">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                        <UserCheck className="w-5 h-5 text-green-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-secondary-900 dark:text-white">{DEMO_STATS.workers}</p>
                        <p className="text-xs text-secondary-500">Ishchilar</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-secondary-900 rounded-xl p-4 border border-secondary-200 dark:border-secondary-800">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                        <Building2 className="w-5 h-5 text-purple-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-secondary-900 dark:text-white">{DEMO_STATS.employers}</p>
                        <p className="text-xs text-secondary-500">Ish beruvchilar</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-secondary-900 rounded-xl p-4 border border-secondary-200 dark:border-secondary-800">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                        <Shield className="w-5 h-5 text-orange-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-secondary-900 dark:text-white">{DEMO_STATS.admins}</p>
                        <p className="text-xs text-secondary-500">Adminlar</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-secondary-900 rounded-2xl shadow-sm border border-secondary-200 dark:border-secondary-800 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-secondary-50 dark:bg-secondary-950">
                        <tr>
                          <th className="text-left py-4 px-6 text-sm font-semibold text-secondary-600 dark:text-secondary-400">Foydalanuvchi</th>
                          <th className="text-left py-4 px-6 text-sm font-semibold text-secondary-600 dark:text-secondary-400">Telefon</th>
                          <th className="text-left py-4 px-6 text-sm font-semibold text-secondary-600 dark:text-secondary-400">Rol</th>
                          <th className="text-left py-4 px-6 text-sm font-semibold text-secondary-600 dark:text-secondary-400">Hudud</th>
                          <th className="text-left py-4 px-6 text-sm font-semibold text-secondary-600 dark:text-secondary-400">Holat</th>
                          <th className="text-left py-4 px-6 text-sm font-semibold text-secondary-600 dark:text-secondary-400">Amallar</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-secondary-200 dark:divide-secondary-800">
                        {DEMO_USERS.map((u, i) => (
                          <motion.tr
                            key={u.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="hover:bg-secondary-50 dark:hover:bg-secondary-800/50 transition-colors"
                          >
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold">
                                  {u.firstName.charAt(0)}
                                </div>
                                <div>
                                  <p className="font-medium text-secondary-900 dark:text-white">{u.firstName} {u.lastName}</p>
                                  <p className="text-xs text-secondary-500">{u.createdAt}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6 text-secondary-600 dark:text-secondary-400">{u.phone}</td>
                            <td className="py-4 px-6">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                u.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                                u.role === 'employer' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              }`}>
                                {u.role === 'admin' ? 'Admin' : u.role === 'employer' ? 'Ish beruvchi' : 'Ishchi'}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-1 text-secondary-600 dark:text-secondary-400">
                                <MapPin className="w-4 h-4" />
                                {u.region}
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              {u.isVerified ? (
                                <span className="flex items-center gap-1 text-green-500"><CheckCircle className="w-4 h-4" /> Tasdiqlangan</span>
                              ) : (
                                <span className="flex items-center gap-1 text-yellow-500"><Clock className="w-4 h-4" /> Kutilmoqda</span>
                              )}
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-2">
                                <button className="p-2 text-secondary-400 hover:text-primary-500 transition-colors">
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button className="p-2 text-secondary-400 hover:text-blue-500 transition-colors">
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button className="p-2 text-secondary-400 hover:text-red-500 transition-colors">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex items-center justify-between p-4 border-t border-secondary-200 dark:border-secondary-800">
                    <p className="text-sm text-secondary-500">1-5 / {DEMO_STATS.totalUsers}</p>
                    <div className="flex items-center gap-2">
                      <button className="px-4 py-2 text-sm bg-secondary-100 dark:bg-secondary-800 rounded-lg disabled:opacity-50" disabled>Oldingi</button>
                      <button className="px-4 py-2 text-sm bg-primary-500 text-white rounded-lg">1</button>
                      <button className="px-4 py-2 text-sm bg-secondary-100 dark:bg-secondary-800 rounded-lg">2</button>
                      <button className="px-4 py-2 text-sm bg-secondary-100 dark:bg-secondary-800 rounded-lg">3</button>
                      <button className="px-4 py-2 text-sm bg-secondary-100 dark:bg-secondary-800 rounded-lg">Keyingi</button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Jobs Tab */}
            {activeTab === 'jobs' && (
              <motion.div
                key="jobs"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <div>
                    <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">Ish e'lonlari</h1>
                    <p className="text-secondary-500">Jami: {DEMO_STATS.totalJobs} ta e'lon</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 rounded-xl">
                      <Filter className="w-4 h-4" />
                      Filter
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-xl">
                      <Plus className="w-4 h-4" />
                      Yangi e'lon
                    </button>
                  </div>
                </div>

                <div className="bg-white dark:bg-secondary-900 rounded-2xl shadow-sm border border-secondary-200 dark:border-secondary-800 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-secondary-50 dark:bg-secondary-950">
                        <tr>
                          <th className="text-left py-4 px-6 text-sm font-semibold text-secondary-600 dark:text-secondary-400">E'lon</th>
                          <th className="text-left py-4 px-6 text-sm font-semibold text-secondary-600 dark:text-secondary-400">Kompaniya</th>
                          <th className="text-left py-4 px-6 text-sm font-semibold text-secondary-600 dark:text-secondary-400">Maosh</th>
                          <th className="text-left py-4 px-6 text-sm font-semibold text-secondary-600 dark:text-secondary-400">Holat</th>
                          <th className="text-left py-4 px-6 text-sm font-semibold text-secondary-600 dark:text-secondary-400">Ko'rishlar</th>
                          <th className="text-left py-4 px-6 text-sm font-semibold text-secondary-600 dark:text-secondary-400">Amallar</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-secondary-200 dark:divide-secondary-800">
                        {DEMO_JOBS.map((job, i) => (
                          <motion.tr
                            key={job.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="hover:bg-secondary-50 dark:hover:bg-secondary-800/50"
                          >
                            <td className="py-4 px-6">
                              <div>
                                <p className="font-medium text-secondary-900 dark:text-white">{job.title}</p>
                                <div className="flex items-center gap-2 text-xs text-secondary-500 mt-1">
                                  <MapPin className="w-3 h-3" />
                                  {job.location}
                                  <Calendar className="w-3 h-3 ml-2" />
                                  {job.createdAt}
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6 text-secondary-600 dark:text-secondary-400">{job.companyName}</td>
                            <td className="py-4 px-6 font-medium text-secondary-900 dark:text-white">{job.salary}</td>
                            <td className="py-4 px-6">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                job.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                job.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                'bg-secondary-100 text-secondary-700 dark:bg-secondary-800 dark:text-secondary-400'
                              }`}>
                                {job.status === 'active' ? 'Faol' : job.status === 'pending' ? 'Kutilmoqda' : 'Yopilgan'}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-4 text-sm text-secondary-600 dark:text-secondary-400">
                                <span className="flex items-center gap-1"><Eye className="w-4 h-4" />{job.viewsCount}</span>
                                <span className="flex items-center gap-1"><FileText className="w-4 h-4" />{job.applicationsCount}</span>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-1">
                                {job.status === 'pending' && (
                                  <>
                                    <button className="p-2 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg">
                                      <CheckCircle className="w-4 h-4" />
                                    </button>
                                    <button className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                                      <XCircle className="w-4 h-4" />
                                    </button>
                                  </>
                                )}
                                <button className="p-2 text-secondary-400 hover:text-primary-500">
                                  <MoreVertical className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Categories Tab */}
            {activeTab === 'categories' && (
              <motion.div
                key="categories"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <div>
                    <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">Kategoriyalar</h1>
                    <p className="text-secondary-500">Ish kategoriyalarini boshqarish</p>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-xl">
                    <Plus className="w-4 h-4" />
                    Yangi kategoriya
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {DEMO_CATEGORIES.map((cat, i) => (
                    <motion.div
                      key={cat.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ y: -4 }}
                      className="bg-white dark:bg-secondary-900 rounded-2xl p-6 border border-secondary-200 dark:border-secondary-800 hover:shadow-lg transition-all cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <span className="text-4xl">{cat.icon}</span>
                        <button className="p-2 text-secondary-400 hover:text-secondary-600">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </div>
                      <h3 className="font-semibold text-secondary-900 dark:text-white mb-1">{cat.name}</h3>
                      <p className="text-sm text-secondary-500">/{cat.slug}</p>
                      <div className="mt-4 pt-4 border-t border-secondary-100 dark:border-secondary-800">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-secondary-500">Ishlar soni</span>
                          <span className="font-semibold text-secondary-900 dark:text-white">{cat.jobsCount}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Applications Tab */}
            {activeTab === 'applications' && (
              <motion.div
                key="applications"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">Arizalar</h1>
                  <p className="text-secondary-500">Jami: {DEMO_STATS.totalApplications} ta ariza</p>
                </div>

                <div className="bg-white dark:bg-secondary-900 rounded-2xl p-8 border border-secondary-200 dark:border-secondary-800 text-center">
                  <div className="w-20 h-20 rounded-full bg-secondary-100 dark:bg-secondary-800 flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-10 h-10 text-secondary-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-secondary-900 dark:text-white mb-2">Arizalar bo'limi</h3>
                  <p className="text-secondary-500 mb-4">Bu bo'limda ishchilarning arizalarini ko'rish va boshqarish mumkin</p>
                  <p className="text-sm text-secondary-400">Demo rejimda mavjud emas</p>
                </div>
              </motion.div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">Sozlamalar</h1>
                  <p className="text-secondary-500">Tizim sozlamalari</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-secondary-900 rounded-2xl p-6 border border-secondary-200 dark:border-secondary-800">
                    <h3 className="font-semibold text-secondary-900 dark:text-white mb-4">Umumiy sozlamalar</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">Sayt nomi</label>
                        <input type="text" defaultValue="Vakans.uz" className="w-full px-4 py-2 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">Sayt tavsifi</label>
                        <textarea rows={3} defaultValue="O'zbekistonning eng yaxshi ish qidirish platformasi" className="w-full px-4 py-2 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-secondary-900 rounded-2xl p-6 border border-secondary-200 dark:border-secondary-800">
                    <h3 className="font-semibold text-secondary-900 dark:text-white mb-4">Xavfsizlik</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-xl bg-secondary-50 dark:bg-secondary-800">
                        <div>
                          <p className="font-medium text-secondary-900 dark:text-white">Ikki bosqichli autentifikatsiya</p>
                          <p className="text-sm text-secondary-500">Qo'shimcha xavfsizlik</p>
                        </div>
                        <div className="w-12 h-6 rounded-full bg-primary-500 relative cursor-pointer">
                          <div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-white" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-xl bg-secondary-50 dark:bg-secondary-800">
                        <div>
                          <p className="font-medium text-secondary-900 dark:text-white">E'lon moderatsiyasi</p>
                          <p className="text-sm text-secondary-500">Yangi e'lonlarni tekshirish</p>
                        </div>
                        <div className="w-12 h-6 rounded-full bg-primary-500 relative cursor-pointer">
                          <div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;
