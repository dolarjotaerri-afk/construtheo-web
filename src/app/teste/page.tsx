"use client";

import { supabase } from "@/lib/supabaseClient";

export default function TesteSupabase() {
  async function testar() {
    const { data, error } = await supabase.from("clientes").select("*");

    console.log("DATA:", data);
    console.log("ERRO:", error);
  }

  return (
    <div>
      <button onClick={testar}>Testar Supabase</button>
    </div>
  );
}
