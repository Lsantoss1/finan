'use client';
import { BarChart3 } from 'lucide-react';
export default function RelatoriosPage() {
  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--text)' }}>Relatórios</h1>
      <div className="rounded-2xl p-12 text-center" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <BarChart3 size={48} className="mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
        <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text)' }}>Em breve</h3>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>O módulo de relatórios será implementado na Fase 5.</p>
      </div>
    </div>
  );
}
