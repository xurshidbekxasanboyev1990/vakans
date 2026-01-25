# 🚀 Vakans.uz Deploy Qo'llanmasi

## Server ma'lumotlari
- **Domain:** vakans.uz
- **Server IP:** 77.237.239.235
- **Ports:** 80 (HTTP), 443 (HTTPS), 5000 (API)

## 1. Serverga ulanish

```bash
ssh root@77.237.239.235
```

## 2. Docker va Docker Compose o'rnatish

```bash
# Docker o'rnatish
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Docker Compose o'rnatish
apt install docker-compose-plugin -y

# Docker ishga tushirish
systemctl start docker
systemctl enable docker
```

## 3. Loyihani serverga yuklash

```bash
# Loyiha papkasini yaratish
mkdir -p /var/www/vakans.uz
cd /var/www/vakans.uz

# Git orqali yuklash (agar repo mavjud bo'lsa)
git clone https://github.com/your-repo/vakans.git .

# Yoki SCP orqali yuklash (Windows'dan)
# scp -r C:\Users\user\Desktop\vakans\* root@77.237.239.235:/var/www/vakans.uz/
```

## 4. Environment fayllarini sozlash

```bash
# Production .env ni nusxalash
cp .env.production .env
cp backend/.env.production backend/.env
```

## 5. Docker Compose bilan ishga tushirish

```bash
# Build va ishga tushirish
docker compose up -d --build

# Loglarni ko'rish
docker compose logs -f

# Statusni tekshirish
docker compose ps
```

## 6. SSL sertifikat olish (Let's Encrypt)

```bash
# Certbot o'rnatish
apt install certbot -y

# SSL sertifikat olish
certbot certonly --standalone -d vakans.uz -d www.vakans.uz

# SSL nginx config ni ishlatish
cp nginx.ssl.conf nginx.conf
docker compose restart frontend
```

## 7. Firewall sozlash

```bash
# UFW o'rnatish va sozlash
apt install ufw -y
ufw allow 22
ufw allow 80
ufw allow 443
ufw allow 5000
ufw enable
```

## 8. Database migrationlarni ishlatish

```bash
# Backend konteynerga kirish
docker compose exec backend sh

# Prisma migration
npx prisma migrate deploy
npx prisma db seed

# Chiqish
exit
```

## 9. Foydali buyruqlar

```bash
# Konteynerlarni qayta ishga tushirish
docker compose restart

# Loglarni ko'rish
docker compose logs -f backend
docker compose logs -f frontend

# Konteynerga kirish
docker compose exec backend sh
docker compose exec frontend sh

# Barcha konteynerlarni to'xtatish
docker compose down

# Volumelar bilan o'chirish
docker compose down -v

# Build cache'ni tozalash
docker builder prune -f
```

## 10. Domain DNS sozlash

DNS provideringizda quyidagi yozuvlarni qo'shing:

| Type | Name | Value |
|------|------|-------|
| A | @ | 77.237.239.235 |
| A | www | 77.237.239.235 |
| CNAME | api | vakans.uz |

## 11. SSL avtomatik yangilash (Cron)

```bash
# Crontab ochish
crontab -e

# Quyidagi qatorni qo'shish (har kuni soat 3:00 da)
0 3 * * * certbot renew --quiet && docker compose restart frontend
```

## 12. Monitoring

```bash
# Docker resurslarini ko'rish
docker stats

# Disk hajmini ko'rish
df -h

# Xotira va CPU
htop
```

---

## Login ma'lumotlari

| Rol | Telefon | Parol |
|-----|---------|-------|
| 👤 Admin | +998901234567 | Admin@123456 |
| 👔 Demo Employer | +998909876543 | Demo@123456 |
| 👷 Demo Worker | +998901112233 | Demo@123456 |

---

## Muammo bo'lsa

1. Loglarni tekshiring: `docker compose logs -f`
2. Konteynerlarni qayta ishga tushiring: `docker compose restart`
3. Build ni qayta qiling: `docker compose up -d --build`
