"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type SplashScreenProps = {
  onFinish?: () => void; // callback quando a splash termina
};

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const [mascotIndex, setMascotIndex] = useState(0);

  // LISTA DE MASCOTES
  const mascots = [
    "/mascote-pedreiro.png",
    "/mascote-pedreiro1.png",
    "/mascote-pintor.png",
    "/mascote-eletricista-v2.png",
    "/mascote-jardineiro-v2.png",
  ];

  // Animação do mascote trocando
  useEffect(() => {
    const interval = setInterval(() => {
      setMascotIndex((prev) => (prev + 1) % mascots.length);
    }, 800);

    return () => clearInterval(interval);
  }, []);

  // Depois de 5s, some a splash (quem decide o destino é o page.tsx)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onFinish) onFinish();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <main
      style={{
        minHeight: "100vh",
        margin: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(180deg, #cfe8ff, #3b82b8)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 360,
          backgroundColor: "#ffffff",
          borderRadius: 24,
          boxShadow: "0 22px 45px rgba(15, 23, 42, 0.22)",
          padding: 24,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        {/* MASCOTE ANIMADO */}
        <div
          style={{
            width: 140,
            height: 140,
            position: "relative",
            marginBottom: 12,
            borderRadius: 999,
            backgroundColor: "#ffffff",
          }}
        >
          <Image
            src={mascots[mascotIndex]}
            alt="Mascote ConstruThéo"
            fill
            style={{
              objectFit: "contain",
              filter: "drop-shadow(0 8px 16px rgba(15, 23, 42, 0.35))",
            }}
            priority
          />
        </div>

        <h1
          style={{
            fontSize: 24,
            fontWeight: 600,
            marginBottom: 8,
            color: "#0f172a",
          }}
        >
          Constru<span style={{ color: "#0284c7" }}>Théo</span>
        </h1>

        <p
          style={{
            fontSize: 14,
            color: "#64748b",
            marginBottom: 16,
          }}
        >
          Tudo que sua obra precisa, na palma da sua mão!
        </p>

        <p
          style={{
            fontSize: 11,
            color: "#94a3b8",
          }}
        >
          Conectando você às melhores opções da sua região...
        </p>
      </div>
    </main>
  );
}