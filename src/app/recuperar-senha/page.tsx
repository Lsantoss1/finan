'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { TrendingUp, Mail, Loader2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const supabase = createClient();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/auth/callback` });
    if (error) { toast.error(error.message); setLoading(false); return; }
    setSent(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-md animate-fade-in">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center"><TrendingUp size={24} className="text-white" /></div>
          <span className="text-2xl font-bold" style={{ color: 'var(--text)' }}>FinançasPro</span>
        </div>
        {sent ? (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center text-3xl" style={{ background: 'var(--success-bg)' }}>📧</div>
            <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--text)' }}>Email enviado!</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Verifique sua caixa de entrada em <strong>{email}</strong> para redefinir sua senha.</p>
            <Link href="/login" className="inline-flex items-center gap-2 mt-8 font-semibold" style={{ color: 'var(--primary)' }}><ArrowLeft size={18} />Voltar ao login</Link>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Recuperar senha</h2>
              <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>Informe seu email para receber o link de recuperação</p>
            </div>
            <form onSubmit={handleReset} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Email</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" required className="w-full pl-11 pr-4 py-3 rounded-xl text-sm focus:ring-2 focus:ring-[var(--primary)]" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl font-semibold text-white text-sm gradient-primary hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2" style={{ boxShadow: '0 4px 14px rgba(108, 60, 224, 0.4)' }}>
                {loading ? <><Loader2 size={18} className="animate-spin" />Enviando...</> : 'Enviar link de recuperação'}
              </button>
            </form>
            <p className="mt-8 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
              Lembrou a senha?{' '}<Link href="/login" className="font-semibold hover:underline" style={{ color: 'var(--primary)' }}>Entrar</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
