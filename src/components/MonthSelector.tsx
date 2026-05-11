'use client';

import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { format, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MonthSelectorProps {
  currentDate: Date;
  onChange: (date: Date) => void;
}

export default function MonthSelector({ currentDate, onChange }: MonthSelectorProps) {
  const handlePrev = () => onChange(subMonths(currentDate, 1));
  const handleNext = () => onChange(addMonths(currentDate, 1));

  return (
    <div className="flex items-center justify-between p-1 rounded-2xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <button 
        onClick={handlePrev}
        className="p-2 rounded-xl hover:bg-[var(--surface-hover)] transition-colors"
        style={{ color: 'var(--text-secondary)' }}
      >
        <ChevronLeft size={20} />
      </button>
      
      <div className="flex items-center gap-2 px-4">
        <Calendar size={18} style={{ color: 'var(--primary)' }} />
        <span className="text-sm font-bold capitalize" style={{ color: 'var(--text)' }}>
          {format(currentDate, "MMMM 'de' yyyy", { locale: ptBR })}
        </span>
      </div>

      <button 
        onClick={handleNext}
        className="p-2 rounded-xl hover:bg-[var(--surface-hover)] transition-colors"
        style={{ color: 'var(--text-secondary)' }}
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
}
