import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Paperclip, Briefcase, CheckCircle } from 'lucide-react';
import { Job } from '@/types';
import { Modal, ModalFooter, Button, Textarea } from '@/components/ui';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { applicationsApi } from '@/lib/api';

interface QuickApplyModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (jobId: string) => void;
}

export function QuickApplyModal({ job, isOpen, onClose, onSuccess }: QuickApplyModalProps) {
  const [coverLetter, setCoverLetter] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasCV] = useState(true); // Assume user has CV

  const handleSubmit = async () => {
    if (!job) return;

    setIsSubmitting(true);
    try {
      const response = await applicationsApi.apply(job.id, coverLetter || undefined);

      if (response.success) {
        toast.success('Ariza muvaffaqiyatli yuborildi!');
        onSuccess?.(job.id);
        onClose();
        setCoverLetter('');
      } else {
        toast.error(response.error || 'Ariza yuborishda xatolik');
      }
    } catch (error) {
      toast.error('Xatolik yuz berdi');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!job) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center flex-shrink-0">
              <Briefcase className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-secondary-900 dark:text-white mb-1">
                Tezkor ariza
              </h3>
              <p className="text-sm text-secondary-600 dark:text-secondary-400">
                {job.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors"
          >
            <X className="h-5 w-5 text-secondary-500" />
          </button>
        </div>

        {/* Quick Info */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-3 bg-secondary-50 dark:bg-secondary-800/50 rounded-lg">
            <p className="text-xs text-secondary-500 mb-1">Kompaniya</p>
            <p className="text-sm font-medium text-secondary-900 dark:text-white">
              {job.employerName || job.companyName || 'Noma\'lum'}
            </p>
          </div>
          <div className="p-3 bg-secondary-50 dark:bg-secondary-800/50 rounded-lg">
            <p className="text-xs text-secondary-500 mb-1">Joylashuv</p>
            <p className="text-sm font-medium text-secondary-900 dark:text-white">
              {job.location || job.region}
            </p>
          </div>
        </div>

        {/* CV Check */}
        <div
          className={cn(
            'p-4 rounded-xl border-2 mb-6 transition-colors',
            hasCV
              ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800/30'
              : 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800/30'
          )}
        >
          <div className="flex items-start gap-3">
            {hasCV ? (
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            ) : (
              <Paperclip className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p className="text-sm font-medium text-secondary-900 dark:text-white mb-1">
                {hasCV ? 'CV tayyor' : 'CV kerak'}
              </p>
              <p className="text-xs text-secondary-600 dark:text-secondary-400">
                {hasCV
                  ? 'Sizning CV ma\'lumotlaringiz avtomatik yuboriladi'
                  : 'Iltimos, avval profilingizni to\'ldiring va CV yuklang'}
              </p>
            </div>
          </div>
        </div>

        {/* Cover Letter (Optional) */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
            Qo'shimcha xabar <span className="text-secondary-400">(ixtiyoriy)</span>
          </label>
          <Textarea
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            placeholder="Nima uchun siz bu ishga mos kelishingiz haqida qisqacha yozing..."
            rows={4}
            maxLength={500}
            className="resize-none"
          />
          <p className="text-xs text-secondary-500 mt-1 text-right">
            {coverLetter.length}/500
          </p>
        </div>

        {/* Benefits Info */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl mb-6">
          <p className="text-sm text-secondary-700 dark:text-secondary-300">
            💡 <strong>Tezkor ariza:</strong> Sizning profilingiz va CV ma'lumotlaringiz avtomatik ravishda yuboriladi. 
            Bu ish beruvchiga vaqtni tejashga yordam beradi!
          </p>
        </div>

        {/* Actions */}
        <ModalFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Bekor qilish
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !hasCV}
            isLoading={isSubmitting}
          >
            <Send className="h-4 w-4 mr-2" />
            Ariza yuborish
          </Button>
        </ModalFooter>
      </div>

      {/* Success Animation */}
      <AnimatePresence>
        {isSubmitting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white/80 dark:bg-secondary-900/80 backdrop-blur-sm flex items-center justify-center rounded-2xl"
          >
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="inline-block mb-4"
              >
                <Send className="h-12 w-12 text-primary-500" />
              </motion.div>
              <p className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
                Ariza yuborilmoqda...
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
}

/**
 * Usage:
 * 
 * const [selectedJob, setSelectedJob] = useState<Job | null>(null);
 * const [isQuickApplyOpen, setIsQuickApplyOpen] = useState(false);
 * 
 * <Button onClick={() => {
 *   setSelectedJob(job);
 *   setIsQuickApplyOpen(true);
 * }}>
 *   Tezkor ariza
 * </Button>
 * 
 * <QuickApplyModal
 *   job={selectedJob}
 *   isOpen={isQuickApplyOpen}
 *   onClose={() => setIsQuickApplyOpen(false)}
 *   onSuccess={(jobId) => {
 *     console.log('Applied to:', jobId);
 *   }}
 * />
 */
