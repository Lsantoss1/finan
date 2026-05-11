'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency, cn } from '@/lib/utils';
import { ACCOUNT_TYPES, COLOR_PALETTE, BANKS } from '@/lib/constants';
import { Plus, Pencil, Trash2, X, Loader2, Landmark } from 'lucide-react';
import type { Account, AccountFormData } from '@/types';
import toast from 'react-hot-toast';

const defaultForm: AccountFormData = { name: '', type: 'checking', bank: '', initial_balance: 0, color: '#6C3CE0', icon: 'wallet' };

export default function ContasPage() {
  const supabase = createClient();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<AccountFormData>(defaultForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadAccounts(); }, []);

  const loadAccounts = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('accounts').select('*').eq('user_id', user.id).order('created_at');
    setAccounts(data || []);
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Sessão expirada');

      const accountData = { 
        user_id: user.id, 
        name: form.name, 
        type: form.type, 
        bank: form.bank || null, 
        initial_balance: form.initial_balance, 
        color: form.color, 
        icon: form.icon 
      };

      if (editingId) {
        const { error } = await supabase.from('accounts')
          .update({ ...accountData, updated_at: new Date().toISOString() })
          .eq('id', editingId);
        if (error) throw error;
        toast.success('Conta atualizada!');
      } else {
        const { error } = await supabase.from('accounts').insert(accountData);
        if (error) throw error;
        toast.success('Conta criada!');
      }
      setShowModal(false);
      setEditingId(null);
      setForm(defaultForm);
      loadAccounts();
    } catch (error: any) {
      console.error('Erro ao salvar conta:', error);
      toast.error(error.message || 'Erro ao salvar conta');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (account: Account) => {
    setForm({ name: account.name, type: account.type, bank: account.bank || '', initial_balance: Number(account.initial_balance), color: account.color, icon: account.icon });
    setEditingId(account.id);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta conta?')) return;
    const { error } = await supabase.from('accounts').delete().eq('id', id);
    if (error) toast.error(error.message); else { toast.success('Conta excluída'); loadAccounts(); }
  };

  const totalBalance = accounts.reduce((s, a) => s + Number(a.initial_balance), 0);

  if (loading) return <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-24 skeleton rounded-2xl" />)}</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Contas</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Saldo total: <span className="font-semibold" style={{ color: 'var(--primary)' }}>{formatCurrency(totalBalance)}</span></p>
        </div>
        <button onClick={() => { setForm(defaultForm); setEditingId(null); setShowModal(true); }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-white text-sm gradient-primary hover:opacity-90 transition-all" style={{ boxShadow: '0 4px 14px rgba(108, 60, 224, 0.3)' }}>
          <Plus size={18} />Nova Conta
        </button>
      </div>

      {accounts.length === 0 ? (
        <div className="rounded-2xl p-12 text-center" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <Landmark size={48} className="mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
          <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text)' }}>Nenhuma conta cadastrada</h3>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Crie sua primeira conta para começar a controlar suas finanças.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {accounts.map((account) => {
            const typeInfo = ACCOUNT_TYPES.find(t => t.value === account.type);
            return (
              <div key={account.id} className="rounded-2xl p-5 card-interactive group" style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `${account.color}20` }}>
                      <Landmark size={20} style={{ color: account.color }} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{account.name}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{typeInfo?.label} {account.bank ? `• ${account.bank}` : ''}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(account)} className="p-2 rounded-lg hover:bg-[var(--surface-hover)]" style={{ color: 'var(--text-muted)' }}><Pencil size={14} /></button>
                    <button onClick={() => handleDelete(account.id)} className="p-2 rounded-lg hover:bg-[var(--danger-bg)]" style={{ color: 'var(--danger)' }}><Trash2 size={14} /></button>
                  </div>
                </div>
                <p className="text-xl font-bold tabular-nums" style={{ color: Number(account.initial_balance) >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                  {formatCurrency(Number(account.initial_balance))}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative w-full max-w-md rounded-2xl p-6 animate-scale-in" style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-xl)' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold" style={{ color: 'var(--text)' }}>{editingId ? 'Editar Conta' : 'Nova Conta'}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-[var(--surface-hover)]" style={{ color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Nome da conta</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required className="w-full px-4 py-2.5 rounded-xl text-sm" style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }} placeholder="Ex: Nubank Conta Corrente" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Tipo</label>
                <select value={form.type} onChange={e => setForm({...form, type: e.target.value as AccountFormData['type']})} className="w-full px-4 py-2.5 rounded-xl text-sm" style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}>
                  {ACCOUNT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Banco</label>
                <select value={form.bank} onChange={e => setForm({...form, bank: e.target.value})} className="w-full px-4 py-2.5 rounded-xl text-sm" style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}>
                  <option value="">Selecione...</option>
                  {BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Saldo inicial</label>
                <input type="number" step="0.01" value={form.initial_balance} onChange={e => setForm({...form, initial_balance: parseFloat(e.target.value) || 0})} className="w-full px-4 py-2.5 rounded-xl text-sm" style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Cor</label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_PALETTE.slice(0, 10).map(c => (
                    <button key={c} type="button" onClick={() => setForm({...form, color: c})} className={cn('w-8 h-8 rounded-full transition-transform', form.color === c && 'scale-110')} style={{ background: c, outline: form.color === c ? `2px solid ${c}` : 'none', outlineOffset: '3px' }} />
                  ))}
                </div>
              </div>
              <button type="submit" disabled={saving} className="w-full py-3 rounded-xl font-semibold text-white text-sm gradient-primary hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 mt-2">
                {saving ? <><Loader2 size={16} className="animate-spin" />Salvando...</> : (editingId ? 'Salvar alterações' : 'Criar conta')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
