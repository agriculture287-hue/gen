// Gen Music PWA Service Worker (GPL-3.0)
const CACHE_NAME = 'gen-music-v2-live';
const STATIC_ASSETS = [
  '/manifest.json',
  '/logo.png',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/pwa-maskable-512x512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => {
          console.log('[SW] Removing stale cache:', key);
          return caches.delete(key);
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // DO NOT CACHE: Streamed audio, video, YouTube domains, or streaming media chunks
  if (
    url.hostname.includes('googlevideo.com') ||
    url.hostname.includes('youtube.com') ||
    url.hostname.includes('ytimg.com') ||
    url.hostname.includes('api.qrserver.com') ||
    event.request.headers.get('range') ||
    url.pathname.startsWith('/api/stream') ||
    url.pathname.endsWith('.mp3') ||
    url.pathname.endsWith('.m4a') ||
    url.pathname.endsWith('.webm') ||
    url.pathname.endsWith('.apk') ||
    url.pathname.endsWith('.exe') ||
    url.pathname.endsWith('.dmg')
  ) {
    return; // Pass through directly to network
  }

  // 1. Navigation requests (HTML document loads) - ALWAYS NETWORK FIRST!
  // This guarantees that after rebuilding or deploying, users never get stuck with an old index.html
  // that points to deleted/stale JS chunk hashes.
  if (event.request.mode === 'navigate' || event.request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, copy);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          // Fallback to cached page if offline
          const cached = await caches.match(event.request);
          if (cached) return cached;
          const fallback = await caches.match('/');
          if (fallback) return fallback;
          return new Response('Network offline', { status: 503, headers: { 'Content-Type': 'text/plain' } });
        })
    );
    return;
  }

  // 2. Network-first for dynamic API routes (/api/*)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => response)
        .catch(() => {
          return new Response(JSON.stringify({ error: 'Offline mode active' }), {
            headers: { 'Content-Type': 'application/json' },
            status: 503
          });
        })
    );
    return;
  }

  // 3. Stale-while-revalidate for static assets (.js, .css, icons)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          event.request.method === 'GET'
        ) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch((err) => {
        // If network fails and we have cache, cachedResponse was already returned or we catch here
        if (cachedResponse) return cachedResponse;
        throw err;
      });

      return cachedResponse || fetchPromise;
    })
  );
});
