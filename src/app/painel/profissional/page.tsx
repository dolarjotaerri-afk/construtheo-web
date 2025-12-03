"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../../lib/supabaseClient";

type ProfissionalResumo = {
  id?: string;
  nome: string;
  apelido?: string | null;
  funcao?: string | null;
  area?: string | null;
  localizacao?: string | null;
  whatsapp?: string;
  email?: string;
};

type ObraGaleria = {
  id: string;
  titulo: string;
  imagem_url: string | null;
};

type ObraAndamento = {
  id: string;
  titulo: string;
  cliente_nome: string | null;
  dias_restantes: number | null;
  previsao_fim: string | null;
  imagem_url: string | null;
};

export default function PainelProfissionalPage() {
  const [profissional, setProfissional] = useState<ProfissionalResumo | null>(
    null
  );

  const [obrasGaleria, setObrasGaleria] = useState<ObraGaleria[]>([]);
  const [carregandoObrasGaleria, setCarregandoObrasGaleria] = useState(false);

  const [obrasAndamento, setObrasAndamento] = useState<ObraAndamento[]>([]);
  const [carregandoAndamento, setCarregandoAndamento] = useState(false);

  const [erroObras, setErroObras] = useState<string | null>(null);

  // 1) Carrega profissional do localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    const raw = localStorage.getItem("construtheo_profissional_atual");

    if (raw) {
      try {
        const parsed = JSON.parse(raw) as ProfissionalResumo;
        setProfissional(parsed);
        return;
      } catch {
        // cai no demo
      }
    }

    // fallback demo
    setProfissional({
      nome: "Profissional Demo",
      apelido: "Pedreiro Demo",
      funcao: "Pedreiro / Reforma",
      area: "Construção civil",
      localizacao: "Igaratá - SP",
      whatsapp: "(11) 98888-0000",
      email: "profissional@demo.com",
    });
  }, []);

  const isDemo = !profissional?.id;
  const nomeMostrado =
    profissional?.apelido || profissional?.nome || "Profissional";
  const funcaoMostrada =
    profissional?.funcao || profissional?.area || "Profissional da construção";
  const local =
    profissional?.localizacao || "Localização não informada";

  // 2) Carrega obras de galeria no Supabase
  useEffect(() => {
    if (!profissional?.id) return;

    const profissionalId = profissional.id;

    async function carregarObrasGaleria() {
      setCarregandoObrasGaleria(true);
      setErroObras(null);

      const { data, error } = await supabase
        .from("obras_profissionais")
        .select("id, titulo, imagem_url")
        .eq("profissional_id", profissionalId)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) {
        console.error("Erro ao carregar obras:", error.message);
        setErroObras("Não foi possível carregar suas obras.");
      } else {
        setObrasGaleria((data as ObraGaleria[]) || []);
      }

      setCarregandoObrasGaleria(false);
    }

    carregarObrasGaleria();
  }, [profissional?.id]);

  // 3) Carrega obras em andamento
  useEffect(() => {
    if (!profissional?.id) return;

    const profissionalId = profissional.id;

    async function carregarAndamento() {
      setCarregandoAndamento(true);

      const { data, error } = await supabase
        .from("obras_andamento_profissional")
        .select(
          "id, titulo, cliente_nome, dias_restantes, previsao_fim, imagem_url"
        )
        .eq("profissional_id", profissionalId)
        .order("created_at", { ascending: true })
        .limit(20);

      if (error) {
        console.error("Erro ao carregar obras em andamento:", error.message);
      } else {
        setObrasAndamento((data as ObraAndamento[]) || []);
      }

      setCarregandoAndamento(false);
    }

    carregarAndamento();
  }, [profissional?.id]);

  return (
    <main
      style={{
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "32px 12px",
        background: "#DBEAFE",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 460,
          background: "#FFFFFF",
          borderRadius: 28,
          padding: "22px 18px 22px",
          boxShadow: "0 15px 35px rgba(15,23,42,0.16)",
        }}
      >
        {/* TOPO */}
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 14,
          }}
        >
          <div>
            <p
              style={{
                fontSize: "0.78rem",
                color: "#6B7280",
                marginBottom: 4,
              }}
            >
              Olá,
            </p>
            <h1
              style={{
                fontSize: "1.05rem",
                fontWeight: 700,
                color: "#111827",
              }}
            >
              {nomeMostrado}
            </h1>
            <p
              style={{
                fontSize: "0.78rem",
                color: "#6B7280",
                marginTop: 2,
              }}
            >
              Bem-vindo ao seu painel de profissional no ConstruThéo.
            </p>
            <p
              style={{
                fontSize: "0.75rem",
                color: "#9CA3AF",
                marginTop: 2,
              }}
            >
              {funcaoMostrada} • {local}
            </p>
          </div>

          <span
            style={{
              padding: "6px 10px",
              borderRadius: 999,
              background: isDemo ? "#EFF6FF" : "#DCFCE7",
              fontSize: "0.7rem",
              color: isDemo ? "#2563EB" : "#15803D",
              fontWeight: 600,
              whiteSpace: "nowrap",
            }}
          >
            {isDemo ? "Conta demo" : "Profissional conectado"}
          </span>
        </header>

        {/* RESUMO MÉTRICAS (demo + real de obras em andamento) */}
        <section
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 16,
            padding: "10px 12px",
            borderRadius: 16,
            background: "#F9FAFB",
            border: "1px solid #E5E7EB",
            fontSize: "0.78rem",
          }}
        >
          <div>
            <p
              style={{
                fontWeight: 600,
                color: "#111827",
                marginBottom: 4,
              }}
            >
              Avaliação média
            </p>
            <p
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                color: "#6B7280",
              }}
            >
              <span>⭐</span>
              <span>
                <strong>4,8</strong> (5 avaliações)
              </span>
            </p>
          </div>

          <div
            style={{
              width: 1,
              background: "#E5E7EB",
            }}
          />

          <div>
            <p
              style={{
                fontWeight: 600,
                color: "#111827",
                marginBottom: 4,
              }}
            >
              Obras em andamento
            </p>
            <p style={{ color: "#6B7280" }}>
              <strong>{obrasAndamento.length}</strong> ativa(s)
            </p>
          </div>
        </section>

        {/* SUAS OBRAS (GALERIA) */}
        <section
          style={{
            marginBottom: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <p
              style={{
                fontSize: "0.8rem",
                fontWeight: 600,
                color: "#111827",
              }}
            >
              Suas obras concluídas / galeria
            </p>

            {!isDemo && (
              <span
                style={{
                  fontSize: "0.72rem",
                  color: "#64748B",
                }}
              >
                {carregandoObrasGaleria
                  ? "Carregando..."
                  : `${obrasGaleria.length} obra(s)`}
              </span>
            )}
          </div>

          {/* Botão para cadastrar nova obra */}
          {!isDemo && profissional?.id && (
            <div
              style={{
                marginBottom: 8,
              }}
            >
              <Link
                href={`/painel/profissional/nova-obra?id=${profissional.id}&apelido=${encodeURIComponent(
                  nomeMostrado
                )}`}
                style={{
                  display: "inline-block",
                  padding: "8px 12px",
                  borderRadius: 999,
                  background:
                    "linear-gradient(to right, #0284C7, #0EA5E9)",
                  color: "#FFFFFF",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                + Cadastrar nova obra
              </Link>
            </div>
          )}

          <div
            style={{
              display: "flex",
              gap: 10,
              overflowX: "auto",
              paddingBottom: 4,
            }}
          >
            {carregandoObrasGaleria ? (
              <div
                style={{
                  minWidth: 190,
                  borderRadius: 18,
                  border: "1px solid #E5E7EB",
                  background: "#F9FAFB",
                  padding: 12,
                  fontSize: "0.8rem",
                  color: "#6B7280",
                }}
              >
                Carregando obras...
              </div>
            ) : obrasGaleria.length === 0 ? (
              <div
                style={{
                  minWidth: 220,
                  borderRadius: 18,
                  border: "1px dashed #CBD5E1",
                  background: "#F8FAFC",
                  padding: 12,
                  fontSize: "0.8rem",
                  color: "#64748B",
                }}
              >
                Nenhuma obra cadastrada ainda. Use o botão{" "}
                <strong>&quot;Cadastrar nova obra&quot;</strong> para adicionar
                a primeira foto do seu trabalho.
              </div>
            ) : (
              obrasGaleria.map((obra) => (
                <div
                  key={obra.id}
                  style={{
                    minWidth: 190,
                    borderRadius: 18,
                    border: "1px solid #E5E7EB",
                    background: "#FFFFFF",
                    padding: 10,
                  }}
                >
                  <div
                    style={{
                      height: 100,
                      borderRadius: 12,
                      background: "#E5F0FF",
                      marginBottom: 8,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.75rem",
                      color: "#64748B",
                      overflow: "hidden",
                    }}
                  >
                    {obra.imagem_url ? (
                      <img
                        src={obra.imagem_url}
                        alt={obra.titulo}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      "Sem foto"
                    )}
                  </div>

                  <p
                    style={{
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      color: "#111827",
                      marginBottom: 2,
                    }}
                  >
                    {obra.titulo}
                  </p>
                  <p
                    style={{
                      fontSize: "0.72rem",
                      color: "#6B7280",
                      marginBottom: 4,
                    }}
                  >
                    Obra concluída
                  </p>

                  <button
                    style={{
                      borderRadius: 999,
                      padding: "6px 10px",
                      border: "1px solid #2563EB",
                      background: "white",
                      fontSize: "0.75rem",
                      color: "#2563EB",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Ver detalhes
                  </button>
                </div>
              ))
            )}
          </div>

          <p
            style={{
              textAlign: "center",
              fontSize: "0.7rem",
              color: "#9CA3AF",
              marginTop: 4,
            }}
          >
            Arraste para o lado para ver todas as obras
          </p>

          {erroObras && (
            <p
              style={{
                marginTop: 6,
                fontSize: "0.75rem",
                color: "#B91C1C",
              }}
            >
              {erroObras}
            </p>
          )}
        </section>

        {/* OBRAS EM ANDAMENTO */}
        <section
          style={{
            marginBottom: 16,
            padding: "10px 12px",
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
              marginBottom: 8,
            }}
          >
            Obras em andamento
          </p>

          {carregandoAndamento ? (
            <p
              style={{
                fontSize: "0.78rem",
                color: "#6B7280",
              }}
            >
              Carregando informações das obras em andamento...
            </p>
          ) : obrasAndamento.length === 0 ? (
            <p
              style={{
                fontSize: "0.78rem",
                color: "#64748B",
              }}
            >
              Você ainda não cadastrou nenhuma obra em andamento. Marque essa
              opção ao cadastrar uma nova obra.
            </p>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              {obrasAndamento.map((obra) => (
                <div
                  key={obra.id}
                  style={{
                    display: "flex",
                    gap: 8,
                    padding: 8,
                    borderRadius: 12,
                    background: "#FFFFFF",
                    border: "1px solid #E5E7EB",
                  }}
                >
                  <div
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 10,
                      background: "#E5F0FF",
                      overflow: "hidden",
                      flexShrink: 0,
                    }}
                  >
                    {obra.imagem_url ? (
                      <img
                        src={obra.imagem_url}
                        alt={obra.titulo}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.7rem",
                          color: "#64748B",
                        }}
                      >
                        Sem foto
                      </div>
                    )}
                  </div>

                  <div style={{ flex: 1 }}>
                    <p
                      style={{
                        fontSize: "0.82rem",
                        fontWeight: 600,
                        color: "#111827",
                      }}
                    >
                      {obra.titulo}
                    </p>
                    {obra.cliente_nome && (
                      <p
                        style={{
                          fontSize: "0.72rem",
                          color: "#6B7280",
                        }}
                      >
                        Cliente: {obra.cliente_nome}
                      </p>
                    )}
                    <p
                      style={{
                        fontSize: "0.7rem",
                        color: "#6B7280",
                        marginTop: 2,
                      }}
                    >
                      {obra.dias_restantes != null
                        ? `${obra.dias_restantes} dia(s) restantes`
                        : "Prazo em aberto"}
                      {obra.previsao_fim &&
                        ` • Previsão: ${new Date(
                          obra.previsao_fim
                        ).toLocaleDateString("pt-BR")}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* RODAPÉ / SAIR */}
        <div
          style={{
            marginTop: 14,
            textAlign: "center",
          }}
        >
          <Link
            href="/"
            style={{
              fontSize: "0.75rem",
              color: "#2563EB",
              textDecoration: "none",
            }}
          >
            ← Voltar para a tela inicial
          </Link>
        </div>
      </div>
    </main>
  );
}
