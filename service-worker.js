const CACHE = 'study-timer-v8';
const APP_SHELL = new URL('./', self.location).href;
const ASSETS = [
  APP_SHELL,
  new URL('./manifest.webmanifest', self.location).href,
  new URL('./icons/icon-192.png', self.location).href,
  new URL('./icons/icon-512.png', self.location).href
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key.startsWith('study-timer-') && key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).then(response => {
        if (response.ok) caches.open(CACHE).then(cache => cache.put(APP_SHELL, response.clone()));
        return response;
      }).catch(() => caches.match(APP_SHELL))
    );
    return;
  }

  event.respondWith(caches.match(request).then(cached => cached || fetch(request)));
});
