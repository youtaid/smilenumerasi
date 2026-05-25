
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { LearningMaterialResult, TeacherPersonaResult, LessonPlanValidationResult, QuestionRequest, RefineActionType, KokurikulerFormData, DocumentType, ModuleRequest, SchoolMode, LKPDRequest } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to check if is present
export const checkApiKey = (): boolean => {
  return !!apiKey;
};

const LATEX_INSTRUCTION = `
FORMAT MATEMATIKA (WAJIB):
- Gunakan format LaTeX untuk semua rumus dan ekspresi matematika.
- Gunakan tanda $ untuk inline math (contoh: $x^2 + y^2 = z^2$).
- Gunakan tanda $$ untuk block math (rumus terpisah baris).
- Jangan gunakan format code block untuk matematika.
`;

// --- UPDATED FOR DEEP LEARNING MODULE ---
export const generateLessonPlan = async (
  request: ModuleRequest,
  onChunk?: (chunk: string) => void
): Promise<string> => {
  if (!apiKey) throw new Error("API Key missing");

  const isMadrasah = request.mode === SchoolMode.MADRASAH;
  
  const systemInstruction = `SYSTEM PROMPT AI STUDIO (FINAL & TERKUNCI)
GENERATOR MODUL AJAR DEEP LEARNING LENGKAP INDONESIA

PERAN SISTEM (WAJIB):
Kamu adalah AI Generator Modul Ajar Deep Learning Resmi Indonesia. Tugasmu menghasilkan dokumen ADMINISTRASI GURU LENGKAP yang siap cetak dan siap supervisi.
DILARANG memberikan ringkasan, outline, atau konten singkat. Konten harus NARATIF, DETAIL, DAN PROFESIONAL.

MODE SATUAN PENDIDIKAN (PENGUNCI UTAMA):
${isMadrasah ? `
MODE B — MADRASAH
- Acuan: KMA 1503 & Kurikulum Berbasis Cinta (KBC).
- Integrasi Panca Cinta secara IMPLISIT dalam narasi.
- Gunakan 8 Dimensi Profil Lulusan Madrasah.
- Dilarang menyebut CP 046 atau Profil Pelajar Pancasila.` : `
MODE A — SEKOLAH UMUM
- Acuan: Kurikulum Merdeka & CP 046 (Update Terbaru 2025).
- Gunakan 8 Dimensi Profil Lulusan.
- Bahasa formal nasional, nilai karakter bersifat implisit.
- Dilarang menyebut KMA, Panca Cinta, atau istilah madrasah.`}

AUTO-KONVERSI JP (WAJIB):
- PAUD/TK: 1 JP = ±30 menit | SD/MI: 1 JP = 35 menit | SMP/MTs: 1 JP = 40 menit | SMA/SMK/MA: 1 JP = 45 menit

JP–PTM CALCULATION LOCK:
WAJIB Tuliskan di Identitas: "Alokasi Waktu: [Total JP] JP ([Total Menit] Menit) – [PTM] Pertemuan".

SYSTEM PROMPT TAMBAHAN: 4 KERANGKA PEMBELAJARAN – DEEP LEARNING LOCK
Kamu WAJIB memuat 4 komponen berikut secara EKSPLISIT dan TERPISAH:
1. STRATEGI PEMBELAJARAN: Pendekatan (PBL/PjBL), kaitan tujuan, dan prinsip Deep Learning (Memahami-Mengaplikasi-Merefleksi).
2. KEMITRAAN PEMBELAJARAN: Kolaborasi guru, siswa, orang tua, komunitas.
3. LINGKUNGAN PEMBELAJARAN: Fisik, sosial, budaya belajar.
4. PEMANFAATAN TEKNOLOGI: Media digital dan non-digital.

STRUKTUR OUTPUT (WAJIB 13 BAGIAN - DETAIL SANGAT MENDALAM):
1. Identitas; 2. Identifikasi (Naratif Detail); 3. Profil Lulusan; 4. Desain Pembelajaran (CP, Lintas Ilmu, Tujuan HOTS, Topik); 5. Strategi Pembelajaran (DL Lock); 6. Kemitraan Pembelajaran (DL Lock); 7. Lingkungan Pembelajaran (DL Lock); 8. Pemanfaatan Teknologi (DL Lock); 9. Pengalaman Belajar (Wajib Per Pertemuan dengan detail Sintaks Deep Learning); 10. Asesmen; 11. KKTP; 12. Remedial/Pengayaan; 13. Lampiran.

PEDAGOGICAL FLOW: MEMAHAMI – MENGAPLIKASI – MEREFLEKSI.

${LATEX_INSTRUCTION}`;

  const uploadedContentContext = request.uploadedFileContent ? `
REFERENSI WAJIB:
Berikut adalah materi yang HARUS digunakan sebagai dasar pembuatan modul ajar.
--- MULAI MATERI ---
${request.uploadedFileContent.substring(0, 10000)}
--- SELESAI MATERI ---
` : "";

  const prompt = `
INPUT DATA:
- Mapel: ${request.mataPelajaran} | Jenjang: ${request.jenjang} | Topik: ${request.topik}
- Pilar Numerasi: Domain: ${request.domainNumerasi} | Konteks: ${request.konteksNumerasi} | Level: ${request.levelKognitif}
- Kelas: ${request.kelas} | Semester: ${request.semester} | Total JP: ${request.alokasiWaktuJP} | PTM: ${request.jumlahPertemuan}
- Konteks: ${request.konteksNyata}
- Profil Siswa: ${request.pengetahuanAwal}, ${request.minatBelajar}, ${request.latarBelakang}
${uploadedContentContext}

INSTRUKSI KHUSUS:
Buatlah Modul Ajar dengan narasi yang SANGAT DETAIL. Pastikan 4 Kerangka Pembelajaran (Strategi, Kemitraan, Lingkungan, Teknologi) ditulis secara lengkap sebagai sub-bab tersendiri.
Bagian "Pengalaman Belajar" harus dibagi menjadi ${request.jumlahPertemuan} pertemuan dengan pembagian waktu yang akurat.
  `;

  try {
    if (onChunk) {
        const responseStream = await ai.models.generateContentStream({
            model: "gemini-2.5-flash",
            contents: [{ parts: [{ text: prompt }] }],
            config: { systemInstruction, temperature: 0.2 },
        });
        
        let fullText = "";
        for await (const chunk of responseStream) {
            const text = (chunk as GenerateContentResponse).text;
            if (text) {
                fullText += text;
                onChunk(text);
            }
        }
        return fullText;
    } else {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ parts: [{ text: prompt }] }],
            config: { systemInstruction, temperature: 0.2 },
        });
        return response.text || "";
    }
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
};

export const generateLKPD = async (
  request: ModuleRequest,
  lkpdConfig: LKPDRequest,
  moduleContent: string,
  onChunk?: (chunk: string) => void
): Promise<string> => {
  if (!apiKey) throw new Error("API Key missing");

  const systemInstruction = `SYSTEM PROMPT TAMBAHAN
LKPD MULTI-PERTEMUAN & REGENERATE LOCK

TUJUAN UTAMA SISTEM:
Kamu adalah AI Generator LKPD sebagai TURUNAN dari Modul Ajar.
LKPD harus mengikuti modul ajar yang sudah ada.

DEFINISI INPUT:
- Input 1: Jumlah Pertemuan (PTM) = ${lkpdConfig.pertemuanKe} (Ini menunjukkan berapa banyak LKPD yang harus dibuat sekaligus).
- Input 2: Durasi LKPD = ${lkpdConfig.durasiMenit} menit per pertemuan.

LOGIKA GENERATE WAJIB (HARDCODE):
Jika Jumlah Pertemuan = N, maka WAJIB generate N LKPD SEKALIGUS dalam satu output response.
Urutkan: LKPD Pertemuan ke-1, LKPD Pertemuan ke-2, ... LKPD Pertemuan ke-N.

STRUKTUR OUTPUT LKPD (WAJIB KONSISTEN):
Untuk SETIAP LKPD, gunakan struktur 1-14:
1. Judul (Pertemuan ke-X); 2. Tujuan; 3. Petunjuk Belajar; 4. Materi Pokok; 5. Informasi Pendukung; 6. Alat/Bahan; 7. Langkah Kegiatan; 8. Tugas; 9. Kesimpulan; 10. Penilaian; 11. Identitas; 12. Pustaka; 13. Kunci Jawaban; 14. Rubrik (Tabel).
    
    ${LATEX_INSTRUCTION}`;

  const prompt = `BERDASARKAN MODUL AJAR INDUK:
${moduleContent.substring(0, 10000)} ... [truncated]

SUSUNLAH ${lkpdConfig.pertemuanKe} LKPD SEKALIGUS UNTUK PERTEMUAN 1 SAMPAI ${lkpdConfig.pertemuanKe}.
Fokus Kemampuan: ${lkpdConfig.fokusKemampuan.join(', ')}.
Gaya: Deep Learning (Meaningful & Joyful).`;

  try {
    if (onChunk) {
        const responseStream = await ai.models.generateContentStream({
            model: "gemini-2.5-flash",
            contents: [{ parts: [{ text: prompt }] }],
            config: { systemInstruction, temperature: 0.3 },
        });
        
        let fullText = "";
        for await (const chunk of responseStream) {
            const text = (chunk as GenerateContentResponse).text;
            if (text) {
                fullText += text;
                onChunk(text);
            }
        }
        return fullText;
    } else {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ parts: [{ text: prompt }] }],
            config: { systemInstruction, temperature: 0.3 },
        });
        return response.text || "";
    }
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
};

// --- PREVIOUS EXPORTS (Kept for compatibility) ---

export const generateLearningMaterials = async (
  topic: string,
  grade: string,
  context: string
): Promise<LearningMaterialResult> => {
  if (!apiKey) throw new Error("API Key missing");

  const prompt = `
    Anda adalah ahli konten pendidikan dan teknologi pembelajaran.
    Buatkan paket materi pembelajaran lengkap yang menarik untuk guru dan siswa.
    
    Topik: ${topic}
    Jenjang Kelas: ${grade}
    ${context ? `Konteks/Materi Tambahan: ${context}` : ''}

    Output yang diminta adalah objek JSON tunggal dengan struktur berikut:
    1. "summary": Ringkasan materi yang komprehensif, terstruktur rapi, menggunakan format Markdown (heading, list, bold).
    2. "quiz": Array berisi 5 soal pilihan ganda (objek dengan properti: question, options (array 4 string), correctAnswer (contoh "A"), explanation).
    3. "flashcards": Array berisi 5-8 kartu kilat untuk konsep kunci (objek dengan properti: front, back).
    4. "glossary": Array berisi 5-10 istilah penting dan definisinya (objek dengan properti: term, definition).

    Pastikan konten edukatif, akurat, dan sesuai dengan kurikulum di Indonesia.
    
    ${LATEX_INSTRUCTION}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });
    
    const text = response.text || "{}";
    return JSON.parse(text) as LearningMaterialResult;
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
};

export const askAiAssistant = async (query: string, context: string): Promise<string> => {
  if (!apiKey) throw new Error("API Key missing");

  const prompt = `
    Konteks Diskusi: ${context}
    Pertanyaan/Masukan User: ${query}
    
    Peran Anda:
    Jika konteks adalah "Diskusi Umum": Bertindak sebagai mentor guru yang bijaksana.
    Jika konteks adalah "Review Sejawat": Bertindak sebagai evaluator kurikulum profesional. Berikan kritik konstruktif (Sandwich Method: Pujian, Koreksi, Motivasi) terhadap materi/RPP yang dideskripsikan.

    Jawab dalam Bahasa Indonesia yang suportif.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });
    return response.text || "Maaf, saya sedang berpikir keras namun tidak menemukan jawaban.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Terjadi kesalahan pada sistem AI.";
  }
};

export const getPersonalizedRecommendations = async (activityLog: string): Promise<string> => {
  if (!apiKey) return "Rekomendasi sedang dimuat (Mode Demo)...";

  const prompt = `
    Anda adalah AI Learning Architect untuk sistem "Dynamic LMS".
    
    Data Aktivitas Guru: "${activityLog}"
    
    Tugas:
    Analisis perilaku guru tersebut dan berikan 3 rekomendasi personal untuk pengembangan profesional mereka (Adaptive Learning Path).
    Jika guru sering membuat soal matematika, sarankan metode pedagogi matematika lanjut.
    Jika guru baru login, sarankan orientasi dasar.
    
    Format Output: Markdown, singkat, padat, memotivasi.
    Jangan gunakan JSON. Langsung paragraf atau bullet points.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });
    return response.text || "";
  } catch (error) {
    return "Tidak dapat memuat rekomendasi saat ini. Pastikan koneksi internet stabil.";
  }
};

export const analyzeTeacherPersona = async (
  experience: string,
  subject: string,
  techComfort: number,
  challenges: string
): Promise<TeacherPersonaResult> => {
  if (!apiKey) throw new Error("API Key missing");

  const prompt = `
    ROLE:
    Anda adalah ahli Psikologi Pendidikan dan Analis Data untuk program pelatihan SMILE. Tugas Anda adalah mengklasifikasikan profil guru ke dalam salah satu dari 5 Persona berdasarkan data survei singkat mereka.

    DEFINISI PERSONA:
    1. Adaptive Navigator: Guru muda (1-5 thn), tech-savvy, antusias, butuh tantangan.
    2. Seasoned Mentor: Guru senior (>15 thn), percaya diri, memiliki wisdom, potensial jadi pelatih.
    3. Numeracy Curious: Guru Non-Matematika/STEM, bingung relevansi numerasi, ingin tahu.
    4. Empathic Connector: Fokus pada kesejahteraan siswa, humanis, kesulitan diferensiasi.
    5. Digital Transitioning: Usia 45+, kesulitan/cemas dengan teknologi, butuh panduan sederhana.

    INPUT:
    Lama Mengajar: ${experience}
    Mata Pelajaran: ${subject}
    Tingkat Kenyamanan Teknologi (1-10): ${techComfort}
    Tantangan Utama: ${challenges}

    OUTPUT FORMAT (JSON ONLY):
    {
      "persona_result": "[Nama Persona]",
      "confidence_score": "[0.0 - 1.0]",
      "ui_recommendation": "[Simple_Mode / Standard_Mode / Advanced_Gamified]",
      "reasoning": "[Penjelasan singkat 1 kalimat]"
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });
    
    const text = response.text || "{}";
    return JSON.parse(text) as TeacherPersonaResult;
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
};

export const generateNumeracyActivity = async (
  topic: string,
  subject: string
): Promise<string> => {
  if (!apiKey) throw new Error("API Key missing");

  const prompt = `
    ROLE:
    Anda adalah Spesialis Desain Instruksional Numerasi Lintas Kurikulum. Tugas Anda adalah membantu guru Non-Matematika menemukan ide aktivitas numerasi yang relevan dengan mapel mereka menggunakan prinsip 3M (Mindful, Meaningful, Joyful).

    PRINSIP 3M:
    - Mindful (Berkesadaran): Siswa paham tujuan & relevansi.
    - Meaningful (Bermakna): Konteks dunia nyata/autentik.
    - Joyful (Menggembirakan): Melibatkan keaktifan/curiosity siswa.

    TUGAS:
    Diberikan "Topik Numerasi" dan "Mata Pelajaran Guru", buatkan 1 ide aktivitas konkret.
    
    INPUT USER:
    Topik: ${topic}
    Mapel: ${subject}

    Output hanya teks aktivitasnya saja. Jangan berikan pembuka seperti "Tentu, ini idenya". Langsung ke inti aktivitas.
    
    ${LATEX_INSTRUCTION}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });
    return response.text || "Maaf, tidak dapat menghasilkan ide saat ini.";
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
};

export const validateLessonPlan = async (
  lessonPlan: string
): Promise<LessonPlanValidationResult> => {
  if (!apiKey) throw new Error("API Key missing");

  const prompt = `
    ROLE:
    Anda adalah Validator Modul Ajar SMILE. Tugas Anda adalah mereview draft rencana pembelajaran guru dan memberikan skor serta masukan konstruktif.

    KRITERIA PENILAIAN (RUBRIK):
    1. Integrasi Numerasi: Apakah numerasi muncul secara eksplisit dalam tujuan & aktivitas?
    2. Konteks (Meaningful): Apakah menggunakan data/kasus dunia nyata?
    3. Diferensiasi: Apakah ada penyesuaian untuk kemampuan siswa berbeda?

    FORMAT FEEDBACK "2 STARS & 1 WISH":
    - Star 1: Satu hal yang sudah sangat bagus.
    - Star 2: Satu hal lain yang sudah efektif.
    - Wish: Satu saran perbaikan spesifik untuk meningkatkan kualitas.

    DRAFT MODUL AJAR:
    ${lessonPlan}

    OUTPUT FORMAT (JSON ONLY):
    {
      "scores": [
        { "criteria": "Integrasi Numerasi", "score": 1, "comment": "string" },
        { "criteria": "Konteks (Meaningful)", "score": 1, "comment": "string" },
        { "criteria": "Diferensiasi", "score": 1, "comment": "string" }
      ],
      "feedback": {
        "star1": "string",
        "star2": "string",
        "wish": "string"
      }
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });
    const text = response.text || "{}";
    return JSON.parse(text) as LessonPlanValidationResult;
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
};

export const generateDesignThinkingIdeas = async (
  povStatement: string
): Promise<string> => {
  if (!apiKey) throw new Error("API Key missing");

  const prompt = `
    ROLE:
    Anda adalah Fasilitator Design Thinking untuk guru di Indonesia. Bantu guru melakukan metode "Crazy 8s" (Ideasi Cepat).

    PROBLEM (Point of View):
    ${povStatement}

    TUGAS:
    Hasilkan 8 ide aktivitas/solusi pembelajaran numerasi yang berbeda.
    
    KRITERIA IDE:
    1. Kreatif dan Inovatif (bukan "liar" atau tidak masuk akal).
    2. Sesuai dengan kondisi dan budaya yang relevan di Indonesia (kearifan lokal).
    3. Memiliki wawasan global atau standar internasional.
    
    FORMAT OUTPUT:
    Hanya list bullet points 1 sampai 8. Tiap poin maksimal 15 kata.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });
    return response.text || "Gagal menghasilkan ide.";
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
};

export const analyzeEmpathyMap = async (
    empathyMap: { says: string, thinks: string, does: string, feels: string, pain: string, gain: string }
): Promise<string> => {
    if (!apiKey) throw new Error("API Key missing");

    const prompt = `
    ROLE: Anda adalah Fasilitator Design Thinking Senior.
    TUGAS: Analisis data Empathy Map berikut dan rumuskan sebuah Problem Statement (Point of View) yang tajam dan berpusat pada pengguna (User Centric).

    DATA EMPATHY MAP:
    - SAYS: ${empathyMap.says}
    - THINKS: ${empathyMap.thinks}
    - DOES: ${empathyMap.does}
    - FEELS: ${empathyMap.feels}
    - PAIN (Ketakutan/Hambatan): ${empathyMap.pain}
    - GAIN (Harapan/Keinginan): ${empathyMap.gain}

    INSTRUKSI:
    1. Identifikasi pola atau insight utama dari data di atas.
    2. Buat 1 kalimat "Point of View (POV)" dengan format: "[PENGGUNA] membutuhkan [KEBUTUHAN] karena [WAWASAN/INSIGHT]."
    3. POV harus spesifik dan bisa ditindaklanjuti di tahap Ideate.
    
    Output HANYA kalimat POV tersebut. Jangan ada pembuka/penutup.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });
        return response.text || "Gagal menganalisis Empathy Map.";
    } catch (error) {
        console.error("Gemini Error:", error);
        throw error;
    }
}

export const analyzePrototypeFeedback = async (
  feedback: { worked: string, change: string, questions: string, ideas: string }
): Promise<string> => {
  if (!apiKey) throw new Error("API Key missing");

  const prompt = `
    ROLE: Anda adalah Coach Inovasi Pendidikan.
    TUGAS: Analisis hasil Feedback Grid dari uji coba prototype siswa dan berikan saran iterasi.

    DATA FEEDBACK:
    - What Worked (Positif): ${feedback.worked}
    - What to Change (Perbaikan): ${feedback.change}
    - Questions (Pertanyaan User): ${feedback.questions}
    - New Ideas (Ide Baru): ${feedback.ideas}

    INSTRUKSI:
    Berikan saran singkat and strategis untuk langkah selanjutnya (Iterasi).
    Apakah guru harus "Persevere" (lanjutkan dengan perbaikan kecil) atau "Pivot" (ubah pendekatan).
    Jelaskan alasannya dalam 1 paragraf yang memotivasi.
  `;

  try {
      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt
      });
      return response.text || "Gagal menganalisis feedback.";
  } catch (error) {
      console.error("Gemini Error:", error);
      throw error;
  }
}

export const generateQuestionPaper = async (request: QuestionRequest): Promise<string> => {
    if (!apiKey) throw new Error("API Key missing");

    const jenisSoalStr = request.jenisSoal.map(js => `${js} (${request.jumlahPerJenis[js]} butir)`).join(', ');
    
    let uploadedContentContext = "";
    if (request.uploadedFileContent) {
        uploadedContentContext = `
        REFERENSI WAJIB:
        Berikut adalah materi yang HARUS digunakan sebagai dasar pembuatan soal/projek.
        --- MULAI MATERI ---
        ${request.uploadedFileContent.substring(0, 10000)}
        --- SELESAI MATERI ---
        `;
    }

    // CHECK IF LEVEL 4 (C6) IS SELECTED
    const isProjectMode = request.level.includes("C6");

    let prompt = "";

    if (isProjectMode) {
       // --- C6 PROJECT BASED LEARNING PROMPT ---
       prompt = `
       Role: Anda adalah Ahli Desain Instruksional & Kurikulum Merdeka.
       Tugas: Merancang **Ide Projek Pembelajaran Tingkat Tinggi (Level C6 - Kreasi)** yang inovatif dan berpusat pada siswa.
       
       Konteks:
       - Mapel: ${request.mapel}
       - Topik: ${request.topik}
       - Jenjang: ${request.jenjang} ${request.kelas}
       - Kurikulum: ${request.kurikulum}
       ${uploadedContentContext}

       INSTRUKSI:
       Jangan buat soal pilihan ganda atau esai biasa. Buatkan rancangan aktivitas pembelajaran berbasis model seperti:
       - Project Based Learning (PjBL)
       - Problem Based Learning (PBL)
       - Inquiry Based Learning
       - Cooperative Learning
       - atau Differentiated Learning.

       Pilih model yang paling cocok dengan topik di atas.

       FORMAT OUTPUT (Markdown Rapi):
       
       BAGIAN 1: LEMBAR KERJA SISWA (STUDENT GUIDE)
       1. **Judul Proyek**: Menarik dan provokatif.
       2. **Pertanyaan Pemantik (Driving Question)**: Pertanyaan terbuka yang menantang.
       3. **Tujuan Misi**: Apa yang harus dicapai/dibuat siswa (Produk Akhir).
       4. **Langkah Kerja (Sintaks Model)**: Panduan langkah demi langkah bagi siswa.
       5. **Timeline**: Estimasi waktu pengerjaan.
       
       [---SEPARATOR_STUDENT_TEACHER---]
       
       BAGIAN 2: PANDUAN GURU & RUBRIK PENILAIAN
       1. **Identifikasi Kompetensi**: Elemen CP/TP yang disasar (Level C6).
       2. **Skenario Pembelajaran**: Tips memfasilitasi kelas.
       3. **Rubrik Penilaian**: Tabel kriteria penilaian (Sangat Baik, Baik, Cukup, Perlu Bimbingan).
       4. **Diferensiasi**: Saran penyesuaian untuk siswa mahir dan butuh bimbingan.
       
       ${LATEX_INSTRUCTION}
       `;

    } else {
       // --- STANDARD EXAM PAPER PROMPT ---
       prompt = `
       Role: Anda adalah Pembuat Soal Ujian Profesional (Assessment Developer) untuk sekolah di Indonesia.
       Tugas: Buat paket soal ujian lengkap (Naskah Siswa & Pegangan Guru).
       
       SPESIFIKASI:
       - Mapel: ${request.mapel}
       - Jenjang/Kelas: ${request.jenjang} / ${request.kelas}
       - Kurikulum: ${request.kurikulum}
       - Topik: ${request.topik}
       - Jenis Soal: ${jenisSoalStr}
       - Total Soal: ${request.jumlah} butir
       - Gaya Bahasa: ${request.gayaBahasa}
       - Level Kognitif: ${request.level}
       - Distribusi: ${request.distribusiMode}
       - Mode Gambar: ${request.enableImageMode ? `Ya, sertakan ${request.imageQuantity} soal bergambar dengan placeholder [IMAGE_GOOGLE: keyword]` : 'Tidak'}
       - Stimulus: ${request.useStimulus ? `Ya, gunakan stimulus (${request.jenisStimulus}) untuk setiap ${request.soalPerStimulus} soal` : 'Tidak'}
       
       ${uploadedContentContext}
   
       FORMAT OUTPUT (WAJIB DIIKUTI):
       
       BAGIAN 1: NASKAH SOAL (UNTUK SISWA)
       - Berikan Kop Soal sederhana.
       - Sajikan butir soal dengan nomor urut.
       - Untuk Pilihan Ganda, gunakan opsi A, B, C, D${request.jumlahOpsi === 5 ? ', E' : ''}.
       - Jangan sertakan kunci jawaban di bagian ini.
       - Gunakan format Markdown yang rapi.
       
       [---SEPARATOR_STUDENT_TEACHER---]
       
       BAGIAN 2: PEGANGAN GURU (KUNCI & KISI-KISI)
       - Judul: "PEGANGAN GURU & KUNCI JAWABAN"
       - Tampilkan Kunci Jawaban lengkap.
       - Tampilkan Pembahasan singkat jika diminta.
       - Sertakan Tabel Kisi-kisi (Blueprint) sederhana (Nomor, Indikator, Level Kognitif).
       
       ${LATEX_INSTRUCTION}
       `;
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });
        return response.text || "Gagal membuat konten.";
    } catch (error) {
        console.error("Gemini Error:", error);
        throw error;
    }
};

export const refineQuestionPaper = async (currentContent: string, action: RefineActionType): Promise<string> => {
    if (!apiKey) throw new Error("API Key missing");
    
    let instruction = "";
    switch(action) {
        case 'ANALYSIS': instruction = "Lakukan analisis butir soal: Validitas isi, Level Kognitif, dan Kualitas Pengecoh."; break;
        case 'AUDIT': instruction = "Audit soal ini: Cek kesalahan pengetikan, ambiguitas, dan kesesuaian kurikulum."; break;
        case 'KISI_KISI': instruction = "Buatkan Tabel Kisi-Kisi (Blueprint) lengkap untuk soal-soal di atas."; break;
        case 'SIMILARITY': instruction = "Cek apakah ada soal yang terlalu mirip atau duplikat."; break;
        case 'CONVERT_AKM': instruction = "Ubah soal-soal ini menjadi format AKM (Literasi & Numerasi) dengan stimulus yang lebih kompleks."; break;
        case 'CONVERT_ESSAY': instruction = "Ubah semua soal pilihan ganda menjadi Uraian/Essay."; break;
        case 'LEVEL_UP': instruction = "Tingkatkan tingkat kesulitan soal menjadi HOTS (C4-C6)."; break;
    }

    const prompt = `
    KONTEKS: Berikut adalah naskah soal yang sedang dikerjakan.
    ${currentContent.substring(0, 15000)} // Truncate if too long
    
    INSTRUKSI: ${instruction}
    
    Outputkan HANYA hasil revisi atau analisisnya.
    
    ${LATEX_INSTRUCTION}
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });
        return response.text || "Gagal memproses permintaan.";
    } catch (error) {
        console.error("Gemini Error:", error);
        throw error;
    }
};

export const generateKokurikulerDocument = async (formData: KokurikulerFormData): Promise<string> => {
  if (!apiKey) throw new Error("API Key missing");

  // Format conditional text for Madrasah vs General School
  const isMadrasah = formData.schoolType === 'MADRASAH';
  const themeText = `Tema: ${formData.theme}`;
  const religionContext = isMadrasah ? `Integrasi Nilai Islam & PAI: ${formData.paiElement}` : '';
  const context = `
    Sekolah: ${formData.schoolName} (${formData.schoolType})
    Kepala Sekolah: ${formData.headmaster}
    Koordinator: ${formData.coordinator}
    Tahun Ajaran: ${formData.academicYear}
    Kegiatan: ${formData.activityName}
    Kategori: ${formData.activityCategory}
    ${themeText}
    ${religionContext}
    Sasaran: ${formData.targetAudience}
    Waktu/Tempat: ${formData.date} di ${formData.venue}
    Frekuensi: ${formData.frequency}
    Tujuan Umum: ${formData.generalGoal}
    Tujuan Khusus: ${formData.specificGoal}
    Indikator: ${formData.successIndicators}
    Alur: ${formData.flow}
    Sumber Daya: ${formData.resources}
    Lampiran: ${formData.attachmentDescription}
    Catatan Tambahan: ${formData.notes}
  `;

  let specificInstruction = "";
  switch(formData.documentType) {
    case DocumentType.PROGRAM:
      specificInstruction = "Buatkan Program Tahunan Kegiatan Kokurikuler yang komprehensif. Sertakan Latar Belakang, Dasar Hukum, Tujuan, Target, Matriks Program, dan Anggaran.";
      break;
    case DocumentType.RENCANA:
      specificInstruction = "Buatkan Proposal/Rencana Kegiatan (Term of Reference). Sertakan Latar Belakang, Tujuan, Manfaat, Peserta, Jadwal Rinci (Rundown), Anggaran Biaya, dan Penutup.";
      break;
    case DocumentType.LAPORAN:
      specificInstruction = "Buatkan Laporan Pertanggungjawaban Kegiatan. Sertakan Pendahuluan, Pelaksanaan Kegiatan, Hasil yang Dicapai (Refleksi), Hambatan & Solusi, Dokumentasi (Placeholder), dan Penutup.";
      break;
    case DocumentType.EVALUASI:
      specificInstruction = "Buatkan Laporan Evaluasi Kegiatan Semester. Analisis ketercapaian program, feedback peserta, dan rekomendasi tindak lanjut.";
      break;
    case DocumentType.MONITORING:
      specificInstruction = "Buatkan Instrumen Monitoring & Evaluasi (Monev) Mingguan. Berupa checklist dan rubrik observasi.";
      break;
    case DocumentType.KEGIATAN_WAJIB:
      specificInstruction = "Buatkan Panduan Teknis Kegiatan Wajib Sekolah (Misal: Upacara, MPLS, Persami). Detail teknis dan pembagian tugas panitia.";
      break;
    case DocumentType.PARENTING:
      specificInstruction = "Buatkan Materi/Panduan Kegiatan Parenting/Kolaborasi Orang Tua. Termasuk undangan, materi sosialisasi, dan lembar feedback orang tua.";
      break;
  }

  const prompt = `
    ROLE: Anda adalah Konsultan Pendidikan Profesional & Administrator Sekolah Ahli.
    TUGAS: Buatkan dokumen administrasi sekolah resmi (${formData.documentType}) yang profesional, rapi, dan siap pakai.

    DATA INPUT:
    ${context}

    INSTRUKSI KHUSUS:
    ${specificInstruction}

    FORMAT OUTPUT:
    - Gunakan format Markdown yang sangat rapi.
    - Gunakan Heading (##) untuk Bab/Bagian.
    - Gunakan Tabel untuk jadwal, anggaran, atau matriks.
    - Gunakan bahasa Indonesia baku (EYD) yang formal administratif.
    - Pastikan ada tempat tanda tangan (Kepala Sekolah & Koordinator) di akhir dokumen.
    - Jika Madrasah, pastikan nuansa nilai-nilai Islam Rahmatan Lil Alamin muncul secara natural.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });
    return response.text || "Maaf, dokumen tidak dapat dibuat saat ini.";
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
};
