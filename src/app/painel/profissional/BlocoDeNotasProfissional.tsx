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
      setAnotacoes(data as Anotacao[]);
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
    <div className="bg-white rounded-2xl shadow-md p-4 sm:p-5 mt-4">
      <h2 className="text-lg font-semibold text-slate-900 mb-2">
        Bloco de notas das obras
      </h2>
      <p className="text-sm text-slate-500 mb-3">
        Use este espaço para anotar detalhes importantes das suas obras,
        orçamentos, combinações com o cliente, etc.
      </p>

      <form onSubmit={handleSalvar} className="space-y-3 mb-4">
        <input
          type="text"
          placeholder="Título (opcional ex: Obra do João, Reforma da cozinha...)"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
        />

        <textarea
          rows={4}
          placeholder="Escreva aqui suas anotações..."
          value={conteudo}
          onChange={(e) => setConteudo(e.target.value)}
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
        />

        {erro && (
          <p className="text-sm text-red-500 bg-red-50 rounded-xl px-3 py-2">
            {erro}
          </p>
        )}

        <button
          type="submit"
          disabled={salvando || !conteudo.trim()}
          className="w-full sm:w-auto inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold text-white bg-sky-600 disabled:bg-slate-300 disabled:cursor-not-allowed"
        >
          {salvando ? "Salvando..." : "Salvar anotação"}
        </button>
      </form>

      <div className="border-t border-slate-100 pt-3">
        {carregando ? (
          <p className="text-sm text-slate-500">Carregando anotações...</p>
        ) : anotacoes.length === 0 ? (
          <p className="text-sm text-slate-500">
            Você ainda não tem anotações. Comece criando a primeira acima. 😊
          </p>
        ) : (
          <ul className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {anotacoes.map((nota) => (
              <li
                key={nota.id}
                className="border border-slate-100 rounded-xl px-3 py-2"
              >
                {nota.titulo && (
                  <p className="text-sm font-semibold text-slate-900">
                    {nota.titulo}
                  </p>
                )}
                <p className="text-sm text-slate-700 whitespace-pre-line">
                  {nota.conteudo}
                </p>
                <p className="mt-1 text-[11px] text-slate-400">
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
    </div>
  );
}