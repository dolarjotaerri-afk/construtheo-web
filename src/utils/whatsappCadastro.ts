type TipoCadastro = "cliente" | "profissional" | "empresa";

// Exemplo: "5511999999999" (55 + DDD + número)
const NUMERO_WHATSAPP_BUSINESS = "‪+5511988214713‬";

export function abrirWhatsappNovoCadastro(tipo: TipoCadastro) {
  if (typeof window === "undefined") return;

  const mensagens: Record<TipoCadastro, string> = {
    cliente: "Olá! Sou o mais novo cliente cadastrado no Construthéo.",
    profissional: "Olá! Sou o mais novo profissional cadastrado no Construthéo.",
    empresa: "Olá! Somos a nova empresa parceira do Construthéo.",
  };

  const texto = encodeURIComponent(mensagens[tipo]);
  const url = `https://wa.me/${NUMERO_WHATSAPP_BUSINESS}?text=${texto}`;

  window.location.href = url;
}