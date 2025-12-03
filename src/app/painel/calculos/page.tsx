"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type CalcItem = {
  nome: string;
  rota: string;
};

export default function PainelCalculosPage() {
  const router = useRouter();

  // estado para o tipo da operação (cliente/profissional)
  const [tipo, setTipo] = useState<string | null>(null);

  // lê ?tipo= da URL no browser
  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const tipoParam = params.get("tipo");

    if (tipoParam) setTipo(tipoParam);
  }, []);

  // lista de cálculos básicos (gratuitos)
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

  // Separar em páginas de 4 itens (carrossel)
  const paginas: CalcItem[][] = [];
  for (let i = 0; i < calculosGratis.length; i += 4) {
    paginas.push(calculosGratis.slice(i, i + 4));
  }

  // carrosel PRO
  const calculosProCarrossel = [
    "Calcular Ferro / Aço",
    "Calcular Formas",
    "Calcular Pilar",
    "Calcular Viga",
    "Calcular Laje",
    "Calcular Tijolos",
    "Reboco / Emboço",
    "Calcular Piso",
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

  // botão voltar -> detecta painel certo pelo localStorage
  const handleVoltar = () => {
    if (typeof window === "undefined") {
      router.push("/login");
      return;
    }

    const profStr = localStorage.getItem("construtheo_profissional_atual");
    const clienteStr = localStorage.getItem("construtheo_cliente_atual");
    const empresaStr = localStorage.getItem("construtheo_empresa_atual");

    // PROFISSIONAL
    if (profStr) {
      try {
        const prof = JSON.parse(profStr);
        const id = prof?.id;
        const apelido = encodeURIComponent(prof?.apelido || "profissional");

        if (id) {
          router.push(`/painel/profissional?id=${id}&apelido=${apelido}`);
        } else {
          router.push("/painel/profissional");
        }
        return;
      } catch {
        router.push("/painel/profissional");
        return;
      }
    }

    // CLIENTE
    if (clienteStr) {
      router.push("/painel/cliente");
      return;
    }

    // EMPRESA
    if (empresaStr) {
      router.push("/painel/empresa");
      return;
    }

    // Fallback usando ?tipo=
    if (tipo === "profissional") {
      router.push("/painel/profissional");
    } else if (tipo === "cliente") {
      router.push("/painel/cliente");
    } else {
      router.push("/login");
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
        {/* botão voltar */}
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
              cursor: "pointer",
            }}
          >
            ← Voltar ao painel
          </button>
        </div>

        {/* header */}
        <div style={{ marginBottom: "20px" }}>
          <h1 style={{ fontSize: "1.45rem", fontWeight: 700, color: "#111827" }}>
            Cálculos da sua Obra
          </h1>
          <p
            style={{
              fontSize: "0.85rem",
              color: "#6B7280",
              marginTop: "4px",
            }}
          >
            Cálculos básicos liberados e os avançados no{" "}
            <strong>ConstruThéo Pro</strong>.
          </p>
        </div>

        {/* básicos */}
        <section style={{ marginBottom: "24px" }}>
          <h2
            style={{
              fontSize: "0.95rem",
              fontWeight: 700,
              color: "#111827",
              marginBottom: "8px",
            }}
          >
            Cálculos básicos
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
                      border: "1px solid #E5E7EB", // <-- corrigido aqui
                      background: "#F8FAFC",
                      textDecoration: "none",
                      fontSize: "0.9rem",
                      color: "#0F172A",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
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

        {/* PRO */}
        <div
          style={{
            background: "linear-gradient(135deg, #0f172a, #1e293b)",
            padding: "24px",
            borderRadius: "22px",
            color: "white",
            textAlign: "left",
          }}
        >
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
            Desbloqueie todos cálculos avançados.
          </p>

          <div
            style={{
              height: "32px",
              overflow: "hidden",
              marginBottom: "14px",
              fontSize: "1.05rem",
              fontWeight: 700,
              color: "#FACC15",
              textAlign: "center",
            }}
          >
            {calculosProCarrossel[index]}
          </div>

          <button
            disabled
            style={{
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
            Assine em breve
          </button>
        </div>
      </div>
    </main>
  );
}
