"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../../lib/supabaseClient";

type DemoCliente = {
  nome: string;
  apelido: string;
  email: string;
  whatsapp: string;
  localizacao: string;
  criadoEm: string;
  cidade?: string;
  estado?: string;
  bairro?: string;
};

type Profissional = {
  id: string;
  nome: string;
  apelido: string | null;
  whatsapp: string;
  email: string;
  area: string | null;
  funcao: string | null;
  experiencia: string | null;
  localizacao: string;
};

type EmpresaCard = {
  id: string;
  nome: string;
  tipo: string | null;
  detalhe_tipo: string | null;
  localizacao: string | null;
};

export default function PainelClientePage() {
  const [cliente, setCliente] = useState<DemoCliente | null>(null);

  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [carregandoProfissionais, setCarregandoProfissionais] =
    useState(false);

  const [empresas, setEmpresas] = useState<EmpresaCard[]>([]);
  const [carregandoEmpresas, setCarregandoEmpresas] = useState(false);

  // Carrega cliente do localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem("construtheo_demo_cliente");

    if (raw) {
      try {
        const parsed = JSON.parse(raw);

        const cidade = parsed.cidade || "Igaratá";
        const estado = parsed.estado || "SP";

        setCliente({
          nome: parsed.nome,
          apelido: parsed.apelido,
          email: parsed.email,
          whatsapp: parsed.whatsapp,
          localizacao: parsed.localizacao || `${cidade} - ${estado}`,
          criadoEm: parsed.criadoEm || new Date().toISOString(),
          cidade,
          estado,
          bairro: parsed.bairro,
        });
      } catch {
        setCliente({
          nome: "Cliente Demo",
          apelido: "Cliente Demo",
          email: "demo@construtheo.com",
          whatsapp: "(00) 00000-0000",
          localizacao: "Igaratá - SP",
          criadoEm: new Date().toISOString(),
        });
      }
    } else {
      // fallback DEMO
      setCliente({
        nome: "Cliente Demo",
        apelido: "Cliente Demo",
        email: "demo@construtheo.com",
        whatsapp: "(00) 00000-0000",
        localizacao: "Igaratá - SP",
        criadoEm: new Date().toISOString(),
      });
    }
  }, []);

  // Busca profissionais da mesma região (tabela "profissionais")
  useEffect(() => {
    async function carregarProfissionais() {
      if (!cliente?.localizacao) return;

      const localizacaoCliente = cliente.localizacao;

      setCarregandoProfissionais(true);
      try {
        const { data, error } = await supabase
          .from("profissionais")
          .select("*")
          .eq("localizacao", localizacaoCliente)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setProfissionais((data ?? []) as Profissional[]);
      } catch (err) {
        console.error("Erro ao buscar profissionais:", err);
      } finally {
        setCarregandoProfissionais(false);
      }
    }

    carregarProfissionais();
  }, [cliente?.localizacao]);

  // Busca empresas da mesma região (tabela "empresas")
  useEffect(() => {
    if (!cliente) return;

    const clienteAtual = cliente;

    async function carregarEmpresas() {
      setCarregandoEmpresas(true);

      const cidadeBase =
        clienteAtual.cidade ||
        (clienteAtual.localizacao
          ? clienteAtual.localizacao.split(" - ")[0]
          : "");

      const filtroLocal =
        typeof cidadeBase === "string" && cidadeBase.trim().length > 0
          ? cidadeBase.trim()
          : "";

      let query = supabase
        .from("empresas")
        .select("id, nome, tipo, detalhe_tipo, localizacao")
        .limit(10);

      if (filtroLocal) {
        query = query.ilike("localizacao", `%${filtroLocal}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Erro ao carregar empresas:", error.message);
        setEmpresas([]);
      } else {
        setEmpresas((data ?? []) as EmpresaCard[]);
      }

      setCarregandoEmpresas(false);
    }

    carregarEmpresas();
  }, [cliente]);

  const nomeMostrar = cliente?.apelido || cliente?.nome || "Cliente";

  return (
    <main
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        paddingTop: "40px",
        paddingBottom: "40px",
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
        }}
      >
        {/* HEADER */}
        <header
          style={{
            marginBottom: "18px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div>
            <p
              style={{
                fontSize: "0.8rem",
                color: "#6B7280",
                marginBottom: "2px",
              }}
            >
              Olá,
            </p>
            <h1
              style={{
                fontSize: "1.35rem",
                fontWeight: 700,
                color: "#111827",
                lineHeight: 1.2,
              }}
            >
              {nomeMostrar}
            </h1>
            <p
              style={{
                fontSize: "0.78rem",
                color: "#6B7280",
                marginTop: "2px",
              }}
            >
              Bem-vindo ao seu painel de obra no ConstruThéo.
            </p>
          </div>

          <div
            style={{
              padding: "8px 10px",
              borderRadius: "999px",
              background: "#EFF6FF",
              fontSize: "0.75rem",
              color: "#2563EB",
              fontWeight: 600,
            }}
          >
            Conta demo
          </div>
        </header>

        {/* INFO RESUMO */}
        <section
          style={{
            marginBottom: "18px",
            padding: "12px 14px",
            borderRadius: "16px",
            background: "#F9FAFB",
            border: "1px solid #E5E7EB",
            fontSize: "0.8rem",
            color: "#4B5563",
          }}
        >
          <p>
            <strong>Localização:</strong>{" "}
            {cliente?.localizacao || "Não informado"}
          </p>
          <p>
            <strong>WhatsApp:</strong> {cliente?.whatsapp}
          </p>
          <p>
            <strong>E-mail:</strong> {cliente?.email}
          </p>
        </section>

        {/* CARD PRINCIPAL: CÁLCULOS */}
        <section
          style={{
            marginTop: "10px",
            marginBottom: "26px",
          }}
        >
          <Link
            href="/painel/calculos"
            style={{
              display: "block",
              background: "linear-gradient(135deg, #0284C7, #0EA5E9)",
              padding: "20px 22px",
              borderRadius: "20px",
              color: "#FFFFFF",
              textDecoration: "none",
              boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
            }}
          >
            <h2
              style={{
                fontSize: "1.15rem",
                fontWeight: 700,
                marginBottom: "6px",
              }}
            >
              Cálculos para sua obra
            </h2>

            <p
              style={{
                fontSize: "0.85rem",
                opacity: 0.9,
              }}
            >
              Calcule concreto, blocos, cimento e outros materiais com mais
              precisão.
            </p>
          </Link>
        </section>

        {/* EMPRESAS DA REGIÃO (AGORA DINÂMICO) */}
        <section style={{ marginBottom: "22px" }}>
          <h2
            style={{
              fontSize: "1rem",
              fontWeight: 700,
              color: "#111827",
              marginBottom: "8px",
            }}
          >
            Melhores empresas que atendem sua região
          </h2>

          <div
            style={{
              display: "flex",
              overflowX: "auto",
              gap: "12px",
              paddingBottom: "6px",
            }}
          >
            {carregandoEmpresas ? (
              <div
                style={{
                  minWidth: "200px",
                  borderRadius: "16px",
                  border: "1px solid #E5E7EB",
                  background: "#F9FAFB",
                  padding: "12px",
                  fontSize: "0.8rem",
                  color: "#6B7280",
                }}
              >
                Carregando empresas próximas...
              </div>
            ) : empresas.length === 0 ? (
              <div
                style={{
                  minWidth: "220px",
                  borderRadius: "16px",
                  border: "1px dashed #CBD5E1",
                  background: "#F8FAFC",
                  padding: "12px",
                  fontSize: "0.8rem",
                  color: "#64748B",
                }}
              >
                Ainda não encontramos empresas cadastradas na sua região. Em
                breve, depósitos, usinas e outros parceiros vão aparecer aqui.
              </div>
            ) : (
              empresas.map((emp) => (
                <div
                  key={emp.id}
                  style={{
                    minWidth: "160px",
                    background: "#FFFFFF",
                    border: "1px solid #E5E7EB",
                    borderRadius: "16px",
                    padding: "12px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      height: "90px",
                      borderRadius: "12px",
                      background: "#E2E8F0",
                      marginBottom: "10px",
                    }}
                  ></div>

                  <p
                    style={{
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      marginBottom: "2px",
                      color: "#0F172A",
                    }}
                  >
                    {emp.nome}
                  </p>

                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: "#64748B",
                      marginBottom: "2px",
                    }}
                  >
                    {emp.tipo || emp.detalhe_tipo || "Empresa da construção"}
                  </p>

                  <p
                    style={{
                      fontSize: "0.72rem",
                      color: "#9CA3AF",
                      marginBottom: "4px",
                    }}
                  >
                    {emp.localizacao || "Região próxima"}
                  </p>

                  <Link
                    href={`/empresa/${emp.id}`}
                    style={{
                      marginTop: "6px",
                      display: "inline-block",
                      fontSize: "0.75rem",
                      color: "#2563EB",
                      fontWeight: 600,
                      textDecoration: "none",
                    }}
                  >
                    Ver ofertas →
                  </Link>
                </div>
              ))
            )}
          </div>
        </section>

        {/* PROFISSIONAIS DA REGIÃO */}
        <section style={{ marginBottom: "20px" }}>
          <h2
            style={{
              fontSize: "1rem",
              fontWeight: 700,
              color: "#111827",
              marginBottom: "8px",
            }}
          >
            Contrate um profissional que atende na sua região
          </h2>

          {carregandoProfissionais && (
            <p
              style={{
                fontSize: "0.8rem",
                color: "#6B7280",
              }}
            >
              Carregando profissionais da sua região...
            </p>
          )}

          {!carregandoProfissionais && profissionais.length === 0 && (
            <p
              style={{
                fontSize: "0.8rem",
                color: "#9CA3AF",
                border: "1px dashed #E5E7EB",
                padding: "10px 12px",
                borderRadius: "12px",
              }}
            >
              Ainda não há profissionais cadastrados em{" "}
              {cliente?.localizacao || "sua região"}.
            </p>
          )}

          {!carregandoProfissionais && profissionais.length > 0 && (
            <div
              style={{
                display: "flex",
                overflowX: "auto",
                gap: "12px",
                paddingBottom: "6px",
              }}
            >
              {profissionais.map((prof) => (
                <div
                  key={prof.id}
                  style={{
                    minWidth: "160px",
                    background: "#FFFFFF",
                    border: "1px solid #E5E7EB",
                    borderRadius: "16px",
                    padding: "12px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "999px",
                      background: "#DBEAFE",
                      marginBottom: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.3rem",
                    }}
                  >
                    👷‍♂️
                  </div>

                  <p
                    style={{
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      marginBottom: "2px",
                      color: "#0F172A",
                    }}
                  >
                    {prof.apelido || prof.nome}
                  </p>

                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: "#64748B",
                    }}
                  >
                    {prof.funcao || prof.area || "Profissional da construção"}
                  </p>

                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: "#64748B",
                    }}
                  >
                    {prof.localizacao}
                  </p>

                  <Link
                    href="#"
                    style={{
                      marginTop: "6px",
                      display: "inline-block",
                      fontSize: "0.75rem",
                      color: "#2563EB",
                      fontWeight: 600,
                      textDecoration: "none",
                    }}
                  >
                    Ver perfil →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* LINKS RÁPIDOS */}
        <section
          style={{
            marginTop: "8px",
            fontSize: "0.8rem",
            color: "#6B7280",
          }}
        >
          <p style={{ marginBottom: "8px", fontWeight: 500 }}>
            Próximos testes:
          </p>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
            }}
          >
            <Link
              href="/cadastro/empresa"
              style={{
                padding: "6px 10px",
                borderRadius: "999px",
                border: "1px solid #E5E7EB",
                background: "#F9FAFB",
                fontSize: "0.78rem",
                color: "#2563EB",
                textDecoration: "none",
              }}
            >
              Cadastrar empresa demo
            </Link>
            <Link
              href="/cadastro/profissional"
              style={{
                padding: "6px 10px",
                borderRadius: "999px",
                border: "1px solid #E5E7EB",
                background: "#F9FAFB",
                fontSize: "0.78rem",
                color: "#2563EB",
                textDecoration: "none",
              }}
            >
              Cadastrar profissional demo
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
