
import React, { useState } from 'react';
import { QuestionRequest } from '../types';
import { 
  JENJANG_OPTIONS, 
  KELAS_OPTIONS,
  LEVEL_OPTIONS, 
  JENIS_SOAL_SEKOLAH,
  JENIS_SOAL_BIMBEL,
  COMMON_MAPEL,
  MAPEL_UMUM,
  MAPEL_PAI_ISLAM,
  MAPEL_KRISTEN_KATOLIK,
  MAPEL_HINDU,
  TKA_WAJIB,
  TKA_PILIHAN,
  TPS_SUBTES,
  AKM_SUBTES,
  KURIKULUM_OPTIONS, 
  SEMESTER_OPTIONS_SEKOLAH,
  SEMESTER_OPTIONS_BIMBEL,
  USER_TYPE_OPTIONS,
  GAYA_BAHASA_OPTIONS,
  JENIS_STIMULUS_OPTIONS,
  DISTRIBUSI_PRESETS,
  LANGUAGE_OPTIONS,
  JUMLAH_OPSI_OPTIONS,
  ANSWER_KEY_VARIANTS
} from '../constants';
import { 
  BookOpen, 
  Zap,
  School,
  X,
  FileSpreadsheet,
  Settings,
  Layers,
  Languages,
  BrainCircuit,
  CheckSquare,
  Image as ImageIcon,
  Key,
  UploadCloud,
  FileText
} from 'lucide-react';

interface QuestionFormProps {
  request: QuestionRequest;
  onChange: (field: keyof QuestionRequest, value: any) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

import * as pdfjsLib from 'pdfjs-dist';

// Set worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export const QuestionForm: React.FC<QuestionFormProps> = ({ request, onChange, onSubmit, isLoading }) => {
  
  const [isManualMapel, setIsManualMapel] = useState(false);

  // Updated Validation: check kelas too
  const isFormValid = request.jenjang && request.kelas && request.mapel && request.semester && request.jenisSoal.length > 0 && request.jumlah > 0;
  const isBimbel = request.userType === USER_TYPE_OPTIONS[1]; 
  
  // Tentukan opsi jenis soal berdasarkan mode bimbel/sekolah
  const currentJenisSoalOptions = isBimbel ? JENIS_SOAL_BIMBEL : JENIS_SOAL_SEKOLAH;
  const currentKelasOptions = request.jenjang ? (KELAS_OPTIONS[request.jenjang] || []) : [];
  
  const activeTabClass = isBimbel 
    ? "bg-orange-600 text-white shadow-sm ring-1 ring-orange-200" 
    : "bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-200";
    
  const buttonClass = isBimbel
    ? "bg-orange-600 hover:bg-orange-700 active:bg-orange-800"
    : "bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800";

  const ringFocusClass = isBimbel
    ? "focus:ring-orange-500 focus:border-orange-500"
    : "focus:ring-indigo-500 focus:border-indigo-500";

  const inputClass = `w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm ${ringFocusClass}`;
  const labelClass = "block text-sm font-bold text-slate-700 mb-1.5";

  // Handle Checkbox Logic & Qty
  const handleJenisSoalToggle = (opt: string) => {
    const isSelected = request.jenisSoal.includes(opt);
    let newJenisSoal = [...request.jenisSoal];
    let newJumlahPerJenis = { ...request.jumlahPerJenis };

    if (isSelected) {
      newJenisSoal = newJenisSoal.filter(item => item !== opt);
      delete newJumlahPerJenis[opt];
    } else {
      newJenisSoal.push(opt);
      // Default start with 5 questions if selected
      newJumlahPerJenis[opt] = 5; 
    }
    
    onChange('jenisSoal', newJenisSoal);
    onChange('jumlahPerJenis', newJumlahPerJenis);
  };

  const handleQtyChange = (opt: string, qty: number) => {
    const newJumlahPerJenis = { ...request.jumlahPerJenis, [opt]: qty };
    onChange('jumlahPerJenis', newJumlahPerJenis);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.name.toLowerCase().endsWith('.txt')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        onChange('uploadedFileContent', content);
        onChange('uploadedFileName', file.name);
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
          onChange('uploadedFileContent', text);
          onChange('uploadedFileName', file.name);
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
    onChange('uploadedFileContent', '');
    onChange('uploadedFileName', '');
  };

  return (
    <div className="bg-white md:rounded-xl shadow-lg border-y md:border border-slate-100 h-full flex flex-col no-print transition-colors duration-300">
      
      <div className="p-4 md:p-6 flex flex-col h-full">
        <div className="mb-4 shrink-0">
          <div className="grid grid-cols-2 gap-3 mb-2">
            <button
              onClick={() => {
                onChange('userType', USER_TYPE_OPTIONS[0]);
                onChange('semester', ''); 
                onChange('jenisSoal', []); 
                onChange('jumlahPerJenis', {});
              }}
              className={`flex flex-row items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all duration-200 border ${
                !isBimbel 
                ? `${activeTabClass} border-transparent` 
                : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
              }`}
            >
              <School className="w-4 h-4" />
              MAPEL UMUM
            </button>
            
            <button
              onClick={() => {
                onChange('userType', USER_TYPE_OPTIONS[1]);
                onChange('semester', '');
                onChange('jenisSoal', []); 
                onChange('jumlahPerJenis', {});
              }}
              className={`flex flex-row items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all duration-200 border ${
                isBimbel 
                ? `${activeTabClass} border-transparent` 
                : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
              }`}
            >
              <Zap className="w-4 h-4" />
              TPS & TKA
            </button>
          </div>
        </div>

        <div className="space-y-6 flex-1 overflow-y-auto pr-1 custom-scrollbar">
          
          {/* SECTION 1: MATERI & KOMPETENSI */}
          <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> Identitas & Materi
              </h4>
              
              {/* LANGUAGE SELECTOR */}
              <div>
                <label className={`${labelClass} flex items-center gap-2`}>
                   <Languages className="w-4 h-4 text-slate-400" /> Bahasa Pengantar
                </label>
                <select
                    value={request.language}
                    onChange={(e) => onChange('language', e.target.value)}
                    className={inputClass}
                >
                    {LANGUAGE_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>

              {/* JENJANG & KELAS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Jenjang</label>
                    <select
                      value={request.jenjang}
                      onChange={(e) => {
                        onChange('jenjang', e.target.value);
                        onChange('kelas', ''); // Reset kelas when jenjang changes
                      }}
                      className={inputClass}
                    >
                      <option value="" disabled>Pilih Jenjang</option>
                      {JENJANG_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>Kelas / Tingkat</label>
                    <select
                      value={request.kelas}
                      onChange={(e) => onChange('kelas', e.target.value)}
                      className={`${inputClass} ${!request.jenjang ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : ''}`}
                      disabled={!request.jenjang}
                    >
                      <option value="" disabled>
                        {request.jenjang ? "Pilih Kelas" : "Pilih Jenjang Dulu"}
                      </option>
                      {currentKelasOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
              </div>

              {/* MAPEL */}
              <div>
                <label className={labelClass}>Mata Pelajaran</label>
                {isManualMapel ? (
                  <div className="flex gap-2 items-stretch w-full">
                      <input
                          type="text"
                          value={request.mapel}
                          onChange={(e) => onChange('mapel', e.target.value)}
                          placeholder="Ketik Mapel..."
                          className={`flex-1 min-w-0 p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm ${ringFocusClass}`}
                          autoFocus
                      />
                      <button 
                        onClick={() => { setIsManualMapel(false); onChange('mapel', ''); }} 
                        className="shrink-0 px-4 bg-slate-200 rounded-lg text-slate-600 hover:bg-slate-300 hover:text-slate-800 transition-colors border border-slate-300 flex items-center justify-center"
                        title="Batal"
                      >
                        <X className="w-5 h-5"/>
                      </button>
                  </div>
                ) : (
                  <select
                      value={request.mapel}
                      onChange={(e) => {
                          if (e.target.value === 'OTHER_MANUAL') { setIsManualMapel(true); onChange('mapel', ''); } 
                          else { onChange('mapel', e.target.value); }
                      }}
                      className={`${inputClass} font-medium`}
                  >
                      <option value="" disabled>Pilih Mapel</option>
                      
                      {isBimbel ? (
                        <>
                          <optgroup label="TKA SMA/SMK - WAJIB" className="font-bold text-slate-900 bg-orange-50 text-xs">
                            {TKA_WAJIB.map((m) => <option key={m} value={m} className="text-sm text-slate-700">{m}</option>)}
                          </optgroup>
                          <optgroup label="TKA SMA/SMK - PILIHAN" className="font-bold text-slate-900 bg-orange-50 text-xs">
                            {TKA_PILIHAN.map((m) => <option key={m} value={m} className="text-sm text-slate-700">{m}</option>)}
                          </optgroup>
                          <optgroup label="SUBTES UTAMA TPS" className="font-bold text-slate-900 bg-orange-50 text-xs">
                            {TPS_SUBTES.map((m) => <option key={m} value={m} className="text-sm text-slate-700">{m}</option>)}
                          </optgroup>
                          <optgroup label="SUBTES UTAMA AKM" className="font-bold text-slate-900 bg-orange-50 text-xs">
                            {AKM_SUBTES.map((m) => <option key={m} value={m} className="text-sm text-slate-700">{m}</option>)}
                          </optgroup>
                        </>
                      ) : (
                        <>
                          <optgroup label="📚 MAPEL UMUM & NASIONAL" className="font-bold text-slate-900 bg-slate-50 text-xs">
                            {MAPEL_UMUM.map((m) => <option key={m} value={m} className="text-sm text-slate-700">{m}</option>)}
                          </optgroup>

                          <optgroup label="🕌 PAI & MADRASAH" className="font-bold text-slate-900 bg-slate-50 text-xs">
                            {MAPEL_PAI_ISLAM.map((m) => <option key={m} value={m} className="text-sm text-slate-700">{m}</option>)}
                          </optgroup>

                          <optgroup label="✝️ AGAMA KRISTEN & KATOLIK" className="font-bold text-slate-900 bg-slate-50 text-xs">
                            {MAPEL_KRISTEN_KATOLIK.map((m) => <option key={m} value={m} className="text-sm text-slate-700">{m}</option>)}
                          </optgroup>
                          
                          <optgroup label="🕉️ AGAMA HINDU" className="font-bold text-slate-900 bg-slate-50 text-xs">
                            {MAPEL_HINDU.map((m) => <option key={m} value={m} className="text-sm text-slate-700">{m}</option>)}
                          </optgroup>
                        </>
                      )}

                      <option value="OTHER_MANUAL" className="font-bold text-blue-600 text-sm">+ Mapel Lain (Ketik)...</option>
                  </select>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {!isBimbel && (
                     <div className="col-span-1 md:col-span-2">
                        <label className={labelClass}>Kurikulum</label>
                        <select
                          value={request.kurikulum}
                          onChange={(e) => onChange('kurikulum', e.target.value)}
                          className={inputClass}
                        >
                          {KURIKULUM_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                     </div>
                 )}
                 <div className="col-span-1 md:col-span-2">
                    <label className={labelClass}>
                        {isBimbel ? "Program / Tipe Ujian" : "Semester / Momen Asesmen"}
                    </label>
                    <select
                      value={request.semester}
                      onChange={(e) => onChange('semester', e.target.value)}
                      className={inputClass}
                    >
                      <option value="" disabled>-- Pilih Program --</option>
                      {(isBimbel ? SEMESTER_OPTIONS_BIMBEL : SEMESTER_OPTIONS_SEKOLAH).map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                 </div>
              </div>

              {/* MATERI TOPIK INPUT - Standard Padding */}
              <div className={`p-4 rounded-xl border ${isBimbel ? 'bg-orange-50 border-orange-100' : 'bg-indigo-50 border-indigo-100'}`}>
                  <div className="mb-4">
                      <label className={labelClass}>Topik / Materi Utama</label>
                      <input 
                          type="text"
                          value={request.topik || ''}
                          onChange={(e) => onChange('topik', e.target.value)}
                          placeholder="Misal: Hukum Newton, Ekosistem, Al-Fatihah"
                          className={`w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm ${ringFocusClass}`}
                      />
                  </div>
                  
                  {/* UPLOAD FILE SECTION */}
                  <div className="mb-4">
                     <label className={`${labelClass} flex justify-between items-center`}>
                        <span>Atau Upload Ringkasan Materi</span>
                        <span className="text-[10px] font-normal text-slate-500 bg-white px-2 py-0.5 rounded border">.txt only</span>
                     </label>
                     
                     {!request.uploadedFileName ? (
                        <div className="relative">
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
                        </div>
                     ) : (
                        <div className="flex items-center p-3 bg-white border border-indigo-200 rounded-lg shadow-sm">
                           <div className="p-2 bg-indigo-50 rounded-lg mr-3">
                              <FileText className="w-5 h-5 text-indigo-600" />
                           </div>
                           <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-900 truncate">
                                 {request.uploadedFileName}
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

                  <div className="mb-4">
                       <label className={labelClass}>Elemen / Sub-Materi (Opsional)</label>
                       <input 
                            type="text"
                            value={request.subElemen || ''}
                            onChange={(e) => onChange('subElemen', e.target.value)}
                            placeholder="Detail spesifik..."
                            className={`w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm ${ringFocusClass}`}
                        />
                  </div>

                  <div>
                      <label className={labelClass}>Kompetensi Dasar (CP/TP)</label>
                      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2">
                        <select 
                          value={request.kompetensiMode}
                          onChange={(e) => onChange('kompetensiMode', e.target.value)}
                          className="w-full md:w-1/3 p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-700"
                        >
                          <option value="AUTO">🤖 Auto (AI)</option>
                          <option value="MANUAL">✏️ Manual</option>
                        </select>
                        
                        {request.kompetensiMode === 'MANUAL' ? (
                           <input 
                             type="text" 
                             value={request.kompetensiManual || ''}
                             onChange={(e) => onChange('kompetensiManual', e.target.value)}
                             placeholder="Tulis CP/TP..."
                             className="w-full md:w-2/3 p-2.5 bg-white border border-slate-300 rounded-lg text-sm"
                           />
                        ) : (
                           <div className="w-full md:w-2/3 text-xs text-slate-500 italic bg-white/50 p-2.5 rounded-lg border border-dashed border-slate-300">
                             AI otomatis memilih CP/TP relevan.
                           </div>
                        )}
                      </div>
                  </div>
              </div>

               {/* KONFIGURASI KUNCI JAWABAN */}
               <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2 mb-3 text-slate-700">
                     <Key className="w-4 h-4 text-teal-600" />
                     <label className="text-sm font-bold">Fitur Kunci Jawaban</label>
                  </div>
                  
                  <div className="grid gap-2">
                     {ANSWER_KEY_VARIANTS.map((variant) => (
                        <div 
                           key={variant.id}
                           onClick={() => onChange('answerKeyDetail', variant.id)}
                           className={`p-3 rounded-lg border cursor-pointer transition-all ${
                              request.answerKeyDetail === variant.id 
                                 ? 'bg-teal-50 border-teal-300 ring-1 ring-teal-200' 
                                 : 'bg-white border-slate-200 hover:border-teal-200'
                           }`}
                        >
                           <div className="flex items-center justify-between">
                              <div>
                                <span className={`text-xs font-bold block ${request.answerKeyDetail === variant.id ? 'text-teal-800' : 'text-slate-700'}`}>
                                    {variant.label}
                                </span>
                                <span className="text-[10px] text-slate-500 mt-0.5 block">{variant.desc}</span>
                              </div>
                              {request.answerKeyDetail === variant.id && <div className="w-2 h-2 rounded-full bg-teal-500 shadow-sm"></div>}
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
          </div>

          {/* SECTION 2: KONFIGURASI SOAL */}
          <div className="space-y-4">
               <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-2">
                  <Settings className="w-4 h-4" /> Konfigurasi Teknis
               </h4>
               
               {/* JENIS SOAL */}
               <div>
                  <label className={labelClass}>
                      Jenis Soal & Jumlah
                  </label>
                  
                  <div className={`grid grid-cols-1 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 max-h-72 overflow-y-auto custom-scrollbar`}>
                      {currentJenisSoalOptions.map((opt) => {
                        const isSelected = request.jenisSoal.includes(opt);
                        const qty = request.jumlahPerJenis[opt] || 0;
                        
                        return (
                          <div 
                            key={opt} 
                            className={`
                              flex flex-col p-3 rounded-lg border transition-all
                              ${isSelected 
                                ? (isBimbel ? 'bg-orange-50 border-orange-300' : 'bg-indigo-50 border-indigo-300') 
                                : 'bg-white border-slate-200 hover:border-slate-300'}
                            `}
                          >
                             <div className="flex items-start gap-3 cursor-pointer" onClick={() => handleJenisSoalToggle(opt)}>
                                <div className={`
                                    shrink-0 w-4 h-4 mt-0.5 rounded border flex items-center justify-center transition-colors
                                    ${isSelected
                                      ? (isBimbel ? 'bg-orange-600 border-orange-600' : 'bg-indigo-600 border-indigo-600')
                                      : 'bg-white border-slate-400'}
                                `}>
                                    {isSelected && <CheckSquare className="w-3 h-3 text-white" />}
                                </div>
                                <span className={`text-sm leading-snug select-none flex-1 ${isSelected ? (isBimbel?'text-orange-900':'text-indigo-900 font-medium'):'text-slate-600'}`}>{opt}</span>
                             </div>

                             {isSelected && (
                                <div className="mt-2 ml-7 flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                                    <span className="text-xs font-semibold text-slate-500">Jml:</span>
                                    <input 
                                       type="number" min="1" max="100"
                                       value={qty}
                                       onChange={(e) => handleQtyChange(opt, parseInt(e.target.value) || 0)}
                                       className="w-16 p-1 text-center text-sm border border-slate-300 rounded-md focus:ring-1 focus:ring-indigo-500"
                                       onClick={(e) => e.stopPropagation()}
                                    />
                                    <span className="text-xs text-slate-400">butir</span>
                                </div>
                             )}
                          </div>
                        )
                      })}
                  </div>
                  {request.jenisSoal.length === 0 && (
                      <p className="text-xs text-red-500 mt-1 animate-pulse">* Pilih minimal satu jenis soal.</p>
                  )}
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                      <label className={labelClass}>Total Soal (Otomatis)</label>
                      <div className="p-2.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-700 text-sm font-bold text-center">
                         {request.jumlah} Butir
                      </div>
                  </div>
                  
                  {/* NEW FIELD: JUMLAH OPSI PILIHAN GANDA */}
                  <div>
                      <label className={labelClass}>
                          Opsi PG
                      </label>
                      <select
                          value={request.jumlahOpsi}
                          onChange={(e) => onChange('jumlahOpsi', parseInt(e.target.value))}
                          className={inputClass}
                      >
                           {JUMLAH_OPSI_OPTIONS.map((opt) => (
                             <option key={opt.value} value={opt.value}>{opt.label}</option>
                           ))}
                      </select>
                  </div>
               </div>
               
               {/* VISUAL & GAMBAR CONFIG */}
               <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                     <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-teal-600" /> Mode Soal Bergambar
                     </label>
                     <input 
                        type="checkbox"
                        checked={request.enableImageMode}
                        onChange={(e) => onChange('enableImageMode', e.target.checked)}
                        className="toggle-checkbox h-5 w-5 text-indigo-600 rounded cursor-pointer"
                     />
                  </div>
                  
                  {request.enableImageMode && (
                     <div className="mt-3 animate-in fade-in slide-in-from-top-1 space-y-3">
                        <div className="flex items-center gap-3">
                            <input 
                                type="range"
                                min="1" max={Math.min(request.jumlah || 5, 20)} 
                                value={request.imageQuantity}
                                onChange={(e) => onChange('imageQuantity', parseInt(e.target.value))}
                                className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                            />
                            <span className="text-sm font-bold text-slate-700 w-8 text-center">{request.imageQuantity}</span>
                        </div>
                        <p className="text-xs text-slate-400 italic bg-white p-2 rounded border border-slate-100">
                           AI akan menyertakan rekomendasi pencarian gambar untuk {request.imageQuantity} soal terpilih.
                        </p>
                     </div>
                  )}
               </div>

               <div className="grid grid-cols-1 gap-4">
                  <div>
                      <label className={labelClass}>Gaya Bahasa</label>
                      <select
                          value={request.gayaBahasa}
                          onChange={(e) => onChange('gayaBahasa', e.target.value)}
                          className={inputClass}
                      >
                           <option value="" disabled>Pilih Gaya Bahasa</option>
                           {GAYA_BAHASA_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                  </div>
               </div>

               {/* STIMULUS TOGGLE */}
               <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                     <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <Layers className="w-4 h-4 text-indigo-600" /> Mode Stimulus
                     </label>
                     <input 
                        type="checkbox"
                        checked={request.useStimulus}
                        onChange={(e) => onChange('useStimulus', e.target.checked)}
                        className="toggle-checkbox h-5 w-5 text-indigo-600 rounded cursor-pointer"
                     />
                  </div>
                  
                  {request.useStimulus && (
                     <div className="grid grid-cols-2 gap-3 mt-3 animate-in fade-in slide-in-from-top-1">
                        <div>
                          <select 
                             value={request.jenisStimulus}
                             onChange={(e) => onChange('jenisStimulus', e.target.value)}
                             className="w-full p-2 text-xs border border-slate-300 rounded-lg"
                          >
                             <option value="">Jenis Stimulus...</option>
                             {JENIS_STIMULUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        </div>
                        <div>
                          <select 
                             value={request.soalPerStimulus}
                             onChange={(e) => onChange('soalPerStimulus', parseInt(e.target.value))}
                             className="w-full p-2 text-xs border border-slate-300 rounded-lg"
                          >
                             <option value="1">1 Soal/Stim</option>
                             <option value="2">2 Soal/Stim</option>
                             <option value="3">3 Soal/Stim</option>
                             <option value="4">4 Soal/Stim</option>
                             <option value="5">5 Soal/Stim</option>
                          </select>
                        </div>
                     </div>
                  )}
               </div>

               {/* DISTRIBUSI KESULITAN & LEVEL */}
               <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                   <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                      <BrainCircuit className="w-4 h-4 text-rose-600" /> Tingkat Kesulitan
                   </label>
                   
                   <div className="space-y-3">
                      <select
                          value={request.level}
                          onChange={(e) => onChange('level', e.target.value)}
                          className={`w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm ${ringFocusClass}`}
                      >
                          <option value="" disabled>Level Rata-rata</option>
                          {LEVEL_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                      </select>

                      <div className="flex flex-col gap-2">
                         <label className="text-xs font-medium text-slate-500">Distribusi Soal:</label>
                         <div className="grid grid-cols-2 gap-2">
                            {DISTRIBUSI_PRESETS.map((p) => (
                               <button
                                  key={p.id}
                                  onClick={() => onChange('distribusiMode', p.id)}
                                  className={`text-xs py-2 px-2 rounded-lg border transition-all truncate ${
                                     request.distribusiMode === p.id 
                                     ? 'bg-slate-700 text-white border-slate-700 shadow-sm' 
                                     : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                                  }`}
                                  title={p.label}
                               >
                                  {p.label.split('(')[0]}
                               </button>
                            ))}
                         </div>
                      </div>
                   </div>
               </div>
          </div>

        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 shrink-0">
          <button
            onClick={onSubmit}
            disabled={isLoading || !isFormValid}
            className={`w-full py-3 px-6 rounded-xl font-bold text-white shadow-lg transition-all flex justify-center items-center gap-3 text-base
              ${isLoading || !isFormValid 
                ? 'bg-slate-300 cursor-not-allowed' 
                : `${buttonClass} hover:shadow-xl active:transform active:scale-[0.99]`}`}
          >
            {isLoading ? (
              <>
                <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                Memproses...
              </>
            ) : (
              <>
                  <FileSpreadsheet className="w-5 h-5"/>
                  GENERATE SOAL
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
