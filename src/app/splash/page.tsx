"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const MASCOTS = [
  "/mascote-pedreiro.png",
  "/mascote-pedreiro1.png",
  "/mascote-pintor.png",
  "/mascote-eletricista-v2.png",
  "/mascote-jardineiro-v2.png",
];

const SPLASH_DURATION = 1400;

export default function SplashScreen() {
  const router = useRouter();
  const [mascotIndex, setMascotIndex] = useState(0);

  useEffect(() => {
    async function handleLogout() {
  await supabase.auth.signOut();

  localStorage.removeItem("construtheo_cliente_atual");
  localStorage.removeItem("construtheo_demo_cliente");

  router.replace("/login");
}
    // Começa a preparar a próxima página enquanto a Splash aparece.
    router.prefetch("/login");

    // Faz somente uma troca de mascote durante a Splash.
    const mascotTimer = window.setTimeout(() => {
      setMascotIndex(1);
    }, 650);

    // Abre a próxima página após 1,4 segundo.
    const navigationTimer = window.setTimeout(() => {
      router.replace("/login");
    }, SPLASH_DURATION);

    return () => {
      window.clearTimeout(mascotTimer);
      window.clearTimeout(navigationTimer);
    };
  }, [router]);

  return (
    <main
      style={{
        minHeight: "100dvh",
        margin: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(180deg, #0f172a, #1e3a5f)",
        padding: 16,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 360,
          backgroundColor: "#ffffff",
          borderRadius: 24,
          boxShadow: "0 24px 60px rgba(0, 0, 0, 0.35)",
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
            src={MASCOTS[mascotIndex]}
            alt="Mascote ConstruThéo"
            fill
            sizes="140px"
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
            margin: "0 0 8px",
            color: "#0f172a",
          }}
        >
          Constru<span style={{ color: "#0284c7" }}>Théo</span>
        </h1>

        <p
          style={{
            fontSize: 14,
            color: "#64748b",
            margin: "0 0 16px",
          }}
        >
          Sua obra conectada a quem faz acontecer.
        </p>

        <p
          style={{
            fontSize: 11,
            color: "#94a3b8",
            margin: 0,
          }}
        >
          Carregando sua experiência na construção civil...
        </p>
      </div>
    </main>
  );
}