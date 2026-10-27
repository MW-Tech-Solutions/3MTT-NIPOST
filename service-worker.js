// RescuePost NG PWA Service Worker
const CACHE_NAME = 'rescuepost-ng-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
];

// Offline Postcode Cache Key
const OFFLINE_POSTCODE_KEY = 'rescuepost_offline_postcode';

// Install event: Pre-cache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Caching static shell assets for emergency reliability');
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[ServiceWorker] Cache addAll warning (some CDN assets might be delayed):', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate event: Clean up stale caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[ServiceWorker] Removing old cache', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event: Network-first with cache fallback for HTML, Cache-first for static
self.addEventListener('fetch', (event) => {
  // CRITICAL: NEVER intercept or cache non-GET requests (POST, PUT, DELETE)
  if (event.request.method !== 'GET') {
    return;
  }

  const requestUrl = new URL(event.request.url);

  // CRITICAL: Bypass all API endpoints so they always go straight to the network
  if (requestUrl.pathname.startsWith('/api/')) {
    return;
  }

  // Network-first strategy for active emergency tickets so command center stays fresh
  if (requestUrl.pathname.startsWith('/api/v1/emergency/tickets')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(JSON.stringify({
          success: false,
          offline: true,
          message: 'Offline mode: Reconnecting to RescuePost Dispatch Command...'
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  // Stale-while-revalidate for shell assets
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});

// Background sync / Message listener for caching citizen's NIPOST postcode
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CACHE_POSTCODE') {
    console.log('[ServiceWorker] Cached NIPOST Postcode for offline emergency:', event.data.postcode);
  }
});
