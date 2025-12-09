import { supabase } from "../lib/supabaseClient";

const TABELAS_PESSOAS_FISICAS = ["clientes", "profissionais"] as const;
const TABELA_EMPRESAS = "empresas" as const;

function apenasNumeros(valor: string): string {
  return valor.replace(/\D/g, "");
}

function normalizarEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Verifica se EMAIL ou CPF já estão cadastrados
 * CLIENTES + PROFISSIONAIS (CPF)
 * EMAIL é checado em clientes, profissionais e empresas
 */
export async function verificarEmailCpfJaCadastrados(
  email: string,
  cpf: string
): Promise<{ emailExiste: boolean; cpfExiste: boolean }> {
  const emailNormalizado = normalizarEmail(email);
  const cpfLimpo = apenasNumeros(cpf);

  const tabelasEmail = [...TABELAS_PESSOAS_FISICAS, TABELA_EMPRESAS];

  const [resEmail, resCpf] = await Promise.all([
    // e-mail em clientes, profissionais e empresas
    Promise.all(
      tabelasEmail.map((tabela) =>
        supabase
          .from(String(tabela))
          .select("id", { count: "exact", head: true })
          .eq("email", emailNormalizado)
      )
    ),
    // CPF só em clientes e profissionais
    Promise.all(
      TABELAS_PESSOAS_FISICAS.map((tabela) =>
        supabase
          .from(String(tabela))
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

/**
 * Verifica se EMAIL ou CNPJ já estão cadastrados
 * EMAIL é checado em clientes, profissionais e empresas
 * CNPJ só na tabela de empresas
 */
export async function verificarEmailCnpjJaCadastrados(
  email: string,
  cnpj: string
): Promise<{ emailExiste: boolean; cnpjExiste: boolean }> {
  const emailNormalizado = normalizarEmail(email);
  const cnpjLimpo = apenasNumeros(cnpj);

  const tabelasEmail = [...TABELAS_PESSOAS_FISICAS, TABELA_EMPRESAS];

  const [resEmail, resCnpj] = await Promise.all([
    // e-mail em clientes, profissionais e empresas
    Promise.all(
      tabelasEmail.map((tabela) =>
        supabase
          .from(String(tabela))
          .select("id", { count: "exact", head: true })
          .eq("email", emailNormalizado)
      )
    ),
    // CNPJ só na tabela empresas
    supabase
      .from(String(TABELA_EMPRESAS))
      .select("id", { count: "exact", head: true })
      .eq("cnpj", cnpjLimpo),
  ]);

  const emailExiste = resEmail.some(({ count, error }) => {
    if (error) {
      console.error(`Erro ao verificar email em alguma tabela:`, error);
      return false;
    }
    return (count ?? 0) > 0;
  });

  const { count: countCnpj, error: errorCnpj } = resCnpj;

  if (errorCnpj) {
    console.error("Erro ao verificar CNPJ na tabela de empresas:", errorCnpj);
  }

  const cnpjExiste = (countCnpj ?? 0) > 0;

  return { emailExiste, cnpjExiste };
}

/**
 * VALIDA CPF formalmente
 */
export function validarCPF(cpf: string): boolean {
  let valor = apenasNumeros(cpf);

  if (valor.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(valor)) return false;

  let soma = 0;

  // primeiro dígito
  for (let i = 0; i < 9; i++) {
    soma += parseInt(valor.charAt(i)) * (10 - i);
  }
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(valor.charAt(9))) return false;

  soma = 0;
  // segundo dígito
  for (let i = 0; i < 10; i++) {
    soma += parseInt(valor.charAt(i)) * (11 - i);
  }
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(valor.charAt(10))) return false;

  return true;
}

/**
 * VALIDA CNPJ formalmente
 */
export function validarCNPJ(cnpj: string): boolean {
  let valor = apenasNumeros(cnpj);

  if (valor.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(valor)) return false;

  let tamanho = 12;
  let numeros = valor.substring(0, tamanho);
  let digitos = valor.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(0))) return false;

  tamanho = 13;
  numeros = valor.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(1))) return false;

  return true;
}

/**
 * VALIDA e-mail (simples e eficiente)
 */
export function validarEmail(email: string): boolean {
  const normalizado = email.trim();
  if (!normalizado) return false;

  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(normalizado);
}