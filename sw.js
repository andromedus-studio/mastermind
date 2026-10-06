const CACHE = 'brainmind-v1';

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll([
    './index.html',
    './manifest.json',
    './images/icon-192.png',
    './images/icon-512.png',
    './images/logo.png'
  ])));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  // Firebase et fichiers audio : toujours en direct (jamais cachés)
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;
  // La page du jeu : réseau d'abord, cache en secours
  // (tes mises à jour restent instantanées pour les joueurs)
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).catch(() => caches.match('./index.html')));
    return;
  }
  // Icônes et fichiers statiques : cache d'abord
  e.respondWith(caches.match(e.request).then((cached) => cached || fetch(e.request)));
});
//redeploy
