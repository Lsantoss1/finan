'use client';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import { useUIStore } from '@/stores/useUIStore';
import { cn } from '@/lib/utils';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Sidebar />
      <div className={cn('transition-all duration-300', sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-[260px]')}>
        <Header />
        <main className="p-4 sm:p-6 pb-24 lg:pb-6 min-h-[calc(100vh-64px)]">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
