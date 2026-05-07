'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUIStore } from '@/stores/useUIStore';
import { LayoutDashboard, ArrowLeftRight, Landmark, CreditCard, Target, PieChart, BarChart3, Settings, ChevronLeft, TrendingUp, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/transacoes', icon: ArrowLeftRight, label: 'Transações' },
  { href: '/contas', icon: Landmark, label: 'Contas' },
  { href: '/cartoes', icon: CreditCard, label: 'Cartões' },
  { href: '/orcamentos', icon: PieChart, label: 'Orçamentos' },
  { href: '/metas', icon: Target, label: 'Metas' },
  { href: '/relatorios', icon: BarChart3, label: 'Relatórios' },
  { href: '/configuracoes', icon: Settings, label: 'Configurações' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar, sidebarMobileOpen, setSidebarMobileOpen } = useUIStore();

  return (
    <>
      {/* Mobile overlay */}
      {sidebarMobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarMobileOpen(false)} />
      )}

      <aside className={cn(
        'fixed top-0 left-0 z-50 h-screen flex flex-col transition-all duration-300 ease-in-out',
        sidebarCollapsed ? 'w-[72px]' : 'w-[260px]',
        sidebarMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )} style={{ background: 'var(--sidebar-bg)' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-white/10">
          <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
              <TrendingUp size={18} className="text-white" />
            </div>
            {!sidebarCollapsed && <span className="text-white font-bold text-lg whitespace-nowrap">FinançasPro</span>}
          </Link>
          <button onClick={() => setSidebarMobileOpen(false)} className="lg:hidden text-white/60 hover:text-white p-1"><X size={20} /></button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
            return (
              <Link key={href} href={href} onClick={() => setSidebarMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group',
                  isActive ? 'bg-[var(--primary)] text-white shadow-lg' : 'text-white/60 hover:text-white hover:bg-white/5',
                  sidebarCollapsed && 'justify-center px-0'
                )}
                style={isActive ? { boxShadow: '0 4px 12px rgba(108, 60, 224, 0.4)' } : {}}
                title={sidebarCollapsed ? label : undefined}>
                <Icon size={20} className="flex-shrink-0" />
                {!sidebarCollapsed && <span className="text-sm font-medium">{label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Collapse button */}
        <div className="hidden lg:block px-3 pb-4">
          <button onClick={toggleSidebar}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/40 hover:text-white/70 hover:bg-white/5 transition-all w-full"
            style={sidebarCollapsed ? { justifyContent: 'center' } : {}}>
            <ChevronLeft size={20} className={cn('transition-transform', sidebarCollapsed && 'rotate-180')} />
            {!sidebarCollapsed && <span className="text-sm">Recolher</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
