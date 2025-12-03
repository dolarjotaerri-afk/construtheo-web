"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, FormEvent } from "react";
import { supabase } from "../../../../lib/supabaseClient";

export default function NovaObraPage() {
  const router = useRouter();

  const [profissionalId, setProfissionalId] = useState<string | null>(null);
  const [apelido, setApelido] = useState("profissional");

  // lê ?id= e ?apelido= da URL só no browser
  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const apelidoParam = params.get("apelido");

    if (id) setProfissionalId(id);
    if (apelidoParam) setApelido(apelidoParam);
  }, []);

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

  function irParaPainel() {
    if (profissionalId) {
      router.push(
        `/painel/profissional?id=${profissionalId}&apelido=${encodeURIComponent(
          apelido
        )}`
      );
    } else {
      router.push("/painel/profissional");
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro(null);
    setSucesso(null);

    if (!profissionalId) {
      setErro("Profissional não identificado. Abra novamente seu painel.");
      return;
    }

    if (!arquivo) {
      setErro("Selecione uma foto da obra.");
      return;
    }

    try {
      setCarregando(true);

      // 1) upload da imagem
      let imagemUrl: string | null = null;

      const ext = arquivo.name.split(".").pop();
      const filePath = `obras-profissionais/${profissionalId}-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("obras")
        .upload(filePath, arquivo);

      if (uploadError) throw uploadError;

      const { data: publicData } = supabase.storage
        .from("obras")
        .getPublicUrl(filePath);

      imagemUrl = publicData.publicUrl;

      // 2) salvar na tabela de obras (galeria)
      const { error: insertObraError } = await supabase
        .from("obras_profissionais")
        .insert({
          profissional_id: profissionalId,
          titulo,
          descricao,
          imagem_url: imagemUrl,
        });

      if (insertObraError) throw insertObraError;

      // 3) opcional: salvar também em obras em andamento
      if (salvarComoObraAndamento) {
        const { error: insertAndamentoError } = await supabase
          .from("obras_andamento_profissional")
          .insert({
            profissional_id: profissionalId,
            titulo,
            cliente_nome: clienteNome || null,
            dias_restantes:
              diasRestantes === "" ? null : Number(diasRestantes),
            previsao_fim: previsaoFim || null,
            imagem_url: imagemUrl,
          });

        if (insertAndamentoError) throw insertAndamentoError;
      }

      setSucesso("Obra cadastrada com sucesso!");
      irParaPainel();
    } catch (err: any) {
      console.error(err);
      setErro(
        err.message || "Ocorreu um erro ao salvar a obra. Tente novamente."
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main
      style={{
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        paddingTop: "40px",
        paddingBottom: "40px",
        background: "#F1F5F9", // mesmo clima do painel
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
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Cabeçalho */}
        <header
          style={{
            marginBottom: "18px",
          }}
        >
          <button
            type="button"
            onClick={irParaPainel}
            style={{
              marginBottom: "8px",
              fontSize: "0.85rem",
              fontWeight: 500,
              color: "#2563EB",
              background: "transparent",
              border: "none",
              padding: 0,
              cursor: "pointer",
            }}
          >
            ← Voltar para o painel
          </button>

          <h1
            style={{
              fontSize: "1.35rem",
              fontWeight: 700,
              color: "#111827",
              marginBottom: "4px",
            }}
          >
            Nova obra
          </h1>
          <p
            style={{
              fontSize: "0.85rem",
              color: "#6B7280",
            }}
          >
            Envie uma foto e os detalhes para registrar essa obra na sua
            galeria.
          </p>
        </header>

        {/* Alertas */}
        {sucesso && (
          <div
            style={{
              marginBottom: "12px",
              borderRadius: "12px",
              background: "#ECFDF5",
              padding: "8px 10px",
              fontSize: "0.8rem",
              color: "#047857",
            }}
          >
            {sucesso}
          </div>
        )}

        {erro && (
          <div
            style={{
              marginBottom: "12px",
              borderRadius: "12px",
              background: "#FEE2E2",
              padding: "8px 10px",
              fontSize: "0.8rem",
              color: "#B91C1C",
            }}
          >
            {erro}
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit}>
          {/* Título */}
          <div style={{ marginBottom: "12px" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "#111827",
                marginBottom: "4px",
              }}
            >
              Título da obra
            </label>
            <input
              type="text"
              placeholder="Ex: Alvenaria, lage, pintura, acabamentos.."
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "12px",
                border: "1px solid #E5E7EB",
                fontSize: "16px",
                color: "#111827",
                outline: "none",
              }}
            />
          </div>

          {/* Descrição */}
          <div style={{ marginBottom: "12px" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "#111827",
                marginBottom: "4px",
              }}
            >
              Descrição <span style={{ fontWeight: 400 }}>(opcional)</span>
            </label>
            <textarea
              placeholder="Detalhes importantes, materiais usados, medidas, etc."
              rows={3}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "12px",
                border: "1px solid #E5E7EB",
                fontSize: "16px",
                color: "#111827",
                outline: "none",
                resize: "vertical",
              }}
            />
          </div>

          {/* Foto da obra */}
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "#111827",
                marginBottom: "4px",
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
                fontSize: "16px",
              }}
            />
            <p
              style={{
                marginTop: "4px",
                fontSize: "0.78rem",
                color: "#6B7280",
              }}
            >
              Envie uma foto nítida da obra (jpg, png, heic...).
            </p>
          </div>

          {/* Card obra em andamento */}
          <div
            style={{
              marginBottom: "18px",
              padding: "12px 12px",
              borderRadius: "18px",
              border: "1px solid #E5E7EB",
              background: "#F9FAFB",
            }}
          >
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "#111827",
                marginBottom: "10px",
              }}
            >
              <input
                type="checkbox"
                checked={salvarComoObraAndamento}
                onChange={(e) =>
                  setSalvarComoObraAndamento(e.target.checked)
                }
                style={{ width: 18, height: 18 }}
              />
              Marcar também como obra em andamento
            </label>

            {salvarComoObraAndamento && (
              <div style={{ marginTop: "6px" }}>
                {/* Nome do cliente */}
                <div style={{ marginBottom: "10px" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.8rem",
                      fontWeight: 500,
                      color: "#374151",
                      marginBottom: "4px",
                    }}
                  >
                    Nome do cliente{" "}
                    <span style={{ fontWeight: 400 }}>(opcional)</span>
                  </label>
                  <input
                    type="text"
                    value={clienteNome}
                    onChange={(e) => setClienteNome(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: "10px",
                      border: "1px solid #E5E7EB",
                      fontSize: "16px",
                      color: "#111827",
                      outline: "none",
                    }}
                  />
                </div>

                {/* Dias restantes */}
                <div style={{ marginBottom: "10px" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.8rem",
                      fontWeight: 500,
                      color: "#374151",
                      marginBottom: "4px",
                    }}
                  >
                    Dias restantes{" "}
                    <span style={{ fontWeight: 400 }}>(opcional)</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={diasRestantes}
                    onChange={(e) => {
                      const value = e.target.value;
                      setDiasRestantes(value === "" ? "" : Number(value));
                    }}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: "10px",
                      border: "1px solid #E5E7EB",
                      fontSize: "16px",
                      color: "#111827",
                      outline: "none",
                    }}
                  />
                </div>

                {/* Previsão fim */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.8rem",
                      fontWeight: 500,
                      color: "#374151",
                      marginBottom: "4px",
                    }}
                  >
                    Previsão de término{" "}
                    <span style={{ fontWeight: 400 }}>(opcional)</span>
                  </label>
                  <input
                    type="date"
                    value={previsaoFim}
                    onChange={(e) => setPrevisaoFim(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: "10px",
                      border: "1px solid #E5E7EB",
                      fontSize: "16px",
                      color: "#111827",
                      outline: "none",
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Botão salvar */}
          <button
            type="submit"
            disabled={carregando}
            style={{
              width: "100%",
              padding: "12px 16px",
              borderRadius: "999px",
              border: "none",
              background: "linear-gradient(135deg, #0284C7, #0EA5E9)",
              color: "#FFFFFF",
              fontSize: "0.95rem",
              fontWeight: 600,
              cursor: carregando ? "default" : "pointer",
              opacity: carregando ? 0.7 : 1,
            }}
          >
            {carregando ? "Salvando..." : "Salvar obra"}
          </button>
        </form>
      </div>
    </main>
  );
}
