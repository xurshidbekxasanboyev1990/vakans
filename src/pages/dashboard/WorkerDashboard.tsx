import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jobsApi, applicationsApi } from '@/lib/api';
import { Job, Application } from '@/types';
import { Search, Bookmark, FileText, Clock, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

export function WorkerDashboard() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appsRes, savedRes, jobsRes] = await Promise.all([
          applicationsApi.getMyApplications(),
          jobsApi.getSaved(),
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
        <motion.div variants={itemVariants} className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-secondary-900 dark:text-white">Ishchi paneli</h1>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link to="/jobs" className="inline-flex items-center px-5 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 font-medium shadow-lg shadow-primary-500/25 transition-all">
              <Search className="w-5 h-5 mr-2" />
              Ishlarni qidirish
            </Link>
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { title: 'Jami arizalar', value: applications.length, icon: FileText, bgColor: 'bg-blue-100 dark:bg-blue-900/30', iconColor: 'text-blue-500' },
            { title: 'Kutilayotgan', value: pendingApplications, icon: Clock, bgColor: 'bg-yellow-100 dark:bg-yellow-900/30', iconColor: 'text-yellow-500' },
            { title: 'Qabul qilingan', value: acceptedApplications, icon: CheckCircle, bgColor: 'bg-green-100 dark:bg-green-900/30', iconColor: 'text-green-500' },
            { title: 'Saqlangan ishlar', value: savedJobs.length, icon: Bookmark, bgColor: 'bg-purple-100 dark:bg-purple-900/30', iconColor: 'text-purple-500' },
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              variants={itemVariants}
              className="bg-white dark:bg-secondary-900 rounded-2xl p-6 shadow-sm border border-secondary-200 dark:border-secondary-800"
              whileHover={{ y: -4 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-secondary-500">{stat.title}</p>
                  <p className="text-3xl font-bold text-secondary-900 dark:text-white mt-1">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
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
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-secondary-900 dark:text-white">{app.jobTitle}</h3>
                      <p className="text-sm text-secondary-500">{app.employerName}</p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-medium rounded-lg ${
                      app.status === 'accepted' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 
                      app.status === 'rejected' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 
                      'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                    }`}>{app.status}</span>
                  </div>
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
