# Vakans.uz - Premium UI/UX Components

Bu yerda barcha yangi yaratilgan komponentlarning qisqacha tavsifi va foydalanish yo'riqnomalari berilgan.

## ✅ Yaratilgan Premium Komponentlar

### 1. 🍞 Breadcrumbs - Navigation History
**Manzil:** `src/components/ui/Breadcrumbs.tsx`

Foydalanuvchilarga joriy sahifa joylashuvini ko'rsatadi va tezkor navigatsiya imkonini beradi.

**Xususiyatlar:**
- ✨ Animated transitions (har bir element ketma-ket paydo bo'ladi)
- 🏠 Icon qo'llab-quvvatlash (Home icon va boshqalar)
- 🔗 Link integratsiyasi
- 🎨 Dark mode support
- ➡️ Chevron separatorlar

**Foydalanish:**
```tsx
import { Breadcrumbs } from '@/components/ui'
import { Home } from 'lucide-react'

<Breadcrumbs
  items={[
    { label: 'Bosh sahifa', href: '/', icon: <Home className="h-4 w-4" /> },
    { label: 'Ishlar', href: '/jobs' },
    { label: 'Frontend Developer' }
  ]}
/>
```

---

### 2. 🏷️ FilterChips - Selected Filters Display
**Manzil:** `src/components/ui/FilterChips.tsx`

Tanlangan filtrlarni ko'rsatadi va ularni olib tashlash imkonini beradi.

**Xususiyatlar:**
- ❌ Removable chips (X tugmasi bilan)
- 🎨 5 ta rang varianti (primary, secondary, success, warning, danger)
- ✨ Animated addition/removal
- 🗑️ "Clear all" tugmasi
- 📱 Responsive design

**Foydalanish:**
```tsx
import { FilterChips } from '@/components/ui'

const [filters, setFilters] = useState([
  { id: '1', label: 'Kategoriya', value: 'IT', color: 'primary' },
  { id: '2', label: 'Joylashuv', value: 'Toshkent', color: 'secondary' },
])

<FilterChips
  filters={filters}
  onRemove={(id) => setFilters(filters.filter(f => f.id !== id))}
  onClearAll={() => setFilters([])}
/>
```

---

### 3. 💬 Tooltip - Contextual Information
**Manzil:** `src/components/ui/Tooltip.tsx`

Elementlarning ustiga kelganda qo'shimcha ma'lumot ko'rsatadi.

**Xususiyatlar:**
- 📍 4 ta pozitsiya (top, bottom, left, right)
- ⏱️ Configurable delay (200ms default)
- ⬆️ Arrow indicator
- 🖱️ Click outside detection
- ♿ Accessibility (role="tooltip")

**Foydalanish:**
```tsx
import { Tooltip } from '@/components/ui'

<Tooltip content="Bu tugma profilni saqlaydi" position="top" delay={300}>
  <button>Saqlash</button>
</Tooltip>
```

---

### 4. 🎴 Card3DTilt - Interactive 3D Cards
**Manzil:** `src/components/ui/Card3DTilt.tsx`

Karta komponentlarini 3D effekt bilan interaktiv qiladi.

**Xususiyatlar:**
- 🖱️ Mouse-follow 3D transform
- ✨ Glare effect (nur effekti)
- 🎚️ Adjustable intensity
- 🚀 Performance optimized
- 🎭 Smooth animations

**Foydalanish:**
```tsx
import { Card3DTilt } from '@/components/ui'

<Card3DTilt intensity={20} glareEffect={true}>
  <div className="p-6 bg-white rounded-2xl shadow-lg">
    <h3>Premium Card</h3>
    <p>3D effekt bilan</p>
  </div>
</Card3DTilt>
```

---

### 5. ⌨️ CommandPalette - Quick Actions (CMD+K)
**Manzil:** `src/components/ui/CommandPalette.tsx`

Power users uchun tezkor buyruqlar palitasi.

**Xususiyatlar:**
- ⌨️ Keyboard shortcut (CMD+K / CTRL+K)
- 🔍 Live search filtering
- 🏷️ Category grouping
- ⬆️⬇️ Arrow key navigation
- ⏎ Enter to execute
- ⎋ Escape to close

**Foydalanish:**
```tsx
import { CommandPalette } from '@/components/ui'

<CommandPalette
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  commands={[
    {
      id: 'profile',
      label: 'Profilga o\'tish',
      category: 'Navigatsiya',
      action: () => navigate('/profile')
    },
    // ... more commands
  ]}
/>
```

---

### 6. 📤 FileUpload - Drag & Drop Upload
**Manzil:** `src/components/ui/FileUpload.tsx`

Fayl yuklash uchun drag-and-drop interfeys.

**Xususiyatlar:**
- 🖱️ Drag & drop functionality
- 📊 File size validation (10MB default)
- 🖼️ Image preview generation
- 📈 Upload progress tracking
- ✅ Success/error states
- 🎯 Multiple file support (5 max default)
- 📁 File type detection & icons

**Foydalanish:**
```tsx
import { FileUpload } from '@/components/ui'

<FileUpload
  accept="image/*"
  maxSize={5}
  maxFiles={3}
  onChange={(files) => handleUpload(files)}
  uploading={isUploading}
  progress={uploadProgress}
/>
```

---

### 7. 📱 PWAInstallPrompt - App Installation Banner
**Manzil:** `src/components/ui/PWAInstallPrompt.tsx`

Foydalanuvchilarga ilovani o'rnatish uchun prompt ko'rsatadi.

**Xususiyatlar:**
- 🔔 Automatic detection (beforeinstallprompt)
- ⏱️ Smart timing (30 sekund kechikish)
- 💾 Persist dismissal (localStorage)
- 📱 Mobile & desktop support
- ✨ Animated entrance
- 🎨 Beautiful design

**Foydalanish:**
```tsx
// App.tsx da
import { PWAInstallPrompt } from '@/components/ui'

function AppRoutes() {
  return (
    <>
      <PWAInstallPrompt />
      <Routes>
        {/* ... routes */}
      </Routes>
    </>
  )
}
```

---

## 🎣 Premium Hooks

### 8. useParallax - Scroll Parallax Effect
**Manzil:** `src/hooks/useParallax.ts`

Scroll bo'yicha parallax effekti uchun hook.

**Xususiyatlar:**
- 📜 Scroll-triggered animations
- ⚡ Performance optimized (passive listeners)
- 🎚️ Configurable speed
- ⬆️⬇️ Direction control (up/down)
- 👀 Viewport detection

**Foydalanish:**
```tsx
import { useParallax } from '@/hooks'

function HeroSection() {
  const parallaxRef = useParallax({ speed: 0.5, direction: 'up' })

  return (
    <div ref={parallaxRef} className="relative">
      <img src="/hero-bg.jpg" alt="Background" />
    </div>
  )
}
```

---

## 🚀 PWA Support

### Service Worker
**Manzil:** `public/service-worker.js`

**Xususiyatlar:**
- 📦 Static asset caching
- 🔄 Network-first strategy
- 📴 Offline support
- 🔔 Push notifications
- 🔄 Background sync

### Manifest
**Manzil:** `public/manifest.json`

**Xususiyatlar:**
- 📱 App icons (72px - 512px)
- 🎨 Theme colors
- 📸 Screenshots
- 🔗 Shortcuts (Ishlar, Ariza)
- 🌐 O'zbek tili support

---

## 📊 Performance Metrics

**Before:**
- First Contentful Paint: 1.8s
- Time to Interactive: 3.5s
- Bundle Size: 450KB

**Target After Implementation:**
- First Contentful Paint: <1.2s
- Time to Interactive: <2s
- Bundle Size: <300KB

---

## 🎨 Design Tokens

### Colors
```css
Primary: #6366f1 (Indigo)
Secondary: #64748b (Slate)
Success: #10b981 (Emerald)
Warning: #f59e0b (Amber)
Danger: #ef4444 (Red)
```

### Spacing
```css
xs: 0.5rem (8px)
sm: 0.75rem (12px)
md: 1rem (16px)
lg: 1.5rem (24px)
xl: 2rem (32px)
```

### Typography
```css
Font Family: Inter
Weights: 400, 500, 600, 700, 800
Base Size: 16px
Scale: 1.125 (Major Second)
```

---

## 🔧 Next Steps

### High Priority
- [ ] Image lazy loading implementation
- [ ] Route-based code splitting
- [ ] Enhanced search filters with FilterChips
- [ ] Real-time chat UI improvements

### Medium Priority
- [ ] Advanced analytics integration
- [ ] A/B testing framework
- [ ] Performance monitoring
- [ ] Error boundary components

### Low Priority
- [ ] AI chatbot integration
- [ ] Voice search support
- [ ] Video call functionality
- [ ] Advanced animations

---

## 📚 Documentation Links

- [Framer Motion Docs](https://www.framer.com/motion/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [React Query Docs](https://tanstack.com/query/latest)
- [Headless UI Docs](https://headlessui.com/)
- [PWA Guidelines](https://web.dev/progressive-web-apps/)

---

**Yangilangan sana:** 2024
**Version:** 2.0.0
**Status:** ✅ Production Ready
