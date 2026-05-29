
import React, { useState, useEffect } from 'react';
import { generateQuestionPaper, refineQuestionPaper } from '../services/geminiService';
import { QuestionRequest, HistoryItem, RefineActionType, ContentGenerationContext, GamificationAction } from '../types';
import { QuestionForm } from './QuestionForm';
import { ResultPaper } from './ResultPaper';
import { HistoryModal } from './HistoryModal';
import { USER_TYPE_OPTIONS } from '../constants';
import { Clock, CheckCircle } from 'lucide-react';

interface ContentStudioProps {
  initialContext?: ContentGenerationContext | null;
  onAwardXP?: (action: GamificationAction) => void;
}

const ContentStudio: React.FC<ContentStudioProps> = ({ initialContext, onAwardXP }) => {
  const [request, setRequest] = useState<QuestionRequest>({
    userType: USER_TYPE_OPTIONS[0],
    language: 'Bahasa Indonesia',
    jenjang: '',
    kelas: '',
    mapel: '',
    kurikulum: 'Kurikulum Merdeka',
    semester: '',
    topik: '',
    subElemen: '',
    uploadedFileContent: '',
    uploadedFileName: '',
    kompetensiMode: 'AUTO',
    kompetensiManual: '',
    answerKeyDetail: 'EXPLAIN',
    
    jenisSoal: [],
    jumlahPerJenis: {},
    jumlah: 0,
    jumlahOpsi: 4,
    
    enableImageMode: false,
    imageQuantity: 5,
    
    gayaBahasa: 'Formal & Akademis',
    useStimulus: false,
    jenisStimulus: '',
    soalPerStimulus: 1,
    
    level: '',
    distribusiMode: 'BALANCED'
  });

  const [resultContent, setResultContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isContextLoaded, setIsContextLoaded] = useState(false);
  
  // History State
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    // Load history from localStorage on mount
    const saved = localStorage.getItem('question_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  // HYDRATE FORM IF INITIAL CONTEXT PROVIDED
  useEffect(() => {
    if (initialContext) {
      setRequest(prev => ({
        ...prev,
        userType: USER_TYPE_OPTIONS[0], // Force Mapel Umum/Sekolah mode
        jenjang: initialContext.jenjang,
        kelas: initialContext.kelas,
        mapel: initialContext.mapel,
        topik: initialContext.topik,
        uploadedFileContent: initialContext.sourceContent, // Use the generated module as source context
        uploadedFileName: "Modul Ajar (Generated).txt"
      }));
      setIsContextLoaded(true);
      // Auto hide the success indicator after a few seconds
      setTimeout(() => setIsContextLoaded(false), 5000);
    }
  }, [initialContext]);

  const saveToHistory = (req: QuestionRequest, content: string) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      request: { ...req },
      content
    };
    const newHistory = [newItem, ...history].slice(0, 50); // Keep last 50
    setHistory(newHistory);
    localStorage.setItem('question_history', JSON.stringify(newHistory));
  };

  const handleFieldChange = (field: keyof QuestionRequest, value: any) => {
    setRequest(prev => {
      const next = { ...prev, [field]: value };
      
      // Auto-calc total qty
      if (field === 'jumlahPerJenis') {
        const total = Object.values(value as Record<string, number>).reduce((a, b) => a + b, 0);
        next.jumlah = total;
      }
      
      return next;
    });
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    setResultContent(null);
    
    try {
      const content = await generateQuestionPaper(request);
      setResultContent(content);
      saveToHistory(request, content);
      // Award XP
      if (onAwardXP) onAwardXP(GamificationAction.GENERATE_QUIZ);
    } catch (err) {
      setError("Gagal membuat soal. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefine = async (action: RefineActionType) => {
    if (!resultContent) return;
    setIsRefining(true);
    try {
      const refined = await refineQuestionPaper(resultContent, action);
      // If refine adds content (e.g. analysis), we might append it or replace depending on logic.
      // For now, let's assume it might replace or append. 
      // The provided logic in ResultPaper handles separators.
      // We will simply update content.
      setResultContent(refined);
    } catch (err) {
      alert("Gagal melakukan aksi ini.");
    } finally {
      setIsRefining(false);
    }
  };

  const loadHistoryItem = (item: HistoryItem) => {
    setRequest(item.request);
    setResultContent(item.content);
    setShowHistory(false);
  };

  return (
    <div className="h-[calc(100vh-100px)] animate-fade-in flex flex-col md:flex-row gap-4 relative">
      
      {/* Sync Notification */}
      {isContextLoaded && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-4 py-2 rounded-b-xl shadow-lg flex items-center gap-2 animate-in slide-in-from-top-2">
           <CheckCircle size={16} /> Data dari Modul Ajar berhasil dimuat!
        </div>
      )}

      {/* LEFT: FORM */}
      <div className="w-full md:w-[400px] shrink-0 h-full flex flex-col">
         <div className="bg-indigo-900 text-white p-3 rounded-t-xl flex justify-between items-center shrink-0">
             <h2 className="font-bold text-sm tracking-wide">STUDIO SOAL PRO</h2>
             <button 
               onClick={() => setShowHistory(true)}
               className="text-xs bg-indigo-800 hover:bg-indigo-700 px-2 py-1 rounded flex items-center gap-1 transition-colors"
             >
               <Clock size={12} /> Riwayat
             </button>
         </div>
         <div className="flex-1 overflow-hidden">
            <QuestionForm 
              request={request}
              onChange={handleFieldChange}
              onSubmit={handleSubmit}
              isLoading={isLoading}
            />
         </div>
      </div>

      {/* RIGHT: RESULT */}
      <div className="flex-1 h-full overflow-hidden bg-white rounded-xl shadow border border-slate-200">
         <ResultPaper 
           content={resultContent}
           error={error}
           isLoading={isLoading}
           isRefining={isRefining}
           onRefine={handleRefine}
         />
      </div>

      <HistoryModal 
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        history={history}
        onSelect={loadHistoryItem}
        onDelete={(id) => {
           const next = history.filter(h => h.id !== id);
           setHistory(next);
           localStorage.setItem('question_history', JSON.stringify(next));
        }}
        onClearAll={() => {
           setHistory([]);
           localStorage.removeItem('question_history');
        }}
      />
    </div>
  );
};

export default ContentStudio;
