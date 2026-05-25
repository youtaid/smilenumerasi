
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import LessonPlanner from './components/LessonPlanner';
import ContentStudio from './components/ContentStudio';
import CollaborationHub from './components/CollaborationHub';
import SelfDevelopment from './components/SelfDevelopment';
import SmileProgram from './components/SmileProgram';
import DesignThinkingLab from './components/DesignThinkingLab';
import AssessmentCenter from './components/AssessmentCenter';
import ContentManager from './components/ContentManager';
import LoginPage from './components/LoginPage';
import Onboarding from './components/Onboarding';
import { AppView, TeacherProfile, User, UserRole, GamificationAction, XP_VALUES, ContentGenerationContext } from './types';
import { Menu, Loader2, WifiOff, Play, Zap } from 'lucide-react';
import { auth, db } from './services/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // XP Toast
  const [xpToast, setXpToast] = useState<{ amount: number; visible: boolean }>({ amount: 0, visible: false });

  // Content context: pass generated RPP from LessonPlanner → ContentStudio
  const [contentContext, setContentContext] = useState<ContentGenerationContext | null>(null);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (isDemoMode) {
        setAuthLoading(false);
        return;
      }

      setAuthLoading(true);
      if (firebaseUser) {
        try {
          const docRef = doc(db, "users", firebaseUser.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const profileData = docSnap.data() as TeacherProfile;
            const userRole = profileData.role || UserRole.GURU;

            setUser({
              id: firebaseUser.uid,
              name: firebaseUser.displayName || profileData.name || 'User',
              email: firebaseUser.email || '',
              role: userRole,
              isAuthenticated: true,
              isOnboarded: true,
              profile: profileData
            });
            setIsOfflineMode(false);
          } else {
            const tempRole = localStorage.getItem('smile_temp_role') as UserRole;
            const initialRole = tempRole || UserRole.GURU;

            setUser({
              id: firebaseUser.uid,
              name: firebaseUser.displayName || 'Guru Baru',
              email: firebaseUser.email || '',
              role: initialRole,
              isAuthenticated: true,
              isOnboarded: false
            });
            setIsOfflineMode(false);
          }
        } catch (error: any) {
          if (error.code === 'unavailable' || error.message?.includes('offline')) {
            console.log("Firestore is offline. Switching to offline mode.");
          } else if (
            error.code === 'permission-denied' ||
            error.message?.includes('Missing or insufficient permissions') ||
            error.toString().includes('Missing or insufficient permissions')
          ) {
            console.warn("Firestore permission denied. Using temporary local profile.");
          } else {
            console.error("Error fetching user profile:", error);
          }

          const tempRole = localStorage.getItem('smile_temp_role') as UserRole;
          setUser({
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'User (Mode Terbatas)',
            email: firebaseUser.email || '',
            role: tempRole || UserRole.GURU,
            isAuthenticated: true,
            isOnboarded: true,
            profile: {
              id: firebaseUser.uid,
              name: firebaseUser.displayName || 'User',
              school: 'Mode Lokal (Izin Akses Terbatas)',
              subject: 'Umum',
              xpPoints: 0,
              level: '1',
              badges: []
            }
          });
          setIsOfflineMode(true);
        }
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, [isDemoMode]);

  // --- XP System ---
  const handleAwardXP = (action: GamificationAction) => {
    const amount = XP_VALUES[action] || 0;
    if (amount <= 0) return;

    setUser(prev => {
      if (!prev || !prev.profile) return prev;
      return {
        ...prev,
        profile: {
          ...prev.profile,
          xpPoints: (prev.profile.xpPoints || 0) + amount
        }
      };
    });

    // Show XP toast
    setXpToast({ amount, visible: true });
    setTimeout(() => setXpToast(t => ({ ...t, visible: false })), 2500);
  };

  // --- Navigation from LessonPlanner → ContentStudio ---
  const handleNavigateToContent = (context: ContentGenerationContext) => {
    setContentContext(context);
    setCurrentView(AppView.CONTENT_STUDIO);
  };

  const handleOnboardingComplete = async (profile: TeacherProfile) => {
    if (user && user.id) {
      if (isDemoMode) {
        setUser({ ...user, profile, isOnboarded: true });
        return;
      }

      try {
        const profileWithRole = { ...profile, role: user.role };
        await setDoc(doc(db, "users", user.id), profileWithRole);
        setUser({ ...user, profile: profileWithRole, isOnboarded: true });
        localStorage.removeItem('smile_temp_role');
      } catch (error) {
        console.error("Error saving profile:", error);
        alert("Gagal menyimpan profil. Data disimpan sementara secara lokal.");
        setUser({ ...user, profile, isOnboarded: true });
      }
    }
  };

  const handleLogout = async () => {
    if (isDemoMode) {
      setIsDemoMode(false);
      setUser(null);
      return;
    }
    try {
      await signOut(auth);
      setCurrentView(AppView.DASHBOARD);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleManualLogin = (name: string, email: string, role: UserRole) => {
    setIsDemoMode(true);
    setIsOfflineMode(false);
    setUser({
      id: 'demo-user',
      name,
      email,
      role,
      isAuthenticated: true,
      isOnboarded: false
    });
  };

  const handleChangeView = (view: AppView) => {
    // Clear content context when navigating away from ContentStudio
    if (view !== AppView.CONTENT_STUDIO) {
      setContentContext(null);
    }
    setCurrentView(view);
    setIsMobileMenuOpen(false);
  };

  const renderContent = () => {
    switch (currentView) {
      case AppView.DASHBOARD:
        return <Dashboard />;
      case AppView.SMILE_PROGRAM:
        return <SmileProgram onAwardXP={handleAwardXP} />;
      case AppView.DESIGN_THINKING:
        return <DesignThinkingLab onAwardXP={handleAwardXP} />;
      case AppView.ASSESSMENT:
        return <AssessmentCenter onAwardXP={handleAwardXP} />;
      case AppView.LESSON_PLANNER:
        return <LessonPlanner onNavigateToContent={handleNavigateToContent} onAwardXP={handleAwardXP} />;
      case AppView.CONTENT_STUDIO:
        return <ContentStudio initialContext={contentContext} onAwardXP={handleAwardXP} />;
      case AppView.COLLABORATION:
        return <CollaborationHub onAwardXP={handleAwardXP} />;
      case AppView.SELF_DEV:
        return <SelfDevelopment />;
      case AppView.CONTENT_MANAGER:
        return <ContentManager />;
      default:
        return <Dashboard />;
    }
  };

  // Mobile menu nav items
  const mobileNavItems = [
    { id: AppView.DASHBOARD, label: 'Beranda & Analitik' },
    { id: AppView.SMILE_PROGRAM, label: 'Pelatihan SMILE' },
    { id: AppView.DESIGN_THINKING, label: 'Lab Design Thinking' },
    { id: AppView.LESSON_PLANNER, label: 'Studio Modul Ajar' },
    { id: AppView.CONTENT_STUDIO, label: 'Studio Soal & Materi' },
    { id: AppView.ASSESSMENT, label: 'Pusat Asesmen' },
    { id: AppView.COLLABORATION, label: 'Kolaborasi 360°' },
    { id: AppView.SELF_DEV, label: 'Jalur Kompetensi' },
  ];

  // 0. Loading State
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f4f8]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={40} className="text-[#112967] animate-spin" />
          <p className="text-[#112967] font-bold animate-pulse">Memuat SMILE Platform...</p>
        </div>
      </div>
    );
  }

  // 1. Unauthenticated → Show Login
  if (!user || !user.isAuthenticated) {
    return <LoginPage onLogin={handleManualLogin} />;
  }

  // 2. Authenticated but not Onboarded → Show Onboarding
  if (user.isAuthenticated && !user.isOnboarded) {
    return (
      <Onboarding
        initialName={user.name}
        role={user.role}
        onComplete={handleOnboardingComplete}
      />
    );
  }

  // 3. Authenticated & Onboarded → Main App
  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      <Sidebar
        currentView={currentView}
        onChangeView={handleChangeView}
        profile={user.profile}
        role={user.role}
        onLogout={handleLogout}
      />

      {/* Mobile Overlay Menu */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className="absolute left-0 top-0 h-full bg-white w-72 p-5 shadow-2xl overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 bg-[#112967] text-white rounded-xl flex items-center justify-center font-black text-lg">S</div>
              <span className="font-black text-[#112967] text-xl">SMILE Platform</span>
            </div>

            {user.profile && (
              <div className="mb-5 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                <div className="font-bold text-gray-800">{user.profile.name}</div>
                <div className="text-xs text-indigo-600 font-medium mt-0.5">{user.role}</div>
                <div className="text-xs text-gray-500 mt-1">{user.profile.school}</div>
                {user.profile.xpPoints !== undefined && (
                  <div className="flex items-center gap-1 mt-2 text-xs font-bold text-orange-600">
                    <Zap size={12} /> {user.profile.xpPoints} XP
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col space-y-1">
              {mobileNavItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => handleChangeView(item.id)}
                  className={`text-left px-4 py-3 rounded-xl font-medium text-sm transition-colors ${
                    currentView === item.id
                      ? 'bg-[#112967] text-white'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              {user.role === UserRole.ADMIN && (
                <button
                  onClick={() => handleChangeView(AppView.CONTENT_MANAGER)}
                  className={`text-left px-4 py-3 rounded-xl font-medium text-sm transition-colors ${
                    currentView === AppView.CONTENT_MANAGER
                      ? 'bg-red-600 text-white'
                      : 'text-red-600 hover:bg-red-50'
                  }`}
                >
                  Manajemen Konten
                </button>
              )}
              <button
                onClick={handleLogout}
                className="text-left px-4 py-3 rounded-xl font-medium text-red-600 hover:bg-red-50 mt-3 text-sm"
              >
                Keluar Aplikasi
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 md:ml-64 transition-all duration-300 flex flex-col min-h-screen">
        {/* Mobile Top Bar */}
        <div className="md:hidden bg-white p-4 flex justify-between items-center shadow-sm sticky top-0 z-10 border-b border-slate-100">
          <span className="font-black text-[#112967] text-lg">SMILE Platform</span>
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 bg-gray-100 rounded-lg text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <Menu size={24} />
          </button>
        </div>

        {/* Status Banners */}
        {isOfflineMode && (
          <div className="bg-orange-500 text-white px-4 py-2 text-sm font-bold text-center flex items-center justify-center gap-2">
            <WifiOff size={16} /> Mode Terbatas — Koneksi Database Bermasalah
          </div>
        )}
        {isDemoMode && (
          <div className="bg-[#112967] text-white px-4 py-2 text-sm font-bold text-center flex items-center justify-center gap-2">
            <Play size={16} /> Mode Demo Tamu — Data tidak disimpan ke server
          </div>
        )}

        {/* XP Toast */}
        <div
          className={`fixed bottom-6 right-6 z-50 transition-all duration-500 ${
            xpToast.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
        >
          <div className="bg-[#F34B1E] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 font-bold text-sm">
            <Zap size={18} className="text-yellow-300" />
            +{xpToast.amount} XP
          </div>
        </div>

        <div className="p-6 md:p-8 lg:p-10 max-w-7xl mx-auto w-full flex-1">
          {renderContent()}
        </div>

        <footer className="py-6 text-center text-gray-400 text-sm font-medium border-t border-gray-200 bg-gray-50">
          Farid Fachrudin | Teknologi Pendidikan UNJ
        </footer>
      </main>
    </div>
  );
};

export default App;
