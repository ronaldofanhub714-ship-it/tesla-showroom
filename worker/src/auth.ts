 import { NextResponse } from 'next/server';
  import jwt from 'jsonwebtoken';

  export async function POST(request: Request, env: Env) {
    const { token } = await request.json(); // Supabase access token from the SPA
    if (!token) return new NextResponse('Missing token', { status: 401 });

    try {
      const payload = jwt.verify(token, env.JWT_SECRET) as { sub: string };
      // Create a short‑lived JWT that only contains the Supabase user ID
      const signed = jwt.sign({ sub: payload.sub }, env.JWT_SECRET, {
        expiresIn: '7d',
      });
      // Set an HttpOnly cookie that the SPA will read
      const cookie = `session_id=${signed}; HttpOnly; Path=/; Max-Age=604800`;
      return new Response(null, {
        status: 204,
        headers: { 'Set-Cookie': cookie },
      });
    } catch {
      return new Response('Invalid token', { status: 401 });
    }
  }
