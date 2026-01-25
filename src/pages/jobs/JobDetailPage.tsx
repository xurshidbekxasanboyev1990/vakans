import { useAuth } from '@/contexts/AuthContext';
import { applicationsApi, chatApi, jobsApi, reportsApi } from '@/lib/api';
import { logger } from '@/lib/logger';
import { formatDate, formatSalary } from '@/lib/utils';
import { Job } from '@/types';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, ArrowLeft, Bookmark, Briefcase, Calendar, CheckCircle, Clock, DollarSign, Eye, Flag, MapPin, MessageCircle, Send, Share2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

export function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isStartingChat, setIsStartingChat] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      if (!id) return;
      try {
        const res = await jobsApi.getById(id);
        if (res.success && res.data) {
          setJob(res.data);
          setIsSaved(res.data.isSaved || false);
          setHasApplied(res.data.hasApplied || false);
        } else {
          navigate('/jobs');
        }
      } catch (error) {
        logger.error('Error fetching job', error, { component: 'JobDetailPage', jobId: id });
        navigate('/jobs');
      } finally {
        setIsLoading(false);
      }
    };
    fetchJob();
  }, [id, navigate, isAuthenticated]);

  // Alohida tekshiruv - foydalanuvchi tizimga kirgan bo'lsa
  useEffect(() => {
    const checkApplication = async () => {
      if (!id || !isAuthenticated || !user || user.role !== 'worker') return;
      try {
        const res = await applicationsApi.checkIfApplied(id);
        if (res.success && res.data?.applied) {
          setHasApplied(true);
        }
      } catch {
        // Ignore errors
      }
    };
    checkApplication();
  }, [id, isAuthenticated, user]);

  const handleApply = async () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/jobs/' + id);
      return;
    }
    if (!id || hasApplied) return;
    setIsApplying(true);
    try {
      const res = await applicationsApi.apply(id);
      if (res.success) {
        setHasApplied(true);
        toast.success('Ariza muvaffaqiyatli yuborildi!');
      } else {
        // 409 Conflict - allaqachon ariza yuborilgan
        if ('alreadyApplied' in res && res.alreadyApplied) {
          setHasApplied(true);
          toast.info('Siz bu ishga allaqachon ariza topshirgansiz');
        } else if (res.error?.includes('allaqachon')) {
          setHasApplied(true);
          toast.info('Siz bu ishga allaqachon ariza topshirgansiz');
        } else {
          toast.error(res.error || 'Ariza yuborishda xatolik');
        }
      }
    } catch {
      toast.error('Ariza yuborishda xatolik');
    } finally {
      setIsApplying(false);
    }
  };

  const handleSave = async () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/jobs/' + id);
      return;
    }
    if (!id) return;
    setIsSaving(true);
    try {
      // Backend POST orqali toggle qiladi
      const res = await jobsApi.saveJob(id);
      if (res.success && res.data) {
        setIsSaved(res.data.saved);
        toast.success(res.data.saved ? 'Saqlandi' : 'Saqlangandan o\'chirildi');
      } else {
        toast.error('Saqlashda xatolik');
      }
    } catch {
      toast.error('Saqlashda xatolik');
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: job?.title,
        text: job?.description?.slice(0, 100),
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Havola nusxalandi');
    }
  };

  const handleStartChat = async () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/jobs/' + id);
      return;
    }
    if (!job) return;

    setIsStartingChat(true);
    try {
      // Employer bilan chat room yaratish yoki mavjud roomga o'tish
      const res = await chatApi.createRoom(job.employerId, job.id);
      if (res.success && res.data) {
        navigate(`/chat?room=${res.data.id}`);
      } else {
        toast.error('Chat boshlashda xatolik');
      }
    } catch {
      toast.error('Chat boshlashda xatolik');
    } finally {
      setIsStartingChat(false);
    }
  };

  // Report/Shikoyat modal state
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportData, setReportData] = useState({
    type: 'SPAM' as 'SPAM' | 'INAPPROPRIATE' | 'FAKE' | 'FRAUD' | 'HARASSMENT' | 'OTHER',
    reason: '',
    description: '',
  });
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  const handleSubmitReport = async () => {
    if (!reportData.reason.trim()) {
      toast.error('Iltimos, shikoyat sababini kiriting');
      return;
    }
    if (!job) return;

    setIsSubmittingReport(true);
    try {
      const res = await reportsApi.create({
        type: reportData.type,
        reason: reportData.reason,
        description: reportData.description || undefined,
        jobId: job.id,
        reportedId: job.employerId,
      });
      if (res.success) {
        toast.success('Shikoyatingiz qabul qilindi. Tez orada ko\'rib chiqamiz.');
        setShowReportModal(false);
        setReportData({ type: 'SPAM', reason: '', description: '' });
      } else {
        toast.error(res.error || 'Shikoyat yuborishda xatolik');
      }
    } catch {
      toast.error('Shikoyat yuborishda xatolik');
    } finally {
      setIsSubmittingReport(false);
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

  if (!job) {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-secondary-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-secondary-900 dark:text-white">Ish topilmadi</h2>
          <Link to="/jobs" className="text-primary-500 mt-4 inline-block hover:underline">Ishlarga qaytish</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-950 py-8 px-4">
      <motion.div
        className="max-w-4xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.button
          variants={itemVariants}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Orqaga
        </motion.button>

        {/* Asosiy ma'lumot */}
        <motion.div
          variants={itemVariants}
          className="bg-white dark:bg-secondary-900 rounded-2xl p-4 sm:p-6 shadow-sm border border-secondary-200 dark:border-secondary-800 mb-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-secondary-900 dark:text-white mb-2">{job.title}</h1>
              <Link to={`/companies/${job.employerId}`} className="text-primary-500 font-medium text-base sm:text-lg hover:underline">
                {job.employerName}
              </Link>
            </div>
            <div className="flex gap-2">
              <motion.button
                onClick={handleSave}
                disabled={isSaving}
                className={`p-2.5 sm:p-3 rounded-xl border transition-all ${isSaved ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-500 text-primary-500' : 'border-secondary-200 dark:border-secondary-700 hover:bg-secondary-50 dark:hover:bg-secondary-800 text-secondary-500'}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
              </motion.button>
              <motion.button
                onClick={handleShare}
                className="p-2.5 sm:p-3 rounded-xl border border-secondary-200 dark:border-secondary-700 hover:bg-secondary-50 dark:hover:bg-secondary-800 text-secondary-500 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Share2 className="w-5 h-5" />
              </motion.button>
              {isAuthenticated && (
                <motion.button
                  onClick={() => setShowReportModal(true)}
                  className="p-2.5 sm:p-3 rounded-xl border border-secondary-200 dark:border-secondary-700 hover:bg-red-50 dark:hover:bg-red-900/20 text-secondary-500 hover:text-red-500 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Shikoyat qilish"
                >
                  <Flag className="w-5 h-5" />
                </motion.button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
            <div className="flex items-center gap-2 text-secondary-600 dark:text-secondary-400 p-2.5 sm:p-3 bg-secondary-50 dark:bg-secondary-800/50 rounded-xl text-sm sm:text-base">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-primary-500 flex-shrink-0" />
              <span className="truncate">{job.location}</span>
            </div>
            <div className="flex items-center gap-2 text-secondary-600 dark:text-secondary-400 p-2.5 sm:p-3 bg-secondary-50 dark:bg-secondary-800/50 rounded-xl text-sm sm:text-base">
              <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-primary-500 flex-shrink-0" />
              <span className="truncate">{job.workType}</span>
            </div>
            <div className="flex items-center gap-2 text-secondary-600 dark:text-secondary-400 p-2.5 sm:p-3 bg-secondary-50 dark:bg-secondary-800/50 rounded-xl text-sm sm:text-base">
              <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-primary-500 flex-shrink-0" />
              <span className="truncate">{formatSalary(job.salaryMin, job.salaryMax)}</span>
            </div>
            <div className="flex items-center gap-2 text-secondary-600 dark:text-secondary-400 p-2.5 sm:p-3 bg-secondary-50 dark:bg-secondary-800/50 rounded-xl text-sm sm:text-base">
              <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-primary-500 flex-shrink-0" />
              <span>{job.viewsCount} ko'rilgan</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-secondary-500 mb-6">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              E'lon qilingan: {formatDate(job.createdAt)}
            </span>
            {job.expiresAt && (
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Muddati: {formatDate(job.expiresAt)}
              </span>
            )}
          </div>

          {user?.role === 'worker' && (
            <div className="flex gap-3">
              {hasApplied ? (
                <motion.button
                  disabled
                  className="flex-1 flex items-center justify-center gap-2 py-4 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-xl font-medium"
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                >
                  <CheckCircle className="w-5 h-5" />
                  Ariza yuborilgan
                </motion.button>
              ) : (
                <motion.button
                  onClick={handleApply}
                  disabled={isApplying}
                  className="flex-1 flex items-center justify-center gap-2 py-4 bg-primary-500 text-white rounded-xl hover:bg-primary-600 disabled:opacity-50 font-medium shadow-lg shadow-primary-500/25 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isApplying ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                  Ariza topshirish
                </motion.button>
              )}

              {/* Employer bilan chat boshlash */}
              <motion.button
                onClick={handleStartChat}
                disabled={isStartingChat}
                className="flex items-center justify-center gap-2 px-4 py-4 bg-secondary-100 dark:bg-secondary-800 text-secondary-700 dark:text-secondary-200 rounded-xl hover:bg-secondary-200 dark:hover:bg-secondary-700 disabled:opacity-50 font-medium transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isStartingChat ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-secondary-700 dark:border-secondary-200"></div>
                ) : (
                  <MessageCircle className="w-5 h-5" />
                )}
                <span className="hidden sm:inline">Yozish</span>
              </motion.button>
            </div>
          )}
        </motion.div>

        {/* Ish haqida */}
        <motion.div
          variants={itemVariants}
          className="bg-white dark:bg-secondary-900 rounded-2xl p-6 shadow-sm border border-secondary-200 dark:border-secondary-800 mb-6"
        >
          <h2 className="text-xl font-semibold text-secondary-900 dark:text-white mb-4">Ish haqida</h2>
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-secondary-700 dark:text-secondary-300 whitespace-pre-wrap leading-relaxed">{job.description}</p>
          </div>
        </motion.div>

        {/* Talablar */}
        {job.requirements && (
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-secondary-900 rounded-2xl p-6 shadow-sm border border-secondary-200 dark:border-secondary-800 mb-6"
          >
            <h2 className="text-xl font-semibold text-secondary-900 dark:text-white mb-4">Talablar</h2>
            <p className="text-secondary-700 dark:text-secondary-300 whitespace-pre-wrap leading-relaxed">{job.requirements}</p>
          </motion.div>
        )}

        {/* Afzalliklar */}
        {job.benefits && (
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-secondary-900 rounded-2xl p-6 shadow-sm border border-secondary-200 dark:border-secondary-800"
          >
            <h2 className="text-xl font-semibold text-secondary-900 dark:text-white mb-4">Afzalliklar</h2>
            <p className="text-secondary-700 dark:text-secondary-300 whitespace-pre-wrap leading-relaxed">{job.benefits}</p>
          </motion.div>
        )}
      </motion.div>

      {/* Report Modal */}
      <AnimatePresence>
        {showReportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowReportModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-secondary-900 rounded-2xl p-6 w-full max-w-md shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-secondary-900 dark:text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  Shikoyat qilish
                </h3>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="p-2 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Shikoyat turi
                  </label>
                  <select
                    value={reportData.type}
                    onChange={(e) => setReportData({ ...reportData, type: e.target.value as any })}
                    className="w-full px-4 py-2.5 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                  >
                    <option value="SPAM">Spam / Reklama</option>
                    <option value="FAKE">Soxta e'lon</option>
                    <option value="INAPPROPRIATE">Nomaqbul kontent</option>
                    <option value="FRAUD">Firibgarlik</option>
                    <option value="HARASSMENT">Bezovtalik</option>
                    <option value="OTHER">Boshqa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Sabab *
                  </label>
                  <input
                    type="text"
                    value={reportData.reason}
                    onChange={(e) => setReportData({ ...reportData, reason: e.target.value })}
                    placeholder="Shikoyat sababini qisqacha yozing"
                    className="w-full px-4 py-2.5 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Qo'shimcha ma'lumot
                  </label>
                  <textarea
                    value={reportData.description}
                    onChange={(e) => setReportData({ ...reportData, description: e.target.value })}
                    placeholder="Batafsil yozing (ixtiyoriy)"
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowReportModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-secondary-200 dark:border-secondary-700 hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  onClick={handleSubmitReport}
                  disabled={isSubmittingReport || !reportData.reason.trim()}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmittingReport ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Flag className="w-4 h-4" />
                      Yuborish
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default JobDetailPage;
