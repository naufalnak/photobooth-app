# 📷 Snapbooth

> Photobooth web app — ambil 4 foto, custom background & filter, download strip-mu.

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?style=flat-square&logo=tailwindcss)
![Zustand](https://img.shields.io/badge/Zustand-5-orange?style=flat-square)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?style=flat-square&logo=vercel)

---

## ✨ Fitur

### Core

- 📸 Akses kamera via `getUserMedia` — kamera depan & belakang
- ⏱️ Countdown 3 detik sebelum tiap foto
- 🎞️ Ambil 4 foto berurutan otomatis
- 💾 Download hasil sebagai PNG

### Kustomisasi (after foto)

- 🖼️ **Background** — pilih warna solid atau upload gambar/pattern sendiri
- 🎨 **Filter** — 10 filter termasuk trending: Soft Glam, Summer Tan, Retro Flash, Midnight, Film Grain, Saturated, B&W, Sepia, Vintage
- 🔤 **Custom Text** — tulis teks dengan pilihan ukuran (S/M/L/XL), warna bebas, font Italiana
- 😄 **Stiker** — tambah emoji, drag & drop bebas, double tap untuk hapus
- 💧 **Watermark** — branding otomatis di setiap strip

### UX

- 📱 Responsive — portrait & landscape layout
- 👁️ Live preview semua perubahan sebelum generate
- 🔄 Flip kamera (depan ↔ belakang)
- Tab editor: Background | Filter | Sticker | Text

---

## 🗂️ Struktur Folder

```
photobooth-app/
├── app/
│   ├── layout.tsx          # Font, metadata, global style
│   ├── page.tsx            # Landing page
│   ├── globals.css
│   ├── booth/
│   │   └── page.tsx        # Halaman kamera & capture
│   └── result/
│       └── page.tsx        # Edit & download strip
│
├── components/
│   ├── Camera.tsx          # getUserMedia, flip, error state
│   ├── CountdownDisplay.tsx
│   ├── PhotoStrip.tsx      # Preview 4 slot foto
│   ├── StripEditor.tsx     # Tab editor (bg/filter/sticker/text)
│   ├── BackgroundPicker.tsx
│   ├── CustomTextEditor.tsx
│   └── TemplatePicker.tsx
│
├── lib/
│   ├── camera.ts           # startCamera, stopCamera, captureFrame
│   ├── capture.ts          # runCountdown, captureSequence
│   ├── filters.ts          # applyFilter — pixel manipulation
│   └── canvas-utils.ts     # generateImage(), downloadImage()
│
├── store/
│   └── useBoothStore.ts    # Zustand global state
│
└── types/
    └── index.ts            # Photo, Template, PlacedSticker, dll
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm / yarn / pnpm

### Install & Run

```bash
# Clone repo
git clone https://github.com/username/photobooth-app.git
cd photobooth-app

# Install dependencies
npm install

# Run development server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

> ⚠️ Akses kamera hanya berjalan di **HTTPS** atau **localhost**. Untuk testing di HP, gunakan deployment Vercel atau ngrok.

---

## 🔧 Tech Stack

| Tech                        | Kegunaan                               |
| --------------------------- | -------------------------------------- |
| **Next.js 15** (App Router) | Framework utama                        |
| **TypeScript**              | Type safety                            |
| **Tailwind CSS 4**          | Styling                                |
| **Zustand**                 | Global state management                |
| **Canvas API**              | Composite foto + filter + generate PNG |
| **getUserMedia API**        | Akses kamera                           |
| **FontFace API**            | Load Google Font di canvas             |
| **Web Share API**           | Share strip (coming soon)              |

---

## 📸 Flow Aplikasi

```
Landing Page
    ↓
Booth Page
  → Kamera aktif
  → Countdown 3, 2, 1
  → Capture 4 foto berurutan
  → Flash effect tiap foto
    ↓
Result Page — Edit Strip
  → Tab Background (preset warna / upload gambar)
  → Tab Filter (10 filter dengan live preview)
  → Tab Sticker (drag & drop emoji)
  → Tab Text (custom text + warna + ukuran)
    ↓
Generate Strip → Download PNG
```

---

## 🏗️ Arsitektur

### State Management (Zustand)

Semua state ada di `store/useBoothStore.ts`:

```typescript
{
  photos: Photo[]
  selectedFilter: FilterType
  placedStickers: PlacedSticker[]
  customBackground: CustomBackground | null
  customText: CustomText | null
  bgColor: string
  finalSession: PhotoSession | null
  // ... actions
}
```

### generateImage()

Fungsi utama di `lib/canvas-utils.ts` — dipisah dari UI agar siap dipanggil dari API route:

```typescript
generateImage(session: PhotoSession, template: Template, bgColor: string)
  → Promise<string>  // base64 PNG
```

Urutan render canvas:

1. Background (warna solid / gambar)
2. 4 foto dengan filter
3. Stiker emoji
4. Custom text (font Italiana)
5. Watermark

### PhotoSession Object

Struktur data yang siap dikirim ke backend:

```typescript
interface PhotoSession {
  id: string;
  images: string[]; // base64 dataUrl
  template: string;
  filter: FilterType;
  placedStickers: PlacedSticker[];
  customBackground: CustomBackground | null;
  customText: CustomText | null;
  createdAt: Date;
}
```

---

## 🗺️ Roadmap

- [ ] Custom text font picker (beberapa pilihan font)
- [ ] Share via Web Share API
- [ ] API route `/api/sessions` — simpan ke database
- [ ] Subscription flow — hapus watermark
- [ ] QR Code setelah download
- [ ] Galeri sesi foto
- [ ] More sticker packs

---

## 📦 Deploy ke Vercel

```bash
# Push ke GitHub
git add .
git commit -m "ready to deploy"
git push origin main
```

Buka [vercel.com](https://vercel.com) → Import repo → Deploy.

Vercel otomatis detect Next.js — tidak perlu konfigurasi tambahan. HTTPS sudah included, kamera langsung jalan di mobile.

---

## 🧑‍💻 Development Notes

### Tambah Filter Baru

1. Tambah type di `types/index.ts`
2. Tambah logika pixel di `lib/filters.ts`
3. Tambah ke array `filters` di `components/StripEditor.tsx`

### Ganti Watermark

```typescript
// lib/canvas-utils.ts
const WATERMARK_TEXT = "nama-app-kamu.com";
```

### Ganti Font Custom Text

```typescript
// lib/canvas-utils.ts
const FONT_URL = "https://fonts.gstatic.com/...";
await loadGoogleFont("NamaFont", FONT_URL);
ctx.font = `${fontSize}px NamaFont, serif`;
```

---

## 📄 License

MIT — bebas dipakai, dimodifikasi, dan didistribusikan.

---

<p align="center">
  Made with ☕ · Powered by Next.js & Canvas API
</p>
