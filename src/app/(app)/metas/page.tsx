'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, Target, X, Loader2, Trash2, Calendar, Pencil, TrendingUp, ChevronRight } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { COLOR_PALETTE } from '@/lib/constants';
import type { Goal } from '@/types';
import toast from 'react-hot-toast';

export default function MetasPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    deadline: '',
    color: '#FFB800'
  });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    setGoals(data || []);
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.target_amount) return toast.error('Preencha os campos obrigatórios');
    
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const goalData = {
      user_id: user.id,
      name: form.name,
      target_amount: parseFloat(form.target_amount),
      current_amount: parseFloat(form.current_amount || '0'),
      deadline: form.deadline || null,
      color: form.color
    };

    let error;
    if (editingId) {
      const { error: err } = await supabase.from('goals').update(goalData).eq('id', editingId);
      error = err;
    } else {
      const { error: err } = await supabase.from('goals').insert(goalData);
      error = err;
    }

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(editingId ? 'Meta atualizada!' : 'Meta criada!');
      closeModal();
      loadGoals();
    }
    setSaving(false);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setForm({ name: '', target_amount: '', current_amount: '0', deadline: '', color: '#FFB800' });
  };

  const handleEdit = (goal: Goal) => {
    setEditingId(goal.id);
    setForm({
      name: goal.name,
      target_amount: goal.target_amount.toString(),
      current_amount: goal.current_amount.toString(),
      deadline: goal.deadline || '',
      color: goal.color
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir esta meta?')) return;
    const { error } = await supabase.from('goals').delete().eq('id', id);
    if (error) toast.error('Erro ao excluir'); else { toast.success('Excluída'); loadGoals(); }
  };

  if (!isMounted) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin opacity-20" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Metas Financeiras</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Planeje seus sonhos de longo prazo</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-white text-sm gradient-primary hover:opacity-90 transition-all shadow-lg"
        >
          <Plus size={18} />Nova Meta
        </button>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-64 skeleton rounded-3xl" />)
        ) : goals.length === 0 ? (
          <div className="col-span-full py-20 text-center rounded-3xl border-2 border-dashed border-[var(--border)]">
            <Target size={48} className="mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-bold" style={{ color: 'var(--text)' }}>Você ainda não tem metas</h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Defina objetivos para poupar dinheiro com mais motivação.</p>
          </div>
        ) : (
          goals.map((goal) => {
            const pct = Math.min(100, (Number(goal.current_amount) / Number(goal.target_amount)) * 100);
            const remaining = Number(goal.target_amount) - Number(goal.current_amount);
            
            return (
              <div 
                key={goal.id} 
                className="bg-[var(--surface)] rounded-3xl p-6 shadow-sm border border-[var(--border)] hover:shadow-md transition-all group"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg" style={{ background: goal.color }}>
                      <Target size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold" style={{ color: 'var(--text)' }}>{goal.name}</h3>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {goal.deadline ? `Até ${new Date(goal.deadline).toLocaleDateString()}` : 'Sem prazo'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(goal)} className="p-2 rounded-lg hover:bg-[var(--bg-secondary)]"><Pencil size={14} /></button>
                    <button onClick={() => handleDelete(goal.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-500"><Trash2 size={14} /></button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Progresso</p>
                      <p className="text-2xl font-bold" style={{ color: goal.color }}>{pct.toFixed(1)}%</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Faltam</p>
                      <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>{formatCurrency(remaining > 0 ? remaining : 0)}</p>
                    </div>
                  </div>

                  <div className="h-3 w-full bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%`, background: goal.color }} />
                  </div>

                  <div className="flex justify-between text-sm font-medium">
                    <span style={{ color: 'var(--text-secondary)' }}>{formatCurrency(Number(goal.current_amount))}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{formatCurrency(Number(goal.target_amount))}</span>
                  </div>
                </div>

                <button className="w-full mt-6 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:bg-[var(--surface-hover)] border border-[var(--border)]" style={{ color: 'var(--text)' }}>
                  Contribuir <ChevronRight size={16} />
                </button>
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
              <h3 className="text-lg font-bold" style={{ color: 'var(--text)' }}>{editingId ? 'Editar Meta' : 'Nova Meta'}</h3>
              <button onClick={closeModal} className="p-2 rounded-xl hover:bg-[var(--surface-hover)]"><X size={20} /></button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>O que você quer conquistar?</label>
                <input 
                  value={form.name} 
                  onChange={e => setForm({...form, name: e.target.value})} 
                  placeholder="Ex: Viagem para o Japão, Carro novo..."
                  required
                  className="w-full px-4 py-3 rounded-xl text-sm border outline-none"
                  style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>Valor Alvo</label>
                  <input 
                    type="number" value={form.target_amount} 
                    onChange={e => setForm({...form, target_amount: e.target.value})} 
                    placeholder="0,00" required
                    className="w-full px-4 py-3 rounded-xl text-sm border outline-none"
                    style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>Já tenho guardado</label>
                  <input 
                    type="number" value={form.current_amount} 
                    onChange={e => setForm({...form, current_amount: e.target.value})} 
                    className="w-full px-4 py-3 rounded-xl text-sm border outline-none"
                    style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>Prazo Final (opcional)</label>
                <input 
                  type="date" value={form.deadline} 
                  onChange={e => setForm({...form, deadline: e.target.value})} 
                  className="w-full px-4 py-3 rounded-xl text-sm border outline-none"
                  style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>Cor da Meta</label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_PALETTE.map(c => (
                    <button 
                      key={c} type="button" onClick={() => setForm({...form, color: c})}
                      className={cn("w-8 h-8 rounded-full transition-transform", form.color === c && "ring-2 ring-offset-2 scale-110")}
                      style={{ background: c, outline: form.color === c ? `2px solid ${c}` : 'none', outlineOffset: '3px' }}
                    />
                  ))}
                </div>
              </div>

              <button 
                type="submit" 
                disabled={saving}
                className="w-full py-4 rounded-2xl font-bold text-white text-base gradient-primary shadow-lg flex items-center justify-center gap-2 mt-2"
              >
                {saving ? <Loader2 size={20} className="animate-spin" /> : editingId ? 'Atualizar Meta' : 'Criar Meta'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
