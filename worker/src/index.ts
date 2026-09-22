import { createClient } from '@supabase/supabase-js';

// CoinCap API - free, no key, no cloud IP blocking
const COINCAP_URL = 'https://api.coincap.io/v2/assets?ids=bitcoin,ethereum,tesla';

const SYMBOL_MAP = {
  bitcoin: 'BTC',
  ethereum: 'ETH',
  tesla: 'TSLA',
};

async function refreshMarketData(env) {
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_SECRET);

  const res = await fetch(COINCAP_URL, {
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'InvestTradeDrive-Cron/1.0 (+https://tesla-showroom.pages.dev)'
    }
  });
  if (!res.ok) throw new Error(`CoinCap responded ${res.status} ${res.statusText}`);
  const data = await res.json();

  // CoinCap returns { data: [...] }
  const rows = data.data
    .filter(asset => SYMBOL_MAP[asset.id])
    .map(asset => ({
      symbol: SYMBOL_MAP[asset.id],
      price: parseFloat(asset.priceUsd),
      change_percent: parseFloat(asset.changePercent24Hr),
    }));

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
