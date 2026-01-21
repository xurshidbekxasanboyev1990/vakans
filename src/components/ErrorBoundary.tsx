import { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from './ui/Button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo })
    
    // Log to error tracking service (Sentry, etc.)
    if (import.meta.env.VITE_ENABLE_ERROR_TRACKING === 'true') {
      console.error('Error caught by boundary:', error, errorInfo)
      // TODO: Send to error tracking service
      // Sentry.captureException(error, { extra: errorInfo })
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-secondary-50 dark:bg-secondary-950 px-4">
          <div className="max-w-md w-full">
            <div className="bg-white dark:bg-secondary-900 rounded-2xl p-8 shadow-lg border border-secondary-200 dark:border-secondary-800 text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              
              <h2 className="text-2xl font-bold text-secondary-900 dark:text-white mb-2">
                Xatolik yuz berdi
              </h2>
              
              <p className="text-secondary-600 dark:text-secondary-400 mb-6">
                Kechirasiz, kutilmagan xatolik yuz berdi. Iltimos, sahifani yangilang yoki bosh sahifaga qayting.
              </p>

              {import.meta.env.DEV && this.state.error && (
                <details className="mb-6 text-left">
                  <summary className="cursor-pointer text-sm text-secondary-500 hover:text-secondary-700 dark:hover:text-secondary-300 mb-2">
                    Texnik ma'lumotlar
                  </summary>
                  <div className="bg-secondary-50 dark:bg-secondary-950 rounded-lg p-4 text-xs overflow-auto max-h-40">
                    <p className="text-red-600 dark:text-red-400 font-mono mb-2">
                      {this.state.error.toString()}
                    </p>
                    {this.state.errorInfo && (
                      <pre className="text-secondary-600 dark:text-secondary-400 whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    )}
                  </div>
                </details>
              )}

              <div className="flex gap-3 justify-center">
                <Button
                  onClick={this.handleReset}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Qayta urinish
                </Button>
                <Button
                  onClick={this.handleGoHome}
                  className="flex items-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  Bosh sahifa
                </Button>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
