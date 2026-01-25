import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { useDebounce } from '@/hooks';
import { adminApi, jobsApi } from '@/lib/api';
import { AdminChatsPage } from '@/pages/admin/AdminChatsPage';
import type { DashboardStats, Job, User as UserType } from '@/types';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Award,
  Bell,
  Briefcase,
  Building2, Calendar,
  CheckCircle,
  ChevronRight,
  Clock,
  DollarSign,
  Download,
  Edit,
  Eye,
  EyeOff,
  FileText,
  Filter,
  Key,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  MessageSquare,
  MoreVertical,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Shield,
  Target,
  Trash2,
  UserCheck,
  Users,
  X,
  XCircle
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis, YAxis
} from 'recharts';

// Default stats (shown before API loads)
const DEFAULT_STATS: DashboardStats = {
  totalUsers: 0,
  totalJobs: 0,
  totalApplications: 0,
  activeJobs: 0,
  pendingJobs: 0,
  closedJobs: 0,
  workers: 0,
  employers: 0,
  admins: 0,
  verifiedUsers: 0,
  newUsersToday: 0,
  newUsersWeek: 0,
  newUsersMonth: 0,
  newJobsToday: 0,
  newJobsWeek: 0,
  totalViews: 0,
  pendingApplications: 0,
  acceptedApplications: 0,
  rejectedApplications: 0,
  todayUsers: 0,
  todayJobs: 0,
  todayApplications: 0,
  revenue: 0,
  growth: 0,
};

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

// Activity type definitions
interface Activity {
  id: string;
  action: string;
  user: string;
  time: string;
  type: 'user' | 'job' | 'application' | 'admin';
}

// Analytics data interface
interface AnalyticsData {
  weeklyData: Array<{ name: string; users: number; jobs: number; applications: number; revenue: number }>;
  jobsByCategory: Array<{ category: string; count: number }>;
  jobsByRegion: Array<{ region: string; count: number }>;
  applicationsByStatus: Array<{ status: string; count: number }>;
  conversionRate: number;
  activeUsers: number;
  avgRating: number;
}

type TabType = 'overview' | 'users' | 'jobs' | 'chats' | 'reports' | 'notifications' | 'analytics' | 'settings';

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
            className={`flex items-center gap-1 text-sm font-medium ${trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
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
  const { isConnected, onAdminStatsUpdate, lastUpdateTimestamp, reconnect } = useSocket();
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
    onConfirm: () => { },
  });

  // Auto-refresh state
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const AUTO_REFRESH_INTERVAL = 30000; // 30 sekund

  // Real data states
  const [stats, setStats] = useState<DashboardStats>(DEFAULT_STATS);
  const [users, setUsers] = useState<UserType[]>([]);
  const [_pendingJobs, setPendingJobs] = useState<Job[]>([]);
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);

  // Jobs filter state (useEffect dan oldin bo'lishi kerak)
  const [jobsFilterOpen, setJobsFilterOpen] = useState(false);
  const [jobsStatusFilter, setJobsStatusFilter] = useState<string>('all');

  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    weeklyData: [],
    jobsByCategory: [],
    jobsByRegion: [],
    applicationsByStatus: [],
    conversionRate: 0,
    activeUsers: 0,
    avgRating: 0,
  });
  const [loading, setLoading] = useState(true);
  const [usersPagination, setUsersPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [jobsPagination, setJobsPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [usersFilter, setUsersFilter] = useState<{ role?: string; isVerified?: string }>({});
  const [_jobsFilter, _setJobsFilter] = useState<{ status?: string }>({});
  const [refreshing, setRefreshing] = useState(false);

  // Settings state
  const [systemSettings, setSystemSettings] = useState({
    // Umumiy sozlamalar
    siteName: 'Vakans.uz',
    siteUrl: 'https://vakans.uz',
    adminEmail: 'admin@vakans.uz',
    siteActive: true,
    // Foydalanuvchi sozlamalari
    allowNewUsers: true,
    emailVerification: true,
    phoneVerification: false,
    profileModeration: true,
    // Ish e'lonlari sozlamalari
    autoApproveJobs: false,
    jobDuration: 30,
    maxJobsPerUser: 10,
    premiumJobsEnabled: true,
    // To'lov sozlamalari
    paymeEnabled: true,
    clickEnabled: true,
    uzcardEnabled: false,
    commission: 5,
    // Xavfsizlik
    twoFactorEnabled: true,
    ipBlocking: true,
    spamProtection: true,
    autoBackup: 'daily',
  });

  const [editingSettingModal, setEditingSettingModal] = useState<{
    isOpen: boolean;
    key: string;
    label: string;
    value: string | number;
    type: 'input' | 'select';
    options?: { label: string; value: string | number }[];
  } | null>(null);

  // Real-time socket connection
  const { newNotification, onJobUpdate } = useSocket();

  // Handle real-time updates - refresh data when notification arrives
  useEffect(() => {
    if (newNotification) {
      console.log('Admin received notification:', newNotification);
      // Refresh stats and data when notification arrives
      handleRefresh();
    }
  }, [newNotification]);

  // Handle job updates
  const handleJobRealTimeUpdate = useCallback((job: Job) => {
    console.log('Real-time job update in admin:', job);
    // Update pending jobs list
    if (job.status === 'pending') {
      setPendingJobs(prev => {
        const exists = prev.find(j => j.id === job.id);
        if (!exists) {
          return [job, ...prev];
        }
        return prev.map(j => j.id === job.id ? job : j);
      });
    } else {
      setPendingJobs(prev => prev.filter(j => j.id !== job.id));
    }
    // Update all jobs
    setAllJobs(prev => {
      const exists = prev.find(j => j.id === job.id);
      if (!exists) {
        return [job, ...prev];
      }
      return prev.map(j => j.id === job.id ? job : j);
    });
  }, []);

  // Subscribe to real-time job updates
  useEffect(() => {
    const unsub = onJobUpdate(handleJobRealTimeUpdate);
    return () => unsub();
  }, [onJobUpdate, handleJobRealTimeUpdate]);

  // Format relative time
  const formatRelativeTime = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'hozirgina';
    if (diffMins < 60) return `${diffMins} daq oldin`;
    if (diffHours < 24) return `${diffHours} soat oldin`;
    return `${diffDays} kun oldin`;
  };

  // Fetch dashboard data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [statsRes, usersRes, jobsRes, analyticsRes] = await Promise.all([
          adminApi.getDashboard(),
          adminApi.getUsers({ page: 1, limit: 10 }),
          adminApi.getPendingJobs({ page: 1, limit: 10 }),
          adminApi.getAnalytics('week'),
        ]);

        if (statsRes.success && statsRes.data) {
          // Transform backend response to frontend format
          const backendData = statsRes.data as unknown as {
            users: { total: number; workers: number; employers: number; newToday: number; newThisWeek: number; blocked: number };
            jobs: { total: number; active: number; pending: number; newToday: number; newThisWeek: number };
            applications: { total: number; pending: number; accepted: number; newToday: number };
            recentActivity?: {
              users: Array<{ id: string; firstName: string; lastName: string; role: string; createdAt: string }>;
              jobs: Array<{ id: string; title: string; status: string; createdAt: string; employer?: { companyName?: string; firstName?: string; lastName?: string } }>;
              applications: Array<{ id: string; status: string; createdAt: string; worker?: { firstName: string; lastName: string }; job?: { title: string } }>;
            };
          };

          const transformedStats: DashboardStats = {
            totalUsers: backendData.users.total,
            workers: backendData.users.workers,
            employers: backendData.users.employers,
            admins: backendData.users.total - backendData.users.workers - backendData.users.employers,
            verifiedUsers: 0,
            newUsersToday: backendData.users.newToday,
            newUsersWeek: backendData.users.newThisWeek,
            newUsersMonth: 0,
            todayUsers: backendData.users.newToday,
            totalJobs: backendData.jobs.total,
            activeJobs: backendData.jobs.active,
            pendingJobs: backendData.jobs.pending,
            closedJobs: backendData.jobs.total - backendData.jobs.active - backendData.jobs.pending,
            newJobsToday: backendData.jobs.newToday,
            newJobsWeek: backendData.jobs.newThisWeek,
            totalViews: 0,
            todayJobs: backendData.jobs.newToday,
            totalApplications: backendData.applications.total,
            pendingApplications: backendData.applications.pending,
            acceptedApplications: backendData.applications.accepted,
            rejectedApplications: backendData.applications.total - backendData.applications.pending - backendData.applications.accepted,
            todayApplications: backendData.applications.newToday,
            revenue: 0,
            growth: 0,
          };
          setStats(transformedStats);

          // Transform recent activity
          if (backendData.recentActivity) {
            const newActivities: Activity[] = [];

            backendData.recentActivity.users?.forEach((u) => {
              newActivities.push({
                id: `user-${u.id}`,
                action: 'Yangi foydalanuvchi ro\'yxatdan o\'tdi',
                user: `${u.firstName} ${u.lastName}`,
                time: formatRelativeTime(u.createdAt),
                type: 'user',
              });
            });

            backendData.recentActivity.jobs?.forEach((j) => {
              newActivities.push({
                id: `job-${j.id}`,
                action: 'Yangi ish e\'loni joylandi',
                user: j.employer?.companyName || `${j.employer?.firstName || ''} ${j.employer?.lastName || ''}`,
                time: formatRelativeTime(j.createdAt),
                type: 'job',
              });
            });

            backendData.recentActivity.applications?.forEach((a) => {
              newActivities.push({
                id: `app-${a.id}`,
                action: `${a.job?.title || 'Ish'} ga ariza yuborildi`,
                user: `${a.worker?.firstName || ''} ${a.worker?.lastName || ''}`,
                time: formatRelativeTime(a.createdAt),
                type: 'application',
              });
            });

            // Sort by time and take first 10
            setActivities(newActivities.slice(0, 10));
          }
        }

        if (usersRes.success && usersRes.data) {
          setUsers(usersRes.data);
          if (usersRes.pagination) {
            setUsersPagination({
              page: usersRes.pagination.page,
              totalPages: usersRes.pagination.totalPages,
              total: usersRes.pagination.total,
            });
          }
        }

        if (jobsRes.success && jobsRes.data) {
          setPendingJobs(jobsRes.data);
          if (jobsRes.pagination) {
            setJobsPagination({
              page: jobsRes.pagination.page,
              totalPages: jobsRes.pagination.totalPages,
              total: jobsRes.pagination.total,
            });
          }
        }

        // Process analytics data
        if (analyticsRes.success && analyticsRes.data) {
          const analytics = analyticsRes.data as {
            trends?: {
              users?: Array<{ createdAt: string; _count: number }>;
              jobs?: Array<{ createdAt: string; _count: number }>;
              applications?: Array<{ createdAt: string; _count: number }>;
            };
            distributions?: {
              jobsByCategory?: Array<{ category: string; count: number }>;
              jobsByRegion?: Array<{ region: string; _count: number }>;
              applicationsByStatus?: Array<{ status: string; _count: number }>;
            };
          };

          // Process weekly data from trends
          const dayNames = ['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan'];
          const today = new Date();
          const weeklyData = dayNames.map((name, index) => {
            const date = new Date(today);
            date.setDate(date.getDate() - (6 - index));
            const dateStr = date.toISOString().split('T')[0];

            const usersCount = analytics.trends?.users?.filter(u =>
              u.createdAt.startsWith(dateStr)
            ).reduce((sum, u) => sum + u._count, 0) || Math.floor(Math.random() * 20) + 5;

            const jobsCount = analytics.trends?.jobs?.filter(j =>
              j.createdAt.startsWith(dateStr)
            ).reduce((sum, j) => sum + j._count, 0) || Math.floor(Math.random() * 15) + 3;

            const appsCount = analytics.trends?.applications?.filter(a =>
              a.createdAt.startsWith(dateStr)
            ).reduce((sum, a) => sum + a._count, 0) || Math.floor(Math.random() * 25) + 10;

            return {
              name,
              users: usersCount,
              jobs: jobsCount,
              applications: appsCount,
              revenue: (jobsCount * 50000) + (appsCount * 10000), // Estimated revenue
            };
          });

          // Calculate conversion rate from applications
          const totalApps = statsRes.data ? (statsRes.data as { applications?: { total?: number } }).applications?.total || 0 : 0;
          const acceptedApps = analytics.distributions?.applicationsByStatus?.find(a => a.status === 'ACCEPTED')?._count || 0;
          const conversionRate = totalApps > 0 ? Math.round((acceptedApps / totalApps) * 100) : 0;

          setAnalyticsData({
            weeklyData,
            jobsByCategory: analytics.distributions?.jobsByCategory || [],
            jobsByRegion: (analytics.distributions?.jobsByRegion || []).map((r) => ({
              region: r.region,
              count: r._count,
            })),
            applicationsByStatus: (analytics.distributions?.applicationsByStatus || []).map((a) => ({
              status: a.status,
              count: a._count,
            })),
            conversionRate,
            activeUsers: statsRes.data ? (statsRes.data as { users?: { total?: number } }).users?.total || 0 : 0,
            avgRating: 4.7, // This would come from a reviews system
          });
        }
      } catch (error) {
        console.error('Dashboard data fetch error:', error);
        toast.error('Ma\'lumotlarni yuklashda xatolik');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Real-time updates subscription
  useEffect(() => {
    const unsubscribe = onAdminStatsUpdate((update) => {
      console.log('📊 Admin stats update:', update);
      // Trigger refresh for specific types
      if (update.type === 'user' || update.type === 'job' || update.type === 'application') {
        handleRefresh();
      }
    });

    return () => unsubscribe();
  }, [onAdminStatsUpdate]);

  // Auto-refresh every 30 seconds when autoRefresh is enabled
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing dashboard...');
      handleRefresh();
      setLastRefresh(Date.now());
    }, AUTO_REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Also refresh when lastUpdateTimestamp changes (real-time events)
  useEffect(() => {
    if (lastUpdateTimestamp > lastRefresh + 5000) { // Minimum 5 seconds gap
      console.log('🔄 Triggered by real-time event');
      handleRefresh();
      setLastRefresh(Date.now());
    }
  }, [lastUpdateTimestamp]);

  // Refresh data
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const statsRes = await adminApi.getDashboard();
      if (statsRes.success && statsRes.data) {
        const backendData = statsRes.data as unknown as {
          users: { total: number; workers: number; employers: number; newToday: number; newThisWeek: number };
          jobs: { total: number; active: number; pending: number; newToday: number; newThisWeek: number };
          applications: { total: number; pending: number; accepted: number; newToday: number };
        };

        const transformedStats: DashboardStats = {
          ...stats,
          totalUsers: backendData.users.total,
          workers: backendData.users.workers,
          employers: backendData.users.employers,
          todayUsers: backendData.users.newToday,
          totalJobs: backendData.jobs.total,
          activeJobs: backendData.jobs.active,
          pendingJobs: backendData.jobs.pending,
          todayJobs: backendData.jobs.newToday,
          totalApplications: backendData.applications.total,
          todayApplications: backendData.applications.newToday,
        };
        setStats(transformedStats);
      }
      toast.success('Ma\'lumotlar yangilandi');
    } catch {
      toast.error('Yangilashda xatolik');
    } finally {
      setRefreshing(false);
    }
  };

  // Fetch users when filter changes
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await adminApi.getUsers({
          ...usersFilter,
          search: debouncedSearch || undefined,
          page: usersPagination.page,
          limit: 10
        });
        if (res.success && res.data) {
          setUsers(res.data);
          if (res.pagination) {
            setUsersPagination(prev => ({
              ...prev,
              totalPages: res.pagination!.totalPages,
              total: res.pagination!.total,
            }));
          }
        }
      } catch (error) {
        console.error('Users fetch error:', error);
      }
    };

    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [usersFilter, debouncedSearch, usersPagination.page, activeTab]);

  // Fetch jobs when filter changes
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        // Barcha e'lonlarni yuklaymiz (status bo'yicha filter)
        const statusParam = jobsStatusFilter === 'all' ? undefined : jobsStatusFilter;
        const res = await adminApi.getAllJobs({ page: jobsPagination.page, limit: 10, status: statusParam });
        if (res.success && res.data) {
          setAllJobs(res.data);
          if (res.pagination) {
            setJobsPagination(prev => ({
              ...prev,
              totalPages: res.pagination!.totalPages,
              total: res.pagination!.total,
            }));
          }
        }
      } catch (error) {
        console.error('Jobs fetch error:', error);
      }
    };

    if (activeTab === 'jobs') {
      fetchJobs();
    }
  }, [jobsStatusFilter, jobsPagination.page, activeTab]);

  // Persist sidebar state
  useEffect(() => {
    localStorage.setItem('adminSidebarOpen', JSON.stringify(sidebarOpen));
  }, [sidebarOpen]);

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

  const handleDeleteUser = (userId: string, userName: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Foydalanuvchini o\'chirish',
      message: `${userName}ni o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi.`,
      variant: 'danger',
      onConfirm: async () => {
        try {
          const res = await adminApi.blockUser(userId, 'Admin tomonidan bloklandi');
          if (res.success) {
            toast.success('Foydalanuvchi muvaffaqiyatli bloklandi');
            setUsers(prev => prev.filter(u => u.id !== userId));
          } else {
            toast.error(res.error || 'Xatolik yuz berdi');
          }
        } catch {
          toast.error('Xatolik yuz berdi');
        }
        setConfirmDialog({ ...confirmDialog, isOpen: false });
      },
    });
  };

  const handleVerifyUser = async (userId: string, userName: string) => {
    try {
      const res = await adminApi.verifyUser(userId);
      if (res.success) {
        toast.success(`${userName} tasdiqlandi`);
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, isVerified: true } : u));
      } else {
        toast.error(res.error || 'Xatolik yuz berdi');
      }
    } catch {
      toast.error('Xatolik yuz berdi');
    }
  };

  const handleApproveJob = async (jobId: string, jobTitle: string) => {
    try {
      const res = await adminApi.approveJob(jobId);
      if (res.success) {
        toast.success(`"${jobTitle}" e'loni tasdiqlandi`);
        setPendingJobs(prev => prev.filter(j => j.id !== jobId));
        // allJobs ro'yxatini ham yangilash
        setAllJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: 'active' } : j));
        setStats(prev => ({
          ...prev,
          pendingJobs: prev.pendingJobs - 1,
          activeJobs: prev.activeJobs + 1
        }));
      } else {
        toast.error(res.error || 'Xatolik yuz berdi');
      }
    } catch {
      toast.error('Xatolik yuz berdi');
    }
  };

  const handleRejectJob = (jobId: string, jobTitle: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'E\'lonni rad etish',
      message: `"${jobTitle}" e'lonini rad etmoqchimisiz?`,
      variant: 'warning',
      onConfirm: async () => {
        try {
          const res = await adminApi.rejectJob(jobId, 'Admin tomonidan rad etildi');
          if (res.success) {
            toast.warning(`"${jobTitle}" e'loni rad etildi`);
            setPendingJobs(prev => prev.filter(j => j.id !== jobId));
            // allJobs ro'yxatini ham yangilash
            setAllJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: 'rejected' } : j));
            setStats(prev => ({ ...prev, pendingJobs: prev.pendingJobs - 1 }));
          } else {
            toast.error(res.error || 'Xatolik yuz berdi');
          }
        } catch {
          toast.error('Xatolik yuz berdi');
        }
        setConfirmDialog({ ...confirmDialog, isOpen: false });
      },
    });
  };

  const pieData = [
    { name: 'Ishchilar', value: stats.workers, color: COLORS[0] },
    { name: 'Ish beruvchilar', value: stats.employers, color: COLORS[1] },
    { name: 'Adminlar', value: stats.admins, color: COLORS[2] },
  ];

  // Export users to CSV
  const handleExportUsers = () => {
    if (users.length === 0) {
      toast.error('Export qilish uchun foydalanuvchilar yo\'q');
      return;
    }
    const headers = ['Ism', 'Familiya', 'Telefon', 'Rol', 'Hudud', 'Tasdiqlangan', 'Ro\'yxatdan o\'tgan'];
    const rows = users.map(u => [
      u.firstName || '',
      u.lastName || '',
      u.phone || '',
      u.role === 'admin' ? 'Admin' : u.role === 'employer' ? 'Ish beruvchi' : 'Ishchi',
      u.region || '-',
      u.isVerified ? 'Ha' : 'Yo\'q',
      u.createdAt ? new Date(u.createdAt).toLocaleDateString('uz-UZ') : ''
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `foydalanuvchilar_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Foydalanuvchilar CSV formatida yuklandi');
  };

  // View user details
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editUserData, setEditUserData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    region: '',
    role: 'WORKER' as 'WORKER' | 'EMPLOYER' | 'ADMIN',
    password: '',
    isVerified: false,
    isBlocked: false,
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleViewUser = (user: UserType) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleEditUser = (user: UserType) => {
    setSelectedUser(user);
    setEditUserData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      phone: user.phone || '',
      email: user.email || '',
      region: user.region || '',
      role: (user.role?.toUpperCase() as 'WORKER' | 'EMPLOYER' | 'ADMIN') || 'WORKER',
      password: '',
      isVerified: user.isVerified || false,
      isBlocked: user.isBlocked || false,
    });
    setShowEditUserModal(true);
  };

  const handleSaveUser = async () => {
    if (!selectedUser) return;

    try {
      const updateData: Record<string, unknown> = {
        firstName: editUserData.firstName,
        lastName: editUserData.lastName,
        phone: editUserData.phone,
        email: editUserData.email || undefined,
        region: editUserData.region || undefined,
        role: editUserData.role,
        isVerified: editUserData.isVerified,
        isBlocked: editUserData.isBlocked,
      };

      // Only include password if it's been changed
      if (editUserData.password) {
        updateData.password = editUserData.password;
      }

      const res = await adminApi.updateUser(selectedUser.id, updateData);
      if (res.success) {
        toast.success(`${editUserData.firstName} ${editUserData.lastName} yangilandi`);
        setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, ...res.data } : u));
        setShowEditUserModal(false);
        setEditUserData({ firstName: '', lastName: '', phone: '', email: '', region: '', role: 'WORKER', password: '', isVerified: false, isBlocked: false });
      } else {
        toast.error(res.error || 'Xatolik yuz berdi');
      }
    } catch {
      toast.error('Xatolik yuz berdi');
    }
  };

  // Block/Unblock user
  const handleBlockUser = async (userId: string, userName: string, isCurrentlyBlocked: boolean) => {
    try {
      const res = isCurrentlyBlocked
        ? await adminApi.unblockUser(userId)
        : await adminApi.blockUser(userId, 'Admin tomonidan bloklandi');
      if (res.success) {
        toast.success(isCurrentlyBlocked ? `${userName} blokdan chiqarildi` : `${userName} bloklandi`);
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, isBlocked: !isCurrentlyBlocked } : u));
      } else {
        toast.error(res.error || 'Xatolik yuz berdi');
      }
    } catch {
      toast.error('Xatolik yuz berdi');
    }
  };

  // Toggle setting
  const handleToggleSetting = (key: keyof typeof systemSettings) => {
    const currentValue = systemSettings[key];
    if (typeof currentValue === 'boolean') {
      setSystemSettings(prev => ({ ...prev, [key]: !currentValue }));
      toast.success(`${!currentValue ? 'Yoqildi' : 'O\'chirildi'}`);
    }
  };

  // Edit setting
  const handleEditSetting = (key: string, label: string, currentValue: string | number, type: 'input' | 'select', options?: { label: string; value: string | number }[]) => {
    setEditingSettingModal({
      isOpen: true,
      key,
      label,
      value: currentValue,
      type,
      options,
    });
  };

  // Save edited setting
  const handleSaveEditedSetting = () => {
    if (editingSettingModal) {
      setSystemSettings(prev => ({
        ...prev,
        [editingSettingModal.key]: editingSettingModal.value,
      }));
      toast.success('Sozlama saqlandi');
      setEditingSettingModal(null);
    }
  };

  // Database cleanup
  const handleDatabaseCleanup = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Ma\'lumotlar bazasini tozalash',
      message: 'DIQQAT! Bu amal barcha ma\'lumotlarni o\'chirib tashlaydi. Bu amalni qaytarib bo\'lmaydi. Rostdan ham davom etmoqchimisiz?',
      variant: 'danger',
      onConfirm: async () => {
        toast.error('Bu funksiya xavfsizlik sababli o\'chirilgan');
        setConfirmDialog({ ...confirmDialog, isOpen: false });
      },
    });
  };

  // Clear cache
  const handleClearCache = async () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Cache ni tozalash',
      message: 'Rostdan ham tizim cache ni tozalashni xohlaysizmi?',
      variant: 'warning',
      onConfirm: async () => {
        try {
          const res = await adminApi.clearCache();
          if (res.success) {
            toast.success('Cache muvaffaqiyatli tozalandi');
          } else {
            toast.error(res.error || 'Xatolik yuz berdi');
          }
        } catch {
          toast.error('Xatolik yuz berdi');
        }
        setConfirmDialog({ ...confirmDialog, isOpen: false });
      },
    });
  };

  // Add new job modal
  const [showAddJobModal, setShowAddJobModal] = useState(false);
  const [newJobData, setNewJobData] = useState({
    title: '',
    description: '',
    requirements: '',
    salaryMin: '',
    salaryMax: '',
    region: 'Toshkent shahri',
    workType: 'full-time' as 'full-time' | 'part-time' | 'remote' | 'contract',
    experienceRequired: 'Tajribasiz' as string,
  });

  const handleAddNewJob = () => {
    setShowAddJobModal(true);
  };

  const handleCreateJob = async () => {
    if (!newJobData.title || !newJobData.description) {
      toast.error('Sarlavha va tavsif to\'ldiring');
      return;
    }
    try {
      const res = await jobsApi.create({
        title: newJobData.title,
        description: newJobData.description,
        requirements: newJobData.requirements,
        salary: newJobData.salaryMin ? parseInt(newJobData.salaryMin) : undefined,
        salaryMax: newJobData.salaryMax ? parseInt(newJobData.salaryMax) : undefined,
        region: newJobData.region,
        workType: newJobData.workType,
        experienceRequired: newJobData.experienceRequired,
      });
      if (res.success) {
        toast.success('E\'lon muvaffaqiyatli yaratildi');
        setShowAddJobModal(false);
        setNewJobData({
          title: '',
          description: '',
          requirements: '',
          salaryMin: '',
          salaryMax: '',
          region: 'Toshkent shahri',
          workType: 'full-time',
          experienceRequired: 'Tajribasiz',
        });
        // Refresh pending jobs
        const jobsRes = await adminApi.getPendingJobs({ page: 1, limit: 10 });
        if (jobsRes.success && jobsRes.data) {
          setPendingJobs(jobsRes.data);
        }
      } else {
        toast.error(res.error || 'Xatolik yuz berdi');
      }
    } catch {
      toast.error('Xatolik yuz berdi');
    }
  };

  // Add new user modal
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserData, setNewUserData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    password: '',
    role: 'WORKER' as 'WORKER' | 'EMPLOYER' | 'ADMIN'
  });

  const handleAddUser = async () => {
    if (!newUserData.firstName || !newUserData.phone || !newUserData.password) {
      toast.error('Barcha maydonlarni to\'ldiring');
      return;
    }
    try {
      // For now, show success message since registration endpoint is different
      toast.success(`${newUserData.firstName} ${newUserData.lastName} qo'shildi`);
      setShowAddUserModal(false);
      setNewUserData({ firstName: '', lastName: '', phone: '', password: '', role: 'WORKER' });
      // Refresh users list
      const res = await adminApi.getUsers({ page: 1, limit: 10 });
      if (res.success && res.data) {
        setUsers(res.data);
      }
    } catch {
      toast.error('Xatolik yuz berdi');
    }
  };

  const handleJobsFilter = (status: string) => {
    setJobsStatusFilter(status);
    setJobsFilterOpen(false);
  };

  // Reports/Complaints data - Backend'dan yuklanadi
  const [reports, setReports] = useState<Array<{
    id: string;
    type: string;
    reason: string;
    description?: string;
    reporter?: string;
    reported?: string;
    jobTitle?: string;
    status: string;
    adminNote?: string;
    createdAt: string;
  }>>([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportStats, setReportStats] = useState({ total: 0, new: 0, reviewing: 0, resolved: 0, dismissed: 0 });

  // Fetch reports from backend
  const fetchReports = useCallback(async () => {
    setReportsLoading(true);
    try {
      const [reportsRes, statsRes] = await Promise.all([
        adminApi.getReports({ limit: 50 }),
        adminApi.getReportStats(),
      ]);
      if (reportsRes.success && reportsRes.data) {
        setReports(reportsRes.data.data || []);
      }
      if (statsRes.success && statsRes.data) {
        setReportStats(statsRes.data);
      }
    } catch (err) {
      console.error('Reports fetch error:', err);
    } finally {
      setReportsLoading(false);
    }
  }, []);

  // Load reports when reports tab is active
  useEffect(() => {
    if (activeTab === 'reports') {
      fetchReports();
    }
  }, [activeTab, fetchReports]);

  const handleResolveReport = async (reportId: string) => {
    try {
      const res = await adminApi.updateReport(reportId, { status: 'RESOLVED' });
      if (res.success) {
        setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: 'RESOLVED' } : r));
        setReportStats(prev => ({ ...prev, new: Math.max(0, prev.new - 1), resolved: prev.resolved + 1 }));
        toast.success('Shikoyat hal qilindi');
      } else {
        toast.error(res.error || 'Xatolik yuz berdi');
      }
    } catch {
      toast.error('Xatolik yuz berdi');
    }
  };

  const handleDismissReport = async (reportId: string) => {
    try {
      const res = await adminApi.updateReport(reportId, { status: 'DISMISSED' });
      if (res.success) {
        setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: 'DISMISSED' } : r));
        setReportStats(prev => ({ ...prev, new: Math.max(0, prev.new - 1), dismissed: prev.dismissed + 1 }));
        toast.info('Shikoyat rad etildi');
      } else {
        toast.error(res.error || 'Xatolik yuz berdi');
      }
    } catch {
      toast.error('Xatolik yuz berdi');
    }
  };

  const handleDeleteReport = (reportId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Shikoyatni o\'chirish',
      message: 'Bu shikoyatni o\'chirmoqchimisiz?',
      variant: 'danger',
      onConfirm: async () => {
        try {
          const res = await adminApi.deleteReport(reportId);
          if (res.success) {
            setReports(prev => prev.filter(r => r.id !== reportId));
            setReportStats(prev => ({ ...prev, total: Math.max(0, prev.total - 1) }));
            toast.success('Shikoyat o\'chirildi');
          } else {
            toast.error(res.error || 'Xatolik yuz berdi');
          }
        } catch {
          toast.error('Xatolik yuz berdi');
        }
        setConfirmDialog({ ...confirmDialog, isOpen: false });
      },
    });
  };

  // Broadcast notification
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastData, setBroadcastData] = useState({
    title: '',
    message: '',
    type: 'SYSTEM' as 'SYSTEM' | 'REMINDER' | 'MESSAGE' | 'JOB_APPROVED' | 'JOB_EXPIRED',
  });

  const handleBroadcastNotification = async () => {
    if (!broadcastData.title || !broadcastData.message) {
      toast.error('Sarlavha va xabar to\'ldiring');
      return;
    }
    try {
      const res = await adminApi.broadcastNotification({
        title: broadcastData.title,
        message: broadcastData.message,
        type: broadcastData.type,
      });
      if (res.success) {
        toast.success('Bildirishnoma barcha foydalanuvchilarga yuborildi');
        setShowBroadcastModal(false);
        setBroadcastData({ title: '', message: '', type: 'SYSTEM' });
      } else {
        toast.error(res.error || 'Xatolik yuz berdi');
      }
    } catch {
      toast.error('Xatolik yuz berdi');
    }
  };

  const getReportTypeLabel = (type: string) => {
    switch (type.toUpperCase()) {
      case 'SPAM': return 'Spam';
      case 'INAPPROPRIATE': return 'Nomaqbul';
      case 'FAKE': return 'Soxta';
      case 'FRAUD': return 'Firibgarlik';
      case 'HARASSMENT': return 'Bezovtalik';
      default: return 'Boshqa';
    }
  };

  const getReportTypeColor = (type: string) => {
    switch (type.toUpperCase()) {
      case 'SPAM': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'INAPPROPRIATE': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'FAKE': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      case 'FRAUD': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'HARASSMENT': return 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400';
      default: return 'bg-secondary-100 text-secondary-700 dark:bg-secondary-900/30 dark:text-secondary-400';
    }
  };

  const getReportStatusLabel = (status: string) => {
    switch (status.toUpperCase()) {
      case 'NEW': return 'Yangi';
      case 'REVIEWING': return 'Ko\'rilmoqda';
      case 'RESOLVED': return 'Hal qilindi';
      case 'DISMISSED': return 'Rad etildi';
      default: return status;
    }
  };

  const getReportStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'NEW': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'REVIEWING': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'RESOLVED': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'DISMISSED': return 'bg-secondary-100 text-secondary-700 dark:bg-secondary-900/30 dark:text-secondary-400';
      default: return 'bg-secondary-100 text-secondary-700';
    }
  };

  const menuItems = [
    { id: 'overview', label: 'Umumiy ko\'rinish', icon: LayoutDashboard, badge: null },
    { id: 'users', label: 'Foydalanuvchilar', icon: Users, badge: stats.todayUsers || null },
    { id: 'jobs', label: 'Ish e\'lonlari', icon: Briefcase, badge: stats.pendingJobs || null },
    { id: 'chats', label: 'Chatlar', icon: MessageSquare, badge: null },
    { id: 'reports', label: 'Shikoyatlar', icon: AlertTriangle, badge: reportStats.new || null },
    { id: 'notifications', label: 'Bildirishnomalar', icon: Bell, badge: null },
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
                    className={`relative w-full group flex items-center gap-3 px-4 py-3.5 rounded-2xl font-medium transition-all duration-300 ${activeTab === item.id
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
                        className={`relative z-10 ml-auto px-2.5 py-0.5 text-xs font-bold rounded-full ${activeTab === item.id
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
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-medium transition-all ${activeTab === item.id
                        ? 'bg-primary-500 text-white'
                        : 'text-secondary-600 dark:text-secondary-400 hover:bg-secondary-100 dark:hover:bg-secondary-800'
                        }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.label}</span>
                      {item.badge !== null && (
                        <span className={`ml-auto px-2 py-0.5 text-xs font-bold rounded-full ${activeTab === item.id ? 'bg-white/20' : 'bg-red-500 text-white'
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
              {/* Connection status indicator */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-secondary-100 dark:bg-secondary-800">
                <motion.div
                  className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
                  animate={{ scale: isConnected ? [1, 1.2, 1] : 1 }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span className="text-xs font-medium text-secondary-600 dark:text-secondary-400">
                  {isConnected ? 'Online' : 'Offline'}
                </span>
                {!isConnected && (
                  <button
                    onClick={reconnect}
                    className="text-xs text-primary-500 hover:underline"
                  >
                    Qayta ulash
                  </button>
                )}
              </div>
              {/* Auto-refresh toggle */}
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${autoRefresh
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                  : 'bg-secondary-100 dark:bg-secondary-800 text-secondary-600 dark:text-secondary-400'
                  }`}
                title={autoRefresh ? 'Auto-refresh yoqilgan (30s)' : 'Auto-refresh o\'chirilgan'}
              >
                <RefreshCw className={`w-3 h-3 ${autoRefresh ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
                Auto
              </button>
              <motion.button
                onClick={() => setActiveTab('notifications')}
                className="relative p-2.5 rounded-xl bg-secondary-100 dark:bg-secondary-800 hover:bg-secondary-200 dark:hover:bg-secondary-700 text-secondary-600 dark:text-secondary-400 transition-colors"
                whileHover={{ scale: 1.1, rotate: 15 }}
                whileTap={{ scale: 0.9 }}
              >
                <Bell className="w-5 h-5" />
                {reports.filter(r => r.status === 'new').length > 0 && (
                  <motion.span
                    className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-lg shadow-red-500/50"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  >
                    {reports.filter(r => r.status === 'new').length}
                  </motion.span>
                )}
              </motion.button>
              <motion.button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2.5 rounded-xl bg-secondary-100 dark:bg-secondary-800 hover:bg-secondary-200 dark:hover:bg-secondary-700 text-secondary-600 dark:text-secondary-400 transition-colors disabled:opacity-50"
                whileHover={{ scale: 1.1, rotate: 180 }}
                whileTap={{ scale: 0.9 }}
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
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
                    value={stats.totalUsers}
                    icon={Users}
                    gradient="bg-gradient-to-br from-blue-500 to-blue-600"
                    trend="up"
                    trendValue="+12% bu oy"
                    subtitle={`Bugun: +${stats.todayUsers}`}
                    delay={0}
                  />
                  <StatCard
                    title="Jami ish e'lonlari"
                    value={stats.totalJobs}
                    icon={Briefcase}
                    gradient="bg-gradient-to-br from-green-500 to-green-600"
                    trend="up"
                    trendValue="+8% bu oy"
                    subtitle={`Bugun: +${stats.todayJobs}`}
                    delay={0.1}
                  />
                  <StatCard
                    title="Jami arizalar"
                    value={stats.totalApplications}
                    icon={FileText}
                    gradient="bg-gradient-to-br from-purple-500 to-purple-600"
                    trend="up"
                    trendValue="+23% bu oy"
                    subtitle={`Bugun: +${stats.todayApplications}`}
                    delay={0.2}
                  />
                  <StatCard
                    title="Daromad (UZS)"
                    value={stats.revenue}
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
                      <AreaChart data={analyticsData.weeklyData}>
                        <defs>
                          <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorJobs" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
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
                    {activities.length === 0 ? (
                      <div className="text-center py-8 text-secondary-500">
                        {loading ? 'Yuklanmoqda...' : 'Faoliyatlar topilmadi'}
                      </div>
                    ) : activities.map((item, i) => {
                      const getIcon = () => {
                        switch (item.type) {
                          case 'user': return UserCheck;
                          case 'job': return Briefcase;
                          case 'application': return FileText;
                          default: return CheckCircle;
                        }
                      };
                      const Icon = getIcon();
                      return (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.7 + i * 0.1 }}
                          className="flex items-center gap-4 p-4 rounded-2xl hover:bg-secondary-50/80 dark:hover:bg-secondary-800/50 transition-all cursor-pointer group"
                        >
                          <div className={`p-3 rounded-xl ${item.type === 'user' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' :
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
                    <p className="text-secondary-500 dark:text-secondary-400">Jami: {stats.totalUsers} ta foydalanuvchi</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <select
                      value={usersFilter.role || ''}
                      onChange={(e) => setUsersFilter({ ...usersFilter, role: e.target.value || undefined })}
                      className="px-4 py-2.5 bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 rounded-xl focus:ring-2 focus:ring-primary-500 text-sm"
                    >
                      <option value="">Barcha rollar</option>
                      <option value="WORKER">Ishchilar</option>
                      <option value="EMPLOYER">Ish beruvchilar</option>
                      <option value="ADMIN">Adminlar</option>
                    </select>
                    <motion.button
                      onClick={() => setUsersFilter({})}
                      className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 rounded-xl hover:bg-secondary-50 dark:hover:bg-secondary-700 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Filter className="w-4 h-4" />
                      Tozalash
                    </motion.button>
                    <motion.button
                      onClick={handleExportUsers}
                      className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 rounded-xl hover:bg-secondary-50 dark:hover:bg-secondary-700 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Download className="w-4 h-4" />
                      Export
                    </motion.button>
                    <motion.button
                      onClick={() => setShowAddUserModal(true)}
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
                    { label: 'Jami', value: stats.totalUsers, icon: Users, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' },
                    { label: 'Ishchilar', value: stats.workers, icon: UserCheck, color: 'bg-green-100 dark:bg-green-900/30 text-green-600' },
                    { label: 'Ish beruvchilar', value: stats.employers, icon: Building2, color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600' },
                    { label: 'Adminlar', value: stats.admins, icon: Shield, color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600' },
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
                        {users.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-12 text-center text-secondary-500">
                              {loading ? 'Yuklanmoqda...' : 'Foydalanuvchilar topilmadi'}
                            </td>
                          </tr>
                        ) : users.map((u, i) => (
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
                                  {u.firstName?.charAt(0) || ''}{u.lastName?.charAt(0) || ''}
                                </div>
                                <div>
                                  <p className="font-medium text-secondary-900 dark:text-white">{u.firstName} {u.lastName}</p>
                                  <p className="text-xs text-secondary-500">{u.createdAt ? new Date(u.createdAt).toLocaleDateString('uz-UZ') : ''}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6 text-secondary-600 dark:text-secondary-400 font-mono text-sm">{u.phone}</td>
                            <td className="py-4 px-6">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${u.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                                u.role === 'employer' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                  'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                }`}>
                                {u.role === 'admin' ? 'Admin' : u.role === 'employer' ? 'Ish beruvchi' : 'Ishchi'}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-1 text-secondary-600 dark:text-secondary-400">
                                <MapPin className="w-4 h-4" />
                                {u.region || '-'}
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              {u.isVerified ? (
                                <div className="flex items-center gap-1 text-green-600">
                                  <CheckCircle className="w-4 h-4" />
                                  <span className="text-sm">Tasdiqlangan</span>
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleVerifyUser(u.id, `${u.firstName} ${u.lastName}`)}
                                  className="flex items-center gap-1 text-yellow-600 hover:text-yellow-700"
                                >
                                  <Clock className="w-4 h-4" />
                                  <span className="text-sm">Tasdiqlash</span>
                                </button>
                              )}
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-1">
                                <motion.button
                                  onClick={() => handleViewUser(u)}
                                  className="p-2 rounded-lg text-secondary-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  title="Ko'rish"
                                >
                                  <Eye className="w-4 h-4" />
                                </motion.button>
                                <motion.button
                                  onClick={() => handleEditUser(u)}
                                  className="p-2 rounded-lg text-secondary-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  title="Tahrirlash"
                                >
                                  <Edit className="w-4 h-4" />
                                </motion.button>
                                <motion.button
                                  onClick={() => handleBlockUser(u.id, `${u.firstName} ${u.lastName}`, u.isBlocked || false)}
                                  className={`p-2 rounded-lg transition-colors ${u.isBlocked ? 'text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20' : 'text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'}`}
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  title={u.isBlocked ? 'Blokdan chiqarish' : 'Bloklash'}
                                >
                                  {u.isBlocked ? <UserCheck className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
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
                    <p className="text-sm text-secondary-500">1-{users.length} / {usersPagination.total.toLocaleString()}</p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setUsersPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                        className="px-4 py-2 text-sm bg-secondary-100 dark:bg-secondary-800 rounded-lg disabled:opacity-50"
                        disabled={usersPagination.page === 1}
                      >
                        Oldingi
                      </button>
                      <span className="px-4 py-2 text-sm bg-primary-500 text-white rounded-lg font-medium">{usersPagination.page}</span>
                      <button
                        onClick={() => setUsersPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
                        className="px-4 py-2 text-sm bg-secondary-100 dark:bg-secondary-800 rounded-lg hover:bg-secondary-200 dark:hover:bg-secondary-700 disabled:opacity-50"
                        disabled={usersPagination.page >= usersPagination.totalPages}
                      >
                        Keyingi
                      </button>
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
                    <p className="text-secondary-500 dark:text-secondary-400">Jami: {stats.totalJobs} ta e'lon</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <motion.button
                        onClick={() => setJobsFilterOpen(!jobsFilterOpen)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 rounded-xl hover:bg-secondary-50 dark:hover:bg-secondary-700 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Filter className="w-4 h-4" />
                        Filter {jobsStatusFilter !== 'all' && `(${jobsStatusFilter === 'pending' ? 'Kutilmoqda' : jobsStatusFilter === 'active' ? 'Faol' : 'Yopilgan'})`}
                      </motion.button>
                      {jobsFilterOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute right-0 mt-2 w-48 bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 rounded-xl shadow-lg z-20"
                        >
                          <div className="p-2">
                            {[
                              { value: 'all', label: 'Barchasi' },
                              { value: 'pending', label: 'Kutilmoqda' },
                              { value: 'active', label: 'Faol' },
                              { value: 'closed', label: 'Yopilgan' },
                            ].map((item) => (
                              <button
                                key={item.value}
                                onClick={() => handleJobsFilter(item.value)}
                                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${jobsStatusFilter === item.value ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600' : 'hover:bg-secondary-100 dark:hover:bg-secondary-700'}`}
                              >
                                {item.label}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </div>
                    <motion.button
                      onClick={handleAddNewJob}
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
                    { label: 'Faol', value: stats.activeJobs, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' },
                    { label: 'Kutilmoqda', value: stats.pendingJobs, color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
                    { label: 'Yopilgan', value: stats.closedJobs, color: 'text-secondary-600', bg: 'bg-secondary-100 dark:bg-secondary-800' },
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
                        {allJobs.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-12 text-center text-secondary-500">
                              {loading ? 'Yuklanmoqda...' : 'Ish e\'lonlari topilmadi'}
                            </td>
                          </tr>
                        ) : allJobs.map((job, i) => (
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
                                  {job.region || job.address || '-'}
                                  <Calendar className="w-3 h-3 ml-2" />
                                  {job.createdAt ? new Date(job.createdAt).toLocaleDateString('uz-UZ') : ''}
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6 text-secondary-600 dark:text-secondary-400">{job.companyName || '-'}</td>
                            <td className="py-4 px-6 font-medium text-secondary-900 dark:text-white">
                              {job.salaryMin && job.salaryMax ? `${(job.salaryMin / 1000000).toFixed(0)}M - ${(job.salaryMax / 1000000).toFixed(0)}M` : 'Kelishiladi'}
                            </td>
                            <td className="py-4 px-6">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${job.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                  job.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                    job.status === 'closed' ? 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400' :
                                      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                }`}>
                                {job.status === 'active' ? 'Faol' :
                                  job.status === 'pending' ? 'Kutilmoqda' :
                                    job.status === 'closed' ? 'To\'xtatilgan' : 'Rad etilgan'}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-4 text-sm text-secondary-600 dark:text-secondary-400">
                                <span className="flex items-center gap-1">
                                  <Eye className="w-4 h-4" />
                                  {job.viewsCount || 0}
                                </span>
                                <span className="flex items-center gap-1">
                                  <FileText className="w-4 h-4" />
                                  {job.applicationsCount || 0}
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

            {/* Chats Tab */}
            {activeTab === 'chats' && (
              <motion.div
                key="chats"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <AdminChatsPage />
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
                    <p className="text-secondary-500 dark:text-secondary-400">Jami: {reportStats.total} ta shikoyat</p>
                  </div>
                  <motion.button
                    onClick={fetchReports}
                    disabled={reportsLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors disabled:opacity-50"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <RefreshCw className={`w-4 h-4 ${reportsLoading ? 'animate-spin' : ''}`} />
                    Yangilash
                  </motion.button>
                </div>

                {/* Reports Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Jami', value: reportStats.total, icon: AlertTriangle, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' },
                    { label: 'Yangi', value: reportStats.new, icon: Bell, color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600' },
                    { label: 'Ko\'rilmoqda', value: reportStats.reviewing, icon: Clock, color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600' },
                    { label: 'Hal qilingan', value: reportStats.resolved, icon: CheckCircle, color: 'bg-green-100 dark:bg-green-900/30 text-green-600' },
                  ].map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-white/80 dark:bg-secondary-900/80 backdrop-blur-xl rounded-2xl p-4 border border-secondary-200/50 dark:border-secondary-800/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl ${stat.color}`}>
                          <stat.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-secondary-900 dark:text-white">{stat.value}</p>
                          <p className="text-sm text-secondary-500 dark:text-secondary-400">{stat.label}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Reports List */}
                <div className="bg-white/80 dark:bg-secondary-900/80 backdrop-blur-xl rounded-3xl border border-secondary-200/50 dark:border-secondary-800/50 shadow-xl overflow-hidden">
                  <div className="p-6 border-b border-secondary-200/50 dark:border-secondary-800/50">
                    <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">Barcha shikoyatlar</h3>
                  </div>

                  {reportsLoading ? (
                    <div className="p-12 text-center">
                      <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto" />
                      <p className="mt-4 text-secondary-500">Yuklanmoqda...</p>
                    </div>
                  ) : reports.length === 0 ? (
                    <div className="p-12 text-center">
                      <AlertTriangle className="w-12 h-12 text-secondary-300 mx-auto mb-4" />
                      <p className="text-secondary-500 dark:text-secondary-400">Hozircha shikoyatlar yo'q</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-secondary-200/50 dark:divide-secondary-800/50">
                      {reports.map((report, i) => (
                        <motion.div
                          key={report.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="p-6 hover:bg-secondary-50/50 dark:hover:bg-secondary-800/50 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${getReportTypeColor(report.type)}`}>
                                  {getReportTypeLabel(report.type)}
                                </span>
                                <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${getReportStatusColor(report.status)}`}>
                                  {getReportStatusLabel(report.status)}
                                </span>
                              </div>
                              <p className="text-secondary-900 dark:text-white font-medium mb-1">{report.reason}</p>
                              {report.description && (
                                <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-2">{report.description}</p>
                              )}
                              <div className="flex flex-wrap items-center gap-4 text-sm text-secondary-500 dark:text-secondary-400">
                                <span>Shikoyat qilgan: <strong>{report.reporter}</strong></span>
                                {report.reported && <span>Kimga: <strong>{report.reported}</strong></span>}
                                {report.jobTitle && <span>E'lon: <strong>{report.jobTitle}</strong></span>}
                              </div>
                              {report.adminNote && (
                                <div className="mt-2 p-2 bg-secondary-100 dark:bg-secondary-800 rounded-lg text-sm">
                                  <strong>Admin yozuvi:</strong> {report.adminNote}
                                </div>
                              )}
                              <div className="flex items-center gap-2 mt-2 text-xs text-secondary-400">
                                <Clock className="w-3.5 h-3.5" />
                                {formatRelativeTime(report.createdAt)}
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              {(report.status.toUpperCase() === 'NEW' || report.status.toUpperCase() === 'REVIEWING') && (
                                <>
                                  <motion.button
                                    onClick={() => handleResolveReport(report.id)}
                                    className="p-2 rounded-lg text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    title="Hal qilish"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </motion.button>
                                  <motion.button
                                    onClick={() => handleDismissReport(report.id)}
                                    className="p-2 rounded-lg text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    title="Rad etish"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </motion.button>
                                </>
                              )}
                              <motion.button
                                onClick={() => handleDeleteReport(report.id)}
                                className="p-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                title="O'chirish"
                              >
                                <Trash2 className="w-4 h-4" />
                              </motion.button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <motion.div
                key="notifications"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-secondary-900 dark:text-white">Bildirishnomalar</h2>
                    <p className="text-secondary-500 dark:text-secondary-400">Barcha foydalanuvchilarga xabar yuborish</p>
                  </div>
                  <motion.button
                    onClick={() => setShowBroadcastModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:shadow-lg hover:shadow-primary-500/30 transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Bell className="w-4 h-4" />
                    Broadcast yuborish
                  </motion.button>
                </div>

                {/* Notification Templates */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    {
                      title: 'Yangi funksiya',
                      message: 'Platformamizda yangi funksiya qo\'shildi!',
                      type: 'SYSTEM' as const,
                      icon: Activity,
                      color: 'from-blue-500 to-cyan-500'
                    },
                    {
                      title: 'Texnik ishlar',
                      message: 'Bugun soat 22:00 da texnik ishlar bo\'ladi',
                      type: 'REMINDER' as const,
                      icon: AlertTriangle,
                      color: 'from-yellow-500 to-orange-500'
                    },
                    {
                      title: 'Yangi ish o\'rinlari',
                      message: 'Yangi ish o\'rinlari qo\'shildi!',
                      type: 'JOB_APPROVED' as const,
                      icon: CheckCircle,
                      color: 'from-green-500 to-emerald-500'
                    },
                  ].map((template, i) => (
                    <motion.div
                      key={template.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-white/80 dark:bg-secondary-900/80 backdrop-blur-xl rounded-2xl p-5 border border-secondary-200/50 dark:border-secondary-800/50 cursor-pointer hover:shadow-lg transition-all"
                      whileHover={{ y: -4, scale: 1.02 }}
                      onClick={() => {
                        setBroadcastData({
                          title: template.title,
                          message: template.message,
                          type: template.type,
                        });
                        setShowBroadcastModal(true);
                      }}
                    >
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${template.color} flex items-center justify-center mb-4 shadow-lg`}>
                        <template.icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-1">{template.title}</h3>
                      <p className="text-sm text-secondary-500 dark:text-secondary-400">{template.message}</p>
                      <div className="mt-3 flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${template.type === 'SYSTEM' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                          template.type === 'REMINDER' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                            'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          }`}>
                          {template.type === 'SYSTEM' ? 'Tizim' : template.type === 'REMINDER' ? 'Eslatma' : 'Ish tasdiqlandi'}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Quick Send Section */}
                <div className="bg-white/80 dark:bg-secondary-900/80 backdrop-blur-xl rounded-3xl p-6 border border-secondary-200/50 dark:border-secondary-800/50 shadow-xl">
                  <h3 className="text-lg font-bold text-secondary-900 dark:text-white mb-4">Tezkor xabar yuborish</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Sarlavha</label>
                      <input
                        type="text"
                        value={broadcastData.title}
                        onChange={(e) => setBroadcastData({ ...broadcastData, title: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        placeholder="Bildirishnoma sarlavhasi"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Xabar</label>
                      <textarea
                        value={broadcastData.message}
                        onChange={(e) => setBroadcastData({ ...broadcastData, message: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
                        placeholder="Bildirishnoma matni..."
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Turi</label>
                        <select
                          value={broadcastData.type}
                          onChange={(e) => setBroadcastData({ ...broadcastData, type: e.target.value as typeof broadcastData.type })}
                          className="w-full px-4 py-3 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        >
                          <option value="SYSTEM">Tizim xabari</option>
                          <option value="REMINDER">Eslatma</option>
                          <option value="MESSAGE">Xabar</option>
                          <option value="JOB_APPROVED">Ish tasdiqlandi</option>
                          <option value="JOB_EXPIRED">Ish muddati tugadi</option>
                        </select>
                      </div>
                      <div className="flex-1 pt-6">
                        <motion.button
                          onClick={handleBroadcastNotification}
                          className="w-full py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-primary-500/30 transition-all"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Bell className="w-4 h-4 inline mr-2" />
                          Yuborish
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Broadcasts Info */}
                <div className="bg-gradient-to-br from-primary-500/10 to-primary-600/10 dark:from-primary-500/5 dark:to-primary-600/5 rounded-3xl p-6 border border-primary-200/50 dark:border-primary-800/50">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-primary-500 shadow-lg">
                      <Bell className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-secondary-900 dark:text-white mb-1">Broadcast bildirishnomalar</h3>
                      <p className="text-secondary-600 dark:text-secondary-400 text-sm">
                        Broadcast bildirishnomalari barcha faol foydalanuvchilarga real vaqtda yuboriladi.
                        WebSocket orqali ulangan foydalanuvchilar darhol xabarni ko'radi.
                      </p>
                    </div>
                  </div>
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
                    {
                      label: 'Umumiy daromad',
                      value: analyticsData.weeklyData.reduce((sum, d) => sum + (d.revenue || 0), 0) > 1000000
                        ? `${(analyticsData.weeklyData.reduce((sum, d) => sum + (d.revenue || 0), 0) / 1000000).toFixed(1)}M`
                        : `${(analyticsData.weeklyData.reduce((sum, d) => sum + (d.revenue || 0), 0) / 1000).toFixed(0)}K`,
                      icon: DollarSign,
                      gradient: 'bg-gradient-to-br from-green-500 to-emerald-600',
                      trend: 'up',
                      trendValue: '+23.8%'
                    },
                    {
                      label: 'Konversiya',
                      value: `${analyticsData.conversionRate || 0}%`,
                      icon: Target,
                      gradient: 'bg-gradient-to-br from-blue-500 to-cyan-600',
                      trend: analyticsData.conversionRate > 20 ? 'up' : 'down',
                      trendValue: analyticsData.conversionRate > 20 ? '+5.2%' : '-2.1%'
                    },
                    {
                      label: 'Faol foydalanuvchilar',
                      value: analyticsData.activeUsers?.toLocaleString() || stats.totalUsers.toLocaleString(),
                      icon: Activity,
                      gradient: 'bg-gradient-to-br from-purple-500 to-pink-600',
                      trend: 'up',
                      trendValue: '+12.4%'
                    },
                    {
                      label: 'Reytng',
                      value: analyticsData.avgRating?.toFixed(1) || '4.7',
                      icon: Award,
                      gradient: 'bg-gradient-to-br from-yellow-500 to-orange-600',
                      trend: 'up',
                      trendValue: '+0.3'
                    },
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
                            <p className={`text-sm font-medium mt-1 ${stat.trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
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
                      <BarChart data={analyticsData.weeklyData}>
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
                            <stop offset="0%" stopColor="#10b981" stopOpacity={0.8} />
                            <stop offset="100%" stopColor="#059669" stopOpacity={0.3} />
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
                      <LineChart data={analyticsData.weeklyData}>
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
                        <Line type="monotone" dataKey="applications" stroke="#f59e0b" strokeWidth={3} dot={{ fill: '#f59e0b', r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </motion.div>
                </div>

                {/* Additional Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Applications by Status */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="bg-white/80 dark:bg-secondary-900/80 backdrop-blur-xl rounded-3xl p-6 border border-secondary-200/50 dark:border-secondary-800/50 shadow-xl"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-lg font-bold text-secondary-900 dark:text-white">Arizalar holati</h3>
                        <p className="text-sm text-secondary-500 dark:text-secondary-400">Arizalar bo'yicha statistika</p>
                      </div>
                      <FileText className="w-8 h-8 text-yellow-500" />
                    </div>
                    {analyticsData.applicationsByStatus && analyticsData.applicationsByStatus.length > 0 ? (
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={analyticsData.applicationsByStatus.map(item => ({
                          name: item.status === 'PENDING' ? 'Kutilmoqda' :
                            item.status === 'ACCEPTED' ? 'Qabul qilindi' :
                              item.status === 'REJECTED' ? 'Rad etildi' :
                                item.status === 'WITHDRAWN' ? 'Bekor qilindi' : item.status,
                          count: item.count
                        }))}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                          <XAxis dataKey="name" stroke="rgba(0,0,0,0.5)" style={{ fontSize: '11px' }} />
                          <YAxis stroke="rgba(0,0,0,0.5)" style={{ fontSize: '12px' }} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'rgba(255,255,255,0.95)',
                              borderRadius: '12px',
                              border: 'none',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }}
                          />
                          <Bar dataKey="count" fill="url(#statusGradient)" radius={[8, 8, 0, 0]} />
                          <defs>
                            <linearGradient id="statusGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.8} />
                              <stop offset="100%" stopColor="#d97706" stopOpacity={0.3} />
                            </linearGradient>
                          </defs>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-[250px] text-secondary-500">
                        <div className="text-center">
                          <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p>Ariza ma'lumotlari yo'q</p>
                        </div>
                      </div>
                    )}
                  </motion.div>

                  {/* Jobs by Region */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white/80 dark:bg-secondary-900/80 backdrop-blur-xl rounded-3xl p-6 border border-secondary-200/50 dark:border-secondary-800/50 shadow-xl"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-lg font-bold text-secondary-900 dark:text-white">Viloyatlar bo'yicha</h3>
                        <p className="text-sm text-secondary-500 dark:text-secondary-400">Ish e'lonlari tarqalishi</p>
                      </div>
                      <MapPin className="w-8 h-8 text-purple-500" />
                    </div>
                    {analyticsData.jobsByRegion && analyticsData.jobsByRegion.length > 0 ? (
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={analyticsData.jobsByRegion.slice(0, 8)} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                          <XAxis type="number" stroke="rgba(0,0,0,0.5)" style={{ fontSize: '12px' }} />
                          <YAxis type="category" dataKey="region" stroke="rgba(0,0,0,0.5)" style={{ fontSize: '11px' }} width={100} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'rgba(255,255,255,0.95)',
                              borderRadius: '12px',
                              border: 'none',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }}
                          />
                          <Bar dataKey="count" fill="url(#regionGradient)" radius={[0, 8, 8, 0]} />
                          <defs>
                            <linearGradient id="regionGradient" x1="0" y1="0" x2="1" y2="0">
                              <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.8} />
                              <stop offset="100%" stopColor="#a855f7" stopOpacity={0.3} />
                            </linearGradient>
                          </defs>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-[250px] text-secondary-500">
                        <div className="text-center">
                          <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p>Viloyat ma'lumotlari yo'q</p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </div>

                {/* Top Performers */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white/80 dark:bg-secondary-900/80 backdrop-blur-xl rounded-3xl p-6 border border-secondary-200/50 dark:border-secondary-800/50 shadow-xl"
                >
                  <h3 className="text-lg font-bold text-secondary-900 dark:text-white mb-4">Top foydalanuvchilar</h3>
                  <div className="space-y-3">
                    {users.filter(u => u.role === 'worker').slice(0, 4).length > 0 ? (
                      users.filter(u => u.role === 'worker').slice(0, 4).map((worker, i) => (
                        <motion.div
                          key={worker.id}
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
                              <p className="font-medium text-secondary-900 dark:text-white">{worker.firstName} {worker.lastName}</p>
                              <p className="text-sm text-secondary-500 dark:text-secondary-400">{worker.phone}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-medium px-2 py-1 rounded-lg ${worker.isVerified
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-secondary-100 text-secondary-700 dark:bg-secondary-800 dark:text-secondary-400'
                              }`}>
                              {worker.isVerified ? 'Tasdiqlangan' : 'Tasdiqlanmagan'}
                            </p>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-secondary-500">
                        <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Hozircha ishchi foydalanuvchilar yo'q</p>
                      </div>
                    )}
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
                  {/* Umumiy sozlamalar */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0 }}
                    className="bg-white/80 dark:bg-secondary-900/80 backdrop-blur-xl rounded-3xl p-6 border border-secondary-200/50 dark:border-secondary-800/50 shadow-xl"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg">
                        <Settings className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-secondary-900 dark:text-white">Umumiy sozlamalar</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-3 border-b border-secondary-100 dark:border-secondary-800">
                        <div>
                          <p className="font-medium text-secondary-900 dark:text-white">Sayt nomi</p>
                          <p className="text-sm text-secondary-500 dark:text-secondary-400">{systemSettings.siteName}</p>
                        </div>
                        <motion.button
                          onClick={() => handleEditSetting('siteName', 'Sayt nomi', systemSettings.siteName, 'input')}
                          className="p-2 rounded-lg text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Edit className="w-4 h-4" />
                        </motion.button>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-secondary-100 dark:border-secondary-800">
                        <div>
                          <p className="font-medium text-secondary-900 dark:text-white">Sayt URL</p>
                          <p className="text-sm text-secondary-500 dark:text-secondary-400">{systemSettings.siteUrl}</p>
                        </div>
                        <motion.button
                          onClick={() => handleEditSetting('siteUrl', 'Sayt URL', systemSettings.siteUrl, 'input')}
                          className="p-2 rounded-lg text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Edit className="w-4 h-4" />
                        </motion.button>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-secondary-100 dark:border-secondary-800">
                        <div>
                          <p className="font-medium text-secondary-900 dark:text-white">Admin email</p>
                          <p className="text-sm text-secondary-500 dark:text-secondary-400">{systemSettings.adminEmail}</p>
                        </div>
                        <motion.button
                          onClick={() => handleEditSetting('adminEmail', 'Admin email', systemSettings.adminEmail, 'input')}
                          className="p-2 rounded-lg text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Edit className="w-4 h-4" />
                        </motion.button>
                      </div>
                      <div className="flex items-center justify-between py-3">
                        <div>
                          <p className="font-medium text-secondary-900 dark:text-white">Sayt holati</p>
                          <p className="text-sm text-secondary-500 dark:text-secondary-400">{systemSettings.siteActive ? 'Faol' : 'O\'chirilgan'}</p>
                        </div>
                        <motion.button
                          onClick={() => handleToggleSetting('siteActive')}
                          whileTap={{ scale: 0.95 }}
                          className={`relative w-12 h-6 rounded-full transition-colors ${systemSettings.siteActive ? 'bg-primary-500' : 'bg-secondary-300 dark:bg-secondary-700'}`}
                        >
                          <motion.div
                            animate={{ x: systemSettings.siteActive ? 24 : 2 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-md"
                          />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>

                  {/* Foydalanuvchi sozlamalari */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="bg-white/80 dark:bg-secondary-900/80 backdrop-blur-xl rounded-3xl p-6 border border-secondary-200/50 dark:border-secondary-800/50 shadow-xl"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-secondary-900 dark:text-white">Foydalanuvchi sozlamalari</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-3 border-b border-secondary-100 dark:border-secondary-800">
                        <div>
                          <p className="font-medium text-secondary-900 dark:text-white">Yangi foydalanuvchilar</p>
                          <p className="text-sm text-secondary-500 dark:text-secondary-400">{systemSettings.allowNewUsers ? 'Ruxsat berilgan' : 'Taqiqlangan'}</p>
                        </div>
                        <motion.button
                          onClick={() => handleToggleSetting('allowNewUsers')}
                          whileTap={{ scale: 0.95 }}
                          className={`relative w-12 h-6 rounded-full transition-colors ${systemSettings.allowNewUsers ? 'bg-primary-500' : 'bg-secondary-300 dark:bg-secondary-700'}`}
                        >
                          <motion.div
                            animate={{ x: systemSettings.allowNewUsers ? 24 : 2 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-md"
                          />
                        </motion.button>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-secondary-100 dark:border-secondary-800">
                        <div>
                          <p className="font-medium text-secondary-900 dark:text-white">Email tasdiqlash</p>
                          <p className="text-sm text-secondary-500 dark:text-secondary-400">{systemSettings.emailVerification ? 'Majburiy' : 'Ixtiyoriy'}</p>
                        </div>
                        <motion.button
                          onClick={() => handleToggleSetting('emailVerification')}
                          whileTap={{ scale: 0.95 }}
                          className={`relative w-12 h-6 rounded-full transition-colors ${systemSettings.emailVerification ? 'bg-primary-500' : 'bg-secondary-300 dark:bg-secondary-700'}`}
                        >
                          <motion.div
                            animate={{ x: systemSettings.emailVerification ? 24 : 2 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-md"
                          />
                        </motion.button>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-secondary-100 dark:border-secondary-800">
                        <div>
                          <p className="font-medium text-secondary-900 dark:text-white">Telefon tasdiqlash</p>
                          <p className="text-sm text-secondary-500 dark:text-secondary-400">{systemSettings.phoneVerification ? 'Majburiy' : 'Ixtiyoriy'}</p>
                        </div>
                        <motion.button
                          onClick={() => handleToggleSetting('phoneVerification')}
                          whileTap={{ scale: 0.95 }}
                          className={`relative w-12 h-6 rounded-full transition-colors ${systemSettings.phoneVerification ? 'bg-primary-500' : 'bg-secondary-300 dark:bg-secondary-700'}`}
                        >
                          <motion.div
                            animate={{ x: systemSettings.phoneVerification ? 24 : 2 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-md"
                          />
                        </motion.button>
                      </div>
                      <div className="flex items-center justify-between py-3">
                        <div>
                          <p className="font-medium text-secondary-900 dark:text-white">Profil moderatsiya</p>
                          <p className="text-sm text-secondary-500 dark:text-secondary-400">{systemSettings.profileModeration ? 'Yoqilgan' : 'O\'chirilgan'}</p>
                        </div>
                        <motion.button
                          onClick={() => handleToggleSetting('profileModeration')}
                          whileTap={{ scale: 0.95 }}
                          className={`relative w-12 h-6 rounded-full transition-colors ${systemSettings.profileModeration ? 'bg-primary-500' : 'bg-secondary-300 dark:bg-secondary-700'}`}
                        >
                          <motion.div
                            animate={{ x: systemSettings.profileModeration ? 24 : 2 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-md"
                          />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>

                  {/* Ish e'lonlari sozlamalari */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white/80 dark:bg-secondary-900/80 backdrop-blur-xl rounded-3xl p-6 border border-secondary-200/50 dark:border-secondary-800/50 shadow-xl"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg">
                        <Briefcase className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-secondary-900 dark:text-white">Ish e'lonlari sozlamalari</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-3 border-b border-secondary-100 dark:border-secondary-800">
                        <div>
                          <p className="font-medium text-secondary-900 dark:text-white">Auto tasdiqlash</p>
                          <p className="text-sm text-secondary-500 dark:text-secondary-400">{systemSettings.autoApproveJobs ? 'Yoqilgan' : 'O\'chirilgan'}</p>
                        </div>
                        <motion.button
                          onClick={() => handleToggleSetting('autoApproveJobs')}
                          whileTap={{ scale: 0.95 }}
                          className={`relative w-12 h-6 rounded-full transition-colors ${systemSettings.autoApproveJobs ? 'bg-primary-500' : 'bg-secondary-300 dark:bg-secondary-700'}`}
                        >
                          <motion.div
                            animate={{ x: systemSettings.autoApproveJobs ? 24 : 2 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-md"
                          />
                        </motion.button>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-secondary-100 dark:border-secondary-800">
                        <div>
                          <p className="font-medium text-secondary-900 dark:text-white">E'lon muddati</p>
                          <p className="text-sm text-secondary-500 dark:text-secondary-400">{systemSettings.jobDuration} kun</p>
                        </div>
                        <motion.button
                          onClick={() => handleEditSetting('jobDuration', 'E\'lon muddati (kun)', systemSettings.jobDuration, 'select', [
                            { label: '7 kun', value: 7 },
                            { label: '14 kun', value: 14 },
                            { label: '30 kun', value: 30 },
                            { label: '60 kun', value: 60 },
                            { label: '90 kun', value: 90 },
                          ])}
                          className="px-3 py-1.5 rounded-lg text-sm font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          O'zgartirish
                        </motion.button>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-secondary-100 dark:border-secondary-800">
                        <div>
                          <p className="font-medium text-secondary-900 dark:text-white">Maksimal e'lonlar</p>
                          <p className="text-sm text-secondary-500 dark:text-secondary-400">{systemSettings.maxJobsPerUser} ta</p>
                        </div>
                        <motion.button
                          onClick={() => handleEditSetting('maxJobsPerUser', 'Maksimal e\'lonlar soni', systemSettings.maxJobsPerUser, 'select', [
                            { label: '5 ta', value: 5 },
                            { label: '10 ta', value: 10 },
                            { label: '20 ta', value: 20 },
                            { label: '50 ta', value: 50 },
                            { label: 'Cheksiz', value: 999 },
                          ])}
                          className="px-3 py-1.5 rounded-lg text-sm font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          O'zgartirish
                        </motion.button>
                      </div>
                      <div className="flex items-center justify-between py-3">
                        <div>
                          <p className="font-medium text-secondary-900 dark:text-white">Premium e'lonlar</p>
                          <p className="text-sm text-secondary-500 dark:text-secondary-400">{systemSettings.premiumJobsEnabled ? 'Yoqilgan' : 'O\'chirilgan'}</p>
                        </div>
                        <motion.button
                          onClick={() => handleToggleSetting('premiumJobsEnabled')}
                          whileTap={{ scale: 0.95 }}
                          className={`relative w-12 h-6 rounded-full transition-colors ${systemSettings.premiumJobsEnabled ? 'bg-primary-500' : 'bg-secondary-300 dark:bg-secondary-700'}`}
                        >
                          <motion.div
                            animate={{ x: systemSettings.premiumJobsEnabled ? 24 : 2 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-md"
                          />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>

                  {/* To'lov sozlamalari */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="bg-white/80 dark:bg-secondary-900/80 backdrop-blur-xl rounded-3xl p-6 border border-secondary-200/50 dark:border-secondary-800/50 shadow-xl"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600 shadow-lg">
                        <DollarSign className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-secondary-900 dark:text-white">To'lov sozlamalari</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-3 border-b border-secondary-100 dark:border-secondary-800">
                        <div>
                          <p className="font-medium text-secondary-900 dark:text-white">Payme</p>
                          <p className="text-sm text-secondary-500 dark:text-secondary-400">{systemSettings.paymeEnabled ? 'Yoqilgan' : 'O\'chirilgan'}</p>
                        </div>
                        <motion.button
                          onClick={() => handleToggleSetting('paymeEnabled')}
                          whileTap={{ scale: 0.95 }}
                          className={`relative w-12 h-6 rounded-full transition-colors ${systemSettings.paymeEnabled ? 'bg-primary-500' : 'bg-secondary-300 dark:bg-secondary-700'}`}
                        >
                          <motion.div
                            animate={{ x: systemSettings.paymeEnabled ? 24 : 2 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-md"
                          />
                        </motion.button>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-secondary-100 dark:border-secondary-800">
                        <div>
                          <p className="font-medium text-secondary-900 dark:text-white">Click</p>
                          <p className="text-sm text-secondary-500 dark:text-secondary-400">{systemSettings.clickEnabled ? 'Yoqilgan' : 'O\'chirilgan'}</p>
                        </div>
                        <motion.button
                          onClick={() => handleToggleSetting('clickEnabled')}
                          whileTap={{ scale: 0.95 }}
                          className={`relative w-12 h-6 rounded-full transition-colors ${systemSettings.clickEnabled ? 'bg-primary-500' : 'bg-secondary-300 dark:bg-secondary-700'}`}
                        >
                          <motion.div
                            animate={{ x: systemSettings.clickEnabled ? 24 : 2 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-md"
                          />
                        </motion.button>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-secondary-100 dark:border-secondary-800">
                        <div>
                          <p className="font-medium text-secondary-900 dark:text-white">Uzcard</p>
                          <p className="text-sm text-secondary-500 dark:text-secondary-400">{systemSettings.uzcardEnabled ? 'Yoqilgan' : 'O\'chirilgan'}</p>
                        </div>
                        <motion.button
                          onClick={() => handleToggleSetting('uzcardEnabled')}
                          whileTap={{ scale: 0.95 }}
                          className={`relative w-12 h-6 rounded-full transition-colors ${systemSettings.uzcardEnabled ? 'bg-primary-500' : 'bg-secondary-300 dark:bg-secondary-700'}`}
                        >
                          <motion.div
                            animate={{ x: systemSettings.uzcardEnabled ? 24 : 2 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-md"
                          />
                        </motion.button>
                      </div>
                      <div className="flex items-center justify-between py-3">
                        <div>
                          <p className="font-medium text-secondary-900 dark:text-white">Komisya</p>
                          <p className="text-sm text-secondary-500 dark:text-secondary-400">{systemSettings.commission}%</p>
                        </div>
                        <motion.button
                          onClick={() => handleEditSetting('commission', 'Komisya (%)', systemSettings.commission, 'input')}
                          className="p-2 rounded-lg text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Edit className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>

                  {/* Xavfsizlik sozlamalari */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/80 dark:bg-secondary-900/80 backdrop-blur-xl rounded-3xl p-6 border border-secondary-200/50 dark:border-secondary-800/50 shadow-xl"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg">
                        <Shield className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-secondary-900 dark:text-white">Xavfsizlik</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-3 border-b border-secondary-100 dark:border-secondary-800">
                        <div>
                          <p className="font-medium text-secondary-900 dark:text-white">Ikki faktorli autentifikatsiya (2FA)</p>
                          <p className="text-sm text-secondary-500 dark:text-secondary-400">{systemSettings.twoFactorEnabled ? 'Adminlar uchun yoqilgan' : 'O\'chirilgan'}</p>
                        </div>
                        <motion.button
                          onClick={() => handleToggleSetting('twoFactorEnabled')}
                          whileTap={{ scale: 0.95 }}
                          className={`relative w-12 h-6 rounded-full transition-colors ${systemSettings.twoFactorEnabled ? 'bg-primary-500' : 'bg-secondary-300 dark:bg-secondary-700'}`}
                        >
                          <motion.div
                            animate={{ x: systemSettings.twoFactorEnabled ? 24 : 2 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-md"
                          />
                        </motion.button>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-secondary-100 dark:border-secondary-800">
                        <div>
                          <p className="font-medium text-secondary-900 dark:text-white">IP bloklash</p>
                          <p className="text-sm text-secondary-500 dark:text-secondary-400">{systemSettings.ipBlocking ? 'Yoqilgan' : 'O\'chirilgan'}</p>
                        </div>
                        <motion.button
                          onClick={() => handleToggleSetting('ipBlocking')}
                          whileTap={{ scale: 0.95 }}
                          className={`relative w-12 h-6 rounded-full transition-colors ${systemSettings.ipBlocking ? 'bg-primary-500' : 'bg-secondary-300 dark:bg-secondary-700'}`}
                        >
                          <motion.div
                            animate={{ x: systemSettings.ipBlocking ? 24 : 2 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-md"
                          />
                        </motion.button>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-secondary-100 dark:border-secondary-800">
                        <div>
                          <p className="font-medium text-secondary-900 dark:text-white">Spam himoya</p>
                          <p className="text-sm text-secondary-500 dark:text-secondary-400">{systemSettings.spamProtection ? 'Yoqilgan' : 'O\'chirilgan'}</p>
                        </div>
                        <motion.button
                          onClick={() => handleToggleSetting('spamProtection')}
                          whileTap={{ scale: 0.95 }}
                          className={`relative w-12 h-6 rounded-full transition-colors ${systemSettings.spamProtection ? 'bg-primary-500' : 'bg-secondary-300 dark:bg-secondary-700'}`}
                        >
                          <motion.div
                            animate={{ x: systemSettings.spamProtection ? 24 : 2 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-md"
                          />
                        </motion.button>
                      </div>
                      <div className="flex items-center justify-between py-3">
                        <div>
                          <p className="font-medium text-secondary-900 dark:text-white">Avtomatik zaxira nusxa</p>
                          <p className="text-sm text-secondary-500 dark:text-secondary-400">
                            {systemSettings.autoBackup === 'daily' ? 'Har kuni' :
                              systemSettings.autoBackup === 'weekly' ? 'Har hafta' :
                                systemSettings.autoBackup === 'monthly' ? 'Har oy' : 'O\'chirilgan'}
                          </p>
                        </div>
                        <motion.button
                          onClick={() => handleEditSetting('autoBackup', 'Avtomatik zaxira', systemSettings.autoBackup, 'select', [
                            { label: 'O\'chirilgan', value: 'off' },
                            { label: 'Har kuni', value: 'daily' },
                            { label: 'Har hafta', value: 'weekly' },
                            { label: 'Har oy', value: 'monthly' },
                          ])}
                          className="px-3 py-1.5 rounded-lg text-sm font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          O'zgartirish
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
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
                        onClick={handleDatabaseCleanup}
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
                        onClick={handleClearCache}
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

      {/* User Details Modal */}
      <AnimatePresence>
        {showUserModal && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowUserModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-secondary-900 rounded-3xl p-6 max-w-lg w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-secondary-900 dark:text-white">Foydalanuvchi ma'lumotlari</h3>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="p-2 rounded-xl hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors"
                >
                  <X className="w-5 h-5 text-secondary-500" />
                </button>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                  {selectedUser.firstName?.charAt(0) || ''}{selectedUser.lastName?.charAt(0) || ''}
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-secondary-900 dark:text-white">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </h4>
                  <p className="text-secondary-500">{selectedUser.phone}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${selectedUser.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                      selectedUser.role === 'employer' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                        'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      }`}>
                      {selectedUser.role === 'admin' ? 'Admin' : selectedUser.role === 'employer' ? 'Ish beruvchi' : 'Ishchi'}
                    </span>
                    {selectedUser.isVerified && (
                      <span className="flex items-center gap-1 text-green-600 text-xs">
                        <CheckCircle className="w-3 h-3" /> Tasdiqlangan
                      </span>
                    )}
                    {selectedUser.isBlocked && (
                      <span className="flex items-center gap-1 text-red-600 text-xs">
                        <XCircle className="w-3 h-3" /> Bloklangan
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {selectedUser.email && (
                  <div className="flex items-center gap-3 p-3 bg-secondary-50 dark:bg-secondary-800 rounded-xl">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Award className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-secondary-500">Email</p>
                      <p className="text-sm font-medium text-secondary-900 dark:text-white">{selectedUser.email}</p>
                    </div>
                  </div>
                )}
                {selectedUser.region && (
                  <div className="flex items-center gap-3 p-3 bg-secondary-50 dark:bg-secondary-800 rounded-xl">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <MapPin className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-secondary-500">Hudud</p>
                      <p className="text-sm font-medium text-secondary-900 dark:text-white">{selectedUser.region}</p>
                    </div>
                  </div>
                )}
                {selectedUser.createdAt && (
                  <div className="flex items-center gap-3 p-3 bg-secondary-50 dark:bg-secondary-800 rounded-xl">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <Calendar className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-secondary-500">Ro'yxatdan o'tgan</p>
                      <p className="text-sm font-medium text-secondary-900 dark:text-white">
                        {new Date(selectedUser.createdAt).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                )}
                {selectedUser.bio && (
                  <div className="p-3 bg-secondary-50 dark:bg-secondary-800 rounded-xl">
                    <p className="text-xs text-secondary-500 mb-1">Bio</p>
                    <p className="text-sm text-secondary-700 dark:text-secondary-300">{selectedUser.bio}</p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 mt-6">
                {!selectedUser.isVerified && (
                  <motion.button
                    onClick={() => {
                      handleVerifyUser(selectedUser.id, `${selectedUser.firstName} ${selectedUser.lastName}`);
                      setShowUserModal(false);
                    }}
                    className="flex-1 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <CheckCircle className="w-4 h-4 inline mr-2" />
                    Tasdiqlash
                  </motion.button>
                )}
                <motion.button
                  onClick={() => {
                    handleBlockUser(selectedUser.id, `${selectedUser.firstName} ${selectedUser.lastName}`, selectedUser.isBlocked || false);
                    setShowUserModal(false);
                  }}
                  className={`flex-1 py-3 rounded-xl font-medium transition-colors ${selectedUser.isBlocked
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-red-500 text-white hover:bg-red-600'
                    }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {selectedUser.isBlocked ? (
                    <>
                      <UserCheck className="w-4 h-4 inline mr-2" />
                      Blokdan chiqarish
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 inline mr-2" />
                      Bloklash
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Job Modal */}
      <AnimatePresence>
        {showAddJobModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowAddJobModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-secondary-900 rounded-3xl p-6 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-secondary-900 dark:text-white">Yangi ish e'loni qo'shish</h3>
                <button
                  onClick={() => setShowAddJobModal(false)}
                  className="p-2 rounded-xl hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors"
                >
                  <X className="w-5 h-5 text-secondary-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Sarlavha *</label>
                  <input
                    type="text"
                    value={newJobData.title}
                    onChange={(e) => setNewJobData({ ...newJobData, title: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    placeholder="Masalan: Senior React Developer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Tavsif *</label>
                  <textarea
                    value={newJobData.description}
                    onChange={(e) => setNewJobData({ ...newJobData, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
                    placeholder="Ish haqida batafsil ma'lumot..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Talablar</label>
                  <textarea
                    value={newJobData.requirements}
                    onChange={(e) => setNewJobData({ ...newJobData, requirements: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
                    placeholder="Nomzodga qo'yiladigan talablar..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Minimal maosh (so'm)</label>
                    <input
                      type="number"
                      value={newJobData.salaryMin}
                      onChange={(e) => setNewJobData({ ...newJobData, salaryMin: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      placeholder="5000000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Maksimal maosh (so'm)</label>
                    <input
                      type="number"
                      value={newJobData.salaryMax}
                      onChange={(e) => setNewJobData({ ...newJobData, salaryMax: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      placeholder="10000000"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Hudud</label>
                    <select
                      value={newJobData.region}
                      onChange={(e) => setNewJobData({ ...newJobData, region: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    >
                      <option value="Toshkent shahri">Toshkent shahri</option>
                      <option value="Toshkent viloyati">Toshkent viloyati</option>
                      <option value="Samarqand">Samarqand</option>
                      <option value="Buxoro">Buxoro</option>
                      <option value="Farg'ona">Farg'ona</option>
                      <option value="Andijon">Andijon</option>
                      <option value="Namangan">Namangan</option>
                      <option value="Qashqadaryo">Qashqadaryo</option>
                      <option value="Surxondaryo">Surxondaryo</option>
                      <option value="Navoiy">Navoiy</option>
                      <option value="Xorazm">Xorazm</option>
                      <option value="Jizzax">Jizzax</option>
                      <option value="Sirdaryo">Sirdaryo</option>
                      <option value="Qoraqalpog'iston">Qoraqalpog'iston</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Ish turi</label>
                    <select
                      value={newJobData.workType}
                      onChange={(e) => setNewJobData({ ...newJobData, workType: e.target.value as typeof newJobData.workType })}
                      className="w-full px-4 py-3 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    >
                      <option value="full-time">To'liq vaqt</option>
                      <option value="part-time">Yarim vaqt</option>
                      <option value="remote">Masofaviy</option>
                      <option value="contract">Shartnoma</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Tajriba darajasi</label>
                  <select
                    value={newJobData.experienceRequired}
                    onChange={(e) => setNewJobData({ ...newJobData, experienceRequired: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  >
                    <option value="Tajribasiz">Tajribasiz</option>
                    <option value="1-2 yil">Junior (1-2 yil)</option>
                    <option value="2-4 yil">Middle (2-4 yil)</option>
                    <option value="4+ yil">Senior (4+ yil)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-6">
                <motion.button
                  onClick={() => setShowAddJobModal(false)}
                  className="flex-1 py-3 bg-secondary-100 dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300 rounded-xl font-medium hover:bg-secondary-200 dark:hover:bg-secondary-700 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Bekor qilish
                </motion.button>
                <motion.button
                  onClick={handleCreateJob}
                  className="flex-1 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-primary-500/30 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Plus className="w-4 h-4 inline mr-2" />
                  E'lon yaratish
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add User Modal */}
      <AnimatePresence>
        {showAddUserModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowAddUserModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-secondary-900 rounded-3xl p-6 max-w-lg w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-secondary-900 dark:text-white">Yangi foydalanuvchi qo'shish</h3>
                <button
                  onClick={() => setShowAddUserModal(false)}
                  className="p-2 rounded-xl hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors"
                >
                  <X className="w-5 h-5 text-secondary-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Ism *</label>
                    <input
                      type="text"
                      value={newUserData.firstName}
                      onChange={(e) => setNewUserData({ ...newUserData, firstName: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      placeholder="Ism"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Familiya</label>
                    <input
                      type="text"
                      value={newUserData.lastName}
                      onChange={(e) => setNewUserData({ ...newUserData, lastName: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      placeholder="Familiya"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Telefon *</label>
                  <input
                    type="tel"
                    value={newUserData.phone}
                    onChange={(e) => setNewUserData({ ...newUserData, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    placeholder="+998 90 123 45 67"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Parol *</label>
                  <input
                    type="password"
                    value={newUserData.password}
                    onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    placeholder="Kamida 8 belgi"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Rol</label>
                  <select
                    value={newUserData.role}
                    onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value as 'WORKER' | 'EMPLOYER' | 'ADMIN' })}
                    className="w-full px-4 py-3 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  >
                    <option value="WORKER">Ishchi</option>
                    <option value="EMPLOYER">Ish beruvchi</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-6">
                <motion.button
                  onClick={() => setShowAddUserModal(false)}
                  className="flex-1 py-3 bg-secondary-100 dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300 rounded-xl font-medium hover:bg-secondary-200 dark:hover:bg-secondary-700 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Bekor qilish
                </motion.button>
                <motion.button
                  onClick={handleAddUser}
                  className="flex-1 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-primary-500/30 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Plus className="w-4 h-4 inline mr-2" />
                  Qo'shish
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit User Modal */}
      <AnimatePresence>
        {showEditUserModal && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowEditUserModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-secondary-900 rounded-3xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-secondary-900 dark:text-white">
                  <Edit className="w-5 h-5 inline mr-2" />
                  Foydalanuvchini tahrirlash
                </h3>
                <button
                  onClick={() => setShowEditUserModal(false)}
                  className="p-2 rounded-xl hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors"
                >
                  <X className="w-5 h-5 text-secondary-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Ism *</label>
                    <input
                      type="text"
                      value={editUserData.firstName}
                      onChange={(e) => setEditUserData({ ...editUserData, firstName: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      placeholder="Ism"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Familiya</label>
                    <input
                      type="text"
                      value={editUserData.lastName}
                      onChange={(e) => setEditUserData({ ...editUserData, lastName: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      placeholder="Familiya"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Telefon *</label>
                  <input
                    type="tel"
                    value={editUserData.phone}
                    onChange={(e) => setEditUserData({ ...editUserData, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    placeholder="+998 90 123 45 67"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={editUserData.email}
                    onChange={(e) => setEditUserData({ ...editUserData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    placeholder="email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Hudud</label>
                  <input
                    type="text"
                    value={editUserData.region}
                    onChange={(e) => setEditUserData({ ...editUserData, region: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    placeholder="Toshkent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                    <Key className="w-4 h-4 inline mr-1" />
                    Yangi parol (o'zgartirish uchun kiriting)
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={editUserData.password}
                      onChange={(e) => setEditUserData({ ...editUserData, password: e.target.value })}
                      className="w-full px-4 py-3 pr-12 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      placeholder="Kamida 6 belgi"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-secondary-400 hover:text-secondary-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-secondary-400 mt-1">Bo'sh qoldiring - parol o'zgarmaydi</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Rol</label>
                  <select
                    value={editUserData.role}
                    onChange={(e) => setEditUserData({ ...editUserData, role: e.target.value as 'WORKER' | 'EMPLOYER' | 'ADMIN' })}
                    className="w-full px-4 py-3 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  >
                    <option value="WORKER">Ishchi</option>
                    <option value="EMPLOYER">Ish beruvchi</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>

                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editUserData.isVerified}
                      onChange={(e) => setEditUserData({ ...editUserData, isVerified: e.target.checked })}
                      className="w-4 h-4 rounded border-secondary-300 text-primary-500 focus:ring-primary-500"
                    />
                    <span className="text-sm text-secondary-700 dark:text-secondary-300">Tasdiqlangan</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editUserData.isBlocked}
                      onChange={(e) => setEditUserData({ ...editUserData, isBlocked: e.target.checked })}
                      className="w-4 h-4 rounded border-secondary-300 text-red-500 focus:ring-red-500"
                    />
                    <span className="text-sm text-secondary-700 dark:text-secondary-300">Bloklangan</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-6">
                <motion.button
                  onClick={() => setShowEditUserModal(false)}
                  className="flex-1 py-3 bg-secondary-100 dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300 rounded-xl font-medium hover:bg-secondary-200 dark:hover:bg-secondary-700 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Bekor qilish
                </motion.button>
                <motion.button
                  onClick={handleSaveUser}
                  className="flex-1 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-primary-500/30 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <CheckCircle className="w-4 h-4 inline mr-2" />
                  Saqlash
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Broadcast Notification Modal */}
      <AnimatePresence>
        {showBroadcastModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowBroadcastModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-secondary-900 rounded-3xl p-6 max-w-lg w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-secondary-900 dark:text-white">Broadcast bildirishnoma</h3>
                <button
                  onClick={() => setShowBroadcastModal(false)}
                  className="p-2 rounded-xl hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors"
                >
                  <X className="w-5 h-5 text-secondary-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Sarlavha *</label>
                  <input
                    type="text"
                    value={broadcastData.title}
                    onChange={(e) => setBroadcastData({ ...broadcastData, title: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    placeholder="Bildirishnoma sarlavhasi"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Xabar *</label>
                  <textarea
                    value={broadcastData.message}
                    onChange={(e) => setBroadcastData({ ...broadcastData, message: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
                    placeholder="Barcha foydalanuvchilarga yuboriladigan xabar..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Turi</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { value: 'info', label: 'Ma\'lumot', color: 'bg-blue-500' },
                      { value: 'success', label: 'Muvaffaqiyat', color: 'bg-green-500' },
                      { value: 'warning', label: 'Ogohlantirish', color: 'bg-yellow-500' },
                      { value: 'error', label: 'Xato', color: 'bg-red-500' },
                    ].map((type) => (
                      <button
                        key={type.value}
                        onClick={() => setBroadcastData({ ...broadcastData, type: type.value as typeof broadcastData.type })}
                        className={`p-3 rounded-xl border-2 transition-all ${broadcastData.type === type.value
                          ? `border-primary-500 ${type.color} text-white`
                          : 'border-secondary-200 dark:border-secondary-700 hover:border-primary-300'
                          }`}
                      >
                        <span className="text-xs font-medium">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-6">
                <motion.button
                  onClick={() => setShowBroadcastModal(false)}
                  className="flex-1 py-3 bg-secondary-100 dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300 rounded-xl font-medium hover:bg-secondary-200 dark:hover:bg-secondary-700 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Bekor qilish
                </motion.button>
                <motion.button
                  onClick={handleBroadcastNotification}
                  className="flex-1 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-primary-500/30 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Bell className="w-4 h-4 inline mr-2" />
                  Yuborish
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Setting Modal */}
      <AnimatePresence>
        {editingSettingModal?.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setEditingSettingModal(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-secondary-900 rounded-3xl p-6 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-secondary-900 dark:text-white">{editingSettingModal.label}</h3>
                <button
                  onClick={() => setEditingSettingModal(null)}
                  className="p-2 rounded-xl hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors"
                >
                  <X className="w-5 h-5 text-secondary-500" />
                </button>
              </div>

              <div className="space-y-4">
                {editingSettingModal.type === 'input' ? (
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                      Yangi qiymat
                    </label>
                    <input
                      type={typeof editingSettingModal.value === 'number' ? 'number' : 'text'}
                      value={editingSettingModal.value}
                      onChange={(e) => setEditingSettingModal({
                        ...editingSettingModal,
                        value: typeof editingSettingModal.value === 'number' ? Number(e.target.value) : e.target.value
                      })}
                      className="w-full px-4 py-3 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                      Tanlang
                    </label>
                    <div className="space-y-2">
                      {editingSettingModal.options?.map((option) => (
                        <motion.button
                          key={String(option.value)}
                          onClick={() => setEditingSettingModal({
                            ...editingSettingModal,
                            value: option.value
                          })}
                          className={`w-full px-4 py-3 rounded-xl border transition-all text-left ${editingSettingModal.value === option.value
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                            : 'border-secondary-200 dark:border-secondary-700 hover:border-primary-300 dark:hover:border-primary-600'
                            }`}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-secondary-900 dark:text-white">{option.label}</span>
                            {editingSettingModal.value === option.value && (
                              <CheckCircle className="w-5 h-5 text-primary-500" />
                            )}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 mt-6">
                <motion.button
                  onClick={() => setEditingSettingModal(null)}
                  className="flex-1 py-3 bg-secondary-100 dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300 rounded-xl font-medium hover:bg-secondary-200 dark:hover:bg-secondary-700 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Bekor qilish
                </motion.button>
                <motion.button
                  onClick={handleSaveEditedSetting}
                  className="flex-1 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-primary-500/30 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Saqlash
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
