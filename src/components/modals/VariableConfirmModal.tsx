'use client';

import { useState, useEffect } from 'react';
import { Settings, CheckCircle2, X, Info } from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import type { Transaction } from '@/types';

interface VariableConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  onConfirmCurrentMonth: (actualAmount: number) => void;
  onEditBaseValue: () => void;
}

export default function VariableConfirmModal({
  isOpen,
  onClose,
  transaction,
  onConfirmCurrentMonth,
  onEditBaseValue
}: VariableConfirmModalProps) {
  const [actualAmount, setActualAmount] = useState('');

  // Reset the input when the modal opens with a new transaction
  useEffect(() => {
    if (isOpen && transaction) {
      setActualAmount(transaction.amount.toString());
    }
  }, [isOpen, transaction]);

  if (!isOpen || !transaction) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md animate-fade-in" 
        onClick={onClose} 
      />
      
      <div 
        className="relative w-full max-w-md apple-glass rounded-[2.5rem] p-8 shadow-2xl animate-scale-in overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: 'var(--primary-light)20' }}>
            <Settings size={24} style={{ color: 'var(--primary)' }} />
          </div>
          <div>
            <h3 className="text-xl font-black" style={{ color: 'var(--text)' }}>Despesa Variável</h3>
            <p className="text-xs opacity-70" style={{ color: 'var(--text-secondary)' }}>
              {transaction.description}
            </p>
          </div>
        </div>

        <div className="bg-white/5 p-4 rounded-2xl border mb-6 flex items-start gap-3" style={{ borderColor: 'var(--border)' }}>
          <Info size={16} style={{ color: 'var(--primary)' }} className="shrink-0 mt-0.5" />
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Esta é uma conta recorrente marcada como <strong>variável</strong>. Você pode confirmar o valor exato deste mês ou editar a previsão base para os próximos meses.
          </p>
        </div>

        <div className="space-y-6">
          {/* Opção 1: Confirmar o mês atual */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Qual foi o valor exato deste mês?
            </label>
            <div className="flex gap-3">
              <input 
                type="number"
                value={actualAmount}
                onChange={e => setActualAmount(e.target.value)}
                placeholder={transaction.amount.toString()}
                className="flex-1 px-4 py-3 rounded-xl text-sm border outline-none font-bold"
                style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
              />
              <button
                onClick={() => onConfirmCurrentMonth(parseFloat(actualAmount || transaction.amount.toString()))}
                className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 shrink-0"
              >
                <CheckCircle2 size={18} /> Confirmar
              </button>
            </div>
            <p className="text-[10px] italic" style={{ color: 'var(--text-muted)' }}>
              A previsão para o mês seguinte será agendada automaticamente.
            </p>
          </div>

          <div className="h-px w-full relative" style={{ background: 'var(--border)' }}>
            <span className="absolute left-1/2 -translate-x-1/2 -top-2 px-2 text-[10px] font-bold uppercase" style={{ background: 'var(--surface)', color: 'var(--text-muted)' }}>Ou</span>
          </div>

          {/* Opção 2: Editar o Base */}
          <div>
            <button
              onClick={onEditBaseValue}
              className="w-full py-4 rounded-2xl border font-bold transition-all hover:bg-white/5 active:scale-95"
              style={{ color: 'var(--text)', borderColor: 'var(--border)' }}
            >
              Editar previsão base
            </button>
          </div>
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
