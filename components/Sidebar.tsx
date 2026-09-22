'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/lib/ThemeContext';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Car, 
  User, 
  Settings, 
  LogOut,
  Code2
} from 'lucide-react'; // Ensure lucide-react is installed

const NAV_ITEMS = [
  { label: 'Invest', href: '/invest', icon: TrendingUp },
  { label: 'Trade', href: '/trade', icon: LayoutDashboard },
  { label: 'Drive', href: '/drive', icon: Car },
];

export function Sidebar() {
  const pathname = usePathname();
  const { accentColor } = useTheme();

  return (
    <aside 
      className="fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r transition-colors duration-300"
      style={{ 
        backgroundColor: 'var(--theme-surface)',
        borderColor: 'var(--theme-border)'
      }}
    >
      {/* Logo Area */}
      <div className="flex h-16 items-center px-6 font-bold text-xl tracking-tight">
        <span style={{ color: accentColor }}>ITD</span>
        <span className="ml-1 opacity-60">.</span>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname?.startsWith(item.href);
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                isActive ? 'font-semibold' : 'opacity-70 hover:opacity-100'
              }`}
              style={{
                backgroundColor: isActive ? `${accentColor}15` : 'transparent',
                color: isActive ? accentColor : 'var(--theme-text)',
                borderLeft: isActive ? `3px solid ${accentColor}` : '3px solid transparent'
              }}
            >
              <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section: Profile & Admin */}
      <div className="space-y-1 border-t px-3 py-4" style={{ borderColor: 'var(--theme-border)' }}>
        <Link 
          href="/profile" 
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium opacity-70 hover:opacity-100 transition-opacity"
          style={{ color: 'var(--theme-text)' }}
        >
          <User size={18} />
          Profile
        </Link>
        
        {/* Developer Mode - Only visible to admins in real implementation */}
        <button 
          className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium opacity-50 hover:opacity-100 transition-opacity text-left"
          style={{ color: 'var(--theme-text-muted)' }}
        >
          <Code2 size={18} />
          Dev Mode
        </button>

        <button 
          className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium opacity-50 hover:text-red-400 transition-colors text-left"
          style={{ color: 'var(--theme-text-muted)' }}
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
