"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";

type ResultadoBlocos = {
  area: number;
  areaLiquida: number;
  blocos: number;
  blocosComPerda: number;
  argamassaLitros: number;
  perdaPercent: number;
  tipoBlocoLabel: string;
  tipoParedeLabel: string;
};

const TIPOS_BLOCOS = [
  {
    id: "14",
    label: "Bloco 14 cm (vedação padrão)",
    blocosPorM2: 12.5,
    argamassaLPorM2: 18,
  },
  {
    id: "19",
    label: "Bloco 19 cm (estrutural)",
    blocosPorM2: 12,
    argamassaLPorM2: 20,
  },
  {
    id: "comum",
    label: "Bloco comum 9x19x39",
    blocosPorM2: 12.5,
    argamassaLPorM2: 16,
  },
  {
    id: "canaleta",
    label: "Bloco canaleta",
    blocosPorM2: 12.5,
    argamassaLPorM2: 0, // normalmente quase sem argamassa lateral
  },
];

const TIPOS_PAREDE = [
  { id: "interna", label: "Parede interna" },
  { id: "externa", label: "Parede externa" },
  { id: "estrutural", label: "Parede estrutural" },
  { id: "muro", label: "Muro / Divisa" },
];

export default function CalculoBlocosPage() {
  const [tipoBloco, setTipoBloco] = useState("14");
  const [tipoParede, setTipoParede] = useState("interna");
  const [altura, setAltura] = useState("");
  const [comprimento, setComprimento] = useState("");
  const [perda, setPerda] = useState("10");
  const [porta, setPorta] = useState("");
  const [janela, setJanela] = useState("");
  const [resultado, setResultado] = useState<ResultadoBlocos | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const h = parseFloat(altura.replace(",", "."));
    const c = parseFloat(comprimento.replace(",", "."));
    const p = parseFloat(perda.replace(",", "."));
    const portaM2 = parseFloat(porta.replace(",", ".")) || 0;
    const janelaM2 = parseFloat(janela.replace(",", ".")) || 0;

    if (!h || !c || h <= 0 || c <= 0) {
      alert("Preencha altura e comprimento da parede com valores válidos.");
      return;
    }

    const tipoBlocoInfo =
      TIPOS_BLOCOS.find((b) => b.id === tipoBloco) ?? TIPOS_BLOCOS[0];

    const area = h * c;
    const desconto = portaM2 + janelaM2;
    const areaLiquida = Math.max(area - desconto, 0);

    const perdaPercent = isNaN(p) ? 0 : p;
    const blocos = areaLiquida * tipoBlocoInfo.blocosPorM2;
    const blocosComPerda = blocos * (1 + perdaPercent / 100);

    const argamassaLitros = areaLiquida * tipoBlocoInfo.argamassaLPorM2;

    setResultado({
      area,
      areaLiquida,
      blocos,
      blocosComPerda,
      argamassaLitros,
      perdaPercent,
      tipoBlocoLabel: tipoBlocoInfo.label,
      tipoParedeLabel:
        TIPOS_PAREDE.find((p) => p.id === tipoParede)?.label ||
        "Parede",
    });
  }

  function format(n: number, casas = 2) {
    return n.toFixed(casas).replace(".", ",");
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
        {/* VOLTAR */}
        <div
          style={{
            marginBottom: "16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Link
            href="/painel/calculos"
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
            ← Voltar
          </Link>

          <span style={{ fontSize: "0.75rem", color: "#6B7280" }}>
            Cálculo de blocos
          </span>
        </div>

        {/* HEADER */}
        <header style={{ marginBottom: "18px" }}>
          <h1
            style={{
              fontSize: "1.35rem",
              fontWeight: 700,
              color: "#111827",
            }}
          >
            Calcular blocos
          </h1>
          <p
            style={{
              fontSize: "0.85rem",
              color: "#6B7280",
              marginTop: "4px",
            }}
          >
            Informe o tipo de bloco, medidas da parede e aberturas. Mostraremos a
            quantidade ideal de blocos e argamassa.
          </p>
        </header>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            marginBottom: "18px",
          }}
        >
          {/* Tipo de bloco */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <label
              htmlFor="tipoBloco"
              style={{
                fontSize: "0.85rem",
                fontWeight: 500,
                marginBottom: "4px",
                color: "#374151",
              }}
            >
              Tipo de bloco
            </label>

            <select
              id="tipoBloco"
              value={tipoBloco}
              onChange={(e) => setTipoBloco(e.target.value)}
              style={{
                padding: "10px 12px",
                borderRadius: "10px",
                border: "1px solid #D1D5DB",
                background: "#FFFFFF",
                fontSize: "0.9rem",
              }}
            >
              {TIPOS_BLOCOS.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.label}
                </option>
              ))}
            </select>
          </div>

          {/* Tipo de parede */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <label
              htmlFor="tipoParede"
              style={{
                fontSize: "0.85rem",
                fontWeight: 500,
                marginBottom: "4px",
                color: "#374151",
              }}
            >
              Tipo da parede
            </label>

            <select
              id="tipoParede"
              value={tipoParede}
              onChange={(e) => setTipoParede(e.target.value)}
              style={{
                padding: "10px 12px",
                borderRadius: "10px",
                border: "1px solid #D1D5DB",
                background: "#FFFFFF",
                fontSize: "0.9rem",
              }}
            >
              {TIPOS_PAREDE.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {/* Medidas */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <label
              htmlFor="altura"
              style={{
                fontSize: "0.85rem",
                fontWeight: 500,
                marginBottom: "4px",
                color: "#374151",
              }}
            >
              Altura da parede (m)
            </label>
            <input
              id="altura"
              value={altura}
              onChange={(e) => setAltura(e.target.value)}
              placeholder="Ex: 2,70"
              inputMode="decimal"
              style={{
                padding: "10px 12px",
                borderRadius: "10px",
                border: "1px solid #D1D5DB",
                background: "#FFFFFF",
                fontSize: "0.9rem",
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <label
              htmlFor="comprimento"
              style={{
                fontSize: "0.85rem",
                fontWeight: 500,
                marginBottom: "4px",
                color: "#374151",
              }}
            >
              Comprimento da parede (m)
            </label>
            <input
              id="comprimento"
              value={comprimento}
              onChange={(e) => setComprimento(e.target.value)}
              placeholder="Ex: 5,00"
              inputMode="decimal"
              style={{
                padding: "10px 12px",
                borderRadius: "10px",
                border: "1px solid #D1D5DB",
                background: "#FFFFFF",
                fontSize: "0.9rem",
              }}
            />
          </div>

          {/* Aberturas */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <label
              htmlFor="porta"
              style={{
                fontSize: "0.85rem",
                fontWeight: 500,
                marginBottom: "4px",
                color: "#374151",
              }}
            >
              Área da porta (m²) - opcional
            </label>
            <input
              id="porta"
              value={porta}
              onChange={(e) => setPorta(e.target.value)}
              placeholder="Ex: 1,80"
              inputMode="decimal"
              style={{
                padding: "10px 12px",
                borderRadius: "10px",
                border: "1px solid #D1D5DB",
                background: "#FFFFFF",
                fontSize: "0.9rem",
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <label
              htmlFor="janela"
              style={{
                fontSize: "0.85rem",
                fontWeight: 500,
                marginBottom: "4px",
                color: "#374151",
              }}
            >
              Área da janela (m²) - opcional
            </label>
            <input
              id="janela"
              value={janela}
              onChange={(e) => setJanela(e.target.value)}
              placeholder="Ex: 1,20"
              inputMode="decimal"
              style={{
                padding: "10px 12px",
                borderRadius: "10px",
                border: "1px solid #D1D5DB",
                background: "#FFFFFF",
                fontSize: "0.9rem",
              }}
            />
          </div>

          {/* Perdas */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <label
              htmlFor="perda"
              style={{
                fontSize: "0.85rem",
                fontWeight: 500,
                marginBottom: "4px",
                color: "#374151",
              }}
            >
              Perda (%) de blocos
            </label>
            <input
              id="perda"
              value={perda}
              onChange={(e) => setPerda(e.target.value)}
              placeholder="Ex: 10"
              inputMode="decimal"
              style={{
                padding: "10px 12px",
                borderRadius: "10px",
                border: "1px solid #D1D5DB",
                background: "#FFFFFF",
                fontSize: "0.9rem",
              }}
            />
            <p
              style={{
                marginTop: "4px",
                fontSize: "0.72rem",
                color: "#6B7280",
              }}
            >
              Perdas recomendadas: 5% para profissional, 8–12% para iniciante.
            </p>
          </div>

          <button
            type="submit"
            style={{
              marginTop: "6px",
              padding: "12px 0",
              borderRadius: "999px",
              background: "linear-gradient(to right, #0284C7, #0EA5E9)",
              border: "none",
              color: "#FFFFFF",
              fontSize: "1rem",
              fontWeight: 600,
              boxShadow: "0 3px 8px rgba(0,0,0,0.15)",
              cursor: "pointer",
            }}
          >
            Calcular blocos
          </button>
        </form>

        {/* RESULTADO */}
        {resultado && (
          <section
            style={{
              borderRadius: "18px",
              border: "1px solid #E5E7EB",
              background: "#F9FAFB",
              padding: "14px 14px 12px",
            }}
          >
            <h2
              style={{
                fontSize: "0.95rem",
                fontWeight: 600,
                color: "#111827",
                marginBottom: "8px",
              }}
            >
              Resultado
            </h2>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "4px",
                fontSize: "0.85rem",
                color: "#374151",
              }}
            >
              <span>
                <strong>Tipo de bloco:</strong> {resultado.tipoBlocoLabel}
              </span>
              <span>
                <strong>Parede:</strong> {resultado.tipoParedeLabel}
              </span>
              <span>
                <strong>Área total:</strong>{" "}
                {format(resultado.area, 2)} m²
              </span>
              <span>
                <strong>Área líquida:</strong>{" "}
                {format(resultado.areaLiquida, 2)} m²
              </span>
            </div>

            <hr
              style={{
                margin: "10px 0",
                border: "none",
                borderTop: "1px solid #E5E7EB",
              }}
            />

            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: "4px",
                fontSize: "0.85rem",
                color: "#374151",
              }}
            >
              <li>
                <strong>Blocos necessários:</strong>{" "}
                {format(resultado.blocos, 1)}
              </li>
              <li>
                <strong>Blocos com perda:</strong>{" "}
                {format(resultado.blocosComPerda, 1)}
                {resultado.perdaPercent > 0 &&
                  ` (inclui ${resultado.perdaPercent}% de perda)`}
              </li>
              <li>
                <strong>Argamassa:</strong>{" "}
                {format(resultado.argamassaLitros, 0)} litros
              </li>
            </ul>

            <hr
              style={{
                margin: "10px 0",
                border: "none",
                borderTop: "1px solid #E5E7EB",
              }}
            />

            <p
              style={{
                fontSize: "0.82rem",
                color: "#6B7280",
                marginBottom: "4px",
                fontWeight: 600,
              }}
            >
              Resumo para enviar ao depósito
            </p>

            <p
              style={{
                fontSize: "0.8rem",
                color: "#374151",
              }}
            >
              {`Parede ${resultado.tipoParedeLabel}, ${resultado.tipoBlocoLabel}. Área líquida: ${format(resultado.areaLiquida, 2)} m². Necessário: ${format(resultado.blocosComPerda, 1)} blocos (considerando perdas). Argamassa estimada: ${format(resultado.argamassaLitros, 0)} litros.`}
            </p>

            <p
              style={{
                marginTop: "6px",
                fontSize: "0.72rem",
                color: "#6B7280",
              }}
            >
              Valores aproximados. O pedreiro pode ajustar perdas, tipo de bloco
              e argamassa conforme experiência.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
