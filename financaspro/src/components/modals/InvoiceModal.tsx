'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { X, CheckCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  card: any;
}

export default function InvoiceModal({ isOpen, onClose, onSuccess, card }: InvoiceModalProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  // Fallback to 0 if we don't have used_amount/current_invoice
  const [amount, setAmount] = useState('0');

  const handlePay = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Create a transaction of type 'expense' for this payment
      const { error: txError } = await supabase.from('transactions').insert({
        user_id: user.id,
        amount: parseFloat(amount),
        description: `Pagamento Fatura: ${card.name}`,
        date: new Date().toISOString().split('T')[0],
        type: 'expense',
        category_id: null,
        tags: ['Fatura']
      });

      if (txError) throw txError;

      // Note: We don't update current_invoice here because the column doesn't exist.
      // The "invoice" value should be calculated by summing transactions in the future.

      toast.success('Pagamento de fatura registrado!');
      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm apple-glass rounded-[2rem] p-8 shadow-2xl animate-scale-in text-center" onClick={e => e.stopPropagation()}>
        <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center text-white mx-auto mb-6 shadow-xl">
           <CheckCircle size={40} />
        </div>
        
        <h3 className="text-2xl font-black mb-2" style={{ color: 'var(--text)' }}>Registrar Pagamento</h3>
        <p className="text-sm opacity-50 mb-8">Deseja registrar o pagamento da fatura de {card.name}?</p>

        <div className="space-y-4 mb-8">
           <p className="text-[10px] font-bold uppercase opacity-50 mb-1">Valor do Pagamento</p>
           <input 
              type="number" 
              value={amount} 
              onChange={e => setAmount(e.target.value)}
              className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/5 outline-none text-2xl font-black text-center" 
              style={{ color: 'var(--text)' }}
           />
        </div>

        <div className="space-y-3">
          <button onClick={handlePay} disabled={loading} className="w-full py-5 rounded-[2rem] font-black text-white gradient-primary shadow-xl active:scale-95 transition-all">
            {loading ? 'Processando...' : 'Confirmar Pagamento'}
          </button>
          <button onClick={onClose} className="w-full py-4 text-sm font-bold opacity-50 hover:opacity-100 transition-all">Cancelar</button>
        </div>
      </div>
    </div>
  );
}
