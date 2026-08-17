"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type SplashScreenProps = {
  onFinish: () => void;
};

const SPLASH_MESSAGES = [
  "Encontre quem sua obra precisa.",
  "Divulgue seus serviços.",
  "Divulgue sua empresa.",
  "Calcule o que sua obra precisa.",
];

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const [stage, setStage] = useState(-1);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    const timers = [
      // Pequeno respiro inicial com a tela azul limpa
      window.setTimeout(() => setStage(0), 350),

      // Mensagens - um pouco mais lentas
      window.setTimeout(() => setStage(1), 1250),
      window.setTimeout(() => setStage(2), 2150),
      window.setTimeout(() => setStage(3), 3050),

      // Logo final
      window.setTimeout(() => setStage(4), 3950),

      // Abre a Home
      window.setTimeout(onFinish, 5250),
    ];

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [onFinish]);

  const isLogoStage = stage === 4;

  const mascotSrc =
    stage % 2 === 0
      ? "/mascote-pedreiro.png"
      : "/mascote-pedreiro1.png";

  return (
    <main className="splash" aria-label="Carregando Construthéo">
      {stage >= 0 && !isLogoStage && (
        <div className="scene" key={`message-${stage}`}>
          <div className="mascotWrapper">
            <Image
              src={mascotSrc}
              alt="Mascote Construthéo"
              fill
              priority
              sizes="190px"
              className="mascot"
            />
          </div>

          <p className="message">{SPLASH_MESSAGES[stage]}</p>
        </div>
      )}

      {isLogoStage && (
        <div className="logoScene" key="logo">
          {!logoError ? (
            <img
              src="/logo-construtheo.png"
              alt="Construthéo"
              className="officialLogo"
              onError={() => setLogoError(true)}
              draggable={false}
            />
          ) : (
            <div className="temporaryLogo">
              Constru<span>Théo</span>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .splash {
          position: fixed;
          inset: 0;
          z-index: 9999;

          width: 100%;
          min-height: 100vh;
          min-height: 100dvh;

          display: flex;
          align-items: center;
          justify-content: center;

          margin: 0;
          padding: max(24px, env(safe-area-inset-top)) 24px
            max(24px, env(safe-area-inset-bottom));

          background: #0284c7;
          color: #ffffff;
          overflow: hidden;
        }

        .scene,
        .logoScene {
          width: 100%;
          max-width: 420px;

          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;

          text-align: center;
          animation: sceneEnter 0.42s ease both;
        }

        .mascotWrapper {
          position: relative;
          width: 185px;
          height: 185px;
          margin-bottom: 26px;
          animation: mascotFloat 1.55s ease-in-out infinite;
        }

        :global(.mascot) {
          object-fit: contain;
          filter: drop-shadow(0 14px 20px rgba(0, 45, 75, 0.25));
        }

        .message {
          max-width: 350px;
          margin: 0;

          font-size: clamp(24px, 6vw, 31px);
          font-weight: 800;
          line-height: 1.12;
          letter-spacing: -0.04em;
          text-wrap: balance;
        }

        .logoScene {
          animation: logoEnter 0.58s cubic-bezier(0.2, 0.8, 0.2, 1) both;
        }

        .officialLogo {
          display: block;
          width: min(72vw, 300px);
          max-height: 190px;
          height: auto;
          object-fit: contain;

          /* Sem o filtro que estava deixando a imagem toda branca */
          filter: none;
        }

        .temporaryLogo {
          color: #ffffff;
          font-size: clamp(48px, 12vw, 72px);
          font-weight: 900;
          line-height: 1;
          letter-spacing: -0.065em;
        }

        .temporaryLogo span {
          font-weight: 700;
        }

        @keyframes sceneEnter {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.985);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes logoEnter {
          from {
            opacity: 0;
            transform: scale(0.82);
          }

          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes mascotFloat {
          0%,
          100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-6px);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .scene,
          .logoScene,
          .mascotWrapper {
            animation: none;
          }
        }
      `}</style>
    </main>
  );
}