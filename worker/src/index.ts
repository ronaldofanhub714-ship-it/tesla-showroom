import { createClient } from '@supabase/supabase-js';

interface Env {
  NEXT_PUBLIC_SUPABASE_URL: string;
  SUPABASE_SERVICE_SECRET: string;
}

interface CoinGeckoResponse {
  [id: string]: { usd: number; usd_24h_change: number | null };
}

const COINGECKO_URL =
  'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tesla&vs_currencies=usd&include_24hr_change=true';

const SYMBOL_MAP: Record<string, string> = {
  bitcoin: 'BTC',
  ethereum: 'ETH',
  tesla: 'TSLA',
};

async function refreshMarketData(env: Env): Promise<void> {
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_SECRET);

  const res = await fetch(COINGECKO_URL);
  if (!res.ok) throw new Error(`CoinGecko responded ${res.status}`);
  const data = (await res.json()) as CoinGeckoResponse;

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
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(
      refreshMarketData(env).catch((err) => console.error('[cron] failed:', err))
    );
  },

  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ ok: true, ts: Date.now() }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Temporary manual trigger for debugging
    if (url.pathname === '/refresh') {
      try {
        await refreshMarketData(env);
        return new Response(JSON.stringify({ success: true, message: 'Market data refreshed' }), {
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }
    
    return new Response('Not found', { status: 404 });
  },
};
