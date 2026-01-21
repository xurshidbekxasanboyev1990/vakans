import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftIcon, rightIcon, id, required, disabled, ...props }, ref) => {
    const inputId = id || props.name

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2"
          >
            {label}
            {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div 
              className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400 pointer-events-none"
            >
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            required={required}
            disabled={disabled}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            className={cn(
              `
                w-full h-12 px-4 rounded-xl
                bg-white dark:bg-secondary-900
                border-2 border-secondary-200 dark:border-secondary-700
                text-secondary-900 dark:text-secondary-100
                placeholder:text-secondary-400 dark:placeholder:text-secondary-500
                transition-all duration-200
                focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10
                disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-secondary-50 dark:disabled:bg-secondary-900
              `,
              leftIcon && 'pl-11',
              rightIcon && 'pr-11',
              error && 'border-red-500 focus:border-red-500 focus:ring-red-500/10',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400"
            >
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p id={`${inputId}-error`} className="mt-2 text-sm text-red-500" role="alert">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${inputId}-hint`} className="mt-2 text-sm text-secondary-500">
            {hint}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input }
