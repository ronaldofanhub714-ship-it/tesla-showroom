import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { SupabaseClient, User } from '@supabase/supabase-js';

/** Runtime bindings for Pages Functions (Pages → Settings → Environment variables). */
export interface PagesEnv {
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
}

export interface SessionContext {
  /** Client authenticated AS THE LOGGED-IN USER — RLS applies to every query. */
  supabase: SupabaseClient;
  user: User | null;
  /** Merge into your Response headers so cookie refreshes reach the browser. */
  responseHeaders: Headers;
}

export async function createSessionContext(
  request: Request,
  env: PagesEnv
): Promise<SessionContext> {
  const responseHeaders = new Headers();

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          const header = request.headers.get('cookie');
          if (!header) return [];
          return header
            .split('; ')
            .filter(Boolean)
            .map((pair) => {
              const [name, ...rest] = pair.split('=');
              return { name, value: rest.join('=') };
            });
        },
        setAll(cookies: { name: string; value: string; options: CookieOptions }[]) {
          for (const { name, value, options } of cookies) {
            const parts = [
              `${name}=${value}`,
              `Path=${options?.path ?? '/'}`,
              `Max-Age=${options?.maxAge ?? 60 * 60 * 24 * 7}`,
              'SameSite=Lax',
            ];
            if (options?.httpOnly) parts.push('HttpOnly');
            if (options?.secure) parts.push('Secure');
            responseHeaders.append('set-cookie', parts.join('; '));
          }
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabase, user, responseHeaders };
}
