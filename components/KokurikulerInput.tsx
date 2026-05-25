
import React from 'react';
import { KokurikulerFormData, DocumentType, SchoolType } from '../types';
import { THEMES_UMUM, THEMES_MADRASAH, ACTIVITY_CATEGORIES, FREQUENCIES, PAI_ELEMENTS } from '../constants';
import { Sparkles, FileText, Calendar, User, School, Target, ListChecks, MapPin, Clock, Box, Book } from 'lucide-react';

interface InputFormProps {
  formData: KokurikulerFormData;
  setFormData: React.Dispatch<React.SetStateAction<KokurikulerFormData>>;
  onSubmit: () => void;
  isLoading: boolean;
}

const KokurikulerInput: React.FC<InputFormProps> = ({ formData, setFormData, onSubmit, isLoading }) => {
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Logika khusus: Jika jenis sekolah berubah, reset tema
    if (name === 'schoolType') {
      setFormData(prev => ({ 
        ...prev, 
        schoolType: value as SchoolType,
        theme: '' // Reset theme saat ganti jenis sekolah
      }));
    } else if (name === 'documentType') {
      setFormData(prev => ({ 
        ...prev, 
        documentType: value as DocumentType
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const themeOptions = formData.schoolType === SchoolType.MADRASAH ? THEMES_MADRASAH : THEMES_UMUM;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 animate-fade-in">
      <div className="mb-6 pb-4 border-b border-slate-100">
        <h2 className="text-xl font-bold text-[#112967] flex items-center gap-2">
          <FileText className="text-[#F34B1E]" size={24} /> Data Dokumen
        </h2>
        <p className="text-slate-500 text-sm mt-1">Lengkapi informasi untuk men-generate dokumen administrasi profesional.</p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-6">
        
        {/* SECTION 1: IDENTITAS DASAR */}
        <div className="space-y-5">
           <h3 className="text-xs font-bold text-[#112967] uppercase tracking-widest flex items-center gap-2">
              <School size={16} className="text-[#F34B1E]" /> Identitas Sekolah
           </h3>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">Jenis Dokumen</label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 text-slate-400" size={16} />
                <select
                  name="documentType"
                  value={formData.documentType}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#112967] focus:border-[#112967] outline-none transition-all hover:bg-slate-100"
                >
                  <option value={DocumentType.PROGRAM}>Program Tahunan</option>
                  <option value={DocumentType.RENCANA}>Rencana Kegiatan (Proposal)</option>
                  <option value={DocumentType.LAPORAN}>Laporan Kegiatan</option>
                  <option value={DocumentType.EVALUASI}>Evaluasi Semester</option>
                  <option value={DocumentType.MONITORING}>Monitoring Mingguan</option>
                  <option value={DocumentType.KEGIATAN_WAJIB}>Kegiatan Wajib Sekolah (MPLS/Upacara)</option>
                  <option value={DocumentType.PARENTING}>Parenting / Kolaborasi Orang Tua</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">Jenis Satuan Pendidikan</label>
              <div className="relative">
                <School className="absolute left-3 top-3 text-slate-400" size={16} />
                <select
                  name="schoolType"
                  value={formData.schoolType}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#112967] focus:border-[#112967] outline-none transition-all hover:bg-slate-100"
                >
                  <option value={SchoolType.UMUM}>Sekolah Umum (TK/SD/SMP/SMA/SMK)</option>
                  <option value={SchoolType.MADRASAH}>Madrasah (RA/MI/MTs/MA) - KMA 1503</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">Nama Sekolah</label>
              <input
                type="text"
                name="schoolName"
                value={formData.schoolName}
                onChange={handleChange}
                placeholder="Contoh: SMA Negeri 1 Maju Jaya"
                className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#112967] outline-none hover:bg-slate-100 transition-colors"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">Tahun Ajaran</label>
              <input
                type="text"
                name="academicYear"
                value={formData.academicYear}
                onChange={handleChange}
                placeholder="2024/2025"
                className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#112967] outline-none hover:bg-slate-100 transition-colors"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
             <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">Kepala Sekolah</label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-slate-400" size={16} />
                <input
                  type="text"
                  name="headmaster"
                  value={formData.headmaster}
                  onChange={handleChange}
                  placeholder="Nama Lengkap & Gelar"
                  className="w-full pl-10 pr-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#112967] outline-none hover:bg-slate-100 transition-colors"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">Koordinator/Guru</label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-slate-400" size={16} />
                <input
                  type="text"
                  name="coordinator"
                  value={formData.coordinator}
                  onChange={handleChange}
                  placeholder="Nama Lengkap & Gelar"
                  className="w-full pl-10 pr-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#112967] outline-none hover:bg-slate-100 transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: DETAIL KEGIATAN */}
        <div className="space-y-5 pt-6 border-t border-slate-100">
           <h3 className="text-xs font-bold text-[#112967] uppercase tracking-widest flex items-center gap-2">
              <ListChecks size={16} className="text-[#F34B1E]" /> Detail Kegiatan
           </h3>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">Kategori</label>
                <select
                    name="activityCategory"
                    value={formData.activityCategory}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#112967] outline-none hover:bg-slate-100 transition-colors"
                  >
                    <option value="">-- Pilih Kategori --</option>
                    {ACTIVITY_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">Frekuensi</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 text-slate-400" size={16} />
                  <select
                      name="frequency"
                      value={formData.frequency}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#112967] outline-none hover:bg-slate-100 transition-colors"
                    >
                      <option value="">-- Pilih Frekuensi --</option>
                      {FREQUENCIES.map((f) => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                  </select>
                </div>
              </div>
           </div>

           {/* MADRASAH SPECIFIC: PAI ELEMENTS - Only show if Madrasah is selected */}
           {formData.schoolType === SchoolType.MADRASAH && (
             <div className="bg-green-50 p-4 rounded-xl border border-green-100 space-y-2 animate-fade-in">
                <label className="block text-xs font-bold text-green-800 uppercase tracking-wide flex items-center gap-2">
                  <Book size={14} /> Integrasi Elemen PAI (KMA 1503)
                </label>
                <select
                    name="paiElement"
                    value={formData.paiElement}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-sm bg-white border border-green-200 text-green-800 rounded-xl focus:ring-2 focus:ring-green-500 outline-none hover:bg-green-50 transition-colors"
                  >
                    <option value="">-- Pilih Elemen Mapel PAI --</option>
                    {PAI_ELEMENTS.map((e) => (
                      <option key={e} value={e}>{e}</option>
                    ))}
                </select>
                <p className="text-[10px] text-green-600">
                  *Pilih elemen mapel PAI yang akan dikuatkan dalam kegiatan kokurikuler/P5RA ini.
                </p>
             </div>
           )}

           <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">
                  Tema {formData.schoolType === SchoolType.MADRASAH ? '(Madrasah)' : '(Sekolah Umum)'}
                </label>
                <select
                    name="theme"
                    value={formData.theme}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#112967] outline-none hover:bg-slate-100 transition-colors"
                  >
                    <option value="">-- Pilih Tema --</option>
                    {themeOptions.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                </select>
              </div>
               <div className="space-y-2">
                 <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">Nama Kegiatan</label>
                 <input
                    type="text"
                    name="activityName"
                    value={formData.activityName}
                    onChange={handleChange}
                    placeholder="Contoh: Gelar Karya Sampah Menjadi Berkah"
                    className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#112967] outline-none hover:bg-slate-100 transition-colors"
                    required
                  />
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
             <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">Sasaran</label>
                <input
                  type="text"
                  name="targetAudience"
                  value={formData.targetAudience}
                  onChange={handleChange}
                  placeholder="Ex: Siswa Kelas X"
                  className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#112967] outline-none hover:bg-slate-100 transition-colors"
                />
             </div>
             <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">Waktu</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 text-slate-400" size={16} />
                  <input
                    type="text"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    placeholder="Ex: 20 Oktober 2025"
                    className="w-full pl-10 pr-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#112967] outline-none hover:bg-slate-100 transition-colors"
                  />
                </div>
             </div>
             <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">Tempat</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 text-slate-400" size={16} />
                  <input
                    type="text"
                    name="venue"
                    value={formData.venue}
                    onChange={handleChange}
                    placeholder="Ex: Halaman Sekolah"
                    className="w-full pl-10 pr-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#112967] outline-none hover:bg-slate-100 transition-colors"
                  />
                </div>
             </div>
          </div>
        </div>

        {/* SECTION 3: TUJUAN & INDIKATOR */}
        <div className="space-y-5 pt-6 border-t border-slate-100">
           <h3 className="text-xs font-bold text-[#112967] uppercase tracking-widest flex items-center gap-2">
              <Target size={16} className="text-[#F34B1E]" /> Tujuan & Indikator
           </h3>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">Tujuan Umum</label>
                <textarea
                  name="generalGoal"
                  value={formData.generalGoal}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Contoh: Membentuk karakter peduli lingkungan dan kemandirian siswa."
                  className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#112967] outline-none resize-none hover:bg-slate-100 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">Tujuan Khusus</label>
                <textarea
                  name="specificGoal"
                  value={formData.specificGoal}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Contoh: Siswa mampu mengidentifikasi jenis sampah dan cara pengelolaannya."
                  className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#112967] outline-none resize-none hover:bg-slate-100 transition-colors"
                />
              </div>
           </div>
           
           <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">Indikator Keberhasilan</label>
            <input
              type="text"
              name="successIndicators"
              value={formData.successIndicators}
              onChange={handleChange}
              placeholder="Contoh: 80% siswa mampu membuat karya dari limbah"
              className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#112967] outline-none hover:bg-slate-100 transition-colors"
            />
          </div>
        </div>

        {/* SECTION 4: TEKNIS & LOGISTIK */}
        <div className="space-y-5 pt-6 border-t border-slate-100">
           <h3 className="text-xs font-bold text-[#112967] uppercase tracking-widest flex items-center gap-2">
              <Box size={16} className="text-[#F34B1E]" /> Teknis Pelaksanaan
           </h3>
           
           <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">Alur Pelaksanaan Singkat</label>
              <textarea
                name="flow"
                value={formData.flow}
                onChange={handleChange}
                rows={3}
                placeholder="1. Pembukaan... 2. Inti... 3. Penutup..."
                className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#112967] outline-none resize-none hover:bg-slate-100 transition-colors"
              />
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">Sumber Daya / Alat</label>
                <input
                  type="text"
                  name="resources"
                  value={formData.resources}
                  onChange={handleChange}
                  placeholder="Ex: Sound system, Proyektor"
                  className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#112967] outline-none hover:bg-slate-100 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">Lampiran Dokumentasi</label>
                <input
                  type="text"
                  name="attachmentDescription"
                  value={formData.attachmentDescription}
                  onChange={handleChange}
                  placeholder="Ex: Foto kegiatan, Daftar hadir"
                  className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#112967] outline-none hover:bg-slate-100 transition-colors"
                />
              </div>
           </div>
           
           <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">Catatan Tambahan</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Konteks lain yang perlu diketahui AI..."
              className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#112967] outline-none h-20 resize-none hover:bg-slate-100 transition-colors"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-4 px-6 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
            isLoading 
              ? 'bg-slate-400 cursor-not-allowed shadow-none' 
              : 'bg-[#112967] hover:bg-blue-900 hover:shadow-blue-900/20'
          }`}
        >
          {isLoading ? (
            <span className="text-sm">Sedang Menganalisis & Menyusun...</span>
          ) : (
            <>
              <Sparkles size={18} className="text-[#F34B1E]" />
              <span className="text-sm">GENERATE DOKUMEN</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default KokurikulerInput;
