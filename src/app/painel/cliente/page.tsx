"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "../../../lib/supabaseClient";

type ClienteResumo = {
  id: string;
  nome: string;
  apelido?: string | null;
  email: string;
  whatsapp?: string;
  cep?: string;
  cidade?: string;
  estado?: string;
  bairro?: string;
  aceita_ofertas_whatsapp?: boolean;
};

type Empresa = {
  id: string;
  nome: string;
  tipo?: string | null;
  cidade?: string | null;
  estado?: string | null;
  bairro?: string | null;
};

type Profissional = {
  id: string;
  nome: string;
  apelido?: string | null;
  funcao?: string | null;
  cidade?: string | null;
  estado?: string | null;
  bairro?: string | null;
};

export default function PainelClientePage() {
  const [cliente, setCliente] = useState<ClienteResumo | null>(null);
  const [carregandoCliente, setCarregandoCliente] = useState(true);

  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [carregandoEmpresas, setCarregandoEmpresas] = useState(false);

  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [carregandoProfissionais, setCarregandoProfissionais] =
    useState(false);

  // ---------- CLIENTE LOCAL ----------
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const salvo = localStorage.getItem("construtheo_cliente_atual");
      if (salvo) {
        const parsed: ClienteResumo = JSON.parse(salvo);
        setCliente(parsed);
      }
    } catch (err) {
      console.error("Erro ao ler cliente do localStorage:", err);
    } finally {
      setCarregandoCliente(false);
    }
  }, []);

  function formatarCep(cep?: string) {
    if (!cep) return "";
    const somenteDigitos = cep.replace(/\D/g, "");
    if (somenteDigitos.length !== 8) return somenteDigitos;
    return somenteDigitos.replace(/^(\d{5})(\d{3})$/, "$1-$2");
  }

  const cepFormatado = formatarCep(cliente?.cep);

  const nomeExibicao =
    cliente?.apelido && cliente.apelido.trim().length > 0
      ? cliente.apelido
      : cliente?.nome || "Cliente";

  const localLabel =
    cliente?.cidade && cliente?.estado
      ? `${cliente.cidade} - ${cliente.estado}`
      : "Localização não informada";

  // ---------- CARREGAR EMPRESAS / PROFISSIONAIS REAIS ----------
  useEffect(() => {
    async function carregarEmpresas() {
      if (!cliente?.cidade || !cliente?.estado) return;
      setCarregandoEmpresas(true);

      const { data, error } = await supabase
        .from("empresas")
        .select("id, nome, tipo, cidade, estado, bairro")
        .eq("cidade", cliente.cidade)
        .eq("estado", cliente.estado)
        .order("nome", { ascending: true });

      if (error) {
        console.error("Erro ao carregar empresas:", error);
        setEmpresas([]);
      } else {
        setEmpresas(data ?? []);
      }

      setCarregandoEmpresas(false);
    }

    async function carregarProfissionais() {
      if (!cliente?.cidade || !cliente?.estado) return;
      setCarregandoProfissionais(true);

      const { data, error } = await supabase
        .from("profissionais")
        .select("id, nome, apelido, funcao, cidade, estado, bairro")
        .eq("cidade", cliente.cidade)
        .eq("estado", cliente.estado)
        .order("nome", { ascending: true });

      if (error) {
        console.error("Erro ao carregar profissionais:", error);
        setProfissionais([]);
      } else {
        setProfissionais(data ?? []);
      }

      setCarregandoProfissionais(false);
    }

    if (cliente) {
      carregarEmpresas();
      carregarProfissionais();
    }
  }, [cliente?.cidade, cliente?.estado, cliente?.id]);

  // ---------- LAYOUT ----------
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#F5F5F7",
        boxSizing: "border-box",
        overflowX: "hidden", // evita scroll horizontal/zoom estranho
        width: "100%",
        maxWidth: "100%",
        position: "relative",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          margin: "0 auto",
          padding: "24px 16px 40px", // padding vem pro container, não pro body inteiro
          boxSizing: "border-box",
        }}
      >
        {/* TOPO */}
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 24,
          }}
        >
          <div>
            <p
              style={{
                fontSize: "0.9rem",
                color: "#9CA3AF",
                marginBottom: 2,
              }}
            >
              Olá,
            </p>
            <h1
              style={{
                fontSize: "1.6rem",
                fontWeight: 700,
                color: "#111827",
                margin: 0,
              }}
            >
              {nomeExibicao}
            </h1>
            <p
              style={{
                marginTop: 6,
                fontSize: "0.85rem",
                color: "#6B7280",
                maxWidth: 260,
              }}
            >
              Bem-vindo ao seu painel de obra no Construthéo.
            </p>
          </div>

          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "999px",
              background: "#E0F2FE",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Image
              src="/mascote-pedreiro.png"
              alt="Mascote ConstruThéo"
              width={40}
              height={40}
            />
          </div>
        </header>

        {/* CARTÃO DADOS / LOCALIZAÇÃO */}
        <section
          style={{
            background: "#FFFFFF",
            borderRadius: 24,
            padding: 18,
            boxShadow: "0 8px 24px rgba(15,23,42,0.08)",
            marginBottom: 20,
            maxWidth: "100%",
            boxSizing: "border-box",
          }}
        >
          {carregandoCliente && (
            <p
              style={{
                fontSize: "0.85rem",
                color: "#6B7280",
              }}
            >
              Carregando seus dados...
            </p>
          )}

          {!carregandoCliente && !cliente && (
            <p
              style={{
                fontSize: "0.85rem",
                color: "#B91C1C",
              }}
            >
              Não encontramos seus dados. Faça login novamente.
            </p>
          )}

          {cliente && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
                fontSize: "0.9rem",
                color: "#111827",
              }}
            >
              <div>
                <span style={{ fontWeight: 600 }}>Localização: </span>
                <span>{localLabel}</span>
              </div>

              {cliente.whatsapp && (
                <div>
                  <span style={{ fontWeight: 600 }}>WhatsApp: </span>
                  <span>{cliente.whatsapp}</span>
                </div>
              )}

              <div>
                <span style={{ fontWeight: 600 }}>E-mail: </span>
                <span>{cliente.email}</span>
              </div>

              {cepFormatado && (
                <div>
                  <span style={{ fontWeight: 600 }}>CEP: </span>
                  <span>{cepFormatado}</span>
                </div>
              )}
            </div>
          )}
        </section>

        {/* CARTÃO AZUL – CÁLCULOS */}
        <Link
          href="/painel/calculos"
          style={{
            display: "block",
            textDecoration: "none",
            marginBottom: 24,
          }}
        >
          <section
            style={{
              background: "#0284C7",
              borderRadius: 24,
              padding: 18,
              boxShadow: "0 10px 30px rgba(37,99,235,0.35)",
              color: "#FFFFFF",
              maxWidth: "100%",
              boxSizing: "border-box",
            }}
          >
            <h2
              style={{
                fontSize: "1.05rem",
                fontWeight: 700,
                marginBottom: 4,
              }}
            >
              Cálculos para sua obra
            </h2>
            <p
              style={{
                fontSize: "0.9rem",
                opacity: 0.95,
              }}
            >
              Calcule concreto, blocos, cimento e outros materiais com mais
              precisão.
            </p>
          </section>
        </Link>

        {/* MELHORES EMPRESAS */}
        <section style={{ marginBottom: 24 }}>
          <h2
            style={{
              fontSize: "1rem",
              fontWeight: 700,
              color: "#111827",
              marginBottom: 12,
            }}
          >
            Melhores empresas que atendem sua região
          </h2>

          {carregandoEmpresas && (
            <p
              style={{
                fontSize: "0.85rem",
                color: "#6B7280",
              }}
            >
              Buscando empresas próximas...
            </p>
          )}

          {!carregandoEmpresas && empresas.length === 0 && (
            <p
              style={{
                fontSize: "0.85rem",
                color: "#6B7280",
              }}
            >
              Ainda não há empresas cadastradas em {localLabel}.
            </p>
          )}

          {empresas.length > 0 && (
            <div
              style={{
                display: "flex",
                gap: 12,
                overflowX: "auto",
                paddingBottom: 4,
              }}
            >
              {empresas.map((empresa) => (
                <div
                  key={empresa.id}
                  style={{
                    minWidth: 190,
                    maxWidth: 220,
                    background: "#FFFFFF",
                    borderRadius: 20,
                    padding: 12,
                    boxShadow: "0 6px 18px rgba(15,23,42,0.06)",
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      background: "#E5E7EB",
                      borderRadius: 16,
                      height: 80,
                      marginBottom: 10,
                    }}
                  />

                  <h3
                    style={{
                      fontSize: "0.95rem",
                      fontWeight: 600,
                      color: "#111827",
                      marginBottom: 2,
                    }}
                  >
                    {empresa.nome}
                  </h3>
                  <p
                    style={{
                      fontSize: "0.8rem",
                      color: "#6B7280",
                      marginBottom: 4,
                    }}
                  >
                    {empresa.tipo || "Empresa da construção"}
                  </p>
                  <p
                    style={{
                      fontSize: "0.8rem",
                      color: "#6B7280",
                      marginBottom: 8,
                    }}
                  >
                    {empresa.cidade} - {empresa.estado}
                    {empresa.bairro ? ` (${empresa.bairro})` : ""}
                  </p>

                  <Link
                    href={`/painel/empresa?id=${empresa.id}`}
                    style={{
                      fontSize: "0.8rem",
                      color: "#2563EB",
                      fontWeight: 600,
                      textDecoration: "none",
                    }}
                  >
                    Ver ofertas →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* PROFISSIONAIS */}
        <section style={{ marginBottom: 24 }}>
          <h2
            style={{
              fontSize: "1rem",
              fontWeight: 700,
              color: "#111827",
              marginBottom: 10,
            }}
          >
            Contrate um profissional que atende na sua região
          </h2>

          {carregandoProfissionais && (
            <p
              style={{
                fontSize: "0.85rem",
                color: "#6B7280",
              }}
            >
              Buscando profissionais próximos...
            </p>
          )}

          {!carregandoProfissionais && profissionais.length === 0 && (
            <div
              style={{
                borderRadius: 18,
                border: "1px dashed #D1D5DB",
                background: "#F9FAFB",
                padding: 12,
                fontSize: "0.85rem",
                color: "#6B7280",
                marginBottom: 16,
              }}
            >
              Ainda não há profissionais cadastrados em {localLabel}.
            </div>
          )}

          {profissionais.length > 0 && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                marginBottom: 16,
              }}
            >
              {profissionais.map((prof) => (
                <div
                  key={prof.id}
                  style={{
                    background: "#FFFFFF",
                    borderRadius: 18,
                    padding: 12,
                    boxShadow: "0 4px 14px rgba(15,23,42,0.05)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <div>
                    <h3
                      style={{
                        fontSize: "0.95rem",
                        fontWeight: 600,
                        marginBottom: 2,
                        color: "#111827",
                      }}
                    >
                      {prof.apelido || prof.nome}
                    </h3>
                    <p
                      style={{
                        fontSize: "0.8rem",
                        color: "#6B7280",
                        marginBottom: 2,
                      }}
                    >
                      {prof.funcao || "Profissional da construção civil"}
                    </p>
                    <p
                      style={{
                        fontSize: "0.8rem",
                        color: "#6B7280",
                      }}
                    >
                      {prof.cidade} - {prof.estado}
                      {prof.bairro ? ` (${prof.bairro})` : ""}
                    </p>
                  </div>

                  <Link
                    href={`/painel/profissional?id=${prof.id}`}
                    style={{
                      fontSize: "0.8rem",
                      color: "#2563EB",
                      fontWeight: 600,
                      textDecoration: "none",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Ver perfil →
                  </Link>
                </div>
              ))}
            </div>
          )}

          {/* BOTÕES "QUERO CADASTRAR" */}
          <p
            style={{
              fontSize: "0.85rem",
              color: "#4B5563",
              marginBottom: 8,
            }}
          >
            Quero cadastrar:
          </p>

          <div
            style={{
              display: "flex",
              gap: 10,
            }}
          >
            {/* UMA EMPRESA -> formulário de cadastro de empresa/deposito */}
            <Link
              href="/cadastro/deposito"
              style={{
                flex: 1,
                borderRadius: 999,
                border: "1px solid #D1D5DB",
                padding: "8px 0",
                textAlign: "center",
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "#111827",
                textDecoration: "none",
                background: "#FFFFFF",
              }}
            >
              Uma Empresa
            </Link>

            {/* UM PROFISSIONAL -> formulário de cadastro de prestador */}
            <Link
              href="/cadastro/prestador"
              style={{
                flex: 1,
                borderRadius: 999,
                border: "1px solid #D1D5DB",
                padding: "8px 0",
                textAlign: "center",
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "#111827",
                textDecoration: "none",
                background: "#FFFFFF",
              }}
            >
              Um Profissional
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}