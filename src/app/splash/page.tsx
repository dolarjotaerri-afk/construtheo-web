"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function SplashScreen() {
  const router = useRouter();
  const [mascotIndex, setMascotIndex] = useState(0);

  const mascots = [
    "/mascote-pedreiro.png",
    "/mascote-pedreiro1.png",
    "/mascote-pintor.png",
    "/mascote-eletricista-v2.png",
    "/mascote-jardineiro-v2.png",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setMascotIndex((prev) => (prev + 1) % mascots.length);
    }, 800);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/login");
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <main
      style={{
        minHeight: "100vh",
        margin: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(180deg, #e0f2ff, #b3e0ff)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 360,
          backgroundColor: "#ffffff",
          borderRadius: 24,
          boxShadow: "0 20px 40px rgba(15, 23, 42, 0.18)",
          padding: 24,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
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
          O Aplicativo completo para sua obra!
        </p>

        <p
          style={{
            fontSize: 11,
            color: "#94a3b8",
          }}
        >
          Carregando seu painel de construção...
        </p>
      </div>
    </main>
  );
}
