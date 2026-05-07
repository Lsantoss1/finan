'use client';

import { motion } from 'framer-motion';
import { CreditCard as CardIcon, Wifi } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface CreditCardVisualProps {
  name: string;
  lastDigits: string;
  limit: number;
  used: number;
  color?: string;
  brand?: 'visa' | 'mastercard' | 'elo' | 'generic';
}

export default function CreditCardVisual({ name, lastDigits, limit, used, color = '#6c3ce0', brand = 'generic' }: CreditCardVisualProps) {
  const available = limit - used;
  const progress = (used / limit) * 100;

  return (
    <motion.div 
      whileHover={{ scale: 1.05, rotateY: 5, rotateX: -5 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="relative w-full aspect-[1.586/1] rounded-3xl p-6 text-white overflow-hidden shadow-2xl cursor-pointer preserve-3d"
      style={{ background: `linear-gradient(135deg, ${color}, ${color}dd)` }}
    >
      {/* Decorative patterns */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full blur-2xl -ml-10 -mb-10" />
      
      <div className="relative z-10 h-full flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">FinançasPro Platinum</span>
            <h4 className="text-xl font-black tracking-tight">{name}</h4>
          </div>
          <Wifi className="opacity-50" size={20} />
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-9 bg-amber-400/80 rounded-md shadow-inner relative overflow-hidden">
               <div className="absolute inset-0 grid grid-cols-3 divide-x divide-black/10 border border-black/5">
                 <div/><div/><div/>
               </div>
            </div>
            <div className="text-lg font-mono tracking-[0.2em] opacity-80">
              **** **** **** {lastDigits}
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
              <span>Limite Disponível</span>
              <span>{formatCurrency(available)}</span>
            </div>
            <div className="h-1.5 w-full bg-black/20 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-white/60 rounded-full"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between items-end">
          <div className="flex flex-col">
            <span className="text-[8px] font-bold uppercase opacity-60">Expira em</span>
            <span className="text-xs font-bold">12/29</span>
          </div>
          <div className="flex flex-col items-end">
             {brand === 'visa' ? (
               <span className="italic font-black text-xl italic tracking-tighter">VISA</span>
             ) : (
               <div className="flex -space-x-2">
                 <div className="w-8 h-8 rounded-full bg-red-500/80" />
                 <div className="w-8 h-8 rounded-full bg-orange-500/80" />
               </div>
             )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
