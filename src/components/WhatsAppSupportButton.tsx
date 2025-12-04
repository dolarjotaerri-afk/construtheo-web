"use client";

import Image from "next/image";

export function WhatsAppSupportButton() {
  const numero = "5511988214713"; // 👉 coloque aqui o número do WhatsApp Business
  const mensagem = encodeURIComponent(
    "Olá! Estou Utilizando o Aplicativo ConstruThéo."
  );

  const url = `https://wa.me/${numero}?text=${mensagem}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        position: "fixed",
        bottom: "22px",
        right: "22px",
        zIndex: 9999,
        width: "62px",
        height: "62px",
        borderRadius: "50%",
        background: "#25D366",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
        cursor: "pointer",
      }}
    >
      <Image
        src="/whatsapp-logo.png"
        alt="WhatsApp Suporte"
        width={36}
        height={36}
        style={{
          filter: "brightness(0) invert(1)", // deixa o ícone branco automático
        }}
      />
    </a>
  );
}
