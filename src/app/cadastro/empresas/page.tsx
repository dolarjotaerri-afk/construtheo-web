"use client";

import Link from "next/link";
import { useRef } from "react";

type TipoEmpresa = {
  slug: string;
  titulo: string;
  descricao: string;
  emoji: string;
};

type Secao = {
  id: string;
  titulo: string;
  itens: TipoEmpresa[];
};

const secoes: Secao[] = [
  {
    id: "materiais",
    titulo: "Materiais e concreto",
    itens: [
      {
        slug: "deposito",
        titulo: "Depósito de materiais",
        descricao: "Cimento, blocos, areia, brita, ferragens e mais.",
        emoji: "📦",
      },
      {
        slug: "usina",
        titulo: "Usina de concreto",
        descricao: "Concreto usinado, bombeado e serviços ligados.",
        emoji: "🏗️",
      },
      {
        slug: "bombeamento",
        titulo: "Bombeamento de concreto",
        descricao: "Bombas estacionárias, lança, mangote, etc.",
        emoji: "🚚",
      },
      {
        slug: "cacamba",
        titulo: "Caçamba",
        descricao: "Locação de caçambas e remoção de entulho.",
        emoji: "🗑️",
      },
    ],
  },
  {
    id: "servicos",
    titulo: "Serviços especializados",
    itens: [
      {
        slug: "vidracaria",
        titulo: "Vidraçaria",
        descricao: "Box, guarda-corpo, janelas, espelhos e fachadas.",
        emoji: "🪟",
      },
      {
        slug: "serralheria",
        titulo: "Serralheria",
        descricao: "Esquadrias, portões, estruturas metálicas.",
        emoji: "🔩",
      },
      {
        slug: "energia-solar",
        titulo: "Energia solar",
        descricao: "Projetos e instalação de sistemas fotovoltaicos.",
        emoji: "☀️",
      },
      {
        slug: "aluguel",
        titulo: "Aluguel de equipamentos",
        descricao: "Andaimes, betoneiras, rompedor, ferramentas.",
        emoji: "🔧",
      },
      {
        slug: "poco-artesiano",
        titulo: "Poço artesiano",
        descricao: "Perfuração, manutenção e análise de água.",
        emoji: "💧",
      },
      {
        slug: "outros",
        titulo: "Outros",
        descricao: "Outro tipo de empresa da construção.",
        emoji: "🔍",
      },
    ],
  },
];

export default function EscolhaTipoEmpresaPage() {
  // refs para cada carrossel (2 seções)
  const carrosselRefs = useRef<(HTMLDivElement | null)[]>([]);

  const scrollCarrossel = (index: number, direction: "left" | "right") => {
    const el = carrosselRefs.current[index];
    if (!el) return;
    const largura = el.clientWidth * 0.8; // anda quase um card por clique
    el.scrollBy({
      left: direction === "right" ? largura : -largura,
      behavior: "smooth",
    });
  };

  return (
    <div
      style={{
        maxWidth: "440px",
        margin: "0 auto",
        paddingTop: "12px",
        paddingBottom: "32px",
      }}
    >
      <div
        style={{
          width: "100%",
          background: "#FFFFFF",
          borderRadius: "28px",
          padding: "22px 22px 22px",
          boxShadow: "0 4px 18px rgba(0,0,0,0.08)",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
        }}
      >
        {/* VOLTAR */}
        <div style={{ textAlign: "center" }}>
          <Link
            href="/login"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "5px 12px",
              borderRadius: "999px",
              border: "1px solid #E5E7EB",
              background: "#FFFFFF",
              fontSize: "0.78rem",
              fontWeight: 500,
              color: "#2563EB",
              boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
              textDecoration: "none",
            }}
          >
            ← Voltar para a tela de acesso
          </Link>
        </div>

        {/* HEADER */}
        <header style={{ textAlign: "center" }}>
          <p
            style={{
              fontSize: "0.72rem",
              fontWeight: 700,
              letterSpacing: "0.12em",
              color: "#2563EB",
              marginBottom: "4px",
            }}
          >
            CADASTRO DE EMPRESA
          </p>

          <h1
            style={{
              fontSize: "1.32rem",
              fontWeight: 700,
              color: "#111827",
              marginBottom: "4px",
            }}
          >
            Escolha o tipo da sua empresa
          </h1>

          <p
            style={{
              fontSize: "0.84rem",
              color: "#4B5563",
              maxWidth: "310px",
              margin: "0 auto",
            }}
          >
            Selecione abaixo a área da sua atuação. Depois você completa o
            cadastro da empresa.
          </p>
        </header>

        {/* SEÇÕES */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {secoes.map((secao, indexSecao) => (
            <section
              key={secao.id}
              style={{
                padding: "8px 10px 10px",
                borderRadius: "18px",
                background: "linear-gradient(135deg, #F8FAFF, #EDF2FF)",
                border: "1px solid #E5EDFF",
              }}
            >
              {/* TÍTULO DA SEÇÃO */}
              <h2
                style={{
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  color: "#0F172A",
                  marginBottom: "6px",
                }}
              >
                {secao.titulo}
              </h2>

              {/* CARROSSEL */}
              <div
                ref={(el) => {
                  carrosselRefs.current[indexSecao] = el;
                }}
                className="empresa-carousel"
                style={{
                  display: "flex",
                  overflowX: "auto",
                  gap: "10px",
                  paddingBottom: "4px",
                  scrollbarWidth: "none", // Firefox
                  maxWidth: "100%",
                }}
              >
                {secao.itens.map((tipo) => (
                  <Link
                    key={tipo.slug}
                    href={`/cadastro/empresa?tipo=${tipo.slug}`}
                    style={{
                      textDecoration: "none",
                      minWidth: "68%",
                      maxWidth: "68%",
                    }}
                  >
                    <div
                      style={{
                        borderRadius: "16px",
                        border: "1px solid #E5E7EB",
                        background: "#FFFFFF",
                        padding: "10px 10px 12px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "4px",
                        boxShadow: "0 1px 4px rgba(15, 23, 42, 0.05)",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "1.6rem",
                          marginBottom: "2px",
                        }}
                      >
                        {tipo.emoji}
                      </div>

                      <h3
                        style={{
                          fontSize: "0.9rem",
                          fontWeight: 700,
                          color: "#0F172A",
                        }}
                      >
                        {tipo.titulo}
                      </h3>

                      <p
                        style={{
                          fontSize: "0.76rem",
                          color: "#64748B",
                          lineHeight: 1.3,
                        }}
                      >
                        {tipo.descricao}
                      </p>

                      <span
                        style={{
                          marginTop: "2px",
                          fontSize: "0.76rem",
                          fontWeight: 600,
                          color: "#2563EB",
                        }}
                      >
                        Escolher este tipo →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>

              {/* CONTROLES DE SETA */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "10px",
                  marginTop: "2px",
                }}
              >
                <button
                  type="button"
                  onClick={() => scrollCarrossel(indexSecao, "left")}
                  style={{
                    border: "none",
                    background: "transparent",
                    fontSize: "1rem",
                    cursor: "pointer",
                    color: "#9CA3AF",
                  }}
                >
                  ◀
                </button>
                <span
                  style={{
                    fontSize: "0.72rem",
                    color: "#9CA3AF",
                  }}
                >
                  Arraste para o lado ou use as setas
                </span>
                <button
                  type="button"
                  onClick={() => scrollCarrossel(indexSecao, "right")}
                  style={{
                    border: "none",
                    background: "transparent",
                    fontSize: "1rem",
                    cursor: "pointer",
                    color: "#9CA3AF",
                  }}
                >
                  ▶
                </button>
              </div>
            </section>
          ))}
        </div>

        {/* CSS extra para esconder scrollbar horizontal dos carrosseis */}
        <style>
          {`
            .empresa-carousel::-webkit-scrollbar {
              display: none;
            }
          `}
        </style>
      </div>
    </div>
  );
}
