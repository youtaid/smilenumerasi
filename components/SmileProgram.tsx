
import React, { useState, useEffect, useRef } from 'react';
import { 
  CheckCircle, Lock, PlayCircle, FileText, MessageSquare, 
  Award, ChevronRight, ChevronLeft, Menu, Video, ClipboardList, Link, CheckSquare, Users,
  ThumbsUp, ThumbsDown, Minus, Send, MessageSquarePlus, ZoomIn, ZoomOut, Maximize, Minimize,
  ArrowRight, BrainCircuit, BookOpen, Divide, BarChart3, Globe, PenTool, Layout, Layers,
  Download, Printer, Search, MoreVertical, Plus, X, Monitor, ChevronUp, ChevronDown, List,
  RefreshCw, AlertCircle, Save, Star, Sparkles, Target, Zap, PenLine, Lightbulb, Rocket
} from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { LmsModule, LmsActivity, QuizItem, GamificationAction } from '../types';
import { getModules } from '../services/contentService'; // Import Service

// Interface untuk Feedback Data
interface ActivityFeedback {
  rating: 'LIKE' | 'NEUTRAL' | 'DISLIKE' | null;
  comment: string;
  isSubmitted: boolean;
}

// Interface untuk Hasil Refleksi AI
interface ReflectionResult {
  score: number;
  feedback: string;
  strength: string;
  improvement: string;
}

// Mapping URL Embed Google Drive
const EMBED_URLS: Record<string, string> = {
  '1.3': 'https://drive.google.com/file/d/14qS-QA2boGEbRymMsNqYtT_KACCf6K0u/preview',
  '1.4': 'https://drive.google.com/file/d/1Gwxoym8p3J2fUPg3DUQVlxip2HNEguZd/preview',
  '1.5': 'https://drive.google.com/file/d/1RF2jyK5xtKs-ItTsbkcj3_wVntc-llCP/preview',
  '2.1': 'https://drive.google.com/file/d/1NsYxEvHP3pl97rbC5XtX2nQdHbCUsuYx/preview',
  '2.4': 'https://drive.google.com/file/d/13VJh3vmehn6kICeg8pVRNkaC9WRDYblp/preview',
  '2.8': 'https://drive.google.com/file/d/13VJh3vmehn6kICeg8pVRNkaC9WRDYblp/preview'
};

// --- MINDSET ASSESSMENT DATA & LOGIC ---
const MINDSET_QUESTIONS = [
  { id: 1, text: "Kemampuan numerasi saya sudah ditentukan sejak lahir dan sulit berubah.", type: 'FIXED' },
  { id: 2, text: "Saya percaya bisa mengembangkan kemampuan numerasi dengan latihan dan strategi yang tepat.", type: 'GROWTH' },
  { id: 3, text: "Ketika saya menemui kesulitan dengan angka/data, saya cenderung menyerah.", type: 'FIXED' },
  { id: 4, text: "Saya melihat kesalahan dalam numerasi sebagai kesempatan untuk belajar.", type: 'GROWTH' },
  { id: 5, text: "Numerasi adalah urusan guru Matematika, bukan tanggung jawab saya.", type: 'FIXED' },
  { id: 6, text: "Saya menyadari ada banyak numerasi tersembunyi dalam mata pelajaran yang saya ampu.", type: 'GROWTH' },
  { id: 7, text: "Orang yang harus berusaha keras untuk memahami angka berarti memang tidak berbakat.", type: 'FIXED' },
  { id: 8, text: "Saya terbuka untuk mempelajari cara baru mengintegrasikan numerasi dalam pembelajaran.", type: 'GROWTH' },
  { id: 9, text: "Saya merasa cemas atau tidak nyaman ketika harus bekerja dengan data dan angka.", type: 'FIXED' },
  { id: 10, text: "Saya terinspirasi ketika melihat rekan guru berhasil mengintegrasikan numerasi.", type: 'GROWTH' },
];

interface SmileProgramProps {
    onAwardXP?: (action: GamificationAction) => void;
}

const SmileProgram: React.FC<SmileProgramProps> = ({ onAwardXP }) => {
  const [courseData, setCourseData] = useState<LmsModule[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Accordion State: Keep track of open sections by Module ID
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  // Quiz State
  const [quizState, setQuizState] = useState<'INTRO' | 'PLAYING' | 'RESULT'>('INTRO');
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [quizScore, setQuizScore] = useState(0);

  // --- WORKSHEET MINDSET STATE ---
  const [mindsetAnswers, setMindsetAnswers] = useState<Record<number, number>>({});
  const [mindsetStep, setMindsetStep] = useState<'QUIZ' | 'RESULT' | 'ACTION_PLAN'>('QUIZ');
  const [mindsetActionPlan, setMindsetActionPlan] = useState({
    beliefLama: '',
    reframe: '',
    yetStatement: '',
    affirmation: '',
    hiddenNumeracy: '',
    concreteStep: '',
    support: ''
  });

  // --- REFLECTION 2.9 STATE ---
  const [reflectionText, setReflectionText] = useState('');
  const [reflectionResult, setReflectionResult] = useState<ReflectionResult | null>(null);
  const [isAnalyzingRef, setIsAnalyzingRef] = useState(false);

  // --- PERSONAL TARGETS 2.10 STATE ---
  const [personalTargets, setPersonalTargets] = useState(['', '', '']);
  const [isGeneratingTargets, setIsGeneratingTargets] = useState(false);

  // Load modules on mount
  useEffect(() => {
    const data = getModules();
    setCourseData(data);
    
    // Set initial active activity if data exists
    if (data.length > 0 && data[0].activities.length > 0) {
        setActiveActivityId(data[0].activities[0].id);
        // Open the first section by default
        setOpenSections({ [data[0].id]: true });
    }
    setLoading(false);
  }, []);

  const [activeActivityId, setActiveActivityId] = useState<string>('');
  const [completedActivities, setCompletedActivities] = useState<string[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Default open on desktop
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  // State untuk menyimpan feedback per Activity ID
  const [feedbackMap, setFeedbackMap] = useState<Record<string, ActivityFeedback>>({});

  // Flatten activities for easier prev/next logic
  const allActivities = courseData.flatMap(m => m.activities);
  
  // Find index and active object
  const currentIndex = allActivities.findIndex(a => a.id === activeActivityId);
  const activeActivity = allActivities[currentIndex];

  // Get current feedback or default
  const currentFeedback = feedbackMap[activeActivityId] || { rating: null, comment: '', isSubmitted: false };
  
  // Reset states when changing activity
  useEffect(() => {
    setIsVideoPlaying(false);
    setQuizState('INTRO');
    setCurrentQuizIndex(0);
    setUserAnswers({});
    setQuizScore(0);
    
    // Reset Worksheet state
    setMindsetStep('QUIZ');
    
    // Reset Reflection state
    setReflectionResult(null);
    setReflectionText('');

    // Reset Personal Targets if empty (keep if filled to prevent loss on switch)
    if(activeActivityId !== '2.10' && personalTargets.every(t => t === '')) {
       setPersonalTargets(['', '', '']);
    }
    
    // Ensure the section containing the active activity is open
    const activeModule = courseData.find(m => m.activities.some(a => a.id === activeActivityId));
    if (activeModule) {
        setOpenSections(prev => ({ ...prev, [activeModule.id]: true }));
    }
  }, [activeActivityId, courseData]);

  const toggleSection = (moduleId: string) => {
      setOpenSections(prev => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  const toggleSidebar = () => {
      setIsSidebarOpen(!isSidebarOpen);
  };

  const handleMarkComplete = () => {
    if (!completedActivities.includes(activeActivityId)) {
      setCompletedActivities([...completedActivities, activeActivityId]);
      // Award XP!
      if (onAwardXP) onAwardXP(GamificationAction.COMPLETE_MODULE);
    }
    // Auto advance optional
    if (currentIndex < allActivities.length - 1) {
      setActiveActivityId(allActivities[currentIndex + 1].id);
    }
  };

  const handleNext = () => {
    if (currentIndex < allActivities.length - 1) {
      setActiveActivityId(allActivities[currentIndex + 1].id);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setActiveActivityId(allActivities[currentIndex - 1].id);
    }
  };

  // --- QUIZ LOGIC ---
  const handleQuizAnswer = (optionIndex: number) => {
      const optionKey = optionIndex.toString();
      setUserAnswers(prev => ({...prev, [currentQuizIndex]: optionKey}));
  };

  const submitQuiz = () => {
      if (!activeActivity.quizData) return;
      
      let correctCount = 0;
      activeActivity.quizData.forEach((item, index) => {
          if (userAnswers[index] === item.correctAnswer) {
              correctCount++;
          }
      });
      
      const score = Math.round((correctCount / activeActivity.quizData.length) * 100);
      setQuizScore(score);
      setQuizState('RESULT');
      
      if (score >= 70) {
          // Auto complete if passed
          if (!completedActivities.includes(activeActivityId)) {
              setCompletedActivities([...completedActivities, activeActivityId]);
              // Award Bonus XP for Quiz passing
              if (onAwardXP) onAwardXP(GamificationAction.COMPLETE_MODULE);
          }
      }
  };

  // --- WORKSHEET LOGIC ---
  const calculateMindsetScore = () => {
    let totalScore = 0;
    MINDSET_QUESTIONS.forEach(q => {
      const val = mindsetAnswers[q.id] || 3; // Default neutral if missed
      if (q.type === 'FIXED') {
        // Reverse score: 1->5, 2->4, 3->3, 4->2, 5->1
        totalScore += (6 - val);
      } else {
        totalScore += val;
      }
    });
    return totalScore;
  };

  const getMindsetInterpretation = (score: number) => {
    if (score >= 40) return { 
      label: 'Strong Growth Mindset', 
      color: 'text-green-600 bg-green-50 border-green-200', 
      desc: 'Anda memiliki fondasi mindset yang sangat baik untuk mengembangkan numerasi.' 
    };
    if (score >= 30) return { 
      label: 'Developing Growth Mindset', 
      color: 'text-blue-600 bg-blue-50 border-blue-200', 
      desc: 'Ada kecenderungan positif, namun masih ada area yang perlu dikembangkan.' 
    };
    if (score >= 20) return { 
      label: 'Mixed Mindset', 
      color: 'text-orange-600 bg-orange-50 border-orange-200', 
      desc: 'Campuran fixed dan growth. Perlu strategi sadar untuk bergeser ke growth.' 
    };
    return { 
      label: 'Predominantly Fixed Mindset', 
      color: 'text-red-600 bg-red-50 border-red-200', 
      desc: 'Fokus pada strategi reframing dan bukti neuroplastisitas untuk berubah.' 
    };
  };

  // --- REFLECTION AI GRADING LOGIC ---
  const handleAnalyzeReflection = async () => {
    if (!reflectionText || reflectionText.length < 50) {
        alert("Mohon tuliskan refleksi yang lebih mendalam (minimal 50 karakter).");
        return;
    }

    setIsAnalyzingRef(true);
    
    try {
        const apiKey = process.env.API_KEY;
        // Fallback simulation if no API Key (for demo purposes)
        if (!apiKey) {
            setTimeout(() => {
                setReflectionResult({
                    score: 85,
                    feedback: "Refleksi Anda menunjukkan kesadaran yang baik tentang pentingnya growth mindset. Anda telah mengidentifikasi hambatan sebelumnya dan memiliki visi positif ke depan.",
                    strength: "Kesadaran diri yang kuat.",
                    improvement: "Coba tambahkan contoh konkret strategi yang akan diterapkan di kelas besok."
                });
                setIsAnalyzingRef(false);
                if (!completedActivities.includes(activeActivityId)) {
                    setCompletedActivities([...completedActivities, activeActivityId]);
                    if (onAwardXP) onAwardXP(GamificationAction.SUBMIT_REFLECTION);
                }
            }, 2000);
            return;
        }

        const ai = new GoogleGenAI({ apiKey });
        
        const prompt = `
            Act as a Pedagogical Expert and Teacher Coach.
            Evaluate the following reflection from a teacher regarding their "Numeracy Mindset" shift after a training module.
            
            REFLECTION TEXT:
            "${reflectionText}"
            
            CRITERIA:
            1. Depth: Does it go beyond surface-level statements?
            2. Growth Mindset: Does it show a shift from fixed to growth mindset?
            3. Actionable: Is there an intent to change practice?

            OUTPUT JSON ONLY:
            {
                "score": number (0-100),
                "feedback": "string (motivating feedback in Indonesian)",
                "strength": "string (one key strength point in Indonesian)",
                "improvement": "string (one constructive suggestion in Indonesian)"
            }
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        score: { type: Type.NUMBER },
                        feedback: { type: Type.STRING },
                        strength: { type: Type.STRING },
                        improvement: { type: Type.STRING }
                    }
                }
            }
        });

        const resultText = response.text;
        if (resultText) {
            const resultJson = JSON.parse(resultText) as ReflectionResult;
            setReflectionResult(resultJson);
            
            if (resultJson.score >= 60) {
                if (!completedActivities.includes(activeActivityId)) {
                    setCompletedActivities([...completedActivities, activeActivityId]);
                    // Big XP for Reflection
                    if (onAwardXP) onAwardXP(GamificationAction.SUBMIT_REFLECTION);
                }
            }
        }

    } catch (error) {
        console.error("AI Evaluation Failed:", error);
        alert("Gagal melakukan analisis AI. Coba lagi nanti.");
    } finally {
        setIsAnalyzingRef(false);
    }
  };

  // --- AI RECOMMENDATION FOR PERSONAL TARGETS (2.10) ---
  const handleGenerateTargets = async () => {
    setIsGeneratingTargets(true);
    try {
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            // Mock data for demo
            setTimeout(() => {
                setPersonalTargets([
                    "Menggunakan data statistik nyata (contoh: data sampah sekolah) dalam diskusi mata pelajaran PPKn minggu depan.",
                    "Menyisipkan satu pertanyaan pemantik berbasis estimasi angka di setiap awal pembelajaran Bahasa Indonesia.",
                    "Berkolaborasi dengan rekan guru Matematika untuk membuat satu projek gabungan (PjBL) sederhana bulan depan."
                ]);
                setIsGeneratingTargets(false);
            }, 1500);
            return;
        }

        const ai = new GoogleGenAI({ apiKey });
        const prompt = `
            Act as a Senior Teacher Coach specialized in Numeracy across Curriculum.
            Generate 3 concrete, actionable, SMART (Specific, Measurable, Achievable, Relevant, Time-bound) professional development goals for a teacher who wants to start integrating numeracy into their non-mathematics subject.
            
            Language: Indonesian.
            Tone: Encouraging and Professional.
            
            Output strictly as a JSON array of strings (array of 3 goals).
            Example: ["Goal 1...", "Goal 2...", "Goal 3..."]
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                }
            }
        });

        const resultText = response.text;
        if (resultText) {
            const goals = JSON.parse(resultText) as string[];
            if (goals && goals.length > 0) {
                setPersonalTargets(goals.slice(0, 3));
            }
        }
    } catch (error) {
        console.error("Failed to generate targets:", error);
        alert("Gagal mendapatkan saran AI. Silakan coba lagi.");
    } finally {
        setIsGeneratingTargets(false);
    }
  };

  // Feedback Handlers
  const handleRating = (rating: 'LIKE' | 'NEUTRAL' | 'DISLIKE') => {
    setFeedbackMap(prev => ({
      ...prev,
      [activeActivityId]: { ...currentFeedback, rating }
    }));
  };

  const handleCommentChange = (text: string) => {
    setFeedbackMap(prev => ({
      ...prev,
      [activeActivityId]: { ...currentFeedback, comment: text }
    }));
  };

  const handleSubmitFeedback = () => {
    if (!currentFeedback.rating) {
      alert("Mohon pilih penilaian (ikon) terlebih dahulu.");
      return;
    }
    // Simulasi kirim ke server
    setFeedbackMap(prev => ({
      ...prev,
      [activeActivityId]: { ...currentFeedback, isSubmitted: true }
    }));
    // alert("Terima kasih atas masukan Anda!");
  };

  // Helper to extract YouTube ID
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  if (loading) {
      return <div className="p-10 text-center text-slate-500">Memuat Kurikulum...</div>;
  }

  if (courseData.length === 0) {
      return <div className="p-10 text-center text-slate-500">Belum ada materi program. Silakan hubungi Admin.</div>;
  }
  
  // Safety check if activeActivity is undefined (e.g. data cleared while user on page)
  if (!activeActivity) return null;

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] bg-slate-50 rounded-xl overflow-hidden shadow-xl border border-slate-200 animate-fade-in">
      
      {/* Top Bar (Mobile Toggle & Title) */}
      <div className="bg-white border-b border-slate-200 p-4 flex items-center justify-between shrink-0">
         <div className="flex items-center gap-3">
            <button onClick={toggleSidebar} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors" title={isSidebarOpen ? "Tutup Sidebar" : "Buka Sidebar"}>
               {isSidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
            </button>
            <div>
               <h1 className="font-bold text-[#112967] text-lg leading-tight">LMS Pelatihan Numerasi SMILE</h1>
               <p className="text-xs text-slate-500 hidden sm:block">Kurikulum Terstruktur & Adaptif</p>
            </div>
         </div>
         <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
            <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full">
               <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 transition-all duration-500" 
                    style={{ width: `${(completedActivities.length / allActivities.length) * 100}%` }}
                  ></div>
               </div>
               <span>{Math.round((completedActivities.length / allActivities.length) * 100)}% Selesai</span>
            </div>
         </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation */}
        <aside className={`${isSidebarOpen ? 'w-80' : 'w-0'} bg-white border-r border-slate-200 overflow-y-auto transition-all duration-300 flex flex-col shrink-0 custom-scrollbar`}>
           <div className="p-4 space-y-4">
              {courseData.map((module) => {
                const isOpen = openSections[module.id];
                const activeInModule = module.activities.some(a => a.id === activeActivityId);
                
                return (
                  <div key={module.id} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-slate-50">
                     {/* Module Header (Accordion Trigger) */}
                     <button 
                        onClick={() => toggleSection(module.id)}
                        className={`w-full flex items-center justify-between p-3 text-left transition-colors ${activeInModule ? 'bg-indigo-50 text-indigo-900' : 'bg-white hover:bg-slate-50'}`}
                     >
                        <div className="flex items-center gap-2">
                           <div className={`p-1.5 rounded-lg ${activeInModule ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
                              <Layers size={16} />
                           </div>
                           <h3 className="font-bold text-xs uppercase tracking-wide leading-tight line-clamp-2">{module.title}</h3>
                        </div>
                        <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                     </button>

                     {/* Activities List */}
                     <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                        <div className="p-2 space-y-1 bg-white border-t border-slate-100">
                            {module.activities.map((activity, idx) => {
                                const isActive = activity.id === activeActivityId;
                                const isCompleted = completedActivities.includes(activity.id);
                                // Simple locking logic: must complete previous to view next (unless viewed before)
                                const isLocked = !isCompleted && activity.id !== allActivities[0].id && !completedActivities.includes(allActivities[allActivities.findIndex(a => a.id === activity.id) - 1]?.id) && isActive !== true;

                                return (
                                <button
                                    key={activity.id}
                                    onClick={() => !isLocked && setActiveActivityId(activity.id)}
                                    disabled={isLocked}
                                    className={`w-full flex items-start gap-3 p-2.5 rounded-lg text-left transition-all text-sm group ${
                                    isActive ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-50 text-slate-600'
                                    } ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <div className="mt-0.5 shrink-0">
                                        {isCompleted ? (
                                            <CheckCircle size={16} className={isActive ? "text-white" : "text-green-500"} />
                                        ) : isLocked ? (
                                            <Lock size={16} className={isActive ? "text-white/70" : "text-slate-300"} />
                                        ) : (
                                            <div className={`w-4 h-4 rounded-full border-2 ${isActive ? 'border-white' : 'border-slate-300'}`}></div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className={`text-xs font-medium leading-snug mb-0.5 ${isActive ? 'text-white' : 'text-slate-700'}`}>
                                            <span className="font-bold mr-1 opacity-80">{activity.code}</span> {activity.title.split(': ')[1] || activity.title}
                                        </div>
                                        <div className={`flex items-center gap-1.5 text-[10px] ${isActive ? 'text-indigo-200' : 'text-slate-400'}`}>
                                            {activity.type === 'VIDEO' && <Video size={10} />}
                                            {activity.type === 'QUIZ' && <Award size={10} />}
                                            {activity.type === 'MATERIAL' && <FileText size={10} />}
                                            {activity.type === 'ASSIGNMENT' && <ClipboardList size={10} />}
                                            <span>{activity.duration}</span>
                                        </div>
                                    </div>
                                </button>
                                );
                            })}
                        </div>
                     </div>
                  </div>
                );
              })}
           </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-8 flex flex-col items-center">
           <div className="w-full max-w-4xl flex-1 flex flex-col">
              
              {/* Breadcrumb */}
              <div className="text-xs text-slate-500 mb-4 font-medium flex items-center gap-2">
                 <span>Program SMILE</span>
                 <ChevronRight size={12} />
                 <span>{courseData.find(m => m.activities.some(a => a.id === activeActivityId))?.title}</span>
              </div>

              {/* Content Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex-1 flex flex-col min-h-[500px]">
                 
                 {/* Content Header */}
                 <div className="p-6 border-b border-slate-100 bg-white">
                    <div className="flex items-start justify-between gap-4">
                       <div>
                          <div className="flex items-center gap-2 mb-2">
                             <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                               activeActivity.type === 'VIDEO' ? 'bg-red-100 text-red-700' : 
                               activeActivity.type === 'QUIZ' ? 'bg-purple-100 text-purple-700' : 
                               activeActivity.type === 'MEETING' ? 'bg-pink-100 text-pink-700' :
                               'bg-blue-100 text-blue-700'
                             }`}>
                               {activeActivity.type}
                             </span>
                             <span className="text-xs text-slate-400 flex items-center gap-1">
                               <PlayCircle size={12} /> Estimasi: {activeActivity.duration}
                             </span>
                          </div>
                          <h2 className="text-2xl font-bold text-slate-900">{activeActivity.title}</h2>
                       </div>
                       {completedActivities.includes(activeActivityId) && (
                          <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-green-100">
                             <CheckCircle size={14} /> Selesai
                          </div>
                       )}
                    </div>
                 </div>

                 {/* Content Body */}
                 <div className="p-8 bg-slate-50/50 flex-1 flex flex-col">
                    <div className="prose max-w-none mb-8">
                       <div className="whitespace-pre-wrap text-slate-600 text-lg leading-relaxed">{activeActivity.description}</div>
                    </div>

                    {/* Media / Content Area */}
                    <div className="w-full bg-slate-100 rounded-xl flex flex-col shadow-inner relative overflow-hidden group mb-8 border border-slate-200 min-h-[500px]">
                        
                        {/* SPECIAL CASE FOR 2.3 - WORKSHEET MINDSET */}
                        {activeActivity.id === '2.3' ? (
                           <div className="absolute inset-0 bg-white flex flex-col">
                              {/* ... (Worksheet Logic retained) ... */}
                              {/* --- WORKSHEET STAGE 1: QUIZ --- */}
                              {mindsetStep === 'QUIZ' && (
                                <div className="flex-1 flex flex-col overflow-y-auto">
                                   <div className="bg-[#112967] text-white p-6 text-center">
                                      <h3 className="text-xl font-bold mb-2">Asesmen Mindset Numerasi</h3>
                                      <p className="text-blue-200 text-sm max-w-xl mx-auto">
                                        Identifikasi kecenderungan mindset Anda. Jawab jujur sesuai kondisi saat ini.
                                        Tidak ada jawaban benar atau salah.
                                      </p>
                                   </div>
                                   
                                   <div className="flex-1 p-6 max-w-4xl mx-auto w-full">
                                      {MINDSET_QUESTIONS.map((q, idx) => (
                                        <div key={q.id} className="mb-6 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                                           <p className="font-medium text-slate-800 mb-4 text-lg">
                                             <span className="font-bold text-[#112967] mr-2">{q.id}.</span> {q.text}
                                           </p>
                                           <div className="flex gap-2 items-center justify-between sm:justify-start sm:gap-6">
                                              {[1, 2, 3, 4, 5].map(val => (
                                                <button
                                                  key={val}
                                                  onClick={() => setMindsetAnswers({...mindsetAnswers, [q.id]: val})}
                                                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 font-bold text-sm sm:text-base transition-all flex items-center justify-center
                                                    ${mindsetAnswers[q.id] === val 
                                                      ? 'bg-[#112967] border-[#112967] text-white shadow-lg scale-110' 
                                                      : 'bg-white border-slate-200 text-slate-400 hover:border-blue-400 hover:text-blue-500'}`}
                                                >
                                                  {val}
                                                </button>
                                              ))}
                                           </div>
                                           <div className="flex justify-between mt-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                              <span>Sangat Tidak Setuju</span>
                                              <span>Sangat Setuju</span>
                                           </div>
                                        </div>
                                      ))}
                                   </div>

                                   <div className="p-4 border-t border-slate-200 bg-white flex justify-end">
                                      <button 
                                        onClick={() => {
                                          if (Object.keys(mindsetAnswers).length < MINDSET_QUESTIONS.length) {
                                            alert("Mohon lengkapi semua pertanyaan terlebih dahulu.");
                                            return;
                                          }
                                          setMindsetStep('RESULT');
                                        }}
                                        className="bg-[#F34B1E] text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-orange-700 shadow-lg"
                                      >
                                        Lihat Hasil Analisis <ArrowRight size={20} />
                                      </button>
                                   </div>
                                </div>
                              )}

                              {/* --- WORKSHEET STAGE 2: RESULT --- */}
                              {mindsetStep === 'RESULT' && (
                                <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 overflow-y-auto">
                                   {(() => {
                                      const score = calculateMindsetScore();
                                      const interpretation = getMindsetInterpretation(score);
                                      return (
                                        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 max-w-2xl w-full text-center relative overflow-hidden">
                                           <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                                           
                                           <div className="mb-6">
                                              <div className="w-32 h-32 mx-auto rounded-full border-8 border-slate-100 flex items-center justify-center relative">
                                                 <span className="text-5xl font-black text-[#112967]">{score}</span>
                                                 <span className="absolute bottom-6 text-xs text-slate-400 font-bold">SKOR</span>
                                                 <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
                                                    <path className="text-blue-500" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray={`${(score / 50) * 100}, 100`} />
                                                 </svg>
                                              </div>
                                           </div>

                                           <h3 className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-2">Kategori Mindset Anda</h3>
                                           <div className={`inline-block px-6 py-2 rounded-full text-lg font-bold mb-4 border ${interpretation.color}`}>
                                              {interpretation.label}
                                           </div>
                                           <p className="text-slate-600 mb-8 leading-relaxed max-w-lg mx-auto">
                                              "{interpretation.desc}"
                                           </p>

                                           <div className="flex gap-4 justify-center">
                                              <button 
                                                onClick={() => setMindsetStep('QUIZ')}
                                                className="px-6 py-2 rounded-xl border border-slate-200 text-slate-500 font-bold text-sm hover:bg-slate-50"
                                              >
                                                Ulangi Tes
                                              </button>
                                              <button 
                                                onClick={() => setMindsetStep('ACTION_PLAN')}
                                                className="px-6 py-2 rounded-xl bg-[#112967] text-white font-bold text-sm hover:bg-blue-900 flex items-center gap-2 shadow-lg"
                                              >
                                                Susun Rencana Aksi <ArrowRight size={16} />
                                              </button>
                                           </div>
                                        </div>
                                      );
                                   })()}
                                </div>
                              )}

                              {/* --- WORKSHEET STAGE 3: ACTION PLAN --- */}
                              {mindsetStep === 'ACTION_PLAN' && (
                                <div className="flex-1 flex flex-col bg-slate-50 overflow-y-auto">
                                   <div className="bg-white border-b border-slate-200 p-4 sticky top-0 z-10 shadow-sm flex justify-between items-center">
                                      <div className="flex items-center gap-2 font-bold text-[#112967]">
                                         <BrainCircuit className="text-[#F34B1E]" /> Rencana Transformasi Mindset
                                      </div>
                                      <button onClick={() => setMindsetStep('RESULT')} className="text-slate-400 hover:text-slate-600 text-sm font-bold">Kembali</button>
                                   </div>

                                   <div className="p-6 max-w-4xl mx-auto w-full space-y-6">
                                      {/* ... (Action Plan fields) ... */}
                                      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                         <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <Target size={16} /> 1. Reframe Limiting Belief
                                         </h4>
                                         <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                               <label className="block text-xs font-bold text-slate-600 mb-2">Belief Lama (Fixed)</label>
                                               <textarea 
                                                  className="w-full p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-slate-700 min-h-[100px] outline-none focus:border-red-300"
                                                  placeholder="Contoh: Saya tidak berbakat matematika..."
                                                  value={mindsetActionPlan.beliefLama}
                                                  onChange={e => setMindsetActionPlan({...mindsetActionPlan, beliefLama: e.target.value})}
                                               />
                                            </div>
                                            <div>
                                               <label className="block text-xs font-bold text-slate-600 mb-2">Reframe Baru (Growth)</label>
                                               <textarea 
                                                  className="w-full p-3 bg-green-50 border border-green-100 rounded-lg text-sm text-slate-700 min-h-[100px] outline-none focus:border-green-300"
                                                  placeholder="Contoh: Kemampuan matematika saya bisa berkembang dengan latihan..."
                                                  value={mindsetActionPlan.reframe}
                                                  onChange={e => setMindsetActionPlan({...mindsetActionPlan, reframe: e.target.value})}
                                               />
                                            </div>
                                         </div>
                                      </div>

                                      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                         <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <Sparkles size={16} /> 2. "YET" Statement & Afirmasi
                                         </h4>
                                         <div className="space-y-4">
                                            <div>
                                               <label className="block text-xs font-bold text-slate-600 mb-2">Saya BELUM...</label>
                                               <input 
                                                  className="w-full p-3 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-100"
                                                  placeholder="...menguasai strategi numerasi ini."
                                                  value={mindsetActionPlan.yetStatement}
                                                  onChange={e => setMindsetActionPlan({...mindsetActionPlan, yetStatement: e.target.value})}
                                               />
                                            </div>
                                            <div>
                                               <label className="block text-xs font-bold text-slate-600 mb-2">Afirmasi Positif Harian</label>
                                               <input 
                                                  className="w-full p-3 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-100"
                                                  placeholder="Saya adalah pembelajar sepanjang hayat."
                                                  value={mindsetActionPlan.affirmation}
                                                  onChange={e => setMindsetActionPlan({...mindsetActionPlan, affirmation: e.target.value})}
                                               />
                                            </div>
                                         </div>
                                      </div>

                                      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                         <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <Zap size={16} /> 3. Langkah Konkret
                                         </h4>
                                         <div className="space-y-4">
                                            <div>
                                               <label className="block text-xs font-bold text-slate-600 mb-2">Numerasi Tersembunyi di Mapel Saya</label>
                                               <textarea 
                                                  className="w-full p-3 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-100 min-h-[80px]"
                                                  placeholder="Sebutkan 3 topik mapel Anda yang mengandung unsur numerasi..."
                                                  value={mindsetActionPlan.hiddenNumeracy}
                                                  onChange={e => setMindsetActionPlan({...mindsetActionPlan, hiddenNumeracy: e.target.value})}
                                               />
                                            </div>
                                            <div>
                                               <label className="block text-xs font-bold text-slate-600 mb-2">Langkah Konkret Minggu Ini</label>
                                               <textarea 
                                                  className="w-full p-3 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-100 min-h-[80px]"
                                                  placeholder="Apa yang akan Anda lakukan besok di kelas?"
                                                  value={mindsetActionPlan.concreteStep}
                                                  onChange={e => setMindsetActionPlan({...mindsetActionPlan, concreteStep: e.target.value})}
                                               />
                                            </div>
                                            <div>
                                               <label className="block text-xs font-bold text-slate-600 mb-2">Dukungan yang Dibutuhkan</label>
                                               <input 
                                                  className="w-full p-3 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-100"
                                                  placeholder="Contoh: Diskusi dengan rekan sejawat, referensi bacaan..."
                                                  value={mindsetActionPlan.support}
                                                  onChange={e => setMindsetActionPlan({...mindsetActionPlan, support: e.target.value})}
                                               />
                                            </div>
                                         </div>
                                      </div>

                                      <button 
                                        onClick={() => {
                                           handleMarkComplete();
                                           alert("Rencana Aksi berhasil disimpan ke Portofolio Anda!");
                                        }}
                                        className="w-full py-4 bg-[#112967] text-white rounded-xl font-bold shadow-lg hover:bg-blue-900 transition-colors flex items-center justify-center gap-2"
                                      >
                                         <Save size={20} /> Simpan & Selesaikan Modul
                                      </button>
                                   </div>
                                </div>
                              )}
                           </div>
                        ) : activeActivity.id === '2.9' ? (
                           // --- SPECIAL CASE FOR 2.9 - REFLECTION FORM WITH AI ---
                           <div className="absolute inset-0 bg-slate-50 flex flex-col overflow-y-auto">
                              {!reflectionResult ? (
                                <div className="p-8 max-w-3xl mx-auto w-full flex flex-col h-full justify-center">
                                    <div className="bg-white rounded-2xl shadow-xl border border-indigo-100 overflow-hidden">
                                        <div className="bg-[#112967] p-6 text-white text-center">
                                            <h3 className="text-xl font-bold mb-2 flex items-center justify-center gap-2">
                                                <Sparkles className="text-yellow-400" /> Refleksi Mindset Numerasi
                                            </h3>
                                            <p className="text-blue-100 text-sm">
                                                Ceritakan perubahan perspektif Anda setelah mempelajari modul ini.
                                                AI akan membantu memberikan umpan balik konstruktif.
                                            </p>
                                        </div>
                                        <div className="p-8">
                                            <label className="block text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                                                <PenLine size={18} className="text-[#F34B1E]" />
                                                Bagaimana pandangan Anda tentang numerasi berubah setelah mempelajari modul ini?
                                            </label>
                                            <textarea 
                                                className="w-full p-4 border border-slate-300 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none min-h-[200px] text-slate-700 leading-relaxed resize-none transition-all"
                                                placeholder="Tuliskan refleksi Anda secara mendalam di sini... (Minimal 50 karakter)"
                                                value={reflectionText}
                                                onChange={(e) => setReflectionText(e.target.value)}
                                            />
                                            <div className="mt-2 flex justify-between text-xs text-slate-400">
                                                <span>Minimal 50 karakter agar AI dapat menganalisis.</span>
                                                <span>{reflectionText.length} Karakter</span>
                                            </div>
                                            
                                            <button 
                                                onClick={handleAnalyzeReflection}
                                                disabled={isAnalyzingRef || reflectionText.length < 50}
                                                className="w-full mt-6 bg-[#F34B1E] text-white py-3.5 rounded-xl font-bold shadow-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                                            >
                                                {isAnalyzingRef ? (
                                                    <>
                                                        <RefreshCw className="animate-spin" size={20} /> Menganalisis Refleksi...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Send size={20} /> Kirim & Analisis Refleksi
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                              ) : (
                                <div className="p-8 max-w-4xl mx-auto w-full">
                                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                                <Award className="text-purple-600" /> Hasil Analisis Refleksi
                                            </h3>
                                            <button 
                                                onClick={() => setReflectionResult(null)}
                                                className="text-sm text-slate-500 hover:text-slate-800 font-medium"
                                            >
                                                Edit Refleksi
                                            </button>
                                        </div>
                                        
                                        <div className="p-8 grid md:grid-cols-3 gap-8">
                                            {/* Score Column */}
                                            <div className="md:col-span-1 flex flex-col items-center justify-center text-center p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                                                <div className="relative w-32 h-32 mb-4">
                                                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                                        <path className="text-indigo-200" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                                                        <path className="text-indigo-600" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray={`${reflectionResult.score}, 100`} />
                                                    </svg>
                                                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                                                        <span className="text-4xl font-black text-indigo-900">{reflectionResult.score}</span>
                                                        <span className="text-[10px] font-bold text-indigo-400 uppercase">Skor</span>
                                                    </div>
                                                </div>
                                                <div className={`px-3 py-1 rounded-full text-xs font-bold mb-2 ${reflectionResult.score >= 70 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                    {reflectionResult.score >= 70 ? 'Sangat Baik' : 'Cukup Baik'}
                                                </div>
                                                <p className="text-xs text-slate-500">Skor berdasarkan kedalaman dan mindset growth.</p>
                                            </div>

                                            {/* Feedback Column */}
                                            <div className="md:col-span-2 space-y-4">
                                                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                                    <h4 className="font-bold text-blue-800 text-sm mb-2 flex items-center gap-2">
                                                        <MessageSquare size={16} /> Umpan Balik AI
                                                    </h4>
                                                    <p className="text-sm text-blue-900 leading-relaxed">
                                                        "{reflectionResult.feedback}"
                                                    </p>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                                                        <h4 className="font-bold text-green-800 text-xs uppercase mb-2 flex items-center gap-2">
                                                            <ThumbsUp size={14} /> Kekuatan
                                                        </h4>
                                                        <p className="text-xs text-green-800 font-medium">
                                                            {reflectionResult.strength}
                                                        </p>
                                                    </div>
                                                    <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                                                        <h4 className="font-bold text-orange-800 text-xs uppercase mb-2 flex items-center gap-2">
                                                            <Lightbulb size={14} /> Saran
                                                        </h4>
                                                        <p className="text-xs text-orange-800 font-medium">
                                                            {reflectionResult.improvement}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-4 bg-slate-50 border-t border-slate-200 text-right">
                                            {reflectionResult.score >= 60 ? (
                                                <button 
                                                    onClick={handleMarkComplete} 
                                                    className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold shadow hover:bg-green-700 transition-colors flex items-center gap-2 ml-auto"
                                                >
                                                    <CheckCircle size={18} /> Simpan & Selesai
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={() => setReflectionResult(null)}
                                                    className="bg-yellow-500 text-white px-6 py-2 rounded-lg font-bold shadow hover:bg-yellow-600 transition-colors flex items-center gap-2 ml-auto"
                                                >
                                                    <RefreshCw size={18} /> Perbaiki Refleksi
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                              )}
                           </div>
                        ) : activeActivity.id === '2.10' ? (
                           // --- SPECIAL CASE FOR 2.10 - PERSONAL TARGETS (SMART GOALS) ---
                           <div className="absolute inset-0 bg-slate-50 flex flex-col overflow-y-auto">
                              <div className="p-8 max-w-4xl mx-auto w-full">
                                  <div className="bg-white rounded-2xl shadow-xl border border-indigo-100 overflow-hidden">
                                      <div className="bg-indigo-900 p-6 text-white text-center relative overflow-hidden">
                                          <div className="absolute top-0 right-0 p-4 opacity-10">
                                              <Target size={120} />
                                          </div>
                                          <h3 className="text-xl font-bold mb-2 flex items-center justify-center gap-2 relative z-10">
                                              <Rocket className="text-orange-400" /> Target Pengembangan Diri
                                          </h3>
                                          <p className="text-indigo-200 text-sm relative z-10 max-w-2xl mx-auto">
                                              Rumuskan 3 target konkret (SMART Goals) untuk mengintegrasikan numerasi dalam pembelajaran Anda semester ini.
                                          </p>
                                      </div>

                                      <div className="p-8 space-y-6">
                                          {personalTargets.map((target, idx) => (
                                              <div key={idx} className="group">
                                                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2 flex justify-between">
                                                      <span>Target {idx + 1}</span>
                                                      <span className="text-[10px] text-slate-300 font-normal group-focus-within:text-indigo-500 transition-colors">SMART Goal</span>
                                                  </label>
                                                  <div className="relative">
                                                      <div className="absolute left-3 top-3.5 text-slate-300 group-focus-within:text-indigo-500 transition-colors">
                                                          <Target size={18} />
                                                      </div>
                                                      <input 
                                                          type="text"
                                                          className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none text-sm text-slate-700 transition-all shadow-sm group-focus-within:shadow-md"
                                                          placeholder={`Contoh: Saya akan menyisipkan 1 aktivitas numerasi di RPP Bab ${idx + 1}...`}
                                                          value={target}
                                                          onChange={(e) => {
                                                              const newTargets = [...personalTargets];
                                                              newTargets[idx] = e.target.value;
                                                              setPersonalTargets(newTargets);
                                                          }}
                                                      />
                                                  </div>
                                              </div>
                                          ))}

                                          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
                                              <Lightbulb className="text-blue-600 shrink-0 mt-0.5" size={20} />
                                              <div>
                                                  <h4 className="text-sm font-bold text-blue-800 mb-1">Bingung menentukan target?</h4>
                                                  <p className="text-xs text-blue-700 mb-3">
                                                      Gunakan asisten AI untuk memberikan rekomendasi target yang spesifik dan realistis sesuai konteks kelas Anda.
                                                  </p>
                                                  <button 
                                                      onClick={handleGenerateTargets}
                                                      disabled={isGeneratingTargets}
                                                      className="bg-white text-blue-600 px-4 py-2 rounded-lg text-xs font-bold border border-blue-200 hover:bg-blue-100 transition-colors flex items-center gap-2 shadow-sm"
                                                  >
                                                      {isGeneratingTargets ? <RefreshCw className="animate-spin" size={14} /> : <Sparkles size={14} />}
                                                      {isGeneratingTargets ? 'Merumuskan Saran...' : 'Bantu Saya Merumuskan'}
                                                  </button>
                                              </div>
                                          </div>
                                      </div>

                                      <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end">
                                          <button 
                                              onClick={() => {
                                                  if (personalTargets.some(t => t.trim().length < 10)) {
                                                      alert("Mohon lengkapi ketiga target dengan deskripsi yang jelas (minimal 10 karakter).");
                                                      return;
                                                  }
                                                  handleMarkComplete();
                                                  alert("Target pengembangan diri berhasil disimpan!");
                                              }}
                                              className="bg-[#F34B1E] text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-orange-700 transition-all flex items-center gap-2"
                                          >
                                              <CheckCircle size={20} /> Simpan Target & Selesai
                                          </button>
                                      </div>
                                  </div>
                              </div>
                           </div>
                        ) : EMBED_URLS[activeActivity.id] ? (
                           <div className="w-full h-full bg-white flex flex-col absolute inset-0">
                              <iframe
                                src={EMBED_URLS[activeActivity.id]}
                                width="100%"
                                height="100%"
                                className="border-0 w-full h-full"
                                allow="autoplay"
                                title="Materi PDF"
                              ></iframe>
                           </div>
                        ) : activeActivity.type === 'QUIZ' && activeActivity.quizData ? (
                           // --- INTERACTIVE QUIZ RENDERER ---
                           <div className="absolute inset-0 bg-white flex flex-col">
                              
                              {/* QUIZ INTRO */}
                              {quizState === 'INTRO' && (
                                 <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-purple-50 to-white">
                                    <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
                                       <Award size={48} className="text-purple-600" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-800 mb-2">Evaluasi Formatif</h3>
                                    <p className="text-slate-500 mb-8 max-w-md">
                                       Kuis ini terdiri dari <strong>{activeActivity.quizData.length} soal</strong> pilihan ganda. 
                                       Waktu pengerjaan fleksibel. Passing Grade: <strong>70%</strong>.
                                    </p>
                                    <button 
                                       onClick={() => setQuizState('PLAYING')}
                                       className="bg-purple-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-purple-700 transition-transform active:scale-95 shadow-lg shadow-purple-200 flex items-center gap-2"
                                    >
                                       Mulai Kuis Sekarang <ArrowRight size={20} />
                                    </button>
                                 </div>
                              )}

                              {/* QUIZ PLAYING */}
                              {quizState === 'PLAYING' && (
                                 <div className="flex-1 flex flex-col h-full">
                                    {/* Progress Bar */}
                                    <div className="h-1.5 w-full bg-slate-100">
                                       <div 
                                          className="h-full bg-purple-600 transition-all duration-300" 
                                          style={{width: `${((currentQuizIndex + 1) / activeActivity.quizData.length) * 100}%`}}
                                       ></div>
                                    </div>
                                    
                                    <div className="flex-1 overflow-y-auto p-6 md:p-10 flex flex-col max-w-4xl mx-auto w-full">
                                       <div className="mb-6 flex justify-between items-center text-sm text-slate-400 font-bold uppercase tracking-wider">
                                          <span>Soal {currentQuizIndex + 1} dari {activeActivity.quizData.length}</span>
                                          <span>Numerasi SMILE</span>
                                       </div>
                                       
                                       <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-8 leading-relaxed">
                                          {activeActivity.quizData[currentQuizIndex].question}
                                       </h3>

                                       <div className="space-y-3">
                                          {activeActivity.quizData[currentQuizIndex].options.map((opt, idx) => {
                                             const isSelected = userAnswers[currentQuizIndex] === idx.toString();
                                             return (
                                                <button 
                                                   key={idx}
                                                   onClick={() => handleQuizAnswer(idx)}
                                                   className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-4 ${
                                                      isSelected 
                                                      ? 'border-purple-500 bg-purple-50 text-purple-900 shadow-sm' 
                                                      : 'border-slate-100 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                                                   }`}
                                                >
                                                   <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs ${
                                                      isSelected ? 'bg-purple-500 border-purple-500 text-white' : 'border-slate-300 text-slate-400'
                                                   }`}>
                                                      {String.fromCharCode(65 + idx)}
                                                   </div>
                                                   <span className="text-base">{opt}</span>
                                                </button>
                                             );
                                          })}
                                       </div>
                                    </div>

                                    {/* Footer Nav */}
                                    <div className="p-4 border-t border-slate-100 bg-white flex justify-between items-center">
                                       <button 
                                          onClick={() => setCurrentQuizIndex(prev => Math.max(0, prev - 1))}
                                          disabled={currentQuizIndex === 0}
                                          className="text-slate-400 font-bold text-sm px-4 py-2 hover:bg-slate-50 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent"
                                       >
                                          Kembali
                                       </button>
                                       
                                       {currentQuizIndex < activeActivity.quizData.length - 1 ? (
                                          <button 
                                             onClick={() => setCurrentQuizIndex(prev => prev + 1)}
                                             className="bg-slate-800 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-slate-900"
                                          >
                                             Selanjutnya
                                          </button>
                                       ) : (
                                          <button 
                                             onClick={submitQuiz}
                                             disabled={Object.keys(userAnswers).length < activeActivity.quizData.length}
                                             className="bg-purple-600 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-200"
                                          >
                                             Selesai & Lihat Hasil
                                          </button>
                                       )}
                                    </div>
                                 </div>
                              )}

                              {/* QUIZ RESULT */}
                              {quizState === 'RESULT' && (
                                 <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
                                    <div className="bg-white border-b border-slate-200 p-6 text-center shadow-sm z-10">
                                       <div className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Hasil Evaluasi</div>
                                       <div className="text-5xl font-black text-slate-800 mb-2">{quizScore}</div>
                                       <div className={`inline-block px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide mb-4 ${
                                          quizScore >= 70 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                       }`}>
                                          {quizScore >= 70 ? 'Lulus - Kompeten' : 'Belum Lulus - Perlu Belajar Ulang'}
                                       </div>
                                       <p className="text-slate-500 text-sm max-w-md mx-auto">
                                          {quizScore >= 70 
                                             ? "Selamat! Anda telah memahami konsep dasar Readiness Numeracy dengan baik." 
                                             : "Jangan khawatir, silakan pelajari kembali materi dan coba lagi."}
                                       </p>
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto w-full space-y-6">
                                       <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                                          <List size={20} /> Pembahasan Jawaban
                                       </h4>
                                       
                                       {activeActivity.quizData.map((item, idx) => {
                                          const userAns = userAnswers[idx];
                                          const isCorrect = userAns === item.correctAnswer;
                                          
                                          return (
                                             <div key={idx} className={`bg-white p-5 rounded-xl border ${isCorrect ? 'border-green-200' : 'border-red-200'} shadow-sm`}>
                                                <div className="flex gap-3 mb-3">
                                                   <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs text-white ${isCorrect ? 'bg-green-500' : 'bg-red-500'}`}>
                                                      {idx + 1}
                                                   </div>
                                                   <h5 className="font-bold text-slate-800 text-sm leading-snug">{item.question}</h5>
                                                </div>
                                                
                                                <div className="ml-9 space-y-2 mb-4">
                                                   {item.options.map((opt, optIdx) => {
                                                      const isKey = optIdx.toString() === item.correctAnswer;
                                                      const isSelected = optIdx.toString() === userAns;
                                                      let itemClass = "text-sm p-2 rounded border border-transparent";
                                                      
                                                      if (isKey) itemClass = "bg-green-50 border-green-200 text-green-800 font-medium";
                                                      else if (isSelected && !isCorrect) itemClass = "bg-red-50 border-red-200 text-red-800 line-through opacity-70";
                                                      else itemClass = "text-slate-500";

                                                      return (
                                                         <div key={optIdx} className={itemClass}>
                                                            <span className="font-bold mr-2">{String.fromCharCode(65 + optIdx)}.</span> {opt}
                                                            {isKey && <CheckCircle size={14} className="inline ml-2 text-green-600"/>}
                                                            {isSelected && !isCorrect && <X size={14} className="inline ml-2 text-red-500"/>}
                                                         </div>
                                                      )
                                                   })}
                                                </div>

                                                <div className="ml-9 bg-slate-50 p-3 rounded-lg text-xs text-slate-600 border border-slate-100">
                                                   <span className="font-bold text-slate-800 block mb-1">Pembahasan:</span>
                                                   {item.explanation}
                                                </div>
                                             </div>
                                          )
                                       })}
                                    </div>

                                    <div className="p-4 bg-white border-t border-slate-200 text-center">
                                       <button 
                                          onClick={() => {
                                             setQuizState('INTRO');
                                             setUserAnswers({});
                                             setQuizScore(0);
                                             setCurrentQuizIndex(0);
                                          }}
                                          className="text-slate-600 font-bold text-sm flex items-center justify-center gap-2 hover:text-purple-600 transition-colors"
                                       >
                                          <RefreshCw size={16} /> Ulangi Kuis
                                       </button>
                                    </div>
                                 </div>
                              )}
                           </div>
                        ) : (
                           // STANDARD RENDERER
                           activeActivity.type === 'VIDEO' ? (
                              activeActivity.videoUrl ? (
                                isVideoPlaying ? (
                                  <iframe 
                                    key={activeActivity.id}
                                    width="100%" 
                                    height="100%" 
                                    src={`https://www.youtube.com/embed/${getYouTubeId(activeActivity.videoUrl)}?autoplay=1&rel=0`} 
                                    title={activeActivity.title}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                                    referrerPolicy="strict-origin-when-cross-origin"
                                    allowFullScreen
                                    className="absolute inset-0 w-full h-full rounded-xl border-0"
                                  ></iframe>
                                ) : (
                                  <>
                                    <div 
                                       className="absolute inset-0 bg-cover bg-center"
                                       style={{ backgroundImage: `url(https://img.youtube.com/vi/${getYouTubeId(activeActivity.videoUrl || '')}/hqdefault.jpg)` }}
                                    ></div>
                                    <div className="absolute inset-0 bg-black/40 hover:bg-black/30 transition-all cursor-pointer flex items-center justify-center" onClick={() => setIsVideoPlaying(true)}>
                                       <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform">
                                          <PlayCircle size={48} className="text-white fill-white" />
                                       </div>
                                    </div>
                                  </>
                                )
                              ) : (
                                <div className="text-center text-slate-400 p-4">Video belum tersedia</div>
                              )
                           ) : activeActivity.type === 'QUIZ' ? (
                              <div className="bg-white absolute inset-0 flex flex-col items-center justify-center text-slate-800 p-8 text-center">
                                 <Award size={48} className="text-purple-500 mb-4" />
                                 <h3 className="font-bold text-xl mb-2">Kuis Belum Tersedia</h3>
                                 <p className="text-slate-500 mb-6">Konten kuis untuk materi ini belum diunggah.</p>
                              </div>
                           ) : activeActivity.type === 'MEETING' ? (
                              <div className="bg-white absolute inset-0 flex flex-col items-center justify-center text-slate-800 p-8 text-center">
                                 <Users size={48} className="text-pink-500 mb-4" />
                                 <h3 className="font-bold text-xl mb-2">Virtual Meeting (Zoom/GMeet)</h3>
                                 <p className="text-slate-500 mb-6">Silakan bergabung pada sesi tatap maya sesuai jadwal.</p>
                                 <button className="bg-pink-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-pink-700">Join Meeting</button>
                              </div>
                           ) : (
                              <div className="bg-white absolute inset-0 flex flex-col items-center justify-center text-slate-800 p-8 text-center border-2 border-dashed border-slate-200 m-4 rounded-xl">
                                 <FileText size={48} className="text-blue-500 mb-4" />
                                 <h3 className="font-bold text-xl mb-2">Materi Dokumen / Aktivitas</h3>
                                 {activeActivity.fileUrl ? (
                                   <a href={activeActivity.fileUrl} target="_blank" rel="noreferrer" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700">
                                       Unduh PDF / File
                                   </a>
                                 ) : (
                                   <p className="text-slate-500">Materi ini berupa teks bacaan atau instruksi di atas.</p>
                                 )}
                              </div>
                           )
                        )}
                    </div>

                    {/* --- FEEDBACK SECTION --- */}
                    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-sm font-bold text-[#112967] flex items-center gap-2">
                                <MessageSquarePlus size={18} className="text-[#F34B1E]" /> 
                                Penilaian & Umpan Balik Materi
                            </h4>
                            {currentFeedback.isSubmitted && (
                                <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold flex items-center gap-1">
                                    <CheckCircle size={12} /> Terkirim
                                </span>
                            )}
                        </div>

                        {!currentFeedback.isSubmitted ? (
                            <div className="flex flex-col gap-4">
                                {/* Rating Buttons */}
                                <div className="flex gap-4">
                                    <button 
                                        onClick={() => handleRating('LIKE')}
                                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border transition-all ${
                                            currentFeedback.rating === 'LIKE' 
                                            ? 'bg-green-50 border-green-200 text-green-700 ring-1 ring-green-300' 
                                            : 'bg-white border-slate-200 text-slate-500 hover:bg-green-50 hover:text-green-600'
                                        }`}
                                    >
                                        <ThumbsUp size={20} />
                                        <span className="text-xs font-bold">Suka</span>
                                    </button>
                                    <button 
                                        onClick={() => handleRating('NEUTRAL')}
                                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border transition-all ${
                                            currentFeedback.rating === 'NEUTRAL' 
                                            ? 'bg-slate-100 border-slate-300 text-slate-700 ring-1 ring-slate-300' 
                                            : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                                        }`}
                                    >
                                        <Minus size={20} />
                                        <span className="text-xs font-bold">Biasa</span>
                                    </button>
                                    <button 
                                        onClick={() => handleRating('DISLIKE')}
                                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border transition-all ${
                                            currentFeedback.rating === 'DISLIKE' 
                                            ? 'bg-red-50 border-red-200 text-red-700 ring-1 ring-red-300' 
                                            : 'bg-white border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-600'
                                        }`}
                                    >
                                        <ThumbsDown size={20} />
                                        <span className="text-xs font-bold">Kurang</span>
                                    </button>
                                </div>

                                {/* Comment Field */}
                                <div>
                                    <label className="text-xs font-bold text-slate-500 mb-2 block uppercase tracking-wider">
                                        Masukan untuk Perbaikan Materi Ini:
                                    </label>
                                    <textarea 
                                        value={currentFeedback.comment}
                                        onChange={(e) => handleCommentChange(e.target.value)}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#112967] outline-none min-h-[80px]"
                                        placeholder="Contoh: Penjelasan di menit ke-2 membingungkan, mohon diperjelas..."
                                    />
                                </div>
                                
                                <div className="flex justify-end">
                                    <button 
                                        onClick={handleSubmitFeedback}
                                        disabled={!currentFeedback.rating}
                                        className="bg-[#112967] text-white px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Send size={16} /> Kirim Masukan
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-slate-50 rounded-lg p-4 text-center border border-slate-100">
                                <p className="text-slate-600 text-sm font-medium mb-1">Terima kasih atas masukan Anda!</p>
                                <p className="text-xs text-slate-400">Tim pengembang akan meninjau feedback Anda untuk perbaikan materi.</p>
                                <button 
                                    onClick={() => setFeedbackMap(prev => ({...prev, [activeActivityId]: {...currentFeedback, isSubmitted: false}}))}
                                    className="text-xs text-blue-600 underline mt-2 hover:text-blue-800"
                                >
                                    Edit Masukan
                                </button>
                            </div>
                        )}
                    </div>
                 </div>

                 {/* Content Footer / Navigation */}
                 <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between gap-4 mt-auto">
                    <button 
                      onClick={handlePrev}
                      disabled={currentIndex === 0}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                    >
                       <ChevronLeft size={18} /> Sebelumnya
                    </button>

                    {!completedActivities.includes(activeActivityId) ? (
                        <button 
                          onClick={handleMarkComplete}
                          className="flex items-center gap-2 bg-[#112967] text-white px-6 py-2.5 rounded-lg hover:bg-blue-900 transition-all font-bold shadow-md hover:shadow-lg active:scale-95"
                        >
                           <CheckCircle size={18} /> Tandai Selesai
                        </button>
                    ) : (
                        <div className="flex items-center gap-2 text-green-600 font-bold px-6 py-2">
                           <CheckCircle size={18} /> Materi Selesai
                        </div>
                    )}

                    <button 
                      onClick={handleNext}
                      disabled={currentIndex === allActivities.length - 1}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                    >
                       Selanjutnya <ChevronRight size={18} />
                    </button>
                 </div>
              </div>
           </div>
        </main>
      </div>
    </div>
  );
};

// Icons component placeholders if they are not imported from lucide-react directly in the prompt context
// Assuming PanelLeftClose and PanelLeftOpen are not standard in the previous imports or might need alias
const PanelLeftClose = ({ size }: { size: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><path d="M9 3v18"/><path d="m16 15-3-3 3-3"/></svg>
);
const PanelLeftOpen = ({ size }: { size: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><path d="M9 3v18"/><path d="m14 9 3 3-3 3"/></svg>
);

export default SmileProgram;
