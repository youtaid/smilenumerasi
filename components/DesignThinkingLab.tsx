
import React, { useState } from 'react';
import { generateDesignThinkingIdeas, analyzeEmpathyMap, analyzePrototypeFeedback } from '../services/geminiService';
import { BrainCircuit, Heart, Lightbulb, PenTool, Layout, Plus, Loader2, PlayCircle, ClipboardList, Info, Sparkles, AlertTriangle, ArrowRight, RefreshCw, MessageSquare, CheckCircle, MousePointerClick, ListChecks, Eye, ChevronDown } from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';
import { LoadingState, GamificationAction } from '../types';

interface DesignThinkingLabProps {
    onAwardXP?: (action: GamificationAction) => void;
}

const DesignThinkingLab: React.FC<DesignThinkingLabProps> = ({ onAwardXP }) => {
  const [activeStage, setActiveStage] = useState<'EMPATHIZE' | 'DEFINE' | 'IDEATE' | 'PROTOTYPE' | 'TEST'>('EMPATHIZE');
  
  // Empathy Map State
  const [empathyMap, setEmpathyMap] = useState({
    says: '', thinks: '', does: '', feels: '',
    pain: '', gain: ''
  });
  const [empathyAnalysisLoading, setEmpathyAnalysisLoading] = useState(LoadingState.IDLE);
  const [empathyError, setEmpathyError] = useState<string | null>(null);

  // Crazy 8s State
  const [pov, setPov] = useState('Siswa kelas 10 merasa matematika tidak relevan dengan cita-cita mereka sebagai seniman.');
  const [crazyIdeas, setCrazyIdeas] = useState<string>('');
  const [selectedIdea, setSelectedIdea] = useState<string | null>(null);
  const [ideationLoading, setIdeationLoading] = useState(LoadingState.IDLE);

  // Prototype State
  const [prototypePlan, setPrototypePlan] = useState('');

  // Test State
  const [feedback, setFeedback] = useState({ worked: '', change: '', questions: '', ideas: '' });
  const [iterationAdvice, setIterationAdvice] = useState<string>('');
  const [iterationLoading, setIterationLoading] = useState(LoadingState.IDLE);

  const validateEmpathyInput = () => {
    const inputs = Object.values(empathyMap);
    // Check for empty inputs or inputs that are just numbers/symbols/too short
    for (const input of inputs) {
        const trimmed = (input as string).trim();
        if (trimmed.length > 0 && trimmed.length < 5) {
            setEmpathyError("Input terlalu pendek. Mohon deskripsikan dengan kalimat yang bermakna.");
            return false;
        }
        if (trimmed.length > 0 && /^[^a-zA-Z]+$/.test(trimmed)) {
             setEmpathyError("Input terdeteksi hanya berisi angka atau simbol. Mohon gunakan kata-kata untuk mendeskripsikan observasi Anda.");
             return false;
        }
    }
    setEmpathyError(null);
    return true;
  };

  const handleGenerateIdeas = async () => {
    setIdeationLoading(LoadingState.LOADING);
    try {
      const result = await generateDesignThinkingIdeas(pov);
      setCrazyIdeas(result);
      setIdeationLoading(LoadingState.SUCCESS);
      if (onAwardXP) onAwardXP(GamificationAction.DT_IDEATE);
    } catch (error) {
      setIdeationLoading(LoadingState.ERROR);
    }
  };

  const handleAnalyzeEmpathy = async () => {
      // Validate inputs
      if(!empathyMap.says && !empathyMap.feels) {
          setEmpathyError("Mohon isi setidaknya beberapa bagian Empathy Map sebelum analisis.");
          return;
      }
      
      if (!validateEmpathyInput()) return;

      setEmpathyAnalysisLoading(LoadingState.LOADING);
      try {
          const result = await analyzeEmpathyMap(empathyMap);
          // Set result to POV in Define/Ideate stage
          setPov(result);
          // Move to Define Stage visually to show progress
          setActiveStage('DEFINE');
          setEmpathyAnalysisLoading(LoadingState.SUCCESS);
          if (onAwardXP) onAwardXP(GamificationAction.DT_EMPATHY);
      } catch(e) {
          console.error(e);
          setEmpathyAnalysisLoading(LoadingState.ERROR);
      }
  }

  const handleAnalyzeFeedback = async () => {
      setIterationLoading(LoadingState.LOADING);
      try {
          const result = await analyzePrototypeFeedback(feedback);
          setIterationAdvice(result);
          setIterationLoading(LoadingState.SUCCESS);
          if (onAwardXP) onAwardXP(GamificationAction.DT_TEST);
      } catch (error) {
          setIterationLoading(LoadingState.ERROR);
      }
  }

  // Helper to pre-fill prototype plan based on selection
  const proceedToPrototype = () => {
      setActiveStage('PROTOTYPE');
      if (selectedIdea && !prototypePlan) {
          setPrototypePlan(
`**Ide Terpilih:**
${selectedIdea}

**Rekomendasi Prototipe:**
Untuk ide ini, disarankan membuat bentuk **Visual Storyboard** atau **Simulasi Peran (Roleplay)** agar siswa dapat merasakan pengalaman langsung.

**Detail Rencana (Silakan Edit):**
1. Alat & Bahan: Kertas plano, spidol warna, sticky notes.
2. Skenario: ...
3. Fitur Utama: ...`
          );
      }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in h-[calc(100vh-100px)] flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BrainCircuit className="text-pink-600" /> Lab Design Thinking
          </h1>
          <p className="text-gray-500 text-sm">Ruang kerja inovasi: Pahami siswa, definisikan masalah, dan cari solusi.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl w-fit overflow-x-auto">
        {[
          { id: 'EMPATHIZE', label: '1. Empathize', icon: Heart },
          { id: 'DEFINE', label: '2. Define', icon: PenTool },
          { id: 'IDEATE', label: '3. Ideate', icon: Lightbulb },
          { id: 'PROTOTYPE', label: '4. Prototype', icon: Layout },
          { id: 'TEST', label: '5. Test', icon: PlayCircle },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveStage(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
              activeStage === tab.id ? 'bg-white text-pink-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 overflow-y-auto">
        {activeStage === 'EMPATHIZE' && (
          <div className="h-full flex flex-col">
            {/* GUIDANCE BLOCK */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                    <Info className="text-blue-600 shrink-0 mt-0.5" size={20} />
                    <div className="text-sm text-blue-900">
                        <strong className="block mb-1">Tujuan Tahap Empathize:</strong>
                        <p className="mb-2">
                            Memahami kebutuhan, keinginan, dan masalah pengguna (siswa/rekan guru) secara mendalam. 
                            Ini adalah fondasi inovasi yang berpusat pada manusia (*Human-Centered Design*).
                        </p>
                        <strong className="block mb-1">Cara Melakukannya:</strong>
                        <ul className="list-disc pl-5 space-y-1 text-blue-800">
                            <li><strong>Wawancara:</strong> Ajak ngobrol siswa secara personal, bukan formal.</li>
                            <li><strong>Observasi:</strong> Amati perilaku mereka di kelas atau luar kelas tanpa asumsi.</li>
                            <li><strong>Immerse:</strong> Coba posisikan diri Anda sebagai mereka (Roleplay).</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Empathy Map Canvas</h3>
                <button 
                    onClick={handleAnalyzeEmpathy}
                    disabled={empathyAnalysisLoading === LoadingState.LOADING}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                    {empathyAnalysisLoading === LoadingState.LOADING ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                    Analisis & Generate Define
                </button>
            </div>

            {empathyError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-700 font-bold animate-pulse">
                    <AlertTriangle size={16} />
                    {empathyError}
                </div>
            )}

            <div className="space-y-4 pb-10">
                {/* TOP GRID (4 Quadrants) */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <label className="font-bold text-slate-700 block mb-2 uppercase text-xs tracking-wider">SAYS (Apa yang dikatakan?)</label>
                        <textarea 
                        className="w-full h-[120px] bg-white rounded-lg p-3 text-sm border-slate-200 focus:ring-2 focus:ring-slate-300 outline-none resize-none placeholder-slate-400"
                        placeholder='"Pelajaran ini susah...", "Saya suka kalau ada video..."'
                        value={empathyMap.says}
                        onChange={e => setEmpathyMap({...empathyMap, says: e.target.value})}
                        />
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <label className="font-bold text-slate-700 block mb-2 uppercase text-xs tracking-wider">THINKS (Apa yang dipikirkan?)</label>
                        <textarea 
                        className="w-full h-[120px] bg-white rounded-lg p-3 text-sm border-slate-200 focus:ring-2 focus:ring-slate-300 outline-none resize-none placeholder-slate-400"
                        placeholder='(Mungkin) Takut salah jawab, Ingin cepat pulang...'
                        value={empathyMap.thinks}
                        onChange={e => setEmpathyMap({...empathyMap, thinks: e.target.value})}
                        />
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <label className="font-bold text-slate-700 block mb-2 uppercase text-xs tracking-wider">DOES (Apa tindakannya?)</label>
                        <textarea 
                        className="w-full h-[120px] bg-white rounded-lg p-3 text-sm border-slate-200 focus:ring-2 focus:ring-slate-300 outline-none resize-none placeholder-slate-400"
                        placeholder='Mengantuk, Mencoret buku, Aktif bertanya...'
                        value={empathyMap.does}
                        onChange={e => setEmpathyMap({...empathyMap, does: e.target.value})}
                        />
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <label className="font-bold text-slate-700 block mb-2 uppercase text-xs tracking-wider">FEELS (Apa perasaannya?)</label>
                        <textarea 
                        className="w-full h-[120px] bg-white rounded-lg p-3 text-sm border-slate-200 focus:ring-2 focus:ring-slate-300 outline-none resize-none placeholder-slate-400"
                        placeholder='Cemas, Bosan, Antusias, Bingung...'
                        value={empathyMap.feels}
                        onChange={e => setEmpathyMap({...empathyMap, feels: e.target.value})}
                        />
                    </div>
                </div>

                {/* BOTTOM GRID (Pain & Gain) */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                        <label className="font-bold text-red-800 block mb-2 uppercase text-xs tracking-wider">PAIN (Hambatan / Ketakutan)</label>
                        <textarea 
                        className="w-full h-[100px] bg-white rounded-lg p-3 text-sm border-red-200 focus:ring-2 focus:ring-red-300 outline-none resize-none placeholder-red-300"
                        placeholder='Apa yang membuat mereka frustrasi? Apa risiko yang mereka takutkan?'
                        value={empathyMap.pain}
                        onChange={e => setEmpathyMap({...empathyMap, pain: e.target.value})}
                        />
                    </div>
                    <div className="bg-teal-50 p-4 rounded-xl border border-teal-100">
                        <label className="font-bold text-teal-800 block mb-2 uppercase text-xs tracking-wider">GAIN (Harapan / Keinginan)</label>
                        <textarea 
                        className="w-full h-[100px] bg-white rounded-lg p-3 text-sm border-teal-200 focus:ring-2 focus:ring-teal-300 outline-none resize-none placeholder-teal-300"
                        placeholder='Apa yang ingin mereka capai? Apa definisi sukses bagi mereka?'
                        value={empathyMap.gain}
                        onChange={e => setEmpathyMap({...empathyMap, gain: e.target.value})}
                        />
                    </div>
                </div>
            </div>
          </div>
        )}

        {activeStage === 'DEFINE' && (
           <div className="h-full flex flex-col max-w-4xl mx-auto justify-center">
              <div className="text-center mb-8">
                 <h2 className="text-2xl font-bold text-gray-800 mb-2">Define Your Problem</h2>
                 <p className="text-gray-500">Rumuskan Point of View (POV) yang jelas berdasarkan hasil Empathy Map.</p>
              </div>

              <div className="bg-pink-50 p-8 rounded-2xl border border-pink-100 shadow-sm">
                 <label className="block font-bold text-pink-900 mb-4 text-lg">Point of View (POV) Statement:</label>
                 <textarea 
                    className="w-full p-6 text-lg rounded-xl border border-pink-200 focus:outline-none focus:ring-4 focus:ring-pink-100 text-gray-800 leading-relaxed shadow-inner"
                    rows={4}
                    value={pov}
                    onChange={(e) => setPov(e.target.value)}
                    placeholder="[PENGGUNA] membutuhkan [KEBUTUHAN] karena [INSIGHT/WAWASAN]..."
                 />
                 <div className="mt-4 flex justify-between items-center text-sm text-pink-700">
                    <span className="italic">Tips: Fokus pada insight pengguna, bukan solusi teknis.</span>
                    <button 
                        onClick={() => setActiveStage('IDEATE')}
                        className="bg-pink-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-pink-700 transition-colors"
                    >
                        Lanjut ke Ideate →
                    </button>
                 </div>
              </div>
           </div>
        )}

        {activeStage === 'IDEATE' && (
           <div className="h-full flex flex-col w-full">
             <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-100 mb-6">
                <h3 className="font-bold text-yellow-800 mb-2 flex items-center gap-2">
                    <Lightbulb size={18} /> Crazy 8s Ideation (Kreatif & Berwawasan Global)
                </h3>
                <p className="text-sm text-yellow-700 mb-4">
                    Menghasilkan 8 ide kreatif yang relevan dengan budaya Indonesia namun berstandar global: <br/>
                    <span className="font-bold italic">"{pov}"</span>
                </p>
                
                <button 
                  onClick={handleGenerateIdeas}
                  disabled={ideationLoading === LoadingState.LOADING}
                  className="w-full bg-yellow-500 text-white px-4 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-yellow-600 transition-colors shadow-sm"
                >
                   {ideationLoading === LoadingState.LOADING ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                   Mulai Brainstorming dengan AI
                </button>
             </div>

             {/* Grid Ide tanpa scroll bar internal (h-auto), interaktif */}
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-6">
               {crazyIdeas ? (
                  crazyIdeas.split('\n').filter(l => l.trim().length > 0).slice(0, 8).map((ideaRaw, idx) => {
                    const ideaText = ideaRaw.replace(/^[-*0-9.) ]+/, '');
                    const isSelected = selectedIdea === ideaText;
                    
                    return (
                      <div 
                        key={idx} 
                        onClick={() => setSelectedIdea(ideaText)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col group relative h-full min-h-[140px] shadow-sm hover:shadow-md
                            ${isSelected 
                                ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-200' 
                                : 'bg-white border-slate-200 hover:border-yellow-400'
                            }
                        `}
                      >
                         <div className={`absolute top-0 right-0 text-[10px] font-bold px-2 py-0.5 rounded-bl-lg transition-colors
                            ${isSelected ? 'bg-indigo-500 text-white' : 'bg-yellow-100 text-yellow-700'}
                         `}>
                            #{idx + 1}
                         </div>
                         
                         {isSelected && (
                             <div className="absolute top-2 left-2 text-indigo-600 animate-in zoom-in">
                                 <CheckCircle size={18} fill="currentColor" className="text-white" />
                             </div>
                         )}

                         <p className={`text-sm font-medium mt-4 leading-snug ${isSelected ? 'text-indigo-900' : 'text-slate-700'}`}>
                            {ideaText}
                         </p>
                         
                         {!isSelected && (
                             <div className="mt-auto pt-4 text-xs text-slate-300 flex items-center gap-1 group-hover:text-yellow-500 transition-colors">
                                 <MousePointerClick size={14} /> Pilih ide ini
                             </div>
                         )}
                      </div>
                    );
                  })
               ) : (
                  Array(8).fill(0).map((_, idx) => (
                    <div key={idx} className="h-32 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-300 font-bold text-2xl bg-slate-50">
                      {idx + 1}
                    </div>
                  ))
               )}
             </div>
             
             {crazyIdeas && (
                 <div className="flex justify-end mt-4 pt-4 border-t border-slate-100">
                     <div className="flex items-center gap-4">
                        {!selectedIdea && <span className="text-sm text-slate-400 italic animate-pulse">Silakan klik salah satu ide di atas...</span>}
                        <button 
                            onClick={proceedToPrototype}
                            disabled={!selectedIdea}
                            className="bg-yellow-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-yellow-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Lanjut ke Prototype <ArrowRight size={16} />
                        </button>
                     </div>
                 </div>
             )}
           </div>
        )}

        {activeStage === 'PROTOTYPE' && (
           <div className="h-full flex flex-col max-w-4xl mx-auto">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-2">
                    <Layout className="text-indigo-600" /> Rencana Prototyping
                </h3>
                <p className="text-gray-500 text-sm">
                    Kembangkan ide terpilih menjadi bentuk konkret yang bisa diuji coba.
                </p>
              </div>

              {/* Selected Idea Context */}
              {selectedIdea && (
                  <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-6 flex items-start gap-3">
                      <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600 shrink-0">
                          <Lightbulb size={20} />
                      </div>
                      <div>
                          <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider">Ide Terpilih</span>
                          <p className="font-bold text-indigo-900 text-lg leading-snug">{selectedIdea}</p>
                      </div>
                  </div>
              )}

              {/* Educational Content: Types of Prototypes */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6 shadow-sm">
                  <h4 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
                     <Info size={16} className="text-slate-400" /> Jenis Prototipe dalam Pendidikan
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                          <strong className="block text-indigo-700 mb-1">1. Konseptual (2D)</strong>
                          <p className="text-slate-600 text-xs leading-relaxed">
                             Sketsa, Storyboard (komik alur), atau Poster. Cocok untuk memvisualisasikan alur pembelajaran atau konsep abstrak.
                          </p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                          <strong className="block text-indigo-700 mb-1">2. Fisik (3D) / Mockup</strong>
                          <p className="text-slate-600 text-xs leading-relaxed">
                             Model sederhana dari kertas/kardus, diorama, atau alat peraga dari barang bekas. Cocok untuk produk fisik.
                          </p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                          <strong className="block text-indigo-700 mb-1">3. Simulasi (Roleplay)</strong>
                          <p className="text-slate-600 text-xs leading-relaxed">
                             Bermain peran (drama) antara guru-siswa untuk menguji metode mengajar atau layanan baru.
                          </p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                          <strong className="block text-indigo-700 mb-1">4. Digital (Wireframe)</strong>
                          <p className="text-slate-600 text-xs leading-relaxed">
                             Desain slide presentasi, tampilan aplikasi di kertas, atau video pendek.
                          </p>
                      </div>
                  </div>
                  <div className="mt-3 text-[10px] text-slate-400 text-right">
                      Sumber: Rangkuman dari Blog Kejarcita.id
                  </div>
              </div>

              <div className="flex-1 flex flex-col bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <label className="text-sm font-bold text-gray-700 mb-2">Deskripsi Rencana Prototype Anda (Silakan Edit):</label>
                  <textarea 
                    className="flex-1 w-full p-4 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-200 resize-none text-gray-700 min-h-[120px]"
                    placeholder="Deskripsi rencana prototipe akan muncul di sini..."
                    value={prototypePlan}
                    onChange={(e) => setPrototypePlan(e.target.value)}
                  />
                  <div className="mt-4 bg-yellow-50 p-3 rounded-lg border border-yellow-200 flex items-center gap-3">
                      <AlertTriangle className="text-yellow-600 shrink-0" size={20} />
                      <div className="text-sm text-yellow-800">
                          <strong>Langkah Selanjutnya:</strong> Segera buat prototipe tersebut dan ujikan kepada siswa (Tahap Test). Jangan habiskan waktu terlalu lama untuk menyempurnakannya.
                      </div>
                  </div>
              </div>

              <div className="flex justify-end mt-6">
                 <button 
                    onClick={() => {
                        if (onAwardXP) onAwardXP(GamificationAction.DT_PROTOTYPE);
                        setActiveStage('TEST');
                    }} 
                    disabled={!prototypePlan}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                      Lanjut ke Test (Input Feedback) <ArrowRight size={18} />
                  </button>
              </div>
           </div>
        )}

        {activeStage === 'TEST' && (
            <div className="h-full flex flex-col">
                {/* Tuntunan Langkah Kerja Block - Collapsible */}
                <details className="bg-white border border-slate-200 rounded-xl mb-4 group open:shadow-sm transition-all shrink-0">
                    <summary className="p-4 font-bold text-[#112967] flex items-center gap-2 cursor-pointer list-none hover:bg-slate-50 rounded-xl">
                        <ListChecks className="text-[#F34B1E]" /> 
                        <span>Panduan Langkah Kerja Pengujian</span>
                        <ChevronDown className="ml-auto group-open:rotate-180 transition-transform text-slate-400" size={20} />
                    </summary>
                    <div className="px-6 pb-6 pt-2 border-t border-slate-100">
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 mb-4">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Konteks Prototipe Anda:</span>
                            <div className="text-sm text-slate-700 whitespace-pre-wrap max-h-32 overflow-y-auto italic">
                                {prototypePlan}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                                <strong className="block text-blue-800 text-sm mb-1">1. Persiapan</strong>
                                <p className="text-xs text-blue-700">Siapkan prototipe dan skenario pengujian. Pastikan semua alat berfungsi.</p>
                            </div>
                            <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg">
                                <strong className="block text-indigo-800 text-sm mb-1">2. Briefing</strong>
                                <p className="text-xs text-indigo-700">Jelaskan konteks kepada siswa: "Saya sedang mencoba metode baru, tolong dicoba ya."</p>
                            </div>
                            <div className="p-3 bg-purple-50 border border-purple-100 rounded-lg">
                                <strong className="block text-purple-800 text-sm mb-1">3. Observasi</strong>
                                <p className="text-xs text-purple-700">Amati bagaimana siswa berinteraksi. Jangan intervensi atau membela diri.</p>
                            </div>
                            <div className="p-3 bg-pink-50 border border-pink-100 rounded-lg">
                                <strong className="block text-pink-800 text-sm mb-1">4. Wawancara</strong>
                                <p className="text-xs text-pink-700">Tanyakan "Kenapa?" pada hal yang mereka sukai atau bingungkan.</p>
                            </div>
                        </div>
                    </div>
                </details>

                <div className="bg-green-50 p-6 rounded-xl border border-green-100 mb-4 flex justify-between items-center shrink-0">
                    <div>
                        <h3 className="font-bold text-green-800 mb-1 flex items-center gap-2">
                            <ClipboardList size={20} /> Feedback Grid (Uji Coba Siswa)
                        </h3>
                        <p className="text-sm text-green-700 max-w-2xl">
                            Masukkan hasil pengujian. Dengarkan suara siswa tanpa membela diri (Defenseless Listening).
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 flex-1 min-h-0 overflow-y-auto mb-4">
                    <div className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col">
                        <div className="flex items-center gap-2 mb-2 text-green-600 font-bold uppercase text-xs tracking-wider">
                            <span className="text-lg">+</span> What Worked? (Hal Positif)
                        </div>
                        <textarea 
                            value={feedback.worked}
                            onChange={(e) => setFeedback({...feedback, worked: e.target.value})}
                            className="flex-1 w-full resize-none outline-none text-sm text-slate-700 placeholder-slate-300" 
                            placeholder="Apa yang disukai siswa dari prototype Anda?" 
                        />
                    </div>
                    <div className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col">
                        <div className="flex items-center gap-2 mb-2 text-red-500 font-bold uppercase text-xs tracking-wider">
                            <span className="text-lg">Δ</span> What to Change? (Perubahan)
                        </div>
                        <textarea 
                            value={feedback.change}
                            onChange={(e) => setFeedback({...feedback, change: e.target.value})}
                            className="flex-1 w-full resize-none outline-none text-sm text-slate-700 placeholder-slate-300" 
                            placeholder="Apa yang membingungkan atau tidak berfungsi?" 
                        />
                    </div>
                    <div className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col">
                        <div className="flex items-center gap-2 mb-2 text-yellow-600 font-bold uppercase text-xs tracking-wider">
                            <span className="text-lg">?</span> Questions (Pertanyaan)
                        </div>
                        <textarea 
                            value={feedback.questions}
                            onChange={(e) => setFeedback({...feedback, questions: e.target.value})}
                            className="flex-1 w-full resize-none outline-none text-sm text-slate-700 placeholder-slate-300" 
                            placeholder="Pertanyaan apa yang muncul dari siswa?" 
                        />
                    </div>
                    <div className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col">
                        <div className="flex items-center gap-2 mb-2 text-blue-600 font-bold uppercase text-xs tracking-wider">
                            <span className="text-lg">💡</span> New Ideas (Ide Baru)
                        </div>
                        <textarea 
                            value={feedback.ideas}
                            onChange={(e) => setFeedback({...feedback, ideas: e.target.value})}
                            className="flex-1 w-full resize-none outline-none text-sm text-slate-700 placeholder-slate-300" 
                            placeholder="Inspirasi baru yang muncul saat tes?" 
                        />
                    </div>
                </div>

                {iterationAdvice && (
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100 mb-4 animate-fade-in shadow-sm shrink-0">
                        <h4 className="font-bold text-indigo-900 mb-3 flex items-center gap-2">
                           <RefreshCw className="animate-spin-slow" size={18} /> Saran Iterasi & Tindak Lanjut
                        </h4>
                        <div className="text-sm text-slate-700 leading-relaxed">
                            <MarkdownRenderer content={iterationAdvice} />
                        </div>
                        <p className="mt-4 text-xs text-indigo-500 italic">
                            *Desain Thinking adalah proses berulang. Teruslah beriterasi hingga menemukan solusi paling tepat untuk siswa Anda.*
                        </p>
                    </div>
                )}

                <div className="flex justify-end pt-4 border-t border-gray-100 shrink-0">
                    <button 
                        onClick={handleAnalyzeFeedback}
                        disabled={iterationLoading === LoadingState.LOADING || (!feedback.worked && !feedback.change)}
                        className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-700 transition-colors flex items-center gap-2 shadow-lg shadow-green-200 disabled:opacity-50"
                    >
                        {iterationLoading === LoadingState.LOADING ? <Loader2 className="animate-spin" size={20} /> : <MessageSquare size={20} />}
                        Analisis Feedback & Iterasi
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default DesignThinkingLab;
