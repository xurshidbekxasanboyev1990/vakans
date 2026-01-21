/**
 * Centralized logging utility
 * Production'da console.log'lar avtomatik o'chiriladi
 */

const isDevelopment = import.meta.env.DEV
const isErrorTrackingEnabled = import.meta.env.VITE_ENABLE_ERROR_TRACKING === 'true'

type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug'

interface LogContext {
  component?: string
  action?: string
  userId?: string
  [key: string]: unknown
}

class Logger {
  private log(level: LogLevel, message: string, context?: LogContext) {
    if (!isDevelopment && level !== 'error') {
      return // Production'da faqat error'lar
    }

    // Demo mode da Socket.io xatolarini yashirish
    if (message.includes('Socket') || message.includes('Invalid namespace')) {
      return
    }

    const timestamp = new Date().toISOString()
    const contextStr = context ? JSON.stringify(context) : ''

    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message} ${contextStr}`

    // Console'ga chiqarish
    if (isDevelopment) {
      console[level](logMessage, context || '')
    }

    // Error tracking service'ga yuborish
    if (level === 'error' && isErrorTrackingEnabled) {
      this.sendToErrorTracking(message, context)
    }
  }

  private sendToErrorTracking(message: string, context?: LogContext) {
    // TODO: Sentry, LogRocket, yoki boshqa service'ga yuborish
    // Sentry.captureMessage(message, { level: 'error', extra: context })
    void message // Silence unused warning
    void context // Silence unused warning
  }

  info(message: string, context?: LogContext) {
    this.log('info', message, context)
  }

  warn(message: string, context?: LogContext) {
    this.log('warn', message, context)
  }

  error(message: string, error?: Error | unknown, context?: LogContext) {
    const errorContext = {
      ...context,
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name,
      } : error,
    }
    this.log('error', message, errorContext)
  }

  debug(message: string, context?: LogContext) {
    if (isDevelopment) {
      this.log('debug', message, context)
    }
  }
}

export const logger = new Logger()
