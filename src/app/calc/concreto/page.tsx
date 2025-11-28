"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";

type ResultadoConcreto = {
  volume: number;
  volumeComPerda: number;
  sacosCimento: number;
  areiaM3: number;
  britaM3: number;
  aguaLitros: number;
  elementoLabel: string;
  fck: number;
  slump: string;
  britaTipo: string;
  perdaPercent: number;
};

const ELEMENTOS_CONCRETO = [
  {
    id: "laje",
    label: "Laje (pavimento/cobertura residencial)",
    fck: 25,
    slump: "10 ± 2 cm",
    britaTipo: "Brita 1 (9,5–19 mm)",
  },
  {
    id: "escada",
    label: "Escada de concreto",
    fck: 25,
    slump: "10–12 cm",
    britaTipo: "Brita 0 ou 1 (até 19 mm)",
  },
  {
    id: "fundacao",
    label: "Fundação (sapata/bloco)",
    fck: 20,
    slump: "8–10 cm",
    britaTipo: "Brita 1 ou 2 (até 25 mm)",
  },
  {
    id: "vigamento",
    label: "Vigas / Cintas / Baldrames",
    fck: 25,
    slump: "8–12 cm",
    britaTipo: "Brita 1 (9,5–19 mm)",
  },
  {
    id: "pilar",
    label: "Pilares",
    fck: 25,
    slump: "10 ± 2 cm",
    britaTipo: "Brita 1 (9,5–19 mm)",
  },
  {
    id: "radier",
    label: "Radier / laje maciça no solo",
    fck: 25,
    slump: "8–10 cm",
    britaTipo: "Brita 1 (9,5–19 mm)",
  },
];

export default function CalculoConcretoPage() {
  const [tipoElemento, setTipoElemento] = useState("laje");
  const [comprimento, setComprimento] = useState("");
  const [largura, setLargura] = useState("");
  const [altura, setAltura] = useState("");
  const [perda, setPerda] = useState("10"); // % de perda padrão
  const [resultado, setResultado] = useState<ResultadoConcreto | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const c = parseFloat(comprimento.replace(",", "."));
    const l = parseFloat(largura.replace(",", "."));
    const h = parseFloat(altura.replace(",", "."));
    const p = parseFloat(perda.replace(",", "."));
    const perdaPercent = isNaN(p) ? 0 : p;

    if (!c || !l || !h || c <= 0 || l <= 0 || h <= 0) {
      alert("Preencha comprimento, largura e altura com valores válidos em metros.");
      return;
    }

    const elementoInfo =
      ELEMENTOS_CONCRETO.find((el) => el.id === tipoElemento) ??
      ELEMENTOS_CONCRETO[0];

    const volume = c * l * h; // m³
    const fatorPerda = 1 + (perdaPercent > 0 ? perdaPercent / 100 : 0);
    const volumeComPerda = volume * fatorPerda;

    // Coeficientes aproximados por m³ de concreto (ajustáveis depois)
    const sacosPorM3 = 7.5; // sacos de 50 kg para concreto ~fck 20–25
    const areiaPorM3 = 0.55; // m³
    const britaPorM3 = 0.85; // m³
    const aguaPorM3 = 180; // litros

    const resultadoCalc: ResultadoConcreto = {
      volume,
      volumeComPerda,
      sacosCimento: volumeComPerda * sacosPorM3,
      areiaM3: volumeComPerda * areiaPorM3,
      britaM3: volumeComPerda * britaPorM3,
      aguaLitros: volumeComPerda * aguaPorM3,
      elementoLabel: elementoInfo.label,
      fck: elementoInfo.fck,
      slump: elementoInfo.slump,
      britaTipo: elementoInfo.britaTipo,
      perdaPercent,
    };

    setResultado(resultadoCalc);
  }

  function formatNumber(n: number, casas: number = 2) {
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
        {/* Topo com voltar */}
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

          <span
            style={{
              fontSize: "0.75rem",
              color: "#6B7280",
            }}
          >
            Cálculo de concreto
          </span>
        </div>

        {/* Header */}
        <header style={{ marginBottom: "18px" }}>
          <h1
            style={{
              fontSize: "1.35rem",
              fontWeight: 700,
              color: "#111827",
            }}
          >
            Calcular concreto
          </h1>
          <p
            style={{
              fontSize: "0.85rem",
              color: "#6B7280",
              marginTop: "4px",
            }}
          >
            Selecione o que será concretado, informe as medidas em metros e veja
            o volume e a estimativa de materiais, já com uma recomendação para a usina.
          </p>
        </header>

        {/* Formulário */}
        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            marginBottom: "18px",
          }}
        >
          {/* Tipo de elemento */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <label
              htmlFor="tipoElemento"
              style={{
                fontSize: "0.85rem",
                fontWeight: 500,
                marginBottom: "4px",
                color: "#374151",
              }}
            >
              O que será concretado?
            </label>
            <select
              id="tipoElemento"
              value={tipoElemento}
              onChange={(e) => setTipoElemento(e.target.value)}
              style={{
                padding: "10px 12px",
                borderRadius: "10px",
                border: "1px solid #D1D5DB",
                background: "#FFFFFF",
                fontSize: "0.9rem",
                outline: "none",
                boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
              }}
            >
              {ELEMENTOS_CONCRETO.map((el) => (
                <option key={el.id} value={el.id}>
                  {el.label}
                </option>
              ))}
            </select>
            <p
              style={{
                marginTop: "4px",
                fontSize: "0.72rem",
                color: "#6B7280",
              }}
            >
              Essa escolha ajuda a sugerir o Fck, slump e tipo de brita mais adequados
              para esse tipo de elemento.
            </p>
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
              Comprimento (m)
            </label>
            <input
              id="comprimento"
              value={comprimento}
              onChange={(e) => setComprimento(e.target.value)}
              placeholder="Ex: 5,00"
              style={{
                padding: "10px 12px",
                borderRadius: "10px",
                border: "1px solid #D1D5DB",
                background: "#FFFFFF",
                fontSize: "0.9rem",
                outline: "none",
                boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
              }}
              inputMode="decimal"
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <label
              htmlFor="largura"
              style={{
                fontSize: "0.85rem",
                fontWeight: 500,
                marginBottom: "4px",
                color: "#374151",
              }}
            >
              Largura (m)
            </label>
            <input
              id="largura"
              value={largura}
              onChange={(e) => setLargura(e.target.value)}
              placeholder="Ex: 0,20"
              style={{
                padding: "10px 12px",
                borderRadius: "10px",
                border: "1px solid #D1D5DB",
                background: "#FFFFFF",
                fontSize: "0.9rem",
                outline: "none",
                boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
              }}
              inputMode="decimal"
            />
          </div>

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
              Altura / Espessura (m)
            </label>
            <input
              id="altura"
              value={altura}
              onChange={(e) => setAltura(e.target.value)}
              placeholder="Ex: 0,12"
              style={{
                padding: "10px 12px",
                borderRadius: "10px",
                border: "1px solid #D1D5DB",
                background: "#FFFFFF",
                fontSize: "0.9rem",
                outline: "none",
                boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
              }}
              inputMode="decimal"
            />
          </div>

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
              Perda / Sobra (%)
            </label>
            <input
              id="perda"
              value={perda}
              onChange={(e) => setPerda(e.target.value)}
              placeholder="Ex: 10"
              style={{
                padding: "10px 12px",
                borderRadius: "10px",
                border: "1px solid #D1D5DB",
                background: "#FFFFFF",
                fontSize: "0.9rem",
                outline: "none",
                boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
              }}
              inputMode="decimal"
            />
            <p
              style={{
                marginTop: "4px",
                fontSize: "0.72rem",
                color: "#6B7280",
              }}
            >
              Normalmente se considera entre 5% e 15% de perda/sobra.
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
            Calcular concreto
          </button>
        </form>

        {/* Resultado */}
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
                <strong>Elemento:</strong> {resultado.elementoLabel}
              </span>
              <span>
                <strong>Volume geométrico:</strong>{" "}
                {formatNumber(resultado.volume, 3)} m³
              </span>
              <span>
                <strong>Volume com perda:</strong>{" "}
                {formatNumber(resultado.volumeComPerda, 3)} m³
                {resultado.perdaPercent > 0 &&
                  ` (inclui ${formatNumber(resultado.perdaPercent, 1)}% de perda)`}
              </span>
            </div>

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
                marginBottom: "6px",
              }}
            >
              Estimativa de materiais para preparo do concreto:
            </p>

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
                <strong>Cimento:</strong>{" "}
                {formatNumber(resultado.sacosCimento, 1)} sacos de 50 kg
              </li>
              <li>
                <strong>Areia:</strong>{" "}
                {formatNumber(resultado.areiaM3, 3)} m³
              </li>
              <li>
                <strong>Brita:</strong>{" "}
                {formatNumber(resultado.britaM3, 3)} m³
              </li>
              <li>
                <strong>Água aproximada:</strong>{" "}
                {formatNumber(resultado.aguaLitros, 0)} litros
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
              Recomendação para usina de concreto
            </p>

            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: "3px",
                fontSize: "0.82rem",
                color: "#374151",
              }}
            >
              <li>
                <strong>Fck:</strong> {resultado.fck} MPa (recomendado)
              </li>
              <li>
                <strong>Slump:</strong> {resultado.slump}
              </li>
              <li>
                <strong>Tipo de brita:</strong> {resultado.britaTipo}
              </li>
            </ul>

            <p
              style={{
                marginTop: "8px",
                fontSize: "0.75rem",
                color: "#6B7280",
              }}
            >
              <strong>Resumo para enviar à usina:</strong>{" "}
              {`Concreto para ${resultado.elementoLabel}, Fck ${resultado.fck} MPa, slump ${resultado.slump}, ${resultado.britaTipo}, volume de aproximadamente ${formatNumber(resultado.volumeComPerda, 3)} m³ (já considerando perda).`}
            </p>

            <p
              style={{
                marginTop: "6px",
                fontSize: "0.72rem",
                color: "#6B7280",
              }}
            >
              Os valores são estimativas. O engenheiro ou técnico responsável
              pode ajustar o traço, Fck e parâmetros conforme o projeto estrutural
              e normas técnicas.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
