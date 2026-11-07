/* Pulse Kids — service worker : vrai mode hors ligne.
 * - Pages : réseau d'abord, repli sur le cache (l'app s'ouvre sans internet).
 * - Assets (JS/CSS/polices/icônes) : cache d'abord (fichiers versionnés par Vite).
 * - /api : jamais mis en cache (données personnelles), sauf l'édition du jour.
 */
const VERSION = 'pk-v4';
const SHELL = ['/', '/index.html', '/icon.svg', '/manifest.webmanifest'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Ressources externes (photos NASA) : laissées au navigateur.
  if (url.origin !== self.location.origin) return;

  if (url.pathname.startsWith('/api/')) {
    // Seul le contenu public du jour est mis en cache (pour l'ouvrir hors ligne).
    if (url.pathname !== '/api/today') return;
    event.respondWith(networkFirst(req));
    return;
  }

  if (req.mode === 'navigate') {
    event.respondWith(networkFirst(req, '/index.html'));
    return;
  }

  event.respondWith(cacheFirst(req));
});

async function networkFirst(req, fallbackPath) {
  const cache = await caches.open(VERSION);
  try {
    const res = await fetch(req);
    if (res.ok) cache.put(fallbackPath ?? req, res.clone());
    return res;
  } catch {
    return (await cache.match(fallbackPath ?? req)) ?? Response.error();
  }
}

async function cacheFirst(req) {
  const cache = await caches.open(VERSION);
  const hit = await cache.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (res.ok || res.type === 'opaque') cache.put(req, res.clone());
  return res;
}
