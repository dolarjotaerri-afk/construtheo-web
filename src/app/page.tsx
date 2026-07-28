"use client";

import { useMemo, useState, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import SplashScreen from "./SplashScreen";

const CONSTRUTHEO_WHATSAPP = "5511988214713";

const featuredPartners = [
  {
    name: "Depósito Formigão",
    category: "Depósito",
    location: "Igaratá/SP e Região",
    badge: "★ 5.0 Qualidade",
    logo: "/logos/deposito.png",
    whatsapp: "5511944674658",
  },
  {
    name: "DSA Energia Solar",
    category: "Energia solar",
    location: "São José dos Campos/SP e Região",
    badge: "★ 5.0 Qualidade",
    logo: "/logos/dsa-energia-solar.png",
    whatsapp: "5512997223060",
  },
  {
    name: "L.C Caçambas",
    category: "Caçamba",
    location: "Santa Isabel/SP e Região",
    badge: "★ 5.0 Qualidade",
    logo: "/logos/lc-cacambas.png",
    whatsapp: "5511998014113",
  },
  {
    name: "Vidraçaria Alvarenga",
    category: "Vidraçaria",
    location: "São Paulo/SP e Região",
    badge: "★ 5.0 Qualidade",
    logo: "/logos/vidracaria-alvarenga.png",
    whatsapp: "5511982081051",
  },
];

const featuredProfessionals = [
  {
    title: "Indique um pedreiro",
    subtitle: "Profissional de confiança para obras, reformas e acabamentos.",
    tag: "Pedreiro",
  },
  {
    title: "Indique um pintor",
    subtitle: "Serviço de pintura residencial, comercial e acabamento fino.",
    tag: "Pintura",
  },
  {
    title: "Indique um eletricista",
    subtitle: "Instalações, manutenção elétrica e pequenos reparos.",
    tag: "Elétrica",
  },
  {
    title: "Indique um encanador",
    subtitle: "Hidráulica, vazamentos, reparos e instalações.",
    tag: "Hidráulica",
  },
  {
    title: "Indique um gesseiro",
    subtitle: "Forro, drywall, sancas e acabamento em gesso.",
    tag: "Gesso",
  },
];

export default function RootPage() {
  const [showSplash, setShowSplash] = useState(true);

  const [selectedPartner, setSelectedPartner] = useState<
    (typeof featuredPartners)[number] | null
  >(null);

  const budgetMessage = useMemo(
    () => encodeURIComponent("Olá vim através do Construthéo"),
    []
  );

  const empresaMessage = useMemo(
    () =>
      encodeURIComponent(
        "Olá, tenho interesse em cadastrar minha empresa no Construthéo."
      ),
    []
  );

  const profissionalMessage = useMemo(
    () =>
      encodeURIComponent(
        "Olá, tenho interesse em me cadastrar como profissional da construção no Construthéo."
      ),
    []
  );

  const adicionarEmpresaMessage = useMemo(
    () =>
      encodeURIComponent(
        "Olá, quero adicionar minha empresa no carrossel do Construthéo."
      ),
    []
  );

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <>
      <main
        className="home-page"
        style={{
          width: "100%",
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          padding: "16px 10px",
          background: "#F3F4F6",
        }}
      >
        <div
          className="home-shell"
          style={{
            width: "100%",
            maxWidth: "460px",
            background: "#FFFFFF",
            borderRadius: "28px",
            padding: "22px 18px 20px",
            boxShadow: "0 18px 40px rgba(15, 23, 42, 0.14)",
            border: "1px solid #E5E7EB",
          }}
        >
          {/* TOPO */}
          <header className="home-header" style={{ marginBottom: "16px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                marginBottom: "7px",
              }}
            >
              <p
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 800,
                  letterSpacing: "0.18em",
                  color: "#2563EB",
                  textTransform: "uppercase",
                  margin: 0,
                }}
              >
                ConstruThéo
              </p>

              <Link
                href="/login"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "6px 11px",
                  borderRadius: "999px",
                  border: "1px solid #E5E7EB",
                  background: "#F9FAFB",
                  color: "#2563EB",
                  fontSize: "0.68rem",
                  fontWeight: 800,
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                  boxShadow: "0 2px 6px rgba(15, 23, 42, 0.05)",
                }}
              >
                Entrar / Cadastrar
              </Link>
            </div>

            <h1
              className="home-title"
              style={{
                fontSize: "1.34rem",
                fontWeight: 800,
                color: "#111827",
                lineHeight: 1.18,
                marginBottom: "8px",
                letterSpacing: "-0.03em",
              }}
            >
              Os melhores da construção civil na sua região.
            </h1>

            <p
              className="home-description"
              style={{
                fontSize: "0.8rem",
                color: "#6B7280",
                lineHeight: 1.42,
                margin: 0,
              }}
            >
              Encontre profissionais, empresas e fornecedores de confiança para
              sua obra. Faça parte de uma rede que valoriza quem entrega
              qualidade.
            </p>
          </header>

          {/* CLIENTE + INDICAÇÃO */}
          <div
            className="home-main-choices"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px",
              marginBottom: "18px",
            }}
          >
            <Link
              href="/cadastro/cliente"
              className="home-main-choice-link"
              style={{ textDecoration: "none" }}
            >
              <section style={mainChoiceCardStyle}>
                <p style={mainChoiceTitleStyle}>Sou cliente</p>
                <p style={mainChoiceTextStyle}>Obra ou reforma</p>
              </section>
            </Link>

            <Link
              href="/indicar"
              className="home-main-choice-link"
              style={{ textDecoration: "none" }}
            >
              <section style={mainChoiceCardStyle}>
                <p style={mainChoiceTitleStyle}>Indicar profissional</p>
                <p style={mainChoiceTextStyle}>ou empresa</p>
              </section>
            </Link>
          </div>

          {/* BLOCO EMPRESAS */}
          <section className="home-section" style={sectionBlockStyle}>
            <div style={sectionHeaderStyle}>
              <div>
                <h2 style={sectionTitleStyle}>
                  Empresas em destaque na sua região
                </h2>
              </div>

              <a
                href={`https://wa.me/${CONSTRUTHEO_WHATSAPP}?text=${empresaMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                style={smallActionButtonStyle}
              >
                Sou empresa
              </a>
            </div>

            <div className="home-carousel" style={carouselStyle}>
              {featuredPartners.map((partner) => (
                <button
                  className="home-company-card"
                  key={partner.name}
                  type="button"
                  onClick={() => setSelectedPartner(partner)}
                  style={companyCardStyle}
                >
                  <div style={logoCircleStyle}>
                    <Image
                      src={partner.logo}
                      alt={partner.name}
                      width={40}
                      height={40}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>

                  <p style={companyNameStyle}>{partner.name}</p>

                  <p style={companyLocationStyle}>{partner.location}</p>

                  <span style={tagStyle}>{partner.badge}</span>
                </button>
              ))}

              <a
                className="home-company-card"
                href={`https://wa.me/${CONSTRUTHEO_WHATSAPP}?text=${adicionarEmpresaMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  ...companyCardStyle,
                  border: "1px dashed #93C5FD",
                  textDecoration: "none",
                }}
              >
                <div style={plusCircleStyle}>+</div>

                <p style={companyNameStyle}>Adicione sua empresa</p>

                <p style={companyLocationStyle}>
                  Depósito, vidraçaria, caçamba e mais
                </p>

                <span style={tagStyle}>Novo parceiro</span>
              </a>
            </div>
          </section>

          {/* BLOCO PRESTADORES */}
          <section className="home-section" style={sectionBlockStyle}>
            <div style={sectionHeaderStyle}>
              <div>
                <h2 style={sectionTitleStyle}>
                  Profissionais em destaque na região
                </h2>
              </div>

              <a
                href={`https://wa.me/${CONSTRUTHEO_WHATSAPP}?text=${profissionalMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                style={smallActionButtonStyle}
              >
                Sou profissional
              </a>
            </div>

            <div className="home-carousel" style={carouselStyle}>
              {featuredProfessionals.map((item) => (
                <Link
                  className="home-professional-card"
                  key={item.title}
                  href="/indicar"
                  style={{
                    ...professionalCardStyle,
                    textDecoration: "none",
                  }}
                >
                  <p style={professionalTitleStyle}>{item.title}</p>

                  <p style={professionalTextStyle}>{item.subtitle}</p>

                  <span style={tagStyle}>{item.tag}</span>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>

      {selectedPartner && (
        <div
          onClick={() => setSelectedPartner(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
            zIndex: 50,
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "360px",
              background: "#FFFFFF",
              borderRadius: "24px",
              padding: "18px 18px 16px",
              boxShadow: "0 20px 45px rgba(15, 23, 42, 0.22)",
              border: "1px solid #E5E7EB",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginBottom: "8px",
              }}
            >
              <button
                type="button"
                aria-label="Fechar"
                onClick={() => setSelectedPartner(null)}
                style={{
                  border: "none",
                  background: "transparent",
                  fontSize: "1.1rem",
                  color: "#6B7280",
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>

            <div
              style={{
                width: 74,
                height: 74,
                borderRadius: "18px",
                overflow: "hidden",
                border: "1px solid #E5E7EB",
                background: "#F9FAFB",
                margin: "0 auto 14px",
              }}
            >
              <Image
                src={selectedPartner.logo}
                alt={selectedPartner.name}
                width={74}
                height={74}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </div>

            <h2
              style={{
                fontSize: "1rem",
                fontWeight: 800,
                color: "#111827",
                textAlign: "center",
                marginBottom: "6px",
                lineHeight: 1.3,
              }}
            >
              {selectedPartner.name}
            </h2>

            <p
              style={{
                fontSize: "0.8rem",
                color: "#6B7280",
                textAlign: "center",
                marginBottom: "4px",
              }}
            >
              {selectedPartner.category}
            </p>

            <p
              style={{
                fontSize: "0.78rem",
                color: "#4B5563",
                textAlign: "center",
                marginBottom: "16px",
              }}
            >
              {selectedPartner.location}
            </p>

            <a
              href={`https://wa.me/${selectedPartner.whatsapp}?text=${budgetMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                padding: "12px 14px",
                borderRadius: "16px",
                background: "#2563EB",
                color: "#FFFFFF",
                fontSize: "0.84rem",
                fontWeight: 800,
                textDecoration: "none",
                boxShadow: "0 8px 16px rgba(37, 99, 235, 0.22)",
              }}
            >
              Realize seu orçamento
            </a>
          </div>
        </div>
      )}

      <style jsx global>{`
  .home-page {
    transition: padding 0.2s ease;
  }

  .home-shell {
    transition:
      max-width 0.25s ease,
      padding 0.25s ease;
  }

  .home-main-choice-link {
    display: block;
  }

  .home-company-card,
  .home-professional-card {
    transition:
      transform 0.18s ease,
      box-shadow 0.18s ease,
      border-color 0.18s ease;
  }

  @media (hover: hover) {
    .home-company-card:hover,
    .home-professional-card:hover,
    .home-main-choice-link:hover section {
      transform: translateY(-2px);
      border-color: #bfdbfe !important;
      box-shadow: 0 12px 24px rgba(15, 23, 42, 0.09) !important;
    }
  }

  @media (min-width: 768px) {
    .home-page {
      padding: 28px 20px !important;
    }

    .home-shell {
      max-width: 780px !important;
      padding: 30px 28px 26px !important;
    }

    .home-header {
      margin-bottom: 22px !important;
    }

    .home-title {
      max-width: 620px;
      font-size: 1.9rem !important;
    }

    .home-description {
      max-width: 650px;
      font-size: 0.92rem !important;
    }

    .home-main-choices {
      gap: 16px !important;
      margin-bottom: 22px !important;
    }

    .home-main-choice-link section {
      min-height: 96px !important;
      padding: 18px !important;
    }

    .home-section {
      padding: 18px !important;
      margin-bottom: 18px !important;
    }

    .home-carousel {
      display: grid !important;
      grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
      overflow: visible !important;
      gap: 14px !important;
    }

    .home-company-card,
    .home-professional-card {
      min-width: 0 !important;
      max-width: none !important;
      width: 100% !important;
      min-height: 180px !important;
    }
  }

  @media (min-width: 1100px) {
    .home-page {
      padding: 40px 28px !important;
    }

    .home-shell {
      max-width: 1180px !important;
      padding: 38px 36px 32px !important;
      border-radius: 32px !important;
    }

    .home-header {
      margin-bottom: 28px !important;
    }

    .home-title {
      max-width: 720px;
      font-size: 2.3rem !important;
      line-height: 1.08 !important;
    }

    .home-description {
      max-width: 760px;
      font-size: 1rem !important;
    }

    .home-main-choices {
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
      gap: 18px !important;
      margin-bottom: 28px !important;
    }

    .home-main-choice-link section {
      min-height: 118px !important;
      padding: 22px !important;
    }

    .home-section {
      padding: 24px !important;
      border-radius: 26px !important;
    }

    .home-carousel {
      grid-template-columns: repeat(5, minmax(0, 1fr)) !important;
      gap: 16px !important;
    }

    .home-company-card,
    .home-professional-card {
      min-height: 190px !important;
      padding: 18px !important;
    }

    .home-shell a[href="/login"] {
      padding: 8px 14px !important;
      font-size: 0.75rem !important;
    }

    .home-section > div:first-child a {
      min-width: 110px !important;
      padding: 10px 14px !important;
      font-size: 0.74rem !important;
    }
  }

  @media (max-width: 420px) {
    .home-main-choices {
      grid-template-columns: 1fr 1fr !important;
    }
  }
`}</style>
    </>
  );
}

const mainChoiceCardStyle: CSSProperties = {
  minHeight: 76,
  borderRadius: "18px",
  border: "1px solid #E5E7EB",
  background: "#FFFFFF",
  padding: "14px 13px",
  boxShadow: "0 5px 14px rgba(15, 23, 42, 0.05)",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  transition:
    "transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease",
};

const mainChoiceTitleStyle: CSSProperties = {
  fontSize: "0.9rem",
  fontWeight: 800,
  color: "#111827",
  margin: "0 0 4px",
};

const mainChoiceTextStyle: CSSProperties = {
  fontSize: "0.72rem",
  color: "#2563EB",
  fontWeight: 700,
  lineHeight: 1.25,
  margin: 0,
};

const sectionBlockStyle: CSSProperties = {
  background: "#F8FAFC",
  border: "1px solid #E5E7EB",
  borderRadius: "22px",
  padding: "13px 12px 14px",
  marginBottom: "14px",
};

const sectionHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "12px",
  marginBottom: "12px",
};

const sectionTitleStyle: CSSProperties = {
  fontSize: "0.84rem",
  fontWeight: 800,
  color: "#111827",
  lineHeight: 1.25,
  margin: 0,
};

const smallActionButtonStyle: CSSProperties = {
  minWidth: "94px",
  textAlign: "center",
  borderRadius: "999px",
  padding: "8px 10px",
  background: "#2563EB",
  color: "#FFFFFF",
  fontSize: "0.68rem",
  fontWeight: 800,
  textDecoration: "none",
  boxShadow: "0 6px 14px rgba(37, 99, 235, 0.2)",
  whiteSpace: "nowrap",
};

const carouselStyle: CSSProperties = {
  display: "flex",
  gap: "12px",
  overflowX: "auto",
  paddingBottom: "4px",
  paddingLeft: "2px",
  paddingRight: "2px",
  scrollbarWidth: "none",
  msOverflowStyle: "none",
};

const companyCardStyle: CSSProperties = {
  minWidth: "136px",
  maxWidth: "136px",
  flexShrink: 0,
  border: "1px solid #E5E7EB",
  borderRadius: "18px",
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
  marginBottom: "10px",
  overflow: "hidden",
};

const plusCircleStyle: CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: "999px",
  background: "#EFF6FF",
  border: "1px solid #BFDBFE",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#2563EB",
  fontWeight: 800,
  fontSize: "1.1rem",
  marginBottom: "10px",
};

const companyNameStyle: CSSProperties = {
  fontSize: "0.76rem",
  fontWeight: 800,
  color: "#111827",
  lineHeight: 1.25,
  margin: "0 0 5px",
  minHeight: "30px",
};

const companyLocationStyle: CSSProperties = {
  fontSize: "0.7rem",
  color: "#6B7280",
  margin: "0 0 9px",
  lineHeight: 1.25,
  minHeight: "30px",
};

const professionalCardStyle: CSSProperties = {
  minWidth: "150px",
  maxWidth: "150px",
  flexShrink: 0,
  border: "1px solid #E5E7EB",
  borderRadius: "18px",
  background: "#FFFFFF",
  padding: "13px 12px",
  boxShadow: "0 8px 18px rgba(15, 23, 42, 0.05)",
};

const professionalTitleStyle: CSSProperties = {
  fontSize: "0.78rem",
  fontWeight: 800,
  color: "#111827",
  lineHeight: 1.25,
  margin: "0 0 6px",
};

const professionalTextStyle: CSSProperties = {
  fontSize: "0.7rem",
  color: "#6B7280",
  margin: "0 0 10px",
  lineHeight: 1.3,
  minHeight: "46px",
};

const tagStyle: CSSProperties = {
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