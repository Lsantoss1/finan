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
import CategoryIcon3D, { FLUENT_3D_ICONS } from '@/components/CategoryIcon3D';

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
    color: '#6c3ce0',
    icon: 'shopping'
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
    setForm({ name: '', type: 'expense', color: '#6c3ce0', icon: 'shopping' });
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
          <h1 className="text-3xl font-black tracking-tight" style={{ color: 'var(--text)' }}>Categorias Premium</h1>
          <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Personalize sua organização com ícones artísticos 3D</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex p-1.5 rounded-[1.25rem] apple-glass border border-white/5">
             {(['all', 'income', 'expense'] as const).map(t => (
               <button 
                 key={t} onClick={() => setFilterType(t)}
                 className={cn("px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", filterType === t ? "bg-[var(--primary)] text-white shadow-lg" : "text-[var(--text-secondary)] hover:bg-white/5")}
               >
                 {t === 'all' ? 'Todas' : t === 'income' ? 'Ganhos' : 'Gastos'}
               </button>
             ))}
           </div>
           <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-white gradient-primary shadow-xl hover:scale-105 active:scale-95 transition-all">
             <Plus size={20} /> Nova Categoria
           </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
        {loading ? (
          Array.from({ length: 12 }).map((_, i) => <div key={i} className="h-44 skeleton rounded-[2.5rem]" />)
        ) : filteredCategories.map((cat) => (
          <div 
            key={cat.id} 
            className="relative group p-8 rounded-[2.5rem] transition-all cursor-pointer overflow-hidden border border-white/5 hover:border-white/10"
            style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-md)' }}
            onClick={() => handleEdit(cat)}
          >
            {/* Soft Glow Background */}
            <div className="absolute -top-12 -right-12 w-32 h-32 blur-[40px] opacity-0 group-hover:opacity-20 transition-opacity duration-500" style={{ background: cat.color }} />
            
            <div className="relative z-10 flex flex-col items-center text-center space-y-4">
              <div className="transform group-hover:scale-125 group-hover:-translate-y-2 transition-all duration-500">
                <CategoryIcon3D icon={cat.icon} size={72} />
              </div>
              <div>
                <h3 className="font-black text-sm tracking-tight" style={{ color: 'var(--text)' }}>{cat.name}</h3>
                <div className="mt-2 flex items-center justify-center gap-1.5">
                   <div className="w-1.5 h-1.5 rounded-full" style={{ background: cat.color }} />
                   <span className="text-[9px] font-black uppercase tracking-[0.15em] opacity-30">{cat.type === 'income' ? 'Receita' : 'Despesa'}</span>
                </div>
              </div>
            </div>

            {/* Actions overlay on hover */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
              <button className="p-2 rounded-xl bg-white/5 text-gray-400 hover:text-white transition-all"><Pencil size={14} /></button>
              <button className="p-2 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-all"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={closeModal} />
          <div className="relative w-full max-w-2xl rounded-[3rem] p-10 animate-scale-in border border-white/10 overflow-hidden" style={{ background: 'var(--surface)' }}>
            {/* Background Art */}
            <div className="absolute -top-32 -left-32 w-64 h-64 blur-[120px] opacity-20" style={{ background: form.color }} />
            
            <div className="relative z-10 flex items-center justify-between mb-10">
              <h3 className="text-3xl font-black tracking-tight" style={{ color: 'var(--text)' }}>{editingId ? 'Refinar Categoria' : 'Nova Categoria'}</h3>
              <button onClick={closeModal} className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-all"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSave} className="relative z-10 space-y-10">
              <div className="flex flex-col md:flex-row items-center gap-10">
                <div 
                  className="w-40 h-40 rounded-[2.5rem] flex items-center justify-center shadow-2xl shrink-0 transition-all duration-500"
                  style={{ background: `linear-gradient(135deg, ${form.color}15, ${form.color}05)`, border: `1px solid ${form.color}33` }}
                >
                  <CategoryIcon3D icon={form.icon} size={100} />
                </div>
                <div className="flex-1 w-full space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Título da Categoria</label>
                      <input 
                        value={form.name} onChange={e => setForm({...form, name: e.target.value})} 
                        placeholder="Ex: Jantares, Viagens..." required
                        className="w-full px-8 py-5 rounded-2xl text-xl font-bold border-2 border-transparent outline-none transition-all focus:border-[var(--primary)] bg-black/20"
                        style={{ color: 'var(--text)' }}
                      />
                    </div>
                    <div className="flex p-1.5 rounded-2xl border border-white/5 bg-black/20">
                      {(['expense', 'income'] as const).map(t => (
                        <button 
                          key={t} type="button" onClick={() => setForm({...form, type: t})}
                          className={cn("flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all", 
                            form.type === t 
                              ? "bg-[var(--primary)] text-white shadow-xl" 
                              : "opacity-40 hover:opacity-100"
                          )}
                        >
                          {t === 'expense' ? 'Despesa' : 'Receita'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between ml-2">
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Escolha seu Ícone 3D</label>
                    <span className="text-[10px] font-bold text-[var(--primary)] uppercase tracking-widest">{form.icon.replace(/-/g, ' ')}</span>
                  </div>
                  <div className="grid grid-cols-5 sm:grid-cols-7 gap-4 max-h-56 overflow-y-auto pr-4 custom-scrollbar">
                    {Object.keys(FLUENT_3D_ICONS)
                      .filter(key => ![
                        'utensils', 'shopping-bag', 'receipt', 'graduation-cap', 
                        'briefcase', 'trending-up', 'gamepad-2', 'shirt', 
                        'heart-pulse', 'smartphone', 'paw-print', 'laptop', 
                        'plane', 'piggy-bank', 'dumbbell', 'wallet', 'zap', 'music', 
                        'camera', 'trophy', 'gem', 'star', 'sparkles', 'circle-dot'
                      ].includes(key)) // Filtrar apenas os únicos para o seletor
                      .map(iconName => {
                        const isSelected = form.icon === iconName;
                        const labelMap: Record<string, string> = {
                          food: 'Alimentação', home: 'Moradia', car: 'Transporte', health: 'Saúde',
                          education: 'Educação', game: 'Lazer/Games', shopping: 'Compras',
                          work: 'Trabalho', investment: 'Investimentos', leisure: 'Festa/Lazer',
                          travel: 'Viagem', gift: 'Presentes', bills: 'Contas/Boletos',
                          salary: 'Salário', savings: 'Poupança', pet: 'Pets',
                          personal: 'Beleza/Cabelo/Estética', cleaning: 'Limpeza/Casa', gym: 'Academia',
                          internet: 'Internet/TV', streaming: 'Streaming/Netflix', beauty: 'Beleza/Cuidado',
                          maintenance: 'Manutenção/Ferramentas', pharmacy: 'Farmácia/Saúde', rent: 'Aluguel/Imóveis',
                          coffee: 'Café/Lanches', pizza: 'Pizza/Jantar', taxes: 'Bancos/Impostos',
                          bonus: 'Bônus/Extra', clothing: 'Vestuário/Roupas', other: 'Outros'
                        };
                        
                        return (
                          <button 
                            key={iconName} 
                            type="button" 
                            title={labelMap[iconName] || iconName}
                            onClick={() => setForm({...form, icon: iconName})}
                            className={cn("aspect-square rounded-2xl flex items-center justify-center transition-all border-2", 
                              isSelected ? "border-[var(--primary)] bg-[var(--primary)]/10 shadow-lg scale-110" : "bg-black/20 border-transparent hover:bg-black/40"
                            )}
                          >
                            <CategoryIcon3D icon={iconName} size={40} />
                          </button>
                        );
                      })}
                  </div>
                </div>

                <div className="space-y-6">
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] opacity-40 ml-2">Cor de Destaque</label>
                  <div className="flex flex-wrap gap-3">
                    {COLOR_PALETTE.map(c => (
                      <button 
                        key={c} type="button" onClick={() => setForm({...form, color: c})}
                        className={cn("w-9 h-9 rounded-full transition-all hover:scale-125", form.color === c && "ring-4 ring-[var(--primary)] ring-offset-4 ring-offset-[var(--bg)] scale-110 shadow-xl")}
                        style={{ background: c }}
                      />
                    ))}
                  </div>
                </div>

              <button type="submit" disabled={saving} className="w-full py-6 rounded-[2rem] font-black text-white gradient-primary shadow-2xl hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-2xl tracking-tight">
                {saving ? <Loader2 size={24} className="animate-spin" /> : editingId ? 'Salvar Alterações' : 'Confirmar Categoria'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
