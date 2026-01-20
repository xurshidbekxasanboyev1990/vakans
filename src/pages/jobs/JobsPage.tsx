import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { jobsApi, categoriesApi } from '@/lib/api';
import { Job, Category } from '@/types';
import { Search, MapPin, Clock, Briefcase, Filter, X } from 'lucide-react';
import { formatSalary, formatRelativeTime } from '@/lib/utils';
import { useDebounce } from '@/hooks';
import { JobCardSkeleton, NoJobsFound, Card } from '@/components/ui';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export function JobsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    categoryId: searchParams.get('category') || '',
    location: searchParams.get('location') || '',
    workType: searchParams.get('workType') || '',
    salaryMin: searchParams.get('salaryMin') || '',
  });

  const debouncedSearch = useDebounce(filters.search, 500);

  useEffect(() => {
    const fetchCategories = async () => {
      const res = await categoriesApi.getAll();
      if (res.success) setCategories(res.data || []);
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true);
      try {
        const params: Record<string, unknown> = { page, limit: 12 };
        if (debouncedSearch) params.search = debouncedSearch;
        if (filters.categoryId) params.categoryId = filters.categoryId;
        if (filters.location) params.region = filters.location;
        if (filters.workType) params.workType = filters.workType;
        if (filters.salaryMin) params.minSalary = Number(filters.salaryMin);

        const res = await jobsApi.getAll(params);
        if (res.success) {
          setJobs(res.data || []);
          setTotalPages(res.pagination?.totalPages || 1);
        }
      } catch (error) {
        console.error('Error fetching jobs:', error);
        toast.error('Ishlarni yuklashda xatolik yuz berdi');
      } finally {
        setIsLoading(false);
      }
    };
    fetchJobs();
  }, [page, debouncedSearch, filters.categoryId, filters.location, filters.workType, filters.salaryMin]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    setSearchParams(params);
  };

  const clearFilters = () => {
    setFilters({ search: '', categoryId: '', location: '', workType: '', salaryMin: '' });
    setSearchParams({});
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-950 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-secondary-900 dark:text-white mb-4">Ishlar</h1>
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
              <input
                type="text"
                placeholder="Ish nomi yoki kalit so'z..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                aria-label="Ishlarni qidirish"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-900 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
            </div>
            <button 
              type="button" 
              onClick={() => setShowFilters(!showFilters)} 
              className="px-4 py-3 bg-secondary-100 dark:bg-secondary-800 rounded-xl hover:bg-secondary-200 dark:hover:bg-secondary-700 transition-colors"
              aria-label="Filterlarni ko'rsatish"
              aria-expanded={showFilters}
            >
              <Filter className="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
            </button>
            <button 
              type="submit" 
              className="px-6 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors font-medium"
            >
              Qidirish
            </button>
          </form>
          
          {showFilters && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 p-4 bg-white dark:bg-secondary-900 rounded-xl shadow-sm border border-secondary-200 dark:border-secondary-800"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <select 
                  value={filters.categoryId} 
                  onChange={(e) => setFilters({ ...filters, categoryId: e.target.value })} 
                  className="px-4 py-2 rounded-lg border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white"
                >
                  <option value="">Barcha kategoriyalar</option>
                  {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
                <input 
                  placeholder="Manzil" 
                  value={filters.location} 
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })} 
                  className="px-4 py-2 rounded-lg border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white" 
                />
                <select 
                  value={filters.workType} 
                  onChange={(e) => setFilters({ ...filters, workType: e.target.value })} 
                  className="px-4 py-2 rounded-lg border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white"
                >
                  <option value="">Barcha turlar</option>
                  <option value="full-time">To'liq vaqt</option>
                  <option value="part-time">Qisman vaqt</option>
                  <option value="remote">Masofaviy</option>
                </select>
                <button 
                  onClick={clearFilters} 
                  className="flex items-center justify-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" /> Tozalash
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <JobCardSkeleton key={i} />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <NoJobsFound onReset={clearFilters} />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link to={`/jobs/${job.id}`}>
                    <Card hover className="h-full">
                      <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-2">{job.title}</h3>
                      <p className="text-primary-500 font-medium mb-2">{job.employerName}</p>
                      <div className="flex items-center gap-4 text-sm text-secondary-500 mb-4">
                        <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{job.location}</span>
                        <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" />{job.workType}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-secondary-900 dark:text-white">{formatSalary(job.salaryMin, job.salaryMax)}</span>
                        <Clock className="w-4 h-4 text-secondary-400" />
                      </div>
                      <p className="text-xs text-secondary-400 mt-2">{formatRelativeTime(job.createdAt)}</p>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))} 
                  disabled={page === 1} 
                  className="px-4 py-2 rounded-lg bg-secondary-100 dark:bg-secondary-800 disabled:opacity-50 hover:bg-secondary-200 dark:hover:bg-secondary-700 transition-colors"
                >
                  Oldingi
                </button>
                <span className="px-4 py-2 text-secondary-600 dark:text-secondary-400">{page} / {totalPages}</span>
                <button 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                  disabled={page === totalPages} 
                  className="px-4 py-2 rounded-lg bg-secondary-100 dark:bg-secondary-800 disabled:opacity-50 hover:bg-secondary-200 dark:hover:bg-secondary-700 transition-colors"
                >
                  Keyingi
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default JobsPage;
