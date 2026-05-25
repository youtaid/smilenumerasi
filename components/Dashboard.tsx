
import React, { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { 
  Sparkles, TrendingUp, Activity, ArrowRight, BookOpen, AlertCircle, 
  Target, Award, Zap, ChevronRight, Lock, Compass
} from 'lucide-react';
import { getPersonalizedRecommendations } from '../services/geminiService';
import { getNextBestAction, INITIAL_MASTERY_PROFILE } from '../services/masteryService';
import { MasteryProfile, NextBestAction, MasteryLevel, AppView } from '../types';
import MarkdownRenderer from './MarkdownRenderer';

interface DashboardProps {
  onNavigate?: (view: AppView) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [recommendations, setRecommendations] = useState<string>('');
  const [isLoadingRecs, setIsLoadingRecs] = useState(true);
  const [profile, setProfile] = useState<MasteryProfile>(INITIAL_MASTERY_PROFILE);
  const [nba, setNba] = useState<NextBestAction | null>(null);

  useEffect(() => {
    // Initialize Logic
    const action = getNextBestAction(profile);
    setNba(action);

    // AI Recs
    const fetchRecs = async () => {
      try {
        const recs = await getPersonalizedRecommendations(
          `User Level: ${profile.level}. NBA: ${action.title}. Gap: Cluster C score ${profile.clusterScores.C}.`
        );
        setRecommendations(recs);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoadingRecs(false);
      }
    };
    fetchRecs();
  }, [profile]);

  // Data for Heatmap Chart (Cluster A-D)
  const clusterData = [
    { name: 'A. Literasi', score: profile.clusterScores.A, full: 100, color: '#3b82f6' },
    { name: 'B. Pedagogi', score: profile.clusterScores.B, full: 100, color: '#8b5cf6' },
    { name: 'C. Asesmen', score: profile.clusterScores.C, full: 100, color: '#f97316' }, // Orange for High Weight
    { name: 'D. Pengembangan', score: profile.clusterScores.D, full: 100, color: '#10b981' },
  ];

  const getLevelColor = (level: MasteryLevel) => {
      switch(level) {
          case MasteryLevel.EXPLORER: return 'bg-blue-100 text-blue-800 border-blue-200';
          case MasteryLevel.INTEGRATOR: return 'bg-purple-100 text-purple-800 border-purple-200';
          case MasteryLevel.DESIGNER: return 'bg-orange-100 text-orange-800 border-orange-200';
          case MasteryLevel.FACILITATOR: return 'bg-pink-100 text-pink-800 border-pink-200';
          case MasteryLevel.MENTOR: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
          default: return 'bg-gray-100';
      }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-bold text-[#112967]">Cockpit Mastery</h1>
          <p className="text-slate-500 mt-2 flex items-center gap-2">
             <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getLevelColor(profile.level)}`}>
                {profile.level}
             </span>
             <span>• Menuju Level Berikutnya: Integrator</span>
          </p>
        </div>
        
        {/* Overall Score Badge */}
        <div className="flex items-center gap-4 bg-white p-2 pr-6 rounded-full shadow-sm border border-slate-200">
            <div className="w-12 h-12 rounded-full bg-[#112967] flex items-center justify-center text-white font-black text-lg relative">
                {profile.overallScore}
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path
                        className="text-[#112967]"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeDasharray={`${profile.overallScore}, 100`}
                    />
                </svg>
            </div>
            <div>
                <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Overall Mastery</div>
                <div className="text-sm font-bold text-[#112967]">Performa Cukup</div>
            </div>
        </div>
      </header>

      {/* QUICK GUIDE SECTION */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="flex items-center gap-2 mb-4">
           <div className="p-2 bg-indigo-50 rounded-lg">
              <Compass size={20} className="text-[#F34B1E]" />
           </div>
           <div>
              <h3 className="font-bold text-[#112967]">Panduan Kilat SMILE</h3>
              <p className="text-xs text-slate-500">4 Langkah mudah menggunakan platform</p>
           </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
           <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-colors">
              <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">1</div>
              <div>
                 <div className="font-bold text-slate-800 text-xs mb-1">Mulai Pelatihan</div>
                 <p className="text-[10px] text-slate-500 leading-snug">Pelajari konsep dasar & mindset di menu <strong>Pelatihan SMILE</strong>.</p>
              </div>
           </div>
           
           <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-colors">
              <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">2</div>
              <div>
                 <div className="font-bold text-slate-800 text-xs mb-1">Cari Ide Inovasi</div>
                 <p className="text-[10px] text-slate-500 leading-snug">Gunakan <strong>Lab Design Thinking</strong> untuk memetakan masalah siswa.</p>
              </div>
           </div>

           <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-colors">
              <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">3</div>
              <div>
                 <div className="font-bold text-slate-800 text-xs mb-1">Buat Perangkat</div>
                 <p className="text-[10px] text-slate-500 leading-snug">Generate RPP & Soal otomatis di <strong>Studio Inovasi</strong>.</p>
              </div>
           </div>

           <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-colors">
              <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">4</div>
              <div>
                 <div className="font-bold text-slate-800 text-xs mb-1">Evaluasi & Naik Level</div>
                 <p className="text-[10px] text-slate-500 leading-snug">Cek progres di <strong>Pusat Asesmen</strong> & naikkan level kompetensi.</p>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 1. NEXT BEST ACTION (Priority Card) */}
        <div className="lg:col-span-2 bg-gradient-to-r from-[#112967] to-[#1e3a8a] rounded-2xl p-1 shadow-xl shadow-blue-900/10">
            <div className="bg-[#112967] rounded-xl p-6 h-full relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 p-8 opacity-10"><Target size={120} className="text-white" /></div>
                
                <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start md:items-center">
                    <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10 shrink-0">
                        <Zap size={32} className="text-[#F34B1E]" />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-[#F34B1E] text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider animate-pulse">
                                Rekomendasi Utama
                            </span>
                            <span className="text-blue-200 text-xs font-medium">Berdasarkan data kinerja Anda</span>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">{nba?.title}</h2>
                        <p className="text-blue-100 text-sm leading-relaxed mb-4 max-w-xl">
                            {nba?.description} <br/>
                            <span className="opacity-70 italic text-xs">Alasan: {nba?.reason}</span>
                        </p>
                        
                        <div className="flex gap-3">
                            <button
                              onClick={() => nba?.targetView && onNavigate && onNavigate(nba.targetView as AppView)}
                              className="bg-white text-[#112967] px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-50 transition-colors flex items-center gap-2 shadow-lg"
                            >
                                {nba?.actionLabel} <ArrowRight size={16} />
                            </button>
                            <button className="px-5 py-2.5 rounded-xl font-bold text-sm text-white hover:bg-white/10 transition-colors border border-white/20">
                                Abaikan
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* 2. CLUSTER HEATMAP (Radar/Bar Replacement) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-[#112967] flex items-center gap-2">
                    <Activity size={18} className="text-[#F34B1E]" /> Peta Kompetensi
                </h3>
            </div>
            
            <div className="flex-1">
                <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={clusterData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                        <XAxis type="number" hide domain={[0, 100]} />
                        <YAxis type="category" dataKey="name" width={100} tick={{fontSize: 10, fontWeight: 'bold', fill: '#64748b'}} />
                        <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                        <Bar dataKey="score" barSize={12} radius={[0, 4, 4, 0]}>
                            {clusterData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
                
                {/* Gap Warning */}
                {profile.clusterScores.C < 50 && (
                    <div className="mt-2 bg-orange-50 border border-orange-100 p-3 rounded-lg flex items-start gap-2">
                        <AlertCircle size={14} className="text-orange-600 mt-0.5" />
                        <div className="text-xs text-orange-800">
                            <strong>Perhatian:</strong> Cluster C (Asesmen) memiliki bobot 50%. Tingkatkan skor ini untuk menaikkan Overall Mastery.
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* 3. EVIDENCE PROGRESS & GATES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="font-bold text-[#112967] mb-6 flex items-center gap-2">
                  <Award size={20} className="text-yellow-500" /> Evidence Progress
              </h3>
              
              <div className="space-y-4">
                  {[
                      { type: 'Design Thinking (E1)', status: 'APPROVED', score: 86, date: '1 Feb 2024' },
                      { type: 'Modul Ajar (E2)', status: 'DRAFT', score: '-', date: 'Draft' },
                      { type: 'Soal Numerasi (E3)', status: 'LOCKED', score: '-', date: '-' },
                      { type: 'Implementasi (E4)', status: 'LOCKED', score: '-', date: '-' },
                  ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:border-slate-300 transition-colors group">
                          <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                  item.status === 'APPROVED' ? 'bg-green-100 text-green-600' :
                                  item.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-600' :
                                  'bg-slate-100 text-slate-400'
                              }`}>
                                  {item.status === 'LOCKED' ? <Lock size={18} /> : <BookOpen size={18} />}
                              </div>
                              <div>
                                  <h4 className={`font-bold text-sm ${item.status === 'LOCKED' ? 'text-slate-400' : 'text-slate-800'}`}>{item.type}</h4>
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                      item.status === 'APPROVED' ? 'bg-green-50 text-green-700' :
                                      item.status === 'DRAFT' ? 'bg-yellow-50 text-yellow-700' :
                                      'bg-slate-50 text-slate-400'
                                  }`}>
                                      {item.status}
                                  </span>
                              </div>
                          </div>
                          <div className="text-right">
                              <div className="text-xs text-slate-400 font-bold uppercase">Skor</div>
                              <div className={`font-bold ${item.status === 'APPROVED' ? 'text-green-600' : 'text-slate-300'}`}>{item.score}</div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="font-bold text-[#112967] mb-4">AI Insight</h3>
              {isLoadingRecs ? (
                <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-100 rounded w-full"></div>
                </div>
              ) : (
                <div className="text-sm text-slate-600 leading-relaxed bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                    <MarkdownRenderer content={recommendations} />
                </div>
              )}
          </div>
      </div>
    </div>
  );
};

export default Dashboard;
