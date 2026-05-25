
import { LmsModule } from "../types";

const STORAGE_KEY = 'smile_lms_data';

// Data Struktur Kursus
const DEFAULT_COURSE_DATA: LmsModule[] = [
  // --- SECTION 1: READINESS NUMERACY ---
  {
    id: 'sec-1-readiness',
    title: 'Section 1: Readiness Numeracy',
    activities: [
      { 
        id: '1.1', code: '1.1', title: 'Apa itu Numerasi?', type: 'VIDEO', duration: '15 menit', 
        description: 'Penjelasan mendasar tentang definisi numerasi, konteks penggunaannya, dan mengapa numerasi menjadi kompetensi dasar yang krusial.',
        videoUrl: 'https://youtu.be/_ICkoADLfEE?si=drD9dnCk-7rUWsSP'
      },
      { 
        id: '1.2', code: '1.2', title: 'Miskonsepsi Numerasi', type: 'VIDEO', duration: '15 menit', 
        description: 'Membahas kesalahpahaman umum tentang numerasi (misal: numerasi hanya soal angka, atau numerasi hanya tugas guru matematika).',
        videoUrl: 'https://youtu.be/UZQaYcEqNBo?si=z6CyFIYjab0a3O6U'
      },
      { 
        id: '1.3', code: '1.3', title: 'Perbedaan Numerasi dengan Matematika', type: 'MATERIAL', duration: '20 menit', 
        description: 'Analisis perbedaan antara matematika murni (formal) dengan numerasi (aplikasi dalam konteks nyata). Materi disajikan dalam slide interaktif.' 
      },
      { 
        id: '1.4', code: '1.4', title: 'Empat Domain Numerasi', type: 'MATERIAL', duration: '20 menit', 
        description: 'Penjelasan rinci empat domain: Bilangan, Geometri & Pengukuran, Aljabar, dan Data & Ketidakpastian.' 
      },
      { 
        id: '1.5', code: '1.5', title: 'Tiga Level Kognitif Numerasi', type: 'MATERIAL', duration: '15 menit', 
        description: 'Memahami level kognitif: Knowing (Pemahaman), Applying (Penerapan), dan Reasoning (Penalaran).' 
      },
      { 
        id: '1.6', code: '1.6', title: 'Contoh Penerapan Numerasi di Berbagai Mata Pelajaran', type: 'VIDEO', duration: '10 menit', 
        description: 'Video studi kasus bagaimana numerasi muncul dalam pelajaran non-matematika (Seni, PJOK, Bahasa, dll).',
        videoUrl: 'https://youtu.be/EyOLZaqS994'
      },
      { 
        id: '1.7', code: '1.7', title: 'Kuis Formatif: Readiness', type: 'QUIZ', duration: '15 menit', 
        description: 'Kuis pilihan ganda untuk mengukur pemahaman konsep dasar numerasi (Modul 1). Skor minimal kelulusan: 70%.',
        quizData: [
          {
            question: "Menurut OECD/PISA, numerasi adalah kemampuan untuk...",
            options: [
              "Menghitung operasi matematika dengan cepat dan tepat",
              "Memformulasikan, menggunakan, dan menginterpretasikan matematika dalam berbagai konteks",
              "Menghafal rumus-rumus matematika untuk menyelesaikan soal",
              "Mengerjakan soal-soal matematika tingkat tinggi"
            ],
            correctAnswer: "1", 
            explanation: "Definisi OECD: Numerasi adalah kemampuan memformulasikan, menggunakan, dan menginterpretasikan matematika dalam berbagai konteks kehidupan nyata."
          },
          {
            question: "Perbedaan utama antara NUMERASI dan MATEMATIKA adalah...",
            options: [
              "Numerasi lebih sulit daripada matematika",
              "Matematika fokus pada konteks kehidupan nyata, numerasi fokus pada konsep abstrak",
              "Numerasi fokus pada penerapan dalam konteks kehidupan nyata, matematika fokus pada struktur keilmuan",
              "Numerasi hanya untuk siswa SD, matematika untuk siswa SMP/SMA"
            ],
            correctAnswer: "2",
            explanation: "Numerasi menekankan penerapan dalam konteks nyata (outside-in), sedangkan matematika fokus pada struktur keilmuan (inside-out)."
          },
          {
            question: "Berikut adalah domain konten numerasi dalam AKM, KECUALI...",
            options: [
              "Bilangan",
              "Geometri dan Pengukuran",
              "Kalkulus",
              "Data dan Ketidakpastian"
            ],
            correctAnswer: "2",
            explanation: "Domain AKM terdiri dari: Bilangan, Geometri & Pengukuran, Data & Ketidakpastian, dan Aljabar. Kalkulus BUKAN domain AKM."
          },
          {
            question: "Proses kognitif numerasi 'MENGINTERPRETASIKAN' berarti...",
            options: [
              "Mengubah masalah kontekstual menjadi model matematika",
              "Menggunakan prosedur matematika untuk menyelesaikan masalah",
              "Mengevaluasi hasil matematis dan menghubungkannya kembali ke konteks nyata",
              "Menghafalkan rumus matematika yang relevan"
            ],
            correctAnswer: "2",
            explanation: "Proses numerasi terdiri dari: Memformulasikan (masalah→model), Menggunakan (menerapkan prosedur), dan Menginterpretasikan (hasil→konteks)."
          },
          {
            question: "Seorang siswa menganalisis grafik kasus COVID-19 untuk memahami tren penyebaran di kotanya. Konteks numerasi yang digunakan adalah...",
            options: [
              "Personal",
              "Sosial/Masyarakat",
              "Saintifik",
              "Okupasional"
            ],
            correctAnswer: "1",
            explanation: "Konteks Sosial/Masyarakat berkaitan dengan isu komunitas, kesehatan publik, dan kepentingan bersama."
          },
          {
            question: "Asesmen Kompetensi Minimum (AKM) mengukur literasi dan numerasi dengan tujuan utama...",
            options: [
              "Menentukan peringkat sekolah secara nasional",
              "Mengevaluasi kemampuan minimal siswa sebagai dasar perbaikan pembelajaran",
              "Menggantikan Ujian Nasional dengan format yang sama",
              "Menilai penguasaan materi matematika sesuai kurikulum"
            ],
            correctAnswer: "1",
            explanation: "AKM bertujuan mengukur kemampuan minimum sebagai dasar untuk perbaikan kualitas pembelajaran, bukan untuk ranking."
          },
          {
            question: "Menurut Kerangka Kompetensi Guru (Perdirjen GTK 0340/2022), guru level 'CAKAP' dalam numerasi mampu...",
            options: [
              "Menyadari adanya pengalaman aktivitas numerasi peserta didik",
              "Mendeskripsikan pengalaman aktivitas numerasi peserta didik",
              "Menggunakan pengalaman aktivitas numerasi peserta didik untuk pembelajaran",
              "Menyintesis pengalaman aktivitas numerasi peserta didik"
            ],
            correctAnswer: "2",
            explanation: "Level Kompetensi: Berkembang (Menyadari), Layak (Mendeskripsikan), Cakap (MENGGUNAKAN), Mahir (Menyintesis)."
          },
          {
            question: "Siswa menghitung berapa uang yang dibutuhkan untuk membeli perlengkapan sekolah sesuai anggarannya. Aktivitas ini termasuk domain...",
            options: [
              "Bilangan",
              "Geometri dan Pengukuran",
              "Aljabar",
              "Data dan Ketidakpastian"
            ],
            correctAnswer: "0",
            explanation: "Domain Bilangan mencakup operasi hitung, estimasi, proporsi, persentase, dan manajemen keuangan sederhana."
          },
          {
            question: "Level kognitif 'REASONING' dalam numerasi melibatkan kemampuan...",
            options: [
              "Mengingat fakta dan prosedur dasar matematika",
              "Menerapkan prosedur dalam konteks yang sudah dikenal",
              "Menganalisis, mengevaluasi, dan membuat justifikasi matematis",
              "Menghafal rumus-rumus yang sering digunakan"
            ],
            correctAnswer: "2",
            explanation: "Reasoning (Penalaran) melibatkan analisis situasi kompleks, evaluasi strategi, dan justifikasi logis."
          }
        ]
      }
    ]
  },
  // --- SECTION 2: MINDSET NUMERACY ---
  {
    id: 'sec-2-mindset',
    title: 'Section 2: Mindset Numerasi',
    activities: [
      { 
        id: '2.1', code: '2.1', title: 'Growth Mindset dalam Numerasi', type: 'MATERIAL', duration: '15 menit', 
        description: 'Membangun keyakinan bahwa kemampuan numerasi bukan bakat bawaan, tetapi dapat dikembangkan melalui latihan dan strategi yang tepat.',
        fileUrl: 'https://drive.google.com/file/d/1NsYxEvHP3pl97rbC5XtX2nQdHbCUsuYx/preview'
      },
      {
        id: '2.2', code: '2.2', title: 'Kecemasan Matematika (Math Anxiety)', type: 'VIDEO', duration: '10 menit',
        description: 'Mengenali tanda-tanda kecemasan matematika pada guru dan siswa, serta strategi untuk mengatasinya.',
        videoUrl: 'https://youtu.be/7snnqQy049k'
      },
      { 
        id: '2.3', code: '2.3', title: 'Asesmen Mandiri: Profil Mindset', type: 'QUIZ', duration: '10 menit', 
        description: 'Refleksi mandiri untuk mengetahui kecenderungan mindset Anda (Fixed vs Growth) terkait numerasi.' 
      },
      { 
        id: '2.4', code: '2.4', title: 'Strategi 3M: Meaningful, Mindful, Joyful', type: 'MATERIAL', duration: '20 menit', 
        description: 'Pendekatan pedagogi SMILE: Pembelajaran yang Bermakna (kontekstual), Berkesadaran (fokus), dan Menyenangkan.',
        fileUrl: 'https://drive.google.com/file/d/13VJh3vmehn6kICeg8pVRNkaC9WRDYblp/preview'
      },
      { 
        id: '2.9', code: '2.5', title: 'Refleksi: Transformasi Mindset', type: 'ASSIGNMENT', duration: '20 menit', 
        description: 'Tuliskan refleksi singkat mengenai perubahan perspektif Anda tentang numerasi setelah mempelajari modul ini.' 
      },
      { 
        id: '2.10', code: '2.6', title: 'Rencana Aksi Personal', type: 'ASSIGNMENT', duration: '15 menit', 
        description: 'Rumuskan 3 target konkret pengembangan diri dalam integrasi numerasi untuk semester ini.' 
      }
    ]
  },
  // --- SECTION 3: SKILLSET NUMERACY ---
  {
    id: 'sec-3-skillset',
    title: 'Section 3: Skillset Numeracy',
    activities: [
      {
        id: '3.1', code: '3.1', title: 'Identifikasi Konten Numerasi', type: 'VIDEO', duration: '15 menit',
        description: 'Teknik membedah Kompetensi Dasar (KD) atau Capaian Pembelajaran (CP) untuk menemukan potensi numerasi tersembunyi.',
        videoUrl: 'https://youtu.be/6FMP-BgEZUs'
      },
      {
        id: '3.2', code: '3.2', title: 'Analisis Konteks & Data', type: 'MATERIAL', duration: '20 menit',
        description: 'Cara mencari dan memilih data statistik atau fenomena dunia nyata yang relevan dengan materi ajar.'
      },
      {
        id: '3.3', code: '3.3', title: 'Desain Aktivitas Numerasi', type: 'ASSIGNMENT', duration: '30 menit',
        description: 'Workshop mandiri: Merancang satu aktivitas pembelajaran singkat yang menyisipkan unsur numerasi.'
      },
      {
        id: '3.4', code: '3.4', title: 'Strategi Diferensiasi Numerasi', type: 'MATERIAL', duration: '20 menit',
        description: 'Teknik mengajar numerasi untuk kelas dengan kemampuan siswa yang beragam (Low/Middle/High achievers).'
      },
      {
        id: '3.5', code: '3.5', title: 'Numerasi Lintas Kurikulum', type: 'VIDEO', duration: '15 menit',
        description: 'Konsep integrasi numerasi dalam mata pelajaran non-matematika (PJOK, Seni, Bahasa) tanpa mengubah kurikulum.',
        videoUrl: 'https://youtu.be/Mv7yKk7T6wU'
      }
    ]
  },
  // --- SECTION 4: TOOLSET NUMERACY ---
  {
    id: 'sec-4-toolset',
    title: 'Section 4: Toolset Numeracy',
    activities: [
      {
        id: '4.1', code: '4.1', title: 'Pengenalan SMILE Platform', type: 'VIDEO', duration: '10 menit',
        description: 'Panduan navigasi dan fitur utama aplikasi SMILE untuk mendukung produktivitas guru.'
      },
      {
        id: '4.2', code: '4.2', title: 'Tutorial: Studio Modul Ajar (AI)', type: 'VIDEO', duration: '15 menit',
        description: 'Cara menggunakan AI Generator untuk membuat Modul Ajar Deep Learning yang terintegrasi numerasi secara otomatis.'
      },
      {
        id: '4.3', code: '4.3', title: 'Tutorial: Studio Soal & LKPD', type: 'VIDEO', duration: '15 menit',
        description: 'Panduan membuat instrumen asesmen dan lembar kerja peserta didik (LKPD) berbasis level kognitif dengan bantuan AI.'
      },
      {
        id: '4.4', code: '4.4', title: 'Validasi RPP dengan AI', type: 'CHECKLIST', duration: '15 menit',
        description: 'Praktik menggunakan fitur "Validasi RPP" untuk mengecek kualitas integrasi numerasi dalam rencana pembelajaran Anda.'
      },
      {
        id: '4.5', code: '4.5', title: 'Lab Design Thinking', type: 'MATERIAL', duration: '20 menit',
        description: 'Cara menggunakan fitur Lab Design Thinking untuk menemukan solusi inovatif atas permasalahan pembelajaran di kelas.'
      }
    ]
  },
  // --- SECTION 5: EVALUATION ---
  {
    id: 'sec-5-evaluation',
    title: 'Section 5: Evaluation',
    activities: [
      {
        id: '5.1', code: '5.1', title: 'Post-Test Kompetensi Numerasi', type: 'QUIZ', duration: '30 menit',
        description: 'Evaluasi akhir (Sumatif) untuk mengukur peningkatan pemahaman konsep numerasi setelah mengikuti seluruh program pelatihan.',
        quizData: [
            // Placeholder quiz data for Post-Test (Same structure as Readiness for comparison)
            {
                question: "Manakah di bawah ini yang merupakan indikator keberhasilan integrasi numerasi dalam RPP?",
                options: ["Siswa menghitung cepat", "Siswa menggunakan data untuk mengambil keputusan", "Siswa menghafal rumus", "Siswa mengerjakan 100 soal"],
                correctAnswer: "1",
                explanation: "Tujuan numerasi adalah menggunakan matematika untuk justifikasi/keputusan konteks nyata."
            }
        ]
      },
      {
        id: '5.2', code: '5.2', title: 'Unggah Bukti Karya (Evidence)', type: 'ASSIGNMENT', duration: '45 menit',
        description: 'Unggah RPP Final dan dokumentasi implementasi (foto/video) sebagai syarat kelulusan level Integrator.'
      },
      {
        id: '5.3', code: '5.3', title: 'Refleksi Akhir Program', type: 'SURVEY', duration: '15 menit',
        description: 'Survei kepuasan dan refleksi diri terhadap dampak program pelatihan bagi kompetensi profesional Anda.'
      }
    ]
  }
];

export const getModules = (): LmsModule[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Failed to load modules", e);
    }
  }
  return DEFAULT_COURSE_DATA;
};

export const saveModules = (modules: LmsModule[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(modules));
};

export const resetModules = (): LmsModule[] => {
  localStorage.removeItem(STORAGE_KEY);
  return DEFAULT_COURSE_DATA;
};
