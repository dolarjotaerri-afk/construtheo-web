"use client";

import { useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import Link from "next/link";

export default function NovaObraPage() {
  const router = useRouter();
  const params = useSearchParams();

  const profissionalId = params.get("id");
  const apelido = params.get("apelido") || "profissional";

  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [clienteNome, setClienteNome] = useState("");
  const [diasRestantes, setDiasRestantes] = useState<number | "">("");
  const [previsaoFim, setPrevisaoFim] = useState("");
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [salvarComoObraAndamento, setSalvarComoObraAndamento] =
    useState(true);

  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  if (!profissionalId) {
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
          <p
            style={{
              fontSize: "0.9rem",
              color: "#B91C1C",
              marginBottom: "12px",
            }}
          >
            Erro: ID do profissional não informado na URL.
          </p>
          <Link
            href="/painel/profissional"
            style={{
              textDecoration: "none",
              color: "#2563EB",
              fontSize: "0.9rem",
            }}
          >
            Voltar ao painel
          </Link>
        </div>
      </main>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    setSucesso(null);

    if (!arquivo) {
      setErro("Selecione uma foto da obra.");
      return;
    }

    if (!titulo.trim()) {
      setErro("Digite um título para a obra.");
      return;
    }

    setCarregando(true);

    try {
      // ---------- 1. Upload da imagem no Storage ----------
      const extensao = arquivo.name.split(".").pop() || "jpg";
      const filePath = `${profissionalId}/${Date.now()}.${extensao}`;

      const { error: uploadError } = await supabase.storage
        .from("galeria-profissional") // nome EXATO do seu bucket
        .upload(filePath, arquivo, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Erro upload:", uploadError.message);
        throw new Error("Falha ao enviar imagem. Tente novamente.");
      }

      const {
        data: { publicUrl },
      } = supabase.storage
        .from("galeria-profissional")
        .getPublicUrl(filePath);

      // ---------- 2. Inserir na tabela foto_galeria_profissional ----------
      const { error: fotoError } = await supabase
        .from("foto_galeria_profissional")
        .insert({
          profissional_id: profissionalId,
          url: publicUrl,
          descricao: descricao || titulo,
        });

      if (fotoError) {
        console.error("Erro ao salvar foto:", fotoError.message);
        throw new Error("Falha ao salvar a obra na galeria.");
      }

      // ---------- 3. (Opcional) criar registro em obras_profissionais ----------
      if (salvarComoObraAndamento) {
        const dias =
          diasRestantes === "" ? null : Number(diasRestantes || 0);

        const { error: obraError } = await supabase
          .from("obras_profissionais")
          .insert({
            profissional_id: profissionalId,
            titulo,
            // não mandamos cliente_nome nem previsao_fim
            dias_restantes: dias,
          });

        if (obraError) {
          console.error("Erro ao salvar obra:", obraError.message);
          // não dou throw pra não quebrar o fluxo todo
        }
      }

      setSucesso("Obra cadastrada com sucesso!");
      setTitulo("");
      setDescricao("");
      setClienteNome("");
      setDiasRestantes("");
      setPrevisaoFim("");
      setArquivo(null);

      // volta para o painel depois de salvar
      router.push(
        `/painel/profissional?id=${profissionalId}&apelido=${encodeURIComponent(
          apelido
        )}`
      );
    } catch (err: any) {
      setErro(err.message || "Ocorreu um erro ao salvar a obra.");
    } finally {
      setCarregando(false);
    }
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
          <h1
            style={{
              fontSize: "1.4rem",
              fontWeight: 700,
              color: "#0F172A",
              marginBottom: "4px",
            }}
          >
            Nova obra
          </h1>
          <p style={{ fontSize: "0.9rem", color: "#64748B" }}>
            Envie uma foto e os detalhes para registrar essa obra na sua
            galeria.
          </p>

          <Link
            href={`/painel/profissional?id=${profissionalId}&apelido=${encodeURIComponent(
              apelido
            )}`}
            style={{
              display: "inline-block",
              marginTop: "10px",
              fontSize: "0.82rem",
              color: "#2563EB",
              textDecoration: "none",
            }}
          >
            ← Voltar para o painel
          </Link>
        </header>

        {erro && (
          <div
            style={{
              marginBottom: "12px",
              padding: "8px 10px",
              borderRadius: "10px",
              background: "#FEE2E2",
              color: "#B91C1C",
              fontSize: "0.82rem",
            }}
          >
            {erro}
          </div>
        )}

        {sucesso && (
          <div
            style={{
              marginBottom: "12px",
              padding: "8px 10px",
              borderRadius: "10px",
              background: "#ECFDF3",
              color: "#166534",
              fontSize: "0.82rem",
            }}
          >
            {sucesso}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "12px" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.85rem",
                fontWeight: 600,
                marginBottom: "4px",
                color: "#0F172A",
              }}
            >
              Título da obra
            </label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Box de vidro no banheiro da suíte"
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "12px",
                border: "1px solid #CBD5E1",
                fontSize: "0.9rem",
              }}
            />
          </div>

          <div style={{ marginBottom: "12px" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.85rem",
                fontWeight: 600,
                marginBottom: "4px",
                color: "#0F172A",
              }}
            >
              Descrição (opcional)
            </label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Detalhes importantes, materiais usados, medidas, etc."
              rows={3}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "12px",
                border: "1px solid #CBD5E1",
                fontSize: "0.9rem",
                resize: "vertical",
              }}
            />
          </div>

          <div style={{ marginBottom: "12px" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.85rem",
                fontWeight: 600,
                marginBottom: "4px",
                color: "#0F172A",
              }}
            >
              Foto da obra
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setArquivo(file);
              }}
              style={{
                fontSize: "0.85rem",
              }}
            />
            <p
              style={{
                fontSize: "0.75rem",
                color: "#6B7280",
                marginTop: "4px",
              }}
            >
              Envie uma foto nítida da obra (jpg, png, heic...).
            </p>
          </div>

          <div
            style={{
              marginTop: "16px",
              marginBottom: "10px",
              padding: "10px 12px",
              borderRadius: "14px",
              background: "#F9FAFB",
              border: "1px solid #E5E7EB",
            }}
          >
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "0.85rem",
                color: "#0F172A",
                fontWeight: 600,
                marginBottom: "6px",
              }}
            >
              <input
                type="checkbox"
                checked={salvarComoObraAndamento}
                onChange={(e) =>
                  setSalvarComoObraAndamento(e.target.checked)
                }
              />
              Marcar também como obra em andamento
            </label>

            {salvarComoObraAndamento && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  marginTop: "4px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.8rem",
                      marginBottom: "2px",
                      color: "#4B5563",
                    }}
                  >
                    Nome do cliente (opcional)
                  </label>
                  <input
                    type="text"
                    value={clienteNome}
                    onChange={(e) => setClienteNome(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: "10px",
                      border: "1px solid #CBD5E1",
                      fontSize: "0.85rem",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.8rem",
                      marginBottom: "2px",
                      color: "#4B5563",
                    }}
                  >
                    Dias restantes (opcional)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={diasRestantes}
                    onChange={(e) => {
                      const v = e.target.value;
                      setDiasRestantes(v === "" ? "" : Number(v));
                    }}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: "10px",
                      border: "1px solid #CBD5E1",
                      fontSize: "0.85rem",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.8rem",
                      marginBottom: "2px",
                      color: "#4B5563",
                    }}
                  >
                    Previsão de término (opcional)
                  </label>
                  <input
                    type="date"
                    value={previsaoFim}
                    onChange={(e) => setPrevisaoFim(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: "10px",
                      border: "1px solid #CBD5E1",
                      fontSize: "0.85rem",
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={carregando}
            style={{
              width: "100%",
              marginTop: "8px",
              padding: "12px",
              borderRadius: "999px",
              border: "none",
              background: carregando ? "#93C5FD" : "#2563EB",
              color: "white",
              fontWeight: 600,
              fontSize: "0.98rem",
              cursor: carregando ? "default" : "pointer",
              boxShadow: "0 2px 8px rgba(37,99,235,0.35)",
            }}
          >
            {carregando ? "Salvando..." : "Salvar obra"}
          </button>
        </form>
      </div>
    </main>
  );
}
