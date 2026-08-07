// Évaluation Équipe — Service Worker
// Convention : SW_VERSION bumpée en même temps que APP_VERSION dans index.html
const SW_VERSION = '2026.08.07-4';
const CACHE_NAME = 'eval-equipe-' + SW_VERSION;

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Network-first pour index.html afin d'éviter le problème iOS déjà connu
// sur Bilan de Passage (cache système figé après mise à jour) : on ne met
// en cache que pour un usage hors-ligne de secours, jamais comme source
// prioritaire.
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((resp) => {
          const clone = resp.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return resp;
        })
        .catch(() => caches.match(event.request))
    );
  }
});
