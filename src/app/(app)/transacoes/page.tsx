'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency, cn, formatDateShort } from '@/lib/utils';
import { startOfMonth, endOfMonth, format, parseISO } from 'date-fns';
import { Search, Filter, ArrowUpRight, ArrowDownRight, ArrowLeftRight, MoreVertical, Trash2, Pencil, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import MonthSelector from '@/components/MonthSelector';
import TransactionModal from '@/components/modals/TransactionModal';
import DeleteConfirmModal from '@/components/modals/DeleteConfirmModal';
import VariableConfirmModal from '@/components/modals/VariableConfirmModal';
import type { Transaction, Category, Account } from '@/types';
import toast from 'react-hot-toast';

export default function TransacoesPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense' | 'transfer'>('all');
  const [cards, setCards] = useState<any[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string>('');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingTransactionId, setDeletingTransactionId] = useState<string | null>(null);
  const [variableConfirmTransaction, setVariableConfirmTransaction] = useState<Transaction | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const start = format(startOfMonth(currentDate), 'yyyy-MM-dd');
    const end = format(endOfMonth(currentDate), 'yyyy-MM-dd');

    let query = supabase
      .from('transactions')
      .select('*, category:categories(*), account:accounts!account_id(*)')
      .eq('user_id', user.id)
      .gte('date', start)
      .lte('date', end)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });

    if (filterType !== 'all') {
      query = query.eq('type', filterType);
    }

    if (selectedCardId) {
      query = query.eq('card_id', selectedCardId);
    }

    if (search) {
      query = query.ilike('description', `%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao carregar transações:', error);
      toast.error('Erro ao carregar transações: ' + error.message);
    } else {
      setTransactions(data || []);
    }
    setLoading(false);
  }, [currentDate, filterType, search, selectedCardId, supabase]);

  const loadCards = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from('credit_cards').select('id, name').eq('user_id', user.id);
      setCards(data || []);
    }
  }, [supabase]);

  useEffect(() => {
    loadTransactions();
    loadCards();
    
    // Listen for new transactions added via FAB
    const handleRefresh = () => loadTransactions();
    window.addEventListener('transaction-added', handleRefresh);
    return () => window.removeEventListener('transaction-added', handleRefresh);
  }, [loadTransactions]);

  const handleDelete = async () => {
    if (!deletingTransactionId) return;
    
    setDeleteLoading(true);
    const { error } = await supabase.from('transactions').delete().eq('id', deletingTransactionId);
    if (error) {
      toast.error('Erro ao excluir');
    } else {
      toast.success('Excluída com sucesso');
      setDeletingTransactionId(null);
      loadTransactions();
    }
    setDeleteLoading(false);
  };

  // Group transactions by date
  const groupedTransactions = transactions.reduce((groups, transaction) => {
    const date = transaction.date;
    if (!groups[date]) groups[date] = [];
    groups[date].push(transaction);
    return groups;
  }, {} as Record<string, Transaction[]>);

  const monthSummary = transactions.reduce((acc, t) => {
    const amount = Number(t.amount);
    if (t.type === 'income') acc.income += amount;
    else if (t.type === 'expense') acc.expense += amount;
    return acc;
  }, { income: 0, expense: 0 });

  if (!isMounted) {
    return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin opacity-20" /></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Month Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Transações</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Gerencie seu fluxo de caixa</p>
        </div>
        <div className="w-full md:w-auto min-w-[240px]">
          <MonthSelector currentDate={currentDate} onChange={setCurrentDate} />
        </div>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Receitas</span>
          <p className="text-xl font-bold mt-1" style={{ color: 'var(--success)' }}>{formatCurrency(monthSummary.income)}</p>
        </div>
        <div className="p-4 rounded-2xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Despesas</span>
          <p className="text-xl font-bold mt-1" style={{ color: 'var(--danger)' }}>{formatCurrency(monthSummary.expense)}</p>
        </div>
        <div className="p-4 rounded-2xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Balanço</span>
          <p className="text-xl font-bold mt-1" style={{ color: 'var(--text)' }}>{formatCurrency(monthSummary.income - monthSummary.expense)}</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input 
            type="text"
            placeholder="Buscar por descrição..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl text-sm transition-all border outline-none"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}
          />
        </div>
        
        <select
          value={selectedCardId}
          onChange={e => setSelectedCardId(e.target.value)}
          className="w-full sm:w-48 px-4 py-2.5 rounded-xl text-sm transition-all border outline-none"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}
        >
          <option value="">Todos os Cartões</option>
          {cards.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {(['all', 'income', 'expense', 'transfer'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border",
                filterType === t 
                  ? "bg-[var(--primary)] border-[var(--primary)] text-white shadow-md" 
                  : "bg-[var(--surface)] border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]"
              )}
            >
              {t === 'all' ? 'Tudo' : t === 'income' ? 'Receitas' : t === 'expense' ? 'Despesas' : 'Transf.'}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-6">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-20 skeleton rounded-2xl" />)}
          </div>
        ) : Object.keys(groupedTransactions).length === 0 ? (
          <div className="py-20 text-center rounded-3xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <CalendarIcon size={48} className="mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-bold" style={{ color: 'var(--text)' }}>Nenhuma transação</h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Nenhum registro encontrado para este período.</p>
          </div>
        ) : (
          Object.entries(groupedTransactions).map(([date, txs]) => (
            <div key={date} className="space-y-2">
              <div className="flex items-center justify-between px-2">
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                  {formatDateShort(date)}
                </span>
                <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                  {txs.length} {txs.length === 1 ? 'item' : 'itens'}
                </span>
              </div>
              
              <div className="rounded-3xl overflow-hidden shadow-sm border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                {txs.map((t, idx) => {
                  const cat = t.category as Category | undefined;
                  const acc = t.account as Account | undefined;
                  return (
                    <div 
                      key={t.id} 
                      className={cn(
                        "flex items-center justify-between p-4 hover:bg-[var(--surface-hover)] transition-colors group",
                        idx !== txs.length - 1 && "border-b border-[var(--border)]"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                          style={{ background: t.type === 'income' ? 'var(--success-bg)' : t.type === 'expense' ? 'var(--danger-bg)' : 'var(--bg-secondary)' }}
                        >
                          {t.type === 'income' && <ArrowUpRight size={20} style={{ color: 'var(--success)' }} />}
                          {t.type === 'expense' && <ArrowDownRight size={20} style={{ color: 'var(--danger)' }} />}
                          {t.type === 'transfer' && <ArrowLeftRight size={20} style={{ color: 'var(--primary)' }} />}
                        </div>
                        <div>
                          <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>{t.description || cat?.name || 'Sem descrição'}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md" style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                              {acc?.name}
                            </span>
                            {cat && (
                              <span className="text-[10px] font-medium" style={{ color: cat.color }}>
                                • {cat.name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className={cn('text-sm font-bold tabular-nums')} style={{ color: t.type === 'income' ? 'var(--success)' : t.type === 'expense' ? 'var(--danger)' : 'var(--text)' }}>
                          {t.type === 'income' ? '+' : t.type === 'expense' ? '-' : ''} {formatCurrency(Number(t.amount))}
                        </span>
                        
                        <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              if (t.is_recurring && t.tags?.includes('_is_variable')) {
                                setVariableConfirmTransaction(t);
                              } else {
                                setEditingTransaction(t);
                              }
                            }}
                            className="p-2 rounded-lg hover:bg-blue-50 text-blue-400 hover:text-blue-600 transition-colors"
                            title="Editar"
                          >
                            <Pencil size={16} />
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingTransactionId(t.id);
                            }}
                            className="p-2 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors"
                            title="Excluir"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {editingTransaction && (
        <TransactionModal
          isOpen={!!editingTransaction}
          onClose={() => setEditingTransaction(null)}
          onSuccess={loadTransactions}
          transactionToEdit={editingTransaction}
        />
      )}

      <DeleteConfirmModal 
        isOpen={!!deletingTransactionId}
        onClose={() => setDeletingTransactionId(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Excluir Transação"
        description="Deseja realmente excluir esta transação? Este valor será estornado do seu saldo."
      />

      <VariableConfirmModal
        isOpen={!!variableConfirmTransaction}
        transaction={variableConfirmTransaction}
        onClose={() => setVariableConfirmTransaction(null)}
        onEditBaseValue={() => {
          setEditingTransaction(variableConfirmTransaction);
          setVariableConfirmTransaction(null);
        }}
        onConfirmCurrentMonth={async (actualAmount) => {
          if (!variableConfirmTransaction) return;
          const t = variableConfirmTransaction;
          
          try {
            // 1. Inserir cópia para este mês
            const { error: insertError } = await supabase.from('transactions').insert({
              user_id: t.user_id,
              amount: actualAmount,
              description: t.description,
              date: t.date,
              type: t.type,
              account_id: t.account_id,
              card_id: t.card_id,
              category_id: t.category_id,
              transfer_to_account_id: t.transfer_to_account_id,
              tags: (t.tags || []).filter(tag => tag !== '_is_variable'),
              is_recurring: false // A cópia não é recorrente
            });
            
            if (insertError) throw insertError;
            
            // 2. Empurrar a data da original para o próximo mês
            const nextMonthDate = new Date(t.date);
            nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
            
            const { error: updateError } = await supabase.from('transactions')
              .update({ date: nextMonthDate.toISOString().split('T')[0] })
              .eq('id', t.id);
              
            if (updateError) throw updateError;
            
            toast.success('Mês confirmado com sucesso!');
            setVariableConfirmTransaction(null);
            loadTransactions();
          } catch (error: any) {
            toast.error('Erro ao confirmar: ' + error.message);
          }
        }}
      />
    </div>
  );
}
