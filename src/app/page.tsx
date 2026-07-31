"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";
import Image from "next/image";
import SplashScreen from "./SplashScreen";
import { supabase } from "../lib/supabaseClient";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
};

const companyShowcase = [
  {
    name: "Depósito de materiais",
    description: "Materiais, ferramentas e soluções para sua obra.",
    icon: "🏪",
  },
  {
    name: "Vidraçaria",
    description: "Vidros, espelhos, boxes e instalações.",
    icon: "▦",
  },
  {
    name: "Serralheria",
    description: "Portões, estruturas, grades e serviços em metal.",
    icon: "⚙",
  },
  {
    name: "Marmoraria",
    description: "Mármores, granitos, bancadas e acabamentos.",
    icon: "◫",
  },
  {
    name: "Energia solar",
    description: "Projetos, instalação e manutenção de sistemas solares.",
    icon: "☀",
  },
  {
    name: "Caçamba de entulho",
    description: "Retirada de resíduos e apoio para sua construção.",
    icon: "▰",
  },
  {
    name: "Usina de concreto",
    description: "Concreto usinado e soluções para sua estrutura.",
    icon: "🏗",
  },
  {
    name: "Máquinas e equipamentos",
    description: "Locação e serviços para facilitar sua obra.",
    icon: "🚜",
  },
];

const professionalShowcase = [
  {
    name: "João",
    profession: "Pedreiro",
    description: "Alvenaria, reformas e acabamentos.",
  },
  {
    name: "Carlos",
    profession: "Pintor",
    description: "Pintura residencial, comercial e acabamento fino.",
  },
  {
    name: "Luiz",
    profession: "Eletricista",
    description: "Instalações, manutenção e reparos elétricos.",
  },
  {
    name: "Marcos",
    profession: "Encanador",
    description: "Hidráulica, vazamentos, reparos e instalações.",
  },
  {
    name: "Rafael",
    profession: "Gesseiro e drywall",
    description: "Forros, sancas, divisórias e acabamentos.",
  },
  {
    name: "André",
    profession: "Azulejista",
    description: "Pisos, revestimentos e acabamentos especiais.",
  },
  {
    name: "Paulo",
    profession: "Serralheiro",
    description: "Portões, estruturas e serviços em metal.",
  },
  {
    name: "Lucas",
    profession: "Jardineiro",
    description: "Jardinagem, poda e manutenção de áreas verdes.",
  },
];

export default function RootPage() {
  const [showSplash, setShowSplash] = useState(true);
  const [accountAction, setAccountAction] = useState({
    label: "Entrar",
    href: "/login",
  });
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallCard, setShowInstallCard] = useState(false);

  useEffect(() => {
    let mounted = true;

    const resolvePanel = (tipo?: string | null) => {
      if (tipo === "empresa") return "/painel/empresa";
      if (tipo === "profissional" || tipo === "prestador") {
        return "/painel/profissional";
      }
      return "/painel/cliente";
    };

    const updateAccountAction = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      if (!session?.user) {
        setAccountAction({
          label: "Entrar",
          href: "/login",
        });
        return;
      }

      let tipo =
        session.user.user_metadata?.tipo ||
        session.user.app_metadata?.tipo ||
        null;

      if (!tipo && typeof window !== "undefined") {
        if (localStorage.getItem("construtheo_empresa_atual")) {
          tipo = "empresa";
        } else if (
          localStorage.getItem("construtheo_profissional_atual")
        ) {
          tipo = "profissional";
        } else {
          tipo = "cliente";
        }
      }

      setAccountAction({
        label: "Acessar painel",
        href: resolvePanel(tipo),
      });
    };

    updateAccountAction();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      updateAccountAction();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone ===
        true;

    if (isStandalone) {
      setShowInstallCard(false);
      return;
    }

    const dismissed =
      sessionStorage.getItem("construtheo_install_card_closed") === "true";

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);

      if (!dismissed) {
        setShowInstallCard(true);
      }
    };

    const handleAppInstalled = () => {
      setInstallPrompt(null);
      setShowInstallCard(false);
    };

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt
    );
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallApp = async () => {
    if (!installPrompt) return;

    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;

    if (choice.outcome === "accepted") {
      setShowInstallCard(false);
    }

    setInstallPrompt(null);
  };

  const closeInstallCard = () => {
    sessionStorage.setItem("construtheo_install_card_closed", "true");
    setShowInstallCard(false);
  };

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
                marginBottom: "10px",
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

              <Link href={accountAction.href} style={topLoginButtonStyle}>
                {accountAction.label}
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

          {/* CHAMADA DE CADASTRO */}
          <section style={welcomeNoticeStyle}>
            <div style={welcomeIconStyle}>📍</div>
            <div style={{ flex: 1 }}>
              <p style={welcomeTitleStyle}>
                Encontre os melhores na sua região
              </p>
              <p style={welcomeTextStyle}>
                Realize seu cadastro gratuito para localizar empresas e
                profissionais próximos de você.
              </p>
            </div>
            <Link href="/cadastro/cliente" style={welcomeButtonStyle}>
              Começar
            </Link>
          </section>

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
                <p style={mainChoiceTextStyle}>Começar meu cadastro</p>
              </section>
            </Link>

            <Link
              href="/indicar"
              className="home-main-choice-link"
              style={{ textDecoration: "none" }}
            >
              <section style={mainChoiceCardStyle}>
                <p style={mainChoiceTitleStyle}>Fazer uma indicação</p>
                <p style={mainChoiceTextStyle}>Profissional ou empresa</p>
              </section>
            </Link>
          </div>

          {/* BLOCO EMPRESAS */}
          <section className="home-section" style={sectionBlockStyle}>
            <div style={sectionHeaderStyle}>
              <div>
                <h2 style={sectionTitleStyle}>
                  Melhores empresas na sua região
                </h2>
              </div>

              <Link href="/cadastro/empresa" style={smallActionButtonStyle}>
                Cadastrar
              </Link>
            </div>

            <div className="home-carousel-wrap" style={carouselWrapStyle}>
              <div className="home-carousel" style={carouselStyle}>
              {companyShowcase.map((company) => (
                <article
                  className="home-company-card home-placeholder-card"
                  key={company.name}
                  style={companyCardStyle}
                  aria-label={`Exemplo de perfil para ${company.name}`}
                >
                  <div style={companyGhostAreaStyle}>
                    <div style={companyGhostIconStyle}>{company.icon}</div>
                  </div>

                  <p style={companyNameStyle}>{company.name}</p>

                  <span style={availableTagStyle}>
                    Sua empresa pode aparecer aqui
                  </span>
                </article>
              ))}
              </div>
              <div className="home-carousel-arrow" style={carouselArrowStyle} aria-hidden="true">›</div>
            </div>
          </section>

          {/* BLOCO PROFISSIONAIS */}
          <section className="home-section" style={sectionBlockStyle}>
            <div style={sectionHeaderStyle}>
              <div>
                <h2 style={sectionTitleStyle}>
                  Melhores profissionais na sua região
                </h2>
              </div>

              <Link href="/cadastro/prestador" style={smallActionButtonStyle}>
                Cadastrar
              </Link>
            </div>

            <div className="home-carousel-wrap" style={carouselWrapStyle}>
              <div className="home-carousel" style={carouselStyle}>
              {professionalShowcase.map((professional) => (
                <article
                  className="home-professional-card home-placeholder-card"
                  key={`${professional.name}-${professional.profession}`}
                  style={professionalCardStyle}
                  aria-label={`Exemplo de perfil de ${professional.profession}`}
                >
                  <div style={profileCoverStyle} />

                  <div style={profileAvatarStyle} aria-hidden="true">
                    👷
                  </div>

                  <div style={{ padding: "0 10px 11px" }}>
                    <p style={professionalTitleStyle}>{professional.name}</p>
                    <p style={professionalRegionStyle}>{professional.profession}</p>
                    <span style={availableTagStyle}>
                      Seu perfil pode aparecer aqui
                    </span>
                  </div>
                </article>
              ))}
              </div>
              <div className="home-carousel-arrow" style={carouselArrowStyle} aria-hidden="true">›</div>
            </div>
          </section>

          {/* CTA FINAL */}
          <section style={finalCtaStyle}>
            <div>
              <p style={finalCtaTitleStyle}>Faça parte dessa conexão</p>
              <p style={finalCtaTextStyle}>
                Cadastre-se para encontrar oportunidades, profissionais e
                empresas da construção civil na sua região.
              </p>
            </div>
            <Link href="/cadastro/cliente" style={finalCtaButtonStyle}>
              Criar cadastro gratuito
            </Link>
          </section>
        </div>
      </main>

      {showInstallCard && installPrompt && (
        <aside
          className="install-app-card"
          aria-label="Instalar aplicativo Construthéo"
        >
          <div className="install-app-icon">
            <Image
              src="/mascote-pedreiro.png"
              alt="Construthéo"
              width={42}
              height={42}
              priority
            />
          </div>

          <div className="install-app-copy">
            <strong>Instale o Construthéo</strong>
            <span>Acesse direto pela tela inicial.</span>
          </div>

          <button
            type="button"
            className="install-app-button"
            onClick={handleInstallApp}
          >
            Instalar
          </button>

          <button
            type="button"
            className="install-app-close"
            aria-label="Fechar aviso de instalação"
            onClick={closeInstallCard}
          >
            ×
          </button>
        </aside>
      )}

      <style jsx global>{`
        .install-app-card {
          position: fixed;
          left: 50%;
          bottom: 16px;
          z-index: 60;
          width: calc(100% - 24px);
          max-width: 490px;
          min-height: 68px;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 10px 9px 11px;
          border: 1px solid #dbeafe;
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.97);
          box-shadow: 0 16px 36px rgba(15, 23, 42, 0.2);
          backdrop-filter: blur(12px);
        }

        .install-app-icon {
          width: 44px;
          height: 44px;
          flex: 0 0 44px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #dbeafe;
          border-radius: 13px;
          background: linear-gradient(180deg, #eff6ff, #ffffff);
        }

        .install-app-icon img {
          width: 40px;
          height: 40px;
          object-fit: contain;
        }

        .install-app-copy {
          min-width: 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          line-height: 1.25;
        }

        .install-app-copy strong {
          color: #0f172a;
          font-size: 0.82rem;
          font-weight: 800;
        }

        .install-app-copy span {
          color: #64748b;
          font-size: 0.7rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .install-app-button {
          border: none;
          border-radius: 12px;
          padding: 10px 14px;
          background: #0ea5e9;
          color: #ffffff;
          font-size: 0.75rem;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 6px 14px rgba(14, 165, 233, 0.24);
        }

        .install-app-close {
          width: 32px;
          height: 32px;
          flex: 0 0 32px;
          border: none;
          border-radius: 999px;
          background: #f1f5f9;
          color: #64748b;
          font-size: 1.1rem;
          line-height: 1;
          cursor: pointer;
        }

        .home-page {
          transition: padding 0.2s ease;
        }

        .home-shell {
          transition: max-width 0.25s ease, padding 0.25s ease;
        }

        .home-main-choice-link {
          display: block;
        }

        .home-company-card,
        .home-professional-card {
          transition: transform 0.18s ease, box-shadow 0.18s ease,
            border-color 0.18s ease;
        }

        .home-carousel::-webkit-scrollbar {
          display: none;
        }

        @media (hover: hover) {
          .home-main-choice-link:hover section {
            transform: translateY(-2px);
            border-color: #bfdbfe !important;
            box-shadow: 0 12px 24px rgba(15, 23, 42, 0.09) !important;
          }
        }

        @media (max-width: 430px) {
          .install-app-card {
            bottom: 10px;
            width: calc(100% - 16px);
            gap: 8px;
            padding: 8px;
          }

          .install-app-copy strong {
            font-size: 0.76rem;
          }

          .install-app-copy span {
            font-size: 0.66rem;
          }

          .install-app-button {
            padding: 9px 11px;
          }
        }

        @media (min-width: 768px) {
          .home-page {
            padding: 30px 24px !important;
          }

          .home-shell {
            max-width: 920px !important;
            padding: 32px 30px 28px !important;
            border-radius: 30px !important;
          }

          .home-header {
            margin-bottom: 22px !important;
          }

          .home-title {
            max-width: 720px;
            font-size: 2.35rem !important;
            line-height: 1.08 !important;
          }

          .home-description {
            max-width: 720px;
            font-size: 0.98rem !important;
          }

          .home-main-choices {
            gap: 16px !important;
            margin-bottom: 22px !important;
          }

          .home-main-choice-link section {
            min-height: 104px !important;
            padding: 20px !important;
          }

          .home-section {
            padding: 20px !important;
            margin-bottom: 18px !important;
          }

          .home-carousel {
            gap: 14px !important;
            padding-right: 36px !important;
          }

          .home-company-card {
            min-width: 168px !important;
            max-width: 168px !important;
            min-height: 170px !important;
          }

          .home-professional-card {
            min-width: 180px !important;
            max-width: 180px !important;
            min-height: 188px !important;
          }
        }

        @media (min-width: 1100px) {
          .home-page {
            padding: 38px 28px !important;
          }

          .home-shell {
            max-width: 1080px !important;
            padding: 38px 38px 32px !important;
          }

          .home-title {
            max-width: 820px;
            font-size: 2.75rem !important;
          }

          .home-description {
            max-width: 800px;
            font-size: 1.02rem !important;
          }

          .home-company-card {
            min-width: 178px !important;
            max-width: 178px !important;
          }

          .home-professional-card {
            min-width: 192px !important;
            max-width: 192px !important;
          }
        }

        .home-carousel-arrow {
          pointer-events: none;
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

const topLoginButtonStyle: CSSProperties = {
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
};

const welcomeNoticeStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "11px",
  padding: "13px",
  marginBottom: "14px",
  borderRadius: "18px",
  border: "1px solid #BFDBFE",
  background: "linear-gradient(135deg, #EFF6FF, #F8FAFC)",
};

const welcomeIconStyle: CSSProperties = {
  width: 38,
  height: 38,
  flexShrink: 0,
  borderRadius: "12px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#FFFFFF",
  border: "1px solid #DBEAFE",
  boxShadow: "0 5px 12px rgba(37, 99, 235, 0.1)",
};

const welcomeTitleStyle: CSSProperties = {
  margin: "0 0 3px",
  fontSize: "0.78rem",
  fontWeight: 800,
  color: "#1E3A8A",
};

const welcomeTextStyle: CSSProperties = {
  margin: 0,
  fontSize: "0.68rem",
  lineHeight: 1.35,
  color: "#64748B",
};

const welcomeButtonStyle: CSSProperties = {
  flexShrink: 0,
  padding: "8px 10px",
  borderRadius: "999px",
  background: "#2563EB",
  color: "#FFFFFF",
  fontSize: "0.66rem",
  fontWeight: 800,
  textDecoration: "none",
};

const mainChoiceCardStyle: CSSProperties = {
  minHeight: 76,
  borderRadius: "18px",
  border: "1px solid #E5E7EB",
  background: "#FFFFFF",
  padding: "14px 13px",
  boxShadow: "0 5px 14px rgba(15,23,42,.05)",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  transition:
    "transform .18s ease, box-shadow .18s ease, border-color .18s ease",
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
  marginBottom: "7px",
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
  fontSize: "0.64rem",
  fontWeight: 800,
  textDecoration: "none",
  boxShadow: "0 6px 14px rgba(37, 99, 235, 0.2)",
  whiteSpace: "nowrap",
};

const carouselWrapStyle: CSSProperties = {
  position: "relative",
};

const carouselStyle: CSSProperties = {
  display: "flex",
  gap: "10px",
  overflowX: "auto",
  scrollSnapType: "x mandatory",
  WebkitOverflowScrolling: "touch",
  padding: "2px 24px 5px 2px",
  scrollbarWidth: "none",
  msOverflowStyle: "none",
};

const carouselArrowStyle: CSSProperties = {
  position: "absolute",
  top: "50%",
  right: -5,
  transform: "translateY(-50%)",
  width: 28,
  height: 28,
  borderRadius: "999px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#2563EB",
  color: "#FFFFFF",
  fontSize: "1.35rem",
  fontWeight: 700,
  boxShadow: "0 6px 14px rgba(37,99,235,.28)",
};

const companyCardStyle: CSSProperties = {
  minWidth: "124px",
  maxWidth: "124px",
  minHeight: "138px",
  scrollSnapAlign: "start",
  flexShrink: 0,
  border: "1px solid #E5E7EB",
  borderRadius: "18px",
  background: "#FFFFFF",
  padding: "11px",
  boxShadow: "0 8px 18px rgba(15, 23, 42, 0.05)",
  textAlign: "left",
  overflow: "hidden",
};

const companyGhostAreaStyle: CSSProperties = {
  position: "relative",
  height: 48,
  borderRadius: "14px",
  marginBottom: "8px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background:
    "linear-gradient(145deg, rgba(226,232,240,.95), rgba(248,250,252,.95))",
  border: "1px solid #E2E8F0",
  overflow: "hidden",
};

const companyGhostIconStyle: CSSProperties = {
  width: 34,
  height: 34,
  borderRadius: "11px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#CBD5E1",
  color: "#64748B",
  fontSize: "1rem",
  filter: "grayscale(1)",
  opacity: 0.72,
  boxShadow: "inset 0 0 0 1px rgba(100,116,139,.15)",
};


const companyNameStyle: CSSProperties = {
  fontSize: "0.7rem",
  fontWeight: 800,
  color: "#111827",
  lineHeight: 1.25,
  margin: "0 0 5px",
  minHeight: "34px",
};

const professionalCardStyle: CSSProperties = {
  minWidth: "142px",
  maxWidth: "142px",
  minHeight: "170px",
  scrollSnapAlign: "start",
  flexShrink: 0,
  border: "1px solid #E5E7EB",
  borderRadius: "18px",
  background: "#FFFFFF",
  boxShadow: "0 8px 18px rgba(15,23,42,.05)",
  overflow: "hidden",
};

const profileCoverStyle: CSSProperties = {
  height: 42,
  position: "relative",
  background:
    "linear-gradient(135deg, rgba(37,99,235,.14), rgba(148,163,184,.18))",
  borderBottom: "1px solid #E2E8F0",
};


const profileAvatarStyle: CSSProperties = {
  width: 46,
  height: 46,
  margin: "-23px 0 7px 10px",
  position: "relative",
  zIndex: 1,
  borderRadius: "999px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "linear-gradient(180deg, #CBD5E1, #94A3B8)",
  border: "4px solid #FFFFFF",
  color: "#475569",
  fontSize: "1.3rem",
  filter: "grayscale(1)",
  boxShadow: "0 5px 12px rgba(15,23,42,.12)",
};

const professionalTitleStyle: CSSProperties = {
  fontSize: "0.7rem",
  fontWeight: 800,
  color: "#111827",
  lineHeight: 1.25,
  margin: "0 0 3px",
};

const professionalRegionStyle: CSSProperties = {
  margin: "0 0 7px",
  fontSize: "0.58rem",
  fontWeight: 700,
  color: "#2563EB",
};

const availableTagStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "4px 7px",
  borderRadius: "999px",
  background: "#EFF6FF",
  color: "#2563EB",
  fontSize: "0.5rem",
  fontWeight: 800,
  border: "1px solid #BFDBFE",
};

const finalCtaStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  padding: "16px",
  borderRadius: "22px",
  color: "#FFFFFF",
  background: "linear-gradient(135deg, #1D4ED8, #0284C7)",
  boxShadow: "0 12px 24px rgba(37, 99, 235, 0.22)",
};

const finalCtaTitleStyle: CSSProperties = {
  margin: "0 0 5px",
  fontSize: "0.92rem",
  fontWeight: 800,
};

const finalCtaTextStyle: CSSProperties = {
  margin: 0,
  fontSize: "0.7rem",
  lineHeight: 1.4,
  color: "rgba(255,255,255,.86)",
};

const finalCtaButtonStyle: CSSProperties = {
  alignSelf: "flex-start",
  padding: "9px 12px",
  borderRadius: "999px",
  background: "#FFFFFF",
  color: "#1D4ED8",
  fontSize: "0.68rem",
  fontWeight: 800,
  textDecoration: "none",
  boxShadow: "0 6px 14px rgba(15,23,42,.15)",
};