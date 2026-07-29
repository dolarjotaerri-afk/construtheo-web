"use client";

import { useEffect, useState } from "react";

export function PwaRegister() {
  const [novaVersao, setNovaVersao] = useState(false);
  const [atualizando, setAtualizando] = useState(false);
  const [registration, setRegistration] =
    useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    let recarregou = false;

    const registrarServiceWorker = async () => {
      try {
        const registro = await navigator.serviceWorker.register("/sw.js");

        setRegistration(registro);

        // Já existe uma atualização esperando.
        if (registro.waiting && navigator.serviceWorker.controller) {
          setNovaVersao(true);
        }

        registro.addEventListener("updatefound", () => {
          const novoWorker = registro.installing;

          if (!novoWorker) {
            return;
          }

          novoWorker.addEventListener("statechange", () => {
            if (
              novoWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              setRegistration(registro);
              setNovaVersao(true);
            }
          });
        });

        // Solicita ao navegador que procure uma versão nova.
        await registro.update();
      } catch (error) {
        console.error("Erro ao registrar Service Worker:", error);
      }
    };

    const aoMudarControlador = () => {
      if (recarregou) {
        return;
      }

      recarregou = true;
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener(
      "controllerchange",
      aoMudarControlador,
    );

    registrarServiceWorker();

    return () => {
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        aoMudarControlador,
      );
    };
  }, []);

  const atualizarAplicativo = () => {
    const workerEmEspera = registration?.waiting;

    if (!workerEmEspera) {
      window.location.reload();
      return;
    }

    setAtualizando(true);

    workerEmEspera.postMessage({
      type: "SKIP_WAITING",
    });
  };

  if (!novaVersao) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[9999] mx-auto max-w-md rounded-2xl border border-sky-200 bg-white p-4 shadow-2xl">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xl">
          🚀
        </div>

        <div className="flex-1">
          <h2 className="text-sm font-semibold text-slate-900">
            Nova versão disponível
          </h2>

          <p className="mt-1 text-xs leading-5 text-slate-600">
            Atualize o ConstruThéo para receber as melhorias mais recentes.
          </p>

          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={atualizarAplicativo}
              disabled={atualizando}
              className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {atualizando ? "Atualizando..." : "Atualizar agora"}
            </button>

            {!atualizando && (
              <button
                type="button"
                onClick={() => setNovaVersao(false)}
                className="rounded-xl px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100"
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