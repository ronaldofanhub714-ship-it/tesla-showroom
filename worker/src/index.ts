import { createClient } from '@supabase/supabase-js';

const COINGECKO_URL =
  'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tesla&vs_currencies=usd&include_24hr_change=true';

const SYMBOL_MAP = {
  bitcoin: 'BTC',
  ethereum: 'ETH',
  tesla: 'TSLA',
};

async function refreshMarketData(env) {
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_SECRET);

  const res = await fetch(COINGECKO_URL, {
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'InvestTradeDrive-Cron/1.0 (+https://tesla-showroom.pages.dev)'
    }
  });
  if (!res.ok) throw new Error(`CoinGecko responded ${res.status} ${res.statusText}`);
  const data = await res.json();

  const rows = Object.entries(SYMBOL_MAP)
    .filter(([id]) => data[id]?.usd != null)
    .map(([id, symbol]) => ({
      symbol,
      price: data[id].usd,
      change_percent: data[id].usd_24h_change,
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
