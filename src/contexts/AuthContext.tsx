import { api } from '@/lib/api';
import type { User } from '@/types';
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

const STORAGE_PREFIX = import.meta.env.VITE_STORAGE_PREFIX || 'vakans_';
const STORAGE_KEY = `${STORAGE_PREFIX}user`;
const TOKEN_KEY = `${STORAGE_PREFIX}token`;

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (phone: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: {
    phone: string;
    password: string;
    firstName: string;
    lastName?: string;
    role: 'worker' | 'employer';
    region?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      // Token mavjudligini tekshirish
      const token = localStorage.getItem(TOKEN_KEY);
      const savedUser = localStorage.getItem(STORAGE_KEY);

      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      // Avval localStorage dan user ni o'qish (tezroq)
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          // Parse xatosi
        }
      }

      // API dan user ma'lumotlarini olish (yangilash uchun)
      try {
        const response = await api.auth.getMe();
        if (response.success && response.data) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(response.data));
          setUser(response.data);
        } else if (response.error?.includes('expired') || response.error?.includes('Unauthorized')) {
          // Token eskirgan - logout qilish
          localStorage.removeItem(STORAGE_KEY);
          localStorage.removeItem(TOKEN_KEY);
          setUser(null);
        }
        // Boshqa API xatosi bo'lsa localStorage dagi user saqlanib qoladi
      } catch (error: unknown) {
        const err = error as { response?: { status?: number; data?: { message?: string } } };
        // 401 Unauthorized - token eskirgan
        if (err?.response?.status === 401) {
          localStorage.removeItem(STORAGE_KEY);
          localStorage.removeItem(TOKEN_KEY);
          setUser(null);
        }
        // Boshqa network xatosi - localStorage dagi user ishlatiladi
      }
    } catch {
      // Umumiy xatolik - localStorage dan o'qish
      try {
        const savedUser = localStorage.getItem(STORAGE_KEY);
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch {
        // Parse xatosi
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (phone: string, password: string) => {
    try {
      const response = await api.auth.login(phone, password);
      if (response.success && response.data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(response.data));
        setUser(response.data);
        return { success: true };
      }
      return { success: false, error: response.error || 'Login muvaffaqiyatsiz' };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return { success: false, error: err?.response?.data?.message || 'Server xatosi' };
    }
  };

  const register = async (data: {
    phone: string;
    password: string;
    firstName: string;
    lastName?: string;
    role: 'worker' | 'employer';
    region?: string;
  }) => {
    try {
      const response = await api.auth.register(data);
      if (response.success && response.data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(response.data));
        setUser(response.data);
        return { success: true };
      }
      return { success: false, error: response.error || 'Ro\'yxatdan o\'tish muvaffaqiyatsiz' };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return { success: false, error: err?.response?.data?.message || 'Server xatosi' };
    }
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch {
      // Ignore logout errors
    }
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) {
        setUser(null);
        return;
      }

      const response = await api.auth.getMe();
      if (response.success && response.data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(response.data));
        setUser(response.data);
      }
    } catch {
      // Error bo'lsa eski user ma'lumotlarini saqlab qolish
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
