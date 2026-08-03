const CACHE_VERSION = 'v5';
const STATIC_CACHE = `consultmed-static-${CACHE_VERSION}`;

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== STATIC_CACHE)
          .map((cacheName) => caches.delete(cacheName))
      ))
      .then(() => self.clients.claim())
  );
});

const isCacheableAsset = (request, url) =>
  request.method === 'GET' &&
  url.origin === self.location.origin &&
  ['script', 'style', 'image', 'font'].includes(request.destination);

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Documents, API calls and authenticated requests always stay on the network.
  if (
    request.mode === 'navigate' ||
    request.headers.has('authorization') ||
    url.pathname.startsWith('/api/') ||
    !isCacheableAsset(request, url)
  ) {
    return;
  }

  event.respondWith(
    caches.open(STATIC_CACHE).then(async (cache) => {
      const cachedResponse = await cache.match(request);
      if (cachedResponse) return cachedResponse;

      const response = await fetch(request);
      if (response.ok && response.type === 'basic') {
        await cache.put(request, response.clone());
      }
      return response;
    })
  );
});
