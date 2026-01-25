import type {
  ApiResponse,
  Application,
  ApplicationsResponse,
  Category,
  ChatMessage,
  ChatRoom,
  DashboardStats,
  Job,
  JobsResponse,
  Notification,
  NotificationsResponse,
  Pagination,
  Report,
  User,
  UsersResponse
} from '@/types';
import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

// ============================================
// AXIOS INSTANCE
// ============================================

// Production and development API URL
const getApiUrl = () => {
  // Production - vakans.uz
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;

    // Production domain
    if (hostname === 'vakans.uz' || hostname === 'www.vakans.uz') {
      return 'https://vakans.uz/api';
    }

    // Server IP
    if (hostname === '77.237.239.235') {
      return `http://77.237.239.235:5000/api`;
    }

    // Other network IPs (dev)
    if (hostname !== 'localhost') {
      return `http://${hostname}:5000/api`;
    }
  }

  // Local development - use proxy
  return import.meta.env.VITE_API_URL || '/api';
};

const API_URL = getApiUrl();
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
    // Token localStorage'dan olinadi
    const token = localStorage.getItem('vakans_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
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

    // 401 xatosi - faqat auth refresh bilan ishlash
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Auth endpointlarida refresh qilmaslik
      const isAuthEndpoint = originalRequest.url?.includes('/auth/');
      if (isAuthEndpoint) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => axiosInstance(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axiosInstance.post('/auth/refresh');
        if (data.accessToken) {
          localStorage.setItem('vakans_token', data.accessToken);
        }
        processQueue(null);
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as AxiosError);
        // Refresh xatosi bo'lsa, token va user o'chiriladi - qayta login kerak
        localStorage.removeItem('vakans_token');
        localStorage.removeItem('vakans_user');
        // Sahifani yangilash (login sahifasiga yo'naltirish uchun)
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
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
    const message = error.response?.data?.message;
    if (Array.isArray(message)) {
      return message.join(', ');
    }
    return message || error.response?.data?.error || error.message || 'Xatolik yuz berdi';
  }
  return 'Xatolik yuz berdi';
}

// Transform backend user response to frontend format
// Backend sends role as 'WORKER', 'EMPLOYER', 'ADMIN' (uppercase)
// Frontend expects 'worker', 'employer', 'admin' (lowercase)
function transformUser(backendUser: Record<string, unknown>): User {
  return {
    ...backendUser,
    role: (backendUser.role as string)?.toLowerCase() as 'worker' | 'employer' | 'admin',
  } as User;
}

// Transform job from backend
function transformJob(backendJob: Record<string, unknown>): Job {
  return {
    ...backendJob,
    workType: (backendJob.workType as string)?.toLowerCase().replace('_', '-') as Job['workType'],
    status: (backendJob.status as string)?.toLowerCase() as Job['status'],
  } as Job;
}

// Transform application from backend
// Backend: { job: { title, employer: { companyName, firstName } }, worker: { firstName, lastName } }
// Frontend: { jobTitle, employerName, applicantName }
function transformApplication(backendApp: Record<string, unknown>): Application {
  const job = backendApp.job as Record<string, unknown> | undefined;
  const worker = backendApp.worker as Record<string, unknown> | undefined;
  const employer = job?.employer as Record<string, unknown> | undefined;

  return {
    // Asosiy maydonlar
    id: backendApp.id,
    jobId: backendApp.jobId,
    workerId: backendApp.workerId,
    coverLetter: backendApp.coverLetter,
    resumeUrl: backendApp.resumeUrl,
    employerNotes: backendApp.employerNotes,
    rejectionReason: backendApp.rejectionReason,
    viewedAt: backendApp.viewedAt,
    respondedAt: backendApp.respondedAt,
    createdAt: backendApp.createdAt,
    updatedAt: backendApp.updatedAt,
    status: (backendApp.status as string)?.toLowerCase() as Application['status'],

    // Job ma'lumotlari
    jobTitle: job?.title as string || 'Noma\'lum ish',
    jobDescription: job?.description as string,
    jobLocation: job?.location as string || job?.region as string,
    jobRegion: job?.region as string,
    jobSalaryMin: job?.salaryMin as number,
    jobSalaryMax: job?.salaryMax as number,
    jobWorkType: (job?.workType as string)?.toLowerCase().replace('_', '-'),

    // Employer ma'lumotlari
    employerId: employer?.id as string,
    companyName: employer?.companyName as string,
    companyLogo: employer?.companyLogo as string || employer?.avatar as string,
    employerName: employer?.companyName as string ||
      `${employer?.firstName || ''} ${employer?.lastName || ''}`.trim() || 'Noma\'lum',
    employerFirstName: employer?.firstName as string,
    employerLastName: employer?.lastName as string,
    employerPhone: employer?.phone as string,
    employerAvatar: employer?.avatar as string,
    employerRegion: employer?.region as string,
    employerVerified: employer?.isVerified as boolean,

    // Worker/Applicant ma'lumotlari
    applicantName: `${worker?.firstName || ''} ${worker?.lastName || ''}`.trim() || 'Noma\'lum',
    applicantFirstName: worker?.firstName as string,
    applicantLastName: worker?.lastName as string,
    applicantPhone: worker?.phone as string,
    applicantAvatar: worker?.avatar as string,
    applicantEmail: worker?.email as string,
    applicantRegion: worker?.region as string,
    applicantSkills: worker?.skills as string[],
    applicantExperience: worker?.experienceYears as number,
    applicantBio: worker?.bio as string,

    // Legacy fields
    workerName: `${worker?.firstName || ''} ${worker?.lastName || ''}`.trim() || 'Noma\'lum',
    workerPhone: worker?.phone as string,
    workerAvatar: worker?.avatar as string,
    workerEmail: worker?.email as string,
  } as Application;
}

// ============================================
// AUTH API
// ============================================

export const authApi = {
  login: async (phone: string, password: string): Promise<ApiResponse<User>> => {
    try {
      const { data } = await axiosInstance.post<{ success: boolean; data: Record<string, unknown>; accessToken: string; error?: string }>('/auth/login', { phone, password });
      if (data.success && data.data) {
        // Token va user'ni saqlash
        if (data.accessToken) {
          localStorage.setItem('vakans_token', data.accessToken);
        }
        return { success: true, data: transformUser(data.data) };
      }
      return { success: false, error: data.error || 'Login muvaffaqiyatsiz' };
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
    try {
      // Backend WORKER/EMPLOYER kutadi (uppercase)
      const backendData = {
        ...userData,
        role: userData.role.toUpperCase(),
      };
      const { data } = await axiosInstance.post<{ success: boolean; data: Record<string, unknown>; accessToken: string; error?: string }>('/auth/register', backendData);
      if (data.success && data.data) {
        if (data.accessToken) {
          localStorage.setItem('vakans_token', data.accessToken);
        }
        return { success: true, data: transformUser(data.data) };
      }
      return { success: false, error: data.error || 'Ro\'yxatdan o\'tish muvaffaqiyatsiz' };
    } catch (error) {
      return { success: false, error: handleError(error) };
    }
  },

  logout: async (): Promise<ApiResponse<null>> => {
    try {
      await axiosInstance.post('/auth/logout');
      localStorage.removeItem('vakans_token');
      localStorage.removeItem('vakans_user');
      return { success: true };
    } catch (error) {
      localStorage.removeItem('vakans_token');
      localStorage.removeItem('vakans_user');
      return { success: false, error: handleError(error) };
    }
  },

  getMe: async (): Promise<ApiResponse<User>> => {
    try {
      const { data } = await axiosInstance.get<{ success: boolean; data: Record<string, unknown>; error?: string }>('/auth/me');
      if (data.success && data.data) {
        return { success: true, data: transformUser(data.data) };
      }
      return { success: false, error: data.error || 'Authentication failed' };
    } catch (error) {
      return { success: false, error: handleError(error) };
    }
  },

  refresh: async (): Promise<ApiResponse<null>> => {
    try {
      const { data } = await axiosInstance.post('/auth/refresh');
      if (data.accessToken) {
        localStorage.setItem('vakans_token', data.accessToken);
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: handleError(error) };
    }
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<ApiResponse<null>> => {
    try {
      await axiosInstance.post('/auth/change-password', { currentPassword, newPassword });
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
    location?: string;
    workType?: string;
    salaryMin?: number;
    salaryMax?: number;
    page?: number;
    limit?: number;
  }): Promise<JobsResponse> => {
    try {
      const { data } = await axiosInstance.get<JobsResponse>('/jobs', { params });
      // Transform jobs
      if (data.data) {
        data.data = data.data.map(job => transformJob(job as unknown as Record<string, unknown>));
      }
      return data;
    } catch (error) {
      return { success: false, data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };
    }
  },

  getById: async (id: string): Promise<ApiResponse<Job>> => {
    try {
      const { data } = await axiosInstance.get<ApiResponse<Record<string, unknown>>>(`/jobs/${id}`);
      if (data.success && data.data) {
        return { success: true, data: transformJob(data.data) };
      }
      return { success: false, error: 'Ish topilmadi' };
    } catch (error) {
      return { success: false, error: handleError(error) };
    }
  },

  create: async (jobData: {
    title: string;
    description: string;
    requirements?: string;
    salary?: number;
    salaryMax?: number;
    region?: string;
    workType?: string;
    experienceRequired?: string;
    category?: string;
    location?: string;
    address?: string;
    benefits?: string[];
  }): Promise<ApiResponse<Job>> => {
    try {
      // Backend formatiga o'zgartirish
      const backendData = {
        title: jobData.title,
        description: jobData.description,
        requirements: jobData.requirements ? jobData.requirements.split('\n').filter(r => r.trim()) : undefined,
        salaryMin: jobData.salary,
        salaryMax: jobData.salaryMax,
        region: jobData.region,
        location: jobData.location || jobData.region,
        workType: jobData.workType?.toUpperCase().replace('-', '_') || 'FULL_TIME',
        experienceRequired: jobData.experienceRequired,
        categoryId: jobData.category || undefined,
        address: jobData.address,
        benefits: jobData.benefits,
        salaryType: 'MONTHLY',
        currency: 'UZS',
      };
      const { data } = await axiosInstance.post<{ success: boolean; data: Record<string, unknown>; message?: string }>('/jobs', backendData);
      if (data.success && data.data) {
        return { success: true, data: transformJob(data.data) };
      }
      return { success: false, error: 'Ish yaratilmadi' };
    } catch (error) {
      return { success: false, error: handleError(error) };
    }
  },

  update: async (id: string, jobData: Partial<Job>): Promise<ApiResponse<Job>> => {
    try {
      const backendData = {
        ...jobData,
        workType: jobData.workType?.toUpperCase().replace('-', '_'),
      };
      const { data } = await axiosInstance.put<ApiResponse<Record<string, unknown>>>(`/jobs/${id}`, backendData);
      if (data.success && data.data) {
        return { success: true, data: transformJob(data.data) };
      }
      return { success: false, error: 'Ish yangilanmadi' };
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

  getMyJobs: async (params?: { page?: number; limit?: number }): Promise<JobsResponse> => {
    try {
      const { data } = await axiosInstance.get<JobsResponse>('/jobs/my', { params });
      if (data.data) {
        data.data = data.data.map(job => transformJob(job as unknown as Record<string, unknown>));
      }
      return data;
    } catch (error) {
      return { success: false, data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };
    }
  },

  getSavedJobs: async (params?: { page?: number; limit?: number }): Promise<JobsResponse> => {
    try {
      const { data } = await axiosInstance.get<JobsResponse>('/jobs/saved', { params });
      if (data.data) {
        data.data = data.data.map(job => transformJob(job as unknown as Record<string, unknown>));
      }
      return data;
    } catch (error) {
      return { success: false, data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };
    }
  },

  saveJob: async (id: string): Promise<ApiResponse<{ saved: boolean }>> => {
    try {
      const { data } = await axiosInstance.post<{ success: boolean; data: { saved: boolean } }>(`/jobs/${id}/save`);
      if (data.success) {
        return { success: true, data: data.data };
      }
      return { success: true, data: { saved: true } };
    } catch (error) {
      return { success: false, error: handleError(error) };
    }
  },

  unsaveJob: async (id: string): Promise<ApiResponse<{ saved: boolean }>> => {
    // Backend POST orqali toggle qiladi - bir xil endpoint
    try {
      const { data } = await axiosInstance.post<{ success: boolean; data: { saved: boolean } }>(`/jobs/${id}/save`);
      if (data.success) {
        return { success: true, data: data.data };
      }
      return { success: true, data: { saved: false } };
    } catch (error) {
      return { success: false, error: handleError(error) };
    }
  },

  // Public stats for Landing Page
  getPublicStats: async (): Promise<ApiResponse<{
    totalJobs: number;
    totalUsers: number;
    totalCompanies: number;
    satisfactionRate: number;
  }>> => {
    try {
      const { data } = await axiosInstance.get('/jobs/public/stats');
      return data;
    } catch (error) {
      return { success: false, error: handleError(error) };
    }
  },

  // Featured jobs for Landing Page
  getFeaturedJobs: async (limit = 6): Promise<ApiResponse<Array<{
    id: string;
    title: string;
    company: string;
    salary: string;
    location: string;
    type: string;
  }>>> => {
    try {
      const { data } = await axiosInstance.get(`/jobs/public/featured?limit=${limit}`);
      return data;
    } catch (error) {
      return { success: false, error: handleError(error) };
    }
  },
  likeJob: async (id: string): Promise<ApiResponse<null>> => {
    try {
      await axiosInstance.post(`/jobs/${id}/like`);
      return { success: true };
    } catch (error) {
      return { success: false, error: handleError(error) };
    }
  },

  dislikeJob: async (id: string): Promise<ApiResponse<null>> => {
    try {
      await axiosInstance.post(`/jobs/${id}/dislike`);
      return { success: true };
    } catch (error) {
      return { success: false, error: handleError(error) };
    }
  },

  updateStatus: async (id: string, status: 'ACTIVE' | 'CLOSED' | 'PENDING'): Promise<ApiResponse<Job>> => {
    try {
      const { data } = await axiosInstance.put<ApiResponse<Record<string, unknown>>>(`/jobs/${id}/status`, { status });
      if (data.success && data.data) {
        return { success: true, data: transformJob(data.data) };
      }
      return { success: false, error: 'Status yangilanmadi' };
    } catch (error) {
      return { success: false, error: handleError(error) };
    }
  },
};

// ============================================
// APPLICATIONS API
// ============================================

export const applicationsApi = {
  apply: async (jobId: string, coverLetter?: string): Promise<ApiResponse<Application> & { alreadyApplied?: boolean }> => {
    try {
      const { data } = await axiosInstance.post<Application | ApiResponse<Application>>('/applications', { jobId, coverLetter });
      // Backend to'g'ridan-to'g'ri application object qaytaradi yoki { success, data } formatda
      if ('success' in data) {
        return data as ApiResponse<Application>;
      }
      // To'g'ridan-to'g'ri application object qaytarilsa
      return { success: true, data: data as Application };
    } catch (error) {
      // 409 Conflict - allaqachon ariza yuborilgan
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        return { success: false, error: 'Siz bu ishga allaqachon ariza topshirgansiz', alreadyApplied: true };
      }
      return { success: false, error: handleError(error) };
    }
  },

  getMyApplications: async (params?: { page?: number; limit?: number }): Promise<ApplicationsResponse> => {
    try {
      const { data } = await axiosInstance.get<{ applications: Record<string, unknown>[]; pagination: { page: number; limit: number; total: number; totalPages: number } } | ApplicationsResponse>('/applications/my', { params });
      // Backend { applications, pagination } formatda qaytaradi
      if ('applications' in data) {
        const transformedApps = data.applications.map(app => transformApplication(app));
        return { success: true, data: transformedApps, pagination: data.pagination };
      }
      return data as ApplicationsResponse;
    } catch (error) {
      return { success: false, data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };
    }
  },

  getReceivedApplications: async (params?: { jobId?: string; status?: string; page?: number; limit?: number }): Promise<ApplicationsResponse> => {
    try {
      const { data } = await axiosInstance.get<{ applications: Record<string, unknown>[]; pagination: { page: number; limit: number; total: number; totalPages: number } } | ApplicationsResponse>('/applications/received', { params });
      // Backend { applications, pagination } formatda qaytaradi
      if ('applications' in data) {
        const transformedApps = data.applications.map(app => transformApplication(app));
        return { success: true, data: transformedApps, pagination: data.pagination };
      }
      return data as ApplicationsResponse;
    } catch (error) {
      return { success: false, data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };
    }
  },

  getById: async (id: string): Promise<ApiResponse<Application>> => {
    try {
      const { data } = await axiosInstance.get<ApiResponse<Application>>(`/applications/${id}`);
      return data;
    } catch (error) {
      return { success: false, error: handleError(error) };
    }
  },

  updateStatus: async (id: string, status: string): Promise<ApiResponse<Application>> => {
    try {
      console.log('Updating application status:', id, status.toUpperCase());
      const { data } = await axiosInstance.put<ApiResponse<Application>>(`/applications/${id}/status`, { status: status.toUpperCase() });
      console.log('Update response:', data);
      return data;
    } catch (error: any) {
      console.error('Update status error:', error.response?.data);
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

  checkIfApplied: async (jobId: string): Promise<ApiResponse<{ applied: boolean; applicationId?: string }>> => {
    try {
      const { data } = await axiosInstance.get<{ hasApplied: boolean; applicationId?: string }>(`/applications/check/${jobId}`);
      return { success: true, data: { applied: data.hasApplied, applicationId: data.applicationId } };
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
      const { data } = await axiosInstance.get<ApiResponse<Record<string, unknown>>>('/auth/me');
      if (data.success && data.data) {
        return { success: true, data: transformUser(data.data) };
      }
      return { success: false, error: 'Profil topilmadi' };
    } catch (error) {
      return { success: false, error: handleError(error) };
    }
  },

  updateProfile: async (profileData: Partial<User>): Promise<ApiResponse<User>> => {
    try {
      const { data } = await axiosInstance.put<ApiResponse<Record<string, unknown>>>('/users/profile', profileData);
      if (data.success && data.data) {
        return { success: true, data: transformUser(data.data) };
      }
      return { success: false, error: 'Profil yangilanmadi' };
    } catch (error) {
      return { success: false, error: handleError(error) };
    }
  },

  getById: async (id: string): Promise<ApiResponse<User>> => {
    try {
      const { data } = await axiosInstance.get<ApiResponse<Record<string, unknown>>>(`/users/${id}`);
      if (data.success && data.data) {
        return { success: true, data: transformUser(data.data) };
      }
      return { success: false, error: 'Foydalanuvchi topilmadi' };
    } catch (error) {
      return { success: false, error: handleError(error) };
    }
  },

  uploadAvatar: async (file: File): Promise<ApiResponse<{ url: string }>> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await axiosInstance.post('/upload/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      // Backend turli formatda javob qaytarishi mumkin
      if (data.success && data.data) {
        return { success: true, data: { url: data.data.url } };
      }
      // Agar to'g'ridan-to'g'ri data.url qaytarsa
      if (data.url) {
        return { success: true, data: { url: data.url } };
      }
      return { success: false, error: data.error || 'Avatar yuklashda xatolik' };
    } catch (error) {
      console.error('Avatar upload error:', error);
      return { success: false, error: handleError(error) };
    }
  },

  uploadResume: async (file: File): Promise<ApiResponse<{ url: string }>> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await axiosInstance.post<{ success: boolean; data: { url: string; filename: string; size: number }; error?: string }>('/upload/resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (data.success && data.data) {
        return { success: true, data: { url: data.data.url } };
      }
      return { success: false, error: data.error || 'Rezyume yuklashda xatolik' };
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
    try {
      const { data } = await axiosInstance.get<ApiResponse<Category[]>>('/categories');
      return data;
    } catch (error) {
      return { success: false, error: handleError(error) };
    }
  },

  getById: async (id: string): Promise<ApiResponse<Category>> => {
    try {
      const { data } = await axiosInstance.get<ApiResponse<Category>>(`/categories/${id}`);
      return data;
    } catch (error) {
      return { success: false, error: handleError(error) };
    }
  },
};

// ============================================
// CHAT API
// ============================================

export const chatApi = {
  getRooms: async (): Promise<ApiResponse<ChatRoom[]>> => {
    try {
      const { data } = await axiosInstance.get<ChatRoom[]>('/chat/rooms');
      // Transform backend response
      const rooms = (data || []).map((room: any) => ({
        ...room,
        participants: room.participants || [],
        lastMessage: room.lastMessage?.content || room.messages?.[0]?.content || '',
        lastMessageAt: room.lastMessage?.createdAt || room.messages?.[0]?.createdAt || room.updatedAt,
      }));
      return { success: true, data: rooms };
    } catch (error) {
      return { success: false, error: handleError(error) };
    }
  },

  createRoom: async (participantId: string, jobId?: string): Promise<ApiResponse<ChatRoom>> => {
    try {
      const { data } = await axiosInstance.post<ChatRoom>('/chat/rooms', { participantId, jobId });
      return { success: true, data };
    } catch (error) {
      return { success: false, error: handleError(error) };
    }
  },

  getMessages: async (roomId: string, params?: { before?: string; limit?: number }): Promise<ApiResponse<ChatMessage[]>> => {
    try {
      // Request all messages (max 200) by default
      const queryParams = { limit: 200, ...params };
      const { data } = await axiosInstance.get<{ messages: any[]; pagination: any }>(`/chat/rooms/${roomId}/messages`, { params: queryParams });
      // Transform backend response (chatRoomId -> roomId, content stays same)
      const messages = (data.messages || []).map((msg: any) => ({
        ...msg,
        roomId: msg.chatRoomId || roomId,
        content: msg.content || msg.message || '',
      }));
      return { success: true, data: messages };
    } catch (error) {
      return { success: false, error: handleError(error) };
    }
  },

  sendMessage: async (roomId: string, content: string): Promise<ApiResponse<ChatMessage>> => {
    try {
      const { data } = await axiosInstance.post<any>(`/chat/rooms/${roomId}/messages`, { content });
      // Transform response
      const message: ChatMessage = {
        ...data,
        roomId: data.chatRoomId || roomId,
        content: data.content || data.message || content,
      };
      return { success: true, data: message };
    } catch (error) {
      return { success: false, error: handleError(error) };
    }
  },

  markAsRead: async (roomId: string): Promise<ApiResponse<null>> => {
    try {
      await axiosInstance.post(`/chat/rooms/${roomId}/read`);
      return { success: true };
    } catch (error) {
      return { success: false, error: handleError(error) };
    }
  },

  deleteMessage: async (messageId: string): Promise<ApiResponse<null>> => {
    try {
      await axiosInstance.delete(`/chat/messages/${messageId}`);
      return { success: true };
    } catch (error) {
      return { success: false, error: handleError(error) };
    }
  },

  getUnreadCount: async (): Promise<ApiResponse<number>> => {
    try {
      const { data } = await axiosInstance.get<ApiResponse<number>>('/chat/unread-count');
      return data;
    } catch (error) {
      return { success: false, data: 0, error: handleError(error) };
    }
  },
};

// ============================================
// NOTIFICATIONS API
// ============================================

export const notificationsApi = {
  getAll: async (params?: { page?: number; limit?: number; unreadOnly?: boolean }): Promise<NotificationsResponse> => {
    try {
      const { data } = await axiosInstance.get<{ notifications: Notification[]; pagination: Pagination; unreadCount: number }>('/notifications', { params });
      // Transform backend response to frontend format
      return {
        success: true,
        data: data.notifications || [],
        pagination: data.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 },
        unreadCount: data.unreadCount || 0,
      };
    } catch (error) {
      return { success: false, data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }, unreadCount: 0 };
    }
  },

  markAsRead: async (id: string): Promise<ApiResponse<Notification>> => {
    try {
      const { data } = await axiosInstance.post<ApiResponse<Notification>>(`/notifications/${id}/read`);
      return data;
    } catch (error) {
      return { success: false, error: handleError(error) };
    }
  },

  markAllAsRead: async (): Promise<ApiResponse<null>> => {
    try {
      await axiosInstance.post('/notifications/read-all');
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

  getUnreadCount: async (): Promise<ApiResponse<{ unreadCount: number }>> => {
    try {
      const { data } = await axiosInstance.get<{ unreadCount: number }>('/notifications/unread-count');
      return { success: true, data };
    } catch (error) {
      return { success: false, data: { unreadCount: 0 }, error: handleError(error) };
    }
  },
};

// ============================================
// ADMIN API
// ============================================

export const adminApi = {
  getDashboard: async (): Promise<ApiResponse<DashboardStats>> => {
    try {
      const { data } = await axiosInstance.get<DashboardStats>('/admin/dashboard');
      // Backend to'g'ridan-to'g'ri data qaytaradi, success wrapper yo'q
      return { success: true, data };
    } catch (error) {
      return { success: false, error: handleError(error) };
    }
  },

  getAnalytics: async (period?: string): Promise<ApiResponse<Record<string, unknown>>> => {
    try {
      const { data } = await axiosInstance.get<Record<string, unknown>>('/admin/analytics', { params: { period } });
      return { success: true, data };
    } catch (error) {
      return { success: false, error: handleError(error) };
    }
  },

  getUsers: async (params?: { search?: string; role?: string; isVerified?: string; page?: number; limit?: number }): Promise<UsersResponse> => {
    try {
      const { data } = await axiosInstance.get<{ users: Array<Record<string, unknown>>; pagination: { page: number; limit: number; total: number; totalPages: number } }>('/admin/users', { params });
      // Transform users and wrap in expected format
      return {
        success: true,
        data: data.users.map(u => transformUser(u)),
        pagination: data.pagination
      };
    } catch (error) {
      return { success: false, data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };
    }
  },

  verifyUser: async (id: string): Promise<ApiResponse<User>> => {
    try {
      const { data } = await axiosInstance.put<Record<string, unknown>>(`/admin/users/${id}/verify`);
      return { success: true, data: transformUser(data) };
    } catch (error) {
      return { success: false, error: handleError(error) };
    }
  },

  blockUser: async (id: string, reason?: string): Promise<ApiResponse<User>> => {
    try {
      const { data } = await axiosInstance.put<Record<string, unknown>>(`/admin/users/${id}/block`, { reason });
      return { success: true, data: transformUser(data) };
    } catch (error) {
      return { success: false, error: handleError(error) };
    }
  },

  unblockUser: async (id: string): Promise<ApiResponse<User>> => {
    try {
      const { data } = await axiosInstance.put<Record<string, unknown>>(`/admin/users/${id}/unblock`);
      return { success: true, data: transformUser(data) };
    } catch (error) {
      return { success: false, error: handleError(error) };
    }
  },

  updateUser: async (id: string, userData: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    password?: string;
    role?: string;
    region?: string;
    isVerified?: boolean;
    isBlocked?: boolean;
  }): Promise<ApiResponse<User>> => {
    try {
      const { data } = await axiosInstance.put<Record<string, unknown>>(`/admin/users/${id}`, userData);
      return { success: true, data: transformUser(data) };
    } catch (error) {
      return { success: false, error: handleError(error) };
    }
  },

  getUserById: async (id: string): Promise<ApiResponse<User>> => {
    try {
      const { data } = await axiosInstance.get<Record<string, unknown>>(`/admin/users/${id}`);
      return { success: true, data: transformUser(data) };
    } catch (error) {
      return { success: false, error: handleError(error) };
    }
  },

  getPendingJobs: async (params?: { page?: number; limit?: number }): Promise<JobsResponse> => {
    try {
      const { data } = await axiosInstance.get<{ jobs: Array<Record<string, unknown>>; pagination: { page: number; limit: number; total: number; totalPages: number } }>('/admin/jobs/pending', { params });
      return {
        success: true,
        data: data.jobs ? data.jobs.map(job => transformJob(job)) : [],
        pagination: data.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 }
      };
    } catch (error) {
      return { success: false, data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };
    }
  },

  getAllJobs: async (params?: { page?: number; limit?: number; status?: string }): Promise<JobsResponse> => {
    try {
      const { data } = await axiosInstance.get<{ jobs: Array<Record<string, unknown>>; pagination: { page: number; limit: number; total: number; totalPages: number } }>('/admin/jobs', { params });
      return {
        success: true,
        data: data.jobs ? data.jobs.map(job => transformJob(job)) : [],
        pagination: data.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 }
      };
    } catch (error) {
      return { success: false, data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };
    }
  },

  approveJob: async (id: string): Promise<ApiResponse<Job>> => {
    try {
      const { data } = await axiosInstance.put<Record<string, unknown>>(`/admin/jobs/${id}/approve`);
      return { success: true, data: transformJob(data) };
    } catch (error) {
      return { success: false, error: handleError(error) };
    }
  },

  rejectJob: async (id: string, reason?: string): Promise<ApiResponse<Job>> => {
    try {
      const { data } = await axiosInstance.put<Record<string, unknown>>(`/admin/jobs/${id}/reject`, { reason });
      return { success: true, data: transformJob(data) };
    } catch (error) {
      return { success: false, error: handleError(error) };
    }
  },

  featureJob: async (id: string): Promise<ApiResponse<Job>> => {
    try {
      const { data } = await axiosInstance.put<Record<string, unknown>>(`/admin/jobs/${id}/feature`);
      return { success: true, data: transformJob(data) };
    } catch (error) {
      return { success: false, error: handleError(error) };
    }
  },

  unfeatureJob: async (id: string): Promise<ApiResponse<Job>> => {
    try {
      const { data } = await axiosInstance.put<Record<string, unknown>>(`/admin/jobs/${id}/unfeature`);
      return { success: true, data: transformJob(data) };
    } catch (error) {
      return { success: false, error: handleError(error) };
    }
  },

  broadcastNotification: async (notification: { title: string; message: string; type?: string; targetRole?: string }): Promise<ApiResponse<null>> => {
    try {
      await axiosInstance.post('/admin/notifications/broadcast', notification);
      return { success: true };
    } catch (error) {
      return { success: false, error: handleError(error) };
    }
  },

  clearCache: async (): Promise<ApiResponse<null>> => {
    try {
      await axiosInstance.post('/admin/cache/clear');
      return { success: true };
    } catch (error) {
      return { success: false, error: handleError(error) };
    }
  },

  // Chat Management
  getChats: async (params?: { page?: number; limit?: number; search?: string }): Promise<ApiResponse<{ data: any[]; pagination: any }>> => {
    try {
      const { data } = await axiosInstance.get('/admin/chats', { params });
      return { success: true, data };
    } catch (error) {
      return { success: false, error: handleError(error) };
    }
  },

  getChatMessages: async (roomId: string, params?: { page?: number; limit?: number }): Promise<ApiResponse<{ room: any; messages: any[]; pagination: any }>> => {
    try {
      const { data } = await axiosInstance.get(`/admin/chats/${roomId}`, { params });
      return { success: true, data };
    } catch (error) {
      return { success: false, error: handleError(error) };
    }
  },

  deleteChat: async (roomId: string): Promise<ApiResponse<null>> => {
    try {
      await axiosInstance.post(`/admin/chats/${roomId}/delete`);
      return { success: true };
    } catch (error) {
      return { success: false, error: handleError(error) };
    }
  },

  deleteChatMessage: async (messageId: string): Promise<ApiResponse<null>> => {
    try {
      await axiosInstance.post(`/admin/chats/messages/${messageId}/delete`);
      return { success: true };
    } catch (error) {
      return { success: false, error: handleError(error) };
    }
  },

  // Reports Management
  getReports: async (params?: { page?: number; limit?: number; status?: string; type?: string; search?: string }): Promise<ApiResponse<{ data: Report[]; pagination: Pagination }>> => {
    try {
      const { data } = await axiosInstance.get('/reports', { params });
      return { success: true, data: { data: data.data || [], pagination: data.pagination } };
    } catch (error) {
      return { success: false, error: handleError(error) };
    }
  },

  getReportStats: async (): Promise<ApiResponse<{ total: number; new: number; reviewing: number; resolved: number; dismissed: number }>> => {
    try {
      const { data } = await axiosInstance.get('/reports/stats');
      return { success: true, data: data.data };
    } catch (error) {
      return { success: false, error: handleError(error) };
    }
  },

  updateReport: async (id: string, update: { status?: string; adminNote?: string }): Promise<ApiResponse<Report>> => {
    try {
      const { data } = await axiosInstance.put(`/reports/${id}`, update);
      return { success: true, data: data.data };
    } catch (error) {
      return { success: false, error: handleError(error) };
    }
  },

  deleteReport: async (id: string): Promise<ApiResponse<null>> => {
    try {
      await axiosInstance.delete(`/reports/${id}`);
      return { success: true };
    } catch (error) {
      return { success: false, error: handleError(error) };
    }
  },
};

// ============================================
// REPORTS API (for users to submit reports)
// ============================================

export const reportsApi = {
  // Create a new report (any authenticated user)
  create: async (data: {
    type: 'SPAM' | 'INAPPROPRIATE' | 'FAKE' | 'FRAUD' | 'HARASSMENT' | 'OTHER';
    reason: string;
    description?: string;
    reportedId?: string;
    jobId?: string;
  }): Promise<ApiResponse<Report>> => {
    try {
      const { data: response } = await axiosInstance.post('/reports', data);
      return { success: true, data: response.data };
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
  reports: reportsApi,
};

export default api;

