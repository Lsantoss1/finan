'use client';

import { AlertTriangle, Loader2, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  loading?: boolean;
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Excluir Item',
  description = 'Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.',
  loading = false
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md animate-fade-in" 
        onClick={onClose} 
      />
      
      {/* Modal */}
      <div 
        className="relative w-full max-w-sm apple-glass rounded-[2.5rem] p-8 shadow-2xl animate-scale-in overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Warning Icon */}
        <div className="w-16 h-16 rounded-3xl bg-red-500/10 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={32} className="text-red-500" />
        </div>

        <div className="text-center space-y-2 mb-8">
          <h3 className="text-xl font-black" style={{ color: 'var(--text)' }}>{title}</h3>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {description}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={onConfirm}
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-red-500 text-white font-bold shadow-lg shadow-red-500/20 hover:bg-red-600 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : 'Sim, Excluir'}
          </button>
          
          <button
            onClick={onClose}
            disabled={loading}
            className="w-full py-4 rounded-2xl font-bold transition-all hover:bg-white/5 active:scale-95"
            style={{ color: 'var(--text-secondary)' }}
          >
            Cancelar
          </button>
        </div>

        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl hover:bg-white/5 opacity-50 transition-all"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
}
