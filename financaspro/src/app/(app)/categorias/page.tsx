'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
  Plus, X, Loader2, Trash2, Pencil, 
  Utensils, Home, Car, HeartPulse, GraduationCap, 
  Gamepad2, Shirt, ShoppingBag, Receipt, Smartphone,
  Gift, Dog, CircleDot, Briefcase, Laptop, TrendingUp, Store,
  Coffee, Plane, Pizza, Music, Camera, Dumbbell, Wallet, PiggyBank,
  Zap, Heart, Star, Sparkles, Gem, Trophy
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { COLOR_PALETTE } from '@/lib/constants';
import type { Category } from '@/types';
import toast from 'react-hot-toast';

// Biblioteca expandida de ícones para "Artes de Categoria"
const ICON_MAP: Record<string, any> = {
  'utensils': Utensils, 'home': Home, 'car': Car, 'heart-pulse': HeartPulse,
  'graduation-cap': GraduationCap, 'gamepad-2': Gamepad2, 'shirt': Shirt,
  'shopping-bag': ShoppingBag, 'receipt': Receipt, 'smartphone': Smartphone,
  'gift': Gift, 'paw-print': Dog, 'circle-dot': CircleDot, 'briefcase': Briefcase,
  'laptop': Laptop, 'trending-up': TrendingUp, 'store': Store, 'coffee': Coffee,
  'plane': Plane, 'pizza': Pizza, 'music': Music, 'camera': Camera, 'dumbbell': Dumbbell,
  'wallet': Wallet, 'piggy-bank': PiggyBank, 'zap': Zap, 'heart': Heart, 'star': Star,
  'sparkles': Sparkles, 'gem': Gem, 'trophy': Trophy
};

export default function CategoriasPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    type: 'expense' as 'income' | 'expense',
    color: '#FF6B6B',
    icon: 'shopping-bag'
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase.from('categories').select('*').eq('user_id', user.id).order('name');
    setCategories(data || []);
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    const categoryData = { user_id: user?.id, name: form.name, type: form.type, color: form.color, icon: form.icon };

    let error;
    if (editingId) error = (await supabase.from('categories').update(categoryData).eq('id', editingId)).error;
    else error = (await supabase.from('categories').insert(categoryData)).error;

    if (error) toast.error('Erro ao salvar');
    else { toast.success('Sucesso!'); closeModal(); loadCategories(); }
    setSaving(false);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setForm({ name: '', type: 'expense', color: '#FF6B6B', icon: 'shopping-bag' });
  };

  const handleEdit = (cat: Category) => {
    setEditingId(cat.id);
    setForm({ name: cat.name, type: cat.type, color: cat.color, icon: cat.icon });
    setShowModal(true);
  };

  const filteredCategories = categories.filter(c => filterType === 'all' || c.type === filterType);

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>Categorias Premium</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Personalize seus gastos com ícones artísticos</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex p-1.5 rounded-2xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
             {(['all', 'income', 'expense'] as const).map(t => (
               <button 
                 key={t} onClick={() => setFilterType(t)}
                 className={cn("px-5 py-2 rounded-xl text-xs font-bold transition-all", filterType === t ? "bg-[var(--primary)] text-white shadow-lg" : "text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]")}
               >
                 {t === 'all' ? 'Todas' : t === 'income' ? 'Receitas' : 'Despesas'}
               </button>
             ))}
           </div>
           <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-white gradient-primary shadow-xl hover:scale-105 active:scale-95 transition-all">
             <Plus size={20} /> Adicionar
           </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
        {loading ? (
          Array.from({ length: 12 }).map((_, i) => <div key={i} className="h-44 skeleton rounded-[2.5rem]" />)
        ) : filteredCategories.map((cat) => {
          const Icon = ICON_MAP[cat.icon] || CircleDot;
          return (
            <div 
              key={cat.id} 
              className="relative group p-8 rounded-[2.5rem] transition-all cursor-pointer overflow-hidden border border-transparent hover:border-white/10"
              style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-sm)' }}
            >
              {/* Artistic Glow Background */}
              <div className="absolute top-0 left-0 w-full h-full opacity-0 group-hover:opacity-10 transition-opacity duration-500" style={{ background: `radial-gradient(circle at top right, ${cat.color}, transparent)` }} />
              
              <div className="relative z-10 flex flex-col items-center text-center space-y-5">
                <div 
                  className="w-16 h-16 rounded-[1.75rem] flex items-center justify-center text-white shadow-2xl transform group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500"
                  style={{ background: `linear-gradient(135deg, ${cat.color}, ${cat.color}99)`, boxShadow: `0 10px 20px -5px ${cat.color}66` }}
                >
                  <Icon size={32} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm" style={{ color: 'var(--text)' }}>{cat.name}</h3>
                  <div className="mt-2 flex items-center justify-center gap-1.5">
                     <div className="w-1.5 h-1.5 rounded-full" style={{ background: cat.color }} />
                     <span className="text-[9px] font-black uppercase tracking-[0.15em] opacity-30">{cat.type === 'income' ? 'Ganho' : 'Gasto'}</span>
                  </div>
                </div>
              </div>

              {/* Hover Actions: Premium Style */}
              <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
                <button onClick={() => handleEdit(cat)} className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all"><Pencil size={14} /></button>
                <button className="p-2.5 rounded-xl bg-red-500/10 backdrop-blur-md border border-red-500/20 text-red-500 hover:bg-red-500/20 transition-all"><Trash2 size={14} /></button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Premium Artistic Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={closeModal} />
          <div className="relative w-full max-w-lg rounded-[3rem] p-10 animate-scale-in border border-white/10" style={{ background: 'var(--surface)' }}>
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-2xl font-black" style={{ color: 'var(--text)' }}>{editingId ? 'Refinar Arte' : 'Nova Arte'}</h3>
              <button onClick={closeModal} className="p-3 rounded-2xl hover:bg-white/5 transition-all"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSave} className="space-y-8">
              <div className="flex items-center gap-8">
                <div 
                  className="w-24 h-24 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shrink-0"
                  style={{ background: `linear-gradient(135deg, ${form.color}, ${form.color}aa)` }}
                >
                  {(() => { const Icon = ICON_MAP[form.icon] || CircleDot; return <Icon size={40} strokeWidth={2.5} /> })()}
                </div>
                <div className="flex-1 space-y-4">
                    <input 
                      value={form.name} onChange={e => setForm({...form, name: e.target.value})} 
                      placeholder="Ex: Jantares, Viagens..." required
                      className="w-full px-6 py-4 rounded-2xl text-lg font-bold border outline-none transition-all focus:border-[var(--primary)] placeholder:opacity-30"
                      style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                    />
                    <div className="flex p-1 rounded-xl border" style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}>
                      {(['expense', 'income'] as const).map(t => (
                        <button 
                          key={t} type="button" onClick={() => setForm({...form, type: t})}
                          className={cn("flex-1 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", 
                            form.type === t 
                              ? "bg-[var(--primary)] text-white shadow-xl" 
                              : "opacity-40 hover:opacity-100"
                          )}
                          style={{ color: form.type === t ? '#fff' : 'var(--text)' }}
                        >
                          {t === 'expense' ? 'Despesa' : 'Receita'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] mb-4 opacity-40" style={{ color: 'var(--text)' }}>Selecione o Ícone Artístico</label>
                  <div className="grid grid-cols-6 gap-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {Object.keys(ICON_MAP).map(iconName => {
                      const Icon = ICON_MAP[iconName];
                      const isSelected = form.icon === iconName;
                      return (
                        <button 
                          key={iconName} type="button" onClick={() => setForm({...form, icon: iconName})}
                          className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-all border", 
                            isSelected ? "bg-[var(--primary)] text-white border-transparent shadow-xl scale-110" : "hover:bg-[var(--surface-hover)]"
                          )}
                          style={{ 
                            background: isSelected ? 'var(--primary)' : 'var(--bg)', 
                            borderColor: 'var(--border)',
                            color: isSelected ? '#fff' : 'var(--text)'
                          }}
                        >
                          <Icon size={24} className={cn(!isSelected && "opacity-40")} />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] mb-4 opacity-40" style={{ color: 'var(--text)' }}>Escolha a Cor Identificadora</label>
                  <div className="flex flex-wrap gap-3">
                    {COLOR_PALETTE.map(c => (
                      <button 
                        key={c} type="button" onClick={() => setForm({...form, color: c})}
                        className={cn("w-8 h-8 rounded-full transition-all hover:scale-125 hover:shadow-lg", form.color === c && "ring-4 ring-[var(--primary)] ring-offset-4 ring-offset-[var(--bg)] scale-125 shadow-xl")}
                        style={{ background: c }}
                      />
                    ))}
                  </div>
                </div>

              <button type="submit" disabled={saving} className="w-full py-5 rounded-[2rem] font-black text-white gradient-primary shadow-2xl hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-xl tracking-tight">
                {saving ? <Loader2 size={24} className="animate-spin" /> : editingId ? 'Atualizar Categoria' : 'Criar Categoria'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
