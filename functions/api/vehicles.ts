import { createClient } from '@supabase/supabase-js';
import type { Vehicle } from '../../lib/types';

interface Env {
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
}

const JSON_HEADERS = { 'Content-Type': 'application/json' };

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env } = context;

  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  // Public RLS policy (vehicles_select USING true) lets anyone read;
  // we still filter to 'available' so sold units don't show in the grid.
  const { data, error } = await supabase
    .from('vehicles')
    .select('id, vin, model, price, image_url, inventory_status')
    .eq('inventory_status', 'available')
    .order('price', { ascending: true });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: JSON_HEADERS,
    });
  }

  return new Response(JSON.stringify(data as Vehicle[]), {
    status: 200,
    headers: { ...JSON_HEADERS, 'Cache-Control': 'public, max-age=60' },
  });
};

/**
 * Single-vehicle lookup used by the detail page.
 * functions/api/vehicles/[vin].ts would be the file-based route, but we expose
 * a ?vin= query on the same endpoint to keep the static-export build simple
 * (no dynamic segment → no generateStaticParams needed at build time).
 */
export const onRequest: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url);
  const vin = url.searchParams.get('vin');

  // No ?vin= → behave as the list endpoint (GET only).
  if (!vin) {
    if (context.request.method !== 'GET') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: JSON_HEADERS,
      });
    }
    return onRequestGet(context);
  }

  const { env } = context;
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  const { data, error } = await supabase
    .from('vehicles')
    .select('id, vin, model, price, image_url, inventory_status')
    .eq('vin', vin)
    .single();

  if (error) {
    const status = error.code === 'PGRST116' ? 404 : 500;
    return new Response(JSON.stringify({ error: status === 404 ? 'Vehicle not found' : error.message }), {
      status,
      headers: JSON_HEADERS,
    });
  }

  return new Response(JSON.stringify(data as Vehicle), {
    status: 200,
    headers: { ...JSON_HEADERS, 'Cache-Control': 'public, max-age=60' },
  });
};
