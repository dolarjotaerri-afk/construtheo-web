// public/sw.js

const CACHE_NAME = "construtheo-v1";
const URLS_TO_CACHE = ["/", "/login", "/cadastro/cliente", "/cadastro/profissional", "/cadastro/empresa"];

// instala e guarda alguns arquivos básicos
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(URLS_TO_CACHE).catch(() => {
        // se falhar, segue a vida
      });
    })
  );
});

// limpa caches antigos quando atualizar a versão
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
});

// estratégia básica: network first, fallback cache
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // só trata GET
  if (request.method !== "GET") return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        // se der certo, atualiza cache
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // se offline, tenta cache
        return caches.match(request);
      })
  );
});
