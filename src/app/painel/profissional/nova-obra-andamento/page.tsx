"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function NovaObraAndamentoPage() {
  const params = useSearchParams();
  const router = useRouter();

  const profissionalId = params.get("id");
  const apelido = params.get("apelido") || "profissional";

  const [titulo, setTitulo] = useState("");
  const [diasTotais, setDiasTotais] = useState<number | "">("");
  const [diasRestantes, setDiasRestantes] = useState<number | "">("");
  const [status, setStatus] = useState<"andamento" | "concluida">("andamento");

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    setSucesso(null);

    if (!profissionalId) {
      setErro("Profissional não identificado. Volte para o painel.");
      return;
    }

    if (!titulo.trim()) {
      setErro("Preencha o nome da obra.");
      return;
    }

    if (diasTotais === "" || diasRestantes === "") {
      setErro("Preencha os dias totais e os dias restantes.");
      return;
    }

    setLoading(true);

    try {
      const { error: insertError } = await supabase
        .from("obras_profissionais")
        .insert([
          {
            profissional_id: profissionalId,
            titulo,
            dias_totais: diasTotais,
            dias_restantes: diasRestantes,
            status,
          },
        ]);

      if (insertError) {
        console.error(insertError);
        throw new Error("Erro ao salvar a obra em andamento.");
      }

      setSucesso("Obra em andamento cadastrada com sucesso!");
      setTitulo("");
      setDiasTotais("");
      setDiasRestantes("");
      setStatus("andamento");

      setTimeout(() => {
        router.push(
          `/painel/profissional?apelido=${encodeURIComponent(
            apelido
          )}&id=${profissionalId}`
        );
      }, 1000);
    } catch (err: any) {
      setErro(err.message || "Erro ao cadastrar a obra em andamento.");
    } finally {
      setLoading(false);
    }
  }

  if (!profissionalId) {
    return (
      <main
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          paddingTop: "40px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "440px",
            background: "#FFFFFF",
            borderRadius: "28px",
            padding: "26px 22px",
            boxShadow: "0 4px 14px rgba(15,23,42,0.08)",
          }}
        >
          <p style={{ marginBottom: "12px" }}>
            Não foi possível identificar o profissional.
          </p>
          <Link
            href="/painel/profissional"
            style={{ color: "#2563EB", textDecoration: "underline" }}
          >
            Voltar para o painel
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        paddingTop: "24px",
        paddingBottom: "40px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "440px",
          background: "#FFFFFF",
          borderRadius: "28px",
          padding: "26px 22px",
          boxShadow: "0 4px 14px rgba(15,23,42,0.08)",
        }}
      >
        <header style={{ marginBottom: "18px" }}>
          <p
            style={{
              fontSize: "0.8rem",
              color: "#64748B",
              marginBottom: "4px",
            }}
          >
            {apelido ? `Profissional: ${apelido}` : ""}
          </p>
          <h1
            style={{
              fontSize: "1.4rem",
              fontWeight: 700,
              color: "#0F172A",
              marginBottom: "4px",
            }}
          >
            Cadastrar obra em andamento
          </h1>
          <p style={{ color: "#6B7280", fontSize: "0.85rem" }}>
            Registre as obras que você está executando agora para controlar sua
            disponibilidade e acompanhar o progresso.
          </p>
        </header>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "14px" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "#0F172A",
                marginBottom: "4px",
              }}
            >
              Nome da obra
            </label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Troca de vidros da fachada"
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "12px",
                border: "1px solid #CBD5E1",
                fontSize: "0.9rem",
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              gap: "10px",
              marginBottom: "14px",
            }}
          >
            <div style={{ flex: 1 }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  color: "#0F172A",
                  marginBottom: "4px",
                }}
              >
                Dias totais
              </label>
              <input
                type="number"
                min={1}
                value={diasTotais}
                onChange={(e) =>
                  setDiasTotais(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                placeholder="Ex: 20"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "12px",
                  border: "1px solid #CBD5E1",
                  fontSize: "0.9rem",
                }}
              />
            </div>

            <div style={{ flex: 1 }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  color: "#0F172A",
                  marginBottom: "4px",
                }}
              >
                Dias restantes
              </label>
              <input
                type="number"
                min={0}
                value={diasRestantes}
                onChange={(e) =>
                  setDiasRestantes(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                placeholder="Ex: 12"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "12px",
                  border: "1px solid #CBD5E1",
                  fontSize: "0.9rem",
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: "14px" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "#0F172A",
                marginBottom: "4px",
              }}
            >
              Status
            </label>
            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as "andamento" | "concluida")
              }
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "12px",
                border: "1px solid #CBD5E1",
                fontSize: "0.9rem",
                backgroundColor: "white",
              }}
            >
              <option value="andamento">Em andamento</option>
              <option value="concluida">Concluída</option>
            </select>
          </div>

          {erro && (
            <p
              style={{
                fontSize: "0.8rem",
                color: "#B91C1C",
                marginBottom: "8px",
              }}
            >
              {erro}
            </p>
          )}

          {sucesso && (
            <p
              style={{
                fontSize: "0.8rem",
                color: "#15803D",
                marginBottom: "8px",
              }}
            >
              {sucesso}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "999px",
              border: "none",
              background: loading ? "#38BDF8" : "#0EA5E9",
              color: "white",
              fontWeight: 600,
              fontSize: "0.95rem",
              cursor: loading ? "default" : "pointer",
              marginBottom: "10px",
            }}
          >
            {loading ? "Salvando..." : "Salvar obra em andamento"}
          </button>
        </form>

        <Link
          href={`/painel/profissional?apelido=${encodeURIComponent(
            apelido
          )}&id=${profissionalId}`}
          style={{
            display: "inline-block",
            marginTop: "4px",
            fontSize: "0.8rem",
            color: "#2563EB",
          }}
        >
          ← Voltar para o painel
        </Link>
      </div>
    </main>
  );
}
