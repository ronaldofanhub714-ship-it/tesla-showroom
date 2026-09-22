'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabaseClient';

type ThemeMode = 'dark' | 'light';

interface ThemeContextType {
  mode: ThemeMode;
  accentColor: string;
  setAccentColor: (color: string) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: 'dark',
  accentColor: '#6366f1',
  setAccentColor: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [mode, setMode] = useState<ThemeMode>('dark');
  const [accentColor, setAccentColor] = useState('#6366f1');

  // Determine base theme by route
  useEffect(() => {
    if (pathname?.startsWith('/trade')) {
      setMode('light');
      setAccentColor('#000000');
    } else if (pathname?.startsWith('/invest')) {
      setMode('dark');
      setAccentColor('#6366f1');
    } else if (pathname?.startsWith('/drive')) {
      setMode('dark');
      // Car color will be set dynamically by Drive pages
      setAccentColor('#ffffff'); 
    } else {
      setMode('dark');
      setAccentColor('#6366f1');
    }
  }, [pathname]);

  // Fetch car color when on a specific vehicle page
  useEffect(() => {
    const fetchCarColor = async () => {
      // Match /drive/[vin] or /drive/vehicles/[id] patterns
      const match = pathname?.match(/\/drive\/(?:vehicles\/)?([^/?]+)/);
      if (!match) return;

      const identifier = match[1];
      const supabase = createClient();

      // Try VIN first, then ID
      let { data } = await supabase
        .from('vehicles')
        .select('primary_color')
        .eq('vin', identifier)
        .single();

      if (!data) {
        ({ data } = await supabase
          .from('vehicles')
          .select('primary_color')
          .eq('id', identifier)
          .single());
      }

      if (data?.primary_color) {
        setAccentColor(data.primary_color);
      }
    };

    if (pathname?.startsWith('/drive')) {
      fetchCarColor();
    }
  }, [pathname]);

  // Inject CSS variables into :root for global access
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);
    document.documentElement.style.setProperty('--theme-accent', accentColor);
    
    // Calculate glow color with opacity
    const hex = accentColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    document.documentElement.style.setProperty(
      '--theme-accent-glow', 
      `rgba(${r}, ${g}, ${b}, 0.15)`
    );
  }, [mode, accentColor]);

  return (
    <ThemeContext.Provider value={{ mode, accentColor, setAccentColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
