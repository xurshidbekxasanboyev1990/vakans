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
  address?: string;
  birthDate?: string;
  gender?: 'male' | 'female' | 'other';
  // Worker specific
  skills?: string[];
  experienceYears?: number;
  education?: string;
  educationLevel?: string;
  languages?: string[];
  certificates?: string[];
  portfolio?: string;
  linkedIn?: string;
  telegram?: string;
  desiredSalary?: number;
  desiredWorkType?: string;
  resume?: string;
  // Employer specific
  companyName?: string;
  companyDescription?: string;
  companyLogo?: string;
  website?: string;
  companySize?: string;
  industry?: string;
  foundedYear?: number;
  // Status
  isVerified: boolean;
  isBlocked?: boolean;
  lastOnline?: string;
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
  requirements?: string | string[];
  salaryMin?: number;
  salaryMax?: number;
  salaryType?: SalaryType;
  currency?: string;
  location?: string;
  region?: string;
  address?: string;
  type?: string;
  workType: WorkType;
  experienceRequired?: string;
  educationRequired?: string;
  languagesRequired?: string[];
  benefits?: string | string[];
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
  viewedAt?: string;
  respondedAt?: string;
  createdAt: string;
  updatedAt?: string;
  // Joined fields - Job
  jobTitle?: string;
  jobLocation?: string;
  jobRegion?: string;
  jobSalaryMin?: number;
  jobSalaryMax?: number;
  jobWorkType?: string;
  jobDescription?: string;
  // Joined fields - Employer
  employerId?: string;
  employerName?: string;
  employerFirstName?: string;
  employerLastName?: string;
  employerPhone?: string;
  employerAvatar?: string;
  companyName?: string;
  companyLogo?: string;
  employerRegion?: string;
  employerVerified?: boolean;
  // Joined fields - Worker
  applicantName?: string;
  applicantFirstName?: string;
  applicantLastName?: string;
  applicantPhone?: string;
  applicantAvatar?: string;
  applicantEmail?: string;
  applicantRegion?: string;
  applicantSkills?: string[];
  applicantExperience?: number;
  applicantBio?: string;
  // Legacy fields
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
  slug?: string;
  icon?: string;
  color?: string;
  jobCount?: number;
  jobsCount?: number;
  isActive?: boolean;
}

// Chat Types
export interface ChatRoom {
  id: string;
  participant1Id?: string;
  participant2Id?: string;
  jobId?: string;
  lastMessageAt?: string;
  createdAt: string;
  updatedAt?: string;
  // Joined fields
  participants?: Array<{
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    companyName?: string;
    role?: string;
  }>;
  otherParticipant?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    companyName?: string;
    role?: string;
  };
  job?: {
    id: string;
    title: string;
  };
  otherUserName?: string;
  otherUserAvatar?: string;
  otherUserId?: string;
  jobTitle?: string;
  unreadCount?: number;
  lastMessage?: string;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  chatId?: string; // deprecated, use roomId
  senderId: string;
  content: string;
  message?: string; // deprecated, use content
  isRead: boolean;
  createdAt: string;
  updatedAt?: string;
  // Joined fields
  senderName?: string;
  senderAvatar?: string;
}

// Notification Types
export type NotificationType =
  | 'application'
  | 'application_received'
  | 'application_accepted'
  | 'application_rejected'
  | 'message'
  | 'new_message'
  | 'job_match'
  | 'job_expired'
  | 'job_approved'
  | 'reminder'
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
  updatedAt?: string;
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
  todayUsers: number; // alias for newUsersToday
  // Job stats
  totalJobs: number;
  activeJobs: number;
  pendingJobs: number;
  closedJobs: number;
  newJobsToday: number;
  newJobsWeek: number;
  totalViews: number;
  todayJobs: number; // alias for newJobsToday
  // Application stats
  totalApplications: number;
  pendingApplications: number;
  acceptedApplications: number;
  rejectedApplications: number;
  todayApplications: number; // new today applications
  // Revenue
  revenue: number;
  growth: number;
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

// Report Types
export type ReportType = 'SPAM' | 'INAPPROPRIATE' | 'FAKE' | 'FRAUD' | 'HARASSMENT' | 'OTHER';
export type ReportStatus = 'NEW' | 'REVIEWING' | 'RESOLVED' | 'DISMISSED';

export interface Report {
  id: string;
  type: ReportType;
  reason: string;
  description?: string;
  reporterId: string;
  reportedId?: string;
  jobId?: string;
  status: ReportStatus;
  adminNote?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  createdAt: string;
  updatedAt?: string;
  // Enriched fields
  reporter?: string;
  reported?: string;
  jobTitle?: string;
}

export interface ReportsResponse {
  success: boolean;
  data: Report[];
  pagination: Pagination;
}
