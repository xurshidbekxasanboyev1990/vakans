import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'UZS'): string {
  return new Intl.NumberFormat('uz-UZ', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

export function formatDate(date: string | Date): string {
  const d = new Date(date)
  return new Intl.DateTimeFormat('uz-UZ', { year: 'numeric', month: 'short', day: 'numeric' }).format(d)
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date()
  const d = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000)
  if (diffInSeconds < 60) return 'hozirgina'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} daqiqa oldin`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} soat oldin`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} kun oldin`
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} oy oldin`
  return `${Math.floor(diffInSeconds / 31536000)} yil oldin`
}

export function formatSalary(min?: number, max?: number, currency = 'UZS'): string {
  if (!min && !max) return 'Kelishiladi'
  if (min && max && min !== max) return `${formatCurrency(min, currency)} - ${formatCurrency(max, currency)}`
  const amount = min || max
  return amount ? formatCurrency(amount, currency) : 'Kelishiladi'
}

export function getSalaryDisplay(job: { salaryMin?: number; salaryMax?: number; salaryType: string; currency?: string }): string {
  const { salaryMin, salaryMax, salaryType, currency = 'UZS' } = job
  if (salaryType === 'negotiable' || (!salaryMin && !salaryMax)) return 'Kelishiladi'
  const typeLabels: Record<string, string> = { hourly: '/soat', daily: '/kun', monthly: '/oy', fixed: '' }
  const suffix = typeLabels[salaryType] || ''
  if (salaryMin && salaryMax && salaryMin !== salaryMax) return `${formatCurrency(salaryMin, currency)} - ${formatCurrency(salaryMax, currency)}${suffix}`
  const amount = salaryMin || salaryMax
  return amount ? `${formatCurrency(amount, currency)}${suffix}` : 'Kelishiladi'
}

export function getWorkTypeLabel(workType: string): string {
  const labels: Record<string, string> = { 'full-time': "To'liq stavka", 'part-time': 'Yarim stavka', 'remote': 'Masofaviy', 'contract': 'Shartnoma', 'temporary': 'Vaqtinchalik' }
  return labels[workType] || workType
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    accepted: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    closed: 'bg-secondary-100 text-secondary-800 dark:bg-secondary-900/30 dark:text-secondary-400',
    expired: 'bg-secondary-100 text-secondary-800 dark:bg-secondary-900/30 dark:text-secondary-400',
    viewed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    withdrawn: 'bg-secondary-100 text-secondary-800 dark:bg-secondary-900/30 dark:text-secondary-400',
  }
  return colors[status] || colors.pending
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = { pending: 'Kutilmoqda', active: 'Faol', approved: 'Tasdiqlangan', accepted: 'Qabul qilindi', rejected: 'Rad etildi', closed: 'Yopilgan', expired: "Muddati o'tgan", viewed: "Ko'rildi", withdrawn: 'Bekor qilindi' }
  return labels[status] || status
}

export const REGIONS = ['Toshkent shahri', 'Toshkent viloyati', 'Andijon', 'Buxoro', "Farg'ona", 'Jizzax', 'Namangan', 'Navoiy', 'Qashqadaryo', "Qoraqalpog'iston", 'Samarqand', 'Sirdaryo', 'Surxondaryo', 'Xorazm']

export function getInitials(name?: string): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

// Backend fayl URL ni to'liq URL ga aylantirish
export function getFileUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  // Agar allaqachon to'liq URL bo'lsa
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  // Backend API URL
  const apiBaseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || '';
  // Agar localhost bo'lmasa (tarmoqdan kirish), dinamik URL yasash
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return `http://${window.location.hostname}:5000${path.startsWith('/') ? path : '/' + path}`;
  }
  // Localhost uchun
  if (apiBaseUrl) {
    return `${apiBaseUrl.replace('/api', '')}${path.startsWith('/') ? path : '/' + path}`;
  }
  return `http://localhost:5000${path.startsWith('/') ? path : '/' + path}`;
}
