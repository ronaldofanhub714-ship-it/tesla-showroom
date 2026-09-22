import { Card3D, Card3DRail } from '@/components/ui/Card3D';
import { ArrowUpRight, ArrowDownRight, Activity, Wallet, Globe } from 'lucide-react';

// Mock data - will be replaced with Supabase/CoinGecko fetch later
const CRYPTO_ASSETS = [
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    price: '$62,450.00',
    change: '+5.2%',
    positive: true,
    volume: '$28.4B'
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    price: '$3,120.50',
    change: '-1.4%',
    positive: false,
    volume: '$14.2B'
  },
  {
    symbol: 'SOL',
    name: 'Solana',
    price: '$145.80',
    change: '+12.8%',
    positive: true,
    volume: '$3.1B'
  },
  {
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    price: '$248.50',
    change: '+2.1%',
    positive: true,
    volume: '$8.9B'
  }
];

export default function TradePage() {
  return (
    <div className="min-h-screen p-8 pl-72 bg-white text-black"> 
      {/* 
        Note: We use inline bg-white/text-black here as a fallback.
        The ThemeContext should automatically set [data-theme="light"] 
        which updates CSS variables globally. This ensures consistency 
        even if JS hydration is delayed.
      */}
      
      {/* Page Header */}
      <header className="mb-10 flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            Crypto & Stocks
          </h1>
          <p className="text-lg text-gray-500">
            Real-time market data and portfolio execution
          </p>
        </div>
        
        {/* Quick Actions */}
        <div className="flex gap-3">
          <button className="px-4 py-2 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors text-sm font-medium">
            Deposit Funds
          </button>
          <button className="px-4 py-2 rounded-full bg-black text-white hover:bg-gray-800 transition-colors text-sm font-medium">
            New Order
          </button>
        </div>
      </header>

      {/* Market Overview Cards */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Market Movers</h2>
          <span className="text-xs uppercase tracking-wider text-gray-400 font-medium">
            Live Updates
          </span>
        </div>

        <Card3DRail>
          {CRYPTO_ASSETS.map((asset, idx) => (
            <Card3D
              key={idx}
              title={asset.name}
              subtitle={asset.symbol}
              icon={asset.positive ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
              // In light mode, we might want to override the card background slightly
              // or let the CSS variables handle it via [data-theme="light"]
            >
              <div className="mt-auto">
                <p className="text-3xl font-bold mb-1 text-black">{asset.price}</p>
                <div className="flex items-center justify-between">
                  <p className={`text-sm font-bold ${asset.positive ? 'text-emerald-600' : 'text-red-500'}`}>
                    {asset.change}
                  </p>
                  <span className="text-xs text-gray-400">Vol: {asset.volume}</span>
                </div>
              </div>
            </Card3D>
          ))}
        </Card3DRail>
      </section>

      {/* Secondary Stats Grid (Non-3D content coexisting) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Portfolio Value', value: '$124,590.00', icon: <Wallet size={20} /> },
          { label: '24h Volume', value: '$4.2M', icon: <Activity size={20} /> },
          { label: 'Global Cap', value: '$2.4T', icon: <Globe size={20} /> }
        ].map((stat, i) => (
          <div 
            key={i} 
            className="p-6 rounded-2xl border border-gray-100 bg-gray-50 hover:border-gray-200 transition-colors"
          >
            <div className="flex items-center gap-3 mb-2 text-gray-400">
              {stat.icon}
              <span className="text-sm font-medium uppercase tracking-wide">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold text-black">{stat.value}</p>
          </div>
        ))}
      </section>

    </div>
  );
}
