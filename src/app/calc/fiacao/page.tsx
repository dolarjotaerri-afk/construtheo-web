"use client";

import { useState } from "react";
import Link from "next/link";

export default function CalcFiacaoPage() {
  const [potencia, setPotencia] = useState(""); // W
  const [tensao, setTensao] = useState("127");
  const [comprimento, setComprimento] = useState(""); // metros ida
  const [resultado, setResultado] = useState<{
    corrente: number;
    bitola: string;
    caboTotal: number;
  } | null>(null);

  function sugerirBitola(corrente: number): string {
    if (corrente <= 10) return "1,5 mm²";
    if (corrente <= 16) return "2,5 mm²";
    if (corrente <= 25) return "4 mm²";
    if (corrente <= 32) return "6 mm²";
    if (corrente <= 40) return "10 mm²";
    return "16 mm² ou maior (consultar projeto elétrico)";
  }

  function calcular() {
    const P = parseFloat(potencia.replace(",", "."));
    const V = parseFloat(tensao.replace(",", "."));
    const C = parseFloat(comprimento.replace(",", "."));
    if (!P || !V || !C) {
      setResultado(null);
      return;
    }

    const corrente = P / V;
    const bitola = sugerirBitola(corrente);
    const caboTotal = C * 2 * 1.1; // ida + volta + 10% folga

    setResultado({ corrente, bitola, caboTotal });
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
          Calcular Fiação
        </h1>
        <p
          style={{
            fontSize: "0.85rem",
            color: "#6B7280",
            marginBottom: "18px",
          }}
        >
          Estime a corrente do circuito, a bitola mínima recomendada do cabo e a
          metragem total de fio (ida e volta).
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
              Potência total do circuito (W)
            </label>
            <input
              value={potencia}
              onChange={(e) => setPotencia(e.target.value)}
              placeholder="Ex: 2000"
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
                Tensão (V)
              </label>
              <select
                value={tensao}
                onChange={(e) => setTensao(e.target.value)}
                style={{
                  padding: "10px 12px",
                  borderRadius: "10px",
                  border: "1px solid #D1D5DB",
                  fontSize: "0.9rem",
                  background: "#FFFFFF",
                }}
              >
                <option value="127">127 V</option>
                <option value="220">220 V</option>
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
                Comprimento (ida, m)
              </label>
              <input
                value={comprimento}
                onChange={(e) => setComprimento(e.target.value)}
                placeholder="Ex: 15"
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
              Corrente aproximada:{" "}
              <strong>{resultado.corrente.toFixed(1)} A</strong>
            </p>
            <p>
              Bitola mínima sugerida: <strong>{resultado.bitola}</strong>
            </p>
            <p style={{ marginTop: "4px" }}>
              Cabo total (ida + volta, com 10% de folga):{" "}
              <strong>
                {resultado.caboTotal.toFixed(1).replace(".", ",")} m
              </strong>
              .
            </p>
            <p style={{ marginTop: "4px", fontSize: "0.78rem", color: "#6B7280" }}>
              Importante: este cálculo é uma estimativa. Para projetos
              definitivos, consulte sempre um profissional habilitado.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
