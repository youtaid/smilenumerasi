
import React, { useState } from 'react';
import { TeacherProfile, UserRole, LoadingState, TeacherPersonaResult } from '../types';
import { analyzeTeacherPersona } from '../services/geminiService';
import { ArrowRight, Check, School, BookOpen, BrainCircuit, Sparkles, Loader2, Target } from 'lucide-react';

interface OnboardingProps {
  initialName: string;
  role: UserRole;
  onComplete: (profile: TeacherProfile) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ initialName, role, onComplete }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(LoadingState.IDLE);
  
  // Step 1: Basic Data
  const [school, setSchool] = useState('');
  const [subject, setSubject] = useState('');
  const [experience, setExperience] = useState('1-5 tahun');
  const [curriculum, setCurriculum] = useState('Kurikulum Merdeka');

  // Step 2: Persona Assessment Data
  const [techComfort, setTechComfort] = useState(5);
  const [teachingStyle, setTeachingStyle] = useState('Campuran (Ceramah & Diskusi)');
  const [challenges, setChallenges] = useState('');
  
  // Result
  const [personaResult, setPersonaResult] = useState<TeacherPersonaResult | null>(null);

  const handlePersonaAnalysis = async () => {
    if (!challenges) return;
    setLoading(LoadingState.LOADING);
    try {
      const result = await analyzeTeacherPersona(experience, subject, techComfort, challenges);
      setPersonaResult(result);
      setLoading(LoadingState.SUCCESS);
      setStep(3); // Move to result step
    } catch (e) {
      console.error(e);
      setLoading(LoadingState.ERROR);
      // Fallback for demo without API Key
      const mockResult: TeacherPersonaResult = {
        persona_result: "Adaptive Navigator",
        confidence_score: "0.85",
        ui_recommendation: "Standard_Mode",
        reasoning: "Berdasarkan input, Anda memiliki semangat belajar tinggi namun butuh panduan terstruktur."
      };
      setPersonaResult(mockResult);
      setStep(3);
    }
  };

  const handleFinish = () => {
    if (!personaResult) return;
    
    const newProfile: TeacherProfile = {
      id: Date.now().toString(),
      name: initialName,
      school,
      subject,
      experienceYears: experience,
      curriculum,
      persona: personaResult,
      xpPoints: 0,
      level: '1',
      badges: []
    };
    onComplete(newProfile);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        
        {/* Header Progress */}
        <div className="bg-white p-8 border-b border-gray-100">
          <div className="flex items-center justify-between mb-6">
             <h1 className="text-2xl font-bold text-gray-900">Setup Profil {role}</h1>
             <div className="text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
               Langkah {step} dari 3
             </div>
          </div>
          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
             <div 
               className="h-full bg-indigo-600 transition-all duration-500"
               style={{ width: `${(step / 3) * 100}%` }}
             ></div>
          </div>
        </div>

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="p-8 animate-fade-in">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <School size={24} className="text-indigo-600" /> Data Sekolah & Mapel
            </h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Asal Sekolah</label>
                <input 
                  className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Nama Sekolah Anda"
                  value={school}
                  onChange={e => setSchool(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Mata Pelajaran</label>
                  <input 
                    className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Contoh: Matematika"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Lama Mengajar</label>
                  <select 
                    className="w-full p-3 rounded-xl border border-gray-300 bg-white"
                    value={experience}
                    onChange={e => setExperience(e.target.value)}
                  >
                    <option>Kurang dari 1 tahun</option>
                    <option>1-5 tahun</option>
                    <option>5-15 tahun</option>
                    <option>Lebih dari 15 tahun</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Kurikulum Utama</label>
                <select 
                  className="w-full p-3 rounded-xl border border-gray-300 bg-white"
                  value={curriculum}
                  onChange={e => setCurriculum(e.target.value)}
                >
                  <option>Kurikulum Merdeka</option>
                  <option>Kurikulum 2013 (K-13)</option>
                  <option>Kurikulum Cambridge / IB</option>
                  <option>Lainnya</option>
                </select>
              </div>
            </div>
            <div className="mt-8 flex justify-end">
              <button 
                onClick={() => setStep(2)}
                disabled={!school || !subject}
                className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                Lanjut <ArrowRight size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Assessment */}
        {step === 2 && (
          <div className="p-8 animate-fade-in">
            <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
              <BrainCircuit size={24} className="text-purple-600" /> Pemetaan Persona
            </h2>
            <p className="text-gray-500 text-sm mb-6">Bantu AI mengenali gaya mengajar Anda untuk rekomendasi yang akurat.</p>
            
            <div className="space-y-6">
               <div>
                 <label className="block text-sm font-semibold text-gray-700 mb-2">Seberapa nyaman Anda menggunakan teknologi? (1-10)</label>
                 <div className="flex items-center gap-4">
                   <input 
                     type="range" min="1" max="10" 
                     className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                     value={techComfort}
                     onChange={e => setTechComfort(parseInt(e.target.value))}
                   />
                   <span className="font-bold text-purple-600 text-lg w-8">{techComfort}</span>
                 </div>
               </div>

               <div>
                 <label className="block text-sm font-semibold text-gray-700 mb-2">Tantangan terbesar Anda saat ini?</label>
                 <textarea 
                   className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 outline-none h-24 resize-none text-sm"
                   placeholder="Ceritakan kendala Anda, misal: 'Saya sulit membuat siswa aktif saat pelajaran numerasi' atau 'Saya bingung asesmen diferensiasi'."
                   value={challenges}
                   onChange={e => setChallenges(e.target.value)}
                 />
               </div>

               <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3 items-start">
                  <Sparkles size={20} className="text-blue-600 mt-1 shrink-0" />
                  <p className="text-xs text-blue-700">
                    Sistem akan menggunakan data ini untuk menentukan 1 dari 5 Persona Guru (Adaptive Navigator, Seasoned Mentor, Numeracy Curious, Empathic Connector, atau Digital Transitioning).
                  </p>
               </div>
            </div>

            <div className="mt-8 flex justify-between">
              <button 
                onClick={() => setStep(1)}
                className="text-gray-500 font-bold hover:text-gray-800"
              >
                Kembali
              </button>
              <button 
                onClick={handlePersonaAnalysis}
                disabled={!challenges || loading === LoadingState.LOADING}
                className="bg-purple-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {loading === LoadingState.LOADING ? <Loader2 className="animate-spin" /> : <BrainCircuit size={20} />}
                Analisis Persona Saya
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Result & Welcome */}
        {step === 3 && personaResult && (
          <div className="p-8 text-center animate-fade-in">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
               <Target size={40} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Profil Siap!</h2>
            <p className="text-gray-600 mb-6">Selamat datang di SMILE Platform, <b>{initialName}</b>.</p>

            <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-2xl border border-indigo-100 shadow-sm mb-8 text-left">
               <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Persona Numerasi Anda</div>
               <h3 className="text-3xl font-black text-indigo-700 mb-2">{personaResult.persona_result}</h3>
               <p className="text-gray-700 italic mb-4">"{personaResult.reasoning}"</p>
               <div className="flex flex-wrap gap-2">
                 <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold">Rekomendasi UI: {personaResult.ui_recommendation}</span>
                 <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">Akurasi AI: {parseInt(String(parseFloat(personaResult.confidence_score)*100))}%</span>
               </div>
            </div>

            <button 
              onClick={handleFinish}
              className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
            >
              Masuk Dashboard <ArrowRight size={20} />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default Onboarding;
