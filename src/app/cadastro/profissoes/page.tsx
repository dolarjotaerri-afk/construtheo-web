"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

type Area = {
  nome: string;
  descricao: string;
  area: string;
};

const areas: Area[] = [
  {
    nome: "Alvenaria",
    descricao: "Pedreiro, ajudante, demolição, concretagem...",
    area: "alvenaria",
  },
  {
    nome: "Acabamento",
    descricao: "Pintor, gesseiro, azulejista, revestimento...",
    area: "acabamento",
  },
  {
    nome: "Estrutura",
    descricao: "Armador, carpinteiro de forma, mestre de obras...",
    area: "estrutura",
  },
  {
    nome: "Elétrica",
    descricao: "Eletricista residencial e industrial.",
    area: "eletrica",
  },
  {
    nome: "Hidráulica",
    descricao: "Encanador, manutenção e instalações.",
    area: "hidraulica",
  },
  {
    nome: "Vidraçaria",
    descricao: "Instalação de vidro, box, espelhos...",
    area: "vidracaria",
  },
  {
    nome: "Jardinagem e paisagismo",
    descricao: "Poda, grama, corte de grama, limpeza de piscina...",
    area: "jardinagem",
  },
  {
    nome: "Outros",
    descricao: "Profissões e serviços diversos.",
    area: "outros",
  },
];

// só pra gerar a “sigla” redondinha em cima do card
function siglaDaArea(nome: string) {
  const primeiraPalavra = nome.split(" ")[0];
  return primeiraPalavra.slice(0, 2).toUpperCase();
}

// separa em “fileiras” (2 ou 3 cards por linha, rolando pro lado)
const rows: Area[][] = [
  areas.slice(0, 3), // Alvenaria, Acabamento, Estrutura
  areas.slice(3, 6), // Elétrica, Hidráulica, Vidraçaria
  areas.slice(6),    // Jardinagem e paisagismo, Outros
];

export default function ProfissoesPage() {
  const router = useRouter();

  return (
    <main
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        padding: "32px 0",
      }}
    >
      {/* CARD DE FUNDO ESTILO SMARTPHONE */}
      <div
        style={{
          width: "100%",
          maxWidth: "440px",
          background: "#FFFFFF",
          borderRadius: "28px",
          padding: "22px 20px 24px",
          boxShadow: "0 4px 18px rgba(15,23,42,0.10)",
        }}
      >
        {/* Botão voltar */}
        <div style={{ marginBottom: "14px" }}>
          <Link
            href="/login"
            style={{
              fontSize: "0.78rem",
              color: "#2563EB",
              border: "1px solid #E5E7EB",
              padding: "6px 14px",
              borderRadius: "999px",
              textDecoration: "none",
              background: "#FFFFFF",
              boxShadow: "0 1px 2px rgba(15,23,42,0.06)",
            }}
          >
            ← Voltar para a tela de acesso
          </Link>
        </div>

        {/* Título */}
        <h1
          style={{
            fontSize: "1.4rem",
            fontWeight: 700,
            color: "#111827",
            marginBottom: "4px",
          }}
        >
          Escolha sua área
        </h1>
        <p
          style={{
            fontSize: "0.9rem",
            color: "#475569",
            marginBottom: "16px",
            maxWidth: "340px",
          }}
        >
          Selecione abaixo a área da sua atuação. Depois você completa seu
          cadastro profissional.
        </p>

        {/* FILEIRAS COM CARROSSEL HORIZONTAL */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {rows.map((row, idx) => (
            <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {/* opcional: subtítulo discreto por fileira */}
              {/* <span style={{ fontSize: "0.75rem", color: "#9CA3AF" }}>
                {idx === 0
                  ? "Principais áreas"
                  : idx === 1
                  ? "Instalações"
                  : "Externo e outros"}
              </span> */}

              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  gap: "10px",
                  overflowX: "auto",
                  paddingBottom: "4px",
                  scrollSnapType: "x mandatory",
                }}
              >
                {row.map((item) => (
                  <div
                    key={item.area}
                    onClick={() =>
                      router.push(`/cadastro/profissional?area=${item.area}`)
                    }
                    style={{
                      cursor: "pointer",
                      background: "#FFFFFF",
                      borderRadius: "18px",
                      padding: "12px 12px 14px",
                      boxShadow: "0 2px 8px rgba(15,23,42,0.06)",
                      border: "1px solid #E2E8F0",
                      transition: "0.22s",
                      minWidth: "62%",
                      maxWidth: "62%",
                      scrollSnapAlign: "center",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.transform = "translateY(-2px)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.transform = "translateY(0px)")
                    }
                  >
                    {/* selo redondo (sério, sem desenho) */}
                    <div
                      style={{
                        width: "30px",
                        height: "30px",
                        borderRadius: "999px",
                        background: "#EFF6FF",
                        border: "1px solid #BFDBFE",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        color: "#1D4ED8",
                        marginBottom: "8px",
                      }}
                    >
                      {siglaDaArea(item.nome)}
                    </div>

                    <h3
                      style={{
                        fontSize: "0.95rem",
                        fontWeight: 700,
                        color: "#0F172A",
                        marginBottom: "3px",
                      }}
                    >
                      {item.nome}
                    </h3>

                    <p
                      style={{
                        fontSize: "0.75rem",
                        color: "#64748B",
                        lineHeight: 1.35,
                      }}
                    >
                      {item.descricao}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
