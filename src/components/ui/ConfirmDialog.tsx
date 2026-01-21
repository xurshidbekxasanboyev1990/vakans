import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from './Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Tasdiqlash',
  cancelText = 'Bekor qilish',
  variant = 'danger',
  isLoading = false,
}: ConfirmDialogProps) {
  const variants = {
    danger: {
      icon: AlertTriangle,
      iconColor: 'text-red-600 dark:text-red-400',
      iconBg: 'bg-red-100 dark:bg-red-900/30',
      confirmBg: 'bg-red-600 hover:bg-red-700',
    },
    warning: {
      icon: AlertTriangle,
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
      confirmBg: 'bg-yellow-600 hover:bg-yellow-700',
    },
    info: {
      icon: AlertTriangle,
      iconColor: 'text-blue-600 dark:text-blue-400',
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      confirmBg: 'bg-blue-600 hover:bg-blue-700',
    },
  };

  const config = variants[variant];
  const Icon = config.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-sm"
          />

          {/* Dialog */}
          <div className="fixed inset-0 z-[91] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="w-full max-w-md bg-white dark:bg-secondary-900 rounded-3xl shadow-2xl border border-secondary-200 dark:border-secondary-800 overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`${config.iconBg} p-3 rounded-2xl`}>
                      <Icon className={`w-6 h-6 ${config.iconColor}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-secondary-900 dark:text-white mb-2">
                        {title}
                      </h3>
                      <p className="text-secondary-600 dark:text-secondary-400 text-sm leading-relaxed">
                        {message}
                      </p>
                    </div>
                  </div>
                  <motion.button
                    onClick={onClose}
                    className="text-secondary-400 hover:text-secondary-600 dark:hover:text-secondary-300 transition-colors"
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>

              {/* Actions */}
              <div className="p-6 pt-2 flex items-center justify-end gap-3 bg-secondary-50/50 dark:bg-secondary-950/50">
                <Button
                  variant="ghost"
                  onClick={onClose}
                  disabled={isLoading}
                  className="min-w-[100px]"
                >
                  {cancelText}
                </Button>
                <motion.button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className={`${config.confirmBg} text-white px-6 py-2.5 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px]`}
                  whileHover={{ scale: isLoading ? 1 : 1.05 }}
                  whileTap={{ scale: isLoading ? 1 : 0.95 }}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Yuklanmoqda...</span>
                    </div>
                  ) : (
                    confirmText
                  )}
                </motion.button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
