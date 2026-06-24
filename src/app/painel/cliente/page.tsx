"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "../../../lib/supabaseClient";
import {
  getFeaturedCompaniesByLocation,
  type FeaturedCompany,
} from "../../../lib/featuredCompanies";
import {
  getFeaturedProfessionalsByLocation,
  type FeaturedProfessional,
} from "../../../lib/featuredProfessionals";
import ProfessionalCoursesCarousel from "../../../components/ProfessionalCoursesCarousel";

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

export default function PainelClientePage() {
  const [cliente, setCliente] = useState<ClienteResumo | null>(null);
  const [carregandoCliente, setCarregandoCliente] = useState(true);

  const [empresaSelecionada, setEmpresaSelecionada] =
    useState<FeaturedCompany | null>(null);

  const [profissionalSelecionado, setProfissionalSelecionado] =
    useState<FeaturedProfessional | null>(null);

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

  const empresasDaRegiao = useMemo(() => {
    return getFeaturedCompaniesByLocation(cliente?.cidade, cliente?.estado);
  }, [cliente?.cidade, cliente?.estado]);

  const profissionaisDaRegiao = useMemo(() => {
    return getFeaturedProfessionalsByLocation(cliente?.cidade, cliente?.estado);
  }, [cliente?.cidade, cliente?.estado]);

  const budgetMessage = useMemo(
    () => encodeURIComponent("Olá vim através do Construthéo"),
    []
  );

  const profissionalMessage = useMemo(() => {
    const titulo = profissionalSelecionado?.title || "um profissional";

    return encodeURIComponent(
      `Olá, vim através do ConstruThéo e quero indicar ${titulo
        .replace("Indique ", "")
        .toLowerCase()}.`
    );
  }, [profissionalSelecionado]);

  return (
    <>
      <main
  style={{
    minHeight: "100vh",
    background: "linear-gradient(180deg, #cfe8ff, #3b82b8)",
    boxSizing: "border-box",
    overflowX: "hidden",
    width: "100%",
    maxWidth: "100%",
    position: "relative",
    padding: "20px 12px",
  }}
>
        <div
  style={{
    width: "100%",
    maxWidth: 480,
    margin: "0 auto",
    padding: "24px 16px 28px",
    boxSizing: "border-box",
    background: "#FFFFFF",
    borderRadius: 28,
    boxShadow: "0 22px 45px rgba(15, 23, 42, 0.22)",
    border: "1px solid rgba(255, 255, 255, 0.65)",
  }}
>
          {/* TOPO */}
<header
  style={{
    marginBottom: 22,
  }}
>
  <p
    style={{
      fontSize: "0.85rem",
      color: "#9CA3AF",
      marginBottom: 2,
    }}
  >
    Olá,
  </p>

  <h1
    style={{
      fontSize: "1.6rem",
      fontWeight: 800,
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
      maxWidth: 320,
      lineHeight: 1.4,
    }}
  >
    Bem-vindo ao seu painel de obra no ConstruThéo.
  </p>
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

          {/* MELHORES EMPRESAS SINCRONIZADAS */}
          <section style={sectionBlockStyle}>
            <div style={{ marginBottom: 12 }}>
              <p style={sectionLabelStyle}></p>

              <h2 style={sectionTitleStyle}>
                Melhores empresas que atendem sua região
              </h2>

              <p style={sectionTextStyle}>
                {cliente?.cidade && cliente?.estado
                  ? `Empresas em destaque para ${cliente.cidade} - ${cliente.estado}.`
                  : "Complete sua localização para ver empresas mais próximas."}
              </p>
            </div>

            <div style={carouselStyle}>
              {empresasDaRegiao.map((empresa) => (
                <button
                  key={empresa.name}
                  type="button"
                  onClick={() => setEmpresaSelecionada(empresa)}
                  style={companyCardStyle}
                >
                  <div style={logoCircleStyle}>
                    <Image
                      src={empresa.logo}
                      alt={empresa.name}
                      width={40}
                      height={40}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>

                  <p style={companyNameStyle}>{empresa.name}</p>

                  <p style={companyLocationStyle}>{empresa.location}</p>

                  <span style={premiumTagStyle}>{empresa.badge}</span>
                </button>
              ))}
            </div>
          </section>

          {/* PROFISSIONAIS SINCRONIZADOS */}
          <section style={sectionBlockStyle}>
            <div style={{ marginBottom: 12 }}>
              <p style={sectionLabelStyle}></p>

              <h2 style={sectionTitleStyle}>
                Profissionais que atendem sua região
              </h2>

              <p style={sectionTextStyle}>
                Indique bons profissionais para fortalecer a rede ConstruThéo na
                sua cidade.
              </p>
            </div>

            <div style={carouselStyle}>
              {profissionaisDaRegiao.map((item) => (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => setProfissionalSelecionado(item)}
                  style={professionalCardStyle}
                >
                  <p style={professionalTitleStyle}>{item.title}</p>

                  <p style={professionalTextStyle}>{item.subtitle}</p>

                  <span style={blueTagStyle}>{item.tag}</span>
                </button>
              ))}
            </div>
          </section>

          {/* CURSOS PROFISSIONALIZANTES REUTILIZÁVEL */}
          <ProfessionalCoursesCarousel />

          {/* BOTÕES "QUERO CADASTRAR" */}
          <section style={{ marginBottom: 24 }}>
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

      {empresaSelecionada && (
        <div
          onClick={() => setEmpresaSelecionada(null)}
          style={modalOverlayStyle}
        >
          <div onClick={(e) => e.stopPropagation()} style={modalCardStyle}>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginBottom: 8,
              }}
            >
              <button
                type="button"
                onClick={() => setEmpresaSelecionada(null)}
                style={closeButtonStyle}
              >
                ×
              </button>
            </div>

            <div style={modalLogoStyle}>
              <Image
                src={empresaSelecionada.logo}
                alt={empresaSelecionada.name}
                width={74}
                height={74}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </div>

            <h2 style={modalTitleStyle}>{empresaSelecionada.name}</h2>

            <p style={modalCategoryStyle}>{empresaSelecionada.category}</p>

            <p style={modalLocationStyle}>{empresaSelecionada.location}</p>

            <a
              href={`https://wa.me/${empresaSelecionada.whatsapp}?text=${budgetMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              style={primaryModalButtonStyle}
            >
              Realize seu orçamento
            </a>
          </div>
        </div>
      )}

      {profissionalSelecionado && (
        <div
          onClick={() => setProfissionalSelecionado(null)}
          style={modalOverlayStyle}
        >
          <div onClick={(e) => e.stopPropagation()} style={modalCardStyle}>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginBottom: 8,
              }}
            >
              <button
                type="button"
                onClick={() => setProfissionalSelecionado(null)}
                style={closeButtonStyle}
              >
                ×
              </button>
            </div>

            <h2 style={modalTitleStyle}>{profissionalSelecionado.title}</h2>

            <p style={modalLocationStyle}>
              Ajude o ConstruThéo a encontrar bons profissionais da sua região.
            </p>

            <a
              href={`https://wa.me/5511988214713?text=${profissionalMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              style={primaryModalButtonStyle}
            >
              Indicar pelo WhatsApp
            </a>

            <Link
              href="/indicar"
              style={{
                ...secondaryModalButtonStyle,
                marginTop: 10,
              }}
            >
              Abrir formulário de indicação
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

const sectionBlockStyle: CSSProperties = {
  marginBottom: 24,
  background: "#F8FAFC",
  border: "1px solid #E5E7EB",
  borderRadius: 24,
  padding: "15px 14px 16px",
};

const sectionLabelStyle: CSSProperties = {
  fontSize: "0.68rem",
  fontWeight: 800,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "#2563EB",
  marginBottom: 4,
};

const sectionTitleStyle: CSSProperties = {
  fontSize: "1rem",
  fontWeight: 800,
  color: "#111827",
  marginBottom: 4,
};

const sectionTextStyle: CSSProperties = {
  fontSize: "0.78rem",
  color: "#6B7280",
  lineHeight: 1.35,
};

const carouselStyle: CSSProperties = {
  display: "flex",
  gap: 12,
  overflowX: "auto",
  paddingBottom: 4,
  paddingLeft: 2,
  paddingRight: 2,
  scrollbarWidth: "none",
  msOverflowStyle: "none",
};

const companyCardStyle: CSSProperties = {
  minWidth: 136,
  maxWidth: 136,
  flexShrink: 0,
  border: "1px solid #E5E7EB",
  borderRadius: 18,
  background: "#FFFFFF",
  padding: "12px 11px",
  boxShadow: "0 8px 18px rgba(15, 23, 42, 0.05)",
  cursor: "pointer",
  textAlign: "left",
};

const logoCircleStyle: CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: "999px",
  background: "linear-gradient(180deg, #EFF6FF, #F8FAFC)",
  border: "1px solid #DBEAFE",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 10,
  overflow: "hidden",
};

const companyNameStyle: CSSProperties = {
  fontSize: "0.76rem",
  fontWeight: 800,
  color: "#111827",
  lineHeight: 1.25,
  marginBottom: 5,
  minHeight: 30,
};

const companyLocationStyle: CSSProperties = {
  fontSize: "0.7rem",
  color: "#6B7280",
  marginBottom: 9,
  lineHeight: 1.25,
  minHeight: 30,
};

const professionalCardStyle: CSSProperties = {
  minWidth: 150,
  maxWidth: 150,
  flexShrink: 0,
  border: "1px solid #E5E7EB",
  borderRadius: 18,
  background: "#FFFFFF",
  padding: "13px 12px",
  boxShadow: "0 8px 18px rgba(15, 23, 42, 0.05)",
  cursor: "pointer",
  textAlign: "left",
};

const professionalTitleStyle: CSSProperties = {
  fontSize: "0.78rem",
  fontWeight: 800,
  color: "#111827",
  lineHeight: 1.25,
  marginBottom: 6,
};

const professionalTextStyle: CSSProperties = {
  fontSize: "0.7rem",
  color: "#6B7280",
  marginBottom: 10,
  lineHeight: 1.3,
  minHeight: 46,
};

const premiumTagStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "4px 8px",
  borderRadius: "999px",
  background: "#FFFCF5",
  color: "#B7791F",
  fontSize: "0.62rem",
  fontWeight: 800,
  whiteSpace: "nowrap",
  border: "1px solid #F1E4C3",
};

const blueTagStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "4px 8px",
  borderRadius: "999px",
  background: "#EEF2FF",
  color: "#1D4ED8",
  fontSize: "0.65rem",
  fontWeight: 800,
};

const modalOverlayStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(15, 23, 42, 0.45)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 16,
  zIndex: 50,
};

const modalCardStyle: CSSProperties = {
  width: "100%",
  maxWidth: 360,
  background: "#FFFFFF",
  borderRadius: 24,
  padding: "18px 18px 16px",
  boxShadow: "0 20px 45px rgba(15, 23, 42, 0.22)",
  border: "1px solid #E5E7EB",
};

const closeButtonStyle: CSSProperties = {
  border: "none",
  background: "transparent",
  fontSize: "1.1rem",
  color: "#6B7280",
  cursor: "pointer",
};

const modalLogoStyle: CSSProperties = {
  width: 74,
  height: 74,
  borderRadius: 18,
  overflow: "hidden",
  border: "1px solid #E5E7EB",
  background: "#F9FAFB",
  margin: "0 auto 14px",
};

const modalTitleStyle: CSSProperties = {
  fontSize: "1rem",
  fontWeight: 800,
  color: "#111827",
  textAlign: "center",
  marginBottom: 6,
  lineHeight: 1.3,
};

const modalCategoryStyle: CSSProperties = {
  fontSize: "0.8rem",
  color: "#6B7280",
  textAlign: "center",
  marginBottom: 4,
};

const modalLocationStyle: CSSProperties = {
  fontSize: "0.78rem",
  color: "#4B5563",
  textAlign: "center",
  marginBottom: 16,
  lineHeight: 1.4,
};

const primaryModalButtonStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  padding: "12px 14px",
  borderRadius: 16,
  background: "#2563EB",
  color: "#FFFFFF",
  fontSize: "0.84rem",
  fontWeight: 800,
  textDecoration: "none",
  boxShadow: "0 8px 16px rgba(37, 99, 235, 0.22)",
};

const secondaryModalButtonStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  padding: "11px 14px",
  borderRadius: 16,
  background: "#FFFFFF",
  border: "1px solid #D1D5DB",
  color: "#111827",
  fontSize: "0.82rem",
  fontWeight: 800,
  textDecoration: "none",
};