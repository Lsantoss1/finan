'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
  User, 
  Settings as SettingsIcon, 
  Moon, 
  Sun, 
  Globe, 
  LogOut, 
  Bell, 
  Shield, 
  Trash2,
  Camera,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser } from '@/hooks/useUser';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function ConfiguracoesPage() {
  const supabase = createClient();
  const router = useRouter();
  const { user, profile, refetchProfile } = useUser();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('perfil');
  
  const [formData, setFormData] = useState({
    name: '',
    currency: 'BRL',
    theme: 'system',
    whatsapp_number: ''
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        currency: profile.currency || 'BRL',
        theme: profile.theme || 'system',
        whatsapp_number: profile.whatsapp_number || ''
      });
    }
  }, [profile]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase
      .from('profiles')
      .update({
        name: formData.name,
        currency: formData.currency,
        theme: formData.theme,
        whatsapp_number: formData.whatsapp_number,
        updated_at: new Date().toISOString()
      })
      .eq('id', user?.id);

    if (error) {
      toast.error('Erro ao atualizar perfil');
    } else {
      toast.success('Configurações salvas!');
      refetchProfile();
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const tabs = [
    { id: 'perfil', label: 'Perfil', icon: User },
    { id: 'preferencias', label: 'Preferências', icon: SettingsIcon },
    { id: 'seguranca', label: 'Segurança', icon: Shield },
    { id: 'notificacoes', label: 'Notificações', icon: Bell },
  ];

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-20">
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Configurações</h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Gerencie sua conta e preferências do app</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all",
                activeTab === tab.id 
                  ? "bg-[var(--primary)] text-white shadow-lg" 
                  : "text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]"
              )}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
          <div className="pt-4 mt-4 border-t border-[var(--border)]">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all"
            >
              <LogOut size={18} />
              Sair da Conta
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-[var(--surface)] rounded-[2.5rem] border border-[var(--border)] p-8 shadow-sm">
          {activeTab === 'perfil' && (
            <form onSubmit={handleUpdateProfile} className="space-y-8">
              {/* Avatar Section */}
              <div className="flex flex-col items-center sm:flex-row gap-6">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-[2rem] bg-[var(--primary)] flex items-center justify-center text-white text-3xl font-bold shadow-xl overflow-hidden">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      formData.name?.charAt(0) || user?.email?.charAt(0)
                    )}
                  </div>
                  <button type="button" className="absolute -bottom-1 -right-1 p-2 rounded-xl bg-white shadow-lg text-[var(--primary)] border hover:scale-110 transition-all">
                    <Camera size={16} />
                  </button>
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="font-bold text-lg" style={{ color: 'var(--text)' }}>Foto de Perfil</h3>
                  <p className="text-xs max-w-[200px]" style={{ color: 'var(--text-secondary)' }}>Use uma imagem de até 2MB para personalizar seu perfil.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Nome Completo</label>
                  <input 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full px-5 py-4 rounded-2xl text-sm border outline-none transition-all focus:border-[var(--primary)]"
                    style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                    placeholder="Seu nome"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Número do WhatsApp (Assistente)</label>
                  <input 
                    value={formData.whatsapp_number}
                    onChange={e => setFormData({...formData, whatsapp_number: e.target.value})}
                    className="w-full px-5 py-4 rounded-2xl text-sm border outline-none transition-all focus:border-[var(--primary)]"
                    style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                    placeholder="Ex: 5511999999999"
                  />
                  <p className="mt-1.5 text-[10px] opacity-50">Digite apenas números com DDI (Ex: 55 para Brasil)</p>
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="px-8 py-4 rounded-2xl font-bold text-white gradient-primary shadow-lg hover:opacity-90 transition-all flex items-center gap-2"
              >
                {loading && <Loader2 size={18} className="animate-spin" />}
                Salvar Alterações
              </button>
            </form>
          )}

          {activeTab === 'preferencias' && (
            <div className="space-y-8">
               <div>
                  <h3 className="font-bold text-lg mb-1" style={{ color: 'var(--text)' }}>Preferências do Sistema</h3>
                  <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>Personalize como o app deve se comportar</p>
               </div>

               <div className="space-y-6">
                 <div className="flex items-center justify-between p-4 rounded-2xl border border-[var(--border)]">
                   <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center"><Globe size={20} /></div>
                     <div>
                       <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>Moeda Principal</p>
                       <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Moeda padrão para saldos e gráficos</p>
                     </div>
                   </div>
                   <select 
                     value={formData.currency}
                     onChange={e => setFormData({...formData, currency: e.target.value})}
                     className="bg-transparent text-sm font-bold outline-none border-none" style={{ color: 'var(--primary)' }}
                   >
                     <option value="BRL">Real (R$)</option>
                     <option value="USD">Dólar ($)</option>
                     <option value="EUR">Euro (€)</option>
                   </select>
                 </div>

                 <div className="flex items-center justify-between p-4 rounded-2xl border border-[var(--border)]">
                   <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
                       {formData.theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                     </div>
                     <div>
                       <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>Tema do App</p>
                       <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Mude a aparência visual</p>
                     </div>
                   </div>
                   <select 
                     value={formData.theme}
                     onChange={e => setFormData({...formData, theme: e.target.value})}
                     className="bg-transparent text-sm font-bold outline-none border-none" style={{ color: 'var(--primary)' }}
                   >
                     <option value="system">Sistema</option>
                     <option value="light">Claro</option>
                     <option value="dark">Escuro</option>
                   </select>
                 </div>
               </div>

               <div className="pt-8 border-t border-[var(--border)]">
                  <h4 className="text-sm font-bold text-red-500 mb-4 flex items-center gap-2">
                    <Trash2 size={16} /> Zona de Perigo
                  </h4>
                  <button className="px-6 py-3 rounded-xl border border-red-200 text-red-500 text-xs font-bold hover:bg-red-50 transition-all">
                    Resetar todos os dados da conta
                  </button>
               </div>
            </div>
          )}

          {activeTab === 'seguranca' && (
            <div className="py-20 text-center opacity-40">
              <Shield size={48} className="mx-auto mb-4" />
              <p className="font-bold">Em breve: Autenticação em duas etapas</p>
            </div>
          )}

          {activeTab === 'notificacoes' && (
            <div className="py-20 text-center opacity-40">
              <Bell size={48} className="mx-auto mb-4" />
              <p className="font-bold">Em breve: Alertas de vencimento</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
