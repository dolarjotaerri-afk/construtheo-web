"use client";

import Image from "next/image";

const WHATSAPP_NUMBER = "5511988214713"; // <-- coloca o número do Construthéo aqui
const DEFAULT_MESSAGE =
  "Olá! Estou utilizando o ConstruThéo";

export default function WhatsappSupportButton() {
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    DEFAULT_MESSAGE
  )}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Suporte pelo WhatsApp"
      style={{
        position: "fixed",
        right: "16px",
        bottom: "16px",
        zIndex: 9999,
        width: "64px",
        height: "64px",
        borderRadius: "999px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
        overflow: "hidden",
        backgroundColor: "#25D366", // cor padrão do WhatsApp (fundo)
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Image
        src="/whatsapp-logo.png"   // caminho do arquivo no /public
        alt="WhatsApp"
        width={40}
        height={40}
        style={{
          display: "block",
        }}
        priority
      />
    </a>
  );
}
