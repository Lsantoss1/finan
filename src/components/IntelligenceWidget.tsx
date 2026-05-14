'use client';

import { motion } from 'framer-motion';
import { Brain, TrendingUp, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import { AIService } from '@/lib/ai';
import { analyzeFinancialState } from '@/app/actions/ai';
import toast from 'react-hot-toast';
import { useState } from 'react';

interface IntelligenceWidgetProps {
  balance: number;
  income: number;
  expense: number;
  subscriptions: number;
  loading?: boolean;
}

export default function IntelligenceWidget({ balance, income, expense, subscriptions, loading }: IntelligenceWidgetProps) {
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (loading || !isMounted) return <div className="h-64 skeleton rounded-[2.5rem]" />;

  const today = new Date();
  const dailyAvg = expense / today.getDate();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const daysRemaining = daysInMonth - today.getDate();
  const projectedExtraExpense = dailyAvg * daysRemaining;
  const projectedBalance = balance - projectedExtraExpense;

  const savingsRate = income > 0 ? ((income - expense) / income) * 100 : 0;
  
  const insight = AIService.generateInsight({ balance, income, expense });
  
  let status = { label: 'Estável', color: 'text-blue-500', icon: ShieldCheck, bg: 'bg-blue-500/10' };
  if (savingsRate > 30) status = { label: 'Excelente', color: 'text-emerald-500', icon: Zap, bg: 'bg-emerald-500/10' };
  if (savingsRate < 10) status = { label: 'Atenção', color: 'text-amber-500', icon: AlertTriangle, bg: 'bg-amber-500/10' };
  if (balance < 0 || projectedBalance < 0) status = { label: 'Crítico', color: 'text-rose-500', icon: AlertTriangle, bg: 'bg-rose-500/10' };

  const handleSuperAnalysis = async () => {
    setAnalyzing(true);
    try {
      const res = await analyzeFinancialState({ balance, income, expense, subscriptions });
      if (res.error) {
        toast.error("IA na Nuvem indisponível. Usando Inteligência Local.");
        // Fallback local instantâneo
        const localInsight = AIService.generateInsight({ balance, income, expense });
        setAiInsight("Consultor Local: " + localInsight);
      } else {
        setAiInsight(res.text || null);
        toast.success("Coach: Análise concluída!");
      }
    } catch (e) {
      const localInsight = AIService.generateInsight({ balance, income, expense });
      setAiInsight("Consultor Local: " + localInsight);
      toast.error("Erro na conexão. Inteligência Local ativada.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="apple-glass p-8 rounded-[2.5rem] relative overflow-hidden group mb-8"
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary)] blur-[100px] opacity-10 group-hover:opacity-20 transition-opacity" />
      
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[var(--primary-bg)] flex items-center justify-center">
              <Brain className="text-[var(--primary)]" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg" style={{ color: 'var(--text)' }}>Inteligência Financeira</h3>
              <p className="text-xs opacity-50 font-medium">Análise preditiva em tempo real</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleSuperAnalysis}
              disabled={analyzing}
              className={cn(
                "px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-bold shadow-sm transition-all",
                analyzing ? "bg-purple-500/20 text-purple-500" : "bg-purple-600 text-white hover:bg-purple-700"
              )}
            >
              <Zap size={14} className={analyzing ? "animate-pulse" : ""} />
              {analyzing ? "Analisando..." : "Modo Super Gemini"}
            </button>
            <div className={cn("px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-bold shadow-sm", status.bg, status.color)}>
              <status.icon size={14} />
              {status.label}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Projeção p/ Fim do Mês</p>
              <h4 className={cn("text-2xl font-black", projectedBalance < 0 ? "text-red-500" : "text-[var(--text)]")}>
                {formatCurrency(projectedBalance)}
              </h4>
            </div>
            <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)]">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={14} className="text-emerald-500" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Taxa de Economia</span>
              </div>
              <p className="text-lg font-bold" style={{ color: 'var(--text)' }}>{savingsRate.toFixed(1)}%</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Custo de Assinaturas (Mensal)</p>
              <div className="flex items-baseline gap-2">
                <h4 className="text-2xl font-black text-rose-500">
                  {formatCurrency(subscriptions)}
                </h4>
                <span className="text-[10px] font-bold text-rose-500/50 uppercase">
                  {formatCurrency(subscriptions * 12)} / ano
                </span>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)]">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1 italic">Insights do {aiInsight ? 'Super Gemini' : 'Consultor'}</p>
              <p className="text-[11px] leading-relaxed whitespace-pre-line" style={{ color: 'var(--text-secondary)' }}>
                {aiInsight || insight}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
