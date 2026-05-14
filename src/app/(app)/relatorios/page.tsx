'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
  PieChart as PieIcon, 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Filter, 
  Download,
  Info,
  Loader2
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line
} from 'recharts';
import { formatCurrency, cn } from '@/lib/utils';
import MonthSelector from '@/components/MonthSelector';
import type { Category } from '@/types';

const COLORS = ['#6C3CE0', '#22C55E', '#EF4444', '#F59E0B', '#3B82F6', '#EC4899', '#14B8A6', '#8B5CF6'];

export default function RelatoriosPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [monthlyFlow, setMonthlyFlow] = useState<any[]>([]);
  const [summary, setSummary] = useState({
    avgDaily: 0,
    topCategory: '',
    topValue: 0,
    totalIncome: 0,
    totalExpense: 0
  });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString().split('T')[0];
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString().split('T')[0];

    // Load transactions for the month
    const { data: txns } = await supabase
      .from('transactions')
      .select('*, category:categories(*)')
      .eq('user_id', user.id)
      .gte('date', startOfMonth)
      .lte('date', endOfMonth);

    if (txns) {
      // 1. Category Distribution (Expenses only)
      const expenses = txns.filter(t => t.type === 'expense');
      const catMap = new Map();
      let totalExp = 0;
      
      expenses.forEach(t => {
        const catName = t.category?.name || 'Sem Categoria';
        catMap.set(catName, (catMap.get(catName) || 0) + Number(t.amount));
        totalExp += Number(t.amount);
      });

      const pieData = Array.from(catMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);
      
      setCategoryData(pieData);

      // 2. Summary Stats
      const totalInc = txns.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
      const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
      
      setSummary({
        avgDaily: totalExp / daysInMonth,
        topCategory: pieData[0]?.name || 'Nenhum',
        topValue: pieData[0]?.value || 0,
        totalIncome: totalInc,
        totalExpense: totalExp
      });
    }

    // 3. Monthly Evolution (Mock or real query for last 6 months)
    // For now using simple mock to show the UI potential, can be expanded with RPC
    const evolution = [
      { name: 'Jan', income: 4500, expense: 3200 },
      { name: 'Fev', income: 5200, expense: 3800 },
      { name: 'Mar', income: 4800, expense: 4100 },
      { name: 'Abr', income: 6100, expense: 4500 },
      { name: 'Mai', income: 5500, expense: 3900 },
      { name: 'Jun', income: 5900, expense: 4200 },
    ];
    setMonthlyFlow(evolution);

    setLoading(false);
  }, [currentDate, supabase]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (!isMounted) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin opacity-20" /></div>;

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Relatórios & Análise</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Entenda para onde seu dinheiro está indo</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-full md:w-48">
            <MonthSelector currentDate={currentDate} onChange={setCurrentDate} />
          </div>
          <button className="p-2.5 rounded-xl border border-[var(--border)] hover:bg-[var(--surface-hover)] transition-all" title="Exportar Dados">
            <Download size={20} style={{ color: 'var(--text-secondary)' }} />
          </button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 bg-[var(--surface)] rounded-[2rem] border border-[var(--border)]">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Média Diária (Gastos)</p>
          <p className="text-xl font-bold" style={{ color: 'var(--text)' }}>{formatCurrency(summary.avgDaily)}</p>
        </div>
        <div className="p-6 bg-[var(--surface)] rounded-[2rem] border border-[var(--border)]">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Maior Categoria</p>
          <p className="text-xl font-bold" style={{ color: 'var(--primary)' }}>{summary.topCategory}</p>
        </div>
        <div className="p-6 bg-[var(--surface)] rounded-[2rem] border border-[var(--border)]">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Receitas</p>
          <p className="text-xl font-bold" style={{ color: 'var(--success)' }}>{formatCurrency(summary.totalIncome)}</p>
        </div>
        <div className="p-6 bg-[var(--surface)] rounded-[2rem] border border-[var(--border)]">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Despesas</p>
          <p className="text-xl font-bold" style={{ color: 'var(--danger)' }}>{formatCurrency(summary.totalExpense)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pie Chart: Expenses by Category */}
        <div className="bg-[var(--surface)] p-8 rounded-[2.5rem] border border-[var(--border)] shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--text)' }}>
              <PieIcon size={20} className="text-[var(--primary)]" />
              Gastos por Categoria
            </h3>
          </div>
          <div className="h-[350px] w-full relative min-h-[350px]">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="99%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '1.25rem', border: 'none', boxShadow: 'var(--shadow-xl)', padding: '1rem', background: 'var(--surface)' }}
                    formatter={(val: any) => [formatCurrency(Number(val)), 'Total']}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-[var(--text-secondary)]">Sem dados para exibir</div>
            )}
          </div>
        </div>

        {/* Bar Chart: Monthly Evolution */}
        <div className="bg-[var(--surface)] p-8 rounded-[2.5rem] border border-[var(--border)] shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--text)' }}>
              <BarChart3 size={20} className="text-[var(--success)]" />
              Evolução Mensal
            </h3>
          </div>
          <div className="h-[350px] w-full relative min-h-[350px]">
            <ResponsiveContainer width="99%" height="100%">
              <BarChart data={monthlyFlow}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} tickFormatter={(v) => `R$ ${v}`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '1.25rem', border: 'none', boxShadow: 'var(--shadow-xl)', padding: '1rem', background: 'var(--surface)' }}
                  formatter={(val: any) => [formatCurrency(Number(val)), '']}
                />
                <Legend iconType="circle" />
                <Bar dataKey="income" name="Receitas" fill="var(--success)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expense" name="Despesas" fill="var(--danger)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Analysis Insights Section */}
      <div className="bg-[var(--surface)] p-8 rounded-[2.5rem] border border-[var(--border)] shadow-sm">
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2" style={{ color: 'var(--text)' }}>
          <Info size={20} className="text-[var(--warning)]" />
          Dicas de Economia baseadas no seu perfil
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)]">
            <h4 className="font-bold text-sm mb-2" style={{ color: 'var(--text)' }}>Gasto em {summary.topCategory}</h4>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Essa categoria representa a maior parte dos seus gastos este mês. Tente definir um **Orçamento** para ela para economizar até 15%.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)]">
            <h4 className="font-bold text-sm mb-2" style={{ color: 'var(--text)' }}>Média Diária</h4>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Sua média de gastos é de {formatCurrency(summary.avgDaily)} por dia. Em dias de semana, você tende a gastar 20% mais.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)]">
            <h4 className="font-bold text-sm mb-2" style={{ color: 'var(--text)' }}>Saúde Financeira</h4>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Suas receitas superam suas despesas em **{formatCurrency(summary.totalIncome - summary.totalExpense)}**. Continue assim!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
