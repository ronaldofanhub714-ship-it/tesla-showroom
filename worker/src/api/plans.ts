import { NextResponse } from 'next/server';
  import { supabase } from '@/lib/supabase';

  // Helper – read the userId from the session_id cookie
  async function getUserId(request: Request, _: Env) {
    const cookies = request.headers.get('cookie') ?? '';
    const m = cookies.match(/session_id=([^;]+)/);
    return m ? m[1] : null;
  }

  export async function POST(request: Request, env: Env) {
    const body = await request.json();
    const userId = await getUserId(request, env);
    if (!userId) return new NextResponse('Unauthenticated', { status: 401 });

    if (!body.name || !body.allocation_json) {
      return new NextResponse('Missing name or allocation_json', { status: 400 });
    }

    const { data, error } = await supabase
      .from('investment_plans')
      .insert({
        user_id: userId,
        name: body.name,
        goal: body.goal,
        horizon_years: body.horizon_years,
        risk_score: body.risk_score,
        allocation_json: body.allocation_json,
        target_amount_cents: body.target_amount_cents,
        status: 'draft',
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error', error);
      return new NextResponse(error.message, { status: 500 });
    }

    return new NextResponse(JSON.stringify(data), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  }
