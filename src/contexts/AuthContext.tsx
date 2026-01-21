import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User } from '@/types';

// DEMO MODE - Backend yo'q, localStorage bilan ishlaydi
// Production'da VITE_DEMO_MODE=false qiling
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';
const STORAGE_PREFIX = import.meta.env.VITE_STORAGE_PREFIX || 'vakans_';
const STORAGE_KEY = `${STORAGE_PREFIX}user`;

// DEMO ACCOUNTLAR - WARNING: Development only!
// Production'da o'chiring yoki environment variable'dan oling
const DEMO_ACCOUNTS: Record<string, { password: string; user: Omit<User, 'id' | 'createdAt'> }> = {
  '+998901234567': {
    password: 'Worker123',
    user: {
      phone: '+998901234567',
      firstName: 'Aziz',
      lastName: 'Karimov',
      role: 'worker',
      region: 'Toshkent',
      avatar: undefined,
      isVerified: true,
    },
  },
  '+998901111111': {
    password: 'Employer123',
    user: {
      phone: '+998901111111',
      firstName: 'Jasur',
      lastName: 'Rahimov',
      role: 'employer',
      region: 'Toshkent',
      avatar: undefined,
      isVerified: true,
    },
  },
  '+998900000000': {
    password: 'Admin123',
    user: {
      phone: '+998900000000',
      firstName: 'Admin',
      lastName: 'Superuser',
      role: 'admin',
      region: 'Toshkent',
      avatar: undefined,
      isVerified: true,
    },
  },
};

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

// Demo user yaratish
const createDemoUser = (data: { phone: string; firstName: string; lastName?: string; role: 'worker' | 'employer' | 'admin'; region?: string }): User => ({
  id: 'demo-' + Date.now(),
  phone: data.phone,
  firstName: data.firstName,
  lastName: data.lastName || '',
  role: data.role,
  region: data.region || 'Toshkent',
  avatar: undefined,
  isVerified: true,
  createdAt: new Date().toISOString(),
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      if (DEMO_MODE) {
        // Demo mode - localStorage dan o'qish
        const savedUser = localStorage.getItem(STORAGE_KEY);
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (phone: string, password: string) => {
    if (DEMO_MODE) {
      // Demo account tekshirish
      const demoAccount = DEMO_ACCOUNTS[phone];
      if (demoAccount) {
        if (demoAccount.password === password) {
          const demoUser: User = {
            ...demoAccount.user,
            id: 'demo-' + Date.now(),
            createdAt: new Date().toISOString(),
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(demoUser));
          setUser(demoUser);
          return { success: true };
        } else {
          return { success: false, error: 'Parol noto\'g\'ri' };
        }
      }
      
      // Oldingi user bormi tekshirish
      const savedUser = localStorage.getItem(STORAGE_KEY);
      if (savedUser) {
        const existingUser = JSON.parse(savedUser);
        if (existingUser.phone === phone) {
          setUser(existingUser);
          return { success: true };
        }
      }
      
      // Istalgan boshqa login - worker sifatida
      const demoUser = createDemoUser({
        phone,
        firstName: 'Demo',
        lastName: 'Foydalanuvchi',
        role: 'worker',
        region: 'Toshkent',
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(demoUser));
      setUser(demoUser);
      return { success: true };
    }
    
    return { success: false, error: 'Backend mavjud emas' };
  };

  const register = async (data: {
    phone: string;
    password: string;
    firstName: string;
    lastName?: string;
    role: 'worker' | 'employer';
    region?: string;
  }) => {
    if (DEMO_MODE) {
      // Demo mode - istalgan ma'lumot bilan ro'yxatdan o'tish
      const demoUser = createDemoUser({
        phone: data.phone,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        region: data.region,
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(demoUser));
      setUser(demoUser);
      return { success: true };
    }
    
    return { success: false, error: 'Backend mavjud emas' };
  };

  const logout = async () => {
    if (DEMO_MODE) {
      localStorage.removeItem(STORAGE_KEY);
    }
    setUser(null);
  };

  const refreshUser = async () => {
    await checkAuth();
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
