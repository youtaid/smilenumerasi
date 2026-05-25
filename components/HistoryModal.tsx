
import React from 'react';
import { HistoryItem } from '../types';
import { X, Clock, Trash2, ChevronRight, Calendar, BookOpen, User } from 'lucide-react';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ 
  isOpen, 
  onClose, 
  history, 
  onSelect, 
  onDelete,
  onClearAll
}) => {
  if (!isOpen) return null;

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 no-print">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="bg-orange-100 p-2 rounded-lg">
                <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <div>
                <h3 className="font-bold text-slate-800">Riwayat Soal</h3>
                <p className="text-xs text-slate-500">Tersimpan otomatis di browser ini</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50 custom-scrollbar">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center opacity-60">
                <Clock className="w-12 h-12 text-slate-300 mb-3" />
                <p className="text-slate-500 font-medium">Belum ada riwayat soal.</p>
                <p className="text-xs text-slate-400">Buat soal baru, nanti akan muncul di sini.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((item) => (
                <div 
                  key={item.id}
                  className="group bg-white border border-slate-200 hover:border-indigo-300 rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer relative"
                  onClick={() => onSelect(item)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 uppercase tracking-wide border border-indigo-100">
                            {item.request.mapel}
                        </span>
                        <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {formatDate(item.timestamp)}
                        </span>
                    </div>
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            if(window.confirm('Hapus riwayat ini?')) onDelete(item.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title="Hapus"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h4 className="font-bold text-slate-800 mb-1 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                      {item.request.topik}
                  </h4>
                  
                  <div className="flex flex-wrap gap-y-1 gap-x-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" /> {item.request.jenjang} - {item.request.kelas}
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3" /> {item.request.jumlah} Soal
                      </span>
                  </div>
                  
                  <div className="absolute bottom-4 right-4 text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {history.length > 0 && (
            <div className="p-4 bg-white border-t border-slate-100 flex justify-between items-center">
                <button 
                    onClick={() => {
                        if(window.confirm('Yakin ingin menghapus SEMUA riwayat?')) onClearAll();
                    }}
                    className="text-xs font-bold text-red-500 hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors flex items-center gap-1"
                >
                    <Trash2 className="w-3.5 h-3.5" /> Hapus Semua
                </button>
                <div className="text-xs text-slate-400">
                    Total {history.length} item tersimpan
                </div>
            </div>
        )}
      </div>
    </div>
  );
};
