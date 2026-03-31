"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import SplashScreen from "./SplashScreen";

const featuredPartners = [
  {
    name: "Depósito Modelo",
    category: "Depósito",
    badge: "Parceiro",
  },
  {
    name: "Poços Almeida",
    category: "Poço artesiano",
    badge: "Destaque",
  },
  {
    name: "Concreto Forte",
    category: "Usina",
    badge: "Parceiro",
  },
  {
    name: "Solar Prime",
    category: "Energia solar",
    badge: "Destaque",
  },
  {
    name: "Caçamba Rápida",
    category: "Caçamba",
    badge: "Parceiro",
  },
];

export default function RootPage() {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
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
              <div
                key={partner.name}
                style={{
                  minWidth: "142px",
                  maxWidth: "142px",
                  flexShrink: 0,
                  border: "1px solid #E5E7EB",
                  borderRadius: "20px",
                  background: "#FFFFFF",
                  padding: "13px 12px 12px",
                  boxShadow: "0 8px 18px rgba(15, 23, 42, 0.06)",
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
                  }}
                >
                  {partner.name.charAt(0)}
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
                    minHeight: "18px",
                  }}
                >
                  {partner.category}
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
              </div>
            ))}
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
        <Link
          href="/cadastro/empresa"
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
                Depósito, usina, caçamba, energia solar e outros serviços para
                obras.
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

        {/* CARD: PROFISSIONAL */}
        <Link
          href="/cadastro/profissional"
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
                Pedreiro, ajudante, pintor, eletricista, encanador e outros
                profissionais da obra.
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
      </div>
    </main>
  );
}
