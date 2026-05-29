
import React, { useState } from 'react';
import { askAiAssistant } from '../services/geminiService';
import { MessageSquare, ThumbsUp, Bot, User, Send, MoreHorizontal, FileText, Star, Eye, Users, FileCheck, Layers, Activity } from 'lucide-react';
import { Post, GamificationAction } from '../types';
import KokurikulerTool from './KokurikulerTool';

const INITIAL_POSTS: Post[] = [
  {
    id: '1',
    author: 'Pak Budi Santoso',
    content: 'Bagaimana cara efektif mengajarkan konsep pecahan kepada siswa kelas 3 SD yang masih kesulitan dengan visualisasi?',
    likes: 12,
    timestamp: new Date(),
    type: 'DISCUSSION',
    comments: [
      { id: 'c1', author: 'Bu Rina', content: 'Coba gunakan media konkret pak, seperti memotong buah atau kertas lipat.' },
    ]
  },
  {
    id: '2',
    author: 'Bu Siti Aminah',
    content: 'Mohon review RPP Matematika Kelas 5 saya tentang Volume Kubus. Apakah langkah PBL-nya sudah terlihat jelas?',
    likes: 5,
    timestamp: new Date(),
    type: 'PEER_REVIEW',
    attachments: ['RPP_Matematika_Vol_Kubus.pdf'],
    comments: []
  }
];

interface CollaborationHubProps {
    onAwardXP?: (action: GamificationAction) => void;
}

const CollaborationHub: React.FC<CollaborationHubProps> = ({ onAwardXP }) => {
  const [activeTab, setActiveTab] = useState<'DISCUSSION' | 'PEER_REVIEW' | 'KOKURIKULER'>('DISCUSSION');
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [newPostContent, setNewPostContent] = useState('');
  const [loadingAi, setLoadingAi] = useState<string | null>(null);

  const filteredPosts = posts.filter(p => activeTab === 'DISCUSSION' ? p.type !== 'PEER_REVIEW' : p.type === 'PEER_REVIEW');

  const handlePost = () => {
    if (!newPostContent.trim()) return;
    const newPost: Post = {
      id: Date.now().toString(),
      author: 'Anda (Guru)',
      content: newPostContent,
      likes: 0,
      comments: [],
      timestamp: new Date(),
      type: activeTab as 'DISCUSSION' | 'PEER_REVIEW',
      attachments: activeTab === 'PEER_REVIEW' ? ['Draft_Materi_Baru.pdf'] : undefined // Mock attachment
    };
    setPosts([newPost, ...posts]);
    setNewPostContent('');
    
    // Award XP
    if (onAwardXP) {
        onAwardXP(activeTab === 'PEER_REVIEW' ? GamificationAction.PEER_REVIEW : GamificationAction.POST_DISCUSSION);
    }
  };

  const handleAskAi = async (postId: string, content: string) => {
    setLoadingAi(postId);
    const context = activeTab === 'DISCUSSION' 
      ? "Forum Diskusi Guru Indonesia tentang Pedagogi" 
      : "Sesi Review RPP Sejawat (Peer Review). Berikan kritik membangun dan saran perbaikan.";
      
    const answer = await askAiAssistant(content, context);
    
    setPosts(prevPosts => prevPosts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [...post.comments, {
            id: Date.now().toString(),
            author: 'AI Assistant',
            content: answer
          }]
        };
      }
      return post;
    }));
    setLoadingAi(null);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* 6. Umpan Balik Multi-arah (360°) Header */}
      <div className="bg-gradient-to-r from-[#112967] to-[#0f2152] rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
             <div className="p-2 bg-white/10 rounded-lg backdrop-blur">
               {activeTab === 'DISCUSSION' ? <Users size={24} className="text-[#F34B1E]" /> : 
                activeTab === 'PEER_REVIEW' ? <FileCheck size={24} className="text-[#F34B1E]" /> : <Layers size={24} className="text-[#F34B1E]" />}
             </div>
             <span className="text-[#F34B1E] font-bold tracking-widest uppercase text-xs bg-white/5 px-3 py-1 rounded-full border border-white/10">Kolaborasi 360°</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">
            {activeTab === 'DISCUSSION' ? 'Ruang Diskusi Profesional' : 
             activeTab === 'PEER_REVIEW' ? 'Review Sejawat & Umpan Balik' : 'Generator Kokurikuler'}
          </h1>
          <p className="opacity-80 max-w-2xl leading-relaxed text-blue-100">
            {activeTab === 'DISCUSSION' 
              ? 'Bangun konektivitas dengan rekan sejawat, berbagi praktik baik, dan diskusikan inovasi pembelajaran.' 
              : activeTab === 'PEER_REVIEW' 
                ? 'Dapatkan masukan objektif dari rekan sejawat, atasan, dan AI untuk validasi materi ajar Anda.'
                : 'Otomatisasi dokumen administrasi kegiatan kokurikuler untuk efisiensi dan fokus pada esensi.'}
          </p>
        </div>
        
        {/* Abstract Disruptive Background */}
        <div className="absolute right-0 top-0 h-full w-1/3 opacity-20 bg-[#F34B1E] skew-x-12 blur-3xl translate-x-10"></div>
        <div className="absolute right-0 bottom-0 opacity-10">
          {activeTab === 'DISCUSSION' ? <MessageSquare size={200} /> : 
           activeTab === 'PEER_REVIEW' ? <Activity size={200} /> : <Layers size={200} />}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap space-x-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm w-fit mx-auto md:mx-0">
        <button 
          onClick={() => setActiveTab('DISCUSSION')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'DISCUSSION' ? 'bg-[#112967] text-white shadow-md' : 'text-slate-500 hover:text-[#112967] hover:bg-slate-50'}`}
        >
          <Users size={16} />
          Diskusi Umum
        </button>
        <button 
          onClick={() => setActiveTab('PEER_REVIEW')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'PEER_REVIEW' ? 'bg-[#112967] text-white shadow-md' : 'text-slate-500 hover:text-[#112967] hover:bg-slate-50'}`}
        >
          <FileCheck size={16} />
          Review Sejawat
        </button>
        <button 
          onClick={() => setActiveTab('KOKURIKULER')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'KOKURIKULER' ? 'bg-[#112967] text-white shadow-md' : 'text-slate-500 hover:text-[#112967] hover:bg-slate-50'}`}
        >
          <Layers size={16} />
          Kokurikuler
        </button>
      </div>

      {activeTab === 'KOKURIKULER' ? (
        <KokurikulerTool onAwardXP={onAwardXP} />
      ) : (
        <>
          {/* New Post Input */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden border border-slate-200">
                 <User className="text-slate-400" />
              </div>
              <div className="w-full">
                <textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder={activeTab === 'DISCUSSION' ? "Bagikan ide inovatif atau pertanyaan..." : "Tulis deskripsi materi yang ingin direview..."}
                  className="w-full bg-slate-50 rounded-xl p-4 border border-slate-200 focus:bg-white focus:border-[#112967] focus:ring-1 focus:ring-[#112967] transition-all outline-none resize-none text-slate-700 placeholder-slate-400"
                  rows={3}
                />
                
                {activeTab === 'PEER_REVIEW' && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-[#112967] bg-blue-50 p-3 rounded-xl border border-blue-100">
                     <FileText size={16} />
                     <span>Unggah RPP/Modul Anda untuk mendapatkan feedback yang lebih akurat (Demo: File akan otomatis terlampir).</span>
                  </div>
                )}

                <div className="flex justify-between items-center mt-4">
                  <div className="text-xs text-slate-400 flex items-center gap-1">
                     <Bot size={14} /> Didukung oleh AI Assistant
                  </div>
                  <button 
                    onClick={handlePost}
                    className="bg-[#F34B1E] hover:bg-[#d63d15] text-white px-6 py-2.5 rounded-xl font-bold transition-colors flex items-center gap-2 shadow-lg shadow-orange-900/10"
                  >
                    <Send size={18} />
                    {activeTab === 'PEER_REVIEW' ? 'Minta Review' : 'Posting'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Feed */}
          <div className="space-y-6">
            {filteredPosts.length === 0 && (
              <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
                <p>Belum ada postingan di kategori ini.</p>
              </div>
            )}
            
            {filteredPosts.map(post => (
              <div key={post.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-[#112967]/30 transition-colors group">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#112967] text-white flex items-center justify-center font-bold shadow-md">
                      {post.author.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-[#112967]">{post.author}</h3>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>Guru Matematika</span>
                        <span>•</span>
                        <span>2 jam yang lalu</span>
                        {post.type === 'PEER_REVIEW' && (
                          <span className="bg-[#F34B1E]/10 text-[#F34B1E] px-2 py-0.5 rounded text-[10px] font-bold border border-[#F34B1E]/20">Butuh Review</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button className="text-slate-400 hover:bg-slate-100 p-2 rounded-full">
                    <MoreHorizontal size={20} />
                  </button>
                </div>

                {/* Content */}
                <p className="text-slate-800 leading-relaxed mb-4">
                  {post.content}
                </p>

                {/* Attachments */}
                {post.type === 'PEER_REVIEW' && post.attachments && (
                  <div className="mb-6 bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between group cursor-pointer hover:bg-white hover:shadow-md transition-all">
                    <div className="flex items-center gap-3">
                      <div className="bg-[#F34B1E]/10 p-2.5 rounded-lg text-[#F34B1E]">
                        <FileText size={20} />
                      </div>
                      <div>
                         <span className="font-bold text-slate-700 text-sm block">{post.attachments[0]}</span>
                         <span className="text-xs text-slate-400">PDF Document • 2.4 MB</span>
                      </div>
                    </div>
                    <button className="text-[#112967] text-sm font-bold hover:underline flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                      <Eye size={16} /> Lihat
                    </button>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-4 border-t border-b border-slate-50 py-3 mb-4">
                  <button className="flex items-center gap-2 text-slate-500 hover:text-[#112967] transition-colors text-sm font-medium">
                    <ThumbsUp size={18} />
                    <span>{post.likes} Suka</span>
                  </button>
                  <button className="flex items-center gap-2 text-slate-500 hover:text-[#112967] transition-colors text-sm font-medium">
                    <MessageSquare size={18} />
                    <span>{post.comments.length} {post.type === 'PEER_REVIEW' ? 'Review' : 'Komentar'}</span>
                  </button>
                  <button 
                    onClick={() => handleAskAi(post.id, post.content)}
                    disabled={loadingAi === post.id}
                    className="ml-auto flex items-center gap-2 text-[#F34B1E] bg-[#F34B1E]/5 border border-[#F34B1E]/10 px-3 py-1.5 rounded-lg hover:bg-[#F34B1E] hover:text-white transition-all text-sm font-bold disabled:opacity-50"
                  >
                    <Bot size={18} />
                    <span>{loadingAi === post.id ? 'AI Sedang Menilai...' : post.type === 'PEER_REVIEW' ? 'Minta Kritik AI' : 'Tanya AI'}</span>
                  </button>
                </div>

                {/* Comments / Reviews */}
                <div className="space-y-4 pl-4 border-l-2 border-slate-100">
                  {post.comments.map(comment => (
                    <div key={comment.id} className={`flex gap-3 ${comment.author === 'AI Assistant' ? 'bg-blue-50/50 p-4 rounded-xl border border-blue-100' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm border ${comment.author === 'AI Assistant' ? 'bg-[#112967] text-white border-[#112967]' : 'bg-slate-200 text-slate-600 border-slate-300'}`}>
                        {comment.author === 'AI Assistant' ? <Bot size={16} /> : <User size={16} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`font-bold text-sm ${comment.author === 'AI Assistant' ? 'text-[#112967]' : 'text-slate-900'}`}>{comment.author}</span>
                          {comment.author === 'AI Assistant' && <span className="bg-[#112967] text-white text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">AI Feedback</span>}
                          {post.type === 'PEER_REVIEW' && comment.author !== 'AI Assistant' && (
                             <div className="flex text-yellow-400 bg-yellow-50 px-1 rounded border border-yellow-100">
                               <Star size={12} fill="currentColor" />
                               <Star size={12} fill="currentColor" />
                               <Star size={12} fill="currentColor" />
                               <Star size={12} fill="currentColor" />
                               <Star size={12} />
                             </div>
                          )}
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default CollaborationHub;
