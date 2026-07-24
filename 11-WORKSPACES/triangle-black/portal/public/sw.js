// FORCE UPDATE v085314
// Triangle Black Service Worker — Sprint 88
// Cache-first for static assets, network-first for API with offline fallback

const CACHE_VERSION  = 'tb-v88';
const STATIC_CACHE   = `${CACHE_VERSION}-static`;
const API_CACHE      = `${CACHE_VERSION}-api`;
const OFFLINE_PAGE   = '/offline.html';

// Pages to pre-cache for offline use
const PRECACHE_PAGES = [
  '/',
  '/operations/work-orders',
  '/operations/workbench',
  '/executive',
  '/maintenance',
  '/maintenance/assets',
  '/operations/technicians/my-day',
];

// API endpoints to cache for offline fallback
const CACHE_API_PATTERNS = [
  '/api/v1/work-orders',
  '/api/v1/assets',
  '/api/v1/technicians',
  '/api/v1/maintenance/pm-plans',
  '/api/v1/ai/signals',
  '/api/v1/twin/state',
];

// ─── Install ────────────────────────────────────────────────────────────────
self.addEventListener('install', event => {
  console.log('[SW] Installing Triangle Black v88...');
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then(cache => cache.addAll(PRECACHE_PAGES)),
    ]).then(() => self.skipWaiting())
  );
});

// ─── Activate ───────────────────────────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(k => k.startsWith('tb-v') && k !== STATIC_CACHE && k !== API_CACHE)
          .map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// ─── Fetch ──────────────────────────────────────────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and cross-origin
  if (request.method !== 'GET' || !url.origin.includes(self.location.origin)) {
    return;
  }

  // SSE endpoints — never cache
  if (url.pathname.includes('/sse/')) {
    return;
  }

  // API calls — network first with API cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstWithCache(request, API_CACHE));
    return;
  }

  // Static assets — cache first
  event.respondWith(cacheFirst(request, STATIC_CACHE));
});

async function networkFirstWithCache(request, cacheName) {
  try {
    const response = await fetch(request, { signal: AbortSignal.timeout(8000) });
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) {
      console.log('[SW] Offline — serving from cache:', request.url);
      return cached;
    }
    // Return a JSON error for API calls when offline
    return new Response(
      JSON.stringify({ error: 'offline', message: 'No network connection. Using cached data.' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/') || new Response('Offline', { status: 503 });
    }
    return new Response('Offline', { status: 503 });
  }
}

// ─── Background Sync ────────────────────────────────────────────────────────
self.addEventListener('sync', event => {
  if (event.tag === 'sync-work-orders') {
    event.waitUntil(syncWorkOrders());
  }
});

async function syncWorkOrders() {
  // Sync any pending work order status updates when back online
  console.log('[SW] Syncing work orders...');
  // Implementation: read from IndexedDB and POST to API
}

// ─── Push Notifications ─────────────────────────────────────────────────────
self.addEventListener('push', event => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title || 'Triangle Black Alert', {
      body:  data.body || data.message || 'New operational alert',
      icon:  '/icon-192.png',
      badge: '/icon-192.png',
      tag:   data.type || 'alert',
      data:  { url: data.url || '/' },
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/')
  );
});
