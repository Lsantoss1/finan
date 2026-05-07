'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, TrendingUp, Mail, Lock, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(
        error.message === 'Invalid login credentials'
          ? 'Email ou senha incorretos'
          : error.message
      );
      setLoading(false);
      return;
    }

    toast.success('Login realizado com sucesso!');
    router.push('/dashboard');
    router.refresh();
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg)' }}>
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden gradient-primary items-center justify-center p-12">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-white/15 blur-2xl" />
        </div>
        <div className="relative z-10 text-white max-w-lg">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <TrendingUp size={28} className="text-white" />
            </div>
            <span className="text-3xl font-bold tracking-tight">FinançasPro</span>
          </div>
          <h1 className="text-4xl font-bold leading-tight mb-6">
            Suas finanças sob controle, de forma inteligente
          </h1>
          <p className="text-lg text-white/80 leading-relaxed">
            Gerencie receitas, despesas, cartões de crédito, orçamentos e metas financeiras em um único lugar. Simples, visual e poderoso.
          </p>
          <div className="mt-12 grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold">100%</div>
              <div className="text-sm text-white/70 mt-1">Gratuito</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">🔒</div>
              <div className="text-sm text-white/70 mt-1">Dados seguros</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">📊</div>
              <div className="text-sm text-white/70 mt-1">Relatórios</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center">
              <TrendingUp size={24} className="text-white" />
            </div>
            <span className="text-2xl font-bold" style={{ color: 'var(--text)' }}>FinançasPro</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
              Bem-vindo de volta
            </h2>
            <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>
              Entre na sua conta para continuar
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Email
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-xl text-sm transition-all duration-200 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                  }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Senha
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full pl-11 pr-12 py-3 rounded-xl text-sm transition-all duration-200 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-[var(--surface-hover)] transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Link
                href="/recuperar-senha"
                className="text-sm font-medium hover:underline"
                style={{ color: 'var(--primary)' }}
              >
                Esqueceu a senha?
              </Link>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-semibold text-white text-sm gradient-primary hover:opacity-90 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ boxShadow: '0 4px 14px rgba(108, 60, 224, 0.4)' }}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
            Não tem uma conta?{' '}
            <Link
              href="/cadastro"
              className="font-semibold hover:underline"
              style={{ color: 'var(--primary)' }}
            >
              Cadastre-se gratuitamente
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
