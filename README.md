# Vakans.uz - Ish Qidirish Platformasi

O'zbekiston uchun zamonaviy ish qidirish va e'lon qilish platformasi.

## ✨ Xususiyatlar

- 🔐 **Xavfsiz Autentifikatsiya** - JWT tokenlar bilan
- 👷 **Ishchi profili** - CV, ko'nikmalar, tajriba
- 🏢 **Ish beruvchi kabineti** - E'lonlar, arizalar boshqaruvi
- 💬 **Real-time Chat** - Socket.io yordamida
- 📊 **Admin panel** - To'liq statistika va boshqaruv
- 🔔 **Bildirishnomalar** - Real-time yangiliklar
- 🌐 **Responsive dizayn** - Barcha qurilmalarda ishlaydi

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite 5
- Tailwind CSS 3.4
- React Query (TanStack Query) 5
- React Router 6
- Socket.io-client
- Axios

### Backend
- Node.js + Express
- TypeScript
- PostgreSQL 16
- Redis 7
- Socket.io
- JWT Authentication
- Zod Validation

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
├── backend/               # Backend API
│   ├── src/
│   │   ├── config/       # Database, Redis konfiguratsiya
│   │   ├── middleware/   # Auth, validation middleware
│   │   ├── routes/       # API routes
│   │   ├── utils/        # Yordamchi funksiyalar
│   │   └── index.ts      # Entry point
│   ├── Dockerfile
│   ├── init.sql          # Database schema
│   └── package.json
├── src/                  # Frontend React app
│   ├── components/       # UI komponentlar
│   ├── contexts/         # React Context
│   ├── lib/             # API client, utils
│   ├── pages/           # Sahifalar
│   ├── types/           # TypeScript types
│   └── main.tsx
├── docker-compose.yml    # Docker konfiguratsiya
├── Dockerfile           # Frontend Dockerfile
├── nginx.conf           # Nginx konfiguratsiya
└── README.md

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
VITE_API_URL=/api
```

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/vakans
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-key-min-32-chars
CORS_ORIGIN=http://localhost:3000
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

## 🎨 Xususiyatlar

- ✅ **Ishchilar uchun**: Ish qidirish, ariza berish, chat, bildirishnomalar
- ✅ **Ish beruvchilar uchun**: E'lon joylash, arizalarni ko'rish, ishchilar bilan muloqot
- ✅ **Admin panel**: Foydalanuvchilar, ishlar, kategoriyalar boshqaruvi
- ✅ **Real-time**: Socket.io orqali jonli xabarlar va bildirishnomalar
- ✅ **Responsive**: Mobil, tablet, desktop uchun moslashgan
- ✅ **Dark Mode**: Tungi rejim qo'llab-quvvatlash

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

