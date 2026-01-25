// ===========================================
// Database Seeder for Vakans.uz
// Initial categories and admin user
// ===========================================

import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// ===========================================
// Categories Data
// ===========================================
const categories = [
    {
        name: 'IT & Dasturlash',
        nameUz: 'IT va Dasturlash',
        nameRu: 'IT и Программирование',
        nameEn: 'IT & Programming',
        slug: 'it-programming',
        icon: '💻',
        color: '#3B82F6',
        sortOrder: 1,
    },
    {
        name: 'Marketing & SMM',
        nameUz: 'Marketing va SMM',
        nameRu: 'Маркетинг и SMM',
        nameEn: 'Marketing & SMM',
        slug: 'marketing-smm',
        icon: '📊',
        color: '#10B981',
        sortOrder: 2,
    },
    {
        name: 'Dizayn',
        nameUz: 'Dizayn',
        nameRu: 'Дизайн',
        nameEn: 'Design',
        slug: 'design',
        icon: '🎨',
        color: '#8B5CF6',
        sortOrder: 3,
    },
    {
        name: 'Savdo & Sotish',
        nameUz: 'Savdo va Sotish',
        nameRu: 'Продажи',
        nameEn: 'Sales',
        slug: 'sales',
        icon: '🛒',
        color: '#F59E0B',
        sortOrder: 4,
    },
    {
        name: 'Buxgalteriya & Moliya',
        nameUz: 'Buxgalteriya va Moliya',
        nameRu: 'Бухгалтерия и Финансы',
        nameEn: 'Accounting & Finance',
        slug: 'accounting-finance',
        icon: '💰',
        color: '#EF4444',
        sortOrder: 5,
    },
    {
        name: 'Ta\'lim',
        nameUz: 'Ta\'lim',
        nameRu: 'Образование',
        nameEn: 'Education',
        slug: 'education',
        icon: '📚',
        color: '#06B6D4',
        sortOrder: 6,
    },
    {
        name: 'Tibbiyot & Salomatlik',
        nameUz: 'Tibbiyot va Salomatlik',
        nameRu: 'Медицина и Здоровье',
        nameEn: 'Healthcare',
        slug: 'healthcare',
        icon: '⚕️',
        color: '#EC4899',
        sortOrder: 7,
    },
    {
        name: 'Qurilish & Arxitektura',
        nameUz: 'Qurilish va Arxitektura',
        nameRu: 'Строительство и Архитектура',
        nameEn: 'Construction & Architecture',
        slug: 'construction',
        icon: '🏗️',
        color: '#F97316',
        sortOrder: 8,
    },
    {
        name: 'Transport & Logistika',
        nameUz: 'Transport va Logistika',
        nameRu: 'Транспорт и Логистика',
        nameEn: 'Transport & Logistics',
        slug: 'transport-logistics',
        icon: '🚚',
        color: '#6366F1',
        sortOrder: 9,
    },
    {
        name: 'Restoran & Mehmonxona',
        nameUz: 'Restoran va Mehmonxona',
        nameRu: 'Рестораны и Гостиницы',
        nameEn: 'Restaurant & Hotel',
        slug: 'horeca',
        icon: '🍽️',
        color: '#84CC16',
        sortOrder: 10,
    },
    {
        name: 'Ishlab chiqarish',
        nameUz: 'Ishlab chiqarish',
        nameRu: 'Производство',
        nameEn: 'Manufacturing',
        slug: 'manufacturing',
        icon: '🏭',
        color: '#64748B',
        sortOrder: 11,
    },
    {
        name: 'Admin & Ofis',
        nameUz: 'Admin va Ofis ishlari',
        nameRu: 'Администрация и Офис',
        nameEn: 'Admin & Office',
        slug: 'admin-office',
        icon: '🗂️',
        color: '#78716C',
        sortOrder: 12,
    },
    {
        name: 'HR & Kadrlar',
        nameUz: 'HR va Kadrlar bo\'limi',
        nameRu: 'HR и Кадры',
        nameEn: 'HR & Recruiting',
        slug: 'hr-recruiting',
        icon: '👥',
        color: '#A855F7',
        sortOrder: 13,
    },
    {
        name: 'Yuridik xizmatlar',
        nameUz: 'Yuridik xizmatlar',
        nameRu: 'Юридические услуги',
        nameEn: 'Legal Services',
        slug: 'legal',
        icon: '⚖️',
        color: '#1E293B',
        sortOrder: 14,
    },
    {
        name: 'Xavfsizlik',
        nameUz: 'Xavfsizlik xizmatlari',
        nameRu: 'Охрана и Безопасность',
        nameEn: 'Security',
        slug: 'security',
        icon: '🛡️',
        color: '#0F172A',
        sortOrder: 15,
    },
    {
        name: 'Boshqa',
        nameUz: 'Boshqa sohalar',
        nameRu: 'Другое',
        nameEn: 'Other',
        slug: 'other',
        icon: '📋',
        color: '#94A3B8',
        sortOrder: 99,
    },
];

// ===========================================
// Uzbekistan Regions
// ===========================================
export const regions = [
    'Toshkent shahri',
    'Toshkent viloyati',
    'Andijon viloyati',
    'Buxoro viloyati',
    'Farg\'ona viloyati',
    'Jizzax viloyati',
    'Xorazm viloyati',
    'Namangan viloyati',
    'Navoiy viloyati',
    'Qashqadaryo viloyati',
    'Qoraqalpog\'iston Respublikasi',
    'Samarqand viloyati',
    'Sirdaryo viloyati',
    'Surxondaryo viloyati',
];

// ===========================================
// Main Seed Function
// ===========================================
async function main() {
    console.log('🌱 Starting database seed...\n');

    // ===========================================
    // 1. Create Categories
    // ===========================================
    console.log('📁 Creating categories...');

    for (const category of categories) {
        await prisma.category.upsert({
            where: { slug: category.slug },
            update: category,
            create: category,
        });
    }

    console.log(`✅ Created ${categories.length} categories\n`);

    // ===========================================
    // 2. Create Admin User
    // ===========================================
    console.log('👤 Creating admin user...');

    const adminPassword = await bcrypt.hash('Admin@123456', 12);

    const admin = await prisma.user.upsert({
        where: { phone: '+998901234567' },
        update: {},
        create: {
            phone: '+998901234567',
            password: adminPassword,
            firstName: 'Admin',
            lastName: 'Vakans',
            role: UserRole.ADMIN,
            isVerified: true,
            region: 'Toshkent shahri',
        },
    });

    console.log(`✅ Admin user created: ${admin.phone}\n`);

    // ===========================================
    // 3. Create Demo Employer
    // ===========================================
    console.log('🏢 Creating demo employer...');

    const employerPassword = await bcrypt.hash('Demo@123456', 12);

    const employer = await prisma.user.upsert({
        where: { phone: '+998909876543' },
        update: {},
        create: {
            phone: '+998909876543',
            password: employerPassword,
            firstName: 'Demo',
            lastName: 'Employer',
            role: UserRole.EMPLOYER,
            isVerified: true,
            companyName: 'Demo Company LLC',
            companyDescription: 'Bu demo kompaniya hisobi. Vakans.uz platformasini sinab ko\'rish uchun yaratilgan.',
            region: 'Toshkent shahri',
            website: 'https://demo.vakans.uz',
        },
    });

    console.log(`✅ Demo employer created: ${employer.phone}\n`);

    // ===========================================
    // 4. Create Demo Worker
    // ===========================================
    console.log('👷 Creating demo worker...');

    const workerPassword = await bcrypt.hash('Demo@123456', 12);

    const worker = await prisma.user.upsert({
        where: { phone: '+998901112233' },
        update: {},
        create: {
            phone: '+998901112233',
            password: workerPassword,
            firstName: 'Demo',
            lastName: 'Worker',
            role: UserRole.WORKER,
            isVerified: true,
            bio: 'Tajribali dasturchi. 5 yillik tajriba.',
            skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'PostgreSQL'],
            experienceYears: 5,
            education: 'Oliy ma\'lumot - TATU',
            languages: ['O\'zbek', 'Ingliz', 'Rus'],
            region: 'Toshkent shahri',
        },
    });

    console.log(`✅ Demo worker created: ${worker.phone}\n`);

    // ===========================================
    // 5. Create Sample Jobs
    // ===========================================
    console.log('💼 Creating sample jobs...');

    const itCategory = await prisma.category.findUnique({
        where: { slug: 'it-programming' },
    });

    const marketingCategory = await prisma.category.findUnique({
        where: { slug: 'marketing-smm' },
    });

    const sampleJobs = [
        {
            employerId: employer.id,
            categoryId: itCategory?.id,
            title: 'Senior React Developer',
            description: `Biz jamoamizga tajribali React dasturchisini qidiryapmiz.

Majburiyatlar:
- React, TypeScript va zamonaviy frontend texnologiyalari bilan ishlash
- REST API va GraphQL integratsiyasi
- Kod sifatini ta'minlash va code review
- Junior dasturchilarga mentorlik qilish

Biz taklif qilamiz:
- Raqobatbardosh maosh
- Zamonaviy ofis yoki remote ishlash imkoniyati
- Professional rivojlanish uchun imkoniyatlar
- Do'stona jamoa`,
            requirements: [
                'React va TypeScript bo\'yicha 3+ yil tajriba',
                'Redux, MobX yoki boshqa state management',
                'REST API va GraphQL bilan ishlash tajribasi',
                'Git va CI/CD bilan tanish',
                'Ingliz tili (technical documentation o\'qish)',
            ],
            benefits: [
                'Raqobatbardosh maosh',
                'Remote ishlash imkoniyati',
                'Flexible jadval',
                'Tibbiy sug\'urta',
                'Professional rivojlanish',
            ],
            salaryMin: 15000000,
            salaryMax: 25000000,
            salaryType: 'MONTHLY',
            currency: 'UZS',
            location: 'Toshkent',
            region: 'Toshkent shahri',
            workType: 'FULL_TIME',
            status: 'ACTIVE',
            isFeatured: true,
        },
        {
            employerId: employer.id,
            categoryId: marketingCategory?.id,
            title: 'SMM Manager',
            description: `Ijtimoiy tarmoqlar bo'yicha mutaxassis izlayapmiz.

Majburiyatlar:
- Instagram, Facebook, Telegram va boshqa platformalarda akkauntlarni boshqarish
- Kontent rejasi tuzish va kontent yaratish
- Reklama kampaniyalarini boshqarish
- Analitika va hisobotlar tayyorlash

Talablar:
- SMM sohasida 2+ yil tajriba
- Grafik dizayn asoslari (Canva, Figma)
- Kreativ fikrlash
- O'zbek va rus tillarida yozma kommunikatsiya`,
            requirements: [
                'SMM sohasida 2+ yil tajriba',
                'Grafik dizayn asoslari',
                'Kreativ fikrlash',
                'O\'zbek va rus tillarida yozma kommunikatsiya',
                'Instagram, Facebook, Telegram bilan ishlash tajribasi',
            ],
            benefits: [
                '8-10 mln so\'m maosh',
                'Bonuslar',
                'Qulaylik uchun ofis',
                'Do\'stona jamoa',
            ],
            salaryMin: 8000000,
            salaryMax: 10000000,
            salaryType: 'MONTHLY',
            currency: 'UZS',
            location: 'Toshkent',
            region: 'Toshkent shahri',
            workType: 'FULL_TIME',
            status: 'ACTIVE',
        },
    ];

    for (const jobData of sampleJobs) {
        await prisma.job.create({
            data: jobData as any,
        });
    }

    console.log(`✅ Created ${sampleJobs.length} sample jobs\n`);

    // ===========================================
    // Summary
    // ===========================================
    console.log('='.repeat(50));
    console.log('🎉 Database seeding completed successfully!\n');
    console.log('📋 Summary:');
    console.log(`   - Categories: ${categories.length}`);
    console.log(`   - Admin: +998901234567 / Admin@123456`);
    console.log(`   - Demo Employer: +998909876543 / Demo@123456`);
    console.log(`   - Demo Worker: +998901112233 / Demo@123456`);
    console.log(`   - Sample Jobs: ${sampleJobs.length}`);
    console.log('='.repeat(50));
}

// ===========================================
// Run Seed
// ===========================================
main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
