"use client";

import React from "react";

const whatsappNumber = "5511988214713"; // <- TROCA pelo número do WhatsApp Business (só números)
const defaultMessage =
  "Olá, estou utilizando o aplicativo ConstruThéo.";

export function WhatsAppSupportButton() {
  const link = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    defaultMessage
  )}`;

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        position: "fixed",
        right: "16px",
        bottom: "20px",
        zIndex: 9999,
        textDecoration: "none",
      }}
    >
      <div
        style={{
          width: 58,
          height: 58,
          borderRadius: "999px",
          background:
            "radial-gradient(circle at 30% 30%, #25D366, #128C7E)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "2px solid #ECFEFF",
        }}
      >
        {/* Ícone simples "WhatsApp" em SVG (bem leve) */}
        <span
          style={{
            fontSize: "30px",
          }}
        >
          💬
        </span>
      </div>

      {/* Balãozinho “Suporte” opcional */}
      <div
        style={{
          position: "absolute",
          right: 70,
          bottom: 14,
          padding: "6px 10px",
          borderRadius: 999,
          background: "#0F172A",
          color: "#F9FAFB",
          fontSize: "0.75rem",
          fontWeight: 500,
          boxShadow: "0 3px 8px rgba(0,0,0,0.2)",
          whiteSpace: "nowrap",
        }}
      >
        Suporte pelo WhatsApp
      </div>
    </a>
  );
}
