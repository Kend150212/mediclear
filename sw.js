/* MediClear service worker — offline app shell. API calls always go to network. */
var CACHE = "mediclear-v5";
var SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/style.css",
  "./js/i18n.js",
  "./js/i18n-keyhelp.js",
  "./js/i18n-conn.js",
  "./js/i18n-doc.js",
  "./js/i18n-ux.js",
  "./js/vendor/pdfjs/pdf.js",
  "./js/vendor/pdfjs/pdf.worker.js",
  "./js/fixtures.js",
  "./js/bill-art.js",
  "./js/db.js",
  "./js/api.js",
  "./js/app.js",
  "./assets/sample-eob.pdf",
  "./icons/icon.svg"
];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (cache) { return cache.addAll(SHELL); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        if (k !== CACHE) return caches.delete(k);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (e) {
  var url = new URL(e.request.url);
  // Never cache API traffic
  if (url.host === "api.meta.ai") return;
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then(function (hit) {
      if (hit) return hit;
      return fetch(e.request).then(function (res) {
        if (res.ok && url.origin === self.location.origin) {
          var copy = res.clone();
          caches.open(CACHE).then(function (cache) { cache.put(e.request, copy); });
        }
        return res;
      }).catch(function () {
        return caches.match("./index.html");
      });
    })
  );
});
