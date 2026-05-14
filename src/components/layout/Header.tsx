'use client';
import { useUIStore } from '@/stores/useUIStore';
import { useUser } from '@/hooks/useUser';
import { getGreeting } from '@/lib/utils';
import { Menu, Sun, Moon, Monitor, LogOut, Bell } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Header() {
  const { sidebarCollapsed, setSidebarMobileOpen, theme, setTheme } = useUIStore();
  const { profile, signOut } = useUser();
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const themeRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) setShowThemeMenu(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setShowUserMenu(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
    router.refresh();
  };

  const themeIcon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor;
  const ThemeIcon = themeIcon;

  return (
    <header className="h-16 flex items-center justify-between px-4 sm:px-6 border-b" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
      <div className="flex items-center gap-4">
        <button onClick={() => setSidebarMobileOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-[var(--surface-hover)]" style={{ color: 'var(--text-secondary)' }}>
          <Menu size={20} />
        </button>
        <div className="flex flex-col">
          <h2 className="text-lg font-bold tracking-tight" style={{ color: 'var(--text)' }}>
            {!isMounted ? '...' : <>{getGreeting()}{profile?.name ? `, ${profile.name.split(' ')[0]}` : ''}! 👋</>}
          </h2>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Saúde: Estável</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Notifications */}
        <button className="p-2.5 rounded-xl hover:bg-[var(--surface-hover)] transition-colors relative" style={{ color: 'var(--text-secondary)' }}>
          <Bell size={20} />
        </button>

        {/* Theme */}
        <div className="relative" ref={themeRef}>
          <button onClick={() => setShowThemeMenu(!showThemeMenu)} className="p-2.5 rounded-xl hover:bg-[var(--surface-hover)] transition-colors" style={{ color: 'var(--text-secondary)' }}>
            <ThemeIcon size={20} />
          </button>
          {showThemeMenu && (
            <div className="absolute right-0 top-full mt-2 w-40 rounded-xl p-1 animate-scale-in z-50" style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-xl)' }}>
              {[{ value: 'light' as const, icon: Sun, label: 'Claro' }, { value: 'dark' as const, icon: Moon, label: 'Escuro' }, { value: 'system' as const, icon: Monitor, label: 'Sistema' }].map(({ value, icon: Icon, label }) => (
                <button key={value} onClick={() => { setTheme(value); setShowThemeMenu(false); }}
                  className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm hover:bg-[var(--surface-hover)] transition-colors"
                  style={{ color: theme === value ? 'var(--primary)' : 'var(--text-secondary)' }}>
                  <Icon size={16} />{label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User */}
        <div className="relative" ref={userRef}>
          <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-[var(--surface-hover)] transition-colors">
            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-bold">
              {profile?.name?.[0]?.toUpperCase() || '?'}
            </div>
          </button>
          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 rounded-xl p-1 animate-scale-in z-50" style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-xl)' }}>
              <div className="px-3 py-2 border-b" style={{ borderColor: 'var(--border)' }}>
                <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{profile?.name || 'Usuário'}</p>
              </div>
              <button onClick={handleSignOut} className="flex items-center gap-3 w-full px-3 py-2 mt-1 rounded-lg text-sm hover:bg-[var(--danger-bg)] transition-colors" style={{ color: 'var(--danger)' }}>
                <LogOut size={16} />Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
