# ===========================================
# Vakans.uz Local Development Setup
# ===========================================

## Quick Start (Docker)

### 1. Start all services:
```bash
docker-compose -f docker-compose.local.yml up -d
```

### 2. Check status:
```bash
docker-compose -f docker-compose.local.yml ps
```

### 3. View logs:
```bash
# All logs
docker-compose -f docker-compose.local.yml logs -f

# Backend only
docker-compose -f docker-compose.local.yml logs -f backend
```

### 4. Stop services:
```bash
docker-compose -f docker-compose.local.yml down
```

### 5. Reset everything (delete data):
```bash
docker-compose -f docker-compose.local.yml down -v
```

---

## Quick Start (Without Docker)

### 1. Start PostgreSQL & Redis (Docker):
```bash
docker-compose -f docker-compose.local.yml up -d postgres redis
```

### 2. Backend:
```bash
cd backend
cp .env.local .env
npm install
npx prisma migrate deploy
npx prisma db seed
npm run start:dev
```

### 3. Frontend:
```bash
# Root folder
cp .env.local .env
npm install
npm run dev
```

---

## Access URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5000/api |
| API Docs (Swagger) | http://localhost:5000/api/docs |
| pgAdmin | http://localhost:5050 |

---

## Test Accounts

| Role | Phone | Password |
|------|-------|----------|
| Admin | +998901234567 | Admin@123456 |
| Employer | +998909876543 | Admin@123456 |
| Worker | +998901112233 | Admin@123456 |

---

## Database Access

### pgAdmin:
- URL: http://localhost:5050
- Email: admin@local.dev
- Password: admin123

### Direct connection:
- Host: localhost
- Port: 5432
- Database: vakans_local
- User: vakans
- Password: vakans123

---

## Common Commands

### Prisma:
```bash
cd backend

# Run migrations
npx prisma migrate deploy

# Create new migration
npx prisma migrate dev --name migration_name

# Reset database
npx prisma migrate reset

# Open Prisma Studio
npx prisma studio

# Seed database
npx prisma db seed
```

### Docker:
```bash
# Rebuild backend
docker-compose -f docker-compose.local.yml build backend

# Restart backend
docker-compose -f docker-compose.local.yml restart backend

# Enter backend container
docker exec -it vakans-local-backend sh

# Enter postgres container
docker exec -it vakans-local-postgres psql -U vakans -d vakans_local
```

---

## Troubleshooting

### Port already in use:
```bash
# Windows PowerShell
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or change port in .env.local
```

### Database connection error:
```bash
# Check if postgres is running
docker-compose -f docker-compose.local.yml ps postgres

# Check postgres logs
docker-compose -f docker-compose.local.yml logs postgres
```

### Clear Docker cache:
```bash
docker-compose -f docker-compose.local.yml down -v
docker system prune -a
docker-compose -f docker-compose.local.yml up -d --build
```
