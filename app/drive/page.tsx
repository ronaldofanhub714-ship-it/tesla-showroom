'use client';

import { useState } from 'react';
import { Card3D, Card3DRail } from '@/components/ui/Card3D';
import { useTheme } from '@/lib/ThemeContext';
import { 
  Zap, 
  Gauge, 
  Wind, 
  Shield, 
  Music, 
  ChevronRight,
  Calendar,
  CreditCard
} from 'lucide-react';

// Mock vehicle data - replace with Supabase fetch in production
const VEHICLE = {
  name: 'Valkyrie',
  brand: 'Aston Martin',
  year: '2022',
  tagline: 'Uncompromised Power',
  description: 'A fusion of cutting-edge engineering and timeless Aston Martin design.',
  image: '/vehicles/valkyrie-side.png', // Replace with actual asset
  specs: [
    { label: 'Passenger Capacity', value: '2', icon: <Shield size={18} /> },
    { label: 'Engine', value: '6.5L V12 + Hybrid', sub: 'Naturally Aspirated', icon: <Zap size={18} /> },
    { label: 'Power', value: '1160 hp', sub: '@ 10,500 rpm', icon: <Gauge size={18} /> },
    { label: 'Transmission', value: '7-speed', sub: 'Sequential', icon: <Wind size={18} /> },
    { label: '0-100 km/h', value: '2.5 sec', icon: <Gauge size={18} /> },
    { label: 'Top Speed', value: '402 km/h', icon: <ChevronRight size={18} /> },
  ],
  features: ['Performance', 'Design', 'Safety', 'Luxury', 'Multimedia'],
};

export default function DrivePage() {
  const { accentColor } = useTheme();
  const [activeFeature, setActiveFeature] = useState('Performance');

  return (
    <div className="min-h-screen pl-64"> {/* Accounts for fixed sidebar */}
      
      {/* Top Navigation Bar (Module-Specific) */}
      <nav className="sticky top-0 z-40 flex items-center justify-between px-8 py-4 border-b backdrop-blur-md"
           style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}>
        <div className="flex items-center gap-6">
          <h2 className="text-xl font-bold">{VEHICLE.brand}</h2>
          <span className="opacity-50">/</span>
          <span className="font-medium">{VEHICLE.name} • {VEHICLE.year}</span>
        </div>
        
        {/* Feature Tabs */}
        <div className="flex gap-1 p-1 rounded-full" style={{ background: 'rgba(128,128,128,0.1)' }}>
          {VEHICLE.features.map((feat) => (
            <button
              key={feat}
              onClick={() => setActiveFeature(feat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                activeFeature === feat ? 'shadow-sm' : 'opacity-60 hover:opacity-100'
              }`}
              style={{
                backgroundColor: activeFeature === feat ? accentColor : 'transparent',
                color: activeFeature === feat ? '#fff' : 'var(--theme-text)',
              }}
            >
              {feat}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content Grid */}
      <main className="p-8 grid grid-cols-12 gap-8">
        
        {/* Left Column: Hero Image & Tagline (8 cols) */}
        <section className="col-span-8 relative min-h-[500px] flex flex-col justify-end overflow-hidden rounded-3xl glass-panel p-8">
          {/* Background Image Placeholder */}
          <div className="absolute inset-0 opacity-80 bg-gradient-to-br from-gray-800 to-black">
            {/* Replace with actual <Image src={VEHICLE.image} ... /> */}
            <div className="w-full h-full flex items-center justify-center text-white/20 text-9xl font-bold select-none">
              CAR RENDER
            </div>
          </div>
          
          {/* Overlay Content */}
          <div className="relative z-10 max-w-xl">
            <span className="inline-block px-3 py-1 mb-4 text-xs font-bold uppercase tracking-widest rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
              {VEHICLE.tagline}
            </span>
            <p className="text-lg leading-relaxed opacity-90">
              {VEHICLE.description}
            </p>
            
            {/* Hotspot Indicators (Visual Only for Demo) */}
            <div className="mt-8 flex gap-4">
              {['Aerodynamic Design', 'Carbon Fiber Mono'].map((label, i) => (
                <div key={i} className="flex items-center gap-2 text-sm font-medium">
                  <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: accentColor }} />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Right Column: Action Cards (4 cols) */}
        <aside className="col-span-4 space-y-6">
          <div className="glass-panel p-6 rounded-2xl">
            <h3 className="text-lg font-semibold mb-4">Reserve This Vehicle</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-4 rounded-xl border transition-all hover:scale-[1.02]"
                      style={{ borderColor: 'var(--theme-border)', background: 'rgba(128,128,128,0.05)' }}>
                <div className="flex items-center gap-3">
                  <Calendar size={20} style={{ color: accentColor }} />
                  <div className="text-left">
                    <p className="font-medium">Book a Test Drive</p>
                    <p className="text-xs opacity-60">Schedule a private viewing</p>
                  </div>
                </div>
                <ChevronRight size={16} className="opacity-50" />
              </button>
              
              <button className="w-full flex items-center justify-between p-4 rounded-xl border transition-all hover:scale-[1.02]"
                      style={{ borderColor: 'var(--theme-border)', background: 'rgba(128,128,128,0.05)' }}>
                <div className="flex items-center gap-3">
                  <CreditCard size={20} style={{ color: accentColor }} />
                  <div className="text-left">
                    <p className="font-medium">Place Deposit</p>
                    <p className="text-xs opacity-60">$500 refundable hold</p>
                  </div>
                </div>
                <ChevronRight size={16} className="opacity-50" />
              </button>
            </div>
          </div>

          {/* Color Selector Preview */}
          <div className="glass-panel p-6 rounded-2xl">
            <h3 className="text-sm font-medium uppercase tracking-wider opacity-60 mb-3">Available Colors</h3>
            <div className="flex gap-3">
              {['#000000', '#ffffff', '#c0c0c0', '#ff0000', '#0000ff'].map((color) => (
                <button 
                  key={color}
                  className="w-8 h-8 rounded-full border-2 transition-transform hover:scale-110"
                  style={{ 
                    backgroundColor: color, 
                    borderColor: color === accentColor ? accentColor : 'transparent',
                    boxShadow: color === accentColor ? `0 0 0 2px var(--theme-bg), 0 0 0 4px ${accentColor}` : 'none'
                  }}
                />
              ))}
            </div>
          </div>
        </aside>

        {/* Bottom Row: Spec Dashboard (Full Width) */}
        <section className="col-span-12 mt-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Technical Specifications</h2>
            <Music size={20} className="opacity-40" />
          </div>
          
          {/* 3D Rail for Specs - Shared Vanishing Point */}
          <Card3DRail>
            {VEHICLE.specs.map((spec, idx) => (
              <Card3D
                key={idx}
                title={spec.label}
                subtitle={spec.sub}
                icon={spec.icon}
                // Each spec card inherits the dynamic car color via ThemeContext
              >
                <p className="text-4xl font-bold mt-auto tracking-tight" style={{ color: accentColor }}>
                  {spec.value}
                </p>
              </Card3D>
            ))}
          </Card3DRail>
        </section>

      </main>
    </div>
  );
}
