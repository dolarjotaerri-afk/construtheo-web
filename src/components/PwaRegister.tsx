"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
}

export function PwaRegister() {
  const [eventoInstalacao, setEventoInstalacao] =
    useState<BeforeInstallPromptEvent | null>(null);

  const [mostrarInstalacao, setMostrarInstalacao] = useState(false);
  const [mostrarInstrucaoIOS, setMostrarInstrucaoIOS] = useState(false);

  const [registro, setRegistro] =
    useState<ServiceWorkerRegistration | null>(null);

  const [novaVersao, setNovaVersao] = useState(false);
  const [atualizando, setAtualizando] = useState(false);

  useEffect(() => {
    const estaInstalado =
      window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in window.navigator &&
        (window.navigator as Navigator & { standalone?: boolean }).standalone);

    const instalacaoRecusada =
      localStorage.getItem("construtheo-instalar-depois") === "true";

    const navegadorIOS =
      /iphone|ipad|ipod/i.test(window.navigator.userAgent);

    const capturarInstalacao = (event: Event) => {
      event.preventDefault();

      const evento = event as BeforeInstallPromptEvent;

      setEventoInstalacao(evento);

      if (!estaInstalado && !instalacaoRecusada) {
        setMostrarInstalacao(true);
      }
    };

    const aplicativoInstalado = () => {
      setMostrarInstalacao(false);
      setMostrarInstrucaoIOS(false);
      setEventoInstalacao(null);

      localStorage.removeItem("construtheo-instalar-depois");
    };

    window.addEventListener(
      "beforeinstallprompt",
      capturarInstalacao,
    );

    window.addEventListener(
      "appinstalled",
      aplicativoInstalado,
    );

    if (
      navegadorIOS &&
      !estaInstalado &&
      !instalacaoRecusada
    ) {
      const timer = window.setTimeout(() => {
        setMostrarInstalacao(true);
      }, 2000);

      return () => {
        window.clearTimeout(timer);

        window.removeEventListener(
          "beforeinstallprompt",
          capturarInstalacao,
        );

        window.removeEventListener(
          "appinstalled",
          aplicativoInstalado,
        );
      };
    }

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        capturarInstalacao,
      );

      window.removeEventListener(
        "appinstalled",
        aplicativoInstalado,
      );
    };
  }, []);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    let paginaRecarregada = false;

    const registrarServiceWorker = async () => {
      try {
        const novoRegistro =
          await navigator.serviceWorker.register("/sw.js");

        setRegistro(novoRegistro);

        if (
          novoRegistro.waiting &&
          navigator.serviceWorker.controller
        ) {
          setNovaVersao(true);
        }

        novoRegistro.addEventListener("updatefound", () => {
          const novoWorker = novoRegistro.installing;

          if (!novoWorker) {
            return;
          }

          novoWorker.addEventListener("statechange", () => {
            if (
              novoWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              setRegistro(novoRegistro);
              setNovaVersao(true);
            }
          });
        });

        await novoRegistro.update();
      } catch (error) {
        console.error(
          "Erro ao registrar Service Worker:",
          error,
        );
      }
    };

    const atualizarPagina = () => {
      if (paginaRecarregada) {
        return;
      }

      paginaRecarregada = true;
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener(
      "controllerchange",
      atualizarPagina,
    );

    registrarServiceWorker();

    return () => {
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        atualizarPagina,
      );
    };
  }, []);

  const instalarAplicativo = async () => {
    const navegadorIOS =
      /iphone|ipad|ipod/i.test(window.navigator.userAgent);

    if (navegadorIOS && !eventoInstalacao) {
      setMostrarInstrucaoIOS(true);
      return;
    }

    if (!eventoInstalacao) {
      return;
    }

    await eventoInstalacao.prompt();

    const escolha = await eventoInstalacao.userChoice;

    if (escolha.outcome === "accepted") {
      setMostrarInstalacao(false);
    }

    setEventoInstalacao(null);
  };

  const fecharInstalacao = () => {
    setMostrarInstalacao(false);
    setMostrarInstrucaoIOS(false);

    localStorage.setItem(
      "construtheo-instalar-depois",
      "true",
    );
  };

  const atualizarAplicativo = () => {
    const workerAguardando = registro?.waiting;

    if (!workerAguardando) {
      window.location.reload();
      return;
    }

    setAtualizando(true);

    workerAguardando.postMessage({
      type: "SKIP_WAITING",
    });
  };

  const estiloCard: React.CSSProperties = {
    position: "fixed",
    left: "16px",
    right: "16px",
    bottom: "18px",
    zIndex: 99999,
    maxWidth: "430px",
    margin: "0 auto",
    padding: "18px",
    borderRadius: "22px",
    background: "#ffffff",
    border: "1px solid rgba(14, 165, 233, 0.20)",
    boxShadow: "0 18px 50px rgba(15, 23, 42, 0.24)",
    fontFamily: "inherit",
  };

  const estiloBotaoPrincipal: React.CSSProperties = {
    border: "none",
    borderRadius: "13px",
    padding: "11px 16px",
    background: "#0EA5E9",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
  };

  const estiloBotaoSecundario: React.CSSProperties = {
    border: "none",
    borderRadius: "13px",
    padding: "11px 14px",
    background: "#F1F5F9",
    color: "#475569",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
  };

  if (novaVersao) {
    return (
      <div style={estiloCard}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "13px",
          }}
        >
          <div
            style={{
              width: "46px",
              height: "46px",
              flexShrink: 0,
              borderRadius: "15px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#E0F2FE",
              fontSize: "23px",
            }}
          >
            🚀
          </div>

          <div style={{ flex: 1 }}>
            <strong
              style={{
                display: "block",
                color: "#0F172A",
                fontSize: "16px",
              }}
            >
              Nova versão disponível
            </strong>

            <p
              style={{
                margin: "5px 0 14px",
                color: "#64748B",
                fontSize: "13px",
                lineHeight: 1.5,
              }}
            >
              Atualize o ConstruThéo para receber as
              melhorias mais recentes.
            </p>

            <div
              style={{
                display: "flex",
                gap: "8px",
              }}
            >
              <button
                type="button"
                onClick={atualizarAplicativo}
                disabled={atualizando}
                style={{
                  ...estiloBotaoPrincipal,
                  opacity: atualizando ? 0.7 : 1,
                }}
              >
                {atualizando
                  ? "Atualizando..."
                  : "Atualizar agora"}
              </button>

              {!atualizando && (
                <button
                  type="button"
                  onClick={() => setNovaVersao(false)}
                  style={estiloBotaoSecundario}
                >
                  Depois
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!mostrarInstalacao) {
    return null;
  }

  return (
    <div style={estiloCard}>
      <button
        type="button"
        onClick={fecharInstalacao}
        aria-label="Fechar"
        style={{
          position: "absolute",
          top: "11px",
          right: "12px",
          width: "30px",
          height: "30px",
          border: "none",
          borderRadius: "50%",
          background: "#F1F5F9",
          color: "#64748B",
          fontSize: "17px",
          cursor: "pointer",
        }}
      >
        ×
      </button>

      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "14px",
          paddingRight: "25px",
        }}
      >
        <img
          src="/icons/icon-192x192.png"
          alt="ConstruThéo"
          width={54}
          height={54}
          style={{
            width: "54px",
            height: "54px",
            flexShrink: 0,
            borderRadius: "16px",
            objectFit: "cover",
          }}
        />

        <div style={{ flex: 1 }}>
          <strong
            style={{
              display: "block",
              color: "#0F172A",
              fontSize: "17px",
            }}
          >
            Instale o ConstruThéo
          </strong>

          <p
            style={{
              margin: "5px 0 14px",
              color: "#64748B",
              fontSize: "13px",
              lineHeight: 1.5,
            }}
          >
            Tenha acesso rápido às calculadoras,
            profissionais e empresas diretamente pelo
            seu celular.
          </p>

          {mostrarInstrucaoIOS ? (
            <div
              style={{
                padding: "12px",
                borderRadius: "13px",
                background: "#F0F9FF",
                color: "#334155",
                fontSize: "13px",
                lineHeight: 1.5,
              }}
            >
              Toque no botão de compartilhar do Safari
              e depois em{" "}
              <strong>Adicionar à Tela de Início</strong>.
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                gap: "8px",
              }}
            >
              <button
                type="button"
                onClick={instalarAplicativo}
                style={estiloBotaoPrincipal}
              >
                Instalar aplicativo
              </button>

              <button
                type="button"
                onClick={fecharInstalacao}
                style={estiloBotaoSecundario}
              >
                Agora não
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}