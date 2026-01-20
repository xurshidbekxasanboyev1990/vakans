import { useState, useRef, DragEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, X, File, Image as ImageIcon, FileText, CheckCircle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FileUploadProps {
  accept?: string
  maxSize?: number // MB
  maxFiles?: number
  multiple?: boolean
  onUpload: (files: File[]) => Promise<void>
  className?: string
}

interface UploadedFile {
  file: File
  preview?: string
  progress: number
  status: 'uploading' | 'success' | 'error'
  error?: string
}

export function FileUpload({
  accept = '*',
  maxSize = 10,
  maxFiles = 5,
  multiple = true,
  onUpload,
  className,
}: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList) return

    const validFiles: File[] = []
    const newFiles: UploadedFile[] = []

    Array.from(fileList).forEach((file) => {
      // Check file size
      if (file.size > maxSize * 1024 * 1024) {
        newFiles.push({
          file,
          progress: 0,
          status: 'error',
          error: `Fayl hajmi ${maxSize}MB dan katta`,
        })
        return
      }

      // Check max files
      if (files.length + validFiles.length >= maxFiles) {
        return
      }

      validFiles.push(file)

      // Create preview for images
      const preview = file.type.startsWith('image/')
        ? URL.createObjectURL(file)
        : undefined

      newFiles.push({
        file,
        preview,
        progress: 0,
        status: 'uploading',
      })
    })

    setFiles((prev) => [...prev, ...newFiles])

    // Upload files
    try {
      await onUpload(validFiles)
      
      // Update status to success
      setFiles((prev) =>
        prev.map((f) =>
          validFiles.includes(f.file)
            ? { ...f, progress: 100, status: 'success' as const }
            : f
        )
      )
    } catch (error) {
      setFiles((prev) =>
        prev.map((f) =>
          validFiles.includes(f.file)
            ? { ...f, status: 'error' as const, error: 'Yuklashda xatolik' }
            : f
        )
      )
    }
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const newFiles = [...prev]
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview!)
      }
      newFiles.splice(index, 1)
      return newFiles
    })
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <ImageIcon className="h-8 w-8" />
    if (file.type.startsWith('text/')) return <FileText className="h-8 w-8" />
    return <File className="h-8 w-8" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className={cn('w-full', className)}>
      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all',
          isDragging
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
            : 'border-secondary-300 dark:border-secondary-700 hover:border-primary-400 hover:bg-secondary-50 dark:hover:bg-secondary-800'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />

        <motion.div
          animate={{ y: isDragging ? -10 : 0 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-primary-100 dark:bg-primary-900/30 rounded-full">
              <Upload className="h-8 w-8 text-primary-600" />
            </div>
          </div>

          <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-2">
            {isDragging ? 'Fayllarni qo\'ying' : 'Fayllarni yuklash'}
          </h3>

          <p className="text-sm text-secondary-500 mb-4">
            Fayllarni bu yerga torting yoki kliklang
          </p>

          <p className="text-xs text-secondary-400">
            Maksimal hajm: {maxSize}MB • Maksimal sonı: {maxFiles} ta
          </p>
        </motion.div>
      </div>

      {/* Uploaded Files */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 space-y-2"
          >
            {files.map((uploadedFile, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white dark:bg-secondary-900 rounded-xl p-4 border border-secondary-200 dark:border-secondary-800"
              >
                <div className="flex items-center gap-4">
                  {/* Preview or Icon */}
                  <div className="flex-shrink-0">
                    {uploadedFile.preview ? (
                      <img
                        src={uploadedFile.preview}
                        alt={uploadedFile.file.name}
                        className="h-12 w-12 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="h-12 w-12 flex items-center justify-center bg-secondary-100 dark:bg-secondary-800 rounded-lg text-secondary-400">
                        {getFileIcon(uploadedFile.file)}
                      </div>
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-secondary-900 dark:text-white truncate">
                      {uploadedFile.file.name}
                    </p>
                    <p className="text-xs text-secondary-500">
                      {formatFileSize(uploadedFile.file.size)}
                    </p>

                    {/* Progress Bar */}
                    {uploadedFile.status === 'uploading' && (
                      <div className="mt-2 h-1 bg-secondary-200 dark:bg-secondary-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${uploadedFile.progress}%` }}
                          className="h-full bg-primary-500"
                        />
                      </div>
                    )}

                    {/* Error Message */}
                    {uploadedFile.error && (
                      <p className="mt-1 text-xs text-red-500">{uploadedFile.error}</p>
                    )}
                  </div>

                  {/* Status Icon */}
                  <div className="flex-shrink-0">
                    {uploadedFile.status === 'success' && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                    {uploadedFile.status === 'error' && (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    )}
                    {uploadedFile.status === 'uploading' && (
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary-500 border-t-transparent" />
                    )}
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFile(index)}
                    className="flex-shrink-0 p-1 hover:bg-secondary-100 dark:hover:bg-secondary-800 rounded-lg transition-colors"
                  >
                    <X className="h-4 w-4 text-secondary-400" />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
