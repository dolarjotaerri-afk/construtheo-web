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

  useEffect(() => {
    const timers = [
      window.setTimeout(() => setStage(0), 280),
      window.setTimeout(() => setStage(1), 900),
      window.setTimeout(() => setStage(2), 1520),
      window.setTimeout(() => setStage(3), 2140),
      window.setTimeout(() => setStage(4), 2760),
      window.setTimeout(onFinish, 3660),
    ];

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [onFinish]);

  const isBrandStage = stage === 4;
  const mascotSrc = stage % 2 === 0 ? "/mascote-pedreiro.png" : "/mascote-pedreiro1.png";

  return (
    <div className="construtheo-splash" aria-label="Carregando Construthéo">
      {stage >= 0 && !isBrandStage && (
        <div className="splash-scene" key={`message-${stage}`}>
          <div className="splash-mascot-wrap">
            <Image
              src={mascotSrc}
              alt="Mascote Construthéo"
              fill
              priority
              sizes="190px"
              className="splash-mascot"
            />
          </div>

          <p className="splash-message">{SPLASH_MESSAGES[stage]}</p>
        </div>
      )}

      {isBrandStage && (
        <div className="splash-brand-scene" key="brand">
          <p className="splash-brand">
            Constru<span>Théo</span>
          </p>
          <p className="splash-tagline">Sua obra conectada a quem faz acontecer.</p>
        </div>
      )}

      <style jsx>{`
        .construtheo-splash {
          position: fixed;
          inset: 0;
          z-index: 9999;
          min-height: 100vh;
          min-height: 100dvh;
          width: 100%;
          overflow: hidden;
          background: #0284c7;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          padding: max(22px, env(safe-area-inset-top)) 24px
            max(22px, env(safe-area-inset-bottom));
        }

        .splash-scene,
        .splash-brand-scene {
          width: min(100%, 390px);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          animation: splashEnter 0.28s ease-out both;
        }

        .splash-mascot-wrap {
          position: relative;
          width: 176px;
          height: 176px;
          margin-bottom: 22px;
          animation: mascotFloat 1.45s ease-in-out infinite;
        }

        :global(.splash-mascot) {
          object-fit: contain;
          filter: drop-shadow(0 16px 22px rgba(0, 49, 87, 0.24));
        }

        .splash-message {
          max-width: 340px;
          margin: 0;
          font-size: clamp(1.35rem, 5vw, 1.72rem);
          line-height: 1.12;
          font-weight: 850;
          letter-spacing: -0.035em;
          text-wrap: balance;
        }

        .splash-brand-scene {
          animation: brandEnter 0.42s cubic-bezier(0.2, 0.8, 0.2, 1) both;
        }

        .splash-brand {
          margin: 0;
          font-size: clamp(2.55rem, 11vw, 4.25rem);
          font-weight: 950;
          line-height: 0.98;
          letter-spacing: -0.065em;
        }

        .splash-brand span {
          font-weight: 750;
        }

        .splash-tagline {
          margin: 14px 0 0;
          max-width: 310px;
          font-size: 0.82rem;
          line-height: 1.4;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.84);
        }

        @keyframes splashEnter {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.985);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes brandEnter {
          from {
            opacity: 0;
            transform: scale(0.9);
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
          .splash-scene,
          .splash-brand-scene,
          .splash-mascot-wrap {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}