import { createSessionContext, type PagesEnv } from '../../lib/supabaseSession';
import type { WalletBalance } from '../../lib/types';

const JSON_HEADERS = { 'Content-Type': 'application/json' };

function json(body: unknown, status: number, extraHeaders?: Headers) {
  const headers = new Headers(JSON_HEADERS);
  if (extraHeaders) extraHeaders.forEach((v, k) => headers.append(k, v));
  return new Response(JSON.stringify(body), { status, headers });
}

export const onRequestGet: PagesFunction<PagesEnv> = async (context) => {
  const { supabase, user, responseHeaders } = await createSessionContext(context.request, context.env);

  if (!user) return json({ error: 'Unauthorized' }, 401, responseHeaders);

  const { data, error } = await supabase
    .from('crypto_wallets')
    .select('balance_crypto, balance_fiat')
    .eq('user_id', user.id)
    .single();

  // PGRST116 = no wallet yet → return zeros instead of an error.
  if (error && error.code !== 'PGRST116') {
    return json({ error: error.message }, 500, responseHeaders);
  }

  const balance: WalletBalance = {
    balance_crypto: data?.balance_crypto ?? 0,
    balance_fiat: data?.balance_fiat ?? 0,
  };
  return json(balance, 200, responseHeaders);
};

export const onRequestPost: PagesFunction<PagesEnv> = async (context) => {
  const { supabase, user, responseHeaders } = await createSessionContext(context.request, context.env);

  if (!user) return json({ error: 'Unauthorized' }, 401, responseHeaders);

  let body: { balance_crypto?: number; balance_fiat?: number };
  try {
    body = await context.request.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400, responseHeaders);
  }

  // Only allow the two balance fields — ignore anything else the client sends.
  const payload = {
    user_id: user.id,
    balance_crypto: typeof body.balance_crypto === 'number' ? body.balance_crypto : undefined,
    balance_fiat: typeof body.balance_fiat === 'number' ? body.balance_fiat : undefined,
  };

  const { data, error } = await supabase
    .from('crypto_wallets')
    .upsert(payload, { onConflict: 'user_id' })
    .select('balance_crypto, balance_fiat')
    .single();

  if (error) return json({ error: error.message }, 500, responseHeaders);

  return json(data as WalletBalance, 200, responseHeaders);
};
