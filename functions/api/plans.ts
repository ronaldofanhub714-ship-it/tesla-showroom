import { createSessionContext, type PagesEnv } from '../../lib/supabaseSession';
import type { InvestmentPlan, PlanStatus } from '../../lib/types';

const JSON_HEADERS = { 'Content-Type': 'application/json' };

function json(body: unknown, status: number, extraHeaders?: Headers) {
  const headers = new Headers(JSON_HEADERS);
  if (extraHeaders) extraHeaders.forEach((v, k) => headers.append(k, v));
  return new Response(JSON.stringify(body), { status, headers });
}

const VALID_STATUSES: PlanStatus[] = ['active', 'cancelled', 'completed'];

export const onRequestGet: PagesFunction<PagesEnv> = async (context) => {
  const { supabase, user, responseHeaders } = await createSessionContext(context.request, context.env);

  if (!user) return json({ error: 'Unauthorized' }, 401, responseHeaders);

  const { data, error } = await supabase
    .from('investment_plans')
    .select('id, plan_name, amount, status, created_at, updated_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return json({ error: error.message }, 500, responseHeaders);

  return json(data as InvestmentPlan[], 200, responseHeaders);
};

export const onRequestPost: PagesFunction<PagesEnv> = async (context) => {
  const { supabase, user, responseHeaders } = await createSessionContext(context.request, context.env);

  if (!user) return json({ error: 'Unauthorized' }, 401, responseHeaders);

  let body: { plan_name?: unknown; amount?: unknown; status?: unknown };
  try {
    body = await context.request.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400, responseHeaders);
  }

  // Validate + allow-list inputs before they ever touch Postgres.
  const plan_name = typeof body.plan_name === 'string' ? body.plan_name.trim() : '';
  const amount = typeof body.amount === 'number' ? body.amount : NaN;
  const status: PlanStatus =
    typeof body.status === 'string' && VALID_STATUSES.includes(body.status as PlanStatus)
      ? (body.status as PlanStatus)
      : 'active';

  if (!plan_name) return json({ error: 'plan_name is required' }, 400, responseHeaders);
  if (!Number.isFinite(amount) || amount <= 0) {
    return json({ error: 'amount must be a positive number' }, 400, responseHeaders);
  }

  const { data, error } = await supabase
    .from('investment_plans')
    .insert({ user_id: user.id, plan_name, amount, status })
    .select('id, plan_name, amount, status, created_at, updated_at')
    .single();

  if (error) return json({ error: error.message }, 500, responseHeaders);

  return json(data as InvestmentPlan, 201, responseHeaders);
};
