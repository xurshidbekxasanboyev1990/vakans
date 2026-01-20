// ============================================
// TYPES - Backend bilan mos
// ============================================

// User Types
export interface User {
  id: string;
  phone: string;
  firstName: string;
  lastName?: string;
  role: 'worker' | 'employer' | 'admin';
  avatar?: string;
  email?: string;
  bio?: string;
  region?: string;
  location?: string;
  // Worker specific
  skills?: string[];
  experienceYears?: number;
  education?: string;
  languages?: string[];
  // Employer specific
  companyName?: string;
  companyDescription?: string;
  website?: string;
  // Status
  isVerified: boolean;
  isBlocked?: boolean;
  createdAt: string;
  updatedAt?: string;
}

// Job Types
export type WorkType = 'full-time' | 'part-time' | 'remote' | 'contract' | 'temporary';
export type SalaryType = 'hourly' | 'daily' | 'monthly' | 'fixed' | 'negotiable';
export type JobStatus = 'pending' | 'active' | 'rejected' | 'closed' | 'expired';

export interface Job {
  id: string;
  employerId: string;
  categoryId?: string;
  title: string;
  description: string;
  requirements?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryType: SalaryType;
  currency: string;
  location?: string;
  region: string;
  address?: string;
  type?: string;
  workType: WorkType;
  experienceRequired?: string;
  educationRequired?: string;
  languagesRequired?: string[];
  benefits?: string;
  contactPhone?: string;
  contactEmail?: string;
  isFeatured: boolean;
  isUrgent: boolean;
  status: JobStatus;
  viewsCount: number;
  applicationsCount: number;
  likesCount: number;
  dislikesCount: number;
  deadline?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt?: string;
  // Joined fields
  employerName?: string;
  employerAvatar?: string;
  companyName?: string;
  categoryName?: string;
  categoryIcon?: string;
  // User specific
  isSaved?: boolean;
  hasApplied?: boolean;
  userReaction?: 'like' | 'dislike' | null;
}

// Application Types
export type ApplicationStatus = 'pending' | 'viewed' | 'accepted' | 'rejected' | 'withdrawn';

export interface Application {
  id: string;
  jobId: string;
  workerId: string;
  coverLetter?: string;
  status: ApplicationStatus;
  employerNotes?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt?: string;
  // Joined fields
  jobTitle?: string;
  companyName?: string;
  employerName?: string;
  applicantName?: string;
  workerName?: string;
  workerPhone?: string;
  workerAvatar?: string;
  workerEmail?: string;
}

// Category Types
export interface Category {
  id: string;
  name: string;
  nameUz?: string;
  nameRu?: string;
  nameEn?: string;
  icon?: string;
  color?: string;
  jobCount: number;
  isActive: boolean;
}

// Chat Types
export interface ChatRoom {
  id: string;
  participant1Id: string;
  participant2Id: string;
  jobId?: string;
  lastMessageAt: string;
  createdAt: string;
  // Joined fields
  otherUserName?: string;
  otherUserAvatar?: string;
  otherUserId?: string;
  jobTitle?: string;
  unreadCount?: number;
  lastMessage?: string;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  // Joined fields
  senderName?: string;
  senderAvatar?: string;
}

// Notification Types
export type NotificationType = 
  | 'application_received' 
  | 'application_accepted' 
  | 'application_rejected' 
  | 'new_message' 
  | 'job_expired' 
  | 'job_approved'
  | 'system';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message?: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
}

// Dashboard Stats
export interface DashboardStats {
  // User stats
  totalUsers: number;
  workers: number;
  employers: number;
  admins: number;
  verifiedUsers: number;
  newUsersToday: number;
  newUsersWeek: number;
  newUsersMonth: number;
  // Job stats
  totalJobs: number;
  activeJobs: number;
  pendingJobs: number;
  closedJobs: number;
  newJobsToday: number;
  newJobsWeek: number;
  totalViews: number;
  // Application stats
  totalApplications: number;
  pendingApplications: number;
  acceptedApplications: number;
  rejectedApplications: number;
}

// Pagination
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: Pagination;
}

export interface JobsResponse {
  success: boolean;
  data: Job[];
  pagination: Pagination;
}

export interface ApplicationsResponse {
  success: boolean;
  data: Application[];
  pagination: Pagination;
}

export interface UsersResponse {
  success: boolean;
  data: User[];
  pagination: Pagination;
}

export interface NotificationsResponse {
  success: boolean;
  data: Notification[];
  pagination: Pagination;
  unreadCount: number;
}
