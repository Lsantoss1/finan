'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Zap, AlertCircle, TrendingUp, Calendar, Trash2, ArrowUpRight } from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import type { Transaction } from '@/types';
import toast from 'react-hot-toast';

export default function AssinaturasPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState<Transaction[]>([]);

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('transactions')
      .select('*, category:categories(*)')
      .eq('user_id', user.id)
      .eq('is_recurring', true)
      .eq('type', 'expense');

    setSubscriptions(data || []);
    setLoading(false);
  };

  const totalMonthly = subscriptions.reduce((s, t) => s + Number(t.amount), 0);
  const totalYearly = totalMonthly * 12;

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>Assinaturas & Serviços</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Controle seus gastos recorrentes e evite desperdícios</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20">
            <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest mb-1">Custo Total Anual</p>
            <p className="text-xl font-black text-rose-500">{formatCurrency(totalYearly)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 skeleton rounded-3xl" />)
          ) : subscriptions.length === 0 ? (
            <div className="py-20 text-center rounded-[2.5rem] border-2 border-dashed border-[var(--border)]">
              <Zap size={48} className="mx-auto mb-4 opacity-20" />
              <h3 className="text-lg font-bold" style={{ color: 'var(--text)' }}>Nenhuma assinatura detectada</h3>
              <p className="text-sm opacity-50">Marque suas transações fixas como "recorrentes" para vê-las aqui.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {subscriptions.map((sub) => (
                <div key={sub.id} className="bg-[var(--surface)] p-6 rounded-3xl border border-[var(--border)] hover:shadow-xl transition-all group flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-white"
                      style={{ background: sub.category?.color || 'var(--primary)' }}
                    >
                      <Zap size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold" style={{ color: 'var(--text)' }}>{sub.description}</h4>
                      <p className="text-xs opacity-50 uppercase font-bold tracking-widest">{sub.category?.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black" style={{ color: 'var(--text)' }}>{formatCurrency(Number(sub.amount))}</p>
                    <p className="text-[10px] text-rose-500 font-bold uppercase">{formatCurrency(Number(sub.amount) * 12)} / ano</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-[var(--surface)] p-8 rounded-[2.5rem] border border-[var(--border)] shadow-sm">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <AlertCircle size={20} className="text-amber-500" />
              Insights de Assinaturas
            </h3>
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  Suas assinaturas somam **{formatCurrency(totalMonthly)}** por mês. Isso equivale a **{((totalMonthly / 5000) * 100).toFixed(1)}%** de um salário médio de R$ 5.000.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10">
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  Dica: Revise serviços que você não utiliza há mais de 3 meses. Cancelar apenas uma assinatura de R$ 30 pode economizar R$ 360 por ano.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-[var(--primary)] to-[#8B5CF6] p-8 rounded-[2.5rem] text-white shadow-xl shadow-purple-500/20">
            <TrendingUp size={32} className="mb-4 opacity-50" />
            <h3 className="font-bold text-xl mb-2">Potencial de Investimento</h3>
            <p className="text-sm opacity-90 leading-relaxed">
              Se você investisse os **{formatCurrency(totalMonthly)}** das suas assinaturas mensalmente com rendimento de 1% a.m., em 5 anos você teria aproximadamente:
            </p>
            <p className="text-3xl font-black mt-4">{formatCurrency(totalMonthly * 80)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
