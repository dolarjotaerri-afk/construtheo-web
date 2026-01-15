"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

type Metrica = {
  id: number;
  chave: "clientes" | "profissionais" | "empresas" | "total";
  titulo: string;
  valor: string;
  detalhe: string;
  onlineAgora: number;
};

type Atividade = {
  id: number;
  tipo: "cliente" | "profissional" | "empresa" | "sistema";
  descricao: string;
  quando: string;
};

type Pendencia = {
  id: string; // id da tabela (uuid)
  tipo: "profissional" | "empresa";
  nome: string;
  detalhe: string;
};

type Alerta = {
  id: number;
  nivel: "baixa" | "media" | "alta";
  titulo: string;
  descricao: string;
};

// ---------- MOCKS (podem virar dados reais depois) ----------

const atividadesRecentes: Atividade[] = [
  {
    id: 1,
    tipo: "profissional",
    descricao: "Novo cadastro de profissional: João da Silva (vidraçaria)",
    quando: "há 5 min",
  },
  {
    id: 2,
    tipo: "empresa",
    descricao: "Empresa 'Depósito Central' criou 2 cupons de desconto",
    quando: "há 20 min",
  },
  {
    id: 3,
    tipo: "cliente",
    descricao: "Cliente avaliou profissional com nota 5,0 ★",
    quando: "há 35 min",
  },
  {
    id: 4,
    tipo: "sistema",
    descricao: "Nova calculadora gratuita publicada: Calcular vidros",
    quando: "há 2 h",
  },
];

const alertasSeguranca: Alerta[] = [
  {
    id: 1,
    nivel: "alta",
    titulo: "2 denúncias não revisadas",
    descricao:
      "Existem 2 denúncias de clientes sobre profissionais aguardando análise.",
  },
  {
    id: 2,
    nivel: "media",
    titulo: "Documentos pendentes",
    descricao:
      "5 empresas enviaram documentos para verificação nesta semana.",
  },
  {
    id: 3,
    nivel: "baixa",
    titulo: "Feedbacks recentes",
    descricao:
      "Novos comentários positivos em profissionais verificados neste mês.",
  },
];

// ---------- Função auxiliar para scroll dos carrosséis ----------

const scrollCarrossel = (
  ref: React.MutableRefObject<HTMLDivElement | null>,
  direction: "left" | "right"
) => {
  const el = ref.current;
  if (!el) return;
  const largura = el.clientWidth * 0.8;
  el.scrollBy({
    left: direction === "right" ? largura : -largura,
    behavior: "smooth",
  });
};

export default function PainelAdminPage() {
  const router = useRouter();

  const atividadesRef = useRef<HTMLDivElement | null>(null);
  const pendenciasRef = useRef<HTMLDivElement | null>(null);

  const [pendencias, setPendencias] = useState<Pendencia[]>([]);
  const [carregandoPendencias, setCarregandoPendencias] =
    useState(false);

  const [verificandoAdmin, setVerificandoAdmin] = useState(true);
    // métricas reais
  const [metricasResumo, setMetricasResumo] = useState<Metrica[]>([]);
  const [carregandoMetricas, setCarregandoMetricas] = useState(true);


  // --------- Verifica se usuário é ADMIN ---------
  useEffect(() => {
    const verificarAdmin = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        // não logado → manda pro login do admin
        router.push("/admin/login");
        return;
      }

      const role = (data.user.app_metadata as any)?.role;

      if (role !== "admin") {
        // logado mas não é admin → faz logout e manda pro login normal
        await supabase.auth.signOut();
        router.push("/login");
        return;
      }

      setVerificandoAdmin(false);
    };

    verificarAdmin();
  }, [router]);
  // --------- Carrega MÉTRICAS reais (clientes, profissionais, empresas) ---------
  useEffect(() => {
    if (verificandoAdmin) return;

    const carregarMetricas = async () => {
      setCarregandoMetricas(true);
      try {
        // Conta clientes
        const { count: clientesCount, error: erroClientes } = await supabase
          .from("clientes")
          .select("*", { count: "exact", head: true });

        if (erroClientes) {
          console.error("Erro ao contar clientes:", erroClientes);
        }

        // Conta profissionais
        const { count: profsCount, error: erroProfs } = await supabase
          .from("profissionais")
          .select("*", { count: "exact", head: true });

        if (erroProfs) {
          console.error("Erro ao contar profissionais:", erroProfs);
        }

        // Conta empresas
        const { count: empsCount, error: erroEmps } = await supabase
          .from("empresas")
          .select("*", { count: "exact", head: true });

        if (erroEmps) {
          console.error("Erro ao contar empresas:", erroEmps);
        }

        const totalClientes = clientesCount ?? 0;
        const totalProfissionais = profsCount ?? 0;
        const totalEmpresas = empsCount ?? 0;
        const totalUsuarios =
          totalClientes + totalProfissionais + totalEmpresas;

        // Por enquanto, onlineAgora = 0 (depois conectamos na tabela de online)
        const metricas: Metrica[] = [
          {
            id: 1,
            chave: "clientes",
            titulo: "Clientes cadastrados",
            valor: totalClientes.toLocaleString("pt-BR"),
            detalhe: "pessoas organizando sua obra",
            onlineAgora: 0,
          },
          {
            id: 2,
            chave: "profissionais",
            titulo: "Profissionais cadastrados",
            valor: totalProfissionais.toLocaleString("pt-BR"),
            detalhe: "prestando serviços pela plataforma",
            onlineAgora: 0,
          },
          {
            id: 3,
            chave: "empresas",
            titulo: "Empresas cadastradas",
            valor: totalEmpresas.toLocaleString("pt-BR"),
            detalhe: "fornecedores e parceiros ativos",
            onlineAgora: 0,
          },
          {
            id: 4,
            chave: "total",
            titulo: "Total de usuários",
            valor: totalUsuarios.toLocaleString("pt-BR"),
            detalhe: "somando clientes, profissionais e empresas",
            onlineAgora: 0,
          },
        ];

        setMetricasResumo(metricas);
      } catch (err) {
        console.error("Erro geral ao carregar métricas:", err);
      } finally {
        setCarregandoMetricas(false);
      }
    };

    carregarMetricas();
  }, [verificandoAdmin]);

  // --------- Carrega pendências reais do Supabase ---------
  useEffect(() => {
    if (verificandoAdmin) return;

    const carregarPendencias = async () => {
      setCarregandoPendencias(true);
      try {
        // PROFISSIONAIS pendentes
        const { data: profs, error: erroProfs } = await supabase
          .from("profissionais")
          .select("id, nome, area, funcao, localizacao, whatsapp, status")
          .eq("status", "pendente")
          .limit(50);

        if (erroProfs) {
          console.error("Erro ao buscar profissionais pendentes:", erroProfs);
        }

        const pendProfs: Pendencia[] =
          (profs || []).map((p: any) => ({
            id: p.id,
            tipo: "profissional",
            nome: p.nome || "Profissional sem nome",
            detalhe: [
              p.funcao,
              p.area,
              p.localizacao,
              p.whatsapp && `WhatsApp: ${p.whatsapp}`,
            ]
              .filter(Boolean)
              .join(" • "),
          })) ?? [];

        // EMPRESAS pendentes
        const { data: emps, error: erroEmps } = await supabase
          .from("empresas")
          .select("id, nome, tipo, localizacao, whatsapp, status")
          .eq("status", "pendente")
          .limit(50);

        if (erroEmps) {
          console.error("Erro ao buscar empresas pendentes:", erroEmps);
        }

        const pendEmps: Pendencia[] =
          (emps || []).map((e: any) => ({
            id: e.id,
            tipo: "empresa",
            nome: e.nome || "Empresa sem nome",
            detalhe: [
              e.tipo,
              e.localizacao,
              e.whatsapp && `WhatsApp: ${e.whatsapp}`,
            ]
              .filter(Boolean)
              .join(" • "),
          })) ?? [];

        setPendencias([...pendProfs, ...pendEmps]);
      } catch (err) {
        console.error("Erro geral ao carregar pendências:", err);
      } finally {
        setCarregandoPendencias(false);
      }
    };

    carregarPendencias();
  }, [verificandoAdmin]);

  // Atualiza status (aprovar/bloquear)
  const atualizarStatusPendencia = async (
    pendencia: Pendencia,
    novoStatus: "aprovado" | "bloqueado"
  ) => {
    const tabela =
      pendencia.tipo === "profissional" ? "profissionais" : "empresas";

    const { error } = await supabase
      .from(tabela)
      .update({ status: novoStatus })
      .eq("id", pendencia.id);

    if (error) {
      console.error("Erro ao atualizar status:", error);
      alert("Não foi possível atualizar. Tente novamente.");
      return;
    }

    // remove da lista local
    setPendencias((prev) => prev.filter((p) => p.id !== pendencia.id));
  };

  // Enquanto verifica se é admin
  if (verificandoAdmin) {
    return (
      <main
        style={{
          width: "100%",
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#F9FAFB",
        }}
      >
        <p
          style={{
            fontSize: "0.9rem",
            color: "#6B7280",
          }}
        >
          Verificando permissões do administrador...
        </p>
      </main>
    );
  }

  return (
    <main
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        padding: "32px 0",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "440px",
          background: "#FFFFFF",
          borderRadius: "28px",
          padding: "24px 22px 26px",
          boxShadow: "0 4px 18px rgba(0,0,0,0.08)",
          display: "flex",
          flexDirection: "column",
          gap: "18px",
        }}
      >
        {/* TOPO / SAUDAÇÃO */}
        <header
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Link
              href="/login"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "5px 12px",
                borderRadius: "999px",
                border: "1px solid #E5E7EB",
                background: "#FFFFFF",
                fontSize: "0.78rem",
                fontWeight: 500,
                color: "#2563EB",
                textDecoration: "none",
              }}
            >
              ← Voltar para escolha de acesso
            </Link>

            <span
              style={{
                fontSize: "0.75rem",
                padding: "4px 8px",
                borderRadius: "999px",
                background: "#FEF2F2",
                color: "#B91C1C",
                fontWeight: 600,
              }}
            >
              Painel do administrador
            </span>
          </div>

          <div>
            <p
              style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                letterSpacing: "0.12em",
                color: "#2563EB",
                marginBottom: "4px",
              }}
            >
              CONSTRUTHÉO • CONTROLE GERAL
            </p>

            <h1
              style={{
                fontSize: "1.35rem",
                fontWeight: 700,
                color: "#111827",
                lineHeight: 1.3,
              }}
            >
              Olá, administrador 👋
            </h1>

            <p
              style={{
                fontSize: "0.86rem",
                color: "#4B5563",
                marginTop: "4px",
              }}
            >
              Aqui você acompanha tudo que acontece na plataforma e garante a
              segurança de clientes, profissionais e empresas.
            </p>
          </div>
        </header>

        {/* VER COMO OUTRO TIPO DE USUÁRIO */}
        <section
          style={{
            padding: "10px 12px",
            borderRadius: "18px",
            background: "#F1F5F9",
          }}
        >
          <p
            style={{
              fontSize: "0.8rem",
              color: "#6B7280",
              marginBottom: "6px",
            }}
          >
            Ver plataforma como:
          </p>
          <div
            style={{
              display: "flex",
              gap: "8px",
              flexWrap: "wrap",
            }}
          >
            <Link
              href="/painel/cliente"
              style={{ textDecoration: "none", flex: 1, minWidth: "48%" }}
            >
              <div
                style={{
                  padding: "8px 10px",
                  borderRadius: "999px",
                  background: "#FFFFFF",
                  border: "1px solid #E5E7EB",
                  fontSize: "0.8rem",
                  color: "#111827",
                  textAlign: "center",
                }}
              >
                👤 Painel do cliente
              </div>
            </Link>

            <Link
              href="/painel/profissional"
              style={{ textDecoration: "none", flex: 1, minWidth: "48%" }}
            >
              <div
                style={{
                  padding: "8px 10px",
                  borderRadius: "999px",
                  background: "#FFFFFF",
                  border: "1px solid #E5E7EB",
                  fontSize: "0.8rem",
                  color: "#111827",
                  textAlign: "center",
                }}
              >
                🧰 Painel do profissional
              </div>
            </Link>

            <Link
              href="/painel/empresa"
              style={{ textDecoration: "none", flex: 1, minWidth: "48%" }}
            >
              <div
                style={{
                  padding: "8px 10px",
                  borderRadius: "999px",
                  background: "#FFFFFF",
                  border: "1px solid #E5E7EB",
                  fontSize: "0.8rem",
                  color: "#111827",
                  textAlign: "center",
                }}
              >
                🏢 Painel da empresa
              </div>
            </Link>
          </div>
        </section>

        {/* RESUMO RÁPIDO */}
        {/* RESUMO RÁPIDO */}
        <section>
          <h2
            style={{
              fontSize: "0.9rem",
              fontWeight: 700,
              color: "#0F172A",
              marginBottom: "6px",
            }}
          >
            Visão geral da plataforma
          </h2>

          {carregandoMetricas && (
            <p
              style={{
                fontSize: "0.8rem",
                color: "#6B7280",
              }}
            >
              Carregando métricas...
            </p>
          )}

          {!carregandoMetricas && metricasResumo.length === 0 && (
            <p
              style={{
                fontSize: "0.8rem",
                color: "#6B7280",
              }}
            >
              Não foi possível carregar as métricas agora.
            </p>
          )}

          {!carregandoMetricas && metricasResumo.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: "8px",
              }}
            >
              {metricasResumo.map((m) => (
                <div
                  key={m.id}
                  style={{
                    padding: "10px 10px",
                    borderRadius: "16px",
                    background: "#F9FAFB",
                    border: "1px solid #E5E7EB",
                    display: "flex",
                    flexDirection: "column",
                    gap: "2px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.76rem",
                      color: "#6B7280",
                    }}
                  >
                    {m.titulo}
                  </span>
                  <span
                    style={{
                      fontSize: "1rem",
                      fontWeight: 700,
                      color: "#111827",
                    }}
                  >
                    {m.valor}
                  </span>
                  <span
                    style={{
                      fontSize: "0.7rem",
                      color: "#9CA3AF",
                    }}
                  >
                    {m.detalhe}
                  </span>
                  <span
                    style={{
                      marginTop: "4px",
                      fontSize: "0.7rem",
                      color: "#16A34A",
                      fontWeight: 600,
                    }}
                  >
                    online agora: {m.onlineAgora.toLocaleString("pt-BR")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ATIVIDADES RECENTES */}
        <section
          style={{
            padding: "10px 10px 12px",
            borderRadius: "18px",
            background: "linear-gradient(135deg, #EEF2FF, #E0F2FE)",
            border: "1px solid #E0ECFF",
          }}
        >
          <div
            style={{
              marginBottom: "6px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h2
              style={{
                fontSize: "0.9rem",
                fontWeight: 700,
                color: "#111827",
              }}
            >
              Atividades recentes
            </h2>
            <span
              style={{
                fontSize: "0.75rem",
                color: "#6B7280",
              }}
            >
              timeline em tempo real
            </span>
          </div>

          <div
            ref={atividadesRef}
            className="carrossel-admin"
            style={{
              display: "flex",
              overflowX: "auto",
              gap: "10px",
              paddingBottom: "4px",
              scrollbarWidth: "none",
            }}
          >
            {atividadesRecentes.map((a) => (
              <div
                key={a.id}
                style={{
                  minWidth: "78%",
                  maxWidth: "78%",
                  borderRadius: "16px",
                  background: "#FFFFFF",
                  border: "1px solid #E5E7EB",
                  padding: "10px 10px 12px",
                  boxShadow: "0 1px 4px rgba(15,23,42,0.05)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                }}
              >
                <span
                  style={{
                    fontSize: "0.7rem",
                    padding: "2px 7px",
                    borderRadius: "999px",
                    alignSelf: "flex-start",
                    background: "#EFF6FF",
                    color: "#1D4ED8",
                    fontWeight: 600,
                    textTransform: "uppercase",
                  }}
                >
                  {a.tipo}
                </span>
                <p
                  style={{
                    fontSize: "0.78rem",
                    color: "#111827",
                  }}
                >
                  {a.descricao}
                </p>
                <span
                  style={{
                    fontSize: "0.72rem",
                    color: "#9CA3AF",
                  }}
                >
                  {a.quando}
                </span>
              </div>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "12px",
              marginTop: "4px",
            }}
          >
            <button
              type="button"
              onClick={() => scrollCarrossel(atividadesRef, "left")}
              style={{
                border: "none",
                background: "transparent",
                fontSize: "1rem",
                cursor: "pointer",
                color: "#9CA3AF",
              }}
            >
              ◀
            </button>
            <span
              style={{
                fontSize: "0.72rem",
                color: "#6B7280",
              }}
            >
              Arraste para o lado para ver mais eventos
            </span>
            <button
              type="button"
              onClick={() => scrollCarrossel(atividadesRef, "right")}
              style={{
                border: "none",
                background: "transparent",
                fontSize: "1rem",
                cursor: "pointer",
                color: "#9CA3AF",
              }}
            >
              ▶
            </button>
          </div>
        </section>

        {/* PENDÊNCIAS / SEGURANÇA */}
        <section
          style={{
            padding: "10px 10px 12px",
            borderRadius: "18px",
            background: "linear-gradient(135deg, #FEF2F2, #FEE2E2)",
            border: "1px solid #FECACA",
          }}
        >
          <div
            style={{
              marginBottom: "6px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h2
              style={{
                fontSize: "0.9rem",
                fontWeight: 700,
                color: "#7F1D1D",
              }}
            >
              Verificações e segurança
            </h2>
            <Link
              href="/admin/seguranca"
              style={{
                fontSize: "0.75rem",
                color: "#B91C1C",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              Abrir painel completo →
            </Link>
          </div>

          {/* Alertas resumidos */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              marginBottom: "8px",
            }}
          >
            {alertasSeguranca.map((al) => {
              const cor =
                al.nivel === "alta"
                  ? "#B91C1C"
                  : al.nivel === "media"
                  ? "#C2410C"
                  : "#6B7280";
              const bg =
                al.nivel === "alta"
                  ? "#FEE2E2"
                  : al.nivel === "media"
                  ? "#FFF7ED"
                  : "#F3F4F6";

              return (
                <div
                  key={al.id}
                  style={{
                    padding: "6px 8px",
                    borderRadius: "12px",
                    background: bg,
                  }}
                >
                  <p
                    style={{
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      color: cor,
                    }}
                  >
                    {al.titulo}
                  </p>
                  <p
                    style={{
                      fontSize: "0.74rem",
                      color: "#4B5563",
                    }}
                  >
                    {al.descricao}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Carrossel de pendências (reais) */}
          <div
            ref={pendenciasRef}
            className="carrossel-admin"
            style={{
              display: "flex",
              overflowX: "auto",
              gap: "10px",
              paddingBottom: "4px",
              scrollbarWidth: "none",
            }}
          >
            {carregandoPendencias && pendencias.length === 0 && (
              <div
                style={{
                  fontSize: "0.8rem",
                  color: "#7F1D1D",
                }}
              >
                Carregando pendências...
              </div>
            )}

            {!carregandoPendencias && pendencias.length === 0 && (
              <div
                style={{
                  fontSize: "0.8rem",
                  color: "#7F1D1D",
                }}
              >
                Nenhum cadastro pendente no momento 🎉
              </div>
            )}

            {pendencias.map((p) => (
              <div
                key={p.id}
                style={{
                  minWidth: "78%",
                  maxWidth: "78%",
                  borderRadius: "16px",
                  background: "#FFFFFF",
                  border: "1px solid #FCA5A5",
                  padding: "10px 10px 12px",
                  boxShadow: "0 1px 4px rgba(127, 29, 29, 0.12)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                }}
              >
                <span
                  style={{
                    fontSize: "0.72rem",
                    padding: "2px 7px",
                    borderRadius: "999px",
                    alignSelf: "flex-start",
                    background: "#FEF2F2",
                    color: "#B91C1C",
                    fontWeight: 600,
                  }}
                >
                  {p.tipo === "profissional" ? "Profissional" : "Empresa"}
                </span>

                <p
                  style={{
                    fontSize: "0.86rem",
                    fontWeight: 600,
                    color: "#111827",
                  }}
                >
                  {p.nome}
                </p>
                <p
                  style={{
                    fontSize: "0.76rem",
                    color: "#4B5563",
                  }}
                >
                  {p.detalhe}
                </p>

                <div
                  style={{
                    display: "flex",
                    gap: "6px",
                    marginTop: "6px",
                  }}
                >
                  <button
                    type="button"
                    onClick={() =>
                      atualizarStatusPendencia(p, "aprovado")
                    }
                    style={{
                      flex: 1,
                      padding: "5px 0",
                      borderRadius: "999px",
                      border: "none",
                      fontSize: "0.76rem",
                      fontWeight: 600,
                      background: "#16A34A",
                      color: "#FFFFFF",
                      cursor: "pointer",
                    }}
                  >
                    Aprovar
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      atualizarStatusPendencia(p, "bloqueado")
                    }
                    style={{
                      flex: 1,
                      padding: "5px 0",
                      borderRadius: "999px",
                      border: "none",
                      fontSize: "0.76rem",
                      fontWeight: 600,
                      background: "#DC2626",
                      color: "#FFFFFF",
                      cursor: "pointer",
                    }}
                  >
                    Bloquear
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "12px",
              marginTop: "4px",
            }}
          >
            <button
              type="button"
              onClick={() => scrollCarrossel(pendenciasRef, "left")}
              style={{
                border: "none",
                background: "transparent",
                fontSize: "1rem",
                cursor: "pointer",
                color: "#9CA3AF",
              }}
            >
              ◀
            </button>
            <span
              style={{
                fontSize: "0.72rem",
                color: "#6B7280",
              }}
            >
              Revise e aprove cadastros sensíveis
            </span>
            <button
              type="button"
              onClick={() => scrollCarrossel(pendenciasRef, "right")}
              style={{
                border: "none",
                background: "transparent",
                fontSize: "1rem",
                cursor: "pointer",
                color: "#9CA3AF",
              }}
            >
              ▶
            </button>
          </div>
        </section>

        {/* LINKS ADMIN / CONFIGURAÇÕES GERAIS */}
        <section>
          <h2
            style={{
              fontSize: "0.9rem",
              fontWeight: 700,
              color: "#0F172A",
              marginBottom: "6px",
            }}
          >
            Ferramentas do administrador
          </h2>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <Link href="/admin/usuarios" style={{ textDecoration: "none" }}>
              <div
                style={{
                  padding: "10px 12px",
                  borderRadius: "999px",
                  background: "#F9FAFB",
                  border: "1px solid #E5E7EB",
                  fontSize: "0.82rem",
                  color: "#111827",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>
                  Gerenciar usuários (clientes, profissionais, empresas)
                </span>
                <span>→</span>
              </div>
            </Link>

<Link href="/admin/denuncias" style={{ textDecoration: "none" }}>
  <div
    style={{
      padding: "10px 12px",
      borderRadius: "999px",
      background: "#F9FAFB",
      border: "1px solid #E5E7EB",
      fontSize: "0.82rem",
      color: "#111827",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    }}
  >
    <span>Denúncias, bloqueios e histórico de segurança</span>
    <span>→</span>
  </div>
</Link>

            <Link
              href="/admin/calculadoras"
              style={{ textDecoration: "none" }}
            >
              <div
                style={{
                  padding: "10px 12px",
                  borderRadius: "999px",
                  background: "#F9FAFB",
                  border: "1px solid #E5E7EB",
                  fontSize: "0.82rem",
                  color: "#111827",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>Configurar calculadoras (grátis e Pro)</span>
                <span>→</span>
              </div>
            </Link>

            <Link
              href="/admin/relatorios"
              style={{ textDecoration: "none" }}
            >
              <div
                style={{
                  padding: "10px 12px",
                  borderRadius: "999px",
                  background: "#F9FAFB",
                  border: "1px solid #E5E7EB",
                  fontSize: "0.82rem",
                  color: "#111827",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>Relatórios e desempenho da plataforma</span>
                <span>→</span>
              </div>
            </Link>
          </div>
        </section>

        {/* CSS pra esconder scrollbar dos carrosséis */}
        <style>
          {`
            .carrossel-admin::-webkit-scrollbar {
              display: none;
            }
          `}
        </style>
      </div>
    </main>
  );
}
