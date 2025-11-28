// src/lib/clienteService.ts
import { supabase } from "@/lib/supabaseClient";

export type NovoCliente = {
  nome: string;
  apelido?: string;
  whatsapp: string;
  email: string;
  senha: string;
  cidade: string;
  estado?: string;
  bairro?: string;
  aceitaOfertasWhatsapp?: boolean;
  fotoPerfil?: string | null;
};

export async function cadastrarCliente(cliente: NovoCliente) {
  const {
    nome,
    apelido,
    whatsapp,
    email,
    senha,
    cidade,
    estado,
    bairro,
    aceitaOfertasWhatsapp,
    fotoPerfil,
  } = cliente;

  const { data, error } = await supabase
    .from("clientes")
    .insert([
      {
        nome,
        apelido,
        whatsapp,
        email,
        senha,
        cidade,
        estado,
        bairro,
        aceita_ofertas_whatsapp: aceitaOfertasWhatsapp ?? false,
        foto_perfil: fotoPerfil ?? null,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Erro ao cadastrar cliente:", error);
    throw new Error(error.message || "Erro ao cadastrar cliente.");
  }

  return data;
}
