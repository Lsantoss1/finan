'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, PiggyBank, X, Loader2, Trash2, PieChart, AlertCircle, TrendingDown, Pencil } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import MonthSelector from '@/components/MonthSelector';
import type { Budget, Category } from '@/types';
import toast from 'react-hot-toast';

export default function OrcamentosPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [budgets, setBudgets] = useState<(Budget & { category: Category; spent: number })[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    category_id: '',
    amount: ''
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();

    // Load budgets, categories and actual transactions for the month
    const [budgetsRes, catsRes, txnsRes] = await Promise.all([
      supabase.from('budgets').select('*, category:categories(*)').eq('user_id', user.id).eq('month', month).eq('year', year),
      supabase.from('categories').select('*').eq('user_id', user.id).eq('type', 'expense').order('name'),
      supabase.from('transactions')
        .select('amount, category_id')
        .eq('user_id', user.id)
        .eq('type', 'expense')
        .gte('date', `${year}-${String(month).padStart(2, '0')}-01`)
        .lte('date', `${year}-${String(month).padStart(2, '0')}-31`)
    ]);

    setCategories(catsRes.data || []);
    
    const budgetData = (budgetsRes.data || []).map(budget => {
      const spent = (txnsRes.data || [])
        .filter(t => t.category_id === budget.category_id)
        .reduce((sum, t) => sum + Number(t.amount), 0);
      return { ...budget, spent };
    });

    setBudgets(budgetData as any);
    setLoading(false);
  }, [currentDate, supabase]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.category_id || !form.amount) return toast.error('Preencha os campos obrigatórios');
    
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();

    const budgetData = {
      user_id: user.id,
      category_id: form.category_id,
      amount: parseFloat(form.amount),
      month,
      year
    };

    let error;
    if (editingId) {
      const { error: err } = await supabase.from('budgets').update(budgetData).eq('id', editingId);
      error = err;
    } else {
      const { error: err } = await supabase.from('budgets').insert(budgetData);
      error = err;
    }

    if (error) {
      toast.error('Você já definiu um orçamento para esta categoria neste mês');
    } else {
      toast.success(editingId ? 'Orçamento atualizado!' : 'Orçamento criado!');
      closeModal();
      loadData();
    }
    setSaving(false);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setForm({ category_id: '', amount: '' });
  };

  const handleEdit = (budget: any) => {
    setEditingId(budget.id);
    setForm({
      category_id: budget.category_id,
      amount: budget.amount.toString()
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir este orçamento?')) return;
    const { error } = await supabase.from('budgets').delete().eq('id', id);
    if (error) toast.error('Erro ao excluir'); else { toast.success('Excluído'); loadData(); }
  };

  const totalBudget = budgets.reduce((sum, b) => sum + Number(b.amount), 0);
  const totalSpent = budgets.reduce((sum, b) => sum + Number(b.spent), 0);
  const totalPct = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Orçamentos</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Controle seus gastos por categoria</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-full md:w-48">
            <MonthSelector currentDate={currentDate} onChange={setCurrentDate} />
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-white text-sm gradient-primary hover:opacity-90 transition-all shadow-lg whitespace-nowrap"
          >
            <Plus size={18} />Novo Limite
          </button>
        </div>
      </div>

      {/* Summary Header */}
      <div className="bg-[var(--surface)] p-6 rounded-3xl border border-[var(--border)] shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between gap-6 mb-4">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Gasto Total Planejado</p>
            <h2 className="text-3xl font-bold" style={{ color: 'var(--text)' }}>{formatCurrency(totalSpent)} <span className="text-lg font-medium opacity-40">/ {formatCurrency(totalBudget)}</span></h2>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Status Geral</p>
            <p className={cn("text-lg font-bold", totalPct > 100 ? "text-[var(--danger)]" : totalPct > 80 ? "text-orange-500" : "text-[var(--success)]")}>
              {totalPct > 100 ? 'Orçamento Estourado' : totalPct > 80 ? 'Limite Próximo' : 'Dentro do Planejado'}
            </p>
          </div>
        </div>
        <div className="h-4 w-full bg-[var(--bg-secondary)] rounded-full overflow-hidden">
          <div 
            className={cn("h-full transition-all duration-1000 rounded-full", totalPct > 100 ? "bg-[var(--danger)]" : "bg-[var(--primary)]")} 
            style={{ width: `${Math.min(100, totalPct)}%` }} 
          />
        </div>
      </div>

      {/* Budgets List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-32 skeleton rounded-2xl" />)
        ) : budgets.length === 0 ? (
          <div className="col-span-full py-20 text-center rounded-3xl border-2 border-dashed border-[var(--border)]">
            <PieChart size={48} className="mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-bold" style={{ color: 'var(--text)' }}>Nenhum orçamento para este mês</h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Defina limites de gastos para suas categorias e mantenha suas finanças sob controle.</p>
          </div>
        ) : (
          budgets.map((budget) => {
            const pct = (budget.spent / Number(budget.amount)) * 100;
            const remaining = Number(budget.amount) - budget.spent;
            
            return (
              <div 
                key={budget.id} 
                className="bg-[var(--surface)] rounded-2xl p-5 border border-[var(--border)] group hover:shadow-md transition-all"
              >
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ background: budget.category.color }}>
                      <TrendingDown size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm" style={{ color: 'var(--text)' }}>{budget.category.name}</h4>
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">{pct > 100 ? 'Excedido' : 'Restante'} {formatCurrency(Math.abs(remaining))}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(budget)} className="p-1.5 rounded-lg hover:bg-[var(--bg-secondary)]"><Pencil size={14} /></button>
                    <button onClick={() => handleDelete(budget.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 size={14} /></button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span style={{ color: 'var(--text)' }}>{formatCurrency(budget.spent)}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{formatCurrency(Number(budget.amount))}</span>
                  </div>
                  <div className="h-2 w-full bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full transition-all duration-700 rounded-full", pct > 100 ? "bg-[var(--danger)]" : pct > 80 ? "bg-orange-400" : "bg-[var(--success)]")} 
                      style={{ width: `${Math.min(100, pct)}%` }} 
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative w-full max-w-md rounded-3xl p-6 animate-scale-in" style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-xl)' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold" style={{ color: 'var(--text)' }}>{editingId ? 'Editar Limite' : 'Novo Limite de Gastos'}</h3>
              <button onClick={closeModal} className="p-2 rounded-xl hover:bg-[var(--surface-hover)]"><X size={20} /></button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>Categoria</label>
                <select 
                  value={form.category_id} 
                  onChange={e => setForm({...form, category_id: e.target.value})} 
                  required
                  className="w-full px-4 py-3 rounded-xl text-sm border outline-none"
                  style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                >
                  <option value="">Selecione uma categoria...</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>Limite Mensal (R$)</label>
                <input 
                  type="number" value={form.amount} 
                  onChange={e => setForm({...form, amount: e.target.value})} 
                  placeholder="0,00" required
                  className="w-full px-4 py-3 rounded-xl text-sm border outline-none"
                  style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                />
                <p className="mt-2 text-[10px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  <AlertCircle size={10} className="inline mr-1" />
                  Este limite será aplicado apenas ao mês de {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}.
                </p>
              </div>

              <button 
                type="submit" 
                disabled={saving}
                className="w-full py-4 rounded-2xl font-bold text-white text-base gradient-primary shadow-lg flex items-center justify-center gap-2 mt-2"
              >
                {saving ? <Loader2 size={20} className="animate-spin" /> : editingId ? 'Atualizar Orçamento' : 'Definir Orçamento'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
