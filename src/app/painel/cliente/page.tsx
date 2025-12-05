"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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

    try {
      const salvo = localStorage.getItem("construtheo_cliente_atual");
      if (salvo) {
        const parsed: ClienteResumo = JSON.parse(salvo);
        setCliente(parsed);
      }
    } catch (err) {
      console.error("Erro ao ler cliente do localStorage:", err);
    } finally {
      setCarregando(false);
    }
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
      : cliente?.nome || "Cliente";

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
        {/* topo */}
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
          >
            Sair
          </Link>
        </header>

        {/* cartão de dados principais */}
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
              Não encontramos seus dados locais. Faça login novamente.
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

        {/* cartão de localização com CEP */}
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
              Localização da sua obra
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

        {/* cartão CALCULADORAS / FERRAMENTAS */}
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
            Calculadoras da sua obra
          </h2>
          <p
            style={{
              fontSize: "0.85rem",
              color: "#6B7280",
              marginBottom: 12,
            }}
          >
            Faça cálculos de concreto, blocos, aço, drywall e organize tudo que
            sua obra precisa em poucos cliques.
          </p>
          <Link
            href="/calculadoras"
            style={{
              display: "inline-flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "8px 14px",
              borderRadius: 999,
              background:
                "linear-gradient(to right, #0284C7, #0EA5E9)",
              color: "#FFFFFF",
              fontSize: "0.85rem",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Acessar calculadoras
          </Link>
        </section>

        {/* cartão MELHORES PROFISSIONAIS */}
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
            Melhores profissionais na sua região
          </h2>
          <p
            style={{
              fontSize: "0.85rem",
              color: "#6B7280",
              marginBottom: 12,
            }}
          >
            Assim que os profissionais da sua região começarem a se cadastrar e
            receber avaliações, os melhores aparecerão aqui primeiro para você.
          </p>
          <Link
            href="/profissionais"
            style={{
              display: "inline-flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "8px 14px",
              borderRadius: 999,
              border: "1px solid #E5E7EB",
              background: "#F9FAFB",
              color: "#111827",
              fontSize: "0.85rem",
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            Buscar profissionais
          </Link>
        </section>

        {/* cartão MELHORES EMPRESAS */}
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
            Melhores empresas para sua obra
          </h2>
          <p
            style={{
              fontSize: "0.85rem",
              color: "#6B7280",
              marginBottom: 12,
            }}
          >
            Depósitos, usinas de concreto, locadoras de equipamentos e muito
            mais. Em breve você verá aqui as empresas mais bem avaliadas perto
            de você.
          </p>
          <Link
            href="/empresas"
            style={{
              display: "inline-flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "8px 14px",
              borderRadius: 999,
              border: "1px solid #E5E7EB",
              background: "#F9FAFB",
              color: "#111827",
              fontSize: "0.85rem",
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            Ver empresas cadastradas
          </Link>
        </section>

        {/* CTA simples final */}
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
            Em breve você verá aqui também suas obras, profissionais favoritos e
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
              background:
                "linear-gradient(to right, #0284C7, #0EA5E9)",
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