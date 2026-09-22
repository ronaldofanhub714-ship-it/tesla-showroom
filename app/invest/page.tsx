import { Card3D, Card3DRail } from '@/components/ui/Card3D';
import { TrendingUp, DollarSign, ShieldCheck, PieChart } from 'lucide-react';

// Mock data - will be replaced with Supabase fetch in Part 5
const INVESTMENT_PLANS = [
  {
    title: 'Blue Chip Growth',
    subtitle: 'Low risk · 8-12% APY',
    icon: <ShieldCheck size={20} />,
    value: '$12,450',
    change: '+4.2%'
  },
  {
    title: 'Tech Aggressive',
    subtitle: 'High risk · 15-25% APY',
    icon: <TrendingUp size={20} />,
    value: '$8,920',
    change: '+12.8%'
  },
  {
    title: 'Dividend Income',
    subtitle: 'Stable · 4-6% APY',
    icon: <DollarSign size={20} />,
    value: '$24,100',
    change: '+2.1%'
  },
  {
    title: 'Global Balanced',
    subtitle: 'Medium risk · 7-10% APY',
    icon: <PieChart size={20} />,
    value: '$18,300',
    change: '+5.5%'
  }
];

export default function InvestPage() {
  return (
    <div className="min-h-screen p-8 pl-72"> {/* pl-72 accounts for fixed sidebar */}
      
      {/* Page Header */}
      <header className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight mb-2 text-gradient">
          Investment Portfolio
        </h1>
        <p className="text-lg opacity-70" style={{ color: 'var(--theme-text-muted)' }}>
          Manage your diversified asset allocation across global markets
        </p>
      </header>

      {/* 3D Card Rail - Shared Vanishing Point Implementation */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Active Plans</h2>
          <span className="text-sm px-3 py-1 rounded-full glass-panel">
            Updated just now
          </span>
        </div>

        {/* 
          Card3DRail applies .d3-stage wrapper with perspective: var(--d3-depth)
          All child cards share ONE vanishing point = cohesive 3D scene
        */}
        <Card3DRail>
          {INVESTMENT_PLANS.map((plan, idx) => (
            <Card3D
              key={idx}
              title={plan.title}
              subtitle={plan.subtitle}
              icon={plan.icon}
              // Optional: override accent per card if needed
              // accentColor={idx === 0 ? '#10b981' : undefined} 
            >
              <div className="mt-auto">
                <p className="text-3xl font-bold mb-1">{plan.value}</p>
                <p className="text-sm font-medium text-emerald-400">
                  {plan.change} this month
                </p>
              </div>
            </Card3D>
          ))}
        </Card3DRail>
      </section>

      {/* Secondary Content Area */}
      <section className="glass-panel p-6 rounded-xl">
        <h3 className="text-lg font-semibold mb-4">Market Overview</h3>
        <p style={{ color: 'var(--theme-text-muted)' }}>
          Real-time market data integration coming in Part 5. 
          This section demonstrates how non-3D content coexists with the 3D rail above.
        </p>
      </section>

    </div>
  );
}
