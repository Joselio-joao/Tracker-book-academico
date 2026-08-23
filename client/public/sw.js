// Incrementa apenas quando o shell da aplicação muda. Nunca apagar caches aqui: os dados vivem fora do Cache API.
const CACHE_NAME = "super-tracker-shell-v8";
const SHELL_URL = new URL("./", self.registration.scope).href;

async function cacheShell(cache) {
  const response = await fetch(SHELL_URL, { cache: "no-store" });
  if (!response.ok) throw new Error(`Shell request failed: ${response.status}`);
  await cache.put(SHELL_URL, response.clone());
  const html = await response.text();
  const assetMatches = [...html.matchAll(/(?:src|href)=["']([^"']+)["']/g)].map((match) => match[1]);
  const assets = assetMatches
    .filter((asset) => /\.(?:js|css|webmanifest|png|jpg|jpeg|svg|ico)(?:[?#]|$)/i.test(asset))
    .map((asset) => new URL(asset, SHELL_URL).href);
  await Promise.all(assets.map(async (assetUrl) => {
    try {
      const assetResponse = await fetch(assetUrl, { cache: "no-store" });
      if (assetResponse.ok) await cache.put(assetUrl, assetResponse.clone());
    } catch {
      // An individual asset may be unavailable; runtime caching can recover it later.
    }
  }));
}

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then(cacheShell).catch(() => undefined));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  // A atualização do código nunca limpa dados ou caches existentes.
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) return;
  const isNavigation = event.request.mode === "navigate";
  const cacheKey = isNavigation ? SHELL_URL : event.request;
  event.respondWith(
    fetch(event.request).then((response) => {
      if (response.ok) caches.open(CACHE_NAME).then((cache) => cache.put(event.request, response.clone()));
      return response;
    }).catch(() => caches.match(cacheKey, { ignoreSearch: true }).then((cached) => cached || caches.match(SHELL_URL))),
  );
});
