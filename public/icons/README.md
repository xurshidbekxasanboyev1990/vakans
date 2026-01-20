# PWA Icons Ko'rsatmasi

PWA ilovasi to'liq ishlashi uchun quyidagi iconlarni tayyorlash kerak:

## Kerakli Icon O'lchamlari:

```
public/icons/
  ├── icon-72x72.png
  ├── icon-96x96.png
  ├── icon-128x128.png
  ├── icon-144x144.png
  ├── icon-152x152.png
  ├── icon-192x192.png
  ├── icon-384x384.png
  ├── icon-512x512.png
  ├── badge-72x72.png
  ├── apply.png (96x96)
  └── briefcase.png (96x96)
```

## Icon Yaratish:

1. **Asosiy logo** - 512x512px PNG format
2. **Figma/Photoshop** da turli o'lchamlarga export qiling
3. Yoki online tool: https://realfavicongenerator.net/

## Vaqtinchalik yechim:

Icons mavjud bo'lmaguncha, manifest.json dagi icon referencelarini placeholder ga o'zgartiring:

```json
{
  "icons": [
    {
      "src": "/favicon.svg",
      "sizes": "any",
      "type": "image/svg+xml"
    }
  ]
}
```

Loyiha icons holzir icons bo'lmasa ham ishlaydi, faqat PWA install prompt to'liq ishlamaydi.
