"use client";

import { useState } from "react";
import Link from "next/link";

export default function CalcEncanamentoPage() {
  const [comprimento, setComprimento] = useState("");
  const [diametro, setDiametro] = useState("25");
  const [margem, setMargem] = useState("10"); // %
  const [resultado, setResultado] = useState<{
    total: number;
    barras3: number;
    barras6: number;
  } | null>(null);

  function calcular() {
    const C = parseFloat(comprimento.replace(",", "."));
    const M = parseFloat(margem.replace(",", "."));
    if (!C || isNaN(M)) {
      setResultado(null);
      return;
    }

    const total = C * (1 + M / 100);
    const barras3 = Math.ceil(total / 3);
    const barras6 = Math.ceil(total / 6);

    setResultado({ total, barras3, barras6 });
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
          Calcular Encanamento
        </h1>
        <p
          style={{
            fontSize: "0.85rem",
            color: "#6B7280",
            marginBottom: "18px",
          }}
        >
          Estime a metragem total de tubos e quantas barras de 3 m ou 6 m você
          precisa comprar para a instalação.
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
              Comprimento estimado de tubulação (m)
            </label>
            <input
              value={comprimento}
              onChange={(e) => setComprimento(e.target.value)}
              placeholder="Ex: 40"
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
                Diâmetro do tubo
              </label>
              <select
                value={diametro}
                onChange={(e) => setDiametro(e.target.value)}
                style={{
                  padding: "10px 12px",
                  borderRadius: "10px",
                  border: "1px solid #D1D5DB",
                  fontSize: "0.9rem",
                  background: "#FFFFFF",
                }}
              >
                <option value="20">20 mm</option>
                <option value="25">25 mm</option>
                <option value="32">32 mm</option>
                <option value="40">40 mm</option>
                <option value="50">50 mm</option>
              </select>
            </div>

            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <label
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 500,
                  marginBottom: "4px",
                }}
              >
                Margem de sobra (%)
              </label>
              <input
                value={margem}
                onChange={(e) => setMargem(e.target.value)}
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

        {resultado && (
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
              Tubo total com sobra:{" "}
              <strong>{resultado.total.toFixed(1).replace(".", ",")} m</strong>
            </p>
            <p style={{ marginTop: "4px" }}>
              Se usar barras de 3 m:{" "}
              <strong>{resultado.barras3} barra(s)</strong>
            </p>
            <p>
              Se usar barras de 6 m:{" "}
              <strong>{resultado.barras6} barra(s)</strong>
            </p>
            <p style={{ marginTop: "4px", fontSize: "0.78rem", color: "#6B7280" }}>
              Diâmetro selecionado: <strong>{diametro} mm</strong>. Lembre-se de
              escolher conexões compatíveis (joelhos, T, registros, etc.).
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
