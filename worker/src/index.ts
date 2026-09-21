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
}
