"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type ClienteResumo = {
  id: string;
  nome: string;
  apelido?: string | null;
  email: string;
  whatsapp?: string;
  cep?: string;
  cidade?: string;
  estado?: string;
  bairro?: string;
  aceita_ofertas_whatsapp?: boolean;
};

export default function PainelClientePage() {
  const [cliente, setCliente] = useState<ClienteResumo | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    async function carregarCliente() {
      try {
        // 1) Tenta pegar do localStorage (mais rápido)
        const salvo = localStorage.getItem("construtheo_cliente_atual");
        if (salvo) {
          const parsed: ClienteResumo = JSON.parse(salvo);
          setCliente(parsed);
          setCarregando(false);
          return;
        }

        // 2) Se não tiver no localStorage, tenta reconstruir via Supabase
        const { data: userData, error: userError } =
          await supabase.auth.getUser();

        if (userError) {
          console.error("Erro ao buscar usuário logado:", userError);
        }

        const user = userData?.user;
        if (!user) {
          // não está logado no Supabase
          setCarregando(false);
          return;
        }

        const { data, error } = await supabase
          .from("clientes")
          .select(
            "id, nome, apelido, email, whatsapp, cep, cidade, estado, bairro, aceita_ofertas_whatsapp"
          )
          .eq("auth_id", user.id)
          .maybeSingle();

        if (error) {
          console.error("Erro ao buscar cliente no banco:", error);
          setCarregando(false);
          return;
        }

        if (data) {
          const resumo: ClienteResumo = data;
          // salva de novo no localStorage pra próximas vezes
          localStorage.setItem(
            "construtheo_cliente_atual",
            JSON.stringify(resumo)
          );
          setCliente(resumo);
        }
      } catch (err) {
        console.error("Erro geral ao carregar cliente:", err);
      } finally {
        setCarregando(false);
      }
    }

    carregarCliente();
  }, []);

  function formatarCep(cep?: string) {
    if (!cep) return "";
    const somenteDigitos = cep.replace(/\D/g, "");
    if (somenteDigitos.length !== 8) return somenteDigitos;
    return somenteDigitos.replace(/^(\d{5})(\d{3})$/, "$1-$2");
  }

  const cepFormatado = formatarCep(cliente?.cep);

  const nomeExibicao =
    cliente?.apelido && cliente.apelido.trim().length > 0
      ? cliente.apelido
      : cliente?.nome || "cliente";

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#F9FAFB",
        padding: "16px 16px 32px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          maxWidth: 480,
          margin: "0 auto",
        }}
      >
        {/* TOPO */}
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 24,
          }}
        >
          <div>
            <p
              style={{
                fontSize: "0.75rem",
                color: "#6B7280",
                marginBottom: 4,
              }}
            >
              Bem-vindo(a)
            </p>
            <h1
              style={{
                fontSize: "1.4rem",
                fontWeight: 700,
                color: "#0F172A",
              }}
            >
              {nomeExibicao}
            </h1>
          </div>

          <Link
            href="/login"
            style={{
              fontSize: "0.75rem",
              color: "#2563EB",
              textDecoration: "underline",
            }}
            onClick={() => {
              if (typeof window !== "undefined") {
                localStorage.removeItem("construtheo_cliente_atual");
              }
              supabase.auth.signOut().catch((e) =>
                console.error("Erro ao sair:", e)
              );
            }}
          >
            Sair
          </Link>
        </header>

        {/* CARTÃO DADOS PESSOAIS */}
        <section
          style={{
            background: "#FFFFFF",
            borderRadius: 16,
            padding: 16,
            boxShadow: "0 1px 3px rgba(15,23,42,0.08)",
            marginBottom: 16,
          }}
        >
          <h2
            style={{
              fontSize: "0.95rem",
              fontWeight: 600,
              color: "#0F172A",
              marginBottom: 8,
            }}
          >
            Seus dados
          </h2>

          {carregando && (
            <p
              style={{
                fontSize: "0.85rem",
                color: "#6B7280",
              }}
            >
              Carregando informações...
            </p>
          )}

          {!carregando && !cliente && (
            <p
              style={{
                fontSize: "0.85rem",
                color: "#B91C1C",
              }}
            >
              Não encontramos seus dados. Faça login novamente.
            </p>
          )}

          {cliente && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
                fontSize: "0.85rem",
                color: "#111827",
              }}
            >
              <div>
                <span style={{ fontWeight: 500 }}>Nome: </span>
                <span>{cliente.nome}</span>
              </div>

              {cliente.apelido && (
                <div>
                  <span style={{ fontWeight: 500 }}>
                    Como gosta de ser chamado:{" "}
                  </span>
                  <span>{cliente.apelido}</span>
                </div>
              )}

              <div>
                <span style={{ fontWeight: 500 }}>E-mail: </span>
                <span>{cliente.email}</span>
              </div>

              {cliente.whatsapp && (
                <div>
                  <span style={{ fontWeight: 500 }}>WhatsApp: </span>
                  <span>{cliente.whatsapp}</span>
                </div>
              )}
            </div>
          )}
        </section>

        {/* CARTÃO LOCALIZAÇÃO */}
        {cliente && (
          <section
            style={{
              background: "#FFFFFF",
              borderRadius: 16,
              padding: 16,
              boxShadow: "0 1px 3px rgba(15,23,42,0.08)",
              marginBottom: 16,
            }}
          >
            <h2
              style={{
                fontSize: "0.95rem",
                fontWeight: 600,
                color: "#0F172A",
                marginBottom: 8,
              }}
            >
              Localização principal
            </h2>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 4,
                fontSize: "0.85rem",
                color: "#111827",
              }}
            >
              <div>
                <span style={{ fontWeight: 500 }}>Cidade: </span>
                <span>{cliente.cidade || "Não informado"}</span>
              </div>
              <div>
                <span style={{ fontWeight: 500 }}>Estado: </span>
                <span>{cliente.estado || "Não informado"}</span>
              </div>
              <div>
                <span style={{ fontWeight: 500 }}>Bairro: </span>
                <span>{cliente.bairro || "Não informado"}</span>
              </div>
              <div>
                <span style={{ fontWeight: 500 }}>CEP: </span>
                <span>{cepFormatado || "Não informado"}</span>
              </div>
            </div>
          </section>
        )}

        {/* CTA / PLACEHOLDER FUTURO */}
        <section
          style={{
            marginTop: 12,
          }}
        >
          <p
            style={{
              fontSize: "0.85rem",
              color: "#6B7280",
              marginBottom: 8,
            }}
          >
            Em breve você verá aqui suas obras, profissionais favoritos e
            empresas recomendadas na sua região.
          </p>

          <Link
            href="/"
            style={{
              display: "inline-flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "10px 16px",
              borderRadius: 999,
              background: "linear-gradient(to right, #0284C7, #0EA5E9)",
              color: "#FFFFFF",
              fontSize: "0.9rem",
              fontWeight: 600,
              textDecoration: "none",
              boxShadow: "0 3px 8px rgba(0,0,0,0.15)",
            }}
          >
            Voltar para a tela inicial
          </Link>
        </section>
      </div>
    </main>
  );
}