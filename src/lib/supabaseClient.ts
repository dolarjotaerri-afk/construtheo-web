import { createClient } from "@supabase/supabase-js";

let serverClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseServer() {
  if (serverClient) return serverClient;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Supabase Server não configurado. Verifique SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  serverClient = createClient(supabaseUrl, serviceRoleKey);
  return serverClient;
}