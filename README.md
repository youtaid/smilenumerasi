<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# SMILE Platform — Smart & Innovative Learning Environment

Platform LMS berbasis AI untuk guru Indonesia. Membantu perencanaan RPP, pembuatan soal dan materi, kolaborasi, serta pengembangan kompetensi numerasi dalam satu ekosistem pintar.

## Fitur Utama

- **Cockpit Mastery (Dashboard)** — Visualisasi progres kompetensi per cluster (A–D)
- **Pelatihan SMILE** — LMS dengan modul video, materi, kuis interaktif, Mindset Assessment, dan AI Reflection
- **Lab Design Thinking** — 5 tahap: Empathize → Define → Ideate → Prototype → Test
- **Studio Modul Ajar** — Generator RPP Deep Learning (Sekolah Umum & Madrasah)
- **Studio Soal & Materi** — Pembuatan bank soal numerasi dengan AI + Tool Kokurikuler
- **Pusat Asesmen** — Pre/Post Test, Skala Sikap, dan Penilaian Rubrik
- **Kolaborasi 360°** — Diskusi, Review Sejawat, dan Generator Kokurikuler
- **Jalur Kompetensi** — 5 Mastery Gates dengan sistem XP dan badge
- **Manajemen Konten** — Panel Admin CRUD modul dan aktivitas

## Tech Stack

- **Frontend:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS (CDN) + Inter font
- **Auth & DB:** Firebase Authentication + Firestore
- **AI:** Google Gemini API (`@google/genai`)
- **Charts:** Recharts
- **Math Rendering:** KaTeX + react-markdown

## Jalankan Lokal

**Prasyarat:** Node.js 18+

1. Install dependensi:
   ```bash
   npm install
   ```
2. Buat file `.env.local` dan isi API key:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
3. Jalankan:
   ```bash
   npm run dev
   ```
   Buka `http://localhost:3000`

## Login

- **Mode Demo:** Klik "Mode Demo (Masuk sebagai Guru/Admin)" di halaman login — tidak perlu akun
- **Firebase Auth:** Daftar dengan Email/Password atau Google (Belajar.id)
- **Admin:** Klik "Akses Cepat: Masuk sebagai Admin" untuk fitur Manajemen Konten

## Build Produksi

```bash
npm run build
npm run preview
```
