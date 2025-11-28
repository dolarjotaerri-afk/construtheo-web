"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";

type ResultadoArgamassa = {
  area: number;
  espessuraCm: number;
  volume: number;
  volumeComPerda: number;
  sacosCimento: number;
  areiaM3: number;
  aguaLitros: number;
  perdaPercent: number;
  tipoAplicacaoLabel: string;
  traco: string;
};

const TIPOS_APLICACAO = [
  {
    id: "assentamento_blocos",
    label: "Assentamento de blocos / tijolos",
    traco: "1:6 (cimento : areia)",
    cimentoSacosPorM3: 5.5,
    areiaM3PorM3: 1.25,
    aguaLPorM3: 190,
    sugestaoEspessura: "1,0 a 1,5 cm",
  },
  {
    id: "reboco",
    label: "Reboco / emboço de paredes",
    traco: "1:3 (cimento : areia)",
    cimentoSacosPorM3: 8.5,
    areiaM3PorM3: 1.10,
    aguaLPorM3: 200,
    sugestaoEspessura: "1,5 a 2,5 cm",
  },
  {
    id: "contrapiso",
    label: "Contrapiso / regularização de piso",
    traco: "1:4 (cimento : areia)",
    cimentoSacosPorM3: 7.0,
    areiaM3PorM3: 1.00,
    aguaLPorM3: 190,
    sugestaoEspessura: "3 a 5 cm",
  },
  {
    id: "outro",
    label: "Outro uso de argamassa",
    traco: "1:4 (cimento : areia) (padrão)",
    cimentoSacosPorM3: 7.0,
    areiaM3PorM3: 1.00,
    aguaLPorM3: 190,
    sugestaoEspessura: "defina conforme o uso",
  },
];

export default function CalculoArgamassaPage() {
  const [tipoAplicacao, setTipoAplicacao] = useState("assentamento_blocos");
  const [area, setArea] = useState("");
  const [espessura, setEspessura] = useState(""); // em cm
  const [perda, setPerda] = useState("10");
  const [resultado, setResultado] = useState<ResultadoArgamassa | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const a = parseFloat(area.replace(",", "."));
    const eCm = parseFloat(espessura.replace(",", "."));
    const p = parseFloat(perda.replace(",", "."));
    const perdaPercent = isNaN(p) ? 0 : p;

    if (!a || !eCm || a <= 0 || eCm <= 0) {
      alert("Preencha área e espessura com valores válidos.");
      return;
    }

    const aplicacao =
      TIPOS_APLICACAO.find((t) => t.id === tipoAplicacao) ??
      TIPOS_APLICACAO[0];

    // volume em m³ = área (m²) * espessura (m) => espessura cm / 100
    const volume = a * (eCm / 100);
    const volumeComPerda =
      volume * (1 + (perdaPercent > 0 ? perdaPercent / 100 : 0));

    const sacosCimento = volumeComPerda * aplicacao.cimentoSacosPorM3;
    const areiaM3 = volumeComPerda * aplicacao.areiaM3PorM3;
    const aguaLitros = volumeComPerda * aplicacao.aguaLPorM3;

    setResultado({
      area: a,
      espessuraCm: eCm,
      volume,
      volumeComPerda,
      sacosCimento,
      areiaM3,
      aguaLitros,
      perdaPercent,
      tipoAplicacaoLabel: aplicacao.label,
      traco: aplicacao.traco,
    });
  }

  function format(n: number, casas = 2) {
    return n.toFixed(casas).replace(".", ",");
  }

  const aplicacaoSelecionada =
    TIPOS_APLICACAO.find((t) => t.id === tipoAplicacao) ??
    TIPOS_APLICACAO[0];

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
            Cálculo de cimento / argamassa
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
            Calcular cimento e argamassa
          </h1>
          <p
            style={{
              fontSize: "0.85rem",
              color: "#6B7280",
              marginTop: "4px",
            }}
          >
            Escolha o tipo de serviço, informe a área em m² e a espessura da
            camada. Te mostramos a quantidade estimada de cimento, areia e água.
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
          {/* Tipo de aplicação */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <label
              htmlFor="tipoAplicacao"
              style={{
                fontSize: "0.85rem",
                fontWeight: 500,
                marginBottom: "4px",
                color: "#374151",
              }}
            >
              Tipo de serviço
            </label>
            <select
              id="tipoAplicacao"
              value={tipoAplicacao}
              onChange={(e) => setTipoAplicacao(e.target.value)}
              style={{
                padding: "10px 12px",
                borderRadius: "10px",
                border: "1px solid #D1D5DB",
                background: "#FFFFFF",
                fontSize: "0.9rem",
              }}
            >
              {TIPOS_APLICACAO.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
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
              Traço sugerido: <strong>{aplicacaoSelecionada.traco}</strong>.{" "}
              Espessura típica:{" "}
              <strong>{aplicacaoSelecionada.sugestaoEspessura}</strong>.
            </p>
          </div>

          {/* Área */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <label
              htmlFor="area"
              style={{
                fontSize: "0.85rem",
                fontWeight: 500,
                marginBottom: "4px",
                color: "#374151",
              }}
            >
              Área (m²)
            </label>
            <input
              id="area"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="Ex: 25,00"
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
              Some as áreas das paredes ou do piso que serão executados.
            </p>
          </div>

          {/* Espessura */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <label
              htmlFor="espessura"
              style={{
                fontSize: "0.85rem",
                fontWeight: 500,
                marginBottom: "4px",
                color: "#374151",
              }}
            >
              Espessura da camada (cm)
            </label>
            <input
              id="espessura"
              value={espessura}
              onChange={(e) => setEspessura(e.target.value)}
              placeholder="Ex: 2,0"
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

          {/* Perda */}
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
              Perda / sobra (%)
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
              Profissionais experientes costumam trabalhar com 5–10% de perda.
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
            Calcular cimento e argamassa
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
                <strong>Serviço:</strong> {resultado.tipoAplicacaoLabel}
              </span>
              <span>
                <strong>Traço:</strong> {resultado.traco}
              </span>
              <span>
                <strong>Área:</strong> {format(resultado.area, 2)} m²
              </span>
              <span>
                <strong>Espessura média:</strong>{" "}
                {format(resultado.espessuraCm, 1)} cm
              </span>
              <span>
                <strong>Volume de argamassa:</strong>{" "}
                {format(resultado.volume, 3)} m³
              </span>
              <span>
                <strong>Volume com perda:</strong>{" "}
                {format(resultado.volumeComPerda, 3)} m³
                {resultado.perdaPercent > 0 &&
                  ` (inclui ${resultado.perdaPercent}% de perda)`}
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
                <strong>Cimento:</strong>{" "}
                {format(resultado.sacosCimento, 1)} sacos de 50 kg
              </li>
              <li>
                <strong>Areia média:</strong>{" "}
                {format(resultado.areiaM3, 3)} m³
              </li>
              <li>
                <strong>Água aproximada:</strong>{" "}
                {format(resultado.aguaLitros, 0)} litros
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
              {`Serviço de ${resultado.tipoAplicacaoLabel.toLowerCase()}, traço ${resultado.traco}. Área de ${format(resultado.area, 2)} m², espessura média de ${format(resultado.espessuraCm, 1)} cm. Volume de argamassa (com perda): ${format(resultado.volumeComPerda, 3)} m³. Necessário aproximadamente ${format(resultado.sacosCimento, 1)} sacos de cimento de 50 kg, ${format(resultado.areiaM3, 3)} m³ de areia média.`}
            </p>

            <p
              style={{
                marginTop: "6px",
                fontSize: "0.72rem",
                color: "#6B7280",
              }}
            >
              Os valores são estimativas. O pedreiro ou engenheiro pode ajustar
              traço, espessura e perdas conforme o tipo de obra e experiência.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
