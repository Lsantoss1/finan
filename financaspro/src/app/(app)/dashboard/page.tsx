'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency, getMonthRange, cn } from '@/lib/utils';
import { MONTHS_SHORT } from '@/lib/constants';
import { Wallet, TrendingUp, TrendingDown, PiggyBank, Plus, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import type { Transaction, Account, Category, Goal } from '@/types';
import Link from 'next/link';

interface SummaryCard {
  title: string; value: number; change: number; icon: React.ElementType; color: string; bgClass: string;
}

export default function DashboardPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);

  useEffect(() => {
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { start, end } = getMonthRange();

    const [accs, txns, cats, gls] = await Promise.all([
      supabase.from('accounts').select('*').eq('user_id', user.id).eq('is_active', true),
      supabase.from('transactions').select('*, category:categories(*)').eq('user_id', user.id).gte('date', start).lte('date', end).order('date', { ascending: false }),
      supabase.from('categories').select('*').eq('user_id', user.id),
      supabase.from('goals').select('*').eq('user_id', user.id).eq('status', 'active'),
    ]);

    setAccounts(accs.data || []);
    setTransactions(txns.data || []);
    setCategories(cats.data || []);
    setGoals(gls.data || []);
    setLoading(false);
  };

  // Calculations
  const totalBalance = accounts.reduce((sum, a) => sum + Number(a.initial_balance), 0)
    + transactions.reduce((sum, t) => sum + (t.type === 'income' ? Number(t.amount) : -Number(t.amount)), 0);
  const monthIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
  const monthExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
  const monthSavings = monthIncome - monthExpense;

  const summaryCards: SummaryCard[] = [
    { title: 'Saldo Total', value: totalBalance, change: 0, icon: Wallet, color: '#6C3CE0', bgClass: 'gradient-primary' },
    { title: 'Receitas', value: monthIncome, change: 0, icon: TrendingUp, color: '#22C55E', bgClass: 'gradient-success' },
    { title: 'Despesas', value: monthExpense, change: 0, icon: TrendingDown, color: '#EF4444', bgClass: 'gradient-danger' },
    { title: 'Economia', value: monthSavings, change: 0, icon: PiggyBank, color: '#FFB800', bgClass: 'gradient-accent' },
  ];

  // Category spending for pie chart
  const categorySpending = transactions.filter(t => t.type === 'expense').reduce((acc, t) => {
    const cat = t.category as Category | undefined;
    const name = cat?.name || 'Sem categoria';
    const color = cat?.color || '#C0C0C0';
    const existing = acc.find(c => c.name === name);
    if (existing) existing.value += Number(t.amount);
    else acc.push({ name, value: Number(t.amount), color });
    return acc;
  }, [] as { name: string; value: number; color: string }[]).sort((a, b) => b.value - a.value).slice(0, 6);

  // Monthly flow for area chart (mock last 6 months with current month real data)
  const now = new Date();
  const monthlyFlow = Array.from({ length: 6 }, (_, i) => {
    const monthIdx = (now.getMonth() - 5 + i + 12) % 12;
    const isCurrentMonth = i === 5;
    return {
      month: MONTHS_SHORT[monthIdx],
      income: isCurrentMonth ? monthIncome : 0,
      expense: isCurrentMonth ? monthExpense : 0,
    };
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 skeleton rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 skeleton rounded-2xl" />
          <div className="h-80 skeleton rounded-2xl" />
        </div>
      </div>
    );
  }

  const hasData = transactions.length > 0 || accounts.length > 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <div key={card.title} className="rounded-2xl p-5 card-interactive" style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{card.title}</span>
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', card.bgClass)}>
                <card.icon size={20} className="text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold tabular-nums" style={{ color: card.title === 'Despesas' ? 'var(--danger)' : card.title === 'Receitas' ? 'var(--success)' : 'var(--text)' }}>
              {formatCurrency(card.value)}
            </p>
          </div>
        ))}
      </div>

      {!hasData ? (
        /* Empty State */
        <div className="rounded-2xl p-12 text-center" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="w-20 h-20 mx-auto rounded-2xl gradient-primary flex items-center justify-center mb-6">
            <Plus size={32} className="text-white" />
          </div>
          <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text)' }}>Comece adicionando seus dados</h3>
          <p className="mb-8 max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Crie suas contas bancárias e registre suas primeiras transações para ver o dashboard em ação.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/contas" className="px-6 py-3 rounded-xl font-semibold text-white text-sm gradient-primary hover:opacity-90 transition-all" style={{ boxShadow: '0 4px 14px rgba(108, 60, 224, 0.3)' }}>
              Criar primeira conta
            </Link>
            <Link href="/transacoes" className="px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:bg-[var(--surface-hover)]" style={{ border: '1px solid var(--border)', color: 'var(--text)' }}>
              Adicionar transação
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Area Chart - Cash Flow */}
            <div className="rounded-2xl p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
              <h3 className="text-base font-semibold mb-6" style={{ color: 'var(--text)' }}>Fluxo de Caixa</h3>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={monthlyFlow}>
                  <defs>
                    <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22C55E" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#22C55E" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#EF4444" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#EF4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, boxShadow: 'var(--shadow-lg)' }} formatter={(value) => formatCurrency(Number(value))} />
                  <Area type="monotone" dataKey="income" stroke="#22C55E" fill="url(#incomeGrad)" strokeWidth={2} name="Receitas" />
                  <Area type="monotone" dataKey="expense" stroke="#EF4444" fill="url(#expenseGrad)" strokeWidth={2} name="Despesas" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart - Categories */}
            <div className="rounded-2xl p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
              <h3 className="text-base font-semibold mb-6" style={{ color: 'var(--text)' }}>Gastos por Categoria</h3>
              {categorySpending.length > 0 ? (
                <div className="flex items-center gap-6">
                  <ResponsiveContainer width={160} height={160}>
                    <PieChart>
                      <Pie data={categorySpending} dataKey="value" cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3}>
                        {categorySpending.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-2">
                    {categorySpending.map((cat) => (
                      <div key={cat.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ background: cat.color }} />
                          <span style={{ color: 'var(--text-secondary)' }}>{cat.name}</span>
                        </div>
                        <span className="font-medium tabular-nums" style={{ color: 'var(--text)' }}>{formatCurrency(cat.value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-[160px] flex items-center justify-center" style={{ color: 'var(--text-muted)' }}>
                  <p className="text-sm">Sem despesas neste mês</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Transactions & Goals */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Transactions */}
            <div className="rounded-2xl p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold" style={{ color: 'var(--text)' }}>Últimas Transações</h3>
                <Link href="/transacoes" className="text-sm font-medium hover:underline" style={{ color: 'var(--primary)' }}>Ver todas</Link>
              </div>
              <div className="space-y-3">
                {transactions.slice(0, 5).map((t) => {
                  const cat = t.category as Category | undefined;
                  return (
                    <div key={t.id} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: t.type === 'income' ? 'var(--success-bg)' : 'var(--danger-bg)' }}>
                          {t.type === 'income' ? <ArrowUpRight size={18} style={{ color: 'var(--success)' }} /> : <ArrowDownRight size={18} style={{ color: 'var(--danger)' }} />}
                        </div>
                        <div>
                          <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{t.description || cat?.name || 'Transação'}</p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{cat?.name || ''}</p>
                        </div>
                      </div>
                      <span className={cn('text-sm font-semibold tabular-nums')} style={{ color: t.type === 'income' ? 'var(--success)' : 'var(--danger)' }}>
                        {t.type === 'income' ? '+' : '-'}{formatCurrency(Number(t.amount))}
                      </span>
                    </div>
                  );
                })}
                {transactions.length === 0 && (
                  <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>Nenhuma transação este mês</p>
                )}
              </div>
            </div>

            {/* Goals */}
            <div className="rounded-2xl p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold" style={{ color: 'var(--text)' }}>Metas Financeiras</h3>
                <Link href="/metas" className="text-sm font-medium hover:underline" style={{ color: 'var(--primary)' }}>Ver todas</Link>
              </div>
              <div className="space-y-4">
                {goals.slice(0, 4).map((g) => {
                  const pct = Math.min(100, (Number(g.current_amount) / Number(g.target_amount)) * 100);
                  return (
                    <div key={g.id}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>{g.name}</span>
                        <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{pct.toFixed(0)}%</span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: g.color }} />
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatCurrency(Number(g.current_amount))}</span>
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatCurrency(Number(g.target_amount))}</span>
                      </div>
                    </div>
                  );
                })}
                {goals.length === 0 && (
                  <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>Nenhuma meta criada</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
