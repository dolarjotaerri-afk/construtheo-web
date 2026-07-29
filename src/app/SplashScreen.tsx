"use client";

import { useEffect, useState } from "react";

const MASCOTS = [
  "/mascote-pedreiro.png",
  "/mascote-pedreiro1.png",
];

type SplashScreenProps = {
  onFinish: () => void;
};

export default function SplashScreen({
  onFinish,
}: SplashScreenProps) {
  const [mascotIndex, setMascotIndex] = useState(0);

  useEffect(() => {
    const mascotTimer = window.setTimeout(() => {
      setMascotIndex(1);
    }, 550);

    const finishTimer = window.setTimeout(() => {
      onFinish();
    }, 1200);

    return () => {
      window.clearTimeout(mascotTimer);
      window.clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <main
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        minHeight: "100dvh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
        background: "linear-gradient(180deg, #0f172a, #1e3a5f)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 360,
          padding: 24,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          backgroundColor: "#ffffff",
          borderRadius: 24,
          boxShadow: "0 24px 60px rgba(0, 0, 0, 0.35)",
        }}
      >
        <div
          style={{
            position: "relative",
            width: 140,
            height: 140,
            marginBottom: 12,
          }}
        >
          <img
            src={MASCOTS[mascotIndex]}
            alt="Mascote ConstruThéo"
            width={140}
            height={140}
            draggable={false}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              filter:
                "drop-shadow(0 8px 16px rgba(15, 23, 42, 0.35))",
            }}
          />
        </div>

        <h1
          style={{
            margin: "0 0 8px",
            fontSize: 24,
            fontWeight: 700,
            color: "#0f172a",
          }}
        >
          Constru<span style={{ color: "#0284c7" }}>Théo</span>
        </h1>

        <p
          style={{
            margin: "0 0 16px",
            fontSize: 14,
            color: "#64748b",
          }}
        >
          Sua obra conectada a quem faz acontecer.
        </p>

        <p
          style={{
            margin: 0,
            fontSize: 11,
            color: "#94a3b8",
          }}
        >
          Carregando sua experiência na construção civil...
        </p>
      </div>
    </main>
  );
}