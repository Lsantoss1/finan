'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency, getMonthRange, cn } from '@/lib/utils';
import { MONTHS_SHORT } from '@/lib/constants';
import toast from 'react-hot-toast';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  ArrowUpRight, 
  ArrowDownRight,
  Target,
  AlertCircle,
  Brain,
  Loader2
} from 'lucide-react';
import IntelligenceWidget from '@/components/IntelligenceWidget';
import { 
  AreaChart, 
  Area, 
  ResponsiveContainer, 
  Tooltip 
} from 'recharts';
import type { Transaction, Account, Goal, Category } from '@/types';

// Mock data for chart - will be replaced by real data in next phase
const CHART_DATA = [
  { name: 'Seg', value: 400 },
  { name: 'Ter', value: 300 },
  { name: 'Qua', value: 600 },
  { name: 'Qui', value: 800 },
  { name: 'Sex', value: 500 },
  { name: 'Sab', value: 900 },
  { name: 'Dom', value: 700 },
];

export default function Dashboard() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total_income: 0, total_expense: 0, balance: 0 });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [subscriptionsTotal, setSubscriptionsTotal] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      const { start, end } = getMonthRange();

      const [statsRes, txnsRes, accountsRes, goalsRes, budgetsRes] = await Promise.all([
        supabase.rpc('get_dashboard_stats', { p_user_id: user.id, p_start_date: start, p_end_date: end }),
        supabase.from('transactions').select('*').eq('user_id', user.id).order('date', { ascending: false }).limit(5),
        supabase.from('accounts').select('*').eq('user_id', user.id).eq('is_active', true),
        supabase.from('goals').select('*').eq('user_id', user.id).limit(3),
        supabase.from('budgets').select('*').eq('user_id', user.id).eq('month', new Date().getMonth() + 1).eq('year', new Date().getFullYear())
      ]);

      if (statsRes.error) console.error('Stats Error:', statsRes.error);

      const dashboardStats = statsRes.data?.[0] || { total_income: 0, total_expense: 0, balance: 0 };
      setStats(dashboardStats);
      setTransactions(txnsRes.data || []);
      setAccounts(accountsRes.data || []);
      setGoals(goalsRes.data || []);
      
      // Calculate projection data
      const currentBalance = dashboardStats.balance;
      const projection = [];
      let runningBalance = currentBalance;

      // Get all transactions for the current month to build the daily chart
      const { data: monthTxns } = await supabase.from('transactions')
        .select('amount, type, date, category_id')
        .eq('user_id', user.id)
        .gte('date', start)
        .lte('date', end)
        .order('date', { ascending: true });

      // Build day-by-day balance
      const today = new Date();
      const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
      
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayTotal = (monthTxns || [])
          .filter(t => t.date === dateStr)
          .reduce((acc, t) => acc + (t.type === 'income' ? Number(t.amount) : -Number(t.amount)), 0);
        
        runningBalance += dayTotal;
        projection.push({
          name: `${day}`,
          value: runningBalance,
          date: dateStr
        });
      }
      setChartData(projection);

      // Calculate subscriptions (is_recurring = true)
      const { data: recurringData } = await supabase.from('transactions').select('amount').eq('user_id', user.id).eq('is_recurring', true).eq('type', 'expense');
      setSubscriptionsTotal(recurringData?.reduce((s, t) => s + Number(t.amount), 0) || 0);

      if (budgetsRes.data) {
        const budgetsWithSpent = budgetsRes.data.map(b => ({
          ...b,
          spent: (monthTxns || []).filter(t => t.category_id === b.category_id).reduce((s, t) => s + Number(t.amount), 0)
        }));
        setBudgets(budgetsWithSpent);
      }
    } catch (error) {
      console.error('Dashboard Load Error:', error);
      toast.error("Erro ao carregar dados do painel");
    } finally {
      setLoading(false);
    }
  }, [supabase, isMounted]);

  useEffect(() => {
    loadData();
    const handleRefresh = () => loadData();
    window.addEventListener('transaction-added', handleRefresh);
    return () => window.removeEventListener('transaction-added', handleRefresh);
  }, [loadData]);

  if (!isMounted) {
    return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin opacity-20" /></div>;
  }

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-20 bg-[var(--surface)] rounded-3xl" />
        <div className="grid grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-[var(--surface)] rounded-3xl" />)}
        </div>
        <div className="grid grid-cols-3 gap-8">
          <div className="col-span-2 h-96 bg-[var(--surface)] rounded-[2.5rem]" />
          <div className="h-96 bg-[var(--surface)] rounded-[2.5rem]" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>Dashboard</h1>
          <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Controle total das suas finanças</p>
        </div>
        <div className="flex items-center gap-2 p-1.5 rounded-2xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          {MONTHS_SHORT.map((m, i) => (
            <button key={m} className={cn("px-3 py-1.5 rounded-xl text-xs font-bold transition-all", i === new Date().getMonth() ? "bg-[var(--primary)] text-white shadow-md" : "text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]")}>{m}</button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Saldo Geral" value={stats.balance} icon={Wallet} color="var(--primary)" />
        <StatCard title="Receitas" value={stats.total_income} icon={TrendingUp} color="var(--success)" />
        <StatCard title="Despesas" value={stats.total_expense} icon={TrendingDown} color="var(--danger)" />
        <StatCard title="Economia" value={stats.total_income - stats.total_expense} icon={PieChart} color="var(--warning)" />
      </div>

      <IntelligenceWidget 
        balance={stats.balance} 
        income={stats.total_income} 
        expense={stats.total_expense} 
        subscriptions={subscriptionsTotal}
        loading={loading}
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main Chart & Accounts */}
        <div className="xl:col-span-2 space-y-8">
          <div className="bg-[var(--surface)] p-8 rounded-[2.5rem] border border-[var(--border)] shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold" style={{ color: 'var(--text)' }}>Fluxo Mensal</h3>
              <div className="flex gap-2">
                 <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--success-bg)]">
                   <div className="w-2 h-2 rounded-full bg-[var(--success)]" />
                   <span className="text-[10px] font-bold text-[var(--success)] uppercase">Receita</span>
                 </div>
                 <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--danger-bg)]">
                   <div className="w-2 h-2 rounded-full bg-[var(--danger)]" />
                   <span className="text-[10px] font-bold text-[var(--danger)] uppercase">Despesa</span>
                 </div>
              </div>
            </div>
            <div className="h-[300px] w-full relative min-h-[300px]">
              <ResponsiveContainer width="99%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    contentStyle={{ borderRadius: '1.25rem', border: 'none', boxShadow: 'var(--shadow-xl)', padding: '1rem', background: 'var(--surface)' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                    formatter={(val: any) => [formatCurrency(Number(val)), 'Valor']}
                  />
                  <Area type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Accounts */}
            <div className="bg-[var(--surface)] p-8 rounded-[2.5rem] border border-[var(--border)] shadow-sm">
              <h3 className="text-lg font-bold mb-6" style={{ color: 'var(--text)' }}>Minhas Contas</h3>
              <div className="space-y-4">
                {accounts.length === 0 ? (
                  <p className="text-sm text-center py-4" style={{ color: 'var(--text-secondary)' }}>Nenhuma conta ativa</p>
                ) : (
                  accounts.map(acc => (
                    <div key={acc.id} className="flex items-center justify-between p-4 rounded-2xl bg-[var(--bg-secondary)] hover:bg-[var(--surface-hover)] transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ background: acc.color }}>
                          <Wallet size={18} />
                        </div>
                        <span className="font-bold text-sm" style={{ color: 'var(--text)' }}>{acc.name}</span>
                      </div>
                      <span className="font-bold text-sm" style={{ color: 'var(--text)' }}>{formatCurrency(Number(acc.initial_balance))}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Budgets Warnings */}
            <div className="bg-[var(--surface)] p-8 rounded-[2.5rem] border border-[var(--border)] shadow-sm">
              <h3 className="text-lg font-bold mb-6" style={{ color: 'var(--text)' }}>Orçamentos</h3>
              <div className="space-y-6">
                {budgets.length === 0 ? (
                  <p className="text-sm text-center py-4" style={{ color: 'var(--text-secondary)' }}>Sem orçamentos definidos</p>
                ) : (
                  budgets.map(b => {
                    const pct = (b.spent / b.amount) * 100;
                    return (
                      <div key={b.id} className="space-y-2">
                        <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                          <span style={{ color: 'var(--text)' }}>{b.category?.name}</span>
                          <span style={{ color: pct > 100 ? 'var(--danger)' : 'var(--text-secondary)' }}>{pct.toFixed(0)}%</span>
                        </div>
                        <div className="h-2 w-full bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                          <div className={cn("h-full rounded-full", pct > 100 ? "bg-[var(--danger)]" : pct > 80 ? "bg-orange-500" : "bg-[var(--primary)]")} style={{ width: `${Math.min(100, pct)}%` }} />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar: Transactions & Goals */}
        <div className="space-y-8">
          {/* Recent Transactions */}
          <div className="bg-[var(--surface)] p-8 rounded-[2.5rem] border border-[var(--border)] shadow-sm">
            <h3 className="text-lg font-bold mb-6" style={{ color: 'var(--text)' }}>Atividades Recentes</h3>
            <div className="space-y-6">
              {transactions.length === 0 ? (
                <p className="text-sm text-center py-4" style={{ color: 'var(--text-secondary)' }}>Nenhuma transação</p>
              ) : (
                transactions.map(t => (
                  <div key={t.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: t.type === 'income' ? 'var(--success-bg)' : 'var(--danger-bg)' }}>
                        {t.type === 'income' ? <ArrowUpRight size={18} style={{ color: 'var(--success)' }} /> : <ArrowDownRight size={18} style={{ color: 'var(--danger)' }} />}
                      </div>
                      <div>
                        <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>{t.description || t.category?.name}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t.category?.name}</p>
                      </div>
                    </div>
                    <span className={cn("text-sm font-bold", t.type === 'income' ? "text-[var(--success)]" : "text-[var(--danger)]")}>
                      {t.type === 'income' ? '+' : '-'}{formatCurrency(Number(t.amount))}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Goals Progress */}
          <div className="bg-[var(--surface)] p-8 rounded-[2.5rem] border border-[var(--border)] shadow-sm">
            <h3 className="text-lg font-bold mb-6" style={{ color: 'var(--text)' }}>Metas Ativas</h3>
            <div className="space-y-6">
              {goals.length === 0 ? (
                <p className="text-sm text-center py-4" style={{ color: 'var(--text-secondary)' }}>Crie sua primeira meta!</p>
              ) : (
                goals.map(goal => {
                  const pct = (Number(goal.current_amount) / Number(goal.target_amount)) * 100;
                  return (
                    <div key={goal.id} className="space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                           <Target size={16} style={{ color: goal.color }} />
                           <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>{goal.name}</span>
                        </div>
                        <span className="text-xs font-bold" style={{ color: goal.color }}>{pct.toFixed(0)}%</span>
                      </div>
                      <div className="h-2 w-full bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: goal.color }} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: any) {
  return (
    <div className="bg-[var(--surface)] p-6 rounded-[2rem] border border-[var(--border)] shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: `${color}15` }}>
          <Icon size={24} style={{ color }} />
        </div>
      </div>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{title}</p>
      <h3 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{formatCurrency(value)}</h3>
    </div>
  );
}
