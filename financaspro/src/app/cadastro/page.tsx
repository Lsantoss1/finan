'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, TrendingUp, Mail, Lock, User, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CadastroPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) { toast.error('As senhas não coincidem'); return; }
    if (password.length < 6) { toast.error('A senha deve ter pelo menos 6 caracteres'); return; }
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { name } } });
    if (error) { toast.error(error.message); setLoading(false); return; }
    toast.success('Conta criada com sucesso!');
    router.push('/dashboard');
    router.refresh();
  };

  const inputStyle = { background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg)' }}>
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden gradient-primary items-center justify-center p-12">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
        </div>
        <div className="relative z-10 text-white max-w-lg">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <TrendingUp size={28} />
            </div>
            <span className="text-3xl font-bold tracking-tight">FinançasPro</span>
          </div>
          <h1 className="text-4xl font-bold leading-tight mb-6">Comece a organizar sua vida financeira hoje</h1>
          <p className="text-lg text-white/80 leading-relaxed">Crie sua conta gratuita e tenha acesso a ferramentas poderosas para controlar seu dinheiro.</p>
          <div className="mt-12 space-y-4">
            {['Controle de receitas e despesas', 'Gestão de cartões de crédito', 'Orçamentos e metas financeiras', 'Relatórios e gráficos detalhados'].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm">✓</div>
                <span className="text-white/90">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md animate-fade-in">
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center"><TrendingUp size={24} className="text-white" /></div>
            <span className="text-2xl font-bold" style={{ color: 'var(--text)' }}>FinançasPro</span>
          </div>
          <div className="mb-8">
            <h2 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Criar conta</h2>
            <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>Preencha os dados abaixo para começar</p>
          </div>
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Nome completo</label>
              <div className="relative">
                <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input id="signup-name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" required className="w-full pl-11 pr-4 py-3 rounded-xl text-sm focus:ring-2 focus:ring-[var(--primary)]" style={inputStyle} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input id="signup-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" required className="w-full pl-11 pr-4 py-3 rounded-xl text-sm focus:ring-2 focus:ring-[var(--primary)]" style={inputStyle} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Senha</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input id="signup-password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" required minLength={6} className="w-full pl-11 pr-12 py-3 rounded-xl text-sm focus:ring-2 focus:ring-[var(--primary)]" style={inputStyle} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-lg" style={{ color: 'var(--text-muted)' }}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Confirmar senha</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input id="signup-confirm" type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repita a senha" required minLength={6} className="w-full pl-11 pr-4 py-3 rounded-xl text-sm focus:ring-2 focus:ring-[var(--primary)]" style={inputStyle} />
              </div>
            </div>
            <button id="signup-submit" type="submit" disabled={loading} className="w-full py-3.5 rounded-xl font-semibold text-white text-sm gradient-primary hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-6" style={{ boxShadow: '0 4px 14px rgba(108, 60, 224, 0.4)' }}>
              {loading ? <><Loader2 size={18} className="animate-spin" />Criando conta...</> : 'Criar conta gratuita'}
            </button>
          </form>
          <p className="mt-8 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
            Já tem uma conta?{' '}<Link href="/login" className="font-semibold hover:underline" style={{ color: 'var(--primary)' }}>Entrar</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
