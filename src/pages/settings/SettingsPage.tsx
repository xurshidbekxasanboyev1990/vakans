import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usersApi } from '@/lib/api';
import { Settings, Moon, Sun, Lock, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export function SettingsPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Parollar mos kelmaydi');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      toast.error('Parol kamida 8 ta belgidan iborat bo\'lishi kerak');
      return;
    }
    // Password strength check
    const hasUpperCase = /[A-Z]/.test(passwordData.newPassword);
    const hasLowerCase = /[a-z]/.test(passwordData.newPassword);
    const hasNumber = /\d/.test(passwordData.newPassword);
    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      toast.error('Parol kamida 1 katta harf, 1 kichik harf va 1 raqam bo\'lishi kerak');
      return;
    }
    setIsLoading(true);
    try {
      const res = await usersApi.updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      if (res.success) {
        toast.success('Parol yangilandi');
        setShowPasswordForm(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        toast.error(res.error || 'Xatolik yuz berdi');
      }
    } catch {
      toast.error('Xatolik yuz berdi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-950 py-8 px-4">
      <motion.div 
        className="max-w-3xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1 
          variants={itemVariants}
          className="text-3xl font-bold text-secondary-900 dark:text-white mb-8 flex items-center gap-3"
        >
          <Settings className="w-8 h-8 text-primary-500" />
          Sozlamalar
        </motion.h1>

        <div className="space-y-6">
          {/* Ko'rinish */}
          <motion.div 
            variants={itemVariants}
            className="bg-white dark:bg-secondary-900 rounded-2xl p-6 shadow-sm border border-secondary-200 dark:border-secondary-800"
          >
            <h2 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">Ko'rinish</h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isDark ? <Moon className="w-5 h-5 text-primary-500" /> : <Sun className="w-5 h-5 text-yellow-500" />}
                <div>
                  <p className="font-medium text-secondary-900 dark:text-white">Qorong'u rejim</p>
                  <p className="text-sm text-secondary-500">Interfeys rangini o'zgartiring</p>
                </div>
              </div>
              <button 
                onClick={toggleTheme} 
                className={`relative w-14 h-7 rounded-full transition-colors ${isDark ? 'bg-primary-500' : 'bg-secondary-200'}`}
              >
                <motion.div 
                  className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-md"
                  animate={{ x: isDark ? 30 : 4 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </button>
            </div>
          </motion.div>

          {/* Xavfsizlik */}
          <motion.div 
            variants={itemVariants}
            className="bg-white dark:bg-secondary-900 rounded-2xl p-6 shadow-sm border border-secondary-200 dark:border-secondary-800"
          >
            <h2 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">Xavfsizlik</h2>
            {showPasswordForm ? (
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                    Joriy parol
                  </label>
                  <input 
                    type="password" 
                    value={passwordData.currentPassword} 
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })} 
                    className="w-full px-4 py-3 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                    Yangi parol
                  </label>
                  <input 
                    type="password" 
                    value={passwordData.newPassword} 
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} 
                    className="w-full px-4 py-3 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                    Parolni tasdiqlash
                  </label>
                  <input 
                    type="password" 
                    value={passwordData.confirmPassword} 
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} 
                    className="w-full px-4 py-3 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <motion.button 
                    type="submit" 
                    disabled={isLoading} 
                    className="px-6 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 disabled:opacity-50 font-medium shadow-lg shadow-primary-500/25 transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isLoading ? 'Yuklanmoqda...' : 'Saqlash'}
                  </motion.button>
                  <motion.button 
                    type="button" 
                    onClick={() => setShowPasswordForm(false)} 
                    className="px-6 py-3 bg-secondary-100 dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300 rounded-xl hover:bg-secondary-200 dark:hover:bg-secondary-700 font-medium transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Bekor qilish
                  </motion.button>
                </div>
              </form>
            ) : (
              <motion.button 
                onClick={() => setShowPasswordForm(true)} 
                className="flex items-center gap-3 w-full p-4 rounded-xl hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors border border-secondary-100 dark:border-secondary-800"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <Lock className="w-5 h-5 text-secondary-400" />
                <div className="text-left">
                  <p className="font-medium text-secondary-900 dark:text-white">Parolni o'zgartirish</p>
                  <p className="text-sm text-secondary-500">Hisobingiz xavfsizligini yangilang</p>
                </div>
              </motion.button>
            )}
          </motion.div>

          {/* Hisob */}
          <motion.div 
            variants={itemVariants}
            className="bg-white dark:bg-secondary-900 rounded-2xl p-6 shadow-sm border border-secondary-200 dark:border-secondary-800"
          >
            <h2 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">Hisob</h2>
            <motion.button 
              onClick={handleLogout} 
              className="flex items-center gap-3 w-full p-4 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-red-500 border border-red-100 dark:border-red-900/30"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <LogOut className="w-5 h-5" />
              <div className="text-left">
                <p className="font-medium">Chiqish</p>
                <p className="text-sm opacity-75">Hisobdan chiqish</p>
              </div>
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

export default SettingsPage;
