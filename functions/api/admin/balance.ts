import { createClient } from '@supabase/supabase-js';

export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Service role bypasses RLS
  );

  // Verify admin status FIRST
  const { data: adminCheck } = await supabase
    .from('admin_permissions')
    .select('can_manage_balances')
    .eq('user_id', req.headers.get('x-user-id'))
    .single();

  if (!adminCheck?.can_manage_balances) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const { userId, amount, reason } = await req.json();

  // Atomic balance update + audit log in transaction
  const { error } = await supabase.rpc('adjust_user_balance', {
    p_user_id: userId,
    p_amount: amount,
    p_reason: reason,
    p_admin_id: req.headers.get('x-user-id')
  });

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
