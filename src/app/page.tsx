"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import SplashScreen from "./SplashScreen";

const CONSTRUTHEO_WHATSAPP = "5511988214713";

const featuredPartners = [
  {
    name: "Depósito Formigão",
    category: "Depósito",
    location: "Igaratá/SP e Região",
    badge: "Parceiro",
    logo: "/logos/deposito.png",
    whatsapp: "5511944674658",
  },
  {
    name: "DSA Energia Solar",
    category: "Energia solar",
    location: "São José dos Campos/SP e Região",
    badge: "Parceiro",
    logo: "/logos/dsa-energia-solar.png",
    whatsapp: "5512997223060",
  },
  {
    name: "L.C Caçambas",
    category: "Caçamba",
    location: "Santa Isabel/SP e Região",
    badge: "Parceiro",
    logo: "/logos/lc-cacambas.png",
    whatsapp: "5511998014113",
  },
  {
    name: "Vidraçaria Alvarenga",
    category: "Vidraçaria",
    location: "São Paulo/SP e Região",
    badge: "Parceiro",
    logo: "/logos/vidracaria-alvarenga.png",
    whatsapp: "5511982081051",
  },
];

export default function RootPage() {
  const [showSplash, setShowSplash] = useState(true);
  const [selectedPartner, setSelectedPartner] = useState<
    (typeof featuredPartners)[number] | null
  >(null);

  const budgetMessage = useMemo(
    () => encodeURIComponent("Olá vim através do construthéo"),
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
        style={{
          width: "100%",
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "32px 12px",
          background: "#F3F4F6",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "460px",
            background: "#FFFFFF",
            borderRadius: "32px",
            padding: "26px 22px 26px",
            boxShadow: "0 18px 40px rgba(15, 23, 42, 0.16)",
            border: "1px solid #E5E7EB",
          }}
        >
          {/* TOPO / HEADER */}
          <header
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "14px",
              marginBottom: "18px",
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "999px",
                background: "#EFF6FF",
                border: "1px solid #DBEAFE",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              <Image
                src="/mascote-pedreiro.png"
                alt="Mascote ConstruThéo"
                width={40}
                height={40}
                style={{ objectFit: "contain" }}
              />
            </div>

            <div style={{ flex: 1 }}>
              <p
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  letterSpacing: "0.18em",
                  color: "#2563EB",
                  textTransform: "uppercase",
                  marginBottom: "6px",
                }}
              >
                Bem-vindo(a)
              </p>

              <h1
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  color: "#111827",
                  lineHeight: 1.3,
                  marginBottom: "4px",
                }}
              >
                Sua obra conectada a{" "}
                <span style={{ color: "#2563EB" }}>tudo que ela precisa.</span>
              </h1>
            </div>
          </header>

          {/* CHIP: JÁ FAÇO PARTE */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: "22px",
            }}
          >
            <Link
              href="/login"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "7px 14px",
                borderRadius: "999px",
                border: "1px solid #E5E7EB",
                background: "#F9FAFB",
                fontSize: "0.75rem",
                color: "#1D4ED8",
                fontWeight: 500,
                textDecoration: "none",
                boxShadow: "0 2px 6px rgba(15, 23, 42, 0.08)",
              }}
            >
              <span>Já faço parte do ConstruThéo</span>
              <span>↪</span>
            </Link>
          </div>

          {/* CARROSSEL DE DESTAQUES */}
          <section
            style={{
              marginBottom: "20px",
              background: "#F8FAFC",
              border: "1px solid #E5E7EB",
              borderRadius: "22px",
              padding: "14px 12px 14px",
            }}
          >
            <p
              style={{
                fontSize: "0.8rem",
                fontWeight: 700,
                color: "#111827",
                marginBottom: "12px",
                textAlign: "center",
                letterSpacing: "-0.01em",
              }}
            >
              Melhores Empresas da sua região
            </p>

            <div
              style={{
                display: "flex",
                gap: "12px",
                overflowX: "auto",
                paddingBottom: "4px",
                paddingLeft: "2px",
                paddingRight: "2px",
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              {featuredPartners.map((partner) => (
                <button
                  key={partner.name}
                  type="button"
                  onClick={() => setSelectedPartner(partner)}
                  style={{
                    minWidth: "142px",
                    maxWidth: "142px",
                    flexShrink: 0,
                    border: "1px solid #E5E7EB",
                    borderRadius: "20px",
                    background: "#FFFFFF",
                    padding: "13px 12px 12px",
                    boxShadow: "0 8px 18px rgba(15, 23, 42, 0.06)",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: "999px",
                      background: "linear-gradient(180deg, #EFF6FF, #F8FAFC)",
                      border: "1px solid #DBEAFE",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#2563EB",
                      fontWeight: 700,
                      fontSize: "0.8rem",
                      marginBottom: "12px",
                      boxShadow: "0 2px 8px rgba(37, 99, 235, 0.08)",
                      overflow: "hidden",
                    }}
                  >
                    <Image
                      src={partner.logo}
                      alt={partner.name}
                      width={42}
                      height={42}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>

                  <p
                    style={{
                      fontSize: "0.79rem",
                      fontWeight: 700,
                      color: "#111827",
                      lineHeight: 1.25,
                      marginBottom: "5px",
                      minHeight: "32px",
                    }}
                  >
                    {partner.name}
                  </p>

                  <p
                    style={{
                      fontSize: "0.72rem",
                      color: "#6B7280",
                      marginBottom: "10px",
                      lineHeight: 1.3,
                      minHeight: "32px",
                    }}
                  >
                    {partner.location}
                  </p>

                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "4px 9px",
                      borderRadius: "999px",
                      background:
                        partner.badge === "Destaque" ? "#DBEAFE" : "#EEF2FF",
                      color: "#1D4ED8",
                      fontSize: "0.67rem",
                      fontWeight: 700,
                      letterSpacing: "0.01em",
                      boxShadow: "inset 0 0 0 1px rgba(37, 99, 235, 0.08)",
                    }}
                  >
                    {partner.badge}
                  </span>
                </button>
              ))}

              {/* CARD ADICIONE SUA EMPRESA */}
              <a
                href={`https://wa.me/${CONSTRUTHEO_WHATSAPP}?text=${adicionarEmpresaMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  minWidth: "142px",
                  maxWidth: "142px",
                  flexShrink: 0,
                  border: "1px dashed #93C5FD",
                  borderRadius: "20px",
                  background: "#FFFFFF",
                  padding: "13px 12px 12px",
                  boxShadow: "0 8px 18px rgba(15, 23, 42, 0.04)",
                  textAlign: "left",
                  textDecoration: "none",
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: "999px",
                    background: "#EFF6FF",
                    border: "1px solid #BFDBFE",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#2563EB",
                    fontWeight: 700,
                    fontSize: "1.15rem",
                    marginBottom: "12px",
                    boxShadow: "0 2px 8px rgba(37, 99, 235, 0.06)",
                  }}
                >
                  +
                </div>

                <p
                  style={{
                    fontSize: "0.79rem",
                    fontWeight: 700,
                    color: "#111827",
                    lineHeight: 1.25,
                    marginBottom: "5px",
                    minHeight: "32px",
                  }}
                >
                  Adicione sua empresa
                </p>

                <p
                  style={{
                    fontSize: "0.72rem",
                    color: "#6B7280",
                    marginBottom: "10px",
                    lineHeight: 1.3,
                    minHeight: "32px",
                  }}
                >
                  Depósito, serralheria, vidraçaria, caçamba e mais
                </p>

                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "4px 9px",
                    borderRadius: "999px",
                    background: "#EFF6FF",
                    color: "#1D4ED8",
                    fontSize: "0.67rem",
                    fontWeight: 700,
                    letterSpacing: "0.01em",
                    boxShadow: "inset 0 0 0 1px rgba(37, 99, 235, 0.08)",
                  }}
                >
                  Novo parceiro
                </span>
              </a>
            </div>
          </section>

          {/* FRASE CENTRALIZADA */}
          <p
            style={{
              fontSize: "0.78rem",
              color: "#4B5563",
              marginBottom: "12px",
              textAlign: "center",
            }}
          >
            Escolha abaixo o tipo de acesso que representa você:
          </p>

          {/* CARD: CLIENTE */}
          <Link
            href="/cadastro/cliente"
            style={{
              textDecoration: "none",
            }}
          >
            <section
              style={{
                borderRadius: "20px",
                border: "1px solid #E5E7EB",
                padding: "12px 14px",
                marginBottom: "10px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                background: "#FFFFFF",
              }}
            >
              <div
                style={{
                  fontSize: "1.1rem",
                }}
              >
                🏡
              </div>

              <div style={{ flex: 1 }}>
                <p
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    color: "#111827",
                    marginBottom: 2,
                  }}
                >
                  Sou Cliente
                </p>
                <p
                  style={{
                    fontSize: "0.78rem",
                    color: "#6B7280",
                    marginBottom: 4,
                  }}
                >
                  Quero organizar minha obra e encontrar bons profissionais e
                  serviços.
                </p>
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "#2563EB",
                    fontWeight: 500,
                  }}
                >
                  Faça parte do ConstruThéo. Realize seu cadastro.
                </p>
              </div>
            </section>
          </Link>

          {/* CARD: EMPRESA */}
          <a
            href={`https://wa.me/${CONSTRUTHEO_WHATSAPP}?text=${empresaMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              textDecoration: "none",
            }}
          >
            <section
              style={{
                borderRadius: "20px",
                border: "1px solid #E5E7EB",
                padding: "12px 14px",
                marginBottom: "10px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                background: "#FFFFFF",
              }}
            >
              <div
                style={{
                  fontSize: "1.1rem",
                }}
              >
                🏢
              </div>

              <div style={{ flex: 1 }}>
                <p
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    color: "#111827",
                    marginBottom: 2,
                  }}
                >
                  Sou Empresa
                </p>
                <p
                  style={{
                    fontSize: "0.78rem",
                    color: "#6B7280",
                    marginBottom: 4,
                  }}
                >
                  Apresente sua empresa para clientes que estão construindo na sua região.
                </p>
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "#2563EB",
                    fontWeight: 500,
                  }}
                >
                  Inicie seu cadastro com validação da equipe.
                </p>
              </div>
            </section>
          </a>

          {/* CARD: PROFISSIONAL */}
          <a
            href={`https://wa.me/${CONSTRUTHEO_WHATSAPP}?text=${profissionalMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              textDecoration: "none",
            }}
          >
            <section
              style={{
                borderRadius: "20px",
                border: "1px solid #E5E7EB",
                padding: "12px 14px",
                marginBottom: "14px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                background: "#FFFFFF",
              }}
            >
              <div
                style={{
                  fontSize: "1.1rem",
                }}
              >
                👷‍♂️
              </div>

              <div style={{ flex: 1 }}>
                <p
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    color: "#111827",
                    marginBottom: 2,
                  }}
                >
                  Sou Profissional da Construção
                </p>
                <p
                  style={{
                    fontSize: "0.78rem",
                    color: "#6B7280",
                    marginBottom: 4,
                  }}
                >
                  Mostre seu trabalho para clientes que buscam profissionais na sua região.
                </p>
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "#2563EB",
                    fontWeight: 500,
                  }}
                >
                  Inicie seu cadastro com validação da equipe.
                </p>
              </div>
            </section>
          </a>
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
            onClick={(e) => e.stopPropagation()}
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
                onClick={() => setSelectedPartner(null)}
                style={{
                  border: "none",
                  background: "transparent",
                  fontSize: "1.1rem",
                  color: "#6B7280",
                  cursor: "pointer",
                }}
              >
                ✕
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
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>

            <h2
              style={{
                fontSize: "1rem",
                fontWeight: 700,
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
                fontWeight: 700,
                textDecoration: "none",
                boxShadow: "0 8px 16px rgba(37, 99, 235, 0.22)",
              }}
            >
              Realize seu orçamento
            </a>
          </div>
        </div>
      )}
    </>
  );
}
