import { useSocket } from '@/contexts/SocketContext';
import { applicationsApi, chatApi, jobsApi } from '@/lib/api';
import { logger } from '@/lib/logger';
import { Application, Job } from '@/types';
import { motion } from 'framer-motion';
import { ArrowLeft, Bookmark, CheckCircle, Clock, FileText, MessageCircle, Search } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export function WorkerDashboard() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Real-time socket connection
  const { onApplicationUpdate } = useSocket();

  // Handle real-time application updates
  const handleApplicationUpdate = useCallback((data: any) => {
    console.log('Real-time application update:', data);

    // Update application in list
    setApplications(prev => {
      const index = prev.findIndex(app => app.id === data.applicationId);
      if (index !== -1) {
        const updated = [...prev];
        updated[index] = { ...updated[index], status: data.status };
        return updated;
      }
      return prev;
    });

    // Show toast notification
    const statusMessages: Record<string, string> = {
      'viewed': 'Arizangiz ko\'rib chiqildi!',
      'accepted': 'Tabriklaymiz! Arizangiz qabul qilindi!',
      'rejected': 'Arizangiz rad etildi',
      'interview': 'Suhbatga taklif qilindingiz!',
    };

    const message = statusMessages[data.status] || `Ariza holati: ${data.status}`;
    if (data.status === 'accepted' || data.status === 'interview') {
      toast.success(message);
    } else if (data.status === 'rejected') {
      toast.error(message);
    } else {
      toast.info(message);
    }
  }, []);

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribe = onApplicationUpdate(handleApplicationUpdate);
    return () => unsubscribe();
  }, [onApplicationUpdate, handleApplicationUpdate]);

  // Chat boshlash uchun processing state
  const [processingAppId, setProcessingAppId] = useState<string | null>(null);

  const handleStartChat = async (app: Application) => {
    if (!app.employerId) {
      toast.error('Ish beruvchi ma\'lumotlari topilmadi');
      return;
    }
    setProcessingAppId(app.id);
    try {
      const res = await chatApi.createRoom(app.employerId, app.jobId);
      if (res.success && res.data) {
        navigate(`/chat?room=${res.data.id}`);
      } else {
        toast.error('Chat boshlashda xatolik');
      }
    } catch (error) {
      toast.error('Chat boshlashda xatolik');
    } finally {
      setProcessingAppId(null);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appsRes, savedRes, jobsRes] = await Promise.all([
          applicationsApi.getMyApplications(),
          jobsApi.getSavedJobs(),
          jobsApi.getAll({ limit: 6 }),
        ]);
        if (appsRes.success) setApplications(appsRes.data || []);
        if (savedRes.success) setSavedJobs(savedRes.data || []);
        if (jobsRes.success) setRecommendedJobs(jobsRes.data || []);
      } catch (error) {
        logger.error('Error fetching worker data', error, { component: 'WorkerDashboard' });
        toast.error('Ma\'lumotlarni yuklashda xatolik yuz berdi');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-secondary-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const pendingApplications = applications.filter((app) => app.status === 'pending').length;
  const acceptedApplications = applications.filter((app) => app.status === 'accepted').length;

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-950 py-8 px-4">
      <motion.div
        className="max-w-7xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <motion.button
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl bg-secondary-100 dark:bg-secondary-800 hover:bg-secondary-200 dark:hover:bg-secondary-700 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
            </motion.button>
            <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900 dark:text-white">Ishchi paneli</h1>
          </div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
            <Link to="/jobs" className="inline-flex items-center justify-center w-full sm:w-auto px-4 sm:px-5 py-2.5 sm:py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 font-medium shadow-lg shadow-primary-500/25 transition-all text-sm sm:text-base">
              <Search className="w-5 h-5 mr-2" />
              Ishlarni qidirish
            </Link>
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {[
            { title: 'Jami arizalar', value: applications.length, icon: FileText, bgColor: 'bg-blue-100 dark:bg-blue-900/30', iconColor: 'text-blue-500' },
            { title: 'Kutilayotgan', value: pendingApplications, icon: Clock, bgColor: 'bg-yellow-100 dark:bg-yellow-900/30', iconColor: 'text-yellow-500' },
            { title: 'Qabul qilingan', value: acceptedApplications, icon: CheckCircle, bgColor: 'bg-green-100 dark:bg-green-900/30', iconColor: 'text-green-500' },
            { title: 'Saqlangan ishlar', value: savedJobs.length, icon: Bookmark, bgColor: 'bg-purple-100 dark:bg-purple-900/30', iconColor: 'text-purple-500' },
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              variants={itemVariants}
              className="bg-white dark:bg-secondary-900 rounded-2xl p-4 sm:p-6 shadow-sm border border-secondary-200 dark:border-secondary-800"
              whileHover={{ y: -4 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-secondary-500 truncate">{stat.title}</p>
                  <p className="text-xl sm:text-3xl font-bold text-secondary-900 dark:text-white mt-1">{stat.value}</p>
                </div>
                <div className={`w-10 h-10 sm:w-12 sm:h-12 ${stat.bgColor} rounded-xl flex items-center justify-center flex-shrink-0 ml-2`}>
                  <stat.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.iconColor}`} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-secondary-900 rounded-2xl p-6 shadow-sm border border-secondary-200 dark:border-secondary-800"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-secondary-900 dark:text-white">Mening arizalarim</h2>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="text-primary-500 text-sm hover:underline font-medium"
              >
                Yuqoriga
              </button>
            </div>
            <div className="space-y-3">
              {applications.slice(0, 5).map((app, index) => (
                <motion.div
                  key={app.id}
                  className="p-4 bg-secondary-50 dark:bg-secondary-800/50 rounded-xl border border-secondary-100 dark:border-secondary-800"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-secondary-900 dark:text-white truncate">{app.jobTitle}</h3>
                      <p className="text-sm text-secondary-500 truncate">{app.employerName}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-secondary-400">
                        {app.jobLocation && <span>{app.jobLocation}</span>}
                        {app.jobSalaryMin && (
                          <span className="text-primary-500 font-medium">
                            {app.jobSalaryMin?.toLocaleString()}{app.jobSalaryMax ? ` - ${app.jobSalaryMax.toLocaleString()}` : ''} so'm
                          </span>
                        )}
                      </div>
                    </div>
                    <span className={`px-3 py-1 text-xs font-medium rounded-lg whitespace-nowrap ${app.status === 'accepted' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                      app.status === 'rejected' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                        app.status === 'viewed' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                          'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                      }`}>
                      {app.status === 'pending' ? 'Kutilmoqda' :
                        app.status === 'viewed' ? 'Ko\'rildi' :
                          app.status === 'accepted' ? 'Qabul qilindi' :
                            app.status === 'rejected' ? 'Rad etildi' : app.status}
                    </span>
                  </div>

                  {/* Qabul qilinganda Suhbat tugmasi */}
                  {app.status === 'accepted' && (
                    <div className="mt-3 pt-3 border-t border-secondary-200 dark:border-secondary-700">
                      <motion.button
                        onClick={() => handleStartChat(app)}
                        disabled={processingAppId === app.id}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 text-sm font-medium transition-colors shadow-lg shadow-primary-500/25"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {processingAppId === app.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        ) : (
                          <>
                            <MessageCircle className="w-4 h-4" />
                            Ish beruvchi bilan suhbat
                          </>
                        )}
                      </motion.button>
                    </div>
                  )}
                </motion.div>
              ))}
              {applications.length === 0 && (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-secondary-300 mx-auto mb-3" />
                  <p className="text-secondary-500">Hali ariza topshirmadingiz</p>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-secondary-900 rounded-2xl p-6 shadow-sm border border-secondary-200 dark:border-secondary-800"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-secondary-900 dark:text-white">Tavsiya etilgan ishlar</h2>
              <Link to="/jobs" className="text-primary-500 text-sm hover:underline font-medium">Barchasini ko'rish</Link>
            </div>
            <div className="space-y-3">
              {recommendedJobs.slice(0, 5).map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.01 }}
                >
                  <Link
                    to={`/jobs/${job.id}`}
                    className="block p-4 bg-secondary-50 dark:bg-secondary-800/50 rounded-xl border border-secondary-100 dark:border-secondary-800 hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-secondary-900 dark:text-white">{job.title}</h3>
                        <p className="text-sm text-secondary-500">{job.employerName} - {job.location}</p>
                      </div>
                      <span className="text-primary-500 font-semibold text-sm">{job.salaryMin?.toLocaleString() || 'N/A'} so'm</span>
                    </div>
                  </Link>
                </motion.div>
              ))}
              {recommendedJobs.length === 0 && (
                <div className="text-center py-8">
                  <Search className="w-12 h-12 text-secondary-300 mx-auto mb-3" />
                  <p className="text-secondary-500">Ishlar topilmadi</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

export default WorkerDashboard;
