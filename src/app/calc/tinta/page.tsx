"use client";

import { useState } from "react";
import Link from "next/link";

export default function CalcTintaPage() {
  const [area, setArea] = useState("");
  const [demãos, setDemaos] = useState("2");
  const [rendimento, setRendimento] = useState("10"); // m²/L
  const [litros, setLitros] = useState<number | null>(null);
  const [latas18, setLatas18] = useState<number | null>(null);
  const [latas36, setLatas36] = useState<number | null>(null);

  function calcular() {
    const A = parseFloat(area.replace(",", "."));
    const D = parseFloat(demãos.replace(",", "."));
    const R = parseFloat(rendimento.replace(",", "."));
    if (!A || !D || !R) {
      setLitros(null);
      setLatas18(null);
      setLatas36(null);
      return;
    }

    const totalLitros = (A * D) / R;

    // combinação simples de latas 18L + 3,6L para cobrir o volume
    let melhor18 = 0;
    let melhor36 = 0;
    let menorSobra = Number.POSITIVE_INFINITY;

    for (let l18 = 0; l18 <= 10; l18++) {
      for (let l36 = 0; l36 <= 20; l36++) {
        const volume = l18 * 18 + l36 * 3.6;
        if (volume >= totalLitros) {
          const sobra = volume - totalLitros;
          if (sobra < menorSobra) {
            menorSobra = sobra;
            melhor18 = l18;
            melhor36 = l36;
          }
        }
      }
    }

    setLitros(totalLitros);
    setLatas18(melhor18);
    setLatas36(melhor36);
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
        <div style={{ marginBottom: "16px" }}>
          <Link
            href="/painel/calculos"
            style={{
              fontSize: "0.78rem",
              color: "#2563EB",
              textDecoration: "none",
            }}
          >
            ← Voltar aos cálculos
          </Link>
        </div>

        <h1
          style={{
            fontSize: "1.4rem",
            fontWeight: 700,
            color: "#111827",
            marginBottom: "4px",
          }}
        >
          Calcular Tinta
        </h1>
        <p
          style={{
            fontSize: "0.85rem",
            color: "#6B7280",
            marginBottom: "18px",
          }}
        >
          Informe a área total a pintar, o número de demãos e o rendimento da
          tinta para estimar a quantidade de litros e latas.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            calcular();
          }}
          style={{ display: "flex", flexDirection: "column", gap: "12px" }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <label
              style={{
                fontSize: "0.85rem",
                fontWeight: 500,
                marginBottom: "4px",
              }}
            >
              Área a pintar (m²)
            </label>
            <input
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="Ex: 80"
              style={{
                padding: "10px 12px",
                borderRadius: "10px",
                border: "1px solid #D1D5DB",
                fontSize: "0.9rem",
              }}
            />
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <label
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 500,
                  marginBottom: "4px",
                }}
              >
                Nº de demãos
              </label>
              <input
                value={demãos}
                onChange={(e) => setDemaos(e.target.value)}
                placeholder="Ex: 2"
                style={{
                  padding: "10px 12px",
                  borderRadius: "10px",
                  border: "1px solid #D1D5DB",
                  fontSize: "0.9rem",
                }}
              />
            </div>

            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <label
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 500,
                  marginBottom: "4px",
                }}
              >
                Rendimento (m²/L)
              </label>
              <input
                value={rendimento}
                onChange={(e) => setRendimento(e.target.value)}
                placeholder="Ex: 10"
                style={{
                  padding: "10px 12px",
                  borderRadius: "10px",
                  border: "1px solid #D1D5DB",
                  fontSize: "0.9rem",
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            style={{
              marginTop: "6px",
              padding: "12px 0",
              borderRadius: "999px",
              background: "#0284C7",
              color: "white",
              border: "none",
              fontWeight: 600,
              fontSize: "0.95rem",
              cursor: "pointer",
            }}
          >
            Calcular
          </button>
        </form>

        {litros !== null && (
          <div
            style={{
              marginTop: "18px",
              padding: "14px 12px",
              borderRadius: "16px",
              background: "#F1F5F9",
              fontSize: "0.85rem",
              color: "#0F172A",
            }}
          >
            <p>
              Quantidade mínima de tinta:{" "}
              <strong>{litros.toFixed(1).replace(".", ",")} L</strong>
            </p>
            <p style={{ marginTop: "4px" }}>
              Sugestão de latas:
              <br />
              • <strong>{latas18}</strong> lata(s) de 18 L
              <br />
              • <strong>{latas36}</strong> lata(s) de 3,6 L
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
