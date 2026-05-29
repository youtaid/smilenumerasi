
import React from 'react';
import { ClipboardCheck, TrendingUp, BookOpen, AlertCircle } from 'lucide-react';
import { GamificationAction } from '../types';

interface AssessmentCenterProps {
    onAwardXP?: (action: GamificationAction) => void;
}

const AssessmentCenter: React.FC<AssessmentCenterProps> = ({ onAwardXP }) => {
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-10">
      <div className="bg-teal-700 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Pusat Asesmen</h1>
          <p className="text-teal-100 max-w-xl">
            Pantau perkembangan kompetensi Anda melalui Pre/Post Test, Skala Sikap, dan Penilaian Kinerja berbasis Rubrik SMILE.
          </p>
        </div>
        <ClipboardCheck className="absolute right-0 bottom-0 text-white opacity-10 transform translate-x-4 translate-y-4" size={180} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Pre/Post Test Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
           <div className="flex justify-between items-start mb-4">
             <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
               <TrendingUp size={24} />
             </div>
             <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">Pre-Test Selesai</span>
           </div>
           <h3 className="font-bold text-lg text-gray-900 mb-2">Tes Pengetahuan Numerasi</h3>
           <p className="text-sm text-gray-500 mb-6">Mengukur pemahaman konten numerasi lintas kurikulum.</p>
           
           <div className="space-y-4">
             <div>
               <div className="flex justify-between text-sm mb-1">
                 <span className="text-gray-600">Skor Pre-Test</span>
                 <span className="font-bold text-gray-900">65/100</span>
               </div>
               <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                 <div className="bg-blue-500 w-[65%] h-full rounded-full"></div>
               </div>
             </div>
             <div>
               <div className="flex justify-between text-sm mb-1">
                 <span className="text-gray-600">Target Post-Test</span>
                 <span className="font-bold text-gray-400">-/100</span>
               </div>
               <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                 <div className="bg-gray-300 w-0 h-full rounded-full"></div>
               </div>
             </div>
           </div>
           
           <button disabled className="mt-6 w-full py-2 bg-gray-100 text-gray-400 font-bold rounded-lg cursor-not-allowed">
             Post-Test Belum Dibuka
           </button>
        </div>

        {/* Attitude Scale Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
           <div className="flex justify-between items-start mb-4">
             <div className="bg-purple-100 p-3 rounded-xl text-purple-600">
               <BookOpen size={24} />
             </div>
             <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-1 rounded">Perlu Update</span>
           </div>
           <h3 className="font-bold text-lg text-gray-900 mb-2">Skala Sikap (Mindset)</h3>
           <p className="text-sm text-gray-500 mb-6">Refleksi diri terhadap keyakinan dan kenyamanan mengajar numerasi.</p>
           
           <div className="bg-purple-50 p-4 rounded-xl mb-6 border border-purple-100">
             <div className="text-sm font-bold text-purple-800 mb-1">Status Terakhir: "Growth Mindset"</div>
             <p className="text-xs text-purple-600">Anda percaya bahwa kemampuan matematika siswa bisa berkembang dengan usaha.</p>
           </div>
           
           <button 
             onClick={() => {
                 if(window.confirm('Simulasi: Apakah Anda sudah mengisi survei?')) {
                     if(onAwardXP) onAwardXP(GamificationAction.ASSESSMENT_COMPLETE);
                 }
             }}
             className="w-full py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors"
           >
             Isi Survei Sikap Akhir
           </button>
        </div>

        {/* Rubric Assessment Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
           <div className="flex justify-between items-start mb-4">
             <div className="bg-orange-100 p-3 rounded-xl text-orange-600">
               <ClipboardCheck size={24} />
             </div>
           </div>
           <h3 className="font-bold text-lg text-gray-900 mb-2">Penilaian Produk (Rubrik)</h3>
           <p className="text-sm text-gray-500 mb-6">Upload RPP dan video praktik untuk dinilai oleh Fasilitator.</p>
           
           <div className="space-y-3">
             <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
               <span className="text-sm text-gray-700">1. Draft Modul Ajar</span>
               <span className="text-xs font-bold text-green-600">Dinilai (88/100)</span>
             </div>
             <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
               <span className="text-sm text-gray-700">2. Video Praktik</span>
               <span className="text-xs font-bold text-orange-500">Menunggu Review</span>
             </div>
             <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg bg-gray-50">
               <span className="text-sm text-gray-400">3. Laporan Refleksi</span>
               <span className="text-xs font-bold text-gray-400">Terkunci</span>
             </div>
           </div>
           
           <div className="mt-6 flex items-start gap-2 text-xs text-gray-500 bg-gray-50 p-2 rounded">
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              Pastikan produk diunggah sebelum tenggat waktu IN-2.
           </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentCenter;
