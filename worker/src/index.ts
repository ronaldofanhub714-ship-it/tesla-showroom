import { createClient } from '@supabase/supabase-js';

// Binance public API - no key, no cloud IP blocking, always available
const BINANCE_URL = 'https://api.binance.com/api/v3/ticker/24hr?symbols=["BTCUSDT","ETHUSDT"]';

async function refreshMarketData(env) {
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_SECRET);

  const res = await fetch(BINANCE_URL, {
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'InvestTradeDrive-Cron/1.0 (+https://tesla-showroom.pages.dev)'
    }
  });
  if (!res.ok) throw new Error(`Binance responded ${res.status} ${res.statusText}`);
  const data = await res.json();

  // Map Binance symbols to our schema
  const symbolMap = {
    BTCUSDT: 'BTC',
    ETHUSDT: 'ETH'
  };

  const rows = data.map(ticker => ({
    symbol: symbolMap[ticker.symbol],
    price: parseFloat(ticker.lastPrice),
    change_percent: parseFloat(ticker.priceChangePercent)
  })).filter(row => row.symbol); // Filter out any unmapped symbols

  // Add TSLA placeholder (Binance doesn't support stocks)
  rows.push({
    symbol: 'TSLA',
    price: 250.00,
    change_percent: 0
  });

  const { error } = await supabase.from('market_data').upsert(rows, { onConflict: 'symbol' });
  if (error) throw new Error(`Upsert failed: ${error.message}`);

  console.log(`[cron] updated ${rows.length} market rows at ${new Date().toISOString()}`);
}

export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(
      refreshMarketData(env).catch((err) => console.error('[cron] failed:', err))
    );
  },

  async fetch(request, env) {
    const url = new URL(request.url);
    
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ ok: true, ts: Date.now() }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    if (url.pathname === '/refresh') {
      try {
        await refreshMarketData(env);
        return new Response(JSON.stringify({ success: true, message: 'Market data refreshed' }), {
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }
    
    return new Response('Not found', { status: 404 });
  },
};
