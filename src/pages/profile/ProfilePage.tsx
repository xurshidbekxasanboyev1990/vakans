import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usersApi } from '@/lib/api';
import { User, Camera, Mail, Phone, MapPin, Save, Edit2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    location: user?.location || '',
    skills: user?.skills?.join(', ') || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await usersApi.updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        bio: formData.bio,
        location: formData.location,
        skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
      });
      if (res.success) {
        toast.success('Profil yangilandi');
        setIsEditing(false);
        if (refreshUser) refreshUser();
      } else {
        toast.error(res.error || 'Xatolik yuz berdi');
      }
    } catch {
      toast.error('Xatolik yuz berdi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64 = reader.result as string;
        const res = await usersApi.updateAvatar(base64);
        if (res.success) {
          toast.success('Rasm yangilandi');
          if (refreshUser) refreshUser();
        }
      } catch {
        toast.error('Rasm yuklashda xatolik');
      }
    };
    reader.readAsDataURL(file);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-secondary-950 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          <p className="text-secondary-500">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-950 py-8 px-4">
      <motion.div 
        className="max-w-3xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div 
          variants={itemVariants}
          className="bg-white dark:bg-secondary-900 rounded-2xl p-6 shadow-sm border border-secondary-200 dark:border-secondary-800 mb-6"
        >
          <div className="flex items-center gap-6 mb-6">
            <div className="relative">
              <motion.div 
                className="w-24 h-24 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center overflow-hidden"
                whileHover={{ scale: 1.05 }}
              >
                {user.avatar ? (
                  <img src={user.avatar} alt={user.firstName} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-primary-500" />
                )}
              </motion.div>
              <label className="absolute -bottom-2 -right-2 p-2 bg-primary-500 rounded-xl text-white cursor-pointer hover:bg-primary-600 shadow-lg shadow-primary-500/25 transition-all">
                <Camera className="w-4 h-4" />
                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              </label>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">{user.firstName} {user.lastName}</h1>
              <p className="text-secondary-500">{user.role === 'worker' ? 'Ishchi' : user.role === 'employer' ? 'Ish beruvchi' : 'Admin'}</p>
              {user.isVerified && (
                <span className="inline-flex items-center gap-1 text-green-500 text-sm mt-1 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">
                  ✓ Tasdiqlangan
                </span>
              )}
            </div>
            <motion.button 
              onClick={() => setIsEditing(!isEditing)} 
              className="p-3 rounded-xl bg-secondary-100 dark:bg-secondary-800 hover:bg-secondary-200 dark:hover:bg-secondary-700 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Edit2 className="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
            </motion.button>
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Ism</label>
                  <input 
                    name="firstName" 
                    value={formData.firstName} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Familiya</label>
                  <input 
                    name="lastName" 
                    value={formData.lastName} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Email</label>
                <input 
                  name="email" 
                  type="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Manzil</label>
                <input 
                  name="location" 
                  value={formData.location} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Bio</label>
                <textarea 
                  name="bio" 
                  value={formData.bio} 
                  onChange={handleChange} 
                  rows={3} 
                  className="w-full px-4 py-3 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Ko'nikmalar</label>
                <input 
                  name="skills" 
                  value={formData.skills} 
                  onChange={handleChange} 
                  placeholder="React, TypeScript, Node.js..."
                  className="w-full px-4 py-3 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" 
                />
              </div>
              <div className="flex gap-3 pt-2">
                <motion.button 
                  type="submit" 
                  disabled={isLoading} 
                  className="flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 disabled:opacity-50 font-medium shadow-lg shadow-primary-500/25 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  Saqlash
                </motion.button>
                <motion.button 
                  type="button" 
                  onClick={() => setIsEditing(false)} 
                  className="px-6 py-3 bg-secondary-100 dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300 rounded-xl hover:bg-secondary-200 dark:hover:bg-secondary-700 font-medium transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Bekor qilish
                </motion.button>
              </div>
            </form>
          ) : (
            <motion.div 
              className="space-y-4"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={itemVariants} className="flex items-center gap-3 text-secondary-600 dark:text-secondary-400 p-3 bg-secondary-50 dark:bg-secondary-800/50 rounded-xl">
                <Phone className="w-5 h-5 text-primary-500" />
                <span>{user.phone}</span>
              </motion.div>
              {user.email && (
                <motion.div variants={itemVariants} className="flex items-center gap-3 text-secondary-600 dark:text-secondary-400 p-3 bg-secondary-50 dark:bg-secondary-800/50 rounded-xl">
                  <Mail className="w-5 h-5 text-primary-500" />
                  <span>{user.email}</span>
                </motion.div>
              )}
              {user.location && (
                <motion.div variants={itemVariants} className="flex items-center gap-3 text-secondary-600 dark:text-secondary-400 p-3 bg-secondary-50 dark:bg-secondary-800/50 rounded-xl">
                  <MapPin className="w-5 h-5 text-primary-500" />
                  <span>{user.location}</span>
                </motion.div>
              )}
              {user.bio && (
                <motion.div variants={itemVariants} className="mt-6 p-4 bg-secondary-50 dark:bg-secondary-800/50 rounded-xl">
                  <h3 className="font-medium text-secondary-900 dark:text-white mb-2">Bio</h3>
                  <p className="text-secondary-600 dark:text-secondary-400">{user.bio}</p>
                </motion.div>
              )}
              {user.skills && user.skills.length > 0 && (
                <motion.div variants={itemVariants} className="mt-6">
                  <h3 className="font-medium text-secondary-900 dark:text-white mb-3">Ko'nikmalar</h3>
                  <div className="flex flex-wrap gap-2">
                    {user.skills.map((skill: string, i: number) => (
                      <motion.span 
                        key={i} 
                        className="px-4 py-2 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-xl text-sm font-medium"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        {skill}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}

export default ProfilePage;
