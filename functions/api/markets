import { createClient } from '@supabase/supabase-js';
import type { MarketRow } from '../../lib/types';

interface Env {
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
}

const JSON_HEADERS = { 'Content-Type': 'application/json' };

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env } = context;

  // Anon client + public RLS policy (market_select USING true) → safe public read.
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  const { data, error } = await supabase
    .from('market_data')
    .select('symbol, price, change_percent, updated_at')
    .order('symbol');

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: JSON_HEADERS,
    });
  }

  return new Response(JSON.stringify(data as MarketRow[]), {
    status: 200,
    headers: { ...JSON_HEADERS, 'Cache-Control': 'public, max-age=30' },
  });
};
