"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
}

type NavigatorIOS = Navigator & {
  standalone?: boolean;
};

const TEMPO_PARA_MOSTRAR_NOVAMENTE = 7 * 24 * 60 * 60 * 1000;

export function PwaRegister() {
  const pathname = usePathname();

  const [jaLogou, setJaLogou] = useState(false);

  const [eventoInstalacao, setEventoInstalacao] =
    useState<BeforeInstallPromptEvent | null>(null);

  const [mostrarInstalacao, setMostrarInstalacao] = useState(false);
  const [mostrarInstrucaoIOS, setMostrarInstrucaoIOS] = useState(false);

  const [registro, setRegistro] =
    useState<ServiceWorkerRegistration | null>(null);

  const [novaVersao, setNovaVersao] = useState(false);
  const [atualizando, setAtualizando] = useState(false);

  const verificarSeEstaInstalado = () => {
    const modoStandalone =
      window.matchMedia("(display-mode: standalone)").matches;

    const standaloneIOS =
      (window.navigator as NavigatorIOS).standalone === true;

    return modoStandalone || standaloneIOS;
  };

  const verificarSeEhIOS = () => {
    return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
  };

  /*
   * Verifica novamente o login sempre que a rota mudar.
   * Isso é necessário porque o layout principal continua montado
   * quando o usuário sai do login e entra no painel.
   */
  useEffect(() => {
    const usuarioJaLogou =
      localStorage.getItem("construtheo-ja-logou") === "true";

    setJaLogou(usuarioJaLogou);

    if (!usuarioJaLogou || verificarSeEstaInstalado()) {
      setMostrarInstalacao(false);
      return;
    }

    const adiadoAte = Number(
      localStorage.getItem("construtheo-instalar-adiado-ate") || "0"
    );

    if (Date.now() < adiadoAte) {
      setMostrarInstalacao(false);
      return;
    }

    const ehIOS = verificarSeEhIOS();

    if (ehIOS || eventoInstalacao) {
      const temporizador = window.setTimeout(() => {
        setMostrarInstalacao(true);
      }, 2500);

      return () => {
        window.clearTimeout(temporizador);
      };
    }
  }, [pathname, eventoInstalacao]);

  /*
   * Captura o evento de instalação oferecido pelo navegador.
   */
  useEffect(() => {
    const capturarEventoInstalacao = (event: Event) => {
      event.preventDefault();

      setEventoInstalacao(event as BeforeInstallPromptEvent);
    };

    const aplicativoInstalado = () => {
      setEventoInstalacao(null);
      setMostrarInstalacao(false);
      setMostrarInstrucaoIOS(false);

      localStorage.removeItem("construtheo-instalar-adiado-ate");
    };

    window.addEventListener(
      "beforeinstallprompt",
      capturarEventoInstalacao
    );

    window.addEventListener("appinstalled", aplicativoInstalado);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        capturarEventoInstalacao
      );

      window.removeEventListener(
        "appinstalled",
        aplicativoInstalado
      );
    };
  }, []);

  /*
   * Registra o Service Worker e detecta novas versões.
   */
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
          error
        );
      }
    };

    const recarregarComNovaVersao = () => {
      if (paginaRecarregada) {
        return;
      }

      paginaRecarregada = true;
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener(
      "controllerchange",
      recarregarComNovaVersao
    );

    registrarServiceWorker();

    return () => {
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        recarregarComNovaVersao
      );
    };
  }, []);

  const instalarAplicativo = async () => {
    if (verificarSeEhIOS() && !eventoInstalacao) {
      setMostrarInstrucaoIOS(true);
      return;
    }

    if (!eventoInstalacao) {
      return;
    }

    try {
      await eventoInstalacao.prompt();

      const escolha = await eventoInstalacao.userChoice;

      if (escolha.outcome === "accepted") {
        setMostrarInstalacao(false);
      }

      setEventoInstalacao(null);
    } catch (error) {
      console.error(
        "Erro ao solicitar instalação do aplicativo:",
        error
      );
    }
  };

  const instalarDepois = () => {
    const mostrarNovamenteEm =
      Date.now() + TEMPO_PARA_MOSTRAR_NOVAMENTE;

    localStorage.setItem(
      "construtheo-instalar-adiado-ate",
      String(mostrarNovamenteEm)
    );

    setMostrarInstalacao(false);
    setMostrarInstrucaoIOS(false);
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

  const fecharAtualizacao = () => {
    setNovaVersao(false);
  };

  /*
   * Antes do primeiro login, nenhum card aparece.
   */
  if (!jaLogou) {
    return null;
  }

  /*
   * A instalação tem prioridade sobre o aviso de atualização.
   */
  if (mostrarInstalacao) {
    return (
      <div
        style={{
          position: "fixed",
          left: "12px",
          right: "12px",
          bottom: "14px",
          zIndex: 99999,
          maxWidth: "390px",
          margin: "0 auto",
          padding: "11px 12px",
          borderRadius: "16px",
          background: "#FFFFFF",
          border: "1px solid rgba(14, 165, 233, 0.18)",
          boxShadow: "0 10px 30px rgba(15, 23, 42, 0.18)",
          fontFamily: "inherit",
        }}
      >
       <div
  style={{
    display: "flex",
    alignItems: "center",
    gap: "10px",
  }}
>
  <img
    src="/icons/icon-192x192.png"
    alt="ConstruThéo"
    width={42}
    height={42}
    style={{
      width: "42px",
      height: "42px",
      flexShrink: 0,
      borderRadius: "12px",
      objectFit: "cover",
      display: "block",
    }}
  />

  <div
    style={{
      flex: 1,
      minWidth: 0,
    }}
  >
            <strong
              style={{
                display: "block",
                color: "#0F172A",
                fontSize: "13px",
                lineHeight: 1.3,
              }}
            >
              Instale o ConstruThéo
            </strong>

            <span
              style={{
                display: "block",
                marginTop: "2px",
                color: "#64748B",
                fontSize: "11px",
                lineHeight: 1.35,
              }}
            >
              Acesse direto pela tela inicial.
            </span>
          </div>

          <button
            type="button"
            onClick={instalarAplicativo}
            style={{
              flexShrink: 0,
              border: "none",
              borderRadius: "10px",
              padding: "9px 12px",
              background: "#0EA5E9",
              color: "#FFFFFF",
              fontSize: "12px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Instalar
          </button>

          <button
            type="button"
            onClick={instalarDepois}
            aria-label="Fechar"
            style={{
              width: "26px",
              height: "26px",
              flexShrink: 0,
              border: "none",
              borderRadius: "50%",
              background: "#F1F5F9",
              color: "#64748B",
              fontSize: "16px",
              lineHeight: 1,
              cursor: "pointer",
            }}
          >
            ×
          </button>
        </div>

        {mostrarInstrucaoIOS && (
          <div
            style={{
              marginTop: "9px",
              padding: "8px 10px",
              borderRadius: "10px",
              background: "#F0F9FF",
              color: "#334155",
              fontSize: "11px",
              lineHeight: 1.45,
            }}
          >
            No Safari, toque em{" "}
            <strong>Compartilhar</strong> e depois em{" "}
            <strong>Adicionar à Tela de Início</strong>.
          </div>
        )}
      </div>
    );
  }

  /*
   * O aviso de atualização também só aparece depois do login.
   */
  if (novaVersao) {
    return (
      <div
        style={{
          position: "fixed",
          left: "12px",
          right: "12px",
          bottom: "14px",
          zIndex: 99999,
          maxWidth: "390px",
          margin: "0 auto",
          padding: "11px 12px",
          borderRadius: "16px",
          background: "#FFFFFF",
          border: "1px solid rgba(14, 165, 233, 0.18)",
          boxShadow: "0 10px 30px rgba(15, 23, 42, 0.18)",
          fontFamily: "inherit",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "12px",
              background: "#E0F2FE",
              fontSize: "18px",
            }}
          >
            ↻
          </div>

          <div
            style={{
              flex: 1,
              minWidth: 0,
            }}
          >
            <strong
              style={{
                display: "block",
                color: "#0F172A",
                fontSize: "13px",
                lineHeight: 1.3,
              }}
            >
              Nova versão disponível
            </strong>

            <span
              style={{
                display: "block",
                marginTop: "2px",
                color: "#64748B",
                fontSize: "11px",
              }}
            >
              Atualize para receber as melhorias.
            </span>
          </div>

          <button
            type="button"
            onClick={atualizarAplicativo}
            disabled={atualizando}
            style={{
              flexShrink: 0,
              border: "none",
              borderRadius: "10px",
              padding: "9px 12px",
              background: "#0EA5E9",
              color: "#FFFFFF",
              fontSize: "12px",
              fontWeight: 700,
              cursor: atualizando ? "default" : "pointer",
              opacity: atualizando ? 0.7 : 1,
            }}
          >
            {atualizando ? "Atualizando..." : "Atualizar"}
          </button>

          {!atualizando && (
            <button
              type="button"
              onClick={fecharAtualizacao}
              aria-label="Fechar"
              style={{
                width: "26px",
                height: "26px",
                flexShrink: 0,
                border: "none",
                borderRadius: "50%",
                background: "#F1F5F9",
                color: "#64748B",
                fontSize: "16px",
                lineHeight: 1,
                cursor: "pointer",
              }}
            >
              ×
            </button>
          )}
        </div>
      </div>
    );
  }

  return null;
}