"use client";

import { useState } from "react";
import Link from "next/link";

type ResultadoVidro = {
  areaPeca: number;
  areaTotal: number;
  areaComSobra: number;
  custo?: number;
  tipoVidro: string;
  espessuraRecomendada: string;
  contraMarcoML: number;
  basePisoML: number;
  qtdRoldanas: number;
  observacao: string;
};

export default function CalcVidrosPage() {
  const [tipoServico, setTipoServico] = useState("parapeito");
  const [areaLocal, setAreaLocal] = useState("interna");
  const [nivelInstalacao, setNivelInstalacao] = useState("terreo");

  const [largura, setLargura] = useState("");
  const [altura, setAltura] = useState("");
  const [quantidade, setQuantidade] = useState("1");
  const [precoM2, setPrecoM2] = useState("");

  const [resultado, setResultado] = useState<ResultadoVidro | null>(null);

  function calcular() {
    const L = parseFloat(largura.replace(",", "."));
    const A = parseFloat(altura.replace(",", "."));
    const Q = parseFloat(quantidade.replace(",", "."));
    const P = parseFloat(precoM2.replace(",", "."));

    if (!L || !A || !Q) {
      setResultado(null);
      return;
    }

    const areaPeca = L * A;
    const areaTotal = areaPeca * Q;
    const areaComSobra = areaTotal * 1.1; // 10% de sobra padrão
    const custo = P ? areaComSobra * P : undefined;

    // ===== Regras simples para tipo de vidro / espessura =====
    let tipoVidro = "Vidro temperado";
    let espessuraRecomendada = "8 mm";

    const externo = areaLocal === "externa";
    const alto = nivelInstalacao === "alto";

    switch (tipoServico) {
      case "parapeito":
        tipoVidro = "Vidro laminado / laminado temperado (segurança)";
        if (alto || externo) {
          espessuraRecomendada = "10 mm ou 4+4 / 5+5 mm laminado (consultar norma NBR 7199)";
        } else {
          espessuraRecomendada = "8 mm ou 4+4 mm laminado";
        }
        break;
      case "porta":
        tipoVidro = "Vidro temperado para portas de correr";
        espessuraRecomendada = alto || externo ? "10 mm" : "8 mm";
        break;
      case "box":
        tipoVidro = "Vidro temperado para box de banheiro";
        espessuraRecomendada = "8 mm (padrão para box)";
        break;
      case "beiral":
        tipoVidro = "Vidro laminado ou laminado temperado para cobertura";
        espessuraRecomendada =
          "10 mm ou 8+8 mm laminado (avaliar vão, carga de vento e norma)";
        break;
      case "janela":
        tipoVidro = externo ? "Vidro temperado ou laminado" : "Vidro comum / temperado";
        espessuraRecomendada = externo ? "6 a 8 mm" : "4 a 6 mm";
        break;
      default:
        tipoVidro = "Definir conforme projeto (temperado / laminado)";
        espessuraRecomendada = "Consultar fornecedor com base na carga e vão";
        break;
    }

    // ===== Contramarco (perímetro do vão) =====
    const perimetro = 2 * (L + A); // m
    const contraMarcoML = perimetro * Q * 1.1; // 10% de sobra

    // ===== Base fixa no piso / trilho =====
    let basePisoML = 0;
    if (tipoServico === "parapeito" || tipoServico === "porta" || tipoServico === "box") {
      // considera 1 trilho base por vão
      basePisoML = L * Q * 1.05; // 5% de folga
    }

    // ===== Roldanas =====
    let qtdRoldanas = 0;
    if (tipoServico === "porta" || tipoServico === "box") {
      // Regra simples: 2 folhas por vão, 2 roldanas por folha
      const folhasPorVao = 2;
      qtdRoldanas = Q * folhasPorVao * 2;
    }

    // ===== Observação técnica =====
    let observacao =
      "Os dados acima são estimativas para auxiliar o orçamento. Sempre confirme espessura e tipo de vidro com as normas (NBR 7199, NBR 14207, etc.) e com o engenheiro / fornecedor.";

    if (tipoServico === "parapeito") {
      observacao =
        "Para guarda-corpo/parapeito, a prioridade é segurança: use vidro laminado ou laminado temperado com fixação adequada (bottons, perfil U, mão francesa). Sempre siga o projeto estrutural e as normas (NBR 7199 / guarda-corpos).";
    } else if (tipoServico === "box") {
      observacao =
        "Para box de banheiro, utilize ferragens compatíveis (roldanas, perfis, puxadores) e verifique folgas do piso e do teto. Considere sempre espaço para ventilação e inclinação do piso.";
    } else if (tipoServico === "beiral") {
      observacao =
        "Coberturas em vidro exigem atenção à estrutura metálica, carga de vento e água. Verifique sempre o dimensionamento estrutural e fixações (aranhas, suportes, calhas).";
    }

    setResultado({
      areaPeca,
      areaTotal,
      areaComSobra,
      custo,
      tipoVidro,
      espessuraRecomendada,
      contraMarcoML,
      basePisoML,
      qtdRoldanas,
      observacao,
    });
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

        {/* Título */}
        <h1
          style={{
            fontSize: "1.4rem",
            fontWeight: 700,
            color: "#111827",
            marginBottom: "4px",
          }}
        >
          Calcular Vidros
        </h1>
        <p
          style={{
            fontSize: "0.85rem",
            color: "#6B7280",
            marginBottom: "18px",
          }}
        >
          Preencha os dados do vão e do tipo de serviço para receber um resumo
          com área, ferragens básicas e sugestão de tipo de vidro.
        </p>

        {/* FORM */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            calcular();
          }}
          style={{ display: "flex", flexDirection: "column", gap: "12px" }}
        >
          {/* Tipo de serviço */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <label
              style={{
                fontSize: "0.85rem",
                fontWeight: 500,
                marginBottom: "4px",
              }}
            >
              Tipo de serviço
            </label>
            <select
              value={tipoServico}
              onChange={(e) => setTipoServico(e.target.value)}
              style={{
                padding: "10px 12px",
                borderRadius: "10px",
                border: "1px solid #D1D5DB",
                fontSize: "0.9rem",
                background: "#FFFFFF",
              }}
            >
              <option value="parapeito">Parapeito / Guarda-corpo</option>
              <option value="porta">Porta de correr</option>
              <option value="box">Box de banheiro</option>
              <option value="beiral">Beiral / Cobertura</option>
              <option value="janela">Janela / Fixos</option>
              <option value="outros">Outros</option>
            </select>
          </div>

          {/* Local e nível */}
          <div style={{ display: "flex", gap: "10px" }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <label
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 500,
                  marginBottom: "4px",
                }}
              >
                Área
              </label>
              <select
                value={areaLocal}
                onChange={(e) => setAreaLocal(e.target.value)}
                style={{
                  padding: "10px 12px",
                  borderRadius: "10px",
                  border: "1px solid #D1D5DB",
                  fontSize: "0.9rem",
                  background: "#FFFFFF",
                }}
              >
                <option value="interna">Interna</option>
                <option value="externa">Externa</option>
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
                Nível
              </label>
              <select
                value={nivelInstalacao}
                onChange={(e) => setNivelInstalacao(e.target.value)}
                style={{
                  padding: "10px 12px",
                  borderRadius: "10px",
                  border: "1px solid #D1D5DB",
                  fontSize: "0.9rem",
                  background: "#FFFFFF",
                }}
              >
                <option value="terreo">Térreo</option>
                <option value="alto">Andar alto</option>
              </select>
            </div>
          </div>

          {/* Medidas do vão */}
          <div style={{ display: "flex", gap: "10px" }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <label
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 500,
                  marginBottom: "4px",
                }}
              >
                Largura do vão (m)
              </label>
              <input
                value={largura}
                onChange={(e) => setLargura(e.target.value)}
                placeholder="Ex: 1,50"
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
                Altura do vão (m)
              </label>
              <input
                value={altura}
                onChange={(e) => setAltura(e.target.value)}
                placeholder="Ex: 1,20"
                style={{
                  padding: "10px 12px",
                  borderRadius: "10px",
                  border: "1px solid #D1D5DB",
                  fontSize: "0.9rem",
                }}
              />
            </div>
          </div>

          {/* Quantidade + preço m² */}
          <div style={{ display: "flex", gap: "10px" }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <label
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 500,
                  marginBottom: "4px",
                }}
              >
                Quantidade de vãos/peças
              </label>
              <input
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
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
                Preço do m² (opcional, R$)
              </label>
              <input
                value={precoM2}
                onChange={(e) => setPrecoM2(e.target.value)}
                placeholder="Ex: 250"
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

        {/* RESULTADO */}
        {resultado && (
          <div
            style={{
              marginTop: "18px",
              padding: "14px 12px",
              borderRadius: "16px",
              background: "#F1F5F9",
              fontSize: "0.85rem",
              color: "#0F172A",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            <p>
              Área de cada peça:{" "}
              <strong>
                {resultado.areaPeca.toFixed(2).replace(".", ",")} m²
              </strong>
            </p>
            <p>
              Área total:{" "}
              <strong>
                {resultado.areaTotal.toFixed(2).replace(".", ",")} m²
              </strong>
            </p>
            <p>
              Área com 10% de sobra:{" "}
              <strong>
                {resultado.areaComSobra.toFixed(2).replace(".", ",")} m²
              </strong>
            </p>

            <hr
              style={{
                border: "none",
                borderTop: "1px dashed #CBD5E1",
                margin: "8px 0",
              }}
            />

            <p>
              Tipo de vidro recomendado:{" "}
              <strong>{resultado.tipoVidro}</strong>
            </p>
            <p>
              Espessura sugerida:{" "}
              <strong>{resultado.espessuraRecomendada}</strong>
            </p>

            <p>
              Contramarco (perímetro total, com sobra):{" "}
              <strong>
                {resultado.contraMarcoML.toFixed(1).replace(".", ",")} m
              </strong>
            </p>

            {resultado.basePisoML > 0 && (
              <p>
                Trilho/base no piso (total):{" "}
                <strong>
                  {resultado.basePisoML.toFixed(1).replace(".", ",")} m
                </strong>
              </p>
            )}

            {resultado.qtdRoldanas > 0 && (
              <p>
                Quantidade mínima de roldanas:{" "}
                <strong>{resultado.qtdRoldanas} un</strong>
              </p>
            )}

            {resultado.custo !== undefined && (
              <p style={{ marginTop: "4px" }}>
                Custo aproximado do vidro:{" "}
                <strong>
                  R$ {resultado.custo.toFixed(2).replace(".", ",")}
                </strong>
              </p>
            )}

            <p
              style={{
                marginTop: "6px",
                fontSize: "0.78rem",
                color: "#6B7280",
              }}
            >
              {resultado.observacao}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
