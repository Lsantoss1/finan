'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Plus, 
  LayoutDashboard, 
  ArrowLeftRight, 
  Landmark, 
  CreditCard, 
  Tags, 
  Calendar, 
  Brain,
  Sun,
  Moon,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores/useUIStore';
import { useUser } from '@/hooks/useUser';
import TransactionModal from '@/components/modals/TransactionModal';

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [showTxModal, setShowTxModal] = useState(false);
  const { theme, setTheme } = useUIStore();
  const { signOut } = useUser();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const actions = [
    { id: 'new-tx', label: 'Nova Transação', icon: Plus, shortcut: 'N', action: () => { setShowTxModal(true); setIsOpen(false); } },
    { id: 'dash', label: 'Ir para Dashboard', icon: LayoutDashboard, action: () => { router.push('/dashboard'); setIsOpen(false); } },
    { id: 'txs', label: 'Ver Transações', icon: ArrowLeftRight, action: () => { router.push('/transacoes'); setIsOpen(false); } },
    { id: 'cards', label: 'Minha Carteira (Cartões)', icon: CreditCard, action: () => { router.push('/cartoes'); setIsOpen(false); } },
    { id: 'cal', label: 'Calendário Financeiro', icon: Calendar, action: () => { router.push('/calendario'); setIsOpen(false); } },
    { id: 'plan', label: 'Planejamento', icon: Brain, action: () => { router.push('/planejamento'); setIsOpen(false); } },
    { id: 'theme-light', label: 'Tema Claro', icon: Sun, action: () => { setTheme('light'); setIsOpen(false); } },
    { id: 'theme-dark', label: 'Tema Escuro', icon: Moon, action: () => { setTheme('dark'); setIsOpen(false); } },
    { id: 'logout', label: 'Sair do Sistema', icon: LogOut, action: () => { signOut(); router.push('/login'); setIsOpen(false); } },
  ];

  const filteredActions = actions.filter(a => 
    a.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="relative w-full max-w-xl apple-glass rounded-[2rem] overflow-hidden shadow-2xl border border-white/10"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center px-6 py-4 border-b border-white/5">
                <Search className="text-gray-400 mr-3" size={20} />
                <input 
                  ref={inputRef}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="O que você deseja fazer?"
                  className="w-full bg-transparent border-none outline-none text-lg font-medium"
                  style={{ color: 'var(--text)' }}
                />
                <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold opacity-50">
                   ESC
                </div>
              </div>

              <div className="max-h-[400px] overflow-y-auto p-2">
                {filteredActions.length === 0 ? (
                  <div className="py-12 text-center text-sm opacity-40 italic">Nenhum comando encontrado...</div>
                ) : (
                  filteredActions.map((action, i) => (
                    <button 
                      key={action.id}
                      onClick={action.action}
                      className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl hover:bg-white/5 transition-all group text-left"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-all">
                          <action.icon size={20} className="text-[var(--primary)]" />
                        </div>
                        <span className="font-bold text-sm" style={{ color: 'var(--text)' }}>{action.label}</span>
                      </div>
                      {action.shortcut && (
                        <div className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold opacity-50">
                           {action.shortcut}
                        </div>
                      )}
                    </button>
                  ))
                )}
              </div>
              
              <div className="p-4 bg-black/20 border-t border-white/5 flex justify-between items-center">
                 <p className="text-[10px] font-bold uppercase tracking-widest opacity-30">FinançasPro Command Center</p>
                 <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 opacity-30">
                       <span className="text-[10px] font-bold">↑↓</span>
                       <span className="text-[10px] font-bold">Navegar</span>
                    </div>
                    <div className="flex items-center gap-1.5 opacity-30">
                       <span className="text-[10px] font-bold">↵</span>
                       <span className="text-[10px] font-bold">Selecionar</span>
                    </div>
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <TransactionModal 
        isOpen={showTxModal} 
        onClose={() => setShowTxModal(false)} 
        onSuccess={() => window.dispatchEvent(new CustomEvent('transaction-added'))}
      />
    </>
  );
}
