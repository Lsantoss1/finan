'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ArrowLeftRight, CreditCard, Target, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

const ITEMS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Início' },
  { href: '/transacoes', icon: ArrowLeftRight, label: 'Transações' },
  { href: '/cartoes', icon: CreditCard, label: 'Cartões' },
  { href: '/metas', icon: Target, label: 'Metas' },
  { href: '/relatorios', icon: BarChart3, label: 'Relatórios' },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden border-t" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
      <div className="flex items-center justify-around h-16 px-2">
        {ITEMS.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
          return (
            <Link key={href} href={href} className={cn('flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-colors', isActive ? 'text-[var(--primary)]' : 'text-[var(--text-muted)]')}>
              <Icon size={20} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
