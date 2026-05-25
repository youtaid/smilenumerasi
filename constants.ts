
export const JENJANG_OPTIONS = ['SD / MI', 'SMP / MTs', 'SMA / MA', 'SMK'];

export const KELAS_OPTIONS: Record<string, string[]> = {
  'SD / MI': ['Kelas 1', 'Kelas 2', 'Kelas 3', 'Kelas 4', 'Kelas 5', 'Kelas 6'],
  'SMP / MTs': ['Kelas 7', 'Kelas 8', 'Kelas 9'],
  'SMA / MA': ['Kelas 10', 'Kelas 11', 'Kelas 12'],
  'SMK': ['Kelas 10', 'Kelas 11', 'Kelas 12']
};

export const LEVEL_OPTIONS = [
  'Level 1 (C1-C2) - Dasar',
  'Level 2 (C3) - Aplikasi', 
  'Level 3 (C4-C5) - Analisis & Evaluasi (HOTS)', 
  'Level 4 (C6) - Kreasi (Project/PBL/Inquiry)',
  'Campuran (Proporsional)'
];

export const JENIS_SOAL_SEKOLAH = [
  'Pilihan Ganda (PG)',
  'Pilihan Ganda Kompleks',
  'Menjodohkan',
  'Isian Singkat',
  'Uraian / Essay',
  'Benar / Salah'
];

export const JENIS_SOAL_BIMBEL = [
  'Pilihan Ganda (Regular)',
  'Pilihan Ganda (Sebab-Akibat)',
  'Pilihan Ganda (Asosiatif 1-2-3-4)',
  'Tes Potensi Skolastik (TPS)',
  'Literasi & Numerasi (AKM)'
];

export const COMMON_MAPEL = [
  'Matematika', 'Bahasa Indonesia', 'Bahasa Inggris', 'IPA', 'IPS', 'PPKn', 'PJOK', 'Seni Budaya', 'Prakarya'
];

export const MAPEL_UMUM = [
  'Matematika', 'Bahasa Indonesia', 'Bahasa Inggris', 'IPA (Terpadu)', 'IPS (Terpadu)', 'Fisika', 'Kimia', 'Biologi', 'Ekonomi', 'Geografi', 'Sosiologi', 'Sejarah', 'PPKn', 'Informatika', 'Seni Budaya', 'PJOK'
];

export const MAPEL_PAI_ISLAM = [
  'Pendidikan Agama Islam', 'Al-Quran Hadits', 'Aqidah Akhlaq', 'Fiqih', 'Sejarah Kebudayaan Islam (SKI)', 'Bahasa Arab'
];

export const MAPEL_KRISTEN_KATOLIK = [
  'Pendidikan Agama Kristen', 'Pendidikan Agama Katolik'
];

export const MAPEL_HINDU = [
  'Pendidikan Agama Hindu'
];

// --- TKA & TPS SPECIFIC SUBJECTS ---
export const TKA_WAJIB = [
  'Bahasa Indonesia',
  'Matematika (Dasar)',
  'Bahasa Inggris'
];

export const TKA_PILIHAN = [
  'Matematika Lanjutan', 'Fisika', 'Kimia', 'Biologi',
  'Sejarah', 'Geografi', 'Ekonomi', 'Sosiologi', 'Antropologi', 'PKn',
  'Bahasa Indonesia Lanjutan', 'Bahasa Inggris Lanjutan', 'Bahasa Arab', 'Bahasa Prancis', 'Bahasa Jerman'
];

export const TPS_SUBTES = [
  'Penalaran Umum (PU)',
  'Pengetahuan dan Pemahaman Umum (PPU)',
  'Pemahaman Bacaan dan Menulis (PBM)',
  'Pengetahuan Kuantitatif (PK)',
  'Literasi Bahasa Indonesia (LBI)', 
  'Literasi Bahasa Inggris (LBE)',
  'Penalaran Matematika (PM)'
];

export const AKM_SUBTES = [
  'Literasi',
  'Numerasi'
];

export const KURIKULUM_OPTIONS = ['Kurikulum Merdeka', 'Kurikulum 2013 (K-13)', 'Kurikulum Darurat', 'Cambridge / International'];

export const SEMESTER_OPTIONS_SEKOLAH = [
  'Latihan Harian / Ulangan Harian',
  'Penilaian Tengah Semester (PTS)',
  'Penilaian Akhir Semester (PAS)',
  'Penilaian Akhir Tahun (PAT)',
  'Ujian Sekolah (US)'
];

export const SEMESTER_OPTIONS_BIMBEL = [
  'Latihan Topik / Drill Soal',
  'UTBK SNBT',
  'Asesmen Sumatif',
  'Persiapan Olimpiade (OSN)',
  'TKA (Tes Kemampuan Akademik)'
];

export const USER_TYPE_OPTIONS = ['GURU_SEKOLAH', 'GURU_BIMBEL'];

export const GAYA_BAHASA_OPTIONS = [
  'Formal & Akademis',
  'Santai & Komunikatif',
  'Kontekstual & Studi Kasus',
  'Islami & Religius'
];

export const JENIS_STIMULUS_OPTIONS = [
  'Teks Informasi / Berita',
  'Data Grafik / Tabel',
  'Infografis Deskriptif',
  'Cerita Pendek / Narasi',
  'Studi Kasus Saintifik'
];

export const DISTRIBUSI_PRESETS = [
  { id: 'EASY_HEAVY', label: 'Mudah (60% Mudah)' },
  { id: 'BALANCED', label: 'Seimbang (40-30-30)' },
  { id: 'HARD_HEAVY', label: 'HOTS (50% Sulit)' },
  { id: 'AUTO', label: 'Otomatis AI' }
];

export const LANGUAGE_OPTIONS = ['Bahasa Indonesia', 'Bahasa Inggris', 'Bahasa Arab', 'Bahasa Jawa'];

export const JUMLAH_OPSI_OPTIONS = [
    { value: 3, label: '3 Opsi (A-C) - SD Bawah' },
    { value: 4, label: '4 Opsi (A-D) - SD/SMP' },
    { value: 5, label: '5 Opsi (A-E) - SMA/UTBK' }
];

export const ANSWER_KEY_VARIANTS = [
    { id: 'SIMPLE', label: 'Kunci Sederhana', desc: 'Hanya jawaban benar (Misal: 1. A, 2. B)' },
    { id: 'EXPLAIN', label: 'Kunci + Pembahasan', desc: 'Jawaban benar disertai penjelasan rinci' },
    { id: 'RUBRIC', label: 'Rubrik Penilaian', desc: 'Lengkap dengan pedoman penskoran essay' }
];

// --- KOKURIKULER CONSTANTS ---

export const THEMES_UMUM = [
  "Gaya Hidup Berkelanjutan",
  "Kearifan Lokal",
  "Bhinneka Tunggal Ika",
  "Bangunlah Jiwa dan Raganya",
  "Suara Demokrasi",
  "Rekayasa dan Teknologi",
  "Kewirausahaan",
  "Kebekerjaan"
];

export const THEMES_MADRASAH = [
  "Hidup Berkelanjutan",
  "Kearifan Lokal",
  "Bhinneka Tunggal Ika",
  "Bangunlah Jiwa dan Raganya",
  "Demokrasi Pancasila",
  "Rekayasa dan Teknologi",
  "Kewirausahaan",
  "Kebekerjaan",
  "Nilai-nilai Rahmatan Lil Alamin"
];

export const ACTIVITY_CATEGORIES = [
  "Krida",
  "Karya Ilmiah",
  "Latihan Olah-Bakat",
  "Karya Seni",
  "Rekayasa Teknologi",
  "Kegiatan Alam",
  "Bakti Sosial"
];

export const FREQUENCIES = [
  "Harian",
  "Mingguan",
  "Bulanan",
  "Blok (Semester)",
  "Insidental"
];

export const PAI_ELEMENTS = [
  "Al-Quran Hadis",
  "Akidah Akhlak",
  "Fikih",
  "Sejarah Kebudayaan Islam",
  "Bahasa Arab"
];
