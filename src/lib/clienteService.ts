"use server";

import { supabase } from "./supabaseClient";

type NovoCliente = {
  nome: string;
  apelido: string;
  whatsapp: string;
  email: string;
  senha: string;
  cidade: string;
  estado?: string;
  bairro?: string;
  cep?: string | null;
  aceitaOfertasWhatsapp?: boolean;
};

export async function cadastrarCliente(dados: NovoCliente) {
  const {
    nome,
    apelido,
    whatsapp,
    email,
    senha,
    cidade,
    estado,
    bairro,
    cep,
    aceitaOfertasWhatsapp,
  } = dados;

  // 1) Criar usuário na Auth
  const { data: signUpData, error: signUpError } =
    await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        data: {
          tipo: "cliente",
          nome,
          apelido,
        },
      },
    });

  if (signUpError) {
    console.error("Erro ao criar usuário (cliente):", signUpError);
    throw new Error(
      signUpError.message || "Não foi possível criar o usuário."
    );
  }

  const user = signUpData.user;
  if (!user) {
    throw new Error("Usuário não retornado após o cadastro.");
  }

  // 2) Monta localizacao amigável
  const localizacao = `${cidade}${
    estado ? ` - ${estado}` : ""
  }${bairro ? ` (${bairro})` : ""}`;

  // 3) Salva na tabela clientes
  const { error: insertError } = await supabase.from("clientes").insert([
    {
      id: user.id, // mesmo id da Auth
      nome,
      apelido,
      whatsapp,
      email,
      cidade,
      estado,
      bairro,
      cep: cep || null,
      localizacao,
      aceita_ofertas_whatsapp: aceitaOfertasWhatsapp ?? true,
    },
  ]);

  if (insertError) {
    console.error("Erro ao salvar cliente na tabela:", insertError);
    throw new Error(
      insertError.message || "Não foi possível salvar o cadastro do cliente."
    );
  }

  return { id: user.id };
}
