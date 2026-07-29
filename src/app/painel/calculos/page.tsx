"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import CalculadoraBlocos from "../../../components/calculos/CalculadoraBlocos";
import CalculadoraConcreto from "../../../components/calculos/CalculadoraConcreto";
import CalculadoraArgamassa from "../../../components/calculos/CalculadoraArgamassa";
import CalculadoraAgregados from "../../../components/calculos/CalculadoraAgregados";
import CalculadoraTinta from "../../../components/calculos/CalculadoraTinta";
import CalculadoraVidros from "../../../components/calculos/CalculadoraVidros";
import CalculadoraFiacao from "../../../components/calculos/CalculadoraFiacao";
import CalculadoraEncanamento from "../../../components/calculos/CalculadoraEncanamento";

type CalcItem = {
  nome: string;
  rota: string;
};

export default function PainelCalculosPage() {
  const router = useRouter();

  const [tipo, setTipo] = useState<string | null>(null);
  const [verificandoAcesso, setVerificandoAcesso] = useState(true);
  const [calculadoraAberta, setCalculadoraAberta] = useState<string | null>(
    null
  );
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const tipoParam = params.get("tipo");

    if (tipoParam) {
      setTipo(tipoParam);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const profStr = localStorage.getItem(
      "construtheo_profissional_atual"
    );

    const clienteStr = localStorage.getItem(
      "construtheo_cliente_atual"
    );

    if (!profStr && !clienteStr) {
      router.replace("/login");
      return;
    }
    

    setVerificandoAcesso(false);
  }, [router]);

  const calculosGratis: CalcItem[] = [
    {
      nome: "Calcular Concreto",
      rota: "/calc/concreto",
    },
    {
      nome: "Calcular Blocos",
      rota: "/calc/blocos",
    },
    {
      nome: "Calcular Cimento / Argamassa",
      rota: "/calc/argamassa",
    },
    {
      nome: "Calcular Areia e Brita",
      rota: "/calc/agregados",
    },
    {
      nome: "Calcular Vidros",
      rota: "/calc/vidros",
    },
    {
      nome: "Calcular Tinta",
      rota: "/calc/tinta",
    },
    {
      nome: "Calcular Fiação",
      rota: "/calc/fiacao",
    },
    {
      nome: "Calcular Encanamento",
      rota: "/calc/encanamento",
    },
  ];

  const paginas: CalcItem[][] = [];

  for (let i = 0; i < calculosGratis.length; i += 4) {
    paginas.push(calculosGratis.slice(i, i + 4));
  }

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

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex(
        (indiceAtual) =>
          (indiceAtual + 1) % calculosProCarrossel.length
      );
    }, 2000);

    return () => {
      window.clearInterval(id);
    };
  }, [calculosProCarrossel.length]);

  function handleVoltarPainel() {
    if (typeof window === "undefined") {
      router.push("/login");
      return;
    }

    const profStr = localStorage.getItem(
      "construtheo_profissional_atual"
    );

    const clienteStr = localStorage.getItem(
      "construtheo_cliente_atual"
    );

    if (tipo === "cliente") {
      router.push("/painel/cliente");
      return;
    }

    if (tipo === "profissional") {
      if (profStr) {
        try {
          const profissional = JSON.parse(profStr);
          const id = profissional?.id;

          const apelido = encodeURIComponent(
            profissional?.apelido || "profissional"
          );

          if (id) {
            router.push(
              `/painel/profissional?id=${id}&apelido=${apelido}`
            );
          } else {
            router.push("/painel/profissional");
          }
        } catch {
          router.push("/painel/profissional");
        }
      } else {
        router.push("/painel/profissional");
      }

      return;
    }

    if (clienteStr) {
      router.push("/painel/cliente");
      return;
    }

    if (profStr) {
      try {
        const profissional = JSON.parse(profStr);
        const id = profissional?.id;

        const apelido = encodeURIComponent(
          profissional?.apelido || "profissional"
        );

        if (id) {
          router.push(
            `/painel/profissional?id=${id}&apelido=${apelido}`
          );
        } else {
          router.push("/painel/profissional");
        }
      } catch {
        router.push("/painel/profissional");
      }

      return;
    }

    router.push("/login");
  }

  function abrirCalculadora(rota: string) {
    if (rota === "/calc/concreto") {
      setCalculadoraAberta("concreto");
    }

    if (rota === "/calc/blocos") {
      setCalculadoraAberta("blocos");
    }
if (rota === "/calc/agregados") {
  setCalculadoraAberta("agregados");
  return;
}
if (rota === "/calc/vidros") {
  setCalculadoraAberta("vidros");
  return;
}
if (rota === "/calc/fiacao") {
  setCalculadoraAberta("fiacao");
  return;
}
if (rota === "/calc/encanamento") {
  setCalculadoraAberta("encanamento");
  return;
}
if (calculadoraAberta === "tinta") {
  return (
    <CalculadoraTinta
      onVoltar={voltarParaLista}
    />
  );
}

if (calculadoraAberta === "vidros") {
  return (
    <CalculadoraVidros
      onVoltar={voltarParaLista}
    />
  );
}
if (calculadoraAberta === "vidros") {
  return (
    <CalculadoraVidros
      onVoltar={voltarParaLista}
    />
  );
}
if (calculadoraAberta === "fiacao") {
  return (
    <CalculadoraFiacao
      onVoltar={voltarParaLista}
    />
  );
}
if (calculadoraAberta === "encanamento") {
  return (
    <CalculadoraEncanamento
      onVoltar={voltarParaLista}
    />
  );
}
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }
  

  function voltarParaLista() {
    setCalculadoraAberta(null);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  if (verificandoAcesso) {
    return null;
  }

  if (calculadoraAberta === "concreto") {
    return (
      <CalculadoraConcreto
        onVoltar={voltarParaLista}
      />
    );
  }

  if (calculadoraAberta === "blocos") {
    return (
      <CalculadoraBlocos
        onVoltar={voltarParaLista}
      />
    );
  }
  if (calculadoraAberta === "argamassa") {
  return (
    <CalculadoraArgamassa
      onVoltar={voltarParaLista}
    />
  );
}
if (calculadoraAberta === "agregados") {
  return (
    <CalculadoraAgregados
      onVoltar={voltarParaLista}
    />
  );
}

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
        <div
          style={{
            marginBottom: "20px",
            display: "flex",
          }}
        >
          <button
            type="button"
            onClick={handleVoltarPainel}
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
            Cálculos básicos liberados e os avançados no{" "}
            <strong>ConstruThéo Pro</strong>.
          </p>
        </div>

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
            {paginas.map((pagina, indicePagina) => (
              <div
                key={indicePagina}
                style={{
                  minWidth: "100%",
                  scrollSnapAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                {pagina.map((item) => {
                  const abreDentroDoPainel =
                    item.rota === "/calc/concreto" ||
                    item.rota === "/calc/blocos";

                  if (abreDentroDoPainel) {
                    return (
                      <button
                        key={item.rota}
                        type="button"
                        onClick={() =>
                          abrirCalculadora(item.rota)
                        }
                        style={{
                          width: "100%",
                          padding: "14px",
                          borderRadius: "16px",
                          border: "1px solid #E5E7EB",
                          background: "#F8FAFC",
                          fontSize: "0.9rem",
                          color: "#0F172A",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          cursor: "pointer",
                          textAlign: "left",
                          fontFamily: "inherit",
                        }}
                      >
                        <span style={{ fontWeight: 500 }}>
                          {item.nome}
                        </span>

                        <span
                          style={{
                            color: "#2563EB",
                            fontSize: "1.1rem",
                          }}
                        >
                          →
                        </span>
                      </button>
                    );
                  }

                  return (
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
                      }}
                    >
                      <span style={{ fontWeight: 500 }}>
                        {item.nome}
                      </span>

                      <span
                        style={{
                          color: "#2563EB",
                          fontSize: "1.1rem",
                        }}
                      >
                        →
                      </span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        </section>

        <div
          style={{
            background:
              "linear-gradient(135deg, #0f172a, #1e293b)",
            padding: "24px",
            borderRadius: "22px",
            color: "#FFFFFF",
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
            Desbloqueie todos os cálculos avançados.
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
            type="button"
            disabled
            style={{
              width: "100%",
              padding: "10px 0",
              borderRadius: "14px",
              background: "#FACC15",
              color: "#1E293B",
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