import { createClient } from '@supabase/supabase-js';

// Messari free API - no key, no cloud IP blocking, reliable
const MESSARI_URL = 'https://data.messari.io/api/v2/assets?fields=symbol,price_usd,percent_change_last_24_hours&limit=100';

const SYMBOL_MAP = {
  BTC: 'BTC',
  ETH: 'ETH',
  TSLA: 'TSLA', // Note: Messari doesn't have TSLA; we'll handle this below
};

async function refreshMarketData(env) {
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_SECRET);

  const res = await fetch(MESSARI_URL, {
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'InvestTradeDrive-Cron/1.0 (+https://tesla-showroom.pages.dev)'
    }
  });
  if (!res.ok) throw new Error(`Messari responded ${res.status} ${res.statusText}`);
  const data = await res.json();

  // Map crypto assets
  const rows = [];
  for (const asset of data.data) {
    if (SYMBOL_MAP[asset.symbol]) {
      rows.push({
        symbol: SYMBOL_MAP[asset.symbol],
        price: parseFloat(asset.metrics?.market_data?.price_usd || 0),
        change_percent: parseFloat(asset.metrics?.market_data?.percent_change_last_24_hours || 0),
      });
    }
  }

  // Fallback for TSLA (Messari doesn't track stocks)
  // Use a static placeholder until we add a stock API later
  if (!rows.find(r => r.symbol === 'TSLA')) {
    rows.push({
      symbol: 'TSLA',
      price: 250.00, // Placeholder - will be replaced in Part 6 with a proper stock API
      change_percent: 0,
    });
  }

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
