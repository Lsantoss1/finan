'use client';
import { Target } from 'lucide-react';
export default function MetasPage() {
  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--text)' }}>Metas Financeiras</h1>
      <div className="rounded-2xl p-12 text-center" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <Target size={48} className="mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
        <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text)' }}>Em breve</h3>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>O módulo de metas será implementado na Fase 4.</p>
      </div>
    </div>
  );
}
