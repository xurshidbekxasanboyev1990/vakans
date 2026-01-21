import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, Trash2, Briefcase, MessageSquare, Clock } from 'lucide-react';
import { notificationsApi } from '@/lib/api';
import { Notification as NotificationModel } from '@/types';
import { formatRelativeTime } from '@/lib/utils';
import { Button, Badge, EmptyState, Skeleton } from '@/components/ui';
import { toast } from 'sonner';
import { useRealTimeNotifications } from '@/hooks/useRealTimeNotifications';

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [unreadCount, setUnreadCount] = useState(0);

  // Real-time notifications
  const { newNotification } = useRealTimeNotifications();

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  useEffect(() => {
    if (newNotification) {
      setNotifications((prev) => [newNotification, ...prev]);
      setUnreadCount((prev) => prev + 1);
      
      // Show toast notification
      toast.custom((t) => (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="bg-white dark:bg-secondary-900 rounded-2xl p-4 shadow-2xl border border-secondary-200 dark:border-secondary-800 max-w-sm"
        >
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary-500/10 flex items-center justify-center flex-shrink-0">
              <Bell className="h-5 w-5 text-primary-500" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-secondary-900 dark:text-white text-sm mb-1">
                {newNotification.title}
              </h4>
              <p className="text-xs text-secondary-600 dark:text-secondary-400">
                {newNotification.message}
              </p>
            </div>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="text-secondary-400 hover:text-secondary-600"
            >
              ×
            </button>
          </div>
        </motion.div>
      ));
    }
  }, [newNotification]);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      // Demo mode - localStorage dan olish
      if (import.meta.env.VITE_DEMO_MODE === 'true') {
        const demoNotifications: NotificationModel[] = [
          {
            id: '1',
            userId: '1',
            type: 'application',
            title: 'Arizangiz ko\'rib chiqilmoqda',
            message: '"Senior Frontend Developer" ish o\'rni uchun arizangiz ishlab chiqaruvchi tomonidan ko\'rib chiqilmoqda.',
            isRead: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
            updatedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
          },
          {
            id: '2',
            userId: '1',
            type: 'job_match',
            title: 'Yangi vakansiya sizga mos',
            message: '"React Developer" ish o\'rni sizning ko\'nikmalaringizga to\'liq mos keladi.',
            isRead: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          },
          {
            id: '3',
            userId: '1',
            type: 'message',
            title: 'Yangi xabar',
            message: 'Texnokrat kompaniyasidan sizga yangi xabar keldi.',
            isRead: true,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
            updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          },
          {
            id: '4',
            userId: '1',
            type: 'reminder',
            title: 'Profil to\'ldirish eslatmasi',
            message: 'Profilingizni 100% to\'ldiring va ko\'proq ish takliflari oling!',
            isRead: true,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
            updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          },
        ];

        const filteredNotifications = filter === 'unread' 
          ? demoNotifications.filter(n => !n.isRead)
          : demoNotifications;

        setNotifications(filteredNotifications);
        setUnreadCount(demoNotifications.filter(n => !n.isRead).length);
      } else {
        const params = filter === 'unread' ? { unreadOnly: 'true' } : {};
        const response = await notificationsApi.getAll(params);
        
        if (response.success) {
          setNotifications(response.data || []);
          setUnreadCount(response.unreadCount || 0);
        }
      }
    } catch (error) {
      toast.error('Xabarnomalarni yuklashda xatolik');
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      if (import.meta.env.VITE_DEMO_MODE === 'true') {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
        toast.success('O\'qilgan deb belgilandi');
      } else {
        const response = await notificationsApi.markAsRead(id);
        if (response.success) {
          setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
          );
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      toast.error('Xatolik yuz berdi');
    }
  };

  const markAllAsRead = async () => {
    try {
      if (import.meta.env.VITE_DEMO_MODE === 'true') {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
        toast.success('Barchasi o\'qilgan');
      } else {
        const response = await notificationsApi.markAllAsRead();
        if (response.success) {
          setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
          setUnreadCount(0);
          toast.success('Barcha xabarnomalar o\'qildi');
        }
      }
    } catch (error) {
      toast.error('Xatolik yuz berdi');
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      if (import.meta.env.VITE_DEMO_MODE === 'true') {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        toast.success('Xabarnoma o\'chirildi');
      } else {
        const response = await notificationsApi.delete(id);
        if (response.success) {
          setNotifications((prev) => prev.filter((n) => n.id !== id));
          toast.success('Xabarnoma o\'chirildi');
        }
      }
    } catch (error) {
      toast.error('Xatolik yuz berdi');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'application':
      case 'application_received':
      case 'application_accepted':
      case 'application_rejected':
        return <Briefcase className="h-5 w-5" />;
      case 'message':
      case 'new_message':
        return <MessageSquare className="h-5 w-5" />;
      case 'reminder':
      case 'job_approved':
      case 'job_expired':
        return <Clock className="h-5 w-5" />;
      case 'job_match':
        return <Briefcase className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'application_accepted':
      case 'job_approved':
      case 'job_match':
        return 'bg-green-500/10 text-green-600 dark:text-green-400';
      case 'application_rejected':
      case 'job_expired':
        return 'bg-red-500/10 text-red-600 dark:text-red-400';
      case 'message':
      case 'new_message':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
      case 'reminder':
        return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400';
      default:
        return 'bg-primary-500/10 text-primary-600 dark:text-primary-400';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-secondary-950 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-950 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                  <Bell className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-secondary-900 dark:text-white">
                    Xabarnomalar
                  </h1>
                  <p className="text-secondary-600 dark:text-secondary-400">
                    {unreadCount > 0 ? `${unreadCount} ta o'qilmagan` : 'Yangi xabarlar yo\'q'}
                  </p>
                </div>
              </div>

              {unreadCount > 0 && (
                <Button onClick={markAllAsRead} variant="outline" size="sm">
                  <Check className="h-4 w-4 mr-2" />
                  Barchasini o'qish
                </Button>
              )}
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-primary-500 text-white'
                    : 'bg-white dark:bg-secondary-900 text-secondary-600 dark:text-secondary-400 hover:bg-secondary-100 dark:hover:bg-secondary-800'
                }`}
              >
                Hammasi
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2 ${
                  filter === 'unread'
                    ? 'bg-primary-500 text-white'
                    : 'bg-white dark:bg-secondary-900 text-secondary-600 dark:text-secondary-400 hover:bg-secondary-100 dark:hover:bg-secondary-800'
                }`}
              >
                O'qilmagan
                {unreadCount > 0 && (
                  <Badge variant="danger" className="ml-1">
                    {unreadCount}
                  </Badge>
                )}
              </button>
            </div>
          </motion.div>

          {/* Notifications List */}
          <AnimatePresence mode="popLayout">
            {notifications.length === 0 ? (
              <EmptyState
                icon={<Bell className="h-16 w-16 text-secondary-400" />}
                title="Xabarnomalar yo'q"
                description={
                  filter === 'unread'
                    ? 'O\'qilmagan xabarnomalar yo\'q'
                    : 'Sizda hozircha xabarnomalar mavjud emas'
                }
              />
            ) : (
              <div className="space-y-3">
                {notifications.map((notification, index) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.05 }}
                    className={`bg-white dark:bg-secondary-900 rounded-2xl p-4 shadow-sm border transition-all ${
                      notification.isRead
                        ? 'border-secondary-200 dark:border-secondary-800'
                        : 'border-primary-200 dark:border-primary-800 bg-primary-50/50 dark:bg-primary-900/10'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${getNotificationColor(notification.type)}`}>
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-semibold text-secondary-900 dark:text-white">
                            {notification.title}
                          </h3>
                          <span className="text-xs text-secondary-500 whitespace-nowrap">
                            {formatRelativeTime(notification.createdAt)}
                          </span>
                        </div>
                        {notification.message && (
                          <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-2">
                            {notification.message}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!notification.isRead && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="p-2 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors"
                            title="O'qilgan deb belgilash"
                          >
                            <Check className="h-4 w-4 text-secondary-500" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                          title="O'chirish"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
