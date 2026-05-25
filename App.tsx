
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
import ContentManager from './components/ContentManager'; // Import Admin Component
import LoginPage from './components/LoginPage';
import Onboarding from './components/Onboarding';
import { AppView, TeacherProfile, User, UserRole } from './types';
import { Menu, Loader2, WifiOff, Play } from 'lucide-react';
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

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // If we are in Demo Mode, ignore Firebase auth updates that would log us out
      if (isDemoMode) {
        setAuthLoading(false);
        return;
      }

      setAuthLoading(true);
      if (firebaseUser) {
        // User is signed in, check for profile in Firestore
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
            
            // Do not remove temp role yet, we need it for onboarding save
            setIsOfflineMode(false);
          }
        } catch (error: any) {
          // Robust error handling for permissions or offline issues
          // Checks for both error code and error message content to catch permission denied errors reliably
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
        // User is signed out
        setUser(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, [isDemoMode]);

  const handleOnboardingComplete = async (profile: TeacherProfile) => {
    if (user && user.id) {
      // Demo Mode: Just update state
      if (isDemoMode) {
        setUser({
          ...user,
          profile,
          isOnboarded: true
        });
        return;
      }

      try {
        const profileWithRole = { ...profile, role: user.role };
        await setDoc(doc(db, "users", user.id), profileWithRole);
        
        setUser({
          ...user,
          profile: profileWithRole,
          isOnboarded: true
        });
        localStorage.removeItem('smile_temp_role');
      } catch (error) {
        console.error("Error saving profile:", error);
        alert("Gagal menyimpan profil (Koneksi Database Bermasalah). Data akan disimpan secara lokal sementara.");
        setUser({
          ...user,
          profile,
          isOnboarded: true
        });
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
       isOnboarded: false // Demo user still needs to go through onboarding to see the flow
     });
  };

  const renderContent = () => {
    switch (currentView) {
      case AppView.DASHBOARD:
        return <Dashboard />;
      case AppView.SMILE_PROGRAM:
        return <SmileProgram />;
      case AppView.DESIGN_THINKING:
        return <DesignThinkingLab />;
      case AppView.ASSESSMENT:
        return <AssessmentCenter />;
      case AppView.LESSON_PLANNER:
        return <LessonPlanner />;
      case AppView.CONTENT_STUDIO:
        return <ContentStudio />;
      case AppView.COLLABORATION:
        return <CollaborationHub />;
      case AppView.SELF_DEV:
        return <SelfDevelopment />;
      case AppView.CONTENT_MANAGER:
        return <ContentManager />;
      default:
        return <Dashboard />;
    }
  };

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

  // 1. Unauthenticated -> Show Login
  if (!user || !user.isAuthenticated) {
    return <LoginPage onLogin={handleManualLogin} />;
  }

  // 2. Authenticated but not Onboarded -> Show Onboarding
  if (user.isAuthenticated && !user.isOnboarded) {
    return (
      <Onboarding 
        initialName={user.name} 
        role={user.role} 
        onComplete={handleOnboardingComplete} 
      />
    );
  }

  // 3. Authenticated & Onboarded -> Show Main App
  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      <Sidebar 
        currentView={currentView} 
        onChangeView={(view) => { setCurrentView(view); setIsMobileMenuOpen(false); }}
        profile={user.profile}
        role={user.role}
        onLogout={handleLogout}
      />
      
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
           <div className="absolute left-0 top-0 h-full bg-white w-64 p-4 shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="mb-6 font-bold text-xl text-indigo-600 flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center">S</div>
                SMILE Platform
              </div>
              
              {user.profile && (
                <div className="mb-6 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                  <div className="font-bold text-gray-800">{user.profile.name}</div>
                  <div className="text-xs text-indigo-600 font-medium">{user.role}</div>
                  <div className="text-xs text-gray-500 mt-1">{user.profile.school}</div>
                </div>
              )}

              <div className="flex flex-col space-y-2">
                 {[
                    { id: AppView.DASHBOARD, label: 'Beranda' },
                    { id: AppView.SMILE_PROGRAM, label: 'Program SMILE' },
                    { id: AppView.LESSON_PLANNER, label: 'Perencana RPP' },
                 ].map(item => (
                   <button 
                    key={item.id}
                    onClick={() => { setCurrentView(item.id); setIsMobileMenuOpen(false); }} 
                    className={`text-left px-4 py-3 rounded-xl font-medium ${currentView === item.id ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700 hover:bg-gray-50'}`}
                   >
                    {item.label}
                   </button>
                 ))}
                 <button 
                  onClick={handleLogout}
                  className="text-left px-4 py-3 rounded-xl font-medium text-red-600 hover:bg-red-50 mt-4"
                 >
                   Keluar Aplikasi
                 </button>
              </div>
           </div>
        </div>
      )}

      <main className="flex-1 md:ml-64 transition-all duration-300 flex flex-col min-h-screen">
        <div className="md:hidden bg-white p-4 flex justify-between items-center shadow-sm sticky top-0 z-10">
          <span className="font-bold text-indigo-600 text-lg">SMILE Platform</span>
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 bg-gray-100 rounded-lg text-gray-600 hover:bg-gray-200 transition-colors">
            <Menu size={24} />
          </button>
        </div>

        {isOfflineMode && (
          <div className="bg-orange-500 text-white px-4 py-2 text-sm font-bold text-center flex items-center justify-center gap-2">
            <WifiOff size={16} /> Mode Terbatas (Koneksi Database Bermasalah)
          </div>
        )}
        
        {isDemoMode && (
          <div className="bg-indigo-600 text-white px-4 py-2 text-sm font-bold text-center flex items-center justify-center gap-2">
            <Play size={16} /> Mode Demo Tamu (Data tidak disimpan ke server)
          </div>
        )}

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
