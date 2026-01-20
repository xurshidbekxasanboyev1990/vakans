import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { jobsApi, applicationsApi } from '@/lib/api';
import { Job } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { MapPin, Clock, Briefcase, DollarSign, Calendar, Eye, Bookmark, Share2, ArrowLeft, Send, CheckCircle } from 'lucide-react';
import { formatSalary, formatDate } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

export function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      if (!id) return;
      try {
        const res = await jobsApi.getOne(id);
        if (res.success && res.data) {
          setJob(res.data);
          setIsSaved(res.data.isSaved || false);
          setHasApplied(res.data.hasApplied || false);
        } else {
          navigate('/jobs');
        }
      } catch (error) {
        console.error('Error fetching job:', error);
        navigate('/jobs');
      } finally {
        setIsLoading(false);
      }
    };
    fetchJob();
  }, [id, navigate]);

  const handleApply = async () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/jobs/' + id);
      return;
    }
    if (!id) return;
    setIsApplying(true);
    try {
      const res = await applicationsApi.apply(id);
      if (res.success) {
        setHasApplied(true);
        toast.success('Ariza muvaffaqiyatli yuborildi!');
      } else {
        toast.error(res.error || 'Ariza yuborishda xatolik');
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
      const res = await jobsApi.save(id);
      if (res.success) {
        setIsSaved(!isSaved);
        toast.success(isSaved ? 'Saqlangandan o\'chirildi' : 'Saqlandi');
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
          className="bg-white dark:bg-secondary-900 rounded-2xl p-6 shadow-sm border border-secondary-200 dark:border-secondary-800 mb-6"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-secondary-900 dark:text-white mb-2">{job.title}</h1>
              <Link to={`/companies/${job.employerId}`} className="text-primary-500 font-medium text-lg hover:underline">
                {job.employerName}
              </Link>
            </div>
            <div className="flex gap-2">
              <motion.button 
                onClick={handleSave} 
                disabled={isSaving} 
                className={`p-3 rounded-xl border transition-all ${isSaved ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-500 text-primary-500' : 'border-secondary-200 dark:border-secondary-700 hover:bg-secondary-50 dark:hover:bg-secondary-800 text-secondary-500'}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
              </motion.button>
              <motion.button 
                onClick={handleShare} 
                className="p-3 rounded-xl border border-secondary-200 dark:border-secondary-700 hover:bg-secondary-50 dark:hover:bg-secondary-800 text-secondary-500 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Share2 className="w-5 h-5" />
              </motion.button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="flex items-center gap-2 text-secondary-600 dark:text-secondary-400 p-3 bg-secondary-50 dark:bg-secondary-800/50 rounded-xl">
              <MapPin className="w-5 h-5 text-primary-500" />
              <span>{job.location}</span>
            </div>
            <div className="flex items-center gap-2 text-secondary-600 dark:text-secondary-400 p-3 bg-secondary-50 dark:bg-secondary-800/50 rounded-xl">
              <Briefcase className="w-5 h-5 text-primary-500" />
              <span>{job.workType}</span>
            </div>
            <div className="flex items-center gap-2 text-secondary-600 dark:text-secondary-400 p-3 bg-secondary-50 dark:bg-secondary-800/50 rounded-xl">
              <DollarSign className="w-5 h-5 text-primary-500" />
              <span>{formatSalary(job.salaryMin, job.salaryMax)}</span>
            </div>
            <div className="flex items-center gap-2 text-secondary-600 dark:text-secondary-400 p-3 bg-secondary-50 dark:bg-secondary-800/50 rounded-xl">
              <Eye className="w-5 h-5 text-primary-500" />
              <span>{job.viewsCount} ko'rilgan</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-secondary-500 mb-6">
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
    </div>
  );
}

export default JobDetailPage;
