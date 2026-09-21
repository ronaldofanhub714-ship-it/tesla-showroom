import { createBrowserClient } from '@supabase/ssr';

/**
 * Browser-only Supabase client (anon key + PKCE session cookie).
 *
 * ⚠️ Import this ONLY from Client Components ("use client") or other
 * client-safe modules. Server-side / Functions code must use
 * lib/supabaseSession.ts (File 2/4) instead.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
        'Set them in Cloudflare Pages → Project → Settings → Environment variables, then redeploy.'
    );
  }

  return createBrowserClient(url, anonKey);
}

/** Shared singleton for client components and hooks. */
export const supabase = createClient();
