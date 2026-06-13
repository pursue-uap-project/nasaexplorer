const CACHE_NAME = "nasa-explorer-cache-v1";
const OFFLINE_URL = "/en";

const INITIAL_CACHED_RESOURCES = [
  "/en",
  "/es",
  "/manifest.json",
  "/nasaexplorer/nasa-logo.png",
];

// Install Event
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(INITIAL_CACHED_RESOURCES);
    })
  );
  self.skipWaiting();
});

// Activate Event (Cleanup older caches)
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event (Network first, then fallback to Cache)
self.addEventListener("fetch", (event) => {
  // Only handle local origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Skip POST, PUT, DELETE etc.
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful GET responses
        if (response && response.status === 200 && response.type === "basic") {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(async () => {
        // Fallback to cache if network fails
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }

        // Default fallback for navigation requests
        if (event.request.mode === "navigate") {
          const fallbackCache = await caches.match(OFFLINE_URL);
          if (fallbackCache) return fallbackCache;
        }
      })
  );
});
