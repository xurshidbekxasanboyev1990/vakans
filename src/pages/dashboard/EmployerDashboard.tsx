import { useSocket } from '@/contexts/SocketContext';
import { applicationsApi, chatApi, jobsApi } from '@/lib/api';
import { logger } from '@/lib/logger';
import { getFileUrl } from '@/lib/utils';
import { Application, Job } from '@/types';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Briefcase, Check, Clock, Eye, MapPin, MessageCircle, Pause, Play, Plus, Trash2, Users, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// Regions list
const REGIONS = [
  'Toshkent shahri',
  'Toshkent viloyati',
  'Andijon',
  'Buxoro',
  'Farg\'ona',
  'Jizzax',
  'Xorazm',
  'Namangan',
  'Navoiy',
  'Qashqadaryo',
  'Samarqand',
  'Sirdaryo',
  'Surxondaryo',
  'Qoraqalpog\'iston',
];

// Work types
const WORK_TYPES = [
  { value: 'full-time', label: 'To\'liq stavka' },
  { value: 'part-time', label: 'Yarim stavka' },
  { value: 'remote', label: 'Masofaviy' },
  { value: 'contract', label: 'Shartnoma' },
];

export function EmployerDashboard() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Real-time socket connection
  const { newNotification, onJobUpdate, onApplicationUpdate } = useSocket();

  // Handle new application notification (real-time)
  useEffect(() => {
    if (newNotification && (newNotification.type === 'application' || newNotification.type === 'application_received')) {
      // Refresh applications list when new application arrives
      applicationsApi.getReceivedApplications().then(res => {
        if (res.success) {
          setApplications(res.data || []);
        }
      });
    }
  }, [newNotification]);

  // Handle job updates
  const handleJobUpdate = useCallback((job: Job) => {
    console.log('Real-time job update:', job);
    setJobs(prev => {
      const index = prev.findIndex(j => j.id === job.id);
      if (index !== -1) {
        const updated = [...prev];
        updated[index] = job;
        return updated;
      }
      return [job, ...prev];
    });
  }, []);

  // Handle application updates
  const handleApplicationUpdate = useCallback((app: Application) => {
    console.log('Real-time application update:', app);
    setApplications(prev => {
      const index = prev.findIndex(a => a.id === app.id);
      if (index !== -1) {
        const updated = [...prev];
        updated[index] = app;
        return updated;
      }
      return [app, ...prev];
    });
    toast.info('Yangi ariza keldi!');
  }, []);

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubJob = onJobUpdate(handleJobUpdate);
    const unsubApp = onApplicationUpdate(handleApplicationUpdate);
    return () => {
      unsubJob();
      unsubApp();
    };
  }, [onJobUpdate, handleJobUpdate, onApplicationUpdate, handleApplicationUpdate]);

  // Add job modal state
  const [showAddJobModal, setShowAddJobModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newJob, setNewJob] = useState({
    title: '',
    description: '',
    requirements: '',
    salary: '',
    salaryMax: '',
    region: 'Toshkent shahri',
    workType: 'full-time' as 'full-time' | 'part-time' | 'remote' | 'contract',
    experienceRequired: '',
    category: '',
  });

  // Ariza holati o'zgartirish
  const [processingAppId, setProcessingAppId] = useState<string | null>(null);

  const handleAcceptApplication = async (app: Application) => {
    setProcessingAppId(app.id);
    try {
      const res = await applicationsApi.updateStatus(app.id, 'accepted');
      if (res.success) {
        setApplications(prev => prev.map(a =>
          a.id === app.id ? { ...a, status: 'accepted' } : a
        ));
        toast.success('Ariza qabul qilindi!');
      } else {
        toast.error(res.error || 'Xatolik yuz berdi');
      }
    } catch (error) {
      toast.error('Xatolik yuz berdi');
    } finally {
      setProcessingAppId(null);
    }
  };

  const handleRejectApplication = async (app: Application) => {
    setProcessingAppId(app.id);
    try {
      const res = await applicationsApi.updateStatus(app.id, 'rejected');
      if (res.success) {
        setApplications(prev => prev.map(a =>
          a.id === app.id ? { ...a, status: 'rejected' } : a
        ));
        toast.success('Ariza rad etildi');
      } else {
        toast.error(res.error || 'Xatolik yuz berdi');
      }
    } catch (error) {
      toast.error('Xatolik yuz berdi');
    } finally {
      setProcessingAppId(null);
    }
  };

  const handleStartChat = async (app: Application) => {
    setProcessingAppId(app.id);
    try {
      // Ishchi bilan chat room yaratish
      const res = await chatApi.createRoom(app.workerId, app.jobId);
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
        const [jobsRes, appsRes] = await Promise.all([
          jobsApi.getMyJobs(),
          applicationsApi.getReceivedApplications(),
        ]);
        if (jobsRes.success) setJobs(jobsRes.data || []);
        if (appsRes.success) setApplications(appsRes.data || []);
      } catch (error) {
        logger.error('Error fetching employer data', error, { component: 'EmployerDashboard' });
        toast.error('Ma\'lumotlarni yuklashda xatolik yuz berdi');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Handle create job
  const handleCreateJob = async () => {
    if (!newJob.title || !newJob.description || !newJob.region) {
      toast.error('Iltimos, barcha majburiy maydonlarni to\'ldiring');
      return;
    }

    setIsSubmitting(true);
    try {
      const jobData = {
        title: newJob.title,
        description: newJob.description,
        requirements: newJob.requirements,
        salary: newJob.salary ? parseInt(newJob.salary) : undefined,
        salaryMax: newJob.salaryMax ? parseInt(newJob.salaryMax) : undefined,
        region: newJob.region,
        workType: newJob.workType,
        experienceRequired: newJob.experienceRequired,
        category: newJob.category || undefined,
      };

      const res = await jobsApi.create(jobData);
      if (res.success && res.data) {
        toast.success('Ish e\'loni muvaffaqiyatli yaratildi!');
        setJobs(prev => [res.data!, ...prev]);
        setShowAddJobModal(false);
        setNewJob({
          title: '',
          description: '',
          requirements: '',
          salary: '',
          salaryMax: '',
          region: 'Toshkent shahri',
          workType: 'full-time',
          experienceRequired: '',
          category: '',
        });
      } else {
        toast.error(res.error || 'Ish yaratishda xatolik');
      }
    } catch (error) {
      logger.error('Error creating job', error, { component: 'EmployerDashboard' });
      toast.error('Ish yaratishda xatolik yuz berdi');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete job
  const handleDeleteJob = async (jobId: string, jobTitle: string) => {
    if (!window.confirm(`"${jobTitle}" ishini o'chirishni xohlaysizmi?`)) return;

    try {
      const res = await jobsApi.delete(jobId);
      if (res.success) {
        toast.success('Ish muvaffaqiyatli o\'chirildi');
        setJobs(prev => prev.filter(j => j.id !== jobId));
      } else {
        toast.error(res.error || 'O\'chirishda xatolik');
      }
    } catch (error) {
      logger.error('Error deleting job', error, { component: 'EmployerDashboard' });
      toast.error('Ish o\'chirishda xatolik yuz berdi');
    }
  };

  // Handle pause job (set to CLOSED)
  const handlePauseJob = async (jobId: string) => {
    try {
      const res = await jobsApi.updateStatus(jobId, 'CLOSED');
      if (res.success && res.data) {
        toast.success('Ish to\'xtatildi');
        setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: 'closed' } : j));
      } else {
        toast.error(res.error || 'To\'xtatishda xatolik');
      }
    } catch (error) {
      logger.error('Error pausing job', error, { component: 'EmployerDashboard' });
      toast.error('Ish to\'xtatishda xatolik yuz berdi');
    }
  };

  // Handle resume job (set to ACTIVE)
  const handleResumeJob = async (jobId: string) => {
    try {
      const res = await jobsApi.updateStatus(jobId, 'ACTIVE');
      if (res.success && res.data) {
        toast.success('Ish qayta faollashtirildi');
        setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: 'active' } : j));
      } else {
        toast.error(res.error || 'Faollashtirishda xatolik');
      }
    } catch (error) {
      logger.error('Error resuming job', error, { component: 'EmployerDashboard' });
      toast.error('Ish faollashtirishda xatolik yuz berdi');
    }
  };

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

  const activeJobs = jobs.filter((job) => job.status === 'active').length;
  const pendingApplications = applications.filter((app) => app.status === 'pending').length;
  const totalViews = jobs.reduce((sum, job) => sum + (job.viewsCount || 0), 0);

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
            <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900 dark:text-white">Ish beruvchi paneli</h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1 sm:flex-none">
              <Link to="/jobs" className="inline-flex items-center justify-center w-full sm:w-auto px-3 sm:px-4 py-2.5 bg-secondary-100 dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300 rounded-xl hover:bg-secondary-200 dark:hover:bg-secondary-700 font-medium transition-all text-sm sm:text-base">
                <Eye className="w-4 h-4 mr-1 sm:mr-2" />
                Ko'rish
              </Link>
            </motion.div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAddJobModal(true)}
              className="flex-1 sm:flex-none inline-flex items-center justify-center px-3 sm:px-5 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 font-medium shadow-lg shadow-primary-500/25 transition-all text-sm sm:text-base"
            >
              <Plus className="w-5 h-5 mr-1 sm:mr-2" />
              E'lon
            </motion.button>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {[
            { title: 'Faol ishlar', value: activeJobs, icon: Briefcase, bgColor: 'bg-green-100 dark:bg-green-900/30', iconColor: 'text-green-500' },
            { title: 'Kutilayotgan arizalar', value: pendingApplications, icon: Clock, bgColor: 'bg-yellow-100 dark:bg-yellow-900/30', iconColor: 'text-yellow-500' },
            { title: 'Jami ko\'rishlar', value: totalViews, icon: Eye, bgColor: 'bg-blue-100 dark:bg-blue-900/30', iconColor: 'text-blue-500' },
            { title: 'Jami arizalar', value: applications.length, icon: Users, bgColor: 'bg-purple-100 dark:bg-purple-900/30', iconColor: 'text-purple-500' },
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
              <h2 className="text-lg font-semibold text-secondary-900 dark:text-white">Mening ishlarim</h2>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="text-primary-500 text-sm hover:underline font-medium"
              >
                Yuqoriga
              </button>
            </div>
            <div className="space-y-4">
              {jobs.slice(0, 5).map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-secondary-50 dark:bg-secondary-800/50 rounded-2xl border border-secondary-100 dark:border-secondary-800 overflow-hidden"
                >
                  {/* E'lon ma'lumotlari */}
                  <Link to={`/jobs/${job.id}`} className="block p-4 hover:bg-secondary-100/50 dark:hover:bg-secondary-700/30 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-secondary-900 dark:text-white text-lg truncate">{job.title}</h3>
                        <p className="text-sm text-secondary-500 mt-1">{job.location}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-secondary-400">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {job.viewsCount || 0} ko'rildi
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {job.applicationsCount || 0} ariza
                          </span>
                        </div>
                      </div>
                      <span className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap ${job.status === 'active'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : job.status === 'pending'
                            ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                            : job.status === 'rejected'
                              ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                              : 'bg-secondary-200 dark:bg-secondary-700 text-secondary-600 dark:text-secondary-400'
                        }`}>
                        {job.status === 'active' ? '✓ Faol' :
                          job.status === 'pending' ? '⏳ Tasdiqlanmagan' :
                            job.status === 'rejected' ? '✗ Rad etilgan' :
                              job.status === 'closed' ? '⏸ To\'xtatilgan' : job.status}
                      </span>
                    </div>
                  </Link>

                  {/* Amallar tugmalari - pastda */}
                  <div className="px-4 py-3 bg-secondary-100/50 dark:bg-secondary-800 border-t border-secondary-200 dark:border-secondary-700">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Ko'rish */}
                      <Link
                        to={`/jobs/${job.id}`}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-secondary-700 dark:text-secondary-300 bg-white dark:bg-secondary-700 rounded-lg hover:bg-secondary-50 dark:hover:bg-secondary-600 transition-colors border border-secondary-200 dark:border-secondary-600"
                      >
                        <Eye className="w-4 h-4" />
                        Ko'rish
                      </Link>

                      {/* To'xtatish / Faollashtirish - faqat tasdiqlangan e'lonlar uchun */}
                      {job.status === 'active' && (
                        <button
                          onClick={() => handlePauseJob(job.id)}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors border border-yellow-200 dark:border-yellow-800"
                        >
                          <Pause className="w-4 h-4" />
                          To'xtatish
                        </button>
                      )}

                      {job.status === 'closed' && (
                        <button
                          onClick={() => handleResumeJob(job.id)}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors border border-green-200 dark:border-green-800"
                        >
                          <Play className="w-4 h-4" />
                          Faollashtirish
                        </button>
                      )}

                      {/* PENDING holat uchun info */}
                      {job.status === 'pending' && (
                        <span className="flex items-center gap-2 px-4 py-2 text-sm text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                          <Clock className="w-4 h-4" />
                          Admin tasdig'ini kutmoqda
                        </span>
                      )}

                      {/* Rad etilgan holat uchun info */}
                      {job.status === 'rejected' && (
                        <span className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                          <X className="w-4 h-4" />
                          Admin tomonidan rad etilgan
                        </span>
                      )}

                      {/* O'chirish - har doim */}
                      <button
                        onClick={() => handleDeleteJob(job.id, job.title)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors border border-red-200 dark:border-red-800 ml-auto"
                      >
                        <Trash2 className="w-4 h-4" />
                        O'chirish
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
              {jobs.length === 0 && (
                <div className="text-center py-8">
                  <Briefcase className="w-12 h-12 text-secondary-300 mx-auto mb-3" />
                  <p className="text-secondary-500">Hali ish qo'shilmagan</p>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-secondary-900 rounded-2xl p-6 shadow-sm border border-secondary-200 dark:border-secondary-800"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-secondary-900 dark:text-white">Oxirgi arizalar</h2>
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
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {app.applicantAvatar ? (
                        <img src={getFileUrl(app.applicantAvatar)} alt="" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                          <span className="text-primary-600 dark:text-primary-400 font-medium">
                            {app.applicantFirstName?.charAt(0) || 'U'}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-secondary-900 dark:text-white truncate">{app.applicantName}</h3>
                        <p className="text-sm text-secondary-500 truncate">{app.jobTitle}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-secondary-400">
                          {app.applicantPhone && <span>{app.applicantPhone}</span>}
                          {app.applicantRegion && <span>• {app.applicantRegion}</span>}
                        </div>
                      </div>
                    </div>
                    <span className={`px-3 py-1 text-xs font-medium rounded-lg whitespace-nowrap ${app.status === 'accepted' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                      app.status === 'rejected' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                        app.status === 'viewed' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                          'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                      }`}>
                      {app.status === 'pending' ? 'Yangi' :
                        app.status === 'viewed' ? 'Ko\'rildi' :
                          app.status === 'accepted' ? 'Qabul' :
                            app.status === 'rejected' ? 'Rad' : app.status}
                    </span>
                  </div>

                  {/* Amal tugmalari */}
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-secondary-200 dark:border-secondary-700">
                    {app.status === 'pending' || app.status === 'viewed' ? (
                      <>
                        <motion.button
                          onClick={() => handleAcceptApplication(app)}
                          disabled={processingAppId === app.id}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 text-sm font-medium transition-colors"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {processingAppId === app.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                          ) : (
                            <>
                              <Check className="w-4 h-4" />
                              Tasdiqlash
                            </>
                          )}
                        </motion.button>
                        <motion.button
                          onClick={() => handleRejectApplication(app)}
                          disabled={processingAppId === app.id}
                          className="flex items-center justify-center gap-1.5 px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 disabled:opacity-50 text-sm font-medium transition-colors"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <X className="w-4 h-4" />
                        </motion.button>
                      </>
                    ) : app.status === 'accepted' ? (
                      <motion.button
                        onClick={() => handleStartChat(app)}
                        disabled={processingAppId === app.id}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 text-sm font-medium transition-colors shadow-lg shadow-primary-500/25"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {processingAppId === app.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        ) : (
                          <>
                            <MessageCircle className="w-4 h-4" />
                            Suhbat
                          </>
                        )}
                      </motion.button>
                    ) : null}
                  </div>
                </motion.div>
              ))}
              {applications.length === 0 && (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-secondary-300 mx-auto mb-3" />
                  <p className="text-secondary-500">Arizalar yo'q</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Add Job Modal */}
      <AnimatePresence>
        {showAddJobModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAddJobModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-secondary-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-secondary-200 dark:border-secondary-800">
                <h2 className="text-xl font-bold text-secondary-900 dark:text-white">Yangi ish e'loni</h2>
                <button
                  onClick={() => setShowAddJobModal(false)}
                  className="p-2 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors"
                >
                  <X className="w-5 h-5 text-secondary-500" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)] space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                    Lavozim nomi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newJob.title}
                    onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    placeholder="Masalan: Senior React Developer"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                    Tavsif <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={newJob.description}
                    onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
                    placeholder="Ish haqida batafsil ma'lumot..."
                  />
                </div>

                {/* Requirements */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                    Talablar
                  </label>
                  <textarea
                    value={newJob.requirements}
                    onChange={(e) => setNewJob({ ...newJob, requirements: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
                    placeholder="Nomzodga qo'yiladigan talablar..."
                  />
                </div>

                {/* Salary Range */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                      Maosh (min)
                    </label>
                    <input
                      type="number"
                      value={newJob.salary}
                      onChange={(e) => setNewJob({ ...newJob, salary: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      placeholder="5000000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                      Maosh (max)
                    </label>
                    <input
                      type="number"
                      value={newJob.salaryMax}
                      onChange={(e) => setNewJob({ ...newJob, salaryMax: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      placeholder="10000000"
                    />
                  </div>
                </div>

                {/* Region & Work Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                      Viloyat <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                      <select
                        value={newJob.region}
                        onChange={(e) => setNewJob({ ...newJob, region: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all appearance-none"
                      >
                        {REGIONS.map((region) => (
                          <option key={region} value={region}>{region}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                      Ish turi
                    </label>
                    <select
                      value={newJob.workType}
                      onChange={(e) => setNewJob({ ...newJob, workType: e.target.value as typeof newJob.workType })}
                      className="w-full px-4 py-3 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all appearance-none"
                    >
                      {WORK_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Experience */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                    Tajriba talabi
                  </label>
                  <input
                    type="text"
                    value={newJob.experienceRequired}
                    onChange={(e) => setNewJob({ ...newJob, experienceRequired: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    placeholder="Masalan: 2-3 yil yoki Tajribasiz"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 p-6 border-t border-secondary-200 dark:border-secondary-800">
                <button
                  onClick={() => setShowAddJobModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-secondary-200 dark:border-secondary-700 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-800 font-medium transition-colors"
                >
                  Bekor qilish
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCreateJob}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-primary-500 text-white hover:bg-primary-600 font-medium shadow-lg shadow-primary-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Yaratilmoqda...
                    </span>
                  ) : (
                    'E\'lon yaratish'
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default EmployerDashboard;
