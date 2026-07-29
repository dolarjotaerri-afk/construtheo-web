import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import {
  ExpirationPlugin,
  NetworkFirst,
  Serwist,
} from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const navegacaoOffline = {
  matcher: ({
    request,
    sameOrigin,
  }: {
    request: Request;
    sameOrigin: boolean;
  }) => {
    return sameOrigin && request.mode === "navigate";
  },

  handler: new NetworkFirst({
    cacheName: "construtheo-paginas-offline",
    networkTimeoutSeconds: 3,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 30 * 24 * 60 * 60,
      }),
    ],
  }),
};

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,

  precacheOptions: {
    cleanupOutdatedCaches: true,

    // Faz /painel/calculos?tipo=cliente usar
    // a mesma página salva de /painel/calculos.
    ignoreURLParametersMatching: [
      /^utm_/,
      /^fbclid$/,
      /^tipo$/,
    ],
  },

  // Agora o novo Service Worker fica aguardando
  // até o usuário clicar em "Atualizar".
  skipWaiting: false,

  clientsClaim: true,
  navigationPreload: true,

  runtimeCaching: [
    navegacaoOffline,
    ...defaultCache,
  ],
});

// Recebe a mensagem enviada pelo PwaRegister
// para ativar imediatamente a nova versão.
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

serwist.addEventListeners();