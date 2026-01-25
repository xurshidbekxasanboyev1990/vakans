# Vakans.uz Backend

**Production-ready NestJS Backend** uchun Vakans.uz ish qidirish platformasi.

## 🚀 Texnologiyalar

- **NestJS 10** - Modern Node.js framework
- **PostgreSQL 16** - Ma'lumotlar bazasi
- **Prisma 5** - ORM & migrations
- **Redis 7** - Caching & sessions
- **Socket.io** - Real-time messaging
- **Swagger** - API documentation
- **JWT** - Authentication
- **Docker** - Containerization

## 📁 Loyiha Strukturasi

```
backend/
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.ts          # Initial data
├── src/
│   ├── config/          # Configuration
│   ├── shared/          # Shared modules (Prisma, Redis)
│   ├── modules/
│   │   ├── auth/        # Authentication (JWT, login, register)
│   │   ├── users/       # User management
│   │   ├── jobs/        # Job listings
│   │   ├── categories/  # Job categories
│   │   ├── applications/# Job applications
│   │   ├── chat/        # Real-time messaging
│   │   ├── notifications/# Push notifications
│   │   ├── admin/       # Admin dashboard
│   │   ├── upload/      # File uploads
│   │   └── health/      # Health checks
│   ├── app.module.ts    # Root module
│   └── main.ts          # Application entry
├── .env.example         # Environment template
├── docker-compose.yml   # Docker services
└── Dockerfile           # Production image
```

## 🛠️ O'rnatish

### 1. Dependencies

```bash
cd backend
npm install
```

### 2. Environment variables

```bash
cp .env.example .env
# .env faylini sozlang
```

### 3. Database

```bash
# Prisma client generate
npm run prisma:generate

# Migrations
npm run prisma:migrate

# Seed (initial data)
npm run prisma:seed
```

### 4. Development Server

```bash
npm run start:dev
```

## 🐳 Docker bilan ishga tushirish

```bash
# Barcha servislarni ishga tushirish
docker-compose up -d

# Faqat database va Redis
docker-compose up -d postgres redis

# Loglarni ko'rish
docker-compose logs -f backend
```

## 📚 API Documentation

Server ishga tushgandan so'ng Swagger hujjatlari:

```
http://localhost:3000/api/docs
```

## 🔐 Authentication

### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "phone": "+998901234567",
  "password": "Password123!",
  "firstName": "Ism",
  "lastName": "Familiya",
  "role": "WORKER"
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "phone": "+998901234567",
  "password": "Password123!"
}
```

### Response
```json
{
  "user": { "id": "...", "phone": "...", ... },
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

## 🌐 WebSocket

### Chat
```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000/chat', {
  auth: { token: 'your_jwt_token' }
});

socket.on('connected', () => console.log('Connected'));
socket.on('newMessage', (data) => console.log('Message:', data));

socket.emit('sendMessage', {
  roomId: 'room_id',
  content: 'Salom!'
});
```

### Notifications
```javascript
const notifySocket = io('http://localhost:3000/notifications', {
  auth: { token: 'your_jwt_token' }
});

notifySocket.on('notification', (notification) => {
  console.log('New notification:', notification);
});
```

## 📝 Scripts

| Script | Description |
|--------|-------------|
| `npm run start:dev` | Development server with hot reload |
| `npm run start:prod` | Production server |
| `npm run build` | Build for production |
| `npm run prisma:studio` | Prisma GUI |
| `npm run prisma:migrate` | Run migrations |
| `npm run prisma:seed` | Seed database |
| `npm run lint` | ESLint |
| `npm run test` | Run tests |

## 🔒 Demo Accounts

```
Admin:
  Phone: +998901234567
  Password: Admin@123456

Employer:
  Phone: +998909876543
  Password: Demo@123456

Worker:
  Phone: +998901112233
  Password: Demo@123456
```

## 📊 API Endpoints

### Auth
- `POST /api/auth/register` - Ro'yxatdan o'tish
- `POST /api/auth/login` - Kirish
- `POST /api/auth/logout` - Chiqish
- `POST /api/auth/refresh` - Token yangilash
- `GET /api/auth/me` - Joriy foydalanuvchi

### Users
- `GET /api/users` - Foydalanuvchilar ro'yxati
- `GET /api/users/:id` - Foydalanuvchi ma'lumotlari
- `PUT /api/users/:id` - Profil yangilash
- `DELETE /api/users/:id` - Hisobni o'chirish

### Jobs
- `GET /api/jobs` - Ishlar ro'yxati
- `GET /api/jobs/:id` - Ish ma'lumotlari
- `POST /api/jobs` - Ish yaratish (Employer)
- `PUT /api/jobs/:id` - Ish yangilash
- `DELETE /api/jobs/:id` - Ishni o'chirish

### Applications
- `GET /api/applications/my` - Mening arizalarim (Worker)
- `GET /api/applications/received` - Kelgan arizalar (Employer)
- `POST /api/applications` - Ariza topshirish
- `PUT /api/applications/:id/status` - Status yangilash

### Chat
- `GET /api/chat/rooms` - Chat ro'yxati
- `POST /api/chat/rooms` - Chat yaratish
- `GET /api/chat/rooms/:id/messages` - Xabarlar

### Notifications
- `GET /api/notifications` - Bildirishnomalar
- `POST /api/notifications/:id/read` - O'qilgan deb belgilash

### Admin
- `GET /api/admin/dashboard` - Dashboard statistika
- `GET /api/admin/users` - Foydalanuvchilar boshqaruvi
- `GET /api/admin/jobs/pending` - Kutilayotgan ishlar
- `PUT /api/admin/jobs/:id/approve` - Ishni tasdiqlash

## 🎯 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | development |
| `PORT` | Server port | 3000 |
| `DATABASE_URL` | PostgreSQL connection | - |
| `REDIS_HOST` | Redis host | localhost |
| `REDIS_PORT` | Redis port | 6379 |
| `REDIS_PASSWORD` | Redis password | - |
| `JWT_SECRET` | JWT secret key | - |
| `JWT_REFRESH_SECRET` | Refresh token secret | - |
| `JWT_EXPIRES_IN` | Token expiry | 15m |
| `FRONTEND_URL` | Frontend URL | http://localhost:5173 |

## 📄 License

MIT License - Vakans.uz Team
