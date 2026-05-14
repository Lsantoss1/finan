'use client';

import { motion } from 'framer-motion';
import { Wifi } from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';

export type BankType = 'nubank' | 'inter' | 'itau' | 'santander' | 'c6' | 'bradesco' | 'bb' | 'neon' | 'generic';

interface CreditCardVisualProps {
  name: string;
  lastDigits: string;
  limit: number;
  used: number;
  color?: string;
  brand?: 'visa' | 'mastercard' | 'elo' | 'generic';
  bank?: BankType;
  scale?: number;
}

export const detectBank = (name: string): BankType => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('nubank') || lowerName.includes('nu bank') || lowerName.includes('roxinho')) return 'nubank';
  if (lowerName.includes('inter')) return 'inter';
  if (lowerName.includes('itau')) return 'itau';
  if (lowerName.includes('santander')) return 'santander';
  if (lowerName.includes('c6')) return 'c6';
  if (lowerName.includes('bradesco')) return 'bradesco';
  if (lowerName.includes('brasil') || lowerName.includes(' bance do brasil') || lowerName.includes(' bb')) return 'bb';
  if (lowerName.includes('neon')) return 'neon';
  return 'generic';
};

const bankStyles: Record<BankType, { gradient: string, textColor: string, pattern?: string }> = {
  nubank: {
    gradient: 'linear-gradient(135deg, #8a05be, #530082)',
    textColor: '#ffffff',
    pattern: 'radial-gradient(circle at top right, rgba(255,255,255,0.1) 0%, transparent 70%)'
  },
  inter: {
    gradient: 'linear-gradient(135deg, #ff7a00, #ff5000)',
    textColor: '#ffffff'
  },
  itau: {
    gradient: 'linear-gradient(135deg, #003399, #001a4d)',
    textColor: '#ffffff'
  },
  santander: {
    gradient: 'linear-gradient(135deg, #ec0000, #b30000)',
    textColor: '#ffffff'
  },
  c6: {
    gradient: 'linear-gradient(135deg, #2d2d2d, #000000)',
    textColor: '#ffffff',
    pattern: 'linear-gradient(45deg, rgba(255,255,255,0.05) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.05) 75%, transparent 75%, transparent)'
  },
  bradesco: {
    gradient: 'linear-gradient(135deg, #cc092f, #a00724)',
    textColor: '#ffffff'
  },
  bb: {
    gradient: 'linear-gradient(135deg, #fcfc30, #005aa5)',
    textColor: '#005aa5'
  },
  neon: {
    gradient: 'linear-gradient(135deg, #00e5ff, #00a0b2)',
    textColor: '#ffffff'
  },
  generic: {
    gradient: 'linear-gradient(135deg, var(--color-primary, #6c3ce0), var(--color-primary-dark, #530082))',
    textColor: '#ffffff'
  }
};

export default function CreditCardVisual({ 
  name, 
  lastDigits, 
  limit, 
  used, 
  color, 
  brand = 'generic',
  bank = 'generic',
  scale = 1
}: CreditCardVisualProps) {
  const available = limit - used;
  const progress = (used / limit) * 100;
  
  const detectedBank = bank === 'generic' ? detectBank(name) : bank;
  const currentStyle = bankStyles[detectedBank] || bankStyles.generic;
  const background = color && detectedBank === 'generic' 
    ? `linear-gradient(135deg, ${color}, ${color}dd)` 
    : currentStyle.gradient;

  return (
    <motion.div 
      whileHover={{ scale: scale * 1.05, rotateY: 5, rotateX: -5 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="relative w-full aspect-[1.586/1] rounded-3xl p-6 overflow-hidden shadow-2xl cursor-pointer preserve-3d origin-center"
      style={{ background, color: currentStyle.textColor, transform: `scale(${scale})` }}
    >
      {/* Texture Layer */}
      {currentStyle.pattern && (
        <div className="absolute inset-0 opacity-20" style={{ background: currentStyle.pattern, backgroundSize: '20px 20px' }} />
      )}

      {/* Decorative glows */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full blur-2xl -ml-10 -mb-10" />
      
      <div className="relative z-10 h-full flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">
              {detectedBank !== 'generic' ? detectedBank.toUpperCase() : 'FinançasPro'} PLATINUM
            </span>
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
              <span className="opacity-70">Limite Disponível</span>
              <span>{formatCurrency(available)}</span>
            </div>
            <div className="h-1.5 w-full bg-black/20 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className={cn("h-full rounded-full", bank === 'bb' ? "bg-blue-600" : "bg-white/60")}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between items-end">
          <div className="flex flex-col">
            <span className="text-[8px] font-bold uppercase opacity-60">Expira em</span>
            <span className="text-xs font-bold tabular-nums">12/29</span>
          </div>
          <div className="flex flex-col items-end">
             {brand === 'visa' ? (
               <span className="italic font-black text-xl italic tracking-tighter">VISA</span>
             ) : (
               <div className="flex -space-x-2">
                 <div className="w-8 h-8 rounded-full bg-red-500/80 shadow-sm" />
                 <div className="w-8 h-8 rounded-full bg-orange-500/80 shadow-sm" />
               </div>
             )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
