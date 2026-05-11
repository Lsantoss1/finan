'use client';

import { useState } from 'react';
import { Plus, ArrowUpRight, ArrowDownRight, ArrowLeftRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import TransactionModal from './modals/TransactionModal';
import { type TransactionType } from '@/types';

export default function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<TransactionType>('expense');

  const handleOpenModal = (type: TransactionType) => {
    setTransactionType(type);
    setModalOpen(true);
    setIsOpen(false);
  };

  return (
    <>
      <div className="fixed bottom-20 lg:bottom-8 right-6 z-40 flex flex-col items-end gap-3">
        {/* Menu Options */}
        {isOpen && (
          <div className="flex flex-col items-end gap-3 mb-2 animate-slide-up">
            <button
              onClick={() => handleOpenModal('income')}
              className="flex items-center gap-2 group"
            >
              <span className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-widest text-slate-900 shadow-xl border border-white/20">Receita</span>
              <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                <ArrowUpRight size={24} />
              </div>
            </button>
            <button
              onClick={() => handleOpenModal('transfer')}
              className="flex items-center gap-2 group"
            >
              <span className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-widest text-slate-900 shadow-xl border border-white/20">Transferência</span>
              <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                <ArrowLeftRight size={22} />
              </div>
            </button>
            <button
              onClick={() => handleOpenModal('expense')}
              className="flex items-center gap-2 group"
            >
              <span className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-widest text-slate-900 shadow-xl border border-white/20">Despesa</span>
              <div className="w-12 h-12 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                <ArrowDownRight size={24} />
              </div>
            </button>
          </div>
        )}

        {/* Main FAB */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-14 h-14 rounded-full gradient-primary text-white flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-105 active:scale-95",
            isOpen && "rotate-45"
          )}
          style={{ boxShadow: '0 8px 25px -5px rgba(108, 60, 224, 0.5)' }}
        >
          <Plus size={28} />
        </button>
      </div>

      <TransactionModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        initialType={transactionType}
        onSuccess={() => {
          // Refresh data on current page if needed
          window.dispatchEvent(new CustomEvent('transaction-added'));
        }}
      />
    </>
  );
}
