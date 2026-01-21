import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import type {
  User, Job, Application, Category, ChatRoom, ChatMessage, Notification,
  DashboardStats, ApiResponse, JobsResponse, ApplicationsResponse, UsersResponse, NotificationsResponse
} from '@/types';

// ============================================
// DEMO MODE - No backend required
// ============================================

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';

// Demo users - WARNING: For development only!
// In production, remove this and use real authentication
// Parollar: Worker123, Employer123, Admin123
const DEMO_USERS: Record<string, User & { password: string }> = {
  '+998901234567': {
    id: '1',
    phone: '+998901234567',
    password: 'Worker123',
    firstName: 'Aziz',
    lastName: 'Karimov',
    role: 'worker',
    avatar: '',
    region: 'Toshkent',
    isVerified: true,
    createdAt: new Date().toISOString(),
  },
  '+998901111111': {
    id: '2', 
    phone: '+998901111111',
    password: 'Employer123',
    firstName: 'Jasur',
    lastName: 'Rahimov',
    role: 'employer',
    avatar: '',
    region: 'Toshkent',
    companyName: 'Tech Solutions',
    isVerified: true,
    createdAt: new Date().toISOString(),
  },
  '+998900000000': {
    id: '3',
    phone: '+998900000000',
    password: 'Admin123',
    firstName: 'Admin',
    lastName: 'Superuser',
    role: 'admin',
    avatar: '',
    region: 'Toshkent',
    isVerified: true,
    createdAt: new Date().toISOString(),
  },
};

// Demo jobs
const DEMO_JOBS: Job[] = [
  {
    id: '1',
    title: 'Frontend Developer',
    description: 'React, TypeScript, Tailwind CSS bilimingiz bo\'lishi kerak. Remote ishlash imkoniyati mavjud.',
    employerId: '2',
    employerName: 'Tech Solutions',
    categoryId: '1',
    location: 'Toshkent',
    workType: 'full-time',
    salaryMin: 8000000,
    salaryMax: 12000000,
    requirements: ['React', 'TypeScript', 'Tailwind CSS', '2 yil tajriba'],
    benefits: ['Remote', 'Flexible hours', 'Health insurance'],
    status: 'active',
    viewsCount: 150,
    applicationsCount: 12,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    title: 'Sotuvchi',
    description: 'Katta savdo markazida sotuvchi kerak. Tajriba talab qilinmaydi.',
    employerId: '2',
    employerName: 'Market Plus',
    categoryId: '2',
    location: 'Samarqand',
    workType: 'part-time',
    salaryMin: 3000000,
    salaryMax: 5000000,
    requirements: ['Kommunikabellik', 'Vijdonlilik'],
    benefits: ['Tushlik', 'Bonus'],
    status: 'active',
    viewsCount: 89,
    applicationsCount: 5,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    title: 'Haydovchi',
    description: 'B kategoriya haydovchilik guvohnomasi talab qilinadi.',
    employerId: '2',
    employerName: 'Logistic Pro',
    categoryId: '3',
    location: 'Buxoro',
    workType: 'full-time',
    salaryMin: 4000000,
    salaryMax: 6000000,
    requirements: ['B kategoriya', '3 yil tajriba'],
    benefits: ['Benzin', 'Telefon'],
    status: 'active',
    viewsCount: 67,
    applicationsCount: 8,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    title: 'Backend Developer',
    description: 'Node.js, PostgreSQL, Redis bilan ishlash tajribasi kerak.',
    employerId: '2',
    employerName: 'Tech Solutions',
    categoryId: '1',
    location: 'Toshkent',
    workType: 'remote',
    salaryMin: 10000000,
    salaryMax: 15000000,
    requirements: ['Node.js', 'PostgreSQL', 'Redis', '3 yil tajriba'],
    benefits: ['100% Remote', 'Equipment provided'],
    status: 'active',
    viewsCount: 200,
    applicationsCount: 18,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    title: 'Oshpaz',
    description: 'Milliy va Yevropa oshxonasi bo\'yicha tajriba kerak.',
    employerId: '2',
    employerName: 'Grand Restaurant',
    categoryId: '4',
    location: 'Toshkent',
    workType: 'full-time',
    salaryMin: 5000000,
    salaryMax: 8000000,
    requirements: ['3 yil tajriba', 'Sanitariya kitobchasi'],
    benefits: ['Tushlik', 'Ish kiyimi'],
    status: 'active',
    viewsCount: 45,
    applicationsCount: 3,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '6',
    title: 'Dizayner (UI/UX)',
    description: 'Figma, Adobe XD da professional darajada ishlash.',
    employerId: '2',
    employerName: 'Creative Agency',
    categoryId: '1',
    location: 'Toshkent',
    workType: 'full-time',
    salaryMin: 7000000,
    salaryMax: 10000000,
    requirements: ['Figma', 'Adobe XD', 'Portfolio'],
    benefits: ['Remote', 'Flexible'],
    status: 'active',
    viewsCount: 120,
    applicationsCount: 9,
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Demo categories
const DEMO_CATEGORIES: Category[] = [
  { id: '1', name: 'IT va Dasturlash', slug: 'it', icon: '💻', jobsCount: 150 },
  { id: '2', name: 'Savdo', slug: 'sales', icon: '🛒', jobsCount: 89 },
  { id: '3', name: 'Transport', slug: 'transport', icon: '🚗', jobsCount: 67 },
  { id: '4', name: 'Oshxona', slug: 'kitchen', icon: '🍳', jobsCount: 45 },
  { id: '5', name: 'Ta\'lim', slug: 'education', icon: '📚', jobsCount: 78 },
  { id: '6', name: 'Tibbiyot', slug: 'medicine', icon: '🏥', jobsCount: 56 },
  { id: '7', name: 'Qurilish', slug: 'construction', icon: '🏗️', jobsCount: 90 },
  { id: '8', name: 'Boshqa', slug: 'other', icon: '📋', jobsCount: 120 },
];

// Demo storage helpers
const getStoredUser = (): User | null => {
  const stored = localStorage.getItem('demo_user');
  return stored ? JSON.parse(stored) : null;
};

const setStoredUser = (user: User | null) => {
  if (user) {
    localStorage.setItem('demo_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('demo_user');
  }
};

const getStoredUsers = (): Record<string, User & { password: string }> => {
  const stored = localStorage.getItem('demo_users');
  return stored ? JSON.parse(stored) : { ...DEMO_USERS };
};

const saveStoredUsers = (users: Record<string, User & { password: string }>) => {
  localStorage.setItem('demo_users', JSON.stringify(users));
};

// ============================================
// AXIOS INSTANCE
// ============================================

const API_URL = import.meta.env.VITE_API_URL || '/api';
const API_VERSION = import.meta.env.VITE_API_VERSION || 'v1';

const axiosInstance: AxiosInstance = axios.create({
  baseURL: `${API_URL}/${API_VERSION}`,
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor with token refresh
let isRefreshing = false;
let failedQueue: Array<{ resolve: (value: unknown) => void; reject: (reason?: unknown) => void }> = [];

const processQueue = (error: AxiosError | null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(undefined);
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => axiosInstance(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axiosInstance.post('/auth/refresh');
        processQueue(null);
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as AxiosError);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ============================================
// HELPER FUNCTIONS
// ============================================

function handleError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.error || error.message || 'Xatolik yuz berdi';
  }
  return 'Xatolik yuz berdi';
}

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ============================================
// AUTH API
// ============================================

export const authApi = {
  login: async (phone: string, password: string): Promise<ApiResponse<User>> => {
    if (DEMO_MODE) {
      await delay(500);
      const users = getStoredUsers();
      const user = Object.values(users).find(u => u.phone === phone && u.password === password);
      if (user) {
        const { password: _, ...userWithoutPassword } = user;
        setStoredUser(userWithoutPassword);
        return { success: true, data: userWithoutPassword };
      }
      return { success: false, error: 'Telefon raqam yoki parol noto\'g\'ri' };
    }
    
    try {
      const { data } = await axiosInstance.post<ApiResponse<User>>('/auth/login', { phone, password });
      return data;
    } catch (error) {
      return { success: false, error: handleError(error) };
    }
  },

  register: async (userData: {
    phone: string;
    password: string;
    firstName: string;
    lastName?: string;
    role: 'worker' | 'employer';
    region?: string;
  }): Promise<ApiResponse<User>> => {
    if (DEMO_MODE) {
      await delay(500);
      const users = getStoredUsers();
      
      // Check if phone already exists
      if (Object.values(users).some(u => u.phone === userData.phone)) {
        return { success: false, error: 'Bu telefon raqam allaqachon ro\'yxatdan o\'tgan' };
      }
      
      const newUser: User & { password: string } = {
        id: Date.now().toString(),
        phone: userData.phone,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName || '',
        role: userData.role,
        avatar: '',
        region: userData.region || '',
        isVerified: false,
        createdAt: new Date().toISOString(),
      };
      
      users[newUser.id] = newUser;
      saveStoredUsers(users);
      
      const { password: _, ...userWithoutPassword } = newUser;
      setStoredUser(userWithoutPassword);
      return { success: true, data: userWithoutPassword };
    }
    
    try {
      const { data } = await axiosInstance.post<ApiResponse<User>>('/auth/register', userData);
      return data;
    } catch (error) {
      return { success: false, error: handleError(error) };
    }
  },

  logout: async (): Promise<ApiResponse<null>> => {
    if (DEMO_MODE) {
      await delay(200);
      setStoredUser(null);
      return { success: true };
    }
    
    try {
      await axiosInstance.post('/auth/logout');
      return { success: true };
    } catch (error) {
      return { success: false, error: handleError(error) };
    }
  },

  getMe: async (): Promise<ApiResponse<User>> => {
    if (DEMO_MODE) {
      await delay(200);
      const user = getStoredUser();
      if (user) {
        return { success: true, data: user };
      }
      return { success: false, error: 'Not authenticated' };
    }
    
    try {
      const { data } = await axiosInstance.get<ApiResponse<User>>('/auth/me');
      return data;
    } catch (error) {
      return { success: false, error: handleError(error) };
    }
  },

  refresh: async (): Promise<ApiResponse<null>> => {
    if (DEMO_MODE) {
      return { success: true };
    }
    
    try {
      await axiosInstance.post('/auth/refresh');
      return { success: true };
    } catch (error) {
      return { success: false, error: handleError(error) };
    }
  },
};

// ============================================
// JOBS API
// ============================================

export const jobsApi = {
  getAll: async (params?: {
    search?: string;
    categoryId?: string;
    workType?: string;
    region?: string;
    minSalary?: number;
    maxSalary?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }): Promise<JobsResponse> => {
    if (DEMO_MODE) {
      await delay(300);
      let jobs = [...DEMO_JOBS];
      
      // Filter by search
      if (params?.search) {
        const search = params.search.toLowerCase();
        jobs = jobs.filter(j => 
          j.title.toLowerCase().includes(search) || 
          j.description.toLowerCase().includes(search)
        );
      }
      
      // Filter by category
      if (params?.categoryId) {
        jobs = jobs.filter(j => j.categoryId === params.categoryId);
      }
      
      // Filter by workType
      if (params?.workType) {
        jobs = jobs.filter(j => j.workType === params.workType);
      }
      
      // Filter by region
      if (params?.region) {
        jobs = jobs.filter(j => j.location.toLowerCase().includes(params.region!.toLowerCase()));
      }
      
      const page = params?.page || 1;
      const limit = params?.limit || 12;
      const total = jobs.length;
      const start = (page - 1) * limit;
      const paginatedJobs = jobs.slice(start, start + limit);
      
      return {
        success: true,
        data: paginatedJobs,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }
    
    try {
      const { data } = await axiosInstance.get<JobsResponse>('/jobs', { params });
      return data;
    } catch (error) {
      return { success: false, data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };
    }
  },

  getOne: async (id: string): Promise<ApiResponse<Job>> => {
    if (DEMO_MODE) {
      await delay(200);
      const job = DEMO_JOBS.find(j => j.id === id);
      if (job) {
        return { success: true, data: job };
      }
      return { success: false, error: 'Ish topilmadi' };
    }
    
    try {
      const { data } = await axiosInstance.get<ApiResponse<Job>>(`/jobs/${id}`);
      return data;
    } catch (error) {
      return { success: false, error: handleError(error) };
    }
  },

  create: async (jobData: Partial<Job>): Promise<ApiResponse<Job>> => {
    if (DEMO_MODE) {
      await delay(300);
      const newJob: Job = {
        id: Date.now().toString(),
        title: jobData.title || '',
        description: jobData.description || '',
        employerId: getStoredUser()?.id || '',
        employerName: getStoredUser()?.companyName || getStoredUser()?.firstName || '',
        categoryId: jobData.categoryId || '1',
        location: jobData.location || '',
        workType: jobData.workType || 'full-time',
        salaryMin: jobData.salaryMin || 0,
        salaryMax: jobData.salaryMax || 0,
        requirements: jobData.requirements || [],
        benefits: jobData.benefits || [],
        status: 'active',
        viewsCount: 0,
        applicationsCount: 0,
        createdAt: new Date().toISOString(),
      };
      DEMO_JOBS.unshift(newJob);
      return { success: true, data: newJob };
    }
    
    try {
      const { data } = await axiosInstance.post<ApiResponse<Job>>('/jobs', jobData);
      return data;
    } catch (error) {
      return { success: false, error: handleError(error) };
    }
  },

  update: async (id: string, jobData: Partial<Job>): Promise<ApiResponse<Job>> => {
    try {
      const { data } = await axiosInstance.put<ApiResponse<Job>>(`/jobs/${id}`, jobData);
      return data;
    } catch (error) {
      return { success: false, error: handleError(error) };
    }
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    try {
      await axiosInstance.delete(`/jobs/${id}`);
      return { success: true };
    } catch (error) {
      return { success: false, error: handleError(error) };
    }
  },

  getMyJobs: async (params?: { status?: string; page?: number; limit?: number }): Promise<JobsResponse> => {
    try {
      const { data } = await axiosInstance.get<JobsResponse>('/jobs/my', { params });
      return data;
    } catch (error) {
      return { success: false, data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };
    }
  },

  save: async (id: string): Promise<ApiResponse<{ saved: boolean }>> => {
    if (DEMO_MODE) {
      await delay(200);
      // Demo - localStorage da saqlash
      const savedJobs = JSON.parse(localStorage.getItem('demo_saved_jobs') || '[]');
      const index = savedJobs.indexOf(id);
      if (index > -1) {
        savedJobs.splice(index, 1);
      } else {
        savedJobs.push(id);
      }
      localStorage.setItem('demo_saved_jobs', JSON.stringify(savedJobs));
      return { success: true, data: { saved: index === -1 } };
    }
    
    try {
      const { data } = await axiosInstance.post<ApiResponse<{ saved: boolean }>>(`/jobs/${id}/save`);
      return data;
    } catch (error) {
      return { success: false, error: handleError(error) };
    }
  },

  getSaved: async (): Promise<ApiResponse<Job[]>> => {
    if (DEMO_MODE) {
      await delay(200);
      const savedJobIds = JSON.parse(localStorage.getItem('demo_saved_jobs') || '[]');
      const savedJobs = DEMO_JOBS.filter(job => savedJobIds.includes(job.id));
      return { success: true, data: savedJobs };
    }
    
    try {
      const { data } = await axiosInstance.get<ApiResponse<Job[]>>('/jobs/saved');
      return data;
    } catch (error) {
      return { success: false, error: handleError(error) };
    }
  },

  react: async (id: string, reaction: 'like' | 'dislike'): Promise<ApiResponse<{ reaction: string | null }>> => {
    try {
      const { data } = await axiosInstance.post<ApiResponse<{ reaction: string | null }>>(`/jobs/${id}/react`, { reaction });
      return data;
    } catch (error) {
      return { success: false, error: handleError(error) };
    }
  },
};

// ============================================
// APPLICATIONS API
// ============================================

export const applicationsApi = {
  apply: async (jobId: string, coverLetter?: string): Promise<ApiResponse<Application>> => {
    if (DEMO_MODE) {
      await delay(300);
      const user = getStoredUser();
      if (!user) {
        return { success: false, error: 'Tizimga kiring' };
      }
      const job = DEMO_JOBS.find(j => j.id === jobId);
      const newApplication: Application = {
        id: 'app-' + Date.now(),
        jobId,
        workerId: user.id,
        coverLetter,
        status: 'pending',
        createdAt: new Date().toISOString(),
        jobTitle: job?.title,
        companyName: job?.employerName,
        employerName: job?.employerName,
      };
      // Store in localStorage
      const applications = JSON.parse(localStorage.getItem('demo_applications') || '[]');
      applications.unshift(newApplication);
      localStorage.setItem('demo_applications', JSON.stringify(applications));
      return { success: true, data: newApplication };
    }
    
    try {
      const { data } = await axiosInstance.post<ApiResponse<Application>>('/applications', { jobId, coverLetter });
      return data;
    } catch (error) {
      return { success: false, error: handleError(error) };
    }
  },

  getMyApplications: async (params?: { status?: string; page?: number; limit?: number }): Promise<ApplicationsResponse> => {
    if (DEMO_MODE) {
      await delay(200);
      const user = getStoredUser();
      if (!user) {
        return { success: true, data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };
      }
      let applications: Application[] = JSON.parse(localStorage.getItem('demo_applications') || '[]');
      
      // Filter by status if provided
      if (params?.status) {
        applications = applications.filter(app => app.status === params.status);
      }
      
      const page = params?.page || 1;
      const limit = params?.limit || 10;
      const total = applications.length;
      const start = (page - 1) * limit;
      const paginatedApps = applications.slice(start, start + limit);
      
      return {
        success: true,
        data: paginatedApps,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      };
    }
    
    try {
      const { data } = await axiosInstance.get<ApplicationsResponse>('/applications/my', { params });
      return data;
    } catch (error) {
      return { success: false, data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };
    }
  },

  getJobApplications: async (jobId: string, params?: { status?: string; page?: number; limit?: number }): Promise<ApplicationsResponse> => {
    try {
      const { data } = await axiosInstance.get<ApplicationsResponse>(`/applications/job/${jobId}`, { params });
      return data;
    } catch (error) {
      return { success: false, data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };
    }
  },

  updateStatus: async (id: string, status: string, notes?: string): Promise<ApiResponse<Application>> => {
    try {
      const { data } = await axiosInstance.put<ApiResponse<Application>>(`/applications/${id}/status`, { status, employerNotes: notes });
      return data;
    } catch (error) {
      return { success: false, error: handleError(error) };
    }
  },

  withdraw: async (id: string): Promise<ApiResponse<null>> => {
    try {
      await axiosInstance.delete(`/applications/${id}`);
      return { success: true };
    } catch (error) {
      return { success: false, error: handleError(error) };
    }
  },
};

// ============================================
// USERS API
// ============================================

export const usersApi = {
  getProfile: async (): Promise<ApiResponse<User>> => {
    try {
      const { data } = await axiosInstance.get<ApiResponse<User>>('/users/me');
      return data;
    } catch (error) {
      return { success: false, error: handleError(error) };
    }
  },

  getUser: async (id: string): Promise<ApiResponse<User>> => {
    try {
      const { data } = await axiosInstance.get<ApiResponse<User>>(`/users/${id}`);
      return data;
    } catch (error) {
      return { success: false, error: handleError(error) };
    }
  },

  updateProfile: async (userData: Partial<User>): Promise<ApiResponse<User>> => {
    try {
      const { data } = await axiosInstance.put<ApiResponse<User>>('/users/me', userData);
      return data;
    } catch (error) {
      return { success: false, error: handleError(error) };
    }
  },

  updatePassword: async (data: { currentPassword: string; newPassword: string }): Promise<ApiResponse<null>> => {
    try {
      await axiosInstance.put('/users/me/password', data);
      return { success: true };
    } catch (error) {
      return { success: false, error: handleError(error) };
    }
  },

  updateAvatar: async (avatar: string): Promise<ApiResponse<User>> => {
    try {
      const { data } = await axiosInstance.put<ApiResponse<User>>('/users/me/avatar', { avatar });
      return data;
    } catch (error) {
      return { success: false, error: handleError(error) };
    }
  },

  updateCompany: async (companyData: { companyName?: string; companyDescription?: string; website?: string; companySize?: string }): Promise<ApiResponse<User>> => {
    try {
      const { data } = await axiosInstance.put<ApiResponse<User>>('/users/me/company', companyData);
      return data;
    } catch (error) {
      return { success: false, error: handleError(error) };
    }
  },

  updateFcmToken: async (fcmToken: string): Promise<ApiResponse<null>> => {
    try {
      await axiosInstance.put('/users/me/fcm-token', { fcmToken });
      return { success: true };
    } catch (error) {
      return { success: false, error: handleError(error) };
    }
  },
};

// ============================================
// CATEGORIES API
// ============================================

export const categoriesApi = {
  getAll: async (): Promise<ApiResponse<Category[]>> => {
    if (DEMO_MODE) {
      await delay(200);
      return { success: true, data: DEMO_CATEGORIES };
    }
    
    try {
      const { data } = await axiosInstance.get<ApiResponse<Category[]>>('/categories');
      return data;
    } catch (error) {
      return { success: false, error: handleError(error) };
    }
  },

  getOne: async (id: string): Promise<ApiResponse<Category>> => {
    try {
      const { data } = await axiosInstance.get<ApiResponse<Category>>(`/categories/${id}`);
      return data;
    } catch (error) {
      return { success: false, error: handleError(error) };
    }
  },

  getJobs: async (id: string, params?: { page?: number; limit?: number }): Promise<JobsResponse> => {
    try {
      const { data } = await axiosInstance.get<JobsResponse>(`/categories/${id}/jobs`, { params });
      return data;
    } catch (error) {
      return { success: false, data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };
    }
  },
};

// ============================================
// CHAT API
// ============================================

export const chatApi = {
  getRooms: async (): Promise<ApiResponse<ChatRoom[]>> => {
    try {
      const { data } = await axiosInstance.get<ApiResponse<ChatRoom[]>>('/chat/rooms');
      return data;
    } catch (error) {
      return { success: false, error: handleError(error) };
    }
  },

  createRoom: async (userId: string, jobId?: string): Promise<ApiResponse<{ id: string }>> => {
    try {
      const { data } = await axiosInstance.post<ApiResponse<{ id: string }>>('/chat/rooms', { userId, jobId });
      return data;
    } catch (error) {
      return { success: false, error: handleError(error) };
    }
  },

  getMessages: async (roomId: string, params?: { before?: string; limit?: number }): Promise<ApiResponse<ChatMessage[]>> => {
    try {
      const { data } = await axiosInstance.get<ApiResponse<ChatMessage[]>>(`/chat/rooms/${roomId}/messages`, { params });
      return data;
    } catch (error) {
      return { success: false, error: handleError(error) };
    }
  },

  sendMessage: async (roomId: string, content: string, type?: string): Promise<ApiResponse<ChatMessage>> => {
    try {
      const { data } = await axiosInstance.post<ApiResponse<ChatMessage>>(`/chat/rooms/${roomId}/messages`, { content, type });
      return data;
    } catch (error) {
      return { success: false, error: handleError(error) };
    }
  },

  markAsRead: async (roomId: string): Promise<ApiResponse<null>> => {
    try {
      await axiosInstance.put(`/chat/rooms/${roomId}/read`);
      return { success: true };
    } catch (error) {
      return { success: false, error: handleError(error) };
    }
  },

  getUnreadCount: async (): Promise<ApiResponse<{ count: number }>> => {
    try {
      const { data } = await axiosInstance.get<ApiResponse<{ count: number }>>('/chat/unread-count');
      return data;
    } catch (error) {
      return { success: false, error: handleError(error) };
    }
  },
};

// ============================================
// NOTIFICATIONS API
// ============================================

export const notificationsApi = {
  getAll: async (params?: { unreadOnly?: string; page?: number; limit?: number }): Promise<NotificationsResponse> => {
    try {
      const { data } = await axiosInstance.get<NotificationsResponse>('/notifications', { params });
      return data;
    } catch (error) {
      return { success: false, data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }, unreadCount: 0 };
    }
  },

  getUnreadCount: async (): Promise<ApiResponse<{ count: number }>> => {
    try {
      const { data } = await axiosInstance.get<ApiResponse<{ count: number }>>('/notifications/unread-count');
      return data;
    } catch (error) {
      return { success: false, error: handleError(error) };
    }
  },

  markAsRead: async (id: string): Promise<ApiResponse<Notification>> => {
    try {
      const { data } = await axiosInstance.put<ApiResponse<Notification>>(`/notifications/${id}/read`);
      return data;
    } catch (error) {
      return { success: false, error: handleError(error) };
    }
  },

  markAllAsRead: async (): Promise<ApiResponse<null>> => {
    try {
      await axiosInstance.put('/notifications/read-all');
      return { success: true };
    } catch (error) {
      return { success: false, error: handleError(error) };
    }
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    try {
      await axiosInstance.delete(`/notifications/${id}`);
      return { success: true };
    } catch (error) {
      return { success: false, error: handleError(error) };
    }
  },

  deleteAll: async (): Promise<ApiResponse<null>> => {
    try {
      await axiosInstance.delete('/notifications');
      return { success: true };
    } catch (error) {
      return { success: false, error: handleError(error) };
    }
  },
};

// ============================================
// ADMIN API
// ============================================

export const adminApi = {
  getStats: async (): Promise<ApiResponse<DashboardStats>> => {
    try {
      const { data } = await axiosInstance.get<ApiResponse<DashboardStats>>('/admin/stats');
      return data;
    } catch (error) {
      return { success: false, error: handleError(error) };
    }
  },

  getUsers: async (params?: { search?: string; role?: string; isVerified?: string; page?: number; limit?: number }): Promise<UsersResponse> => {
    try {
      const { data } = await axiosInstance.get<UsersResponse>('/admin/users', { params });
      return data;
    } catch (error) {
      return { success: false, data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };
    }
  },

  updateUserRole: async (id: string, role: string): Promise<ApiResponse<User>> => {
    try {
      const { data } = await axiosInstance.put<ApiResponse<User>>(`/admin/users/${id}/role`, { role });
      return data;
    } catch (error) {
      return { success: false, error: handleError(error) };
    }
  },

  verifyUser: async (id: string, isVerified: boolean): Promise<ApiResponse<User>> => {
    try {
      const { data } = await axiosInstance.put<ApiResponse<User>>(`/admin/users/${id}/verify`, { isVerified });
      return data;
    } catch (error) {
      return { success: false, error: handleError(error) };
    }
  },

  blockUser: async (id: string, isBlocked: boolean, blockReason?: string): Promise<ApiResponse<User>> => {
    try {
      const { data } = await axiosInstance.put<ApiResponse<User>>(`/admin/users/${id}/block`, { isBlocked, blockReason });
      return data;
    } catch (error) {
      return { success: false, error: handleError(error) };
    }
  },

  deleteUser: async (id: string): Promise<ApiResponse<null>> => {
    try {
      await axiosInstance.delete(`/admin/users/${id}`);
      return { success: true };
    } catch (error) {
      return { success: false, error: handleError(error) };
    }
  },

  getJobs: async (params?: { search?: string; status?: string; page?: number; limit?: number }): Promise<JobsResponse> => {
    try {
      const { data } = await axiosInstance.get<JobsResponse>('/admin/jobs', { params });
      return data;
    } catch (error) {
      return { success: false, data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };
    }
  },

  updateJobStatus: async (id: string, status: string, rejectionReason?: string): Promise<ApiResponse<Job>> => {
    try {
      const { data } = await axiosInstance.put<ApiResponse<Job>>(`/admin/jobs/${id}/status`, { status, rejectionReason });
      return data;
    } catch (error) {
      return { success: false, error: handleError(error) };
    }
  },

  deleteJob: async (id: string): Promise<ApiResponse<null>> => {
    try {
      await axiosInstance.delete(`/admin/jobs/${id}`);
      return { success: true };
    } catch (error) {
      return { success: false, error: handleError(error) };
    }
  },

  getCategories: async (): Promise<ApiResponse<Category[]>> => {
    try {
      const { data } = await axiosInstance.get<ApiResponse<Category[]>>('/admin/categories');
      return data;
    } catch (error) {
      return { success: false, error: handleError(error) };
    }
  },

  createCategory: async (categoryData: Partial<Category>): Promise<ApiResponse<Category>> => {
    try {
      const { data } = await axiosInstance.post<ApiResponse<Category>>('/admin/categories', categoryData);
      return data;
    } catch (error) {
      return { success: false, error: handleError(error) };
    }
  },

  updateCategory: async (id: string, categoryData: Partial<Category>): Promise<ApiResponse<Category>> => {
    try {
      const { data } = await axiosInstance.put<ApiResponse<Category>>(`/admin/categories/${id}`, categoryData);
      return data;
    } catch (error) {
      return { success: false, error: handleError(error) };
    }
  },

  deleteCategory: async (id: string): Promise<ApiResponse<null>> => {
    try {
      await axiosInstance.delete(`/admin/categories/${id}`);
      return { success: true };
    } catch (error) {
      return { success: false, error: handleError(error) };
    }
  },
};

// ============================================
// EXPORT ALL
// ============================================

export const api = {
  auth: authApi,
  jobs: jobsApi,
  applications: applicationsApi,
  users: usersApi,
  categories: categoriesApi,
  chat: chatApi,
  notifications: notificationsApi,
  admin: adminApi,
};

export default api;

