'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownRight, 
  Plus, 
  Calendar, 
  Zap, 
  ShoppingBag,
  Wallet,
  AlertCircle
} from 'lucide-react';
import { formatCurrency, cn, getMonthRange } from '@/lib/utils';
import type { Transaction } from '@/types';
import TransactionModal from '@/components/modals/TransactionModal';

export default function PlanejamentoPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'fixos' | 'variaveis'>('fixos');

  const loadData = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { start, end } = getMonthRange();

    const { data } = await supabase
      .from('transactions')
      .select('*, category:categories(*)')
      .eq('user_id', user.id)
      .gte('date', start)
      .lte('date', end)
      .order('date', { ascending: false });

    setTransactions(data || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const fixedTxns = transactions.filter(t => t.is_recurring);
  const variableTxns = transactions.filter(t => !t.is_recurring);

  const fixedIncome = fixedTxns.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
  const fixedExpense = fixedTxns.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
  
  const variableIncome = variableTxns.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
  const variableExpense = variableTxns.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);

  const remainingAfterFixed = fixedIncome - fixedExpense;

  const currentDisplayTxns = activeTab === 'fixos' ? fixedTxns : variableTxns;

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>Planejamento Financeiro</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Organize seu fluxo de caixa entre fixo e variável</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-white gradient-primary shadow-xl hover:scale-105 active:scale-95 transition-all"
        >
          <Plus size={20} /> Novo Planejamento
        </button>
      </div>

      {/* Strategy Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="apple-glass p-8 rounded-[2.5rem] border border-[var(--border)]">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Receita Fixa Total</p>
          <h3 className="text-2xl font-black text-emerald-500">{formatCurrency(fixedIncome)}</h3>
          <p className="text-[10px] mt-2 opacity-50 italic">Garantido no mês</p>
        </div>
        <div className="apple-glass p-8 rounded-[2.5rem] border border-[var(--border)]">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Despesa Fixa Total</p>
          <h3 className="text-2xl font-black text-rose-500">{formatCurrency(fixedExpense)}</h3>
          <p className="text-[10px] mt-2 opacity-50 italic">Comprometido</p>
        </div>
        <div className="bg-gradient-to-br from-[#6c3ce0] to-[#8b5cf6] p-8 rounded-[2.5rem] text-white shadow-xl shadow-purple-500/20">
          <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest mb-1">Sobrevivência (Livre)</p>
          <h3 className="text-3xl font-black">{formatCurrency(remainingAfterFixed)}</h3>
          <p className="text-[10px] mt-2 opacity-80 italic">O que sobra após os fixos</p>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex p-1.5 rounded-2xl border max-w-md mx-auto" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <button 
          onClick={() => setActiveTab('fixos')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all",
            activeTab === 'fixos' ? "bg-[var(--primary)] text-white shadow-lg" : "text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]"
          )}
        >
          <Zap size={14} /> Fluxo Fixo
        </button>
        <button 
          onClick={() => setActiveTab('variaveis')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all",
            activeTab === 'variaveis' ? "bg-[var(--primary)] text-white shadow-lg" : "text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]"
          )}
        >
          <ShoppingBag size={14} /> Gastos Variáveis
        </button>
      </div>

      {/* Transactions List Table */}
      <div className="apple-glass rounded-[2.5rem] overflow-hidden border border-[var(--border)] shadow-sm">
        <div className="p-8 border-b border-[var(--border)] flex items-center justify-between">
          <h3 className="font-bold text-lg" style={{ color: 'var(--text)' }}>
            {activeTab === 'fixos' ? 'Compromissos Recorrentes' : 'Gastos do Dia a Dia'}
          </h3>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--primary-bg)]">
            <span className="text-[10px] font-bold text-[var(--primary)] uppercase">
              {currentDisplayTxns.length} itens
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[var(--bg-secondary)]/50">
                <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Descrição</th>
                <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Categoria</th>
                <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Data</th>
                <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={4} className="px-8 py-6"><div className="h-4 bg-gray-200/10 rounded w-full" /></td>
                  </tr>
                ))
              ) : currentDisplayTxns.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center">
                    <AlertCircle className="mx-auto mb-4 opacity-20" size={48} />
                    <p className="text-sm opacity-50">Nenhum registro nesta categoria.</p>
                  </td>
                </tr>
              ) : (
                currentDisplayTxns.map((t) => (
                  <tr key={t.id} className="hover:bg-white/5 transition-colors cursor-pointer group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center",
                          t.type === 'income' ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                        )}>
                          {t.type === 'income' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                        </div>
                        <span className="font-bold text-sm" style={{ color: 'var(--text)' }}>{t.description}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider" style={{ background: `${t.category?.color}15`, color: t.category?.color }}>
                        {t.category?.name || 'Geral'}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-sm opacity-50 tabular-nums">
                      {new Date(t.date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <span className={cn(
                        "font-black text-sm tabular-nums",
                        t.type === 'income' ? "text-emerald-500" : "text-rose-500"
                      )}>
                        {t.type === 'income' ? '+' : '-'}{formatCurrency(Number(t.amount))}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <TransactionModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        onSuccess={() => { loadData(); setShowModal(false); }} 
      />
    </div>
  );
}
