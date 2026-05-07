'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { X, CreditCard as CardIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { COLOR_PALETTE } from '@/lib/constants';
import toast from 'react-hot-toast';

interface CardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  card?: any;
}

export default function CardModal({ isOpen, onClose, onSuccess, card }: CardModalProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [limit, setLimit] = useState('');
  const [closingDay, setClosingDay] = useState('10');
  const [dueDay, setDueDay] = useState('17');
  const [color, setColor] = useState('#6c3ce0');

  useEffect(() => {
    if (isOpen) {
      if (card) {
        setName(card.name);
        setLimit(card.credit_limit.toString());
        setClosingDay(card.closing_day.toString());
        setDueDay(card.due_day.toString());
        setColor(card.color);
      } else {
        setName('');
        setLimit('');
        setClosingDay('10');
        setDueDay('17');
        setColor('#6c3ce0');
      }
    }
  }, [isOpen, card]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const cardData = {
        user_id: user.id,
        name,
        credit_limit: parseFloat(limit),
        closing_day: parseInt(closingDay),
        due_day: parseInt(dueDay),
        color,
        is_active: true
      };

      let error;
      if (card) {
        ({ error } = await supabase.from('credit_cards').update(cardData).eq('id', card.id));
      } else {
        ({ error } = await supabase.from('credit_cards').insert(cardData));
      }

      if (error) throw error;
      toast.success(card ? 'Cartão atualizado!' : 'Cartão cadastrado!');
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
      <div className="relative w-full max-w-md apple-glass rounded-[2rem] p-8 shadow-2xl animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-black" style={{ color: 'var(--text)' }}>{card ? 'Editar Cartão' : 'Novo Cartão'}</h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 opacity-50"><X size={24} /></button>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-4">
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Nome do Cartão (ex: Nubank)" className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/5 outline-none text-sm font-bold" style={{ color: 'var(--text)' }} required />
            <input type="number" value={limit} onChange={e => setLimit(e.target.value)} placeholder="Limite Total" className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/5 outline-none text-sm font-bold" style={{ color: 'var(--text)' }} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase opacity-50 ml-2">Fechamento</label>
                <input type="number" min="1" max="31" value={closingDay} onChange={e => setClosingDay(e.target.value)} className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/5 outline-none text-sm font-bold" style={{ color: 'var(--text)' }} />
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase opacity-50 ml-2">Vencimento</label>
                <input type="number" min="1" max="31" value={dueDay} onChange={e => setDueDay(e.target.value)} className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/5 outline-none text-sm font-bold" style={{ color: 'var(--text)' }} />
             </div>
          </div>

          <div className="space-y-3">
             <label className="text-[10px] font-bold uppercase opacity-50 ml-2">Cor do Cartão</label>
             <div className="flex flex-wrap gap-2">
                {COLOR_PALETTE.map(c => (
                  <button key={c} type="button" onClick={() => setColor(c)} className={cn("w-8 h-8 rounded-full border-2 transition-all", color === c ? "border-white scale-125" : "border-transparent opacity-50")} style={{ background: c }} />
                ))}
             </div>
          </div>

          <button type="submit" disabled={loading} className="w-full py-5 rounded-[2rem] font-black text-white gradient-primary shadow-xl active:scale-95 transition-all">{loading ? 'Salvando...' : 'Salvar Cartão'}</button>
        </form>
      </div>
    </div>
  );
}
