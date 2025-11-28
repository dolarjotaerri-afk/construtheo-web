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
  const [imagemUrl, setImagemUrl] = useState("");
  const [arquivo, setArquivo] = useState<File | null>(null);

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
      setErro("Preencha o nome/descrição da obra.");
      return;
    }

    if (!arquivo && !imagemUrl.trim()) {
      setErro("Envie uma imagem ou informe uma URL de imagem.");
      return;
    }

    setLoading(true);

    try {
      let finalUrl = imagemUrl.trim();

      // Se tiver arquivo, faz upload no Storage
      if (arquivo) {
        const bucket = "galeria-profissional"; // crie este bucket no Supabase Storage

        const fileExt = arquivo.name.split(".").pop();
        const filePath = `profissionais/${profissionalId}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filePath, arquivo);

        if (uploadError) {
          console.error(uploadError);
          throw new Error("Erro ao fazer upload da imagem.");
        }

        const { data: publicData } = supabase.storage
          .from(bucket)
          .getPublicUrl(filePath);

        finalUrl = publicData.publicUrl;
      }

      // Insere na tabela foto_galeria_profissional
      const { error: insertError } = await supabase
        .from("foto_galeria_profissional")
        .insert([
          {
            profissional_id: profissionalId,
            url: finalUrl,
            descricao: titulo,
          },
        ]);

      if (insertError) {
        console.error(insertError);
        throw new Error("Erro ao salvar obra no banco.");
      }

      setSucesso("Obra cadastrada com sucesso!");
      setTitulo("");
      setImagemUrl("");
      setArquivo(null);

      // Volta para o painel depois de 1 segundo
      setTimeout(() => {
        router.push(
          `/painel/profissional?apelido=${encodeURIComponent(
            apelido
          )}&id=${profissionalId}`
        );
      }, 1000);
    } catch (err: any) {
      setErro(err.message || "Erro ao cadastrar a obra.");
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
            Adicionar nova obra
          </h1>
          <p style={{ color: "#6B7280", fontSize: "0.85rem" }}>
            Cadastre fotos dos seus serviços para aparecerem no seu painel e
            ajudarem os clientes a confiarem no seu trabalho.
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
              Nome / descrição da obra
            </label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Box de vidro do banheiro"
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "12px",
                border: "1px solid #CBD5E1",
                fontSize: "0.9rem",
              }}
            />
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
              Foto da obra
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setArquivo(e.target.files?.[0] ? e.target.files[0] : null)
              }
              style={{
                display: "block",
                marginBottom: "6px",
                fontSize: "0.8rem",
              }}
            />
            <p
              style={{
                fontSize: "0.75rem",
                color: "#6B7280",
                marginBottom: "6px",
              }}
            >
              Você também pode colar uma URL de imagem, se já tiver a foto
              hospedada em algum lugar.
            </p>
            <input
              type="text"
              value={imagemUrl}
              onChange={(e) => setImagemUrl(e.target.value)}
              placeholder="https://..."
              style={{
                width: "100%",
                padding: "8px 10px",
                borderRadius: "10px",
                border: "1px solid #E5E7EB",
                fontSize: "0.85rem",
              }}
            />
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
            {loading ? "Salvando..." : "Salvar obra"}
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
