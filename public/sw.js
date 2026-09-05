/**
 * Service Worker del portal.
 *
 * Antes no llegaba a instalarse nunca. Tres de las cuatro rutas de
 * `INITIAL_CACHED_RESOURCES` iban sin el basePath (`/en`, `/es`,
 * `/manifest.json`), y `cache.addAll()` es **atómico**: si una sola devuelve
 * 404, rechaza entera y la instalación falla. `OFFLINE_URL` tenía el mismo
 * problema. Sumado a que el registro también apuntaba a `/sw.js` en vez de
 * `/nasaexplorer/sw.js`, la PWA estaba rota de punta a punta.
 *
 * Este fichero se sirve tal cual desde `public/`, así que no puede leer
 * `process.env`: el basePath va escrito. Si cambiara en `next.config.ts`, hay
 * que cambiarlo aquí.
 */

const BASE = "/nasaexplorer";
const CACHE_NAME = "nasa-explorer-v2";

/** A dónde se cae una navegación cuando no hay red ni copia en caché. */
const OFFLINE_URL = `${BASE}/en/`;

/**
 * Lo mínimo para que el sitio abra sin red. Con `trailingSlash: true` las rutas
 * llevan barra final: sin ella GitHub Pages redirige y la entrada de caché no
 * casa con la petición.
 */
const INITIAL_CACHED_RESOURCES = [
  `${BASE}/en/`,
  `${BASE}/es/`,
  `${BASE}/manifest.json`,
  `${BASE}/nasa-logo.png`,
  `${BASE}/icon-192.png`,
  `${BASE}/icon-512.png`,
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      // `addAll` aborta entero si una falla, y eso es lo que dejaba el SW sin
      // instalar. Se cachea una a una y un fallo suelto solo se registra: es
      // preferible una caché incompleta a no tener Service Worker.
      Promise.all(
        INITIAL_CACHED_RESOURCES.map((url) =>
          cache.add(url).catch((err) => {
            console.warn(`[sw] no se pudo cachear ${url}:`, err);
          }),
        ),
      ),
    ),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))),
      ),
  );
  self.clients.claim();
});

// Red primero, caché como respaldo: los datos del portal cambian a diario y una
// copia vieja servida por delante sería peor que esperar a la red.
self.addEventListener("fetch", (event) => {
  if (!event.request.url.startsWith(self.location.origin)) return;
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200 && response.type === "basic") {
          const copia = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copia));
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(event.request);
        if (cached) return cached;

        if (event.request.mode === "navigate") {
          const fallback = await caches.match(OFFLINE_URL);
          if (fallback) return fallback;
        }

        // Sin red y sin copia: una respuesta explícita en vez de `undefined`,
        // que el navegador presenta como un error de red genérico.
        return new Response("Sin conexión y sin copia en caché.", {
          status: 503,
          statusText: "Service Unavailable",
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        });
      }),
  );
});
