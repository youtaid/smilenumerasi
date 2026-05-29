
import React, { useState, useMemo } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// Set worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

import { generateLessonPlan, generateLKPD } from '../services/geminiService';
import { ModuleRequest, SchoolMode, LKPDRequest, StepValidation, ContentGenerationContext, GamificationAction } from '../types';
import { Sparkles, Loader2, Save, Download, RefreshCw, Calculator, Lightbulb, ShieldCheck, Star, Heart, TrendingUp, AlertTriangle, Book, Copy, Printer, Check, ListChecks, FileSpreadsheet, ArrowRightCircle, Target, Globe, BrainCircuit, UploadCloud, FileText, X } from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';

const JENJANG_MAP: Record<string, string[]> = {
  'TK / RA': ['Fase Fondasi'],
  'PAUD': ['Fase Fondasi'],
  'SD / MI': ['Fase A', 'Fase B', 'Fase C'],
  'SMP / MTs': ['Fase D'],
  'SMA / SMK / MA / MAK': ['Fase E', 'Fase F'],
};

const KELAS_MAP: Record<string, string[]> = {
  'Fase Fondasi': ['Kelompok A', 'Kelompok B'],
  'Fase A': ['Kelas 1', 'Kelas 2'],
  'Fase B': ['Kelas 3', 'Kelas 4'],
  'Fase C': ['Kelas 5', 'Kelas 6'],
  'Fase D': ['Kelas 7', 'Kelas 8', 'Kelas 9'],
  'Fase E': ['Kelas 10'],
  'Fase F': ['Kelas 11', 'Kelas 12'],
};

const MAPEL_UMUM = ['IPA', 'IPS', 'Matematika', 'Bahasa Indonesia', 'Bahasa Inggris', 'PJOK', 'PKn', 'Seni Budaya', 'Informatika', 'Fisika', 'Biologi', 'Kimia', 'Ekonomi', 'Geografi', 'Sosiologi', 'Sejarah'];
const MAPEL_MADRASAH = ['Al-Qur\'an Hadis', 'Akidah Akhlak', 'Fiqih', 'SKI', 'Bahasa Arab', 'Bahasa Indonesia', 'Matematika', 'IPA', 'IPS', 'PKn', 'Bahasa Inggris', 'Informatika'];

const DOMAIN_NUMERASI = ['Bilangan', 'Geometri & Pengukuran', 'Aljabar', 'Data & Ketidakpastian'];
const KONTEKS_NUMERASI = ['Personal', 'Sosial Budaya', 'Saintifik'];
const LEVEL_KOGNITIF = [
    'C1 - Mengingat',
    'C2 - Memahami',
    'C3 - Mengaplikasikan',
    'C4 - Menganalisis',
    'C5 - Mengevaluasi',
    'C6 - Mencipta'
];

interface LessonPlannerProps {
  onNavigateToContent?: (context: ContentGenerationContext) => void;
  onAwardXP?: (action: GamificationAction) => void;
}

const LessonPlanner: React.FC<LessonPlannerProps> = ({ onNavigateToContent, onAwardXP }) => {
  const [formData, setFormData] = useState<ModuleRequest>({
    mode: null,
    satuanPendidikan: '',
    namaGuru: '',
    mataPelajaran: '',
    jenjang: '',
    fase: '',
    kelas: '',
    semester: 'Ganjil',
    tahunPelajaran: '2024/2025',
    alokasiWaktuJP: '',
    jumlahPertemuan: '1',
    pengetahuanAwal: '',
    minatBelajar: '',
    latarBelakang: '',
    topik: '',
    domainNumerasi: '',
    konteksNumerasi: '',
    levelKognitif: '',
    konteksNyata: '',
    namaKepalaSekolah: '',
    nipGuru: '',
    nipKepalaSekolah: '',
    tanggal: new Date().toISOString().split('T')[0],
  });

  const [lkpdForm, setLkpdForm] = useState<LKPDRequest>({
    pertemuanKe: '1',
    durasiMenit: '30',
    fokusKemampuan: ['Pemahaman Konsep', 'Penalaran Kritis'],
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [generatedContent, setGeneratedContent] = useState('');
  const [lkpdContent, setLkpdContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingLKPD, setIsGeneratingLKPD] = useState(false);
  const [viewMode, setViewMode] = useState<'module' | 'lkpd'>('module');
  const [isCopied, setIsCopied] = useState(false);
  const [isManualMapel, setIsManualMapel] = useState(false);

  // Validation Logic
  const validation: StepValidation[] = useMemo(() => {
    const v: StepValidation[] = Array(3).fill(null).map(() => ({ isValid: false, missingFields: [] }));
    
    // Step 0: Mode & Identitas Utama
    const s0 = ['mode', 'satuanPendidikan', 'namaGuru', 'mataPelajaran', 'jenjang', 'fase', 'kelas'];
    v[0].missingFields = s0.filter(f => !formData[f as keyof ModuleRequest]);
    v[0].isValid = v[0].missingFields.length === 0;

    // Step 1: Konten & Siswa
    const s1 = ['topik', 'domainNumerasi', 'konteksNumerasi', 'levelKognitif', 'konteksNyata'];
    v[1].missingFields = s1.filter(f => !formData[f as keyof ModuleRequest]);
    v[1].isValid = v[1].missingFields.length === 0 && (!!formData.pengetahuanAwal || !!formData.minatBelajar || !!formData.latarBelakang);

    // Step 2: Pengesahan
    const s2 = ['namaKepalaSekolah', 'nipGuru', 'nipKepalaSekolah'];
    v[2].missingFields = s2.filter(f => !formData[f as keyof ModuleRequest]);
    v[2].isValid = v[2].missingFields.length === 0;

    return v;
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'mataPelajaran' && value === '__MANUAL__') {
        setIsManualMapel(true);
        setFormData(prev => ({ ...prev, mataPelajaran: '' }));
        return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.name.toLowerCase().endsWith('.txt')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setFormData(prev => ({ ...prev, uploadedFileContent: content, uploadedFileName: file.name }));
      };
      reader.readAsText(file);
    } else if (file.name.toLowerCase().endsWith('.pdf')) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const typedarray = new Uint8Array(event.target?.result as ArrayBuffer);
          const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
          let text = '';
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const strings = content.items.map((item: any) => item.str);
            text += strings.join(' ') + '\n';
          }
          setFormData(prev => ({ ...prev, uploadedFileContent: text, uploadedFileName: file.name }));
        } catch (error) {
          console.error("Error parsing PDF:", error);
          alert("Terjadi kesalahan saat membaca file PDF.");
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      alert("Mohon maaf, hanya file Text (.txt) dan PDF (.pdf) yang didukung.");
      e.target.value = '';
    }
  };

  const clearFile = () => {
    setFormData(prev => ({ ...prev, uploadedFileContent: '', uploadedFileName: '' }));
  };

  const handleModeChange = (mode: SchoolMode) => {
      setFormData(prev => ({ ...prev, mode }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setGeneratedContent('');
    setLkpdContent('');
    setViewMode('module');
    try {
      await generateLessonPlan(formData, (chunk) => {
        setGeneratedContent(prev => prev + chunk);
      });
      // Award XP on success
      if (onAwardXP) onAwardXP(GamificationAction.CREATE_LESSON_PLAN);
    } catch (error) {
      console.error('Generation failed:', error);
      alert('Terjadi kesalahan saat menghubungi server AI.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateLKPD = async () => {
    if (!generatedContent) return;
    setIsGeneratingLKPD(true);
    setLkpdContent('');
    setViewMode('lkpd');
    try {
        await generateLKPD(formData, lkpdForm, generatedContent, (chunk) => {
            setLkpdContent(prev => prev + chunk);
        });
        if (onAwardXP) onAwardXP(GamificationAction.GENERATE_LKPD);
    } catch (error) {
        alert('Terjadi kesalahan saat membuat LKPD.');
    } finally {
        setIsGeneratingLKPD(false);
    }
  };

  const handleCopy = async () => {
    const text = viewMode === 'module' ? generatedContent : lkpdContent;
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownloadDoc = () => {
    const element = document.getElementById('lesson-content-area');
    if (!element) return;

    const clone = element.cloneNode(true) as HTMLElement;

    // Fix KaTeX for Word Export: Convert to image using CodeCogs
    const katexElements = clone.querySelectorAll('.katex');
    katexElements.forEach(katexEl => {
        const annotationEl = katexEl.querySelector('annotation[encoding="application/x-tex"]');
        if (annotationEl && annotationEl.textContent) {
            const tex = annotationEl.textContent;
            const img = document.createElement('img');
            img.src = `https://latex.codecogs.com/png.image?\\dpi{300}\\bg{white}${encodeURIComponent(tex)}`;
            img.alt = tex;
            img.style.verticalAlign = 'middle';
            
            const isBlock = katexEl.classList.contains('katex-display');
            if (isBlock) {
                const div = document.createElement('div');
                div.style.textAlign = 'center';
                div.style.margin = '1em 0';
                div.appendChild(img);
                katexEl.parentNode?.replaceChild(div, katexEl);
            } else {
                katexEl.parentNode?.replaceChild(img, katexEl);
            }
        } else {
            // Fallback to MathML if annotation is missing
            const mathmlEl = katexEl.querySelector('.katex-mathml math');
            if (mathmlEl) {
                katexEl.parentNode?.replaceChild(mathmlEl.cloneNode(true), katexEl);
            }
        }
    });

    const contentHtml = clone.innerHTML;

    const preHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>Dokumen Modul Ajar</title>
        <style>
          @page {
            size: A4;
            margin: 2.54cm;
          }
          body {
            font-family: 'Arial', sans-serif;
            font-size: 11pt;
            line-height: 1.5;
            color: #000000;
          }
          h1, h2, h3, h4 {
            color: #000000;
            margin-top: 15pt;
            margin-bottom: 5pt;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 12pt;
          }
          td, th {
            border: 1px solid #000000;
            padding: 5pt;
            vertical-align: top;
            font-size: 10pt;
          }
          th {
            background-color: #f0f0f0;
            font-weight: bold;
          }
          .page-break {
            page-break-before: always;
          }
          /* Remove tailwind-specific styling artifacts */
          * { box-sizing: border-box; }
        </style>
      </head>
      <body>
    `;
    const postHtml = "</body></html>";
    const fullHtml = preHtml + contentHtml + postHtml;

    const blob = new Blob(['\ufeff', fullHtml], {
      type: 'application/msword'
    });
    
    let filename = viewMode === 'module' ? 'modul-ajar.doc' : 'lkpd-siswa.doc';

    const url = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(fullHtml);
    
    const downloadLink = document.createElement("a");
    document.body.appendChild(downloadLink);
    
    if ((navigator as any).msSaveOrOpenBlob) {
      (navigator as any).msSaveOrOpenBlob(blob, filename);
    } else {
      downloadLink.href = url;
      downloadLink.download = filename;
      downloadLink.click();
    }
    
    document.body.removeChild(downloadLink);
  };

  const handleCreateQuestions = () => {
    if (onNavigateToContent && generatedContent) {
        onNavigateToContent({
            mapel: formData.mataPelajaran,
            jenjang: formData.jenjang,
            kelas: formData.kelas,
            topik: formData.topik,
            sourceContent: generatedContent
        });
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-[#112967] flex items-center gap-2">
             <Book className="text-[#F34B1E]" /> Studio Modul Ajar
          </h1>
          <p className="text-slate-500 text-sm mt-1">
             Generator Modul Ajar Deep Learning & LKPD (KMA 1503 / Kurmer 2025)
          </p>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={() => window.print()}
             className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-200 transition-colors"
           >
             <Printer size={16} /> Cetak
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: FORM WIZARD */}
        <aside className="lg:col-span-4 space-y-6 no-print">
           <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 relative overflow-hidden">
              {/* Progress Bar */}
              <div className="flex gap-2 mb-6">
                {[0, 1, 2].map((i) => (
                    <div 
                        key={i} 
                        className={`h-1.5 rounded-full flex-1 transition-all ${i <= currentStep ? 'bg-[#112967]' : 'bg-slate-200'}`}
                    />
                ))}
              </div>

              {/* STEP 0: IDENTITAS */}
              {currentStep === 0 && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                      <div className="flex gap-2 mb-4">
                          <button
                            type="button"
                            onClick={() => handleModeChange(SchoolMode.UMUM)}
                            className={`flex-1 py-3 px-3 border-2 rounded-xl text-[10px] font-bold transition-all flex flex-col items-center justify-center gap-1 ${formData.mode === SchoolMode.UMUM ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-100 bg-slate-50 text-slate-400'}`}
                          >
                            <span className={`w-2 h-2 rounded-full ${formData.mode === SchoolMode.UMUM ? 'bg-blue-600' : 'bg-slate-300'}`}></span>
                            SEKOLAH UMUM
                          </button>
                          <button
                            type="button"
                            onClick={() => handleModeChange(SchoolMode.MADRASAH)}
                            className={`flex-1 py-3 px-3 border-2 rounded-xl text-[10px] font-bold transition-all flex flex-col items-center justify-center gap-1 ${formData.mode === SchoolMode.MADRASAH ? 'border-green-600 bg-green-50 text-green-700' : 'border-slate-100 bg-slate-50 text-slate-400'}`}
                          >
                            <span className={`w-2 h-2 rounded-full ${formData.mode === SchoolMode.MADRASAH ? 'bg-green-600' : 'bg-slate-300'}`}></span>
                            MADRASAH RI
                          </button>
                      </div>

                      <div className="space-y-3">
                          <input type="text" name="satuanPendidikan" value={formData.satuanPendidikan} onChange={handleChange} placeholder="Nama Sekolah/Madrasah" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                          <input type="text" name="namaGuru" value={formData.namaGuru} onChange={handleChange} placeholder="Nama Guru Penyusun" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                          
                          <div className="relative">
                            {isManualMapel ? (
                                <div className="flex gap-1">
                                    <input type="text" name="mataPelajaran" value={formData.mataPelajaran} onChange={handleChange} placeholder="Ketik Mapel..." className="w-full p-3 bg-slate-50 border border-blue-400 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" autoFocus />
                                    <button type="button" onClick={() => { setIsManualMapel(false); setFormData(p => ({...p, mataPelajaran: ''})); }} className="px-2 text-blue-600 font-bold text-[10px] hover:underline">BATAL</button>
                                </div>
                            ) : (
                                <select name="mataPelajaran" value={formData.mataPelajaran} onChange={handleChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" disabled={!formData.mode}>
                                    <option value="">-- Pilih Mata Pelajaran --</option>
                                    {(formData.mode === SchoolMode.MADRASAH ? MAPEL_MADRASAH : MAPEL_UMUM).map(m => <option key={m} value={m}>{m}</option>)}
                                    <option value="__MANUAL__" className="text-blue-600 font-bold">+ Ketik Mapel Sendiri</option>
                                </select>
                            )}
                          </div>

                          <div className="grid grid-cols-3 gap-2">
                                <select name="jenjang" value={formData.jenjang} onChange={handleChange} className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                                    <option value="">Jenjang</option>
                                    {Object.keys(JENJANG_MAP).map(j => <option key={j} value={j}>{j}</option>)}
                                </select>
                                <select name="fase" value={formData.fase} onChange={handleChange} className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs" disabled={!formData.jenjang}>
                                    <option value="">Fase</option>
                                    {formData.jenjang && JENJANG_MAP[formData.jenjang].map(f => <option key={f} value={f}>{f}</option>)}
                                </select>
                                <select name="kelas" value={formData.kelas} onChange={handleChange} className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs" disabled={!formData.fase}>
                                    <option value="">Kelas</option>
                                    {formData.fase && KELAS_MAP[formData.fase].map(k => <option key={k} value={k}>{k}</option>)}
                                </select>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                             <div className="relative">
                                <input type="text" name="alokasiWaktuJP" value={formData.alokasiWaktuJP} onChange={handleChange} placeholder="JP" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm pr-8" />
                                <span className="absolute right-3 top-3.5 text-xs text-slate-400 font-bold">JP</span>
                             </div>
                             <div className="relative">
                                <input type="number" name="jumlahPertemuan" value={formData.jumlahPertemuan} onChange={handleChange} placeholder="Pertemuan" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm pr-10" />
                                <span className="absolute right-3 top-3.5 text-xs text-slate-400 font-bold">PTM</span>
                             </div>
                          </div>
                      </div>
                  </div>
              )}

              {/* STEP 1: KONTEN & SISWA */}
              {currentStep === 1 && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                      <div className="space-y-3">
                          <label className="text-xs font-bold text-[#112967] uppercase">Topik & Konteks</label>
                          <input type="text" name="topik" value={formData.topik} onChange={handleChange} placeholder="Judul Bab / Topik Utama" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                          
                          {/* PILAR NUMERASI NEW SECTION */}
                          <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-3 shadow-inner">
                              <label className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                                <Target size={14} /> Pilar Numerasi & Kognitif
                              </label>
                              
                              <div className="grid gap-2">
                                  <div className="relative">
                                      <Globe className="absolute left-3 top-3 text-indigo-400" size={14} />
                                      <select name="domainNumerasi" value={formData.domainNumerasi} onChange={handleChange} className="w-full pl-9 p-2.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500">
                                          <option value="">-- Pilih Domain --</option>
                                          {DOMAIN_NUMERASI.map(d => <option key={d} value={d}>{d}</option>)}
                                      </select>
                                  </div>
                                  <div className="relative">
                                      <TrendingUp className="absolute left-3 top-3 text-indigo-400" size={14} />
                                      <select name="konteksNumerasi" value={formData.konteksNumerasi} onChange={handleChange} className="w-full pl-9 p-2.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500">
                                          <option value="">-- Pilih Konteks --</option>
                                          {KONTEKS_NUMERASI.map(k => <option key={k} value={k}>{k}</option>)}
                                      </select>
                                  </div>
                                  <div className="relative">
                                      <BrainCircuit className="absolute left-3 top-3 text-indigo-400" size={14} />
                                      <select name="levelKognitif" value={formData.levelKognitif} onChange={handleChange} className="w-full pl-9 p-2.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500">
                                          <option value="">-- Pilih Level Kognitif --</option>
                                          {LEVEL_KOGNITIF.map(l => <option key={l} value={l}>{l}</option>)}
                                      </select>
                                  </div>
                              </div>
                          </div>

                          <textarea name="konteksNyata" value={formData.konteksNyata} onChange={handleChange} placeholder="Konteks Nyata (Contoh: Jual beli di pasar lokal...)" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm h-20 resize-none" />
                      </div>
                      
                      <div className="space-y-3 pt-2 border-t border-slate-100">
                          <label className="text-xs font-bold text-[#112967] uppercase flex items-center gap-2">
                             <TrendingUp size={14} /> Profil Peserta Didik (Data Awal)
                          </label>
                          <textarea name="pengetahuanAwal" value={formData.pengetahuanAwal} onChange={handleChange} placeholder="Pengetahuan Awal Siswa..." className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm h-16 resize-none" />
                          <textarea name="minatBelajar" value={formData.minatBelajar} onChange={handleChange} placeholder="Minat / Gaya Belajar..." className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm h-16 resize-none" />
                          <textarea name="latarBelakang" value={formData.latarBelakang} onChange={handleChange} placeholder="Latar Belakang Umum..." className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm h-16 resize-none" />
                      </div>
                  </div>
              )}

              {/* STEP 2: ADMIN */}
              {currentStep === 2 && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                      <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-4">
                         <p className="text-xs text-blue-700 font-medium leading-relaxed">
                            <Sparkles className="inline w-3 h-3 mr-1" />
                            Sistem akan memproses narasi <strong>Deep Learning</strong> (Mindful, Meaningful, Joyful) secara otomatis berdasarkan data yang Anda berikan.
                         </p>
                      </div>

                      <div className="space-y-3">
                          <input type="text" name="namaKepalaSekolah" value={formData.namaKepalaSekolah} onChange={handleChange} placeholder="Nama Kepala Sekolah" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                          <div className="grid grid-cols-2 gap-2">
                             <input type="text" name="nipGuru" value={formData.nipGuru} onChange={handleChange} placeholder="NIP Guru" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                             <input type="text" name="nipKepalaSekolah" value={formData.nipKepalaSekolah} onChange={handleChange} placeholder="NIP Kepsek" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                          </div>
                          <input type="date" name="tanggal" value={formData.tanggal} onChange={handleChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                          
                          <div className="pt-2">
                             <label className="text-xs font-bold text-[#112967] uppercase flex items-center gap-2 mb-2">
                                <Book size={14} /> Referensi Tambahan
                             </label>
                             {!formData.uploadedFileName ? (
                                <div className="flex items-center justify-center w-full">
                                   <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-white hover:border-indigo-400 transition-colors">
                                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                         <div className="flex items-center gap-2 text-slate-400 mb-1">
                                             <UploadCloud className="w-6 h-6" />
                                             <span className="text-sm font-semibold">Upload File .txt / .pdf</span>
                                         </div>
                                         <p className="text-xs text-slate-400">Materi tambahan (Opsional)</p>
                                      </div>
                                      <input 
                                         type="file" 
                                         accept=".txt,.pdf" 
                                         className="hidden" 
                                         onChange={handleFileUpload} 
                                      />
                                   </label>
                                </div>
                             ) : (
                                <div className="flex items-center p-3 bg-white border border-indigo-200 rounded-lg shadow-sm">
                                   <div className="p-2 bg-indigo-50 rounded-lg mr-3">
                                      <FileText className="w-5 h-5 text-indigo-600" />
                                   </div>
                                   <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-slate-900 truncate">
                                         {formData.uploadedFileName}
                                      </p>
                                   </div>
                                   <button 
                                      onClick={clearFile}
                                      className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                                   >
                                      <X className="w-4 h-4" />
                                   </button>
                                </div>
                             )}
                          </div>
                      </div>
                  </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-2 mt-8 pt-6 border-t border-slate-100">
                  {currentStep > 0 && (
                      <button onClick={() => setCurrentStep(prev => prev - 1)} className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-50">
                          Kembali
                      </button>
                  )}
                  {currentStep < 2 ? (
                      <button onClick={() => setCurrentStep(prev => prev + 1)} disabled={!validation[currentStep].isValid} className="flex-1 bg-[#112967] text-white py-2 rounded-lg text-xs font-bold hover:bg-blue-900 disabled:opacity-50">
                          Lanjut
                      </button>
                  ) : (
                      <button onClick={handleSubmit} disabled={isLoading || !validation.every(v => v.isValid)} className="flex-1 bg-[#F34B1E] text-white py-3 rounded-lg text-sm font-bold hover:bg-orange-700 disabled:opacity-50 shadow-lg flex justify-center items-center gap-2">
                          {isLoading ? <Loader2 className="animate-spin" /> : <Sparkles size={16} />}
                          BUAT MODUL AJAR
                      </button>
                  )}
              </div>
           </div>
        </aside>

        {/* RIGHT COLUMN: DISPLAY & LKPD */}
        <section className="lg:col-span-8">
            {!generatedContent && !isLoading ? (
                <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 h-[600px] flex flex-col items-center justify-center text-slate-400 p-10 text-center shadow-sm">
                    <div className="bg-slate-50 p-6 rounded-full mb-4">
                        <Book className="w-12 h-12 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">Modul Siap Disusun</h3>
                    <p className="max-w-xs text-xs text-slate-500 leading-relaxed">
                        Isi data di panel kiri. Pastikan Mode Satuan Pendidikan sesuai regulasi sekolah Anda.
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col h-[800px]">
                    {/* View Toggle Header */}
                    <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center shrink-0 flex-wrap gap-3">
                        <div className="flex bg-white rounded-lg p-1 border border-slate-200 shadow-sm">
                            <button 
                                onClick={() => setViewMode('module')}
                                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'module' ? 'bg-[#112967] text-white shadow' : 'text-slate-500 hover:text-[#112967]'}`}
                            >
                                MODUL AJAR
                            </button>
                            <button 
                                onClick={() => setViewMode('lkpd')}
                                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'lkpd' ? 'bg-[#112967] text-white shadow' : 'text-slate-500 hover:text-[#112967]'}`}
                            >
                                LKPD SISWA
                            </button>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            {generatedContent && onNavigateToContent && (
                                <button 
                                    onClick={handleCreateQuestions}
                                    className="text-xs font-bold text-white bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 shadow-sm"
                                    title="Buat soal berdasarkan Modul Ajar ini"
                                >
                                    <FileSpreadsheet size={14} /> <span className="hidden sm:inline">Buat Soal dari Modul Ini</span>
                                </button>
                            )}
                            <button onClick={handleDownloadDoc} className="text-xs font-bold text-[#112967] hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 border border-blue-200">
                                <Download size={14} /> <span className="hidden sm:inline">Download Word</span>
                            </button>
                            <button onClick={handleCopy} className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 border border-blue-200">
                                {isCopied ? <Check size={14} /> : <Copy size={14} />} {isCopied ? 'Tersalin' : 'Salin Teks'}
                            </button>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div id="lesson-content-area" className="flex-1 overflow-y-auto p-8 bg-white custom-scrollbar">
                        {isLoading && (
                            <div className="flex flex-col items-center justify-center h-full gap-4">
                                <Loader2 className="w-10 h-10 text-[#112967] animate-spin" />
                                <p className="text-sm font-bold text-slate-500 animate-pulse">Sedang menyusun narasi pedagogik...</p>
                            </div>
                        )}
                        
                        {!isLoading && viewMode === 'module' && (
                            <MarkdownRenderer content={generatedContent} />
                        )}

                        {!isLoading && viewMode === 'lkpd' && (
                            !lkpdContent && !isGeneratingLKPD ? (
                                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                                    <ListChecks className="w-16 h-16 text-slate-200 mb-4" />
                                    <h3 className="text-lg font-bold text-slate-700 mb-2">Generator LKPD Otomatis</h3>
                                    <p className="text-xs text-slate-500 mb-6 max-w-sm">
                                        Sistem akan membuat {lkpdForm.pertemuanKe} set LKPD (Lembar Kerja Peserta Didik) yang selaras dengan Modul Ajar di atas.
                                    </p>
                                    
                                    <div className="w-full max-w-xs bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 text-left space-y-3">
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Jumlah Pertemuan</label>
                                            <input 
                                                type="number" 
                                                value={lkpdForm.pertemuanKe} 
                                                onChange={e => setLkpdForm(p => ({...p, pertemuanKe: e.target.value}))} 
                                                className="w-full p-2 border rounded-lg text-sm font-bold text-center"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Durasi (Menit)</label>
                                            <input 
                                                type="number" 
                                                value={lkpdForm.durasiMenit} 
                                                onChange={e => setLkpdForm(p => ({...p, durasiMenit: e.target.value}))} 
                                                className="w-full p-2 border rounded-lg text-sm font-bold text-center"
                                            />
                                        </div>
                                    </div>

                                    <button 
                                        onClick={handleGenerateLKPD}
                                        disabled={!lkpdForm.pertemuanKe}
                                        className="bg-[#112967] text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-blue-900 shadow-lg flex items-center gap-2"
                                    >
                                        <Sparkles size={16} /> GENERATE LKPD
                                    </button>
                                </div>
                            ) : (
                                <>
                                    {isGeneratingLKPD && (
                                        <div className="mb-6 p-4 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold flex items-center gap-2 animate-pulse">
                                            <Loader2 className="animate-spin" size={14} /> Menyusun LKPD Multi-Pertemuan...
                                        </div>
                                    )}
                                    <MarkdownRenderer content={lkpdContent} />
                                </>
                            )
                        )}
                    </div>
                </div>
            )}
        </section>
      </div>
    </div>
  );
};

export default LessonPlanner;
