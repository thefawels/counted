const CACHE_PREFIX = "counted-";
const LEGACY_CACHE_PREFIX = "inventory-recheck-";
const CACHE_NAME = "counted-v10-assets-12";
const PRECACHE = ["./assets/js/review-excel-style.js","./assets/js/iconoir.js","./","./index.html","./manifest.webmanifest","./assets/icons/favicon-new.png","./assets/icons/apple-touch-icon-new.png","./assets/icons/icon-192-new.png","./assets/icons/icon-512-new.png","./assets/icons/icon-1024-new.png","./assets/js/app-counted-v10.js","./assets/js/chunk-BKRZC9ab.js","./assets/css/base-v091.css","./assets/css/count-mode-v10.css","./assets/js/count-mode-v10.js","./assets/js/catalog-v10.js","./assets/js/haptics-v10.js","./assets/js/release-ui-v10.js","./assets/js/review-flow.js","./assets/js/count-blocks-v10.js","./assets/js/supplies-v09.js","./assets/js/chemistry-mode-v092.js","./assets/js/chemistry-data-v092.js","./assets/js/chemistry-template-v092.js","./assets/js/supplies-data-v09.js","./assets/js/supplies-template-v09.js"];

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
