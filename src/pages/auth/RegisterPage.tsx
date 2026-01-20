import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Phone, Lock, User, Briefcase, UserCircle, Building2, ArrowRight, Sparkles, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import { Button, Input, Select, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui'
import { REGIONS } from '@/lib/utils'
import { cn } from '@/lib/utils'

export function RegisterPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { register } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: (searchParams.get('role') as 'worker' | 'employer') || 'worker',
    region: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
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
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Ismingizni kiriting'
    }
    if (!formData.password) {
      newErrors.password = 'Parolni kiriting'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Parol kamida 8 ta belgidan iborat bo\'lishi kerak'
    } else {
      const hasUpperCase = /[A-Z]/.test(formData.password)
      const hasLowerCase = /[a-z]/.test(formData.password)
      const hasNumber = /\d/.test(formData.password)
      if (!hasUpperCase || !hasLowerCase || !hasNumber) {
        newErrors.password = 'Parol kamida 1 katta harf, 1 kichik harf va 1 raqam bo\'lishi kerak'
      }
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Parollar mos kelmaydi'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setIsLoading(true)
    try {
      const result = await register({
        phone: formData.phone,
        password: formData.password,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim() || undefined,
        role: formData.role,
        region: formData.region || undefined,
      })
      if (result.success) {
        toast.success('Muvaffaqiyatli ro\'yxatdan o\'tdingiz!')
        navigate('/dashboard')
      } else {
        toast.error(result.error || 'Ro\'yxatdan o\'tish xatosi')
      }
    } catch {
      toast.error('Xatolik yuz berdi')
    } finally {
      setIsLoading(false)
    }
  }

  const regionOptions = REGIONS.map(r => ({ value: r, label: r }))

  // Password strength indicator
  const getPasswordStrength = () => {
    const password = formData.password
    if (!password) return { strength: 0, label: '' }
    
    let strength = 0
    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[a-z]/.test(password)) strength++
    if (/\d/.test(password)) strength++
    if (/[!@#$%^&*]/.test(password)) strength++
    
    if (strength <= 2) return { strength, label: 'Zaif', color: 'bg-red-500' }
    if (strength <= 3) return { strength, label: "O'rta", color: 'bg-yellow-500' }
    return { strength, label: 'Kuchli', color: 'bg-green-500' }
  }

  const passwordStrength = getPasswordStrength()

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
        className="w-full max-w-lg relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Logo */}
        <motion.div variants={itemVariants} className="text-center mb-8">
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
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-medium mb-4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Sparkles className="h-4 w-4" />
                100% bepul ro'yxatdan o'tish
              </motion.div>
              <CardTitle as="h1" className="text-2xl">Ro'yxatdan o'tish</CardTitle>
              <CardDescription className="text-base">
                Yangi hisob yarating
              </CardDescription>
            </CardHeader>
            
            <CardContent className="pt-4">
              {/* Role Selection - Apple style */}
              <motion.div 
                className="grid grid-cols-2 gap-4 mb-6"
                variants={itemVariants}
              >
                <motion.button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, role: 'worker' }))}
                  className={cn(
                    'relative flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all overflow-hidden',
                    formData.role === 'worker'
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-lg shadow-primary-500/20'
                      : 'border-secondary-200 dark:border-secondary-700 hover:border-primary-300 hover:shadow-md'
                  )}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {formData.role === 'worker' && (
                    <motion.div 
                      className="absolute top-2 right-2"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      <CheckCircle className="h-5 w-5 text-primary-600" />
                    </motion.div>
                  )}
                  <div className={cn(
                    'p-3 rounded-xl',
                    formData.role === 'worker' 
                      ? 'bg-primary-100 dark:bg-primary-900/40' 
                      : 'bg-secondary-100 dark:bg-secondary-800'
                  )}>
                    <UserCircle className={cn(
                      'h-8 w-8',
                      formData.role === 'worker' ? 'text-primary-600' : 'text-secondary-400'
                    )} />
                  </div>
                  <span className={cn(
                    'font-semibold',
                    formData.role === 'worker' ? 'text-primary-600' : 'text-secondary-600 dark:text-secondary-400'
                  )}>
                    Ish qidiraman
                  </span>
                </motion.button>
                
                <motion.button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, role: 'employer' }))}
                  className={cn(
                    'relative flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all overflow-hidden',
                    formData.role === 'employer'
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-lg shadow-primary-500/20'
                      : 'border-secondary-200 dark:border-secondary-700 hover:border-primary-300 hover:shadow-md'
                  )}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {formData.role === 'employer' && (
                    <motion.div 
                      className="absolute top-2 right-2"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      <CheckCircle className="h-5 w-5 text-primary-600" />
                    </motion.div>
                  )}
                  <div className={cn(
                    'p-3 rounded-xl',
                    formData.role === 'employer' 
                      ? 'bg-primary-100 dark:bg-primary-900/40' 
                      : 'bg-secondary-100 dark:bg-secondary-800'
                  )}>
                    <Building2 className={cn(
                      'h-8 w-8',
                      formData.role === 'employer' ? 'text-primary-600' : 'text-secondary-400'
                    )} />
                  </div>
                  <span className={cn(
                    'font-semibold',
                    formData.role === 'employer' ? 'text-primary-600' : 'text-secondary-600 dark:text-secondary-400'
                  )}>
                    Ishchi qidiraman
                  </span>
                </motion.button>
              </motion.div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
                  <Input
                    label="Ism"
                    placeholder="Ismingiz"
                    value={formData.firstName}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, firstName: e.target.value }))
                      if (errors.firstName) setErrors(prev => ({ ...prev, firstName: '' }))
                    }}
                    error={errors.firstName}
                    leftIcon={<User className="h-5 w-5" />}
                  />

                  <Input
                    label="Familiya"
                    placeholder="Familiyangiz"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
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

                <motion.div variants={itemVariants}>
                  <Select
                    label="Viloyat"
                    placeholder="Viloyatni tanlang"
                    options={regionOptions}
                    value={formData.region}
                    onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))}
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Input
                    label="Parol"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Kamida 8 ta belgi"
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
                  {/* Password strength indicator */}
                  {formData.password && (
                    <motion.div 
                      className="mt-2"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-secondary-200 dark:bg-secondary-700 rounded-full overflow-hidden">
                          <motion.div 
                            className={cn('h-full rounded-full', passwordStrength.color)}
                            initial={{ width: 0 }}
                            animate={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                        <span className="text-xs font-medium text-secondary-500">
                          {passwordStrength.label}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Input
                    label="Parolni tasdiqlang"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Parolni qaytadan kiriting"
                    value={formData.confirmPassword}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))
                      if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: '' }))
                    }}
                    error={errors.confirmPassword}
                    leftIcon={<Lock className="h-5 w-5" />}
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Button
                    type="submit"
                    className="w-full h-14 text-lg font-semibold"
                    size="lg"
                    isLoading={isLoading}
                  >
                    Ro'yxatdan o'tish
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </motion.div>
              </form>

              <motion.div 
                className="mt-8 text-center"
                variants={itemVariants}
              >
                <p className="text-secondary-600 dark:text-secondary-400">
                  Hisobingiz bormi?{' '}
                  <Link 
                    to="/login" 
                    className="text-primary-600 hover:text-primary-700 font-semibold hover:underline transition-all"
                  >
                    Kirish
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
          transition={{ delay: 0.8 }}
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
