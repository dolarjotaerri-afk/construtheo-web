"use client";

import { useEffect } from "react";

export function RegisterSW() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      // registra quando a página carregar
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .catch((err) => {
            console.error("Erro ao registrar Service Worker:", err);
          });
      });
    }
  }, []);

  return null;
}
