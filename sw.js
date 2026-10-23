const CACHE = 'alu-workbench-shell-v7';
const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './styles.css',
  './fix.css',
  './src/app.js',
  './src/store.js',
  './src/domain.js',
  './src/pwa.js',
  './assets/morning-mist-island-hero.png',
  './assets/stitch-closeup-reference.png',
  './icon.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (new URL(request.url).pathname.startsWith('/api/')) return;
  event.respondWith(fetch(request).catch(() => caches.match(request).then(response => response || caches.match('./index.html'))));
});
