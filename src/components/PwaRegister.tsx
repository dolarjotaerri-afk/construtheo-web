"use client";

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator)
    ) {
      return;
    }

    // só registra em produção
    if (process.env.NODE_ENV !== "production") return;

    navigator.serviceWorker
      .register("/sw.js")
      .then(() => {
        // console.log("Service worker registrado com sucesso");
      })
      .catch((err) => {
        console.error("Erro ao registrar service worker:", err);
      });
  }, []);

  return null;
}
