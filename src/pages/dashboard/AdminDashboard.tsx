import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line
} from 'recharts';
import { 
  Users, Briefcase, FileText, Shield, ChevronRight,
  Eye, CheckCircle, Clock, XCircle, Search, Plus, Edit, Trash2, 
  Settings, Bell, LogOut, Menu, X, LayoutDashboard, User,
  UserCheck, Building2, Calendar, Filter, ArrowLeft,
  Download, RefreshCw, MoreVertical, AlertTriangle,
  Activity, DollarSign, Target, Award, MapPin
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/Toast';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useDebounce } from '@/hooks';

// Demo data
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
  revenue: 42750000,
  growth: 23.8,
};

const weeklyData = [
  { name: 'Dush', users: 28, jobs: 45, revenue: 5200000 },
  { name: 'Sesh', users: 35, jobs: 52, revenue: 6100000 },
  { name: 'Chor', users: 31, jobs: 48, revenue: 5800000 },
  { name: 'Pay', users: 42, jobs: 61, revenue: 7200000 },
  { name: 'Jum', users: 38, jobs: 55, revenue: 6500000 },
  { name: 'Shan', users: 19, jobs: 32, revenue: 3900000 },
  { name: 'Yak', users: 12, jobs: 21, revenue: 2600000 },
];

const DEMO_USERS = [
  { id: '1', firstName: 'Aziz', lastName: 'Karimov', phone: '+998 90 123 45 67', role: 'worker', region: 'Toshkent', isVerified: true, createdAt: '15 Yan 2024', status: 'active' },
  { id: '2', firstName: 'Jasur', lastName: 'Rahimov', phone: '+998 90 111 11 11', role: 'employer', region: 'Samarqand', isVerified: true, createdAt: '14 Yan 2024', status: 'active' },
  { id: '3', firstName: 'Dilnoza', lastName: 'Azizova', phone: '+998 90 765 43 21', role: 'worker', region: 'Buxoro', isVerified: false, createdAt: '13 Yan 2024', status: 'pending' },
  { id: '4', firstName: 'Sardor', lastName: 'Toshmatov', phone: '+998 90 987 65 43', role: 'employer', region: 'Toshkent', isVerified: true, createdAt: '12 Yan 2024', status: 'active' },
  { id: '5', firstName: 'Malika', lastName: 'Xolmatova', phone: '+998 90 345 67 89', role: 'worker', region: 'Andijon', isVerified: true, createdAt: '11 Yan 2024', status: 'active' },
];

const DEMO_JOBS = [
  { id: '1', title: 'Senior Frontend Developer', companyName: 'TechUz Solutions', status: 'active', viewsCount: 1234, applicationsCount: 45, location: 'Toshkent', salary: '15M - 20M', createdAt: '15 Yan' },
  { id: '2', title: 'Marketing Manager', companyName: 'Digital Agency', status: 'active', viewsCount: 856, applicationsCount: 32, location: 'Toshkent', salary: '8M - 12M', createdAt: '14 Yan' },
  { id: '3', title: 'Sotuvchi-konsultant', companyName: 'Market Plus', status: 'pending', viewsCount: 0, applicationsCount: 0, location: 'Samarqand', salary: '3M - 5M', createdAt: '13 Yan' },
  { id: '4', title: 'Haydovchi (B toifali)', companyName: 'Logistic Pro', status: 'active', viewsCount: 567, applicationsCount: 23, location: 'Buxoro', salary: '4M - 6M', createdAt: '12 Yan' },
  { id: '5', title: 'Accountant', companyName: 'Finance Corp', status: 'rejected', viewsCount: 432, applicationsCount: 18, location: 'Toshkent', salary: '6M - 9M', createdAt: '11 Yan' },
];

const DEMO_ACTIVITIES = [
  { id: '1', action: 'Yangi foydalanuvchi ro\'yxatdan o\'tdi', user: 'Aziz Karimov', time: '2 daq oldin', type: 'user', icon: UserCheck },
  { id: '2', action: 'Yangi ish e\'loni joylandi', user: 'TechUz Solutions', time: '15 daq oldin', type: 'job', icon: Briefcase },
  { id: '3', action: 'Yangi ariza yuborildi', user: 'Dilnoza Azizova', time: '32 daq oldin', type: 'application', icon: FileText },
  { id: '4', action: 'E\'lon tasdiqlandi', user: 'Admin', time: '1 soat oldin', type: 'admin', icon: CheckCircle },
  { id: '5', action: 'Foydalanuvchi tasdiqlandi', user: 'Sardor Toshmatov', time: '2 soat oldin', type: 'user', icon: Shield },
];

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

type TabType = 'overview' | 'users' | 'jobs' | 'reports' | 'analytics' | 'settings';

// Apple-style AnimatedNumber component
const AnimatedNumber = ({ value, duration = 2000 }: { value: number; duration?: number }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.floor(easeOut * value));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return <>{displayValue.toLocaleString()}</>;
};

// Apple-style StatCard
const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  gradient,
  trend, 
  trendValue,
  subtitle,
  delay = 0
}: { 
  title: string; 
  value: number; 
  icon: React.ComponentType<{ className?: string }>; 
  gradient: string;
  trend?: 'up' | 'down'; 
  trendValue?: string;
  subtitle?: string;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ 
      duration: 0.5,
      delay,
      ease: [0.25, 0.46, 0.45, 0.94]
    }}
    whileHover={{ 
      y: -8, 
      scale: 1.02,
      transition: { duration: 0.3, ease: "easeOut" }
    }}
    className="group relative overflow-hidden bg-white/80 dark:bg-secondary-900/80 backdrop-blur-xl rounded-3xl p-6 border border-white/20 dark:border-secondary-800/50 shadow-xl shadow-black/5 dark:shadow-black/20 cursor-pointer"
  >
    <motion.div 
      className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${gradient}`}
      initial={{ opacity: 0 }}
      whileHover={{ opacity: 0.05 }}
    />
    
    <div className="relative flex items-start justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-secondary-500 dark:text-secondary-400 mb-1">{title}</p>
        <motion.p 
          className="text-4xl font-bold bg-gradient-to-br from-secondary-900 to-secondary-700 dark:from-white dark:to-secondary-300 bg-clip-text text-transparent mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.2 }}
        >
          <AnimatedNumber value={value} />
        </motion.p>
        {subtitle && (
          <p className="text-xs text-secondary-400 mb-2">{subtitle}</p>
        )}
        {trend && trendValue && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: delay + 0.3 }}
            className={`flex items-center gap-1 text-sm font-medium ${
              trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}
          >
            <motion.div
              animate={{ y: trend === 'up' ? [0, -3, 0] : [0, 3, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              {trend === 'up' ? '↑' : '↓'}
            </motion.div>
            <span>{trendValue}</span>
          </motion.div>
        )}
      </div>
      <motion.div 
        className={`relative w-16 h-16 rounded-2xl ${gradient} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300`}
        whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
        transition={{ duration: 0.5 }}
      >
        <Icon className="w-8 h-8 text-white" />
      </motion.div>
    </div>
  </motion.div>
);

export function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('adminSidebarOpen');
    return saved ? JSON.parse(saved) : true;
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant?: 'danger' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Persist sidebar state
  useEffect(() => {
    localStorage.setItem('adminSidebarOpen', JSON.stringify(sidebarOpen));
  }, [sidebarOpen]);

  // Debounced search effect
  useEffect(() => {
    if (debouncedSearch) {
      console.log('Searching for:', debouncedSearch);
      // Implement search logic here
    }
  }, [debouncedSearch]);

  const handleLogout = async () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Chiqishni tasdiqlang',
      message: 'Rostdan ham tizimdan chiqmoqchimisiz?',
      variant: 'warning',
      onConfirm: async () => {
        await logout();
        toast.success('Tizimdan muvaffaqiyatli chiqdingiz');
        navigate('/');
      },
    });
  };

  const handleBack = () => {
    navigate('/');
  };

  const handleDeleteUser = (_userId: string, userName: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Foydalanuvchini o\'chirish',
      message: `${userName}ni o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi.`,
      variant: 'danger',
      onConfirm: () => {
        // Delete user logic
        toast.success('Foydalanuvchi muvaffaqiyatli o\'chirildi');
        setConfirmDialog({ ...confirmDialog, isOpen: false });
      },
    });
  };

  const handleApproveJob = (_jobId: string, jobTitle: string) => {
    toast.success(`"${jobTitle}" e'loni tasdiqlandi`);
  };

  const handleRejectJob = (_jobId: string, jobTitle: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'E\'lonni rad etish',
      message: `"${jobTitle}" e'lonini rad etmoqchimisiz?`,
      variant: 'warning',
      onConfirm: () => {
        toast.warning(`"${jobTitle}" e'loni rad etildi`);
        setConfirmDialog({ ...confirmDialog, isOpen: false });
      },
    });
  };

  const pieData = [
    { name: 'Ishchilar', value: DEMO_STATS.workers, color: COLORS[0] },
    { name: 'Ish beruvchilar', value: DEMO_STATS.employers, color: COLORS[1] },
    { name: 'Adminlar', value: DEMO_STATS.admins, color: COLORS[2] },
  ];

  const menuItems = [
    { id: 'overview', label: 'Umumiy ko\'rinish', icon: LayoutDashboard, badge: null },
    { id: 'users', label: 'Foydalanuvchilar', icon: Users, badge: DEMO_STATS.todayUsers },
    { id: 'jobs', label: 'Ish e\'lonlari', icon: Briefcase, badge: DEMO_STATS.pendingJobs },
    { id: 'reports', label: 'Shikoyatlar', icon: AlertTriangle, badge: 3 },
    { id: 'analytics', label: 'Tahlil', icon: Activity, badge: null },
    { id: 'settings', label: 'Sozlamalar', icon: Settings, badge: null },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-secondary-50 dark:from-secondary-950 dark:via-secondary-900 dark:to-secondary-950">
      {/* Apple-style glassmorphism sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:block lg:w-72"
          >
            <div className="flex h-full flex-col bg-white/80 dark:bg-secondary-900/80 backdrop-blur-2xl border-r border-secondary-200/50 dark:border-secondary-800/50 shadow-2xl">
              {/* Logo */}
              <div className="flex h-20 items-center gap-3 px-6 border-b border-secondary-200/50 dark:border-secondary-800/50">
                <motion.div 
                  className="relative h-12 w-12 rounded-2xl bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 flex items-center justify-center shadow-xl shadow-primary-500/30"
                  whileHover={{ scale: 1.1, rotate: 360 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                >
                  <Shield className="h-6 w-6 text-white" strokeWidth={2.5} />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/20 to-transparent" />
                </motion.div>
                <div>
                  <motion.p 
                    className="text-lg font-bold bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-400 dark:to-primary-600 bg-clip-text text-transparent"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    Vakans.uz
                  </motion.p>
                  <motion.p 
                    className="text-xs text-secondary-500 dark:text-secondary-400"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    Admin Panel
                  </motion.p>
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto scrollbar-thin scrollbar-thumb-secondary-300 dark:scrollbar-thumb-secondary-700">
                {menuItems.map((item, i) => (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.3 }}
                    onClick={() => setActiveTab(item.id as TabType)}
                    className={`relative w-full group flex items-center gap-3 px-4 py-3.5 rounded-2xl font-medium transition-all duration-300 ${
                      activeTab === item.id
                        ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30'
                        : 'text-secondary-600 dark:text-secondary-400 hover:bg-secondary-100/80 dark:hover:bg-secondary-800/80'
                    }`}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {activeTab === item.id && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary-500 to-primary-600"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <item.icon className={`relative z-10 w-5 h-5 ${activeTab === item.id ? 'text-white' : 'group-hover:text-primary-500'} transition-colors`} strokeWidth={2.5} />
                    <span className="relative z-10">{item.label}</span>
                    {item.badge !== null && (
                      <motion.span 
                        className={`relative z-10 ml-auto px-2.5 py-0.5 text-xs font-bold rounded-full ${
                          activeTab === item.id 
                            ? 'bg-white/20 text-white' 
                            : 'bg-red-500 text-white'
                        }`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.05 + 0.2, type: "spring" }}
                      >
                        {item.badge}
                      </motion.span>
                    )}
                  </motion.button>
                ))}
              </nav>

              {/* User profile */}
              <div className="p-4 border-t border-secondary-200/50 dark:border-secondary-800/50">
                <motion.div 
                  className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-br from-secondary-100/80 to-secondary-50/80 dark:from-secondary-800/80 dark:to-secondary-900/80 hover:shadow-lg transition-all duration-300 cursor-pointer group"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-primary-400 via-primary-500 to-primary-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary-500/30 group-hover:shadow-xl group-hover:shadow-primary-500/40 transition-all">
                    {user?.firstName?.charAt(0) || 'A'}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-white/20 to-transparent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-secondary-900 dark:text-white truncate">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-secondary-500 dark:text-secondary-400">Administrator</p>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="p-2 text-secondary-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </motion.div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-secondary-900 shadow-2xl lg:hidden"
            >
              {/* Mobile sidebar content (same as desktop) */}
              <div className="flex h-full flex-col">
                <div className="flex h-20 items-center justify-between px-6 border-b border-secondary-200 dark:border-secondary-800">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-secondary-900 dark:text-white">Vakans.uz</p>
                      <p className="text-xs text-secondary-500">Admin Panel</p>
                    </div>
                  </div>
                  <button onClick={() => setMobileMenuOpen(false)} className="p-2">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <nav className="flex-1 space-y-1 px-3 py-4">
                  {menuItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => { 
                        setActiveTab(item.id as TabType); 
                        setMobileMenuOpen(false); 
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-medium transition-all ${
                        activeTab === item.id
                          ? 'bg-primary-500 text-white'
                          : 'text-secondary-600 dark:text-secondary-400 hover:bg-secondary-100 dark:hover:bg-secondary-800'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.label}</span>
                      {item.badge !== null && (
                        <span className={`ml-auto px-2 py-0.5 text-xs font-bold rounded-full ${
                          activeTab === item.id ? 'bg-white/20' : 'bg-red-500 text-white'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  ))}
                </nav>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:pl-72' : ''}`}>
        {/* Apple-style glassmorphism header */}
        <motion.header 
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className="sticky top-0 z-30 bg-white/70 dark:bg-secondary-900/70 backdrop-blur-2xl border-b border-secondary-200/50 dark:border-secondary-800/50 shadow-lg"
        >
          <div className="flex h-20 items-center justify-between px-4 lg:px-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2.5 rounded-xl bg-secondary-100 dark:bg-secondary-800 hover:bg-secondary-200 dark:hover:bg-secondary-700 transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="hidden lg:flex p-2.5 rounded-xl bg-secondary-100 dark:bg-secondary-800 hover:bg-secondary-200 dark:hover:bg-secondary-700 transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              <motion.button
                onClick={handleBack}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary-100 dark:bg-secondary-800 hover:bg-secondary-200 dark:hover:bg-secondary-700 text-secondary-700 dark:text-secondary-300 font-medium transition-all"
                whileHover={{ scale: 1.05, x: -4 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Orqaga</span>
              </motion.button>
              <div className="hidden md:block relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                <input
                  type="text"
                  placeholder="Qidirish..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-72 pl-10 pr-4 py-2.5 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white/80 dark:bg-secondary-800/80 backdrop-blur-xl text-secondary-900 dark:text-white placeholder:text-secondary-400 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <motion.button 
                className="relative p-2.5 rounded-xl bg-secondary-100 dark:bg-secondary-800 hover:bg-secondary-200 dark:hover:bg-secondary-700 text-secondary-600 dark:text-secondary-400 transition-colors"
                whileHover={{ scale: 1.1, rotate: 15 }}
                whileTap={{ scale: 0.9 }}
              >
                <Bell className="w-5 h-5" />
                <motion.span 
                  className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-lg shadow-red-500/50"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                >
                  2
                </motion.span>
              </motion.button>
              <motion.button 
                className="p-2.5 rounded-xl bg-secondary-100 dark:bg-secondary-800 hover:bg-secondary-200 dark:hover:bg-secondary-700 text-secondary-600 dark:text-secondary-400 transition-colors"
                whileHover={{ scale: 1.1, rotate: 180 }}
                whileTap={{ scale: 0.9 }}
              >
                <RefreshCw className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </motion.header>

        {/* Content area */}
        <main className="p-4 lg:p-8">
          <AnimatePresence mode="wait">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {/* Welcome */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-secondary-900 via-secondary-800 to-secondary-900 dark:from-white dark:via-secondary-200 dark:to-white bg-clip-text text-transparent mb-2">
                    Xush kelibsiz, {user?.firstName}! 👋
                  </h1>
                  <p className="text-secondary-500 dark:text-secondary-400">Bugungi statistika va yangiliklar</p>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard 
                    title="Jami foydalanuvchilar" 
                    value={DEMO_STATS.totalUsers} 
                    icon={Users} 
                    gradient="bg-gradient-to-br from-blue-500 to-blue-600" 
                    trend="up" 
                    trendValue="+12% bu oy"
                    subtitle={`Bugun: +${DEMO_STATS.todayUsers}`}
                    delay={0}
                  />
                  <StatCard 
                    title="Jami ish e'lonlari" 
                    value={DEMO_STATS.totalJobs} 
                    icon={Briefcase} 
                    gradient="bg-gradient-to-br from-green-500 to-green-600" 
                    trend="up" 
                    trendValue="+8% bu oy"
                    subtitle={`Bugun: +${DEMO_STATS.todayJobs}`}
                    delay={0.1}
                  />
                  <StatCard 
                    title="Jami arizalar" 
                    value={DEMO_STATS.totalApplications} 
                    icon={FileText} 
                    gradient="bg-gradient-to-br from-purple-500 to-purple-600" 
                    trend="up" 
                    trendValue="+23% bu oy"
                    subtitle={`Bugun: +${DEMO_STATS.todayApplications}`}
                    delay={0.2}
                  />
                  <StatCard 
                    title="Daromad (UZS)" 
                    value={DEMO_STATS.revenue} 
                    icon={DollarSign} 
                    gradient="bg-gradient-to-br from-orange-500 to-orange-600"
                    trend="up"
                    trendValue="+18% bu oy"
                    delay={0.3}
                  />
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Weekly Stats Chart */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white/80 dark:bg-secondary-900/80 backdrop-blur-xl rounded-3xl p-6 border border-secondary-200/50 dark:border-secondary-800/50 shadow-xl"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">Haftalik statistika</h3>
                      <button className="text-sm text-primary-500 hover:text-primary-600 font-medium">Batafsil →</button>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={weeklyData}>
                        <defs>
                          <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorJobs" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-10" />
                        <XAxis dataKey="name" stroke="currentColor" className="text-xs opacity-60" />
                        <YAxis stroke="currentColor" className="text-xs opacity-60" />
                        <Tooltip 
                          contentStyle={{ 
                            background: 'rgba(17, 24, 39, 0.9)', 
                            border: 'none', 
                            borderRadius: '16px', 
                            color: '#fff',
                            backdropFilter: 'blur(12px)',
                            padding: '12px',
                            boxShadow: '0 20px 40px -10px rgba(0,0,0,0.4)'
                          }} 
                        />
                        <Area type="monotone" dataKey="users" stroke="#6366f1" fillOpacity={1} fill="url(#colorUsers)" strokeWidth={3} name="Foydalanuvchilar" />
                        <Area type="monotone" dataKey="jobs" stroke="#22c55e" fillOpacity={1} fill="url(#colorJobs)" strokeWidth={3} name="Ish e'lonlari" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </motion.div>

                  {/* User Distribution */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white/80 dark:bg-secondary-900/80 backdrop-blur-xl rounded-3xl p-6 border border-secondary-200/50 dark:border-secondary-800/50 shadow-xl"
                  >
                    <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">Foydalanuvchilar taqsimoti</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie 
                          data={pieData} 
                          cx="50%" 
                          cy="50%" 
                          innerRadius={70} 
                          outerRadius={110} 
                          paddingAngle={5} 
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap justify-center gap-4 mt-4">
                      {pieData.map((item, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ background: item.color }} />
                          <span className="text-sm text-secondary-600 dark:text-secondary-400">{item.name}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>

                {/* Recent Activity */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="bg-white/80 dark:bg-secondary-900/80 backdrop-blur-xl rounded-3xl p-6 border border-secondary-200/50 dark:border-secondary-800/50 shadow-xl"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">So'nggi faoliyatlar</h3>
                    <button className="text-sm text-primary-500 hover:text-primary-600 font-medium">Barchasi →</button>
                  </div>
                  <div className="space-y-3">
                    {DEMO_ACTIVITIES.map((item, i) => {
                      const Icon = item.icon;
                      return (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.7 + i * 0.1 }}
                          className="flex items-center gap-4 p-4 rounded-2xl hover:bg-secondary-50/80 dark:hover:bg-secondary-800/50 transition-all cursor-pointer group"
                        >
                          <div className={`p-3 rounded-xl ${
                            item.type === 'user' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' :
                            item.type === 'job' ? 'bg-green-100 dark:bg-green-900/30 text-green-600' :
                            item.type === 'application' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600' :
                            'bg-orange-100 dark:bg-orange-900/30 text-orange-600'
                          }`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-secondary-900 dark:text-white">{item.action}</p>
                            <p className="text-xs text-secondary-500">{item.user} • {item.time}</p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-secondary-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <motion.div
                key="users"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-secondary-900 dark:text-white">Foydalanuvchilar</h2>
                    <p className="text-secondary-500 dark:text-secondary-400">Jami: {DEMO_STATS.totalUsers} ta foydalanuvchi</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <motion.button 
                      className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 rounded-xl hover:bg-secondary-50 dark:hover:bg-secondary-700 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Filter className="w-4 h-4" />
                      Filter
                    </motion.button>
                    <motion.button 
                      className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 rounded-xl hover:bg-secondary-50 dark:hover:bg-secondary-700 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Download className="w-4 h-4" />
                      Export
                    </motion.button>
                    <motion.button 
                      className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:shadow-lg hover:shadow-primary-500/30 transition-all"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Plus className="w-4 h-4" />
                      Qo'shish
                    </motion.button>
                  </div>
                </div>

                {/* Quick stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Jami', value: DEMO_STATS.totalUsers, icon: Users, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' },
                    { label: 'Ishchilar', value: DEMO_STATS.workers, icon: UserCheck, color: 'bg-green-100 dark:bg-green-900/30 text-green-600' },
                    { label: 'Ish beruvchilar', value: DEMO_STATS.employers, icon: Building2, color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600' },
                    { label: 'Adminlar', value: DEMO_STATS.admins, icon: Shield, color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600' },
                  ].map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-white/80 dark:bg-secondary-900/80 backdrop-blur-xl rounded-2xl p-4 border border-secondary-200/50 dark:border-secondary-800/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl ${stat.color}`}>
                          <stat.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-secondary-900 dark:text-white">{stat.value.toLocaleString()}</p>
                          <p className="text-xs text-secondary-500">{stat.label}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Users Table */}
                <div className="bg-white/80 dark:bg-secondary-900/80 backdrop-blur-xl rounded-3xl border border-secondary-200/50 dark:border-secondary-800/50 shadow-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-secondary-50/80 dark:bg-secondary-950/80">
                        <tr>
                          <th className="text-left py-4 px-6">
                            <input type="checkbox" className="w-4 h-4 rounded border-secondary-300" />
                          </th>
                          <th className="text-left py-4 px-6 text-sm font-semibold text-secondary-600 dark:text-secondary-400">Foydalanuvchi</th>
                          <th className="text-left py-4 px-6 text-sm font-semibold text-secondary-600 dark:text-secondary-400">Telefon</th>
                          <th className="text-left py-4 px-6 text-sm font-semibold text-secondary-600 dark:text-secondary-400">Rol</th>
                          <th className="text-left py-4 px-6 text-sm font-semibold text-secondary-600 dark:text-secondary-400">Hudud</th>
                          <th className="text-left py-4 px-6 text-sm font-semibold text-secondary-600 dark:text-secondary-400">Holat</th>
                          <th className="text-left py-4 px-6 text-sm font-semibold text-secondary-600 dark:text-secondary-400">Amallar</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-secondary-200/50 dark:divide-secondary-800/50">
                        {DEMO_USERS.map((u, i) => (
                          <motion.tr
                            key={u.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="hover:bg-secondary-50/50 dark:hover:bg-secondary-800/30 transition-colors"
                          >
                            <td className="py-4 px-6">
                              <input type="checkbox" className="w-4 h-4 rounded border-secondary-300" />
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold text-sm shadow-lg shadow-primary-500/30">
                                  {u.firstName.charAt(0)}{u.lastName.charAt(0)}
                                </div>
                                <div>
                                  <p className="font-medium text-secondary-900 dark:text-white">{u.firstName} {u.lastName}</p>
                                  <p className="text-xs text-secondary-500">{u.createdAt}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6 text-secondary-600 dark:text-secondary-400 font-mono text-sm">{u.phone}</td>
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
                                <div className="flex items-center gap-1 text-green-600">
                                  <CheckCircle className="w-4 h-4" />
                                  <span className="text-sm">Tasdiqlangan</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1 text-yellow-600">
                                  <Clock className="w-4 h-4" />
                                  <span className="text-sm">Kutilmoqda</span>
                                </div>
                              )}
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-1">
                                <motion.button 
                                  className="p-2 rounded-lg text-secondary-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  title="Ko'rish"
                                >
                                  <Eye className="w-4 h-4" />
                                </motion.button>
                                <motion.button 
                                  onClick={() => toast.info('Tahrirlash funksiyasi tez orada...')}
                                  className="p-2 rounded-lg text-secondary-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  title="Tahrirlash"
                                >
                                  <Edit className="w-4 h-4" />
                                </motion.button>
                                <motion.button 
                                  onClick={() => handleDeleteUser(u.id, `${u.firstName} ${u.lastName}`)}
                                  className="p-2 rounded-lg text-secondary-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  title="O'chirish"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </motion.button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {/* Pagination */}
                  <div className="flex items-center justify-between px-6 py-4 border-t border-secondary-200/50 dark:border-secondary-800/50">
                    <p className="text-sm text-secondary-500">1-5 / {DEMO_STATS.totalUsers.toLocaleString()}</p>
                    <div className="flex items-center gap-2">
                      <button className="px-4 py-2 text-sm bg-secondary-100 dark:bg-secondary-800 rounded-lg disabled:opacity-50" disabled>Oldingi</button>
                      <button className="px-4 py-2 text-sm bg-primary-500 text-white rounded-lg font-medium">1</button>
                      <button className="px-4 py-2 text-sm bg-secondary-100 dark:bg-secondary-800 rounded-lg hover:bg-secondary-200 dark:hover:bg-secondary-700">2</button>
                      <button className="px-4 py-2 text-sm bg-secondary-100 dark:bg-secondary-800 rounded-lg hover:bg-secondary-200 dark:hover:bg-secondary-700">3</button>
                      <button className="px-4 py-2 text-sm bg-secondary-100 dark:bg-secondary-800 rounded-lg hover:bg-secondary-200 dark:hover:bg-secondary-700">Keyingi</button>
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
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-secondary-900 dark:text-white">Ish e'lonlari</h2>
                    <p className="text-secondary-500 dark:text-secondary-400">Jami: {DEMO_STATS.totalJobs} ta e'lon</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <motion.button 
                      className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 rounded-xl hover:bg-secondary-50 dark:hover:bg-secondary-700 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Filter className="w-4 h-4" />
                      Filter
                    </motion.button>
                    <motion.button 
                      className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:shadow-lg hover:shadow-primary-500/30 transition-all"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Plus className="w-4 h-4" />
                      Yangi e'lon
                    </motion.button>
                  </div>
                </div>

                {/* Jobs stats */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Faol', value: DEMO_STATS.activeJobs, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' },
                    { label: 'Kutilmoqda', value: DEMO_STATS.pendingJobs, color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
                    { label: 'Yopilgan', value: DEMO_STATS.closedJobs, color: 'text-secondary-600', bg: 'bg-secondary-100 dark:bg-secondary-800' },
                  ].map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-white/80 dark:bg-secondary-900/80 backdrop-blur-xl rounded-2xl p-4 border border-secondary-200/50 dark:border-secondary-800/50"
                    >
                      <div className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${stat.bg} ${stat.color} mb-2`}>
                        {stat.label}
                      </div>
                      <p className="text-3xl font-bold text-secondary-900 dark:text-white">{stat.value}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Jobs Table */}
                <div className="bg-white/80 dark:bg-secondary-900/80 backdrop-blur-xl rounded-3xl border border-secondary-200/50 dark:border-secondary-800/50 shadow-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-secondary-50/80 dark:bg-secondary-950/80">
                        <tr>
                          <th className="text-left py-4 px-6 text-sm font-semibold text-secondary-600 dark:text-secondary-400">E'lon</th>
                          <th className="text-left py-4 px-6 text-sm font-semibold text-secondary-600 dark:text-secondary-400">Kompaniya</th>
                          <th className="text-left py-4 px-6 text-sm font-semibold text-secondary-600 dark:text-secondary-400">Maosh</th>
                          <th className="text-left py-4 px-6 text-sm font-semibold text-secondary-600 dark:text-secondary-400">Holat</th>
                          <th className="text-left py-4 px-6 text-sm font-semibold text-secondary-600 dark:text-secondary-400">Ko'rishlar</th>
                          <th className="text-left py-4 px-6 text-sm font-semibold text-secondary-600 dark:text-secondary-400">Amallar</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-secondary-200/50 dark:divide-secondary-800/50">
                        {DEMO_JOBS.map((job, i) => (
                          <motion.tr
                            key={job.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="hover:bg-secondary-50/50 dark:hover:bg-secondary-800/30 transition-colors"
                          >
                            <td className="py-4 px-6">
                              <div>
                                <p className="font-medium text-secondary-900 dark:text-white mb-1">{job.title}</p>
                                <div className="flex items-center gap-2 text-xs text-secondary-500">
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
                                'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                              }`}>
                                {job.status === 'active' ? 'Faol' : job.status === 'pending' ? 'Kutilmoqda' : 'Rad etilgan'}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-4 text-sm text-secondary-600 dark:text-secondary-400">
                                <span className="flex items-center gap-1">
                                  <Eye className="w-4 h-4" />
                                  {job.viewsCount}
                                </span>
                                <span className="flex items-center gap-1">
                                  <FileText className="w-4 h-4" />
                                  {job.applicationsCount}
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-1">
                                {job.status === 'pending' && (
                                  <>
                                    <motion.button 
                                      onClick={() => handleApproveJob(job.id, job.title)}
                                      className="p-2 rounded-lg text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      title="Tasdiqlash"
                                    >
                                      <CheckCircle className="w-4 h-4" />
                                    </motion.button>
                                    <motion.button 
                                      onClick={() => handleRejectJob(job.id, job.title)}
                                      className="p-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      title="Rad etish"
                                    >
                                      <XCircle className="w-4 h-4" />
                                    </motion.button>
                                  </>
                                )}
                                <motion.button 
                                  className="p-2 rounded-lg text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </motion.button>
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

            {/* Reports Tab */}
            {activeTab === 'reports' && (
              <motion.div
                key="reports"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-secondary-900 dark:text-white">Shikoyatlar</h2>
                    <p className="text-secondary-500 dark:text-secondary-400">Foydalanuvchilar shikoyatlari</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <motion.button 
                      className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 rounded-xl hover:bg-secondary-50 dark:hover:bg-secondary-700 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Filter className="w-4 h-4" />
                      Filter
                    </motion.button>
                  </div>
                </div>

                {/* Reports stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Yangi', value: 3, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30', icon: AlertTriangle },
                    { label: 'Ko\'rib chiqilmoqda', value: 5, color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900/30', icon: Clock },
                    { label: 'Hal qilingan', value: 47, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30', icon: CheckCircle },
                    { label: 'Rad etilgan', value: 12, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30', icon: XCircle },
                  ].map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-white/80 dark:bg-secondary-900/80 backdrop-blur-xl rounded-2xl p-5 border border-secondary-200/50 dark:border-secondary-800/50"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                          <stat.icon className={`w-5 h-5 ${stat.color}`} />
                        </div>
                        <span className="text-sm font-medium text-secondary-600 dark:text-secondary-400">{stat.label}</span>
                      </div>
                      <p className="text-3xl font-bold text-secondary-900 dark:text-white">{stat.value}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Reports List */}
                <div className="space-y-3">
                  {[
                    { id: '1', title: 'Noto\'g\'ri ish e\'loni', user: 'Aziz Karimov', type: 'job', status: 'new', time: '10 daq oldin', priority: 'high' },
                    { id: '2', title: 'Spam xabarlar', user: 'Dilnoza Azizova', type: 'message', status: 'new', time: '1 soat oldin', priority: 'medium' },
                    { id: '3', title: 'Foydalanuvchi buzuqlik qilmoqda', user: 'Jasur Rahimov', type: 'user', status: 'new', time: '2 soat oldin', priority: 'high' },
                    { id: '4', title: 'To\'lov muammosi', user: 'Sardor Toshmatov', type: 'payment', status: 'reviewing', time: '3 soat oldin', priority: 'high' },
                    { id: '5', title: 'Profil ma\'lumotlari xato', user: 'Malika Xolmatova', type: 'profile', status: 'reviewing', time: '5 soat oldin', priority: 'low' },
                  ].map((report, i) => (
                    <motion.div
                      key={report.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-white/80 dark:bg-secondary-900/80 backdrop-blur-xl rounded-2xl p-5 border border-secondary-200/50 dark:border-secondary-800/50 hover:shadow-lg transition-all"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-secondary-900 dark:text-white">{report.title}</h3>
                            {report.priority === 'high' && (
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                Muhim
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-secondary-500 dark:text-secondary-400">
                            <span className="flex items-center gap-1">
                              <User className="w-3.5 h-3.5" />
                              {report.user}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {report.time}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              report.status === 'new' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                              'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                            }`}>
                              {report.status === 'new' ? 'Yangi' : 'Ko\'rib chiqilmoqda'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <motion.button 
                            className="p-2 rounded-lg text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            title="Hal qilish"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </motion.button>
                          <motion.button 
                            className="p-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            title="Rad etish"
                          >
                            <XCircle className="w-4 h-4" />
                          </motion.button>
                          <motion.button 
                            className="p-2 rounded-lg text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <MoreVertical className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold text-secondary-900 dark:text-white mb-1">Tahlil</h2>
                  <p className="text-secondary-500 dark:text-secondary-400">Batafsil statistika va ma'lumotlar</p>
                </div>

                {/* Advanced stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Umumiy daromad', value: '42.7M', icon: DollarSign, gradient: 'bg-gradient-to-br from-green-500 to-emerald-600', trend: 'up', trendValue: '+23.8%' },
                    { label: 'Konversiya', value: '34.2%', icon: Target, gradient: 'bg-gradient-to-br from-blue-500 to-cyan-600', trend: 'up', trendValue: '+5.2%' },
                    { label: 'Faol foydalanuvchilar', value: '1847', icon: Activity, gradient: 'bg-gradient-to-br from-purple-500 to-pink-600', trend: 'up', trendValue: '+12.4%' },
                    { label: 'Reytng', value: '4.8', icon: Award, gradient: 'bg-gradient-to-br from-yellow-500 to-orange-600', trend: 'up', trendValue: '+0.3' },
                  ].map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ y: -4, scale: 1.02 }}
                      className="relative overflow-hidden bg-white/80 dark:bg-secondary-900/80 backdrop-blur-xl rounded-2xl p-5 border border-secondary-200/50 dark:border-secondary-800/50 group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-sm font-medium text-secondary-500 dark:text-secondary-400 mb-1">{stat.label}</p>
                          <p className="text-3xl font-bold text-secondary-900 dark:text-white">{stat.value}</p>
                          {stat.trend && (
                            <p className={`text-sm font-medium mt-1 ${
                              stat.trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                            }`}>
                              {stat.trend === 'up' ? '↑' : '↓'} {stat.trendValue}
                            </p>
                          )}
                        </div>
                        <div className={`p-3 rounded-xl ${stat.gradient} shadow-lg`}>
                          <stat.icon className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Revenue Chart */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/80 dark:bg-secondary-900/80 backdrop-blur-xl rounded-3xl p-6 border border-secondary-200/50 dark:border-secondary-800/50 shadow-xl"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-lg font-bold text-secondary-900 dark:text-white">Haftalik daromad</h3>
                        <p className="text-sm text-secondary-500 dark:text-secondary-400">So'nggi 7 kun</p>
                      </div>
                      <DollarSign className="w-8 h-8 text-green-500" />
                    </div>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={weeklyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                        <XAxis dataKey="name" stroke="rgba(0,0,0,0.5)" style={{ fontSize: '12px' }} />
                        <YAxis stroke="rgba(0,0,0,0.5)" style={{ fontSize: '12px' }} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(255,255,255,0.95)', 
                            borderRadius: '12px', 
                            border: 'none',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                          }}
                        />
                        <Bar dataKey="revenue" fill="url(#revenueGradient)" radius={[8, 8, 0, 0]} />
                        <defs>
                          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity={0.8}/>
                            <stop offset="100%" stopColor="#059669" stopOpacity={0.3}/>
                          </linearGradient>
                        </defs>
                      </BarChart>
                    </ResponsiveContainer>
                  </motion.div>

                  {/* User Activity Chart */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white/80 dark:bg-secondary-900/80 backdrop-blur-xl rounded-3xl p-6 border border-secondary-200/50 dark:border-secondary-800/50 shadow-xl"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-lg font-bold text-secondary-900 dark:text-white">Foydalanuvchi faolligi</h3>
                        <p className="text-sm text-secondary-500 dark:text-secondary-400">Haftalik trend</p>
                      </div>
                      <Activity className="w-8 h-8 text-primary-500" />
                    </div>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={weeklyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                        <XAxis dataKey="name" stroke="rgba(0,0,0,0.5)" style={{ fontSize: '12px' }} />
                        <YAxis stroke="rgba(0,0,0,0.5)" style={{ fontSize: '12px' }} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(255,255,255,0.95)', 
                            borderRadius: '12px', 
                            border: 'none',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                          }}
                        />
                        <Line type="monotone" dataKey="users" stroke="#6366f1" strokeWidth={3} dot={{ fill: '#6366f1', r: 4 }} />
                        <Line type="monotone" dataKey="jobs" stroke="#22c55e" strokeWidth={3} dot={{ fill: '#22c55e', r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </motion.div>
                </div>

                {/* Top Performers */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white/80 dark:bg-secondary-900/80 backdrop-blur-xl rounded-3xl p-6 border border-secondary-200/50 dark:border-secondary-800/50 shadow-xl"
                >
                  <h3 className="text-lg font-bold text-secondary-900 dark:text-white mb-4">Top ishchilar</h3>
                  <div className="space-y-3">
                    {[
                      { name: 'Aziz Karimov', jobs: 47, rating: 4.9, earnings: '12.5M' },
                      { name: 'Jasur Rahimov', jobs: 42, rating: 4.8, earnings: '11.2M' },
                      { name: 'Dilnoza Azizova', jobs: 38, rating: 4.7, earnings: '9.8M' },
                      { name: 'Sardor Toshmatov', jobs: 35, rating: 4.6, earnings: '8.9M' },
                    ].map((worker, i) => (
                      <motion.div
                        key={worker.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + i * 0.05 }}
                        className="flex items-center justify-between p-4 rounded-xl hover:bg-secondary-50 dark:hover:bg-secondary-800/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold">
                            {i + 1}
                          </div>
                          <div>
                            <p className="font-medium text-secondary-900 dark:text-white">{worker.name}</p>
                            <p className="text-sm text-secondary-500 dark:text-secondary-400">{worker.jobs} ta ish</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-secondary-900 dark:text-white">{worker.earnings}</p>
                          <div className="flex items-center gap-1 text-yellow-500">
                            <Award className="w-3.5 h-3.5" />
                            <span className="text-sm font-medium">{worker.rating}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold text-secondary-900 dark:text-white mb-1">Sozlamalar</h2>
                  <p className="text-secondary-500 dark:text-secondary-400">Tizim sozlamalari va konfiguratsiya</p>
                </div>

                {/* Settings Sections */}
                <div className="space-y-4">
                  {[
                    {
                      title: 'Umumiy sozlamalar',
                      icon: Settings,
                      settings: [
                        { label: 'Sayt nomi', value: 'Vakans.uz', type: 'input' },
                        { label: 'Sayt URL', value: 'https://vakans.uz', type: 'input' },
                        { label: 'Admin email', value: 'admin@vakans.uz', type: 'input' },
                        { label: 'Sayt holati', value: 'Faol', type: 'toggle', enabled: true },
                      ]
                    },
                    {
                      title: 'Foydalanuvchi sozlamalari',
                      icon: Users,
                      settings: [
                        { label: 'Yangi foydalanuvchilar', value: 'Ruxsat berilgan', type: 'toggle', enabled: true },
                        { label: 'Email tasdiqlash', value: 'Majburiy', type: 'toggle', enabled: true },
                        { label: 'Telefon tasdiqlash', value: 'Ixtiyoriy', type: 'toggle', enabled: false },
                        { label: 'Profil moderatsiya', value: 'Yoqilgan', type: 'toggle', enabled: true },
                      ]
                    },
                    {
                      title: 'Ish e\'lonlari sozlamalari',
                      icon: Briefcase,
                      settings: [
                        { label: 'Auto tasdiqlash', value: 'O\'chirilgan', type: 'toggle', enabled: false },
                        { label: 'E\'lon muddati', value: '30 kun', type: 'select' },
                        { label: 'Maksimal e\'lonlar', value: '10 ta', type: 'select' },
                        { label: 'Premium e\'lonlar', value: 'Yoqilgan', type: 'toggle', enabled: true },
                      ]
                    },
                    {
                      title: 'To\'lov sozlamalari',
                      icon: DollarSign,
                      settings: [
                        { label: 'Payme', value: 'Yoqilgan', type: 'toggle', enabled: true },
                        { label: 'Click', value: 'Yoqilgan', type: 'toggle', enabled: true },
                        { label: 'Uzcard', value: 'O\'chirilgan', type: 'toggle', enabled: false },
                        { label: 'Komisya', value: '5%', type: 'input' },
                      ]
                    },
                    {
                      title: 'Xavfsizlik',
                      icon: Shield,
                      settings: [
                        { label: '2FA', value: 'Adminlar uchun', type: 'toggle', enabled: true },
                        { label: 'IP bloklash', value: 'Yoqilgan', type: 'toggle', enabled: true },
                        { label: 'Spam himoya', value: 'Yoqilgan', type: 'toggle', enabled: true },
                        { label: 'Auto backup', value: 'Har kuni', type: 'select' },
                      ]
                    },
                  ].map((section, i) => (
                    <motion.div
                      key={section.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-white/80 dark:bg-secondary-900/80 backdrop-blur-xl rounded-3xl p-6 border border-secondary-200/50 dark:border-secondary-800/50 shadow-xl"
                    >
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg">
                          <section.icon className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-secondary-900 dark:text-white">{section.title}</h3>
                      </div>
                      <div className="space-y-4">
                        {section.settings.map((setting, j) => (
                          <motion.div
                            key={setting.label}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 + j * 0.02 }}
                            className="flex items-center justify-between py-3 border-b border-secondary-100 dark:border-secondary-800 last:border-0"
                          >
                            <div>
                              <p className="font-medium text-secondary-900 dark:text-white">{setting.label}</p>
                              <p className="text-sm text-secondary-500 dark:text-secondary-400">{setting.value}</p>
                            </div>
                            {setting.type === 'toggle' && (
                              <motion.button
                                whileTap={{ scale: 0.95 }}
                                className={`relative w-12 h-6 rounded-full transition-colors ${
                                  setting.enabled ? 'bg-primary-500' : 'bg-secondary-300 dark:bg-secondary-700'
                                }`}
                              >
                                <motion.div
                                  animate={{ x: setting.enabled ? 24 : 2 }}
                                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                  className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-md"
                                />
                              </motion.button>
                            )}
                            {setting.type === 'input' && (
                              <motion.button 
                                className="p-2 rounded-lg text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Edit className="w-4 h-4" />
                              </motion.button>
                            )}
                            {setting.type === 'select' && (
                              <motion.button 
                                className="px-3 py-1.5 rounded-lg text-sm font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                O'zgartirish
                              </motion.button>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Danger Zone */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-red-50/80 dark:bg-red-900/10 backdrop-blur-xl rounded-3xl p-6 border border-red-200/50 dark:border-red-800/50"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                    <h3 className="text-lg font-bold text-red-900 dark:text-red-300">Xavfli zona</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-red-900 dark:text-red-300">Ma'lumotlar bazasini tozalash</p>
                        <p className="text-sm text-red-700 dark:text-red-400">Barcha ma'lumotlar o'chiriladi</p>
                      </div>
                      <motion.button 
                        className="px-4 py-2 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Tozalash
                      </motion.button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-red-900 dark:text-red-300">Cache ni tozalash</p>
                        <p className="text-sm text-red-700 dark:text-red-400">Tizim cache o'chiriladi</p>
                      </div>
                      <motion.button 
                        className="px-4 py-2 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Tozalash
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        variant={confirmDialog.variant}
      />
    </div>
  );
}

export default AdminDashboard;
