"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

type CalcItem = {
  nome: string;
  rota: string;
};

export default function PainelCalculosPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tipo = searchParams.get("tipo"); // sem default agora

  // CÁLCULOS GRATUITOS (BÁSICOS)
  const calculosGratis: CalcItem[] = [
    { nome: "Calcular Concreto", rota: "/calc/concreto" },
    { nome: "Calcular Blocos", rota: "/calc/blocos" },
    { nome: "Calcular Cimento / Argamassa", rota: "/calc/argamassa" },
    { nome: "Calcular Areia e Brita", rota: "/calc/agregados" },
    { nome: "Calcular Vidros", rota: "/calc/vidros" },
    { nome: "Calcular Tinta", rota: "/calc/tinta" },
    { nome: "Calcular Fiação", rota: "/calc/fiacao" },
    { nome: "Calcular Encanamento", rota: "/calc/encanamento" },
  ];

  // Quebra em páginas de 4 itens
  const paginas: CalcItem[][] = [];
  for (let i = 0; i < calculosGratis.length; i += 4) {
    paginas.push(calculosGratis.slice(i, i + 4));
  }

  // LISTA QUE PASSA NO CARROSSEL PRO
  const calculosProCarrossel = [
    "Calcular Ferro / Aço",
    "Calcular Formas (Madeira)",
    "Calcular Pilar",
    "Calcular Viga",
    "Calcular Laje",
    "Calcular Tijolos",
    "Reboco / Emboço",
    "Calcular Piso / Porcelanato",
    "Calcular Rejunte",
    "Calcular Pintura",
    "Impermeabilização",
    "Telhado",
    "Drywall",
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % calculosProCarrossel.length);
    }, 2000);
    return () => clearInterval(id);
  }, []);

  // Função do botão voltar
  const handleVoltar = () => {
    if (tipo === "profissional") {
      router.push("/painel/profissional");
    } else if (tipo === "cliente") {
      router.push("/painel/cliente");
    } else {
      router.back(); // fallback: volta pra página anterior
    }
  };

  return (
    <main
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        padding: "40px 0",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "440px",
          background: "#FFFFFF",
          borderRadius: "28px",
          padding: "26px 22px 28px",
          boxShadow: "0 4px 18px rgba(0,0,0,0.08)",
        }}
      >
        {/* BOTÃO VOLTAR (AGORA DINÂMICO) */}
        <div style={{ marginBottom: "20px", display: "flex" }}>
          <button
            type="button"
            onClick={handleVoltar}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 14px",
              borderRadius: "999px",
              border: "1px solid #E5E7EB",
              background: "#FFFFFF",
              fontSize: "0.78rem",
              fontWeight: 500,
              color: "#2563EB",
              boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
              textDecoration: "none",
              cursor: "pointer",
            }}
          >
            ← Voltar ao painel
          </button>
        </div>

        {/* HEADER */}
        <div style={{ marginBottom: "20px" }}>
          <h1
            style={{
              fontSize: "1.45rem",
              fontWeight: 700,
              color: "#111827",
            }}
          >
            Cálculos da sua Obra
          </h1>

          <p
            style={{
              fontSize: "0.85rem",
              color: "#6B7280",
              marginTop: "4px",
            }}
          >
            Aqui você encontra os cálculos básicos liberados para qualquer
            cliente e também os cálculos avançados do{" "}
            <strong>ConstruThéo Pro</strong>, pensados para quem quer ir além.
          </p>
        </div>

        {/* BÁSICOS (GRATUITO) – 4 POR PÁGINA */}
        <section style={{ marginBottom: "24px" }}>
          <h2
            style={{
              fontSize: "0.95rem",
              fontWeight: 700,
              color: "#111827",
              marginBottom: "8px",
            }}
          >
            Cálculos básicos da obra 
          </h2>

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
            {paginas.map((pagina, idx) => (
              <div
                key={idx}
                style={{
                  minWidth: "100%",
                  scrollSnapAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                {pagina.map((item) => (
                  <Link
                    key={item.rota}
                    href={item.rota}
                    style={{
                      padding: "14px",
                      borderRadius: "16px",
                      border: "1px solid #E5E7EB",
                      background: "#F8FAFC",
                      textDecoration: "none",
                      fontSize: "0.9rem",
                      color: "#0F172A",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      transition: "0.2s ease",
                    }}
                  >
                    <span style={{ fontWeight: 500 }}>{item.nome}</span>
                    <span style={{ color: "#2563EB", fontSize: "1.1rem" }}>
                      →
                    </span>
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* SEPARADOR */}
        <hr
          style={{
            border: "none",
            borderTop: "1px dashed #E5E7EB",
            margin: "8px 0 18px",
          }}
        />

        {/* CARD DO PRO */}
        <div
          style={{
            position: "relative",
            background: "linear-gradient(135deg, #0f172a, #1e293b)",
            padding: "24px",
            borderRadius: "22px",
            overflow: "hidden",
            color: "white",
            textAlign: "left",
          }}
        >
          {/* Cadeado grande de fundo (emoji) */}
          <div
            style={{
              position: "absolute",
              right: "-20px",
              top: "-40px",
              fontSize: "7rem",
              opacity: 0.1,
              pointerEvents: "none",
            }}
          >
            🔒
          </div>

          <h2
            style={{
              fontSize: "1.1rem",
              fontWeight: 700,
              marginBottom: "8px",
            }}
          >
            ConstruThéo Pro
          </h2>

          <p
            style={{
              fontSize: "0.82rem",
              color: "#CBD5E1",
              marginBottom: "14px",
            }}
          >
            Desbloqueie os cálculos avançados da obra e tenha acesso completo
            aos cálculos estruturais e de acabamento.
          </p>

          {/* Carrossel Pro */}
          <div
            style={{
              height: "32px",
              overflow: "hidden",
              marginBottom: "14px",
              fontSize: "1.05rem",
              fontWeight: 700,
              color: "#FACC15",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <div
              key={index}
              style={{
                width: "100%",
                transition: "0.3s",
              }}
            >
              {calculosProCarrossel[index]}
            </div>
          </div>

          <button
            disabled
            style={{
              marginTop: "10px",
              width: "100%",
              padding: "10px 0",
              borderRadius: "14px",
              background: "#FACC15",
              color: "#1e293b",
              fontWeight: 700,
              border: "none",
              fontSize: "0.9rem",
              opacity: 0.8,
            }}
          >
            Disponível em breve
          </button>
        </div>
      </div>
    </main>
  );
}
