const CACHE_PREFIX = "counted-";
const LEGACY_CACHE_PREFIX = "inventory-recheck-";
const CACHE_NAME = "counted-v10-assets-2";
const PRECACHE = ["./","./index.html","./manifest.webmanifest","./favicon-new.png","./apple-touch-icon-new.png","./icon-192-new.png","./icon-512-new.png","./icon-1024-new.png","./og.png","./app-counted-v10.js","./chunk-BKRZC9ab.js","./base-v091.css","./count-mode-v10.css","./count-mode-v10.js","./catalog-v10.js","./haptics-v10.js","./release-ui-v10.js","./review-flow.js","./count-blocks-v10.js","./supplies-v09.js","./chemistry-mode-v092.js","./chemistry-data-v092.js","./chemistry-template-v092.js","./supplies-data-v09.js","./supplies-template-v09.js"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(names.filter((name) => (name.startsWith(CACHE_PREFIX) || name.startsWith(LEGACY_CACHE_PREFIX)) && name !== CACHE_NAME).map((name) => caches.delete(name))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) return;

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put("./index.html", copy));
          return response;
        })
        .catch(() => caches.match("./index.html").then((response) => response || caches.match("./")))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
      if (response.ok) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
      }
      return response;
    }))
  );
});
