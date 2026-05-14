'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
  Plus, 
  Trash2, 
  Pencil, 
  CreditCard as CardIcon, 
  ChevronRight, 
  ArrowRight,
  TrendingDown,
  Calendar,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import type { CreditCard, Transaction } from '@/types';
import CreditCardVisual from '@/components/CreditCardVisual';
import CardModal from '@/components/modals/CardModal';
import InvoiceModal from '@/components/modals/InvoiceModal';
import ConfirmModal from '@/components/modals/ConfirmModal';
import toast from 'react-hot-toast';

export default function CartoesPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [selectedCard, setSelectedCard] = useState<CreditCard | null>(null);
  const [cardTransactions, setCardTransactions] = useState<Transaction[]>([]);
  const [showCardModal, setShowCardModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingCard, setEditingCard] = useState<CreditCard | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from('credit_cards')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true);

    setCards(data || []);
    if (data?.length && !selectedCard) setSelectedCard(data[0]);
    setLoading(false);
  }, [supabase, selectedCard]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (selectedCard) {
      loadCardTransactions(selectedCard.id);
    }
  }, [selectedCard]);

  const loadCardTransactions = async (cardId: string) => {
    const { data } = await supabase
      .from('transactions')
      .select('*, category:categories(*)')
      .eq('card_id', cardId)
      .order('date', { ascending: false })
      .limit(10);
    
    setCardTransactions(data || []);
  };

  const handlePayInvoice = () => {
    setShowInvoiceModal(true);
  };

  const handleDeleteCard = async () => {
    if (!selectedCard) return;

    try {
      // 1. Deletar transações vinculadas
      const { error: transError } = await supabase
        .from('transactions')
        .delete()
        .eq('card_id', selectedCard.id);

      if (transError) throw transError;

      // 2. Desativar o cartão
      const { error: cardError } = await supabase
        .from('credit_cards')
        .update({ is_active: false })
        .eq('id', selectedCard.id);

      if (cardError) throw cardError;
      
      toast.success('Cartão e movimentações excluídos!');
      setSelectedCard(null);
      loadData();
    } catch (e: any) {
      toast.error('Erro ao excluir: ' + e.message);
    }
  };

  if (!isMounted) {
    return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin opacity-20" /></div>;
  }

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>Minha Carteira</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Gerencie seus limites e faturas com precisão</p>
        </div>
        <button 
          onClick={() => { setEditingCard(null); setShowCardModal(true); }}
          className="flex items-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-white gradient-primary shadow-xl hover:scale-105 active:scale-95 transition-all"
        >
          <Plus size={20} /> Novo Cartão
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Cards List (Wallet Style) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
            {loading ? (
              Array.from({ length: 2 }).map((_, i) => <div key={i} className="aspect-[1.586/1] skeleton rounded-3xl max-w-[360px]" />)
            ) : cards.length === 0 ? (
              <div className="aspect-[1.586/1] rounded-[2.5rem] border-2 border-dashed border-[var(--border)] flex flex-col items-center justify-center p-8 text-center">
                <CardIcon size={48} className="opacity-10 mb-4" />
                <p className="text-sm opacity-50">Você ainda não possui cartões cadastrados.</p>
              </div>
            ) : (
              cards.map((card) => (
                <div 
                  key={card.id} 
                  onClick={() => setSelectedCard(card)}
                  className={cn(
                    "transition-all cursor-pointer relative max-w-[360px] mx-auto lg:mx-0",
                    selectedCard?.id === card.id 
                      ? "scale-100 opacity-100 ring-2 ring-[var(--primary)] ring-offset-4 ring-offset-[var(--bg)] rounded-[2rem] shadow-2xl" 
                      : "scale-95 opacity-50 hover:opacity-100"
                  )}
                >
                  <CreditCardVisual 
                    name={card.name} 
                    lastDigits={'****'} 
                    limit={Number(card.credit_limit)} 
                    used={0}
                    color={card.color}
                    bank={card.bank as any}
                  />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Card Details & Invoice */}
        <div className="lg:col-span-8 space-y-8">
          {selectedCard ? (
            <div className="apple-glass p-8 rounded-[2.5rem] border border-[var(--border)] shadow-xl animate-scale-in">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h3 className="text-2xl font-black" style={{ color: 'var(--text)' }}>{selectedCard.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">Cartão Ativo</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setEditingCard(selectedCard); setShowCardModal(true); }} className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-all" style={{ color: 'var(--text)' }}><Pencil size={18} /></button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteConfirm(true);
                    }}
                    className="p-3 rounded-2xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-10">
                <div className="p-6 rounded-[2rem] bg-white/5 border border-white/5">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Limite Total</p>
                  <h4 className="text-2xl font-black text-emerald-500">{formatCurrency(Number(selectedCard.credit_limit))}</h4>
                </div>
                <div className="p-6 rounded-[2rem] bg-white/5 border border-white/5">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Dia de Fechamento</p>
                  <h4 className="text-2xl font-black" style={{ color: 'var(--text)' }}>Dia {selectedCard.closing_day}</h4>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-lg" style={{ color: 'var(--text)' }}>Lançamentos Recentes</h4>
                  <button className="text-xs font-bold text-[var(--primary)] hover:underline flex items-center gap-1">Ver todos <ChevronRight size={14}/></button>
                </div>
                
                <div className="space-y-4">
                  {cardTransactions.length === 0 ? (
                    <p className="text-sm opacity-40 text-center py-4 italic">Nenhum lançamento neste cartão.</p>
                  ) : (
                    cardTransactions.map(t => (
                      <div key={t.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all group">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-rose-500/10 text-rose-500 group-hover:scale-110 transition-all">
                            <TrendingDown size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>{t.description || t.category?.name}</p>
                            <p className="text-[10px] font-bold opacity-30 uppercase tracking-widest">{t.category?.name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-rose-500">-{formatCurrency(Number(t.amount))}</p>
                          <p className="text-[10px] opacity-30 font-bold tabular-nums">{new Date(t.date).toLocaleDateString('pt-BR')}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <button 
                onClick={handlePayInvoice}
                className="w-full mt-10 py-5 rounded-[2rem] font-black text-white gradient-primary shadow-2xl hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-xl tracking-tight"
              >
                Pagar Fatura
              </button>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-center p-12 opacity-30 italic">
              Selecione um cartão para ver os detalhes
            </div>
          )}
        </div>
      </div>

      <CardModal 
        isOpen={showCardModal} 
        onClose={() => setShowCardModal(false)} 
        onSuccess={loadData} 
        card={editingCard}
      />
      
      {selectedCard && (
        <InvoiceModal 
          isOpen={showInvoiceModal} 
          onClose={() => setShowInvoiceModal(false)} 
          onSuccess={loadData} 
          card={selectedCard}
        />
      )}

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteCard}
        title="Excluir Cartão?"
        message="ATENÇÃO: Isso excluirá o cartão e TODAS as despesas vinculadas a ele. Esta ação não pode ser desfeita. Deseja continuar?"
        confirmText="Sim, excluir tudo"
        cancelText="Não, cancelar"
      />
    </div>
  );
}
