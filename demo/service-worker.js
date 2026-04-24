const CACHE_NAME = "russian-study-tool-v6";
const APP_SHELL_PATHS = new Set(["./", "./index.html", "/Russian-Study-for-Chinese/", "/Russian-Study-for-Chinese/index.html"]);
const CORE_ASSET_PATHS = new Set([
  "/Russian-Study-for-Chinese/assets/app.js",
  "/Russian-Study-for-Chinese/assets/styles.css",
  "/Russian-Study-for-Chinese/manifest.webmanifest",
  "/Russian-Study-for-Chinese/assets/curriculum-year.js",
]);
const APP_ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./assets/app.js",
  "./assets/styles.css",
  "./assets/curriculum-year.js",
  "./assets/icon.svg",
  "./assets/icons/apple-touch-icon-180.png",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./assets/icons/icon-maskable-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_ASSETS)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      ),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  const requestUrl = new URL(event.request.url);
  const isAppShellRequest =
    event.request.mode === "navigate" ||
    APP_SHELL_PATHS.has(requestUrl.pathname) ||
    requestUrl.pathname.endsWith("/index.html");
  const isCoreAssetRequest =
    CORE_ASSET_PATHS.has(requestUrl.pathname) ||
    requestUrl.pathname.endsWith("/assets/app.js") ||
    requestUrl.pathname.endsWith("/assets/styles.css") ||
    requestUrl.pathname.endsWith("/assets/curriculum-year.js") ||
    requestUrl.pathname.endsWith("/manifest.webmanifest");

  if (isAppShellRequest) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const cloned = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put("./index.html", cloned));
          }

          return networkResponse;
        })
        .catch(() => caches.match(event.request).then((cached) => cached || caches.match("./index.html"))),
    );
    return;
  }

  if (isCoreAssetRequest) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const cloned = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cloned));
          }

          return networkResponse;
        })
        .catch(() => caches.match(event.request)),
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200) {
            return networkResponse;
          }

          const cloned = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cloned));
          return networkResponse;
        })
        .catch(() => caches.match("./index.html"));
    }),
  );
});
