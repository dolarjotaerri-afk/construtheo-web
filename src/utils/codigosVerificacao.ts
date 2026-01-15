import { supabase } from "../lib/supabaseClient";

export type TipoUsuario = "cliente" | "profissional" | "empresa";
export type CanalVerificacao = "email"; // futuramente 'whatsapp'

export function gerarCodigoNumerico(tamanho = 6): string {
  let codigo = "";
  for (let i = 0; i < tamanho; i++) {
    codigo += Math.floor(Math.random() * 10).toString();
  }
  return codigo;
}

export async function criarCodigoVerificacao(
  tipoUsuario: TipoUsuario,
  usuarioId: string,
  canal: CanalVerificacao
) {
  const codigo = gerarCodigoNumerico(6);

  const expiracao = new Date();
  expiracao.setMinutes(expiracao.getMinutes() + 15); // 15 minutos

  const { data, error } = await supabase
    .from("codigos_verificacao")
    .insert({
      tipo_usuario: tipoUsuario,
      usuario_id: usuarioId,
      canal,
      codigo,
      expiracao: expiracao.toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error("Erro ao criar código de verificação:", error);
    throw new Error("Não foi possível gerar o código de verificação.");
  }

  return { codigo, registro: data };
}