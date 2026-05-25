
import React from 'react';
import { LayoutDashboard, BookOpen, PenTool, Users, Award, LogOut, Zap, School, Map, BrainCircuit, ClipboardCheck, Settings, Database, FolderCog, GraduationCap, BarChart } from 'lucide-react';
import { AppView, TeacherProfile, UserRole } from '../types';
import { calculateCurrentLevelProgress, calculateLevel } from '../services/gamificationService';

interface SidebarProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  profile?: TeacherProfile;
  role: UserRole;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, profile, role, onLogout }) => {
  
  // Grouping Menus for better UX
  const menuGroups = [
    {
      label: "Utama",
      items: [
        { id: AppView.DASHBOARD, label: 'Beranda & Analitik', icon: LayoutDashboard, roles: [UserRole.GURU, UserRole.FASILITATOR, UserRole.ADMIN, UserRole.KEPALA_SEKOLAH] },
        { id: AppView.SMILE_PROGRAM, label: 'Pelatihan SMILE', icon: GraduationCap, roles: [UserRole.GURU, UserRole.FASILITATOR, UserRole.ADMIN] },
      ]
    },
    {
      label: "Studio Inovasi",
      items: [
        { id: AppView.DESIGN_THINKING, label: 'Lab Design Thinking', icon: BrainCircuit, roles: [UserRole.GURU, UserRole.FASILITATOR] },
        { id: AppView.LESSON_PLANNER, label: 'Studio Modul Ajar', icon: BookOpen, roles: [UserRole.GURU, UserRole.FASILITATOR] },
        { id: AppView.CONTENT_STUDIO, label: 'Studio Soal & Materi', icon: PenTool, roles: [UserRole.GURU] },
      ]
    },
    {
      label: "Evaluasi & Kolaborasi",
      items: [
        { id: AppView.ASSESSMENT, label: 'Pusat Asesmen', icon: ClipboardCheck, roles: [UserRole.GURU, UserRole.FASILITATOR, UserRole.PENELITI] },
        { id: AppView.COLLABORATION, label: 'Kolaborasi 360°', icon: Users, roles: [UserRole.GURU, UserRole.FASILITATOR, UserRole.KEPALA_SEKOLAH] },
        { id: AppView.SELF_DEV, label: 'Jalur Kompetensi', icon: Award, roles: [UserRole.GURU] },
      ]
    },
    {
      label: "Admin",
      items: [
        { id: AppView.CONTENT_MANAGER, label: 'Manajemen Konten', icon: FolderCog, roles: [UserRole.ADMIN] },
      ]
    }
  ];

  // Determine Persona Color
  const getPersonaBadgeColor = (persona?: string) => {
    switch(persona) {
      case 'Adaptive Navigator': return 'bg-blue-100 text-[#112967] border-blue-200';
      case 'Seasoned Mentor': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Numeracy Curious': return 'bg-orange-100 text-[#F34B1E] border-orange-200';
      case 'Empathic Connector': return 'bg-green-100 text-green-800 border-green-200';
      case 'Digital Transitioning': return 'bg-slate-200 text-slate-800 border-slate-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const xp = profile?.xpPoints || 0;
  // Calculate level directly from XP for consistency, fallback to profile level string if needed
  const level = calculateLevel(xp);
  const progressPercent = calculateCurrentLevelProgress(xp);

  return (
    <div className="w-64 bg-white h-screen border-r border-slate-200 flex flex-col fixed left-0 top-0 z-20 shadow-xl hidden md:flex">
      {/* Brand Header */}
      <div className="p-6 flex items-center space-x-3 border-b border-slate-100 bg-gradient-to-r from-white to-slate-50">
        <div className="w-10 h-10 bg-[#112967] rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20 shrink-0 transform transition-transform hover:scale-105">
          <span className="text-white font-black text-xl">S</span>
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-black text-[#112967] tracking-tight leading-none">SMILE</span>
          <span className="text-[10px] text-slate-500 font-medium tracking-wider">Platform Guru</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-4 custom-scrollbar space-y-6">
        {menuGroups.map((group, groupIdx) => {
          // Filter items based on user role
          const visibleItems = group.items.filter(item => item.roles.includes(role));
          
          if (visibleItems.length === 0) return null;

          return (
            <div key={groupIdx}>
              <div className="px-2 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{group.label}</div>
              <ul className="space-y-1">
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  const isAdminItem = item.id === AppView.CONTENT_MANAGER;

                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => onChangeView(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                          isActive
                            ? isAdminItem 
                                ? 'bg-red-50 text-red-600 font-semibold shadow-sm'
                                : 'bg-[#112967] text-white font-semibold shadow-md shadow-blue-900/20 translate-x-1'
                            : 'text-slate-500 hover:bg-slate-50 hover:text-[#112967]'
                        }`}
                      >
                        <Icon size={18} className={`shrink-0 ${isActive ? (isAdminItem ? 'text-red-600' : 'text-[#F34B1E]') : 'text-slate-400 group-hover:text-[#112967]'}`} />
                        <span className="text-sm font-medium leading-tight text-left">{item.label}</span>
                        
                        {isActive && !isAdminItem && (
                            <div className="absolute right-3 w-1.5 h-1.5 bg-[#F34B1E] rounded-full animate-pulse"></div>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      {/* Profile Widget */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        {profile ? (
          <div 
            className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm relative overflow-hidden group cursor-pointer hover:border-[#112967]/30 transition-all" 
            onClick={() => onChangeView(AppView.SELF_DEV)}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#112967] to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-white shrink-0">
                {profile.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-[#112967] truncate">{profile.name}</h4>
                <div className="flex items-center gap-1 mt-0.5">
                   <div className="bg-[#F34B1E] text-white text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                     <Zap size={8} fill="currentColor" /> Lv.{level}
                   </div>
                   <span className="text-[9px] text-slate-400 truncate">{role}</span>
                </div>
              </div>
            </div>
            
            {/* Persona Badge */}
            {profile.persona && (
              <div className={`text-[9px] font-bold px-2 py-1 rounded text-center mb-2 border ${getPersonaBadgeColor(profile.persona.persona_result)}`}>
                {profile.persona.persona_result}
              </div>
            )}

            <div className="relative pt-1">
              <div className="flex justify-between text-[9px] font-medium text-slate-400 mb-1">
                <span>XP Progress</span>
                <span className="text-[#F34B1E] font-bold">{xp} XP</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200">
                <div 
                  className="bg-gradient-to-r from-[#112967] to-[#F34B1E] h-1.5 rounded-full transition-all duration-1000" 
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white p-3 rounded-xl text-center text-xs text-slate-500 mb-3 border border-slate-200">
            Mode Tamu
          </div>
        )}

        <button 
          onClick={onLogout}
          className="flex items-center justify-center gap-2 px-4 py-2 mt-2 w-full text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors text-xs font-bold"
        >
          <LogOut size={14} />
          <span>Keluar Aplikasi</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
