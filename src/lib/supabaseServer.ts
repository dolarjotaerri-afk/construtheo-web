import { createClient } from "@supabase/supabase-js";

export function getSupabaseServer() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Supabase Server não configurado. Verifique as variáveis de ambiente."
    );
  }

  return createClient(supabaseUrl, serviceRoleKey);
}

export const supabaseServer = getSupabaseServer();