import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

/**
 * Supabase admin client with service_role key.
 * Bypasses RLS — use ONLY in server-side API routes, NEVER in client code.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. " +
        "Add it to .env.local from Supabase Dashboard → Settings → API → service_role key"
    );
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
