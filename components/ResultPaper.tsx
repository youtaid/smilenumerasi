
import React, { useState } from 'react';
import { 
  Printer, 
  Copy, 
  FileText, 
  ShieldCheck, 
  TableProperties, 
  Split, 
  TrendingUp, 
  RefreshCw, 
  BookOpen,
  GraduationCap,
  UserCheck,
  CopyCheck,
  ArrowRightLeft,
  Files,
  Microscope,
  Shuffle,
  Layers,
  MoreHorizontal,
  Square,
  CheckSquare,
  Image as ImageIcon,
  Search,
  Eye,
  FileDown,
  Table
} from 'lucide-react';
import { RefineActionType } from '../types';

import MarkdownRenderer from './MarkdownRenderer';

interface ResultPaperProps {
  content: string | null;
  error: string | null;
  isLoading: boolean;
  onRefine: (action: RefineActionType) => void;
  isRefining: boolean;
}

type ViewMode = 'STUDENT' | 'TEACHER' | 'BLUEPRINT';

export const ResultPaper: React.FC<ResultPaperProps> = ({ content, error, isLoading, onRefine, isRefining }) => {
  const [copySuccess, setCopySuccess] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('TEACHER');

  const SEPARATOR = "[---SEPARATOR_STUDENT_TEACHER---]";

  const rawContent = content || "";
  const parts = rawContent.split(SEPARATOR);
  
  // Basic content splitting
  const studentContent = parts[0] || "";
  const teacherContent = parts.length > 1 ? parts[1] : "";

  // Bilingual / Generic Separator Text
  const TEACHER_HEADER_DISPLAY = "\n\n" + "--- 🔒 ANSWER KEY, BLUEPRINT & TEACHER GUIDELINES / KUNCI & KISI-KISI ---" + "\n\n";

  // FILTER LOGIC: Strict Cut for Student Mode
  const getDisplayContent = () => {
    if (viewMode === 'TEACHER') {
      // Show everything: Student Part + Separator + Teacher Part
      return parts.length > 1 ? studentContent + TEACHER_HEADER_DISPLAY + teacherContent : studentContent;
    
    } else if (viewMode === 'BLUEPRINT') {
      // BLUEPRINT MODE: Extract only the Blueprint from Teacher Content
      if (!teacherContent) return "⚠️ Maaf, bagian Guru/Kisi-Kisi tidak ditemukan dalam output AI.";

      // Regex to find start of Answer Key section
      const answerKeyPattern = /(?:^|\n)\s*(?:[-=_*#]*\s*)?(?:KUNCI\s+JAWABAN|ANSWER\s+KEYS?|PEMBAHASAN|JAWABAN\s+DAN\s+PEMBAHASAN)/i;
      
      const match = teacherContent.search(answerKeyPattern);
      
      let blueprintContent = "";
      if (match !== -1) {
        blueprintContent = teacherContent.substring(0, match).trim();
      } else {
        // Fallback: If AI didn't label Answer Key clearly, showing whole teacher part is safer than showing nothing
        blueprintContent = teacherContent;
      }

      // Add a clean header for the standalone blueprint view
      return `## 📋 DOKUMEN KISI-KISI PENULISAN SOAL (BLUEPRINT)\n\n${blueprintContent}`;

    } else {
      // STUDENT MODE: Safety Clean
      
      // 1. Initial Content from Part 1
      let cleanContent = studentContent;

      // 2. Define Aggressive Patterns to Detect Teacher Content Leaking into Part 1
      const forbiddenPatterns = [
        /(?:^|\n)\s*(?:[-=_*#]*\s*)?(?:TABEL\s+)?KISI[-\s]?KISI/i,
        /(?:^|\n)\s*(?:[-=_*#]*\s*)?KUNCI\s+JAWABAN/i,
        /(?:^|\n)\s*(?:[-=_*#]*\s*)?PEMBAHASAN/i,
        /(?:^|\n)\s*(?:[-=_*#]*\s*)?RUBRIK\s+PENILAIAN/i,
        /(?:^|\n)\s*(?:[-=_*#]*\s*)?PEDOMAN\s+PENSKORAN/i,
        /(?:^|\n)\s*(?:[-=_*#]*\s*)?ANSWER\s+KEY/i,
        /(?:^|\n)\s*(?:[-=_*#]*\s*)?EXPLANATION/i,
        /(?:^|\n)\s*(?:[-=_*#]*\s*)?SCORING\s+RUBRIC/i,
        /(?:^|\n)\s*(?:[-=_*#]*\s*)?BLUEPRINT/i,
        /(?:^|\n)\s*(?:[-=_*#]*\s*)?BAGIAN\s+GURU/i,
        /(?:^|\n)\s*(?:[-=_*#]*\s*)?TEACHER\s+SECTION/i,
        /(?:^|\n)\s*(?:[-=_*#]*\s*)?LAMPIRAN\s+GURU/i
      ];

      // 3. Find the earliest occurrence of any forbidden pattern
      let minMatchIndex = -1;

      for (const pattern of forbiddenPatterns) {
        const match = cleanContent.search(pattern);
        if (match !== -1) {
          if (minMatchIndex === -1 || match < minMatchIndex) {
            minMatchIndex = match;
          }
        }
      }

      // 4. Cut content if found
      if (minMatchIndex !== -1) {
        cleanContent = cleanContent.substring(0, minMatchIndex);
      }
      
      return cleanContent;
    }
  };

  const displayContent = getDisplayContent();

  const handleCopy = () => {
    navigator.clipboard.writeText(displayContent).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const handleDownloadDoc = () => {
    const element = document.getElementById('result-content-area');
    if (!element) return;

    const clone = element.cloneNode(true) as HTMLElement;

    const buttons = clone.querySelectorAll('a[href^="https://www.google.com/search"], button, .no-print');
    buttons.forEach(btn => btn.remove());

    const icons = clone.querySelectorAll('svg');
    icons.forEach(icon => icon.remove());

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
        <title>Dokumen Soal</title>
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
    
    let filename = 'paket-soal-lengkap.doc';
    if (viewMode === 'STUDENT') filename = 'naskah-soal-siswa.doc';
    if (viewMode === 'BLUEPRINT') filename = 'kisi-kisi-blueprint.doc';

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

  const preprocessContent = (text: string) => {
    if (!text) return '';
    return text.replace(/\[IMAGE_GOOGLE:\s*(.*?)\]/g, (match, content) => {
      const keyword = content.split('|')[0].trim();
      return `\n\n> 🖼️ **Rekomendasi Gambar:** *"${content}"* - [Cari di Google](https://www.google.com/search?tbm=isch&q=${encodeURIComponent(keyword)})\n\n`;
    });
  };

  const handleVariationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const val = e.target.value as RefineActionType;
      if (val) {
          onRefine(val);
          e.target.value = "";
      }
  }

  if (error) return <div className="p-8 text-center text-red-600 bg-red-50 rounded-xl text-lg">{error}</div>;

  if (isLoading || isRefining) return (
      <div className="h-full flex flex-col items-center justify-center p-8 bg-slate-50 rounded-xl">
        <div className="animate-spin h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full mb-4"></div>
        <p className="text-slate-600 font-semibold animate-pulse text-base">
            {isRefining ? 'Sedang melakukan Quality Check & Revisi...' : 'AI sedang menyusun Paket Soal Profesional...'}
        </p>
      </div>
  );

  if (!content) return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-white border-2 border-dashed border-slate-200 rounded-xl">
        <BookOpen className="w-16 h-16 text-slate-300 mb-4" />
        <h3 className="text-xl font-semibold text-slate-700 mb-2">Area Kerja Kosong</h3>
        <p className="text-slate-500 max-w-sm mx-auto">Konfigurasikan Topik, Kompetensi, dan Jenis Soal di panel kiri untuk mulai membuat soal.</p>
      </div>
  );

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex bg-slate-100 rounded-t-xl p-1.5 gap-2 border-b border-slate-200 no-print overflow-x-auto">
        <button onClick={() => setViewMode('TEACHER')} className={`flex-1 min-w-[120px] py-2 px-3 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${viewMode === 'TEACHER' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:bg-slate-200'}`}>
            <UserCheck className="w-4 h-4" /> Guru (Lengkap)
        </button>
        <button onClick={() => setViewMode('BLUEPRINT')} className={`flex-1 min-w-[120px] py-2 px-3 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${viewMode === 'BLUEPRINT' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:bg-slate-200'}`}>
            <Table className="w-4 h-4" /> Mode Kisi-Kisi
        </button>
        <button onClick={() => setViewMode('STUDENT')} className={`flex-1 min-w-[120px] py-2 px-3 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${viewMode === 'STUDENT' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:bg-slate-200'}`}>
            <GraduationCap className="w-4 h-4" /> Siswa (Siap Cetak)
        </button>
      </div>

      {viewMode === 'TEACHER' && (
        <div className="bg-indigo-900 text-white p-2 no-print overflow-x-auto custom-scrollbar">
            <div className="flex gap-2 min-w-max pb-1 items-center">
                <div className="relative flex flex-col justify-center items-center min-w-[120px] bg-white/10 rounded-lg hover:bg-white/20 transition-colors px-2 py-1.5 border border-white/20">
                     <div className="flex items-center gap-1.5 text-yellow-300 mb-0.5">
                         <Shuffle className="w-3.5 h-3.5" />
                         <span className="text-[10px] font-bold uppercase tracking-wider">Variasi Output</span>
                     </div>
                     <select 
                        onChange={handleVariationChange}
                        className="bg-transparent text-xs text-white font-medium focus:outline-none w-full text-center cursor-pointer appearance-none py-1"
                        defaultValue=""
                     >
                        <option value="" disabled className="text-slate-900 bg-slate-100">▼ Pilih Aksi ▼</option>
                        <option value="MULTI_PACKET" className="text-slate-900 font-bold bg-white">📚 Multi Paket / Parallel</option>
                        <option value="SHUFFLE_Q" className="text-slate-900 font-bold bg-white">🔀 Acak Urutan / Shuffle</option>
                        <option value="SHUFFLE_OPT" className="text-slate-900 font-bold bg-white">🔠 Acak Opsi / Shuffle Opt</option>
                     </select>
                </div>

                <div className="w-px bg-indigo-700 mx-1 h-8"></div>
                
                <ToolBtn icon={Microscope} label="Analisis" onClick={() => onRefine('ANALYSIS')} color="text-pink-400" />
                <ToolBtn icon={ShieldCheck} label="Audit" onClick={() => onRefine('AUDIT')} color="text-emerald-400" />
                <div className="w-px bg-indigo-700 mx-1 h-8"></div>
                <ToolBtn icon={TableProperties} label="Kisi-Kisi" onClick={() => onRefine('KISI_KISI')} color="text-blue-300" />
                <ToolBtn icon={CopyCheck} label="Cek Mirip" onClick={() => onRefine('SIMILARITY')} color="text-teal-400" />
                <div className="w-px bg-indigo-700 mx-1 h-8"></div>
                <ToolBtn icon={ArrowRightLeft} label="Ubah AKM" onClick={() => onRefine('CONVERT_AKM')} color="text-orange-400" />
                <ToolBtn icon={FileText} label="Ubah Essay" onClick={() => onRefine('CONVERT_ESSAY')} color="text-yellow-400" />
                <ToolBtn icon={TrendingUp} label="Level UP" onClick={() => onRefine('LEVEL_UP')} color="text-red-400" />
            </div>
        </div>
      )}

      <div className="flex justify-end items-center py-2 px-6 bg-white border-b border-slate-200 no-print gap-3">
          <button onClick={handleDownloadDoc} className="btn-action text-blue-600 hover:bg-blue-50 border border-blue-200 px-4 py-2 rounded-lg text-sm font-medium flex gap-2 items-center">
            <FileDown className="w-4 h-4" /> Download Word
          </button>
          <button onClick={handleCopy} className="btn-action text-slate-600 hover:bg-slate-50 border border-slate-200 px-4 py-2 rounded-lg text-sm font-medium flex gap-2 items-center">
            {copySuccess ? "Disalin!" : <><Copy className="w-4 h-4" /> Copy Text</>}
          </button>
      </div>

      <div className="bg-white flex-1 overflow-hidden flex flex-col shadow-inner">
         <div className="flex-1 p-8 md:p-10 overflow-y-auto custom-scrollbar print:p-0 print:overflow-visible font-sans text-slate-900 leading-normal text-base">
            <div id="result-content-area" className="prose max-w-none">
                <MarkdownRenderer content={preprocessContent(displayContent)} />
            </div>
         </div>
      </div>
    </div>
  );
};

const ToolBtn = ({ icon: Icon, label, onClick, color }: any) => (
    <button onClick={onClick} className="flex flex-col items-center justify-center px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors gap-1 group min-w-[60px]">
        <Icon className={`w-5 h-5 ${color} group-hover:scale-110 transition-transform`} />
        <span className="text-[10px] font-medium text-center leading-tight">{label}</span>
    </button>
);
