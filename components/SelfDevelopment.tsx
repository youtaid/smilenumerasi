
import React, { useState } from 'react';
import { Lock, Star, Trophy, Target, BookOpen, CheckCircle, MapPin, Gamepad2, Award, UserCheck, Sparkles, Shield } from 'lucide-react';
import { LearningPathNode, Badge, TeacherPersonaResult, LoadingState, MasteryLevel, GamificationAction } from '../types';
import { analyzeTeacherPersona } from '../services/geminiService';

const MASTERY_GATES = [
  { 
      level: MasteryLevel.EXPLORER, 
      status: 'COMPLETED', 
      reqs: ['E1_DT Valid', 'Pretest Completed'],
      desc: 'Memahami konsep dasar dan empati siswa.'
  },
  { 
      level: MasteryLevel.INTEGRATOR, 
      status: 'IN_PROGRESS', 
      reqs: ['E2_RPP Score ≥ 50', 'E3_ITEMBANK Score ≥ 50'],
      desc: 'Mampu merancang RPP dan Soal terintegrasi numerasi.'
  },
  { 
      level: MasteryLevel.DESIGNER, 
      status: 'LOCKED', 
      reqs: ['Cluster C ≥ 75', 'E4_IMPLEMENT Valid'],
      desc: 'Mampu mengimplementasikan dan asesmen yang berdampak.'
  },
  { 
      level: MasteryLevel.FACILITATOR, 
      status: 'LOCKED', 
      reqs: ['Overall ≥ 85', '2x Peer Feedback Berkualitas'],
      desc: 'Menjadi penggerak bagi rekan sejawat.'
  },
  { 
      level: MasteryLevel.MENTOR, 
      status: 'LOCKED', 
      reqs: ['Overall ≥ 90', 'Best Practice Approved'],
      desc: 'Tingkat tertinggi profesionalisme guru numerasi.'
  }
];

interface SelfDevelopmentProps {
  onAwardXP?: (action: GamificationAction) => void;
}

const SelfDevelopment: React.FC<SelfDevelopmentProps> = ({ onAwardXP }) => {
  // Persona State
  const [personaForm, setPersonaForm] = useState({
    experience: '1-5 tahun',
    subject: 'Matematika',
    techComfort: 7,
    challenges: ''
  });
  const [personaResult, setPersonaResult] = useState<TeacherPersonaResult | null>(null);
  const [personaLoading, setPersonaLoading] = useState(LoadingState.IDLE);

  const handleAnalyzePersona = async () => {
    if (!personaForm.challenges) return;
    setPersonaLoading(LoadingState.LOADING);
    try {
      const result = await analyzeTeacherPersona(
        personaForm.experience,
        personaForm.subject,
        personaForm.techComfort,
        personaForm.challenges
      );
      setPersonaResult(result);
      setPersonaLoading(LoadingState.SUCCESS);
      if (onAwardXP) onAwardXP(GamificationAction.PERSONA_CHECK);
    } catch (e) {
      setPersonaLoading(LoadingState.ERROR);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="bg-indigo-900 rounded-3xl p-8 text-white relative overflow-hidden">
         <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2 text-indigo-300 font-bold uppercase tracking-wider text-xs">
                <Shield size={16} /> Professional Levels
              </div>
              <h1 className="text-3xl font-bold">Jalur Kompetensi Guru</h1>
              <p className="text-indigo-200 mt-2 max-w-xl">
                  Kenaikan level Anda ditentukan oleh kualitas bukti karya (evidence), bukan sekadar menyelesaikan materi.
              </p>
            </div>
            
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
              <div className="text-right">
                <div className="text-xs text-indigo-200 font-bold uppercase">Status</div>
                <div className="text-2xl font-black text-white">Explorer</div>
              </div>
              <div className="h-10 w-px bg-white/20"></div>
              <div className="text-right">
                <div className="text-xs text-indigo-200 font-bold uppercase">Target</div>
                <div className="text-2xl font-black text-yellow-400">Integrator</div>
              </div>
            </div>
         </div>
         
         <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content: Mastery Gates */}
        <div className="lg:col-span-2 space-y-8">
           
           <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 relative overflow-hidden">
             <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                 <Target className="text-[#F34B1E]" /> Peta Level & Syarat (Gates)
             </h3>
             
             <div className="relative space-y-0">
               {MASTERY_GATES.map((node, idx) => {
                 const isLast = idx === MASTERY_GATES.length - 1;
                 const isCurrent = node.status === 'IN_PROGRESS';
                 const isLocked = node.status === 'LOCKED';
                 const isCompleted = node.status === 'COMPLETED';

                 return (
                   <div key={node.level} className="flex gap-6 group">
                     {/* Timeline Line */}
                     <div className="flex flex-col items-center">
                       <div className={`w-14 h-14 rounded-2xl flex items-center justify-center z-10 transition-all duration-300 shadow-lg ${
                         isCompleted ? 'bg-green-500 text-white rotate-3 scale-95' :
                         isCurrent ? 'bg-indigo-600 text-white -rotate-3 scale-110 ring-4 ring-indigo-100' :
                         'bg-gray-100 border-2 border-gray-200 text-gray-300'
                       }`}>
                         {isCompleted ? <CheckCircle size={24} /> :
                          isLocked ? <Lock size={20} /> :
                          <Star size={24} className="animate-pulse" />}
                       </div>
                       {!isLast && (
                         <div className={`w-1 flex-1 my-2 rounded-full ${
                           isCompleted ? 'bg-green-200' : 'bg-gray-100'
                         }`} style={{minHeight: '100px'}}></div>
                       )}
                     </div>

                     {/* Content Card */}
                     <div className={`flex-1 pb-8 ${isLocked ? 'opacity-60 blur-[0.5px]' : ''}`}>
                       <div className={`p-6 rounded-2xl border transition-all duration-300 relative ${
                         isCurrent ? 'bg-white border-indigo-200 shadow-md transform translate-x-2' : 
                         'bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm'
                       }`}>
                         {isCurrent && (
                           <span className="absolute -top-3 -right-3 bg-[#F34B1E] text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm animate-bounce">
                             LEVEL SAAT INI
                           </span>
                         )}
                         <div className="flex justify-between items-start mb-3">
                           <h3 className="text-xl font-bold text-gray-900">{node.level}</h3>
                         </div>
                         <p className="text-gray-600 text-sm mb-4 leading-relaxed">{node.desc}</p>
                         
                         <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                             <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Syarat Kelulusan (Gate):</span>
                             <ul className="space-y-1">
                                 {node.reqs.map((req, rIdx) => (
                                     <li key={rIdx} className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                         {isCompleted ? <CheckCircle size={14} className="text-green-500" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-300" />}
                                         {req}
                                     </li>
                                 ))}
                             </ul>
                         </div>
                       </div>
                     </div>
                   </div>
                 );
               })}
             </div>
           </div>
        </div>

        {/* Gamification Sidebar */}
        <div className="space-y-6">
           {/* Persona Assessment Widget */}
           <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-2xl border border-indigo-100 shadow-sm">
             <div className="flex items-center gap-2 mb-4">
                <UserCheck size={24} className="text-indigo-600" />
                <h2 className="text-lg font-bold text-gray-800">Persona Mengajar</h2>
             </div>
             
             {!personaResult ? (
               <div className="space-y-4">
                   <p className="text-sm text-gray-600">Cek gaya mengajar Anda untuk mendapatkan rekomendasi Evidence yang cocok.</p>
                   <div>
                     <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Tantangan Utama</label>
                     <textarea 
                        className="w-full p-2.5 rounded-lg border border-gray-300 bg-white h-20 text-sm resize-none"
                        placeholder="Contoh: Saya kesulitan..."
                        value={personaForm.challenges}
                        onChange={e => setPersonaForm({...personaForm, challenges: e.target.value})}
                     />
                   </div>
                   <button 
                      onClick={handleAnalyzePersona}
                      disabled={!personaForm.challenges || personaLoading === LoadingState.LOADING}
                      className="w-full bg-indigo-600 text-white py-2 rounded-lg font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 text-sm"
                   >
                     {personaLoading === LoadingState.LOADING ? 'Menganalisis...' : 'Cek Persona'}
                   </button>
               </div>
             ) : (
               <div className="bg-white rounded-xl p-4 border border-indigo-100 shadow-inner animate-fade-in">
                    <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Hasil Analisis</div>
                    <h3 className="text-xl font-black text-indigo-700 mb-2">{personaResult.persona_result}</h3>
                    <p className="text-gray-700 italic text-xs mb-3">"{personaResult.reasoning}"</p>
                    <button 
                      onClick={() => setPersonaResult(null)}
                      className="text-xs text-indigo-600 underline"
                    >
                      Reset
                    </button>
               </div>
             )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default SelfDevelopment;
