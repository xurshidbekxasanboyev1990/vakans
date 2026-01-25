import { useAuth } from '@/contexts/AuthContext';
import { usersApi } from '@/lib/api';
import { getFileUrl } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Award, Briefcase, Building2, Calendar, Camera, Edit2,
  FileText, Globe, GraduationCap, Languages, Linkedin, Mail, MapPin,
  Phone, Save, Send, User, Users
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// Viloyatlar ro'yxati
const REGIONS = [
  'Toshkent shahri',
  'Toshkent viloyati',
  'Andijon',
  'Buxoro',
  'Farg\'ona',
  'Jizzax',
  'Xorazm',
  'Namangan',
  'Navoiy',
  'Qashqadaryo',
  'Samarqand',
  'Sirdaryo',
  'Surxondaryo',
  'Qoraqalpog\'iston',
];

// Ta'lim darajalari
const EDUCATION_LEVELS = [
  'O\'rta',
  'O\'rta maxsus',
  'Oliy (Bakalavr)',
  'Oliy (Magistr)',
  'PhD / Doktorantura',
];

// Kompaniya o'lchamlari
const COMPANY_SIZES = [
  '1-10',
  '11-50',
  '51-200',
  '201-500',
  '500+',
];

export function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    region: user?.region || '',
    location: user?.location || '',
    address: user?.address || '',
    birthDate: user?.birthDate || '',
    gender: user?.gender || '',
    skills: user?.skills?.join(', ') || '',
    experienceYears: user?.experienceYears?.toString() || '',
    education: user?.education || '',
    educationLevel: user?.educationLevel || '',
    languages: user?.languages?.join(', ') || '',
    certificates: user?.certificates?.join(', ') || '',
    portfolio: user?.portfolio || '',
    linkedIn: user?.linkedIn || '',
    telegram: user?.telegram || '',
    desiredSalary: user?.desiredSalary?.toString() || '',
    desiredWorkType: user?.desiredWorkType || '',
    // Employer fields
    companyName: user?.companyName || '',
    companyDescription: user?.companyDescription || '',
    website: user?.website || '',
    companySize: user?.companySize || '',
    industry: user?.industry || '',
    foundedYear: user?.foundedYear?.toString() || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const updateData: Record<string, unknown> = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email || undefined,
        bio: formData.bio || undefined,
        region: formData.region || undefined,
        location: formData.location || undefined,
        address: formData.address || undefined,
        birthDate: formData.birthDate || undefined,
        gender: formData.gender || undefined,
      };

      // Add worker fields if user is worker
      if (user?.role === 'worker') {
        updateData.skills = formData.skills ? formData.skills.split(',').map(s => s.trim()).filter(Boolean) : [];
        updateData.experienceYears = formData.experienceYears ? parseInt(formData.experienceYears) : undefined;
        updateData.education = formData.education || undefined;
        updateData.educationLevel = formData.educationLevel || undefined;
        updateData.languages = formData.languages ? formData.languages.split(',').map(s => s.trim()).filter(Boolean) : [];
        updateData.certificates = formData.certificates ? formData.certificates.split(',').map(s => s.trim()).filter(Boolean) : [];
        updateData.portfolio = formData.portfolio || undefined;
        updateData.linkedIn = formData.linkedIn || undefined;
        updateData.telegram = formData.telegram || undefined;
        updateData.desiredSalary = formData.desiredSalary ? parseInt(formData.desiredSalary) : undefined;
        updateData.desiredWorkType = formData.desiredWorkType || undefined;
      }

      // Add employer fields if user is employer
      if (user?.role === 'employer') {
        updateData.companyName = formData.companyName || undefined;
        updateData.companyDescription = formData.companyDescription || undefined;
        updateData.website = formData.website || undefined;
        updateData.companySize = formData.companySize || undefined;
        updateData.industry = formData.industry || undefined;
        updateData.foundedYear = formData.foundedYear ? parseInt(formData.foundedYear) : undefined;
      }

      const res = await usersApi.updateProfile(updateData);
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

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Faqat rasm fayllari (JPG, PNG, GIF, WebP) qabul qilinadi');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Rasm hajmi 5MB dan oshmasligi kerak');
      return;
    }

    setIsUploadingAvatar(true);
    try {
      // Upload file
      console.log('Uploading avatar...', file.name, file.type, file.size);
      const uploadRes = await usersApi.uploadAvatar(file);
      console.log('Upload response:', uploadRes);
      if (uploadRes.success && uploadRes.data?.url) {
        // Update profile with new avatar URL
        console.log('Updating profile with avatar URL:', uploadRes.data.url);
        const updateRes = await usersApi.updateProfile({ avatar: uploadRes.data.url });
        console.log('Profile update response:', updateRes);
        if (updateRes.success) {
          toast.success('Rasm yangilandi');
          if (refreshUser) refreshUser();
        } else {
          toast.error('Rasmni profilga saqlashda xatolik');
        }
      } else {
        toast.error(uploadRes.error || 'Rasm yuklashda xatolik');
      }
    } catch (err) {
      console.error('Avatar upload error:', err);
      toast.error('Rasm yuklashda xatolik');
    } finally {
      setIsUploadingAvatar(false);
    }
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
        {/* Ortga tugmasi */}
        <motion.div variants={itemVariants} className="mb-6">
          <motion.button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary-100 dark:bg-secondary-800 hover:bg-secondary-200 dark:hover:bg-secondary-700 text-secondary-700 dark:text-secondary-300 font-medium transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ArrowLeft className="w-5 h-5" />
            Orqaga
          </motion.button>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-white dark:bg-secondary-900 rounded-2xl p-4 sm:p-6 shadow-sm border border-secondary-200 dark:border-secondary-800 mb-6"
        >
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mb-6">
            <div className="relative">
              <motion.div
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center overflow-hidden"
                whileHover={{ scale: 1.05 }}
              >
                {isUploadingAvatar ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                ) : user.avatar ? (
                  <img src={getFileUrl(user.avatar)} alt={user.firstName} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 sm:w-12 sm:h-12 text-primary-500" />
                )}
              </motion.div>
              <label className={`absolute -bottom-2 -right-2 p-2 bg-primary-500 rounded-xl text-white cursor-pointer hover:bg-primary-600 shadow-lg shadow-primary-500/25 transition-all ${isUploadingAvatar ? 'opacity-50 pointer-events-none' : ''}`}>
                <Camera className="w-4 h-4" />
                <input type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={handleAvatarUpload} className="hidden" disabled={isUploadingAvatar} />
              </label>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-xl sm:text-2xl font-bold text-secondary-900 dark:text-white">{user.firstName} {user.lastName}</h1>
              <p className="text-secondary-500">{user.role === 'worker' ? 'Ishchi' : user.role === 'employer' ? 'Ish beruvchi' : 'Admin'}</p>
              {user.isVerified && (
                <span className="inline-flex items-center gap-1 text-green-500 text-sm mt-1 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">
                  ✓ Tasdiqlangan
                </span>
              )}
            </div>
            <motion.button
              onClick={() => setIsEditing(!isEditing)}
              className="p-3 rounded-xl bg-secondary-100 dark:bg-secondary-800 hover:bg-secondary-200 dark:hover:bg-secondary-700 transition-colors absolute top-4 right-4 sm:relative sm:top-0 sm:right-0"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Edit2 className="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
            </motion.button>
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Asosiy ma'lumotlar */}
              <div className="space-y-4">
                <h3 className="font-medium text-secondary-900 dark:text-white flex items-center gap-2 pb-2 border-b border-secondary-200 dark:border-secondary-700">
                  <User className="w-5 h-5 text-primary-500" />
                  Shaxsiy ma'lumotlar
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Ism *</label>
                    <input
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Tug'ilgan sana</label>
                    <input
                      name="birthDate"
                      type="date"
                      value={formData.birthDate}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Jinsi</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    >
                      <option value="">Tanlanmagan</option>
                      <option value="male">Erkak</option>
                      <option value="female">Ayol</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Aloqa ma'lumotlari */}
              <div className="space-y-4">
                <h3 className="font-medium text-secondary-900 dark:text-white flex items-center gap-2 pb-2 border-b border-secondary-200 dark:border-secondary-700">
                  <Phone className="w-5 h-5 text-primary-500" />
                  Aloqa ma'lumotlari
                </h3>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Email</label>
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="email@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Hudud</label>
                    <select
                      name="region"
                      value={formData.region}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    >
                      <option value="">Tanlang...</option>
                      {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Manzil</label>
                    <input
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="Tuman, ko'cha..."
                      className="w-full px-4 py-3 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">O'zingiz haqingizda</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={4}
                  placeholder="O'zingiz haqingizda qisqacha ma'lumot yozing..."
                  className="w-full px-4 py-3 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
                />
              </div>

              {/* Ishchi uchun qo'shimcha maydonlar */}
              {user?.role === 'worker' && (
                <>
                  {/* Ko'nikmalar va Tajriba */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-secondary-900 dark:text-white flex items-center gap-2 pb-2 border-b border-secondary-200 dark:border-secondary-700">
                      <Briefcase className="w-5 h-5 text-primary-500" />
                      Kasbiy ma'lumotlar
                    </h3>
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Ko'nikmalar</label>
                      <input
                        name="skills"
                        value={formData.skills}
                        onChange={handleChange}
                        placeholder="React, TypeScript, Node.js, Python..."
                        className="w-full px-4 py-3 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      />
                      <p className="text-xs text-secondary-500 mt-1">Ko'nikmalarni vergul bilan ajrating</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Ish tajribasi (yil)</label>
                        <input
                          name="experienceYears"
                          type="number"
                          min="0"
                          max="50"
                          value={formData.experienceYears}
                          onChange={handleChange}
                          placeholder="3"
                          className="w-full px-4 py-3 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Kutilayotgan maosh</label>
                        <input
                          name="desiredSalary"
                          type="number"
                          value={formData.desiredSalary}
                          onChange={handleChange}
                          placeholder="5000000"
                          className="w-full px-4 py-3 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Ta'lim */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-secondary-900 dark:text-white flex items-center gap-2 pb-2 border-b border-secondary-200 dark:border-secondary-700">
                      <GraduationCap className="w-5 h-5 text-primary-500" />
                      Ta'lim
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Ta'lim darajasi</label>
                        <select
                          name="educationLevel"
                          value={formData.educationLevel}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        >
                          <option value="">Tanlang...</option>
                          {EDUCATION_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">O'quv muassasasi</label>
                        <input
                          name="education"
                          value={formData.education}
                          onChange={handleChange}
                          placeholder="TATU, Milliy Universitet..."
                          className="w-full px-4 py-3 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Tillar</label>
                      <input
                        name="languages"
                        value={formData.languages}
                        onChange={handleChange}
                        placeholder="O'zbek, Rus, Ingliz..."
                        className="w-full px-4 py-3 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      />
                      <p className="text-xs text-secondary-500 mt-1">Tillarni vergul bilan ajrating</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Sertifikatlar</label>
                      <input
                        name="certificates"
                        value={formData.certificates}
                        onChange={handleChange}
                        placeholder="AWS Certified, IELTS 7.0..."
                        className="w-full px-4 py-3 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      />
                      <p className="text-xs text-secondary-500 mt-1">Sertifikatlarni vergul bilan ajrating</p>
                    </div>
                  </div>

                  {/* Ijtimoiy tarmoqlar */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-secondary-900 dark:text-white flex items-center gap-2 pb-2 border-b border-secondary-200 dark:border-secondary-700">
                      <Globe className="w-5 h-5 text-primary-500" />
                      Havolalar
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Portfolio</label>
                        <input
                          name="portfolio"
                          type="url"
                          value={formData.portfolio}
                          onChange={handleChange}
                          placeholder="https://portfolio.com"
                          className="w-full px-4 py-3 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">LinkedIn</label>
                        <input
                          name="linkedIn"
                          type="url"
                          value={formData.linkedIn}
                          onChange={handleChange}
                          placeholder="https://linkedin.com/in/username"
                          className="w-full px-4 py-3 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Telegram</label>
                      <input
                        name="telegram"
                        value={formData.telegram}
                        onChange={handleChange}
                        placeholder="@username"
                        className="w-full px-4 py-3 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Employer specific fields */}
              {user?.role === 'employer' && (
                <div className="space-y-4">
                  <h3 className="font-medium text-secondary-900 dark:text-white flex items-center gap-2 pb-2 border-b border-secondary-200 dark:border-secondary-700">
                    <Building2 className="w-5 h-5 text-primary-500" />
                    Kompaniya ma'lumotlari
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Kompaniya nomi</label>
                      <input
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        placeholder="Kompaniya nomi"
                        className="w-full px-4 py-3 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Soha</label>
                      <input
                        name="industry"
                        value={formData.industry}
                        onChange={handleChange}
                        placeholder="IT, Savdo, Ta'lim..."
                        className="w-full px-4 py-3 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Kompaniya tavsifi</label>
                    <textarea
                      name="companyDescription"
                      value={formData.companyDescription}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Kompaniya haqida batafsil ma'lumot yozing..."
                      className="w-full px-4 py-3 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Kompaniya o'lchami</label>
                      <select
                        name="companySize"
                        value={formData.companySize}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      >
                        <option value="">Tanlang...</option>
                        {COMPANY_SIZES.map(s => <option key={s} value={s}>{s} xodim</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Tashkil etilgan yil</label>
                      <input
                        name="foundedYear"
                        type="number"
                        min="1900"
                        max={new Date().getFullYear()}
                        value={formData.foundedYear}
                        onChange={handleChange}
                        placeholder="2020"
                        className="w-full px-4 py-3 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Veb-sayt</label>
                    <input
                      name="website"
                      type="url"
                      value={formData.website}
                      onChange={handleChange}
                      placeholder="https://example.com"
                      className="w-full px-4 py-3 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              )}

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
              className="space-y-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Asosiy ma'lumotlar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <motion.div variants={itemVariants} className="flex items-center gap-3 text-secondary-600 dark:text-secondary-400 p-3 bg-secondary-50 dark:bg-secondary-800/50 rounded-xl">
                  <Phone className="w-5 h-5 text-primary-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-secondary-400">Telefon</p>
                    <span className="font-medium text-secondary-900 dark:text-white">{user.phone}</span>
                  </div>
                </motion.div>
                {user.email && (
                  <motion.div variants={itemVariants} className="flex items-center gap-3 text-secondary-600 dark:text-secondary-400 p-3 bg-secondary-50 dark:bg-secondary-800/50 rounded-xl">
                    <Mail className="w-5 h-5 text-primary-500 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-secondary-400">Email</p>
                      <span className="font-medium text-secondary-900 dark:text-white">{user.email}</span>
                    </div>
                  </motion.div>
                )}
                {(user.region || user.location) && (
                  <motion.div variants={itemVariants} className="flex items-center gap-3 text-secondary-600 dark:text-secondary-400 p-3 bg-secondary-50 dark:bg-secondary-800/50 rounded-xl">
                    <MapPin className="w-5 h-5 text-primary-500 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-secondary-400">Manzil</p>
                      <span className="font-medium text-secondary-900 dark:text-white">{[user.region, user.location].filter(Boolean).join(', ')}</span>
                    </div>
                  </motion.div>
                )}
                {user.birthDate && (
                  <motion.div variants={itemVariants} className="flex items-center gap-3 text-secondary-600 dark:text-secondary-400 p-3 bg-secondary-50 dark:bg-secondary-800/50 rounded-xl">
                    <Calendar className="w-5 h-5 text-primary-500 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-secondary-400">Tug'ilgan sana</p>
                      <span className="font-medium text-secondary-900 dark:text-white">{new Date(user.birthDate).toLocaleDateString('uz-UZ')}</span>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Bio */}
              {user.bio && (
                <motion.div variants={itemVariants} className="p-4 bg-secondary-50 dark:bg-secondary-800/50 rounded-xl">
                  <h3 className="font-medium text-secondary-900 dark:text-white mb-2 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary-500" />
                    O'zim haqimda
                  </h3>
                  <p className="text-secondary-600 dark:text-secondary-400 whitespace-pre-line">{user.bio}</p>
                </motion.div>
              )}

              {/* Worker ma'lumotlari */}
              {user.role === 'worker' && (
                <>
                  {/* Ko'nikmalar */}
                  {user.skills && user.skills.length > 0 && (
                    <motion.div variants={itemVariants}>
                      <h3 className="font-medium text-secondary-900 dark:text-white mb-3 flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-primary-500" />
                        Ko'nikmalar
                      </h3>
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

                  {/* Tajriba va Ma'lumot */}
                  <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {user.experienceYears !== undefined && (
                      <div className="p-4 bg-secondary-50 dark:bg-secondary-800/50 rounded-xl">
                        <p className="text-xs text-secondary-400 mb-1">Ish tajribasi</p>
                        <p className="font-semibold text-secondary-900 dark:text-white">{user.experienceYears} yil</p>
                      </div>
                    )}
                    {user.desiredSalary && (
                      <div className="p-4 bg-secondary-50 dark:bg-secondary-800/50 rounded-xl">
                        <p className="text-xs text-secondary-400 mb-1">Kutilayotgan maosh</p>
                        <p className="font-semibold text-primary-600 dark:text-primary-400">{user.desiredSalary.toLocaleString()} so'm</p>
                      </div>
                    )}
                    {user.desiredWorkType && (
                      <div className="p-4 bg-secondary-50 dark:bg-secondary-800/50 rounded-xl">
                        <p className="text-xs text-secondary-400 mb-1">Ish turi</p>
                        <p className="font-semibold text-secondary-900 dark:text-white">{user.desiredWorkType}</p>
                      </div>
                    )}
                  </motion.div>

                  {/* Ta'lim */}
                  {(user.educationLevel || user.education) && (
                    <motion.div variants={itemVariants} className="p-4 bg-secondary-50 dark:bg-secondary-800/50 rounded-xl">
                      <h3 className="font-medium text-secondary-900 dark:text-white mb-3 flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-primary-500" />
                        Ta'lim
                      </h3>
                      <div className="space-y-2">
                        {user.educationLevel && (
                          <div>
                            <p className="text-xs text-secondary-400">Daraja</p>
                            <p className="text-secondary-900 dark:text-white font-medium">{user.educationLevel}</p>
                          </div>
                        )}
                        {user.education && (
                          <div>
                            <p className="text-xs text-secondary-400">O'quv muassasasi</p>
                            <p className="text-secondary-900 dark:text-white">{user.education}</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* Tillar */}
                  {user.languages && user.languages.length > 0 && (
                    <motion.div variants={itemVariants}>
                      <h3 className="font-medium text-secondary-900 dark:text-white mb-3 flex items-center gap-2">
                        <Languages className="w-5 h-5 text-primary-500" />
                        Tillar
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {user.languages.map((lang: string, i: number) => (
                          <span key={i} className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm">
                            {lang}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Sertifikatlar */}
                  {user.certificates && user.certificates.length > 0 && (
                    <motion.div variants={itemVariants}>
                      <h3 className="font-medium text-secondary-900 dark:text-white mb-3 flex items-center gap-2">
                        <Award className="w-5 h-5 text-primary-500" />
                        Sertifikatlar
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {user.certificates.map((cert: string, i: number) => (
                          <span key={i} className="px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-sm">
                            {cert}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Havolalar */}
                  {(user.portfolio || user.linkedIn || user.telegram) && (
                    <motion.div variants={itemVariants} className="p-4 bg-secondary-50 dark:bg-secondary-800/50 rounded-xl">
                      <h3 className="font-medium text-secondary-900 dark:text-white mb-3 flex items-center gap-2">
                        <Globe className="w-5 h-5 text-primary-500" />
                        Havolalar
                      </h3>
                      <div className="space-y-2">
                        {user.portfolio && (
                          <a href={user.portfolio} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary-500 hover:text-primary-600 hover:underline">
                            <FileText className="w-4 h-4" />
                            Portfolio
                          </a>
                        )}
                        {user.linkedIn && (
                          <a href={user.linkedIn} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary-500 hover:text-primary-600 hover:underline">
                            <Linkedin className="w-4 h-4" />
                            LinkedIn
                          </a>
                        )}
                        {user.telegram && (
                          <a href={`https://t.me/${user.telegram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary-500 hover:text-primary-600 hover:underline">
                            <Send className="w-4 h-4" />
                            {user.telegram}
                          </a>
                        )}
                      </div>
                    </motion.div>
                  )}
                </>
              )}

              {/* Employer company info */}
              {user.role === 'employer' && (
                <motion.div variants={itemVariants} className="p-4 bg-secondary-50 dark:bg-secondary-800/50 rounded-xl space-y-4">
                  <h3 className="font-medium text-secondary-900 dark:text-white flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-primary-500" />
                    Kompaniya ma'lumotlari
                  </h3>
                  {user.companyName && (
                    <div>
                      <p className="text-xs text-secondary-400 mb-1">Nomi</p>
                      <p className="text-secondary-900 dark:text-white font-semibold text-lg">{user.companyName}</p>
                    </div>
                  )}
                  {user.industry && (
                    <div>
                      <p className="text-xs text-secondary-400 mb-1">Soha</p>
                      <p className="text-secondary-900 dark:text-white">{user.industry}</p>
                    </div>
                  )}
                  {user.companyDescription && (
                    <div>
                      <p className="text-xs text-secondary-400 mb-1">Tavsif</p>
                      <p className="text-secondary-600 dark:text-secondary-400 whitespace-pre-line">{user.companyDescription}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    {user.companySize && (
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary-500" />
                        <div>
                          <p className="text-xs text-secondary-400">Xodimlar soni</p>
                          <p className="font-medium text-secondary-900 dark:text-white">{user.companySize}</p>
                        </div>
                      </div>
                    )}
                    {user.foundedYear && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary-500" />
                        <div>
                          <p className="text-xs text-secondary-400">Tashkil etilgan</p>
                          <p className="font-medium text-secondary-900 dark:text-white">{user.foundedYear}-yil</p>
                        </div>
                      </div>
                    )}
                  </div>
                  {user.website && (
                    <div className="flex items-center gap-2 pt-2 border-t border-secondary-200 dark:border-secondary-700">
                      <Globe className="w-4 h-4 text-primary-500" />
                      <a
                        href={user.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-500 hover:text-primary-600 hover:underline"
                      >
                        {user.website}
                      </a>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Ro'yxatdan o'tgan sana */}
              <motion.div variants={itemVariants} className="text-center text-sm text-secondary-400 pt-4 border-t border-secondary-200 dark:border-secondary-700">
                Ro'yxatdan o'tgan: {new Date(user.createdAt).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long', day: 'numeric' })}
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}

export default ProfilePage;