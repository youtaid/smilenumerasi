
import React, { useState } from 'react';
import { UserRole } from '../types';
import { LogIn, UserPlus, Mail, Lock, Shield, Chrome, Loader2, AlertCircle, Play } from 'lucide-react';
import { auth, googleProvider } from '../services/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, updateProfile } from 'firebase/auth';

interface LoginPageProps {
  onLogin: (name: string, email: string, role: UserRole) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.GURU);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getErrorMessage = (err: any) => {
    // Suppress console error for expected operational errors to keep console clean
    if (err.code !== 'auth/invalid-credential' && err.code !== 'auth/wrong-password' && err.code !== 'auth/user-not-found') {
        console.error("Firebase Auth Error:", err);
    }

    if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential' || err.code === 'auth/invalid-login-credentials') return "Email atau kata sandi salah. Silakan coba lagi.";
    if (err.code === 'auth/user-not-found') return "Akun tidak ditemukan. Silakan daftar terlebih dahulu.";
    if (err.code === 'auth/email-already-in-use') return "Email sudah terdaftar. Silakan login.";
    if (err.code === 'auth/weak-password') return "Kata sandi terlalu lemah (min 6 karakter).";
    if (err.code === 'auth/popup-closed-by-user') return "Login dibatalkan.";
    if (err.code === 'auth/configuration-not-found') return "Konfigurasi Auth belum aktif di Firebase Console.";
    if (err.code === 'auth/network-request-failed') return "Gagal terhubung. Periksa koneksi internet Anda.";
    if (err.code === 'auth/too-many-requests') return "Terlalu banyak percobaan login gagal. Silakan coba lagi nanti.";
    
    return `Gagal masuk: ${err.message}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isRegistering) {
        // Register
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        
        // Simpan Role sementara di localStorage
        localStorage.setItem('smile_temp_role', role);
      } else {
        // Login
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    // Trigger manual login for Demo Mode
    // Use the role selected in the dropdown if available, otherwise default to GURU or current state
    onLogin(`${role} Demo`, "demo@smile.id", role);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#112967] to-[#0a183d] p-4">
      <div className="bg-white rounded-3xl shadow-2xl flex flex-col md:flex-row max-w-5xl w-full overflow-hidden min-h-[600px]">
        
        {/* Left Side: Brand & Visuals */}
        <div className="md:w-1/2 bg-[#112967] p-12 flex flex-col justify-center relative overflow-hidden text-white">
          {/* Abstract Shapes */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-[#F34B1E] rounded-full mix-blend-multiply filter blur-[80px] opacity-20 -translate-x-20 -translate-y-20"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-overlay filter blur-[80px] opacity-20 translate-x-20 translate-y-20"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-8">
               <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-lg text-[#112967] font-black text-3xl">S</div>
               <h1 className="text-4xl font-bold tracking-tight">SMILE Platform</h1>
            </div>
            <h2 className="text-3xl font-bold mb-6 leading-tight">
              <span className="text-white">Smart</span> & <span className="text-[#F34B1E]">Innovative</span> Learning Environment
            </h2>
            <p className="text-blue-100 leading-relaxed text-lg mb-8">
              Platform profesional untuk guru Indonesia. Tingkatkan kompetensi melalui inovasi, konektivitas, dan teknologi disruptif.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm font-medium text-white bg-white/10 p-4 rounded-xl backdrop-blur-md border border-white/10">
                <Shield size={20} className="text-[#F34B1E]" />
                <span>Ekosistem Pendidikan Terintegrasi & Aman</span>
              </div>
              <div className="flex items-center gap-3 text-sm font-medium text-white bg-white/10 p-4 rounded-xl backdrop-blur-md border border-white/10">
                <Chrome size={20} className="text-[#F34B1E]" />
                <span>Mendukung Akun Belajar.id (SSO)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="md:w-1/2 p-12 bg-white flex flex-col justify-center animate-fade-in relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-bl-full -z-0"></div>

          <h2 className="text-3xl font-bold text-[#112967] mb-2 relative z-10">{isRegistering ? 'Bergabung Sekarang' : 'Selamat Datang'}</h2>
          <p className="text-slate-500 text-sm mb-6 relative z-10">{isRegistering ? 'Mulai perjalanan inovasi pembelajaran Anda.' : 'Masuk untuk mengakses SMILE Platform Anda.'}</p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm flex items-start gap-2 animate-fade-in">
              <AlertCircle size={16} className="shrink-0 mt-0.5" /> 
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            {isRegistering ? (
              <>
                <div>
                  <label className="block text-xs font-bold text-[#112967] uppercase tracking-wider mb-1">Nama Lengkap</label>
                  <input 
                    type="text" 
                    className="w-full p-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#112967] focus:border-[#112967] outline-none transition-all bg-slate-50 focus:bg-white"
                    placeholder="Contoh: Budi Santoso"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#112967] uppercase tracking-wider mb-1">Peran Pengguna</label>
                  <select 
                    className="w-full p-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#112967] outline-none bg-slate-50 focus:bg-white"
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                  >
                    {Object.values(UserRole).map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </>
            ) : (
                /* Hidden select to keep Role state consistent for Demo Mode even if not registering */
                <div className="hidden"></div>
            )}
            
            {/* Show Role Select for Demo Mode visibility if not registering */}
            {!isRegistering && (
                 <div className="mb-2">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Simulasi Peran (Pilih 'Admin' untuk Edit Konten)</label>
                    <select 
                        className="w-full p-2 rounded-xl border border-slate-200 text-sm text-slate-500 focus:ring-2 focus:ring-[#112967] outline-none bg-slate-50"
                        value={role}
                        onChange={(e) => setRole(e.target.value as UserRole)}
                    >
                        {Object.values(UserRole).map(r => (
                        <option key={r} value={r}>{r}</option>
                        ))}
                    </select>
                </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#112967] uppercase tracking-wider mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-4 text-slate-400" size={18} />
                <input 
                  type="email" 
                  className="w-full pl-12 p-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#112967] focus:border-[#112967] outline-none transition-all bg-slate-50 focus:bg-white"
                  placeholder="nama@sekolah.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#112967] uppercase tracking-wider mb-1">Kata Sandi</label>
              <div className="relative">
                <Lock className="absolute left-4 top-4 text-slate-400" size={18} />
                <input 
                  type="password" 
                  className="w-full pl-12 p-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#112967] focus:border-[#112967] outline-none transition-all bg-slate-50 focus:bg-white"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-[#F34B1E] text-white font-bold py-4 rounded-xl hover:bg-[#d63d15] transition-all shadow-lg shadow-orange-200 flex items-center justify-center gap-2 mt-6 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : (isRegistering ? <UserPlus size={20} /> : <LogIn size={20} />)}
              {isRegistering ? 'Daftar Akun' : 'Masuk Dashboard'}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-slate-400 font-medium">Opsi Masuk Lain</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button 
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full bg-white border border-slate-200 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? <Loader2 size={20} className="animate-spin text-slate-400" /> : <Chrome size={20} className="text-red-500" />}
              Masuk dengan Google (Belajar.id)
            </button>
            
            <button 
              type="button"
              onClick={handleDemoLogin}
              className="w-full bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold py-3 rounded-xl hover:bg-indigo-100 transition-all flex items-center justify-center gap-2"
            >
              <Play size={20} />
              Mode Demo (Masuk sebagai {role})
            </button>

            {!isRegistering && (
                <div className="text-center mt-1">
                    <button 
                        type="button"
                        onClick={() => onLogin('Super Admin', 'admin@smile.id', UserRole.ADMIN)}
                        className="text-[11px] font-bold text-slate-400 hover:text-[#112967] transition-colors"
                    >
                        (Akses Cepat: Masuk sebagai Admin)
                    </button>
                </div>
            )}
          </div>

          <p className="mt-6 text-center text-sm text-slate-600">
            {isRegistering ? 'Sudah punya akun?' : 'Belum punya akun?'} 
            <button 
              onClick={() => setIsRegistering(!isRegistering)}
              className="ml-1 font-bold text-[#112967] hover:underline"
            >
              {isRegistering ? 'Login di sini' : 'Daftar gratis'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
