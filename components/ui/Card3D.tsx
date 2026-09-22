'use client';

import { useTheme } from '@/lib/ThemeContext';
import type { ReactNode } from 'react';

interface Card3DProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children?: ReactNode;
  className?: string;
  accentColor?: string; // Optional override for specific card colors
}

export function Card3D({ title, subtitle, icon, children, className = '', accentColor }: Card3DProps) {
  const { accentColor: themeAccent } = useTheme();
  const activeAccent = accentColor || themeAccent;

  return (
    <article 
      className={`d3-card ${className}`}
      style={{ '--card-accent': activeAccent } as React.CSSProperties}
    >
      {/* Header Section */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold tracking-tight" style={{ color: 'var(--theme-text)' }}>
            {title}
          </h3>
          {subtitle && (
            <p className="mt-1 text-sm opacity-70" style={{ color: 'var(--theme-text-muted)' }}>
              {subtitle}
            </p>
          )}
        </div>
        {icon && (
          <div 
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
            style={{ 
              background: `color-mix(in srgb, var(--card-accent) 20%, transparent)`,
              color: 'var(--card-accent)' 
            }}
          >
            {icon}
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="mt-auto pt-4">
        {children}
      </div>

      {/* Barcode / Decorative Element (CodeFronts Signature) */}
      <i 
        className="absolute bottom-4 right-4 h-3.5 w-16 rounded-sm opacity-60"
        style={{
          backgroundImage: `repeating-linear-gradient(90deg, var(--card-accent) 0 2px, transparent 2px 4px, var(--card-accent) 4px 5px, transparent 5px 8px)`
        }}
        aria-hidden="true"
      />
    </article>
  );
}

/**
 * Wrapper component to create the shared 3D perspective scene.
 * MUST wrap any group of Card3D components for the effect to work.
 */
export function Card3DRail({ children }: { children: ReactNode }) {
  return (
    <div className="d3-stage">
      <div className="d3-rail">
        {children}
      </div>
    </div>
  );
}
