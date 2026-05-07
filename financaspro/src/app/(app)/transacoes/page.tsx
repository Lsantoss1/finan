'use client';
import { ArrowLeftRight } from 'lucide-react';

export default function TransacoesPage() {
  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Transações</h1>
      </div>
      <div className="rounded-2xl p-12 text-center" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <ArrowLeftRight size={48} className="mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
        <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text)' }}>Em breve</h3>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>O módulo de transações será implementado na próxima fase.</p>
      </div>
    </div>
  );
}
