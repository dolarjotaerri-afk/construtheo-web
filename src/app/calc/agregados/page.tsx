"use client";

import { useState } from "react";
import Link from "next/link";

export default function CalcAgregadosPage() {
  const [comprimento, setComprimento] = useState("");
  const [largura, setLargura] = useState("");
  const [espessura, setEspessura] = useState("5"); // cm
  const [volume, setVolume] = useState<number | null>(null);
  const [areia, setAreia] = useState<number | null>(null);
  const [brita, setBrita] = useState<number | null>(null);

  function calcular() {
    const c = parseFloat(comprimento.replace(",", "."));
    const l = parseFloat(largura.replace(",", "."));
    const e = parseFloat(espessura.replace(",", "."));

    if (!c || !l || !e) {
      setVolume(null);
      setAreia(null);
      setBrita(null);
      return;
    }

    const alturaM = e / 100; // cm → m
    const vol = c * l * alturaM; // m³

    // Proporção típica para concreto simples: ~55% areia, 45% brita
    const areiaM3 = vol * 0.55;
    const britaM3 = vol * 0.45;

    setVolume(vol);
    setAreia(areiaM3);
    setBrita(britaM3);
  }

  const caminhão6m3 = volume ? volume / 6 : null;

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
        {/* Voltar */}
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
          Calcular Areia e Brita
        </h1>
        <p
          style={{
            fontSize: "0.85rem",
            color: "#6B7280",
            marginBottom: "18px",
          }}
        >
          Informe a área e a espessura da camada para estimar o volume de areia
          e brita em m³.
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
              Comprimento (m)
            </label>
            <input
              value={comprimento}
              onChange={(e) => setComprimento(e.target.value)}
              placeholder="Ex: 5"
              style={{
                padding: "10px 12px",
                borderRadius: "10px",
                border: "1px solid #D1D5DB",
                fontSize: "0.9rem",
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <label
              style={{
                fontSize: "0.85rem",
                fontWeight: 500,
                marginBottom: "4px",
              }}
            >
              Largura (m)
            </label>
            <input
              value={largura}
              onChange={(e) => setLargura(e.target.value)}
              placeholder="Ex: 4"
              style={{
                padding: "10px 12px",
                borderRadius: "10px",
                border: "1px solid #D1D5DB",
                fontSize: "0.9rem",
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <label
              style={{
                fontSize: "0.85rem",
                fontWeight: 500,
                marginBottom: "4px",
              }}
            >
              Espessura da camada (cm)
            </label>
            <input
              value={espessura}
              onChange={(e) => setEspessura(e.target.value)}
              placeholder="Ex: 5"
              style={{
                padding: "10px 12px",
                borderRadius: "10px",
                border: "1px solid #D1D5DB",
                fontSize: "0.9rem",
              }}
            />
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

        {volume !== null && (
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
              Volume total:{" "}
              <strong>{volume.toFixed(2).replace(".", ",")} m³</strong>
            </p>
            <p>
              Areia (≈55%):{" "}
              <strong>{areia!.toFixed(2).replace(".", ",")} m³</strong>
            </p>
            <p>
              Brita (≈45%):{" "}
              <strong>{brita!.toFixed(2).replace(".", ",")} m³</strong>
            </p>
            {caminhão6m3 && (
              <p style={{ marginTop: "4px", fontSize: "0.8rem" }}>
                Isso corresponde a aproximadamente{" "}
                <strong>{caminhão6m3.toFixed(2).replace(".", ",")} caminhões</strong>{" "}
                de 6 m³.
              </p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
