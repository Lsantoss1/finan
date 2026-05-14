'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { COLOR_PALETTE } from '@/lib/constants';
import toast from 'react-hot-toast';
import CreditCardVisual, { BankType } from '../CreditCardVisual';

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
  const [detectedBank, setDetectedBank] = useState<BankType>('generic');

  // Detecção inteligente de banco
  useEffect(() => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('nubank') || lowerName.includes('nu bank') || lowerName.includes('roxinho')) setDetectedBank('nubank');
    else if (lowerName.includes('inter')) setDetectedBank('inter');
    else if (lowerName.includes('itau')) setDetectedBank('itau');
    else if (lowerName.includes('santander')) setDetectedBank('santander');
    else if (lowerName.includes('c6')) setDetectedBank('c6');
    else if (lowerName.includes('bradesco')) setDetectedBank('bradesco');
    else if (lowerName.includes('brasil') || lowerName.includes(' bance do brasil') || lowerName.includes(' bb')) setDetectedBank('bb');
    else if (lowerName.includes('neon')) setDetectedBank('neon');
    else setDetectedBank('generic');
  }, [name]);

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
      
      <div className="relative w-full max-w-2xl apple-glass rounded-[3rem] p-8 shadow-2xl animate-scale-in flex flex-col md:flex-row gap-8 overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Glow Effects */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-[var(--primary)] opacity-10 blur-[100px]" />
        
        {/* Left: Card Preview */}
        <div className="flex-1 space-y-6">
          <div className="flex justify-between items-center md:hidden mb-4">
            <h3 className="text-xl font-black" style={{ color: 'var(--text)' }}>Novo Cartão</h3>
            <button onClick={onClose} className="p-2 rounded-xl bg-white/5"><X size={20} /></button>
          </div>
          
          <div className="perspective-1000">
            <CreditCardVisual 
              name={name || 'Nome do Cartão'} 
              lastDigits="0000" 
              limit={parseFloat(limit) || 5000} 
              used={0} 
              color={color}
              bank={detectedBank}
            />
          </div>

          <div className="hidden md:block apple-glass p-6 rounded-3xl border border-white/5">
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-2">Dica Pro</p>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Digite o nome do seu banco (ex: "Nubank") para aplicar automaticamente o design oficial do cartão.
            </p>
          </div>
        </div>

        {/* Right: Form */}
        <div className="flex-1 space-y-6">
          <div className="hidden md:flex justify-between items-center">
            <h3 className="text-2xl font-black" style={{ color: 'var(--text)' }}>{card ? 'Editar Cartão' : 'Novo Cartão'}</h3>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 opacity-50 transition-all"><X size={24} /></button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase opacity-50 ml-2">Identificação</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Nome do Cartão (ex: Nubank)" className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/5 outline-none text-sm font-bold transition-all focus:border-[var(--primary)]" style={{ color: 'var(--text)' }} required />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase opacity-50 ml-2">Limite</label>
              <input type="number" value={limit} onChange={e => setLimit(e.target.value)} placeholder="Limite Total" className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/5 outline-none text-sm font-bold transition-all focus:border-[var(--primary)]" style={{ color: 'var(--text)' }} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase opacity-50 ml-2">Fechamento</label>
                  <input type="number" min="1" max="31" value={closingDay} onChange={e => setClosingDay(e.target.value)} className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/5 outline-none text-sm font-bold transition-all focus:border-[var(--primary)]" style={{ color: 'var(--text)' }} />
               </div>
               <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase opacity-50 ml-2">Vencimento</label>
                  <input type="number" min="1" max="31" value={dueDay} onChange={e => setDueDay(e.target.value)} className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/5 outline-none text-sm font-bold transition-all focus:border-[var(--primary)]" style={{ color: 'var(--text)' }} />
               </div>
            </div>

            {detectedBank === 'generic' && (
              <div className="space-y-2 animate-fade-in">
                <label className="text-[10px] font-bold uppercase opacity-50 ml-2">Cor Personalizada</label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_PALETTE.map(c => (
                    <button key={c} type="button" onClick={() => setColor(c)} className={cn("w-7 h-7 rounded-full border-2 transition-all", color === c ? "border-white scale-110 shadow-lg" : "border-transparent opacity-40 hover:opacity-100")} style={{ background: c }} />
                  ))}
                </div>
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full mt-4 py-5 rounded-[2rem] font-black text-white gradient-primary shadow-xl active:scale-[0.98] transition-all disabled:opacity-50">
              {loading ? 'Salvando...' : 'Salvar Cartão'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
