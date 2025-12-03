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

    try {
      setCarregando(true);

      // 1) upload da imagem se tiver
      let imagemUrl: string | null = null;

      if (arquivo) {
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
      }

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

      // manda direto pro painel do profissional
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
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-4 pb-10 pt-8">
        {/* Cabeçalho */}
        <header className="mb-6">
          <button
            type="button"
            onClick={irParaPainel}
            className="mb-3 text-sm font-medium text-sky-600"
          >
            ← Voltar para o painel
          </button>

          <h1 className="text-2xl font-bold text-slate-900">Nova obra</h1>
          <p className="mt-1 text-sm text-slate-500">
            Envie uma foto e os detalhes para registrar essa obra na sua
            galeria.
          </p>
        </header>

        {/* Alertas */}
        {sucesso && (
          <div className="mb-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {sucesso}
          </div>
        )}

        {erro && (
          <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {erro}
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">
              Título da obra
            </label>
            <input
              type="text"
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[16px] text-slate-900 outline-none ring-sky-500 placeholder:text-slate-400 focus:ring-2"
              placeholder="Ex: Box de vidro no banheiro da suíte"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Descrição (opcional)
            </label>
            <textarea
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[16px] text-slate-900 outline-none ring-sky-500 placeholder:text-slate-400 focus:ring-2"
              rows={3}
              placeholder="Detalhes importantes, materiais usados, medidas, etc."
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Foto da obra
            </label>
            <input
              type="file"
              accept="image/*"
              className="mt-1 w-full text-[16px]"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setArquivo(file);
              }}
            />
            <p className="mt-1 text-xs text-slate-500">
              Envie uma foto nítida da obra (jpg, png, heic...).
            </p>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={salvarComoObraAndamento}
                onChange={(e) =>
                  setSalvarComoObraAndamento(e.target.checked)
                }
                className="mt-1 h-4 w-4"
              />
              <span className="text-sm font-medium text-slate-800">
                Marcar também como obra em andamento
              </span>
            </label>

            {salvarComoObraAndamento && (
              <div className="mt-4 space-y-3">
                <div>
                  <label className="text-xs font-medium text-slate-600">
                    Nome do cliente (opcional)
                  </label>
                  <input
                    type="text"
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[16px] text-slate-900 outline-none ring-sky-500 placeholder:text-slate-400 focus:ring-2"
                    value={clienteNome}
                    onChange={(e) => setClienteNome(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-600">
                    Dias restantes (opcional)
                  </label>
                  <input
                    type="number"
                    min={0}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[16px] text-slate-900 outline-none ring-sky-500 placeholder:text-slate-400 focus:ring-2"
                    value={diasRestantes}
                    onChange={(e) => {
                      const value = e.target.value;
                      setDiasRestantes(value === "" ? "" : Number(value));
                    }}
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-600">
                    Previsão de término (opcional)
                  </label>
                  <input
                    type="date"
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[16px] text-slate-900 outline-none ring-sky-500 placeholder:text-slate-400 focus:ring-2"
                    value={previsaoFim}
                    onChange={(e) => setPrevisaoFim(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={carregando}
            className="mt-2 w-full rounded-lg bg-sky-600 py-3 text-sm font-semibold text-white shadow-sm disabled:opacity-60"
          >
            {carregando ? "Salvando..." : "Salvar obra"}
          </button>
        </form>
      </div>
    </main>
  );
}
