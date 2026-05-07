'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  eachDayOfInterval 
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  ChevronLeft, 
  ChevronRight, 
  ArrowUpRight, 
  ArrowDownRight,
  Plus,
  Calendar as CalendarIcon
} from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import type { Transaction } from '@/types';
import TransactionModal from '@/components/modals/TransactionModal';

export default function CalendarioPage() {
  const supabase = createClient();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date | null>(new Date());

  const loadData = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const start = startOfMonth(currentMonth).toISOString().split('T')[0];
    const end = endOfMonth(currentMonth).toISOString().split('T')[0];

    const { data } = await supabase
      .from('transactions')
      .select('*, category:categories(*)')
      .eq('user_id', user.id)
      .gte('date', start)
      .lte('date', end);

    setTransactions(data || []);
    setLoading(false);
  }, [supabase, currentMonth]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth)),
    end: endOfWeek(endOfMonth(currentMonth)),
  });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const getDayTransactions = (day: Date) => {
    return transactions.filter(t => isSameDay(new Date(t.date), day));
  };

  const dayTxns = selectedDay ? getDayTransactions(selectedDay) : [];

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>Calendário Financeiro</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Visualize seus compromissos e recebimentos no tempo</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-[var(--surface)] rounded-2xl border border-[var(--border)] overflow-hidden">
            <button onClick={prevMonth} className="p-3 hover:bg-[var(--surface-hover)] transition-all border-r border-[var(--border)]"><ChevronLeft size={20}/></button>
            <div className="px-6 py-3 flex items-center font-bold text-sm min-w-[160px] justify-center uppercase tracking-widest">
              {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
            </div>
            <button onClick={nextMonth} className="p-3 hover:bg-[var(--surface-hover)] transition-all border-l border-[var(--border)]"><ChevronRight size={20}/></button>
          </div>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-white gradient-primary shadow-xl hover:scale-105 active:scale-95 transition-all">
            <Plus size={20} /> Novo Lançamento
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Calendar Grid */}
        <div className="lg:col-span-8 apple-glass p-8 rounded-[2.5rem] border border-[var(--border)] shadow-xl overflow-hidden">
          <div className="grid grid-cols-7 mb-4">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'].map(d => (
              <div key={d} className="text-center text-[10px] font-black uppercase tracking-widest text-gray-400 py-4">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-px bg-[var(--border)] border border-[var(--border)] rounded-2xl overflow-hidden">
            {days.map((day, i) => {
              const dayTxns = getDayTransactions(day);
              const income = dayTxns.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
              const expense = dayTxns.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
              const isSelected = selectedDay && isSameDay(day, selectedDay);
              const isToday = isSameDay(day, new Date());
              const isCurrentMonth = isSameMonth(day, currentMonth);

              return (
                <div 
                  key={day.toString()} 
                  onClick={() => setSelectedDay(day)}
                  className={cn(
                    "min-h-[100px] p-2 transition-all cursor-pointer relative",
                    isCurrentMonth ? "bg-[var(--surface)]" : "bg-[var(--bg-secondary)] opacity-40",
                    isSelected ? "z-10 ring-2 ring-[var(--primary)] shadow-2xl" : "hover:bg-[var(--surface-hover)]"
                  )}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={cn(
                      "text-xs font-bold w-6 h-6 flex items-center justify-center rounded-lg",
                      isToday ? "bg-[var(--primary)] text-white" : isSelected ? "text-[var(--primary)]" : "text-[var(--text-secondary)]"
                    )}>
                      {format(day, 'd')}
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    {income > 0 && <div className="text-[9px] font-black text-emerald-500 tabular-nums">+{formatCurrency(income).replace('R$', '')}</div>}
                    {expense > 0 && <div className="text-[9px] font-black text-rose-500 tabular-nums">-{formatCurrency(expense).replace('R$', '')}</div>}
                  </div>

                  {dayTxns.length > 3 && (
                    <div className="absolute bottom-1 right-2 text-[8px] font-bold opacity-30">
                      +{dayTxns.length - 3} itens
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Details */}
        <div className="lg:col-span-4 space-y-6">
          <div className="apple-glass p-8 rounded-[2.5rem] border border-[var(--border)] shadow-xl sticky top-8">
            <h3 className="text-xl font-black mb-6 flex items-center gap-3" style={{ color: 'var(--text)' }}>
              <div className="w-10 h-10 rounded-2xl gradient-primary flex items-center justify-center text-white">
                <CalendarIcon size={20} />
              </div>
              {selectedDay ? format(selectedDay, "dd 'de' MMMM", { locale: ptBR }) : 'Selecione um dia'}
            </h3>

            <div className="space-y-4">
              {dayTxns.length === 0 ? (
                <div className="py-10 text-center opacity-30 italic text-sm">
                  Nenhuma transação registrada para este dia.
                </div>
              ) : (
                dayTxns.map(t => (
                  <div key={t.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all group">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center",
                        t.type === 'income' ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                      )}>
                        {t.type === 'income' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                      </div>
                      <div>
                        <p className="text-sm font-bold truncate max-w-[120px]" style={{ color: 'var(--text)' }}>{t.description || t.category?.name}</p>
                        <p className="text-[9px] font-bold opacity-30 uppercase">{t.category?.name}</p>
                      </div>
                    </div>
                    <span className={cn("text-sm font-black", t.type === 'income' ? "text-emerald-500" : "text-rose-500")}>
                      {t.type === 'income' ? '+' : '-'}{formatCurrency(Number(t.amount))}
                    </span>
                  </div>
                ))
              )}
            </div>

            {dayTxns.length > 0 && (
              <div className="mt-8 pt-6 border-t border-white/5 grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">Total Dia</p>
                  <p className="text-lg font-black" style={{ color: 'var(--text)' }}>
                    {formatCurrency(dayTxns.reduce((s, t) => s + (t.type === 'income' ? Number(t.amount) : -Number(t.amount)), 0))}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">Itens</p>
                  <p className="text-lg font-black" style={{ color: 'var(--text)' }}>{dayTxns.length}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <TransactionModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        onSuccess={loadData} 
      />
    </div>
  );
}
