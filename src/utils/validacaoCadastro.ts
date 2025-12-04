import { supabase } from "../lib/supabaseClient";

const TABELAS_PESSOAS = ["clientes", "profissionais", "empresas"] as const;

export async function verificarEmailCpfJaCadastrados(
  email: string,
  cpf: string
): Promise<{ emailExiste: boolean; cpfExiste: boolean }> {
  const emailNormalizado = email.trim().toLowerCase();
  const cpfLimpo = cpf.replace(/\D/g, ""); // tira pontos e traços

  // Faz consultas em paralelo nas 3 tabelas
  const [resEmail, resCpf] = await Promise.all([
    Promise.all(
      TABELAS_PESSOAS.map((tabela) =>
        supabase
          .from(tabela)
          .select("id", { count: "exact", head: true })
          .eq("email", emailNormalizado)
      )
    ),
    Promise.all(
      TABELAS_PESSOAS.map((tabela) =>
        supabase
          .from(tabela)
          .select("id", { count: "exact", head: true })
          .eq("cpf", cpfLimpo)
      )
    ),
  ]);

  const emailExiste = resEmail.some(({ count, error }) => {
    if (error) {
      console.error(`Erro ao verificar email em alguma tabela:`, error);
      return false;
    }
    return (count ?? 0) > 0;
  });

  const cpfExiste = resCpf.some(({ count, error }) => {
    if (error) {
      console.error(`Erro ao verificar CPF em alguma tabela:`, error);
      return false;
    }
    return (count ?? 0) > 0;
  });

  return { emailExiste, cpfExiste };
}
