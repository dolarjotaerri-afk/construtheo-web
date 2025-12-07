"use client";

import { FormEvent, useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

type Anotacao = {
  id: string;
  titulo: string | null;
  conteudo: string;
  created_at: string;
};

type BlocoDeNotasProfissionalProps = {
  profissionalId: string;
};

export function BlocoDeNotasProfissional({
  profissionalId,
}: BlocoDeNotasProfissionalProps) {
  const [anotacoes, setAnotacoes] = useState<Anotacao[]>([]);
  const [titulo, setTitulo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function carregarAnotacoes() {
    if (!profissionalId) return;

    setCarregando(true);
    setErro(null);

    const { data, error } = await supabase
      .from("anotacoes_profissionais")
      .select("*")
      .eq("profissional_id", profissionalId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao carregar anotações:", error);
      setErro("Não foi possível carregar suas anotações.");
    } else {
      setAnotacoes((data as Anotacao[]) || []);
    }

    setCarregando(false);
  }

  useEffect(() => {
    carregarAnotacoes();
  }, [profissionalId]);

  async function handleSalvar(e: FormEvent) {
    e.preventDefault();
    if (!conteudo.trim()) return;

    setSalvando(true);
    setErro(null);

    const { data, error } = await supabase
      .from("anotacoes_profissionais")
      .insert({
        profissional_id: profissionalId,
        titulo: titulo.trim() || null,
        conteudo: conteudo.trim(),
      })
      .select("*")
      .single();

    if (error) {
      console.error("Erro ao salvar anotação:", error);
      setErro("Não foi possível salvar a anotação. Tente novamente.");
    } else if (data) {
      setAnotacoes((prev) => [data as Anotacao, ...prev]);
      setTitulo("");
      setConteudo("");
    }

    setSalvando(false);
  }

  return (
    <section
      style={{
        marginTop: 8,
        marginBottom: 16,
        padding: "10px 12px 12px",
        borderRadius: 18,
        border: "1px solid #E5E7EB",
        background: "#F9FAFB",
      }}
    >
      <p
        style={{
          fontSize: "0.8rem",
          fontWeight: 600,
          color: "#111827",
          marginBottom: 6,
        }}
      >
        Bloco de notas das obras
      </p>

      <p
        style={{
          fontSize: "0.78rem",
          color: "#6B7280",
          marginBottom: 10,
        }}
      >
        Use este espaço para anotar detalhes importantes das suas obras,
        orçamentos, combinações com o cliente, etc.
      </p>

      <form onSubmit={handleSalvar} style={{ marginBottom: 10 }}>
        <textarea
          rows={3}
          placeholder="Escreva aqui suas anotações..."
          value={conteudo}
          onChange={(e) => setConteudo(e.target.value)}
          style={{
            width: "100%",
            borderRadius: 12,
            border: "1px solid #E5E7EB",
            padding: "8px 10px",
            fontSize: "0.8rem",
            color: "#111827",
            marginBottom: 6,
            resize: "vertical",
          }}
        />

        <input
          type="text"
          placeholder="Título (opcional ex: Obra do João, Reforma da cozinha...)"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          style={{
            width: "100%",
            borderRadius: 12,
            border: "1px solid #E5E7EB",
            padding: "8px 10px",
            fontSize: "0.78rem",
            color: "#111827",
            marginBottom: 8,
          }}
        />

        {erro && (
          <p
            style={{
              fontSize: "0.75rem",
              color: "#B91C1C",
              background: "#FEE2E2",
              borderRadius: 10,
              padding: "6px 8px",
              marginBottom: 6,
            }}
          >
            {erro}
          </p>
        )}

        <button
          type="submit"
          disabled={salvando || !conteudo.trim()}
          style={{
            width: "100%",
            borderRadius: 999,
            padding: "8px 12px",
            border: "none",
            fontSize: "0.8rem",
            fontWeight: 600,
            color: "#FFFFFF",
            background: salvando || !conteudo.trim()
              ? "#CBD5F5"
              : "linear-gradient(to right, #0284C7, #0EA5E9)",
            cursor:
              salvando || !conteudo.trim() ? "default" : "pointer",
          }}
        >
          {salvando ? "Salvando..." : "Salvar anotação"}
        </button>
      </form>

      <div
        style={{
          borderTop: "1px solid #E5E7EB",
          paddingTop: 8,
          maxHeight: 210,
          overflowY: "auto",
        }}
      >
        {carregando ? (
          <p
            style={{
              fontSize: "0.78rem",
              color: "#6B7280",
            }}
          >
            Carregando anotações...
          </p>
        ) : anotacoes.length === 0 ? (
          <p
            style={{
              fontSize: "0.78rem",
              color: "#64748B",
            }}
          >
            Você ainda não tem anotações. Comece criando a primeira
            acima. 😊
          </p>
        ) : (
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            {anotacoes.map((nota) => (
              <li
                key={nota.id}
                style={{
                  borderRadius: 12,
                  border: "1px solid #E5E7EB",
                  background: "#FFFFFF",
                  padding: "6px 8px",
                }}
              >
                {nota.titulo && (
                  <p
                    style={{
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      color: "#111827",
                      marginBottom: 2,
                    }}
                  >
                    {nota.titulo}
                  </p>
                )}
                <p
                  style={{
                    fontSize: "0.78rem",
                    color: "#4B5563",
                    whiteSpace: "pre-line",
                  }}
                >
                  {nota.conteudo}
                </p>
                <p
                  style={{
                    marginTop: 3,
                    fontSize: "0.68rem",
                    color: "#9CA3AF",
                  }}
                >
                  {new Date(nota.created_at).toLocaleString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}