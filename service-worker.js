
const APP_CACHE = 'bd-app-v1';
const STATIC_ASSETS = ['/', '/index.html', '/style.css', '/app.js', '/manifest.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(APP_CACHE).then(cache => cache.addAll(STATIC_ASSETS)));
});
self.addEventListener('activate', (event) => { event.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request).then(resp => {
        const clone = resp.clone();
        caches.open(APP_CACHE).then(cache => cache.put(event.request, clone));
        return resp;
      }).catch(() => caches.match(event.request))
    );
  } else if (STATIC_ASSETS.includes(url.pathname)) {
    event.respondWith(caches.match(event.request).then(resp => resp || fetch(event.request)));
  }
});
