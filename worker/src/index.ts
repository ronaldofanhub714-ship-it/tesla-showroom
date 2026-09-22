import { createClient } from '@supabase/supabase-js';

// Base prices (realistic starting points)
const BASE_PRICES = {
  BTC: 62000,
  ETH: 3100,
  TSLA: 248.50
};

// Generate deterministic "live" prices based on current time
// This ensures prices change every 5 min but are consistent across requests
function generatePrices() {
  const now = Date.now();
  const timeBucket = Math.floor(now / (5 * 60 * 1000)); // Changes every 5 min
  
  return Object.entries(BASE_PRICES).map(([symbol, base]) => {
    // Simple sine wave simulation: ±3% fluctuation based on time bucket
    const fluctuation = Math.sin(timeBucket * symbol.charCodeAt(0)) * 0.03;
    const price = base * (1 + fluctuation);
    const change_percent = fluctuation * 100;
    
    return {
      symbol,
      price: parseFloat(price.toFixed(2)),
      change_percent: parseFloat(change_percent.toFixed(2))
    };
  });
}

async function refreshMarketData(env) {
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_SECRET);
  
  const rows = generatePrices();
  
  const { error } = await supabase.from('market_data').upsert(rows, { onConflict: 'symbol' });
  if (error) throw new Error(`Upsert failed: ${error.message}`);
  
  console.log(`[cron] updated ${rows.length} simulated market rows at ${new Date().toISOString()}`);
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
        return new Response(JSON.stringify({ success: true, message: 'Simulated market data refreshed' }), {
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
