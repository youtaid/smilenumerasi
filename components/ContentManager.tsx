
import React, { useState, useEffect } from 'react';
import { LmsModule, LmsActivity } from '../types';
import { getModules, saveModules, resetModules } from '../services/contentService';
import { Plus, Trash2, Edit, Save, X, FolderPlus, FileVideo, FileText, CheckCircle, GripVertical, Image as ImageIcon, Link, HelpCircle } from 'lucide-react';

const ContentManager: React.FC = () => {
  const [modules, setModules] = useState<LmsModule[]>([]);
  const [editingModule, setEditingModule] = useState<LmsModule | null>(null);
  const [editingActivity, setEditingActivity] = useState<LmsActivity | null>(null);
  
  // Dialog States
  const [isModuleDialogOpen, setIsModuleDialogOpen] = useState(false);
  const [isActivityDialogOpen, setIsActivityDialogOpen] = useState(false);
  const [parentModuleId, setParentModuleId] = useState<string | null>(null);

  useEffect(() => {
    // Load data from service
    setModules(getModules());
  }, []);

  const handleSaveModules = (newModules: LmsModule[]) => {
    setModules(newModules);
    saveModules(newModules);
  };

  const handleReset = () => {
    if (confirm("Apakah Anda yakin ingin mereset semua materi ke kondisi awal (default)? Perubahan Anda akan hilang.")) {
        const defaults = resetModules();
        setModules(defaults);
    }
  };

  // --- Module Operations ---

  const openAddModule = () => {
    setEditingModule({ id: '', title: '', activities: [] });
    setIsModuleDialogOpen(true);
  };

  const openEditModule = (module: LmsModule) => {
    setEditingModule({ ...module });
    setIsModuleDialogOpen(true);
  };

  const saveModule = () => {
    if (!editingModule || !editingModule.title) return;

    let updatedModules = [...modules];
    if (editingModule.id) {
      // Edit existing
      updatedModules = updatedModules.map(m => m.id === editingModule.id ? editingModule : m);
    } else {
      // Create new
      const newModule = { ...editingModule, id: `modul-${Date.now()}` };
      updatedModules.push(newModule);
    }

    handleSaveModules(updatedModules);
    setIsModuleDialogOpen(false);
  };

  const deleteModule = (id: string) => {
    if (confirm("Hapus modul ini beserta seluruh aktivitas di dalamnya?")) {
      handleSaveModules(modules.filter(m => m.id !== id));
    }
  };

  // --- Activity Operations ---

  const openAddActivity = (moduleId: string) => {
    setParentModuleId(moduleId);
    setEditingActivity({
      id: '',
      code: '',
      title: '',
      type: 'VIDEO',
      duration: '',
      description: '',
      videoUrl: '',
      fileUrl: ''
    });
    setIsActivityDialogOpen(true);
  };

  const openEditActivity = (moduleId: string, activity: LmsActivity) => {
    setParentModuleId(moduleId);
    setEditingActivity({ ...activity });
    setIsActivityDialogOpen(true);
  };

  const saveActivity = () => {
    if (!editingActivity || !editingActivity.title || !parentModuleId) return;

    const updatedModules = modules.map(m => {
      if (m.id === parentModuleId) {
        let updatedActivities = [...m.activities];
        if (editingActivity.id) {
          // Edit
          updatedActivities = updatedActivities.map(a => a.id === editingActivity.id ? editingActivity : a);
        } else {
          // Add
          const newActivity = { ...editingActivity, id: `${parentModuleId}-${Date.now()}` };
          updatedActivities.push(newActivity);
        }
        return { ...m, activities: updatedActivities };
      }
      return m;
    });

    handleSaveModules(updatedModules);
    setIsActivityDialogOpen(false);
  };

  const deleteActivity = (moduleId: string, activityId: string) => {
    if (confirm("Hapus aktivitas ini?")) {
        const updatedModules = modules.map(m => {
            if (m.id === moduleId) {
                return { ...m, activities: m.activities.filter(a => a.id !== activityId) };
            }
            return m;
        });
        handleSaveModules(updatedModules);
    }
  };

  const getActivityIcon = (type: string) => {
      switch(type) {
          case 'VIDEO': return <FileVideo size={16} className="text-red-500" />;
          case 'MATERIAL': return <FileText size={16} className="text-blue-500" />;
          case 'QUIZ': return <HelpCircle size={16} className="text-purple-500" />;
          case 'LINK': return <Link size={16} className="text-gray-500" />;
          default: return <FileText size={16} />;
      }
  };

  // --- Render ---

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-12">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold text-[#112967]">Manajemen Konten Program SMILE</h1>
                <p className="text-slate-500 text-sm">Kelola modul, video, materi bacaan, dan kuis untuk pengguna.</p>
            </div>
            <div className="flex gap-2">
                <button 
                    onClick={handleReset} 
                    className="text-red-500 text-sm font-bold px-4 py-2 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                >
                    Reset Default
                </button>
                <button 
                    onClick={openAddModule}
                    className="bg-[#F34B1E] text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-[#d63d15] transition-colors shadow-sm"
                >
                    <FolderPlus size={18} /> Tambah Modul
                </button>
            </div>
        </div>

        <div className="space-y-6">
            {modules.map((module) => (
                <div key={module.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    {/* Module Header */}
                    <div className="bg-slate-50 p-4 border-b border-slate-200 flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                            <GripVertical size={20} className="text-slate-300 cursor-move" />
                            <h3 className="font-bold text-[#112967] text-lg">{module.title}</h3>
                            <span className="text-xs font-medium bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
                                {module.activities.length} Aktivitas
                            </span>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openEditModule(module)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg" title="Edit Modul">
                                <Edit size={18} />
                            </button>
                            <button onClick={() => deleteModule(module.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-lg" title="Hapus Modul">
                                <Trash2 size={18} />
                            </button>
                            <button 
                                onClick={() => openAddActivity(module.id)}
                                className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 border border-indigo-100 hover:bg-indigo-100 ml-2"
                            >
                                <Plus size={14} /> Aktivitas Baru
                            </button>
                        </div>
                    </div>

                    {/* Activities List */}
                    <div className="divide-y divide-slate-100">
                        {module.activities.length === 0 && (
                            <div className="p-8 text-center text-slate-400 text-sm italic">
                                Belum ada aktivitas dalam modul ini.
                            </div>
                        )}
                        {module.activities.map((activity) => (
                            <div key={activity.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                                <div className="flex items-start gap-4">
                                    <div className="mt-1 p-2 bg-white border border-slate-200 rounded-lg shadow-sm text-slate-500">
                                        {getActivityIcon(activity.type)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-1.5 rounded">{activity.code}</span>
                                            <h4 className="font-bold text-slate-800 text-sm">{activity.title}</h4>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">{activity.description}</p>
                                        <div className="flex gap-3 mt-1 text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                                            <span>{activity.type}</span>
                                            <span>•</span>
                                            <span>{activity.duration}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                     <button onClick={() => openEditActivity(module.id, activity)} className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded" title="Edit">
                                        <Edit size={16} />
                                     </button>
                                     <button onClick={() => deleteActivity(module.id, activity.id)} className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded" title="Hapus">
                                        <Trash2 size={16} />
                                     </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>

        {/* --- MODALS --- */}
        
        {/* Module Modal */}
        {isModuleDialogOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <h3 className="font-bold text-slate-800">{editingModule?.id ? 'Edit Modul' : 'Tambah Modul Baru'}</h3>
                        <button onClick={() => setIsModuleDialogOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Judul Modul</label>
                            <input 
                                className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#112967] outline-none"
                                value={editingModule?.title || ''}
                                onChange={(e) => setEditingModule(prev => prev ? {...prev, title: e.target.value} : null)}
                                placeholder="Contoh: Modul 1: Readiness"
                            />
                        </div>
                    </div>
                    <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
                        <button onClick={() => setIsModuleDialogOpen(false)} className="px-4 py-2 text-slate-600 font-bold text-sm hover:bg-slate-200 rounded-lg">Batal</button>
                        <button onClick={saveModule} className="px-4 py-2 bg-[#112967] text-white font-bold text-sm rounded-lg hover:bg-blue-900 shadow-lg shadow-blue-900/20">Simpan</button>
                    </div>
                </div>
            </div>
        )}

        {/* Activity Modal */}
        {isActivityDialogOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[90vh]">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
                        <h3 className="font-bold text-slate-800">{editingActivity?.id ? 'Edit Aktivitas' : 'Tambah Aktivitas Baru'}</h3>
                        <button onClick={() => setIsActivityDialogOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                    </div>
                    
                    <div className="p-6 space-y-4 overflow-y-auto">
                        <div className="grid grid-cols-4 gap-4">
                            <div className="col-span-1">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Kode</label>
                                <input 
                                    className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#112967] outline-none text-sm"
                                    value={editingActivity?.code || ''}
                                    onChange={(e) => setEditingActivity(prev => prev ? {...prev, code: e.target.value} : null)}
                                    placeholder="1.1"
                                />
                            </div>
                            <div className="col-span-3">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Judul Aktivitas</label>
                                <input 
                                    className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#112967] outline-none text-sm"
                                    value={editingActivity?.title || ''}
                                    onChange={(e) => setEditingActivity(prev => prev ? {...prev, title: e.target.value} : null)}
                                    placeholder="Judul Materi..."
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tipe Konten</label>
                                <select 
                                    className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#112967] outline-none text-sm bg-white"
                                    value={editingActivity?.type || 'VIDEO'}
                                    onChange={(e) => setEditingActivity(prev => prev ? {...prev, type: e.target.value as any} : null)}
                                >
                                    <option value="VIDEO">Video (YouTube)</option>
                                    <option value="MATERIAL">Materi Bacaan (Teks/PDF)</option>
                                    <option value="QUIZ">Kuis</option>
                                    <option value="ASSIGNMENT">Tugas / LK</option>
                                    <option value="LINK">Link Eksternal</option>
                                </select>
                             </div>
                             <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Durasi</label>
                                <input 
                                    className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#112967] outline-none text-sm"
                                    value={editingActivity?.duration || ''}
                                    onChange={(e) => setEditingActivity(prev => prev ? {...prev, duration: e.target.value} : null)}
                                    placeholder="10 menit"
                                />
                             </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Deskripsi / Konten Teks (Markdown Supported)</label>
                            <textarea 
                                className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#112967] outline-none text-sm min-h-[100px]"
                                value={editingActivity?.description || ''}
                                onChange={(e) => setEditingActivity(prev => prev ? {...prev, description: e.target.value} : null)}
                                placeholder="Deskripsi materi..."
                            />
                        </div>

                        {/* Dynamic Inputs based on Type */}
                        {editingActivity?.type === 'VIDEO' && (
                            <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                                <label className="block text-xs font-bold text-red-800 uppercase mb-1 flex items-center gap-1"><FileVideo size={14} /> URL Video (YouTube)</label>
                                <input 
                                    className="w-full p-3 border border-red-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-sm"
                                    value={editingActivity?.videoUrl || ''}
                                    onChange={(e) => setEditingActivity(prev => prev ? {...prev, videoUrl: e.target.value} : null)}
                                    placeholder="https://www.youtube.com/embed/..."
                                />
                                <p className="text-[10px] text-red-600 mt-1">*Pastikan menggunakan link embed atau link video standar.</p>
                            </div>
                        )}

                        {['MATERIAL', 'ASSIGNMENT'].includes(editingActivity?.type || '') && (
                             <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                <label className="block text-xs font-bold text-blue-800 uppercase mb-1 flex items-center gap-1"><FileText size={14} /> Link File PDF / Dokumen</label>
                                <div className="flex gap-2">
                                    <input 
                                        className="w-full p-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                        value={editingActivity?.fileUrl || ''}
                                        onChange={(e) => setEditingActivity(prev => prev ? {...prev, fileUrl: e.target.value} : null)}
                                        placeholder="https://drive.google.com/..."
                                        readOnly // Simulated upload
                                    />
                                    <button 
                                        onClick={() => {
                                            // Simulate Upload
                                            const fakeUrl = `https://storage.smile-lms.id/files/${Date.now()}.pdf`;
                                            setEditingActivity(prev => prev ? {...prev, fileUrl: fakeUrl} : null);
                                        }}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap hover:bg-blue-700"
                                    >
                                        Upload (Simulasi)
                                    </button>
                                </div>
                             </div>
                        )}
                    </div>

                    <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2 shrink-0">
                        <button onClick={() => setIsActivityDialogOpen(false)} className="px-4 py-2 text-slate-600 font-bold text-sm hover:bg-slate-200 rounded-lg">Batal</button>
                        <button onClick={saveActivity} className="px-4 py-2 bg-[#112967] text-white font-bold text-sm rounded-lg hover:bg-blue-900 shadow-lg shadow-blue-900/20">Simpan</button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default ContentManager;
