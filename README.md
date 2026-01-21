# Vakans.uz - Ish Qidirish Platformasi

O'zbekiston uchun zamonaviy ish qidirish va e'lon qilish platformasi.

## ✨ Asosiy Xususiyatlar

### 🔐 Autentifikatsiya va Xavfsizlik
- JWT tokenlar bilan xavfsiz autentifikatsiya
- ErrorBoundary - Global error handling
- Centralized logging system
- Environment-based configuration
- localStorage encryption va prefixing

### 👷 Ishchilar Uchun
- **Profil boshqaruvi** - CV, ko'nikmalar, tajriba
- **ProfileScore** - CV to'liqlik darajasi (0-100%) va takomillashtirish takliflari
- **Ish qidirish** - Real-time filter va search
- **Quick Apply** - 1-tap bilan ariza yuborish
- **SwipeableJobCard** - Tinder-style swipe (like/skip)
- **Offline Storage** - IndexedDB orqali internetga ulanmasdan ishlarni saqlash
- **Saved Jobs** - Sevimli ishlar ro'yxati

### 🏢 Ish Beruvchilar Uchun
- **E'lon joylash** - To'liq ish e'lonlari boshqaruvi
- **Arizalarni ko'rish** - Barcha arizalar bir joyda
- **HeatmapAnalytics** - Qaysi soatlarda ko'proq ariza kelishi statistikasi
- **Applicant Tracking** - Arizalarni boshqarish tizimi
- **Premium Listings** - Maxsus e'lonlar (featured, urgent)

### 📊 Analytics va Insights
- **MarketTrendsDashboard** - Real-time ish bozori tendensiyalari
- **HeatmapAnalytics** - Soatlar bo'yicha arizalar tahlili (Recharts)
- **Dashboard Stats** - To'liq statistika va grafiklar
- **Competitor Analysis** - O'xshash ishlarning maosh va shart-sharoit tahlili

### 💬 Real-Time Funksiyalar
- **Socket.io Integration** - 100% real-time aloqa
- **Live Notifications** - Jonli xabarnomalar (badge count, toast)
- **Chat Messaging** - Real-time xabar almashish
- **Browser Push Notifications** - Desktop bildirishnomalar
- **Connection Status** - Socket ulanish holati indikatori

### 📱 Mobile-First Features
- **Fully Responsive** - Barcha qurilmalarda (320px - 4K)
- **Haptic Feedback** - iOS/Android vibrasiya
- **Pull to Refresh** - Mobileda pastga tortib yangilash
- **Swipe Gestures** - Touch-friendly interactions
- **PWA Support** - Progressive Web App (offline ishlash)
- **Mobile Navigation** - BottomNav 60px dan pastda

### 🎨 UI/UX Premium Features
- **Framer Motion Animations** - iPhone-style smooth animations
- **Glass-morphism** - Backdrop blur effects
- **Skeleton Screens** - Loading vaqtida content placeholder
- **Optimistic UI** - Instant feedback (backend kutmasdan)
- **Dark Mode** - Tungi rejim (auto-detect)
- **Theme Toggle** - Animated theme switching
- **Scroll Effects** - Parallax, fade-in, slide animations
- **Microinteractions** - Button hovers, card tilts

### 💎 Premium va Verification
- **Blue Check Badge** - Tasdiqlangan kompaniyalar ✓
- **Premium Listings** - To'lovli e'lonlar yuqorida
- **Featured Profiles** - Ishchi profilini ko'proq ko'rsatish
- **Verification System** - Real user authentication
- **Priority Support** - Premium foydalanuvchilar uchun

### 🔔 Smart Notifications
- **Real-time Updates** - Socket.io orqali jonli yangilanishlar
- **Notification Groups** - Turli kategoriyalarga bo'lingan
- **Quiet Hours** - Kechasi bildirishnoma yo'q (sozlanuvchi)
- **Filter Options** - Hammasi / O'qilmagan
- **Mark as Read/Delete** - Individual yoki bulk actions

### 🌐 100% Responsive Dizayn

#### Breakpoints:
- **Mobile**: 320px - 640px (sm)
- **Tablet**: 641px - 1024px (md, lg)
- **Desktop**: 1025px+ (xl, 2xl)

#### Responsive Features:
- Fluid typography (text-sm -> text-base -> text-lg)
- Grid layouts (1 col -> 2 col -> 3-4 col)
- Adaptive spacing (p-4 -> p-6 -> p-8)
- Touch-optimized buttons (min 44px height)
- Mobile-first BottomNav (sm only)
- Collapsible sidebars
- Responsive tables (horizontal scroll)
- Adaptive modals (full-screen mobile, centered desktop)

#### Performance:
- Lazy loading images
- Code splitting
- Virtual scrolling (long lists)
- Debounced search
- Optimized re-renders
- Cache strategies (React Query)

## Tech Stack

### Frontend
- **React 18.3.1** + TypeScript 5.6
- **Vite 5.4** - Lightning fast build tool
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **Framer Motion 12** - Production-ready animations
- **React Router 6.28** - Client-side routing
- **TanStack Query 5.60** - Data fetching & caching
- **Socket.io-client 4.8** - Real-time communication
- **Recharts 3.6** - Data visualization
- **Lucide React** - Beautiful icons
- **React Hot Toast** - Notifications
- **Zod 3.23** - Schema validation

### UI Components Library
- ProfileScore - CV to'liqlik tracking
- HeatmapAnalytics - Recharts heatmap
- MarketTrendsDashboard - Bozor statistikasi
- SwipeableJobCard - Tinder-style cards
- QuickApplyModal - Fast application
- VerificationBadge - Blue check system
- PremiumBadge - Featured badges
- ErrorBoundary - Error handling
- Skeleton Screens - Loading states
- EmptyStates - No content UI

### Custom Hooks
- useRealTimeNotifications - Socket.io integration
- useHaptic - Mobile vibration
- usePullToRefresh - Mobile gesture
- useOfflineStorage - IndexedDB wrapper
- useDebounce - Search optimization
- useMediaQuery - Responsive helpers
- useIntersectionObserver - Lazy loading
- useLocalStorage - Persistent state

### Backend (Ready for Integration)
- **Node.js** + Express + TypeScript
- **PostgreSQL 16** - Main database
- **Redis 7** - Caching & sessions
- **Socket.io** - Real-time server
- **JWT** - Authentication
- **Zod** - API validation
- **Docker** - Containerization

## Tez Boshlash

### Talablar

- Node.js 20+
- PostgreSQL 16+
- Redis 7+
- Docker & Docker Compose (opsiyonal)

### Docker bilan (Tavsiya etiladi)

```bash
# Loyihani clone qilish
git clone https://github.com/your-username/vakans-new.git
cd vakans-new

# Environment fayllarini yaratish
cp .env.example .env
cp backend/.env.example backend/.env

# Docker compose bilan ishga tushirish
docker-compose up -d

# Frontend: http://localhost:3000
# Backend API: http://localhost:5000/api
# PostgreSQL: localhost:5432
# Redis: localhost:6379
```

### Mahalliy (Development)

#### 1. Database Setup

```bash
# PostgreSQL yaratish
createdb vakans

# Init.sql faylini yuklash
psql -d vakans -f backend/init.sql
```

#### 2. Backend Setup

```bash
cd backend

# Dependencies o'rnatish
npm install

# .env faylini yaratish
cp .env.example .env

# Environment o'zgaruvchilarni sozlash
# .env faylida DATABASE_URL, REDIS_URL, JWT_SECRET va boshqalarni o'rnating

# Development mode
npm run dev

# Production build
npm run build
npm start
```

#### 3. Frontend Setup

```bash
# Asosiy papkaga qaytish
cd ..

# Dependencies o'rnatish
npm install

# .env faylini yaratish
cp .env.example .env

# Development server
npm run dev

# Production build
npm run build
npm run preview
```

## 📁 Loyiha Strukturasi

```
vakans-new/
├── backend/                      # Backend API (Node.js + Express)
│   ├── src/
│   │   ├── config/              # Database, Redis config
│   │   ├── middleware/          # Auth, validation middleware
│   │   ├── routes/              # API routes
│   │   ├── utils/               # Helper functions
│   │   └── index.ts             # Entry point
│   ├── Dockerfile
│   ├── init.sql                 # Database schema
│   └── package.json
├── src/                          # Frontend React app
│   ├── components/
│   │   ├── layout/              # Layout components
│   │   │   ├── Header.tsx       # Real-time notifications badge
│   │   │   ├── Footer.tsx       # Animated footer
│   │   │   ├── BottomNav.tsx    # Mobile navigation
│   │   │   └── Layout.tsx       # Main layout wrapper
│   │   ├── ui/                  # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── ProfileScore.tsx          # NEW: CV completion
│   │   │   ├── HeatmapAnalytics.tsx      # NEW: Analytics
│   │   │   ├── MarketTrendsDashboard.tsx # NEW: Market trends
│   │   │   ├── SwipeableJobCard.tsx      # NEW: Swipe cards
│   │   │   ├── QuickApplyModal.tsx       # NEW: Quick apply
│   │   │   ├── VerificationBadge.tsx     # NEW: Blue check
│   │   │   ├── Skeleton.tsx              # Loading states
│   │   │   ├── EmptyState.tsx            # Empty content
│   │   │   └── index.ts                  # Barrel exports
│   │   └── ErrorBoundary.tsx    # Global error handler
│   ├── contexts/
│   │   ├── AuthContext.tsx      # Authentication state
│   │   └── ThemeContext.tsx     # Dark mode state
│   ├── hooks/
│   │   ├── useDebounce.ts
│   │   ├── useMediaQuery.ts
│   │   ├── useLocalStorage.ts
│   │   ├── useRealTimeNotifications.ts   # NEW: Socket.io
│   │   ├── useHaptic.ts                  # NEW: Vibration
│   │   ├── usePullToRefresh.ts           # NEW: Pull gesture
│   │   ├── useOfflineStorage.ts          # NEW: IndexedDB
│   │   └── index.ts
│   ├── lib/
│   │   ├── api.ts               # API client (Axios)
│   │   ├── utils.ts             # Helper functions
│   │   ├── logger.ts            # NEW: Centralized logging
│   │   ├── env.ts               # NEW: Environment config
│   │   └── animations.ts        # Framer Motion presets
│   ├── pages/
│   │   ├── LandingPage.tsx
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx
│   │   │   └── RegisterPage.tsx
│   │   ├── jobs/
│   │   │   ├── JobsPage.tsx     # Real-time search & filter
│   │   │   └── JobDetailPage.tsx
│   │   ├── dashboard/
│   │   │   ├── WorkerDashboard.tsx      # With analytics
│   │   │   └── EmployerDashboard.tsx    # With heatmap
│   │   ├── profile/
│   │   │   └── ProfilePage.tsx          # With ProfileScore
│   │   ├── notifications/
│   │   │   └── NotificationsPage.tsx    # NEW: Real-time
│   │   ├── settings/
│   │   │   └── SettingsPage.tsx
│   │   └── NotFoundPage.tsx
│   ├── types/
│   │   └── index.ts             # TypeScript interfaces
│   ├── App.tsx                  # Main routing
│   ├── main.tsx                 # Entry point
│   └── index.css                # Global styles
├── public/
│   ├── manifest.json            # PWA manifest
│   ├── service-worker.js        # SW for offline
│   └── icons/                   # PWA icons
├── .env                         # Environment variables
├── .env.example                 # Example env file
├── docker-compose.yml           # Docker config
├── Dockerfile                   # Frontend Dockerfile
├── nginx.conf                   # Nginx config
├── tailwind.config.js           # Tailwind setup
├── vite.config.ts               # Vite config
├── tsconfig.json                # TypeScript config
└── README.md                    # This file
```

### Component Architecture

```
Layout Hierarchy:
├── App.tsx (ErrorBoundary)
    ├── Header (Real-time notifications)
    ├── Routes
    │   ├── LandingPage
    │   ├── JobsPage (Swipeable cards)
    │   ├── NotificationsPage (Socket.io)
    │   ├── ProfilePage (ProfileScore)
    │   └── Dashboard (Analytics)
    ├── Footer (Animated)
    └── BottomNav (Mobile only)
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Ro'yxatdan o'tish
- `POST /api/auth/login` - Kirish
- `GET /api/auth/me` - Hozirgi foydalanuvchi
- `POST /api/auth/refresh` - Token yangilash
- `POST /api/auth/logout` - Chiqish

### Jobs
- `GET /api/jobs` - Barcha ishlar (filter, search)
- `GET /api/jobs/:id` - Ish tafsilotlari
- `POST /api/jobs` - Yangi ish e'lon qilish (employer)
- `PUT /api/jobs/:id` - Ishni tahrirlash
- `DELETE /api/jobs/:id` - Ishni o'chirish
- `POST /api/jobs/:id/save` - Saqlash/Saqlanganlardan o'chirish
- `POST /api/jobs/:id/react` - Like/Dislike

### Applications
- `POST /api/applications` - Ishga ariza yuborish
- `GET /api/applications/my` - Mening arizalarim
- `GET /api/applications/job/:jobId` - Ish uchun arizalar
- `PUT /api/applications/:id/status` - Ariza holati o'zgartirish
- `DELETE /api/applications/:id` - Arizani bekor qilish

### Chat
- `GET /api/chat/rooms` - Chat xonalari
- `POST /api/chat/rooms` - Yangi chat xonasi
- `GET /api/chat/rooms/:id/messages` - Xabarlar
- `POST /api/chat/rooms/:id/messages` - Xabar yuborish

### Notifications
- `GET /api/notifications` - Bildirishnomalar
- `PUT /api/notifications/:id/read` - O'qilgan deb belgilash
- `PUT /api/notifications/read-all` - Barchasini o'qish

## 🔐 Environment O'zgaruvchilar

### Frontend (.env)
```env
# API Configuration
VITE_API_URL=http://localhost:5000/api
VITE_API_VERSION=v1

# Demo Mode (set to false for production)
VITE_DEMO_MODE=true

# App Configuration
VITE_APP_NAME=Vakans.uz
VITE_APP_VERSION=2.0.0

# Storage Keys
VITE_STORAGE_PREFIX=vakans_

# Features
VITE_ENABLE_PWA=true
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_ERROR_TRACKING=false

# Socket.io URL (optional, defaults to API_URL)
VITE_SOCKET_URL=http://localhost:5000

# Telegram Bot (Keyinroq qo'shiladi)
# VITE_TELEGRAM_BOT_TOKEN=your_bot_token
# VITE_TELEGRAM_CHAT_ID=your_chat_id
```

### Backend (.env)
```env
# Environment
NODE_ENV=development
PORT=5000

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/vakans

# Redis
REDIS_URL=redis://localhost:6379

# JWT Secrets (Min 32 characters!)
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production

# CORS
CORS_ORIGIN=http://localhost:3000

# Email (Optional)
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASS=your-app-password
```

### Docker Environment
```env
# Docker Compose bilan ishlashda
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=vakans
REDIS_PASSWORD=redis_password
```

## 👥 Default Admin

**Phone:** +998901234567  
**Password:** Admin@123

## 🐛 Tuzatilgan Xatolar

1. ✅ Backend Dockerfile - `npm ci --omit=dev` (zamonaviy npm uchun)
2. ✅ Redis ulanishi - `connectRedis()` qo'shildi
3. ✅ Express error handler - To'g'ri TypeScript type bilan
4. ✅ Environment fayllari - `.env.example` yaratildi
5. ✅ `.gitignore` - To'liq konfiguratsiya

## 📝 Development Scripts

### Frontend
```bash
npm run dev      # Development server
npm run build    # Production build
npm run preview  # Preview build
npm run lint     # ESLint
```

### Backend
```bash
npm run dev      # Development server (hot reload)
npm run build    # TypeScript compile
npm start        # Production server
```

## 🚀 Production Deploy

```bash
# Docker bilan
docker-compose up -d

# Environment o'zgaruvchilarni production qiymatlarga o'zgartiring:
# - NODE_ENV=production
# - CORS_ORIGIN=https://yourdomain.com
# - Kuchli JWT_SECRET va JWT_REFRESH_SECRET
# - PostgreSQL va Redis production URL
```

## 🎨 Xususiyatlar va Texnologiyalar

### ✅ To'liq Responsive Dizayn
- **Mobile First Approach** - 320px dan boshlab
- **Breakpoints**:
  - `sm`: 640px (Mobile landscape)
  - `md`: 768px (Tablet)
  - `lg`: 1024px (Laptop)
  - `xl`: 1280px (Desktop)
  - `2xl`: 1536px (Large screens)
- **Adaptive Components**:
  - Grid: 1 → 2 → 3 → 4 columns
  - Typography: text-sm → text-base → text-lg
  - Spacing: p-4 → p-6 → p-8
  - Modals: Full-screen mobile, centered desktop
- **Touch-optimized**: Min 44px touch targets (Apple HIG)
- **Mobile Navigation**: BottomNav 60px dan pastda (thumb-friendly)

### ✅ Real-Time Features (Socket.io)
- **Live Notifications** - Jonli xabarnomalar
- **Chat Messaging** - Real-time xabar almashish
- **Online Status** - Foydalanuvchi online/offline
- **Typing Indicators** - "Yozmoqda..." indikatori
- **Auto-reconnection** - Ulanish uzilganda avtomatik qayta ulanish
- **Connection Badge** - Header'da yashil nuqta (connected)

### ✅ Progressive Web App (PWA)
- **Offline Support** - Service Worker + Cache API
- **Install Prompt** - "Add to Home Screen"
- **Push Notifications** - Desktop bildirishnomalar
- **Background Sync** - Offline actions queue
- **App Manifest** - Native app kabi

### ✅ Performance Optimizations
- **Code Splitting** - Route-based lazy loading
- **Image Optimization** - Lazy loading, WebP format
- **React Query Caching** - Smart data caching
- **Debounced Search** - 500ms delay
- **Virtual Scrolling** - Long lists (1000+ items)
- **Memoization** - React.memo, useMemo, useCallback

### ✅ Animations (Framer Motion)
- **Page Transitions** - Smooth route changes
- **Micro-interactions** - Button hovers, card tilts
- **Scroll Animations** - Fade-in, slide-up
- **Skeleton Screens** - Loading placeholders
- **Toast Notifications** - Slide-in animations
- **Gesture Support** - Swipe, drag, pinch

### ✅ Dark Mode
- **Auto-detect** - System preference
- **Manual Toggle** - Header button
- **Smooth Transition** - Animated theme switching
- **Persistent** - localStorage
- **All Components** - 100% dark mode support

### ✅ Accessibility (a11y)
- **Keyboard Navigation** - Tab, Enter, Esc
- **ARIA Labels** - Screen reader support
- **Focus Indicators** - Visible focus states
- **Color Contrast** - WCAG AA compliant
- **Skip Links** - Jump to main content

### ✅ Security
- **JWT Authentication** - HttpOnly cookies
- **XSS Protection** - Input sanitization
- **CSRF Protection** - Token validation
- **Rate Limiting** - API throttling
- **Environment Variables** - Secure config
- **Error Boundary** - Graceful error handling

### ✅ Developer Experience
- **TypeScript** - Full type safety
- **ESLint** - Code quality
- **Prettier** - Code formatting (optional)
- **Git Hooks** - Pre-commit checks (optional)
- **Hot Module Replacement** - Instant updates
- **Error Logging** - Centralized logger

### ✅ Deployment Ready
- **Docker Support** - Full containerization
- **Nginx Config** - Production-ready
- **Environment Configs** - Dev/Prod separation
- **CI/CD Ready** - GitHub Actions compatible
- **Health Checks** - API endpoints monitoring
- **Database Migrations** - Version control

## 📄 Litsenziya

MIT License

## 🤝 Hissa qo'shish

Pull requestlar qabul qilinadi. Katta o'zgarishlar uchun avval issue oching.

---

## 👥 Loyiha Jamoasi

<table>
  <tr>
    <td align="center">
      <b>🎨 Frontend</b><br/>
      <sub><b>Xojisaid Mannobov</b></sub>
    </td>
    <td align="center">
      <b>⚙️ Backend</b><br/>
      <sub><b>Xasanboyev Xurshidbek</b></sub>
    </td>
  </tr>
</table>

### 🏛️ Tashkilot

<table>
  <tr>
    <td align="center">
      <img src="https://img.shields.io/badge/KUAF-Startuplar%20bo'limi-blue?style=for-the-badge" alt="KUAF"/>
    </td>
  </tr>
  <tr>
    <td align="center">
      <b>📋 Startuplar bilan ishlash bo'limi</b><br/>
      <b>Rahbar:</b> Tuychiyeev Javlonbek
    </td>
  </tr>
</table>

---

<p align="center">
  <b>Built with ❤️ for O'zbekiston job market</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react" alt="React"/>
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css" alt="Tailwind"/>
  <img src="https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite" alt="Vite"/>
</p>







