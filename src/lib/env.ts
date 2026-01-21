/**
 * Environment configuration
 * Type-safe access to environment variables
 */

export const env = {
  // API Configuration
  apiUrl: import.meta.env.VITE_API_URL || '/api',
  apiVersion: import.meta.env.VITE_API_VERSION || 'v1',
  
  // Demo Mode
  demoMode: import.meta.env.VITE_DEMO_MODE === 'true',
  
  // App Configuration
  appName: import.meta.env.VITE_APP_NAME || 'Vakans.uz',
  appVersion: import.meta.env.VITE_APP_VERSION || '2.0.0',
  
  // Storage
  storagePrefix: import.meta.env.VITE_STORAGE_PREFIX || 'vakans_',
  
  // Features
  enablePWA: import.meta.env.VITE_ENABLE_PWA === 'true',
  enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  enableErrorTracking: import.meta.env.VITE_ENABLE_ERROR_TRACKING === 'true',
  
  // Development
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
} as const

export type Env = typeof env
