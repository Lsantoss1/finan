'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger'
}: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-auto max-w-md apple-glass rounded-[2.5rem] p-8 shadow-2xl border border-white/10 overflow-hidden"
          >
            {/* Background Glow */}
            <div className={cn(
              "absolute -top-24 -right-24 w-48 h-48 blur-[80px] opacity-20",
              variant === 'danger' ? "bg-rose-500" : "bg-amber-500"
            )} />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg",
                  variant === 'danger' ? "bg-rose-500/20 text-rose-500" : "bg-amber-500/20 text-amber-500"
                )}>
                  <AlertTriangle size={28} />
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 rounded-xl hover:bg-white/5 transition-colors"
                >
                  <X size={20} className="text-gray-400" />
                </button>
              </div>

              <h3 className="text-2xl font-black mb-3" style={{ color: 'var(--text)' }}>
                {title}
              </h3>
              
              <p className="text-sm leading-relaxed mb-8" style={{ color: 'var(--text-secondary)' }}>
                {message}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-4 rounded-2xl font-bold text-sm bg-white/5 hover:bg-white/10 transition-all"
                  style={{ color: 'var(--text)' }}
                >
                  {cancelText}
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className={cn(
                    "flex-1 py-4 rounded-2xl font-bold text-sm shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]",
                    variant === 'danger' ? "bg-rose-600 text-white" : "bg-amber-500 text-white"
                  )}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
