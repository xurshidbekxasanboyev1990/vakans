import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Phone, Lock, Briefcase, ArrowRight, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui'

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const,
      },
    },
  }

  const formatPhoneInput = (value: string) => {
    const digits = value.replace(/\D/g, '')
    if (digits.startsWith('998')) {
      return '+' + digits.slice(0, 12)
    } else if (digits.length > 0) {
      return '+998' + digits.slice(0, 9)
    }
    return ''
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneInput(e.target.value)
    setFormData(prev => ({ ...prev, phone: formatted }))
    if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }))
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.phone || formData.phone.length < 13) {
      newErrors.phone = 'Telefon raqamni to\'liq kiriting'
    }
    if (!formData.password) {
      newErrors.password = 'Parolni kiriting'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setIsLoading(true)
    try {
      const result = await login(formData.phone, formData.password)
      if (result.success) {
        toast.success('Muvaffaqiyatli kirdingiz!')
        navigate('/dashboard')
      } else {
        toast.error(result.error || 'Kirish xatosi')
      }
    } catch {
      toast.error('Xatolik yuz berdi')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-white dark:bg-secondary-950 relative overflow-hidden">
      {/* Apple-style gradient orbs */}
      <motion.div 
        className="absolute top-1/4 -left-32 w-96 h-96 bg-gradient-to-r from-primary-400/20 to-purple-400/20 rounded-full blur-3xl"
        animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute bottom-1/4 -right-32 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl"
        animate={{ x: [0, -30, 0], y: [0, -20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div 
        className="w-full max-w-md relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Logo */}
        <motion.div variants={itemVariants} className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-3">
            <motion.div 
              className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-xl shadow-primary-500/30"
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Briefcase className="h-7 w-7 text-white" />
            </motion.div>
            <span className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
              Vakans.uz
            </span>
          </Link>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="shadow-2xl border-0 bg-white/80 dark:bg-secondary-900/80 backdrop-blur-xl">
            <CardHeader className="text-center pb-2">
              <motion.div 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-medium mb-4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Sparkles className="h-4 w-4" />
                Xush kelibsiz!
              </motion.div>
              <CardTitle as="h1" className="text-2xl">Tizimga kirish</CardTitle>
              <CardDescription className="text-base">
                Telefon raqam va parol bilan kiring
              </CardDescription>
            </CardHeader>
            
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Input
                    label="Telefon raqam"
                    type="tel"
                    placeholder="+998 90 123 45 67"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    error={errors.phone}
                    leftIcon={<Phone className="h-5 w-5" />}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Input
                    label="Parol"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Parolingizni kiriting"
                    value={formData.password}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, password: e.target.value }))
                      if (errors.password) setErrors(prev => ({ ...prev, password: '' }))
                    }}
                    error={errors.password}
                    leftIcon={<Lock className="h-5 w-5" />}
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="hover:text-primary-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    }
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Button
                    type="submit"
                    className="w-full h-14 text-lg font-semibold"
                    size="lg"
                    isLoading={isLoading}
                  >
                    Kirish
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </motion.div>
              </form>

              <motion.div 
                className="mt-8 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <p className="text-secondary-600 dark:text-secondary-400">
                  Hisobingiz yo'qmi?{' '}
                  <Link 
                    to="/register" 
                    className="text-primary-600 hover:text-primary-700 font-semibold hover:underline transition-all"
                  >
                    Ro'yxatdan o'ting
                  </Link>
                </p>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Back to home */}
        <motion.div 
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <Link 
            to="/" 
            className="text-secondary-500 hover:text-secondary-700 dark:hover:text-secondary-300 text-sm font-medium transition-colors"
          >
            ← Bosh sahifaga qaytish
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}
