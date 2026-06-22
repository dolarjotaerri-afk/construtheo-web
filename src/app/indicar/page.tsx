"use client";

import Link from "next/link";
import { useState } from "react";

const WHATSAPP_NUMBER = "5511988214713"; // troque pelo WhatsApp Business do ConstruThéo

export default function IndicarPage() {
  const [form, setForm] = useState({
    seuNome: "",
    seuWhatsapp: "",
    tipoIndicado: "Prestador de serviço",
    nomeIndicado: "",
    areaAtuacao: "",
    cidade: "",
    whatsappIndicado: "",
    motivo: "",
  });

  const [erro, setErro] = useState("");

  function updateField(field: string, value: string) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");

    if (!form.seuNome.trim()) {
      setErro("Informe seu nome ou apelido.");
      return;
    }

    if (!form.seuWhatsapp.trim()) {
      setErro("Informe seu WhatsApp.");
      return;
    }

    if (!form.nomeIndicado.trim()) {
      setErro("Informe o nome da indicação.");
      return;
    }

    if (!form.areaAtuacao.trim()) {
      setErro("Informe a área de atuação.");
      return;
    }

    if (!form.cidade.trim()) {
      setErro("Informe a cidade ou região.");
      return;
    }

    const mensagem = `
Olá, quero indicar um prestador ou empresa para o ConstruThéo.

Meu nome: ${form.seuNome}
Meu WhatsApp: ${form.seuWhatsapp}

Tipo de indicação: ${form.tipoIndicado}
Nome indicado: ${form.nomeIndicado}
Área de atuação: ${form.areaAtuacao}
Cidade/região: ${form.cidade}
WhatsApp do indicado: ${form.whatsappIndicado || "Não informado"}

Motivo da indicação:
${form.motivo || "Não informado"}

Enviado pelo app ConstruThéo.
    `.trim();

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      mensagem
    )}`;

    window.open(url, "_blank");
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #cfe8ff, #3b82b8)",
        padding: 20,
        paddingTop: 24,
        paddingBottom: 24,
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: 430,
          background: "#ffffff",
          borderRadius: 24,
          padding: 24,
          boxShadow: "0 22px 45px rgba(15, 23, 42, 0.22)",
        }}
      >
        <Link
          href="/"
          style={{
            display: "inline-block",
            marginBottom: 16,
            fontSize: 13,
            color: "#0284c7",
            textDecoration: "none",
            fontWeight: 700,
          }}
        >
          ← Voltar
        </Link>

        <p
          style={{
            fontSize: 12,
            textTransform: "uppercase",
            letterSpacing: 1,
            color: "#0284c7",
            fontWeight: 800,
            marginBottom: 8,
          }}
        >
          ConstruThéo
        </p>

        <h1
          style={{
            fontSize: 30,
            lineHeight: 1.1,
            color: "#0f172a",
            marginBottom: 8,
          }}
        >
                </h1>

        <p
          style={{
            fontSize: 14,
            color: "#64748b",
            lineHeight: 1.5,
            marginBottom: 20,
          }}
        >
          Escolha se deseja indicar um prestador de serviço ou uma empresa da
          construção civil.
        </p>

        <form onSubmit={handleSubmit}>
          <label style={labelStyle}>Tipo de indicação</label>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
              marginBottom: 14,
            }}
          >
            <button
              type="button"
              onClick={() =>
                updateField("tipoIndicado", "Prestador de serviço")
              }
              style={{
                ...choiceButtonStyle,
                background:
                  form.tipoIndicado === "Prestador de serviço"
                    ? "#0284c7"
                    : "#f8fafc",
                color:
                  form.tipoIndicado === "Prestador de serviço"
                    ? "#ffffff"
                    : "#334155",
                borderColor:
                  form.tipoIndicado === "Prestador de serviço"
                    ? "#0284c7"
                    : "#cbd5e1",
              }}
            >
              Prestador
            </button>

            <button
              type="button"
              onClick={() => updateField("tipoIndicado", "Empresa")}
              style={{
                ...choiceButtonStyle,
                background:
                  form.tipoIndicado === "Empresa" ? "#0284c7" : "#f8fafc",
                color: form.tipoIndicado === "Empresa" ? "#ffffff" : "#334155",
                borderColor:
                  form.tipoIndicado === "Empresa" ? "#0284c7" : "#cbd5e1",
              }}
            >
              Empresa
            </button>
          </div>

          <label style={labelStyle}>Seu nome ou apelido</label>
          <input
            style={inputStyle}
            value={form.seuNome}
            onChange={(e) => updateField("seuNome", e.target.value)}
            placeholder="Ex: Carlos"
          />

          <label style={labelStyle}>Seu WhatsApp</label>
          <input
            style={inputStyle}
            value={form.seuWhatsapp}
            onChange={(e) => updateField("seuWhatsapp", e.target.value)}
            placeholder="Ex: (11) 99999-9999"
          />

          <label style={labelStyle}>
            {form.tipoIndicado === "Empresa"
              ? "Nome da empresa"
              : "Nome do prestador"}
          </label>
          <input
            style={inputStyle}
            value={form.nomeIndicado}
            onChange={(e) => updateField("nomeIndicado", e.target.value)}
            placeholder={
              form.tipoIndicado === "Empresa"
                ? "Ex: Depósito Formigão"
                : "Ex: João Pedreiro"
            }
          />

          <label style={labelStyle}>Área de atuação</label>
          <input
            style={inputStyle}
            value={form.areaAtuacao}
            onChange={(e) => updateField("areaAtuacao", e.target.value)}
            placeholder="Ex: Pedreiro, elétrica, vidros, materiais..."
          />

          <label style={labelStyle}>Cidade ou região</label>
          <input
            style={inputStyle}
            value={form.cidade}
            onChange={(e) => updateField("cidade", e.target.value)}
            placeholder="Ex: Igaratá e região"
          />

          <label style={labelStyle}>
            {form.tipoIndicado === "Empresa"
              ? "WhatsApp da empresa, se souber"
              : "WhatsApp do prestador, se souber"}
          </label>
          <input
            style={inputStyle}
            value={form.whatsappIndicado}
            onChange={(e) => updateField("whatsappIndicado", e.target.value)}
            placeholder="Opcional"
          />

          <label style={labelStyle}>Por que você indica?</label>
          <textarea
            style={{
              ...inputStyle,
              minHeight: 90,
              resize: "vertical",
            }}
            value={form.motivo}
            onChange={(e) => updateField("motivo", e.target.value)}
            placeholder="Ex: trabalha bem, é caprichoso, tem bom atendimento..."
          />

          {erro && (
            <p
              style={{
                background: "#fee2e2",
                color: "#b91c1c",
                fontSize: 13,
                marginBottom: 12,
                fontWeight: 700,
                padding: "10px 12px",
                borderRadius: 12,
              }}
            >
              {erro}
            </p>
          )}

          <button
            type="submit"
            style={{
              width: "100%",
              border: 0,
              borderRadius: 16,
              padding: "14px 16px",
              background: "#0284c7",
              color: "#ffffff",
              fontSize: 15,
              fontWeight: 800,
              cursor: "pointer",
              boxShadow: "0 12px 24px rgba(2, 132, 199, 0.28)",
            }}
          >
            Enviar indicação
          </button>
        </form>

        <p
          style={{
            marginTop: 16,
            fontSize: 12,
            color: "#94a3b8",
            lineHeight: 1.4,
            textAlign: "center",
          }}
        >
          A equipe ConstruThéo poderá entrar em contato para validar a indicação
          antes de publicar na plataforma.
        </p>
      </section>
    </main>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 700,
  color: "#334155",
  marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  border: "1px solid #cbd5e1",
  borderRadius: 14,
  padding: "12px 14px",
  fontSize: 14,
  color: "#0f172a",
  outline: "none",
  marginBottom: 14,
  boxSizing: "border-box",
};

const choiceButtonStyle: React.CSSProperties = {
  width: "100%",
  border: "1px solid #cbd5e1",
  borderRadius: 14,
  padding: "12px 10px",
  fontSize: 14,
  fontWeight: 800,
  cursor: "pointer",
};